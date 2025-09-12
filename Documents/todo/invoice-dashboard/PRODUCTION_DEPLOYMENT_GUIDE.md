# 🚀 Production Deployment Guide - Invoice Management Dashboard

## 📋 Overview
This guide explains how to deploy your invoice management application to production with a proper database, team access, and data synchronization.

## 🗄️ Database Architecture

### Current State (Development)
```
CSV Files → Application → Browser Display
(No persistence, read-only)
```

### Production Architecture
```
Spreadsheet → Import → Database → API → Application → Team Access
                ↓                           ↑
            Automatic Sync              Team Updates
```

## 💾 Database Setup Options

### Option 1: SQLite (Simple, Local)
Perfect for single-server deployment, handles up to 10,000 invoices easily.

```bash
# Install SQLite dependencies
npm install better-sqlite3 @prisma/client prisma

# Initialize Prisma ORM
npx prisma init --datasource-provider sqlite
```

### Option 2: PostgreSQL (Recommended for Production)
Best for multi-user access, cloud deployment, and scalability.

```bash
# Using Supabase (Free tier available)
# 1. Create account at https://supabase.com
# 2. Create new project
# 3. Get connection string

# Install dependencies
npm install @supabase/supabase-js @prisma/client prisma

# Set environment variable
echo "DATABASE_URL=postgresql://..." >> .env.local
```

### Option 3: MySQL (Enterprise)
For existing enterprise infrastructure.

```bash
# Install MySQL dependencies
npm install mysql2 @prisma/client prisma

# Initialize Prisma for MySQL
npx prisma init --datasource-provider mysql
```

## 📊 Database Schema

Create file: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // or "sqlite" or "mysql"
  url      = env("DATABASE_URL")
}

model Invoice {
  id                String   @id @default(cuid())
  emailId           String   @unique
  subject           String
  fromEmail         String?
  fromName          String?
  receivedDate      DateTime
  category          String
  invoiceNumber     String   @unique
  amount            Float
  vendor            String
  dueDate           DateTime?
  oneDriveLink      String?
  xeroLink          String?
  processingStatus  String
  processedAt       DateTime
  paymentStatus     String   @default("pending")
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Payment tracking fields
  paymentDate       DateTime?
  paymentMethod     String?
  transactionId     String?
  paymentNotes      String?
  confirmedBy       String?
  
  @@index([vendor])
  @@index([paymentStatus])
  @@index([dueDate])
  @@index([invoiceNumber])
}

model PaymentHistory {
  id            String   @id @default(cuid())
  invoiceId     String
  status        String
  changedBy     String
  changedAt     DateTime @default(now())
  notes         String?
  
  @@index([invoiceId])
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String
  role          String   // admin, manager, viewer
  createdAt     DateTime @default(now())
}
```

## 🔄 Data Import & Sync

### Automatic CSV Import Script

Create file: `scripts/import-invoices.js`

```javascript
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const csv = require('csv-parser');

const prisma = new PrismaClient();

async function importInvoices() {
  const results = [];
  
  fs.createReadStream('data/invoices_cleaned_2024.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log(`Importing ${results.length} invoices...`);
      
      for (const row of results) {
        await prisma.invoice.upsert({
          where: { emailId: row.Email_ID },
          update: {
            amount: parseFloat(row.Amount),
            vendor: row.Vendor,
            dueDate: row.Due_Date ? new Date(row.Due_Date) : null,
            paymentStatus: row.Processing_Status === 'Processed' ? 'pending' : 'pending'
          },
          create: {
            emailId: row.Email_ID,
            subject: row.Subject,
            fromEmail: row.From_Email,
            fromName: row.From_Name,
            receivedDate: new Date(row.Received_Date),
            category: row.Category,
            invoiceNumber: row.Invoice_Number,
            amount: parseFloat(row.Amount),
            vendor: row.Vendor,
            dueDate: row.Due_Date ? new Date(row.Due_Date) : null,
            oneDriveLink: row.OneDrive_Link,
            xeroLink: row.Xero_Link,
            processingStatus: row.Processing_Status,
            processedAt: new Date(row.Processed_At),
            paymentStatus: 'pending'
          }
        });
      }
      
      console.log('✅ Import complete!');
      await prisma.$disconnect();
    });
}

importInvoices();
```

## 🌐 Deployment Options

### 1. Vercel (Recommended - Free Tier)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
```

### 2. AWS Amplify
```bash
# Install Amplify CLI
npm i -g @aws-amplify/cli

# Initialize
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

### 3. Self-Hosted (Your Server)
```bash
# Build production bundle
npm run build

# Start production server
npm run start

# Use PM2 for process management
npm i -g pm2
pm2 start npm --name "invoice-dashboard" -- start
pm2 save
pm2 startup
```

### 4. Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## 👥 Team Access & Permissions

### User Roles Implementation

```typescript
// src/lib/auth.ts
export enum UserRole {
  ADMIN = 'admin',      // Full access
  MANAGER = 'manager',  // Update payment status
  VIEWER = 'viewer'     // Read-only
}

export const permissions = {
  [UserRole.ADMIN]: ['read', 'create', 'update', 'delete', 'export'],
  [UserRole.MANAGER]: ['read', 'update', 'export'],
  [UserRole.VIEWER]: ['read']
};
```

### Authentication Options

1. **NextAuth.js** (Recommended)
```bash
npm install next-auth @auth/prisma-adapter
```

2. **Clerk** (Fastest setup)
```bash
npm install @clerk/nextjs
```

3. **Supabase Auth** (If using Supabase DB)
```bash
npm install @supabase/auth-helpers-nextjs
```

## 📱 Team Features

### Payment Update Workflow
1. Team member clicks "Update Payment" on invoice
2. Modal opens with payment form
3. Team member enters:
   - Payment status (Paid/Pending/Overdue)
   - Payment date
   - Payment method
   - Transaction ID
   - Their name
4. System records update with timestamp
5. Dashboard reflects changes immediately
6. Audit trail maintained in PaymentHistory table

### Real-time Updates
```typescript
// Using Pusher for real-time updates
npm install pusher pusher-js

// When payment is updated
await pusher.trigger('invoices', 'payment-updated', {
  invoiceId: invoice.id,
  newStatus: paymentStatus,
  updatedBy: userName
});
```

## 🔒 Security Considerations

### Environment Variables
```env
# .env.production
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=generate_random_secret
NEXTAUTH_URL=https://yourdomain.com
```

### Data Validation
- Sanitize all inputs
- Use Prisma's built-in SQL injection protection
- Implement rate limiting
- Add CORS protection

## 📈 Monitoring & Analytics

### Application Monitoring
```bash
# Install monitoring
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard@latest -i nextjs
```

### Database Backups
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
pg_dump $DATABASE_URL > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://your-bucket/backups/
```

## 🚦 Deployment Checklist

### Pre-Deployment
- [ ] Set up production database
- [ ] Import existing invoice data
- [ ] Configure environment variables
- [ ] Set up authentication
- [ ] Test payment update flow
- [ ] Configure backup strategy

### Deployment
- [ ] Build production bundle
- [ ] Deploy to hosting platform
- [ ] Set up SSL certificate
- [ ] Configure domain name
- [ ] Test all features

### Post-Deployment
- [ ] Monitor application logs
- [ ] Set up error tracking
- [ ] Create user accounts for team
- [ ] Document update procedures
- [ ] Schedule regular backups

## 📞 Support & Maintenance

### Daily Operations
1. **Data Import**: Run import script for new invoices
2. **Payment Updates**: Team updates via UI
3. **Reports**: Export data as needed
4. **Monitoring**: Check dashboard health

### Weekly Tasks
1. Backup database
2. Review audit logs
3. Update invoice statuses
4. Generate reports

## 🎯 Quick Start Commands

```bash
# 1. Clone and setup
git clone [your-repo]
cd invoice-dashboard
npm install

# 2. Setup database
npx prisma init
npx prisma migrate dev --name init
npx prisma generate

# 3. Import data
node scripts/import-invoices.js

# 4. Run production build
npm run build
npm run start

# 5. Deploy
vercel --prod
```

## 📊 Cost Estimates

| Service | Free Tier | Paid |
|---------|-----------|------|
| **Vercel Hosting** | ✅ Yes | $20/mo |
| **Supabase DB** | ✅ 500MB | $25/mo |
| **Clerk Auth** | ✅ 5,000 users | $25/mo |
| **Total** | **$0/mo** | $70/mo |

Your invoice dashboard is production-ready with enterprise features at minimal cost!