# Supabase Setup Guide for RPD Invoice Dashboard

## Phase 1: Create Supabase Project (FREE TIER)

### Step 1: Create Account & Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign in"
3. Sign up with GitHub/Google or create account
4. Click "New Project"
5. Choose your organization (or create one)
6. Fill in project details:
   - **Name**: `rpd-invoice-dashboard`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free tier (comes with 500MB database, 50MB file storage)

### Step 2: Get Your Credentials
Once your project is created (takes ~2 minutes):

1. **Go to Settings > API**
   - Copy `Project URL` (looks like: `https://abcd1234.supabase.co`)
   - Copy `anon/public` key
   - Copy `service_role` key (keep this SECRET!)

2. **Go to Settings > Database**
   - Click "Connection string" > "URI"
   - Copy the connection string (looks like: `postgresql://postgres.abcd1234:password@aws-0-us-west-1.pooler.supabase.co:5432/postgres`)

### Step 3: Update .env.local
Replace the placeholder values in your `.env.local` file:

```bash
# Replace these with your actual Supabase values:
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
DATABASE_URL="your-actual-database-connection-string"
```

## Phase 2: Database Setup

### Step 4: Create Database Schema
Run these commands in your terminal:

```bash
# Navigate to the invoice dashboard
cd /Users/niteshsure/Documents/todo/invoice-dashboard

# Install dependencies (if not already done)
npm install

# Push the schema to Supabase
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### Step 5: Migrate Existing Data
Run the migration script to transfer your JSON data to the database:

```bash
# Run the data migration
npx ts-node src/lib/migrate-data.ts
```

This will:
- Create a default admin user
- Transfer all 10 invoices from JSON to database
- Create audit logs for the migration
- Provide a summary of successful/failed migrations

## Phase 3: Verification

### Step 6: Verify Setup
1. **Check Supabase Dashboard**:
   - Go to your project > Table Editor
   - You should see tables: `User`, `Invoice`, `AuditLog`
   - Check that data was migrated successfully

2. **Test Database Connection**:
   ```bash
   # Test Prisma connection
   npx prisma studio
   ```
   This opens a web interface to browse your data at `localhost:5555`

### Step 7: Enable RLS (Row Level Security)
In your Supabase dashboard > SQL Editor, run:

```sql
-- Enable RLS on all tables
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Create policies (basic example - customize as needed)
CREATE POLICY "Allow authenticated read access" ON "Invoice"
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated write access" ON "Invoice"
  FOR ALL USING (auth.role() = 'authenticated');
```

## What's Already Prepared

✅ **Database Schema**: Complete Prisma schema with Invoice, User, AuditLog models  
✅ **Supabase Client**: Configuration files ready in `src/lib/supabase.ts`  
✅ **Migration Script**: Ready to transfer your 10 invoices to database  
✅ **Audit Service**: Comprehensive logging system for all changes  
✅ **MCP Integration**: Supabase MCP tools installed for enhanced operations  

## Next Steps After Setup

Once credentials are configured:
1. **Test the migration** - Verify all 10 invoices transferred correctly
2. **Update API routes** - Switch from JSON file reads to database queries
3. **Implement audit middleware** - Automatic logging for all dashboard operations
4. **Add user authentication** - If needed for production use

## Troubleshooting

### Common Issues:
- **"Environment variable not found"**: Check .env.local file location and spelling
- **Connection refused**: Verify DATABASE_URL includes correct password and host
- **Schema push fails**: Ensure Supabase project is fully initialized (wait 2-3 minutes after creation)
- **Migration fails**: Check that database is empty or run `npx prisma db reset` first

### Support:
- Supabase docs: [supabase.com/docs](https://supabase.com/docs)
- Prisma docs: [prisma.io/docs](https://prisma.io/docs)

---

**Your free tier includes:**
- 500MB database storage
- 50MB file storage  
- 2GB bandwidth per month
- No time limit

Perfect for development and small production workloads!