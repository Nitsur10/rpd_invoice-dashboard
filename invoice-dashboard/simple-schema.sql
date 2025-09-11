-- Simple Invoice Dashboard Schema for Supabase
-- Copy and paste this entire content into Supabase SQL Editor

-- Create Users table
CREATE TABLE IF NOT EXISTS "User" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS "Invoice" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "emailId" TEXT NOT NULL,
    subject TEXT NOT NULL,
    "fromEmail" TEXT,
    "fromName" TEXT NOT NULL,
    "receivedDate" TIMESTAMP(3) NOT NULL,
    category TEXT NOT NULL DEFAULT 'INVOICE',
    "invoiceNumber" TEXT UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    vendor TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "oneDriveLink" TEXT,
    "xeroLink" TEXT,
    "processingStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "processedAt" TIMESTAMP(3),
    "sourceTab" TEXT NOT NULL,
    "sourceWorkflowId" TEXT,
    "importBatchId" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentDate" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "transactionId" TEXT,
    "paymentNotes" TEXT,
    "confirmedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "Invoice_confirmedBy_fkey" FOREIGN KEY ("confirmedBy") REFERENCES "User"(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create audit logs table
CREATE TABLE IF NOT EXISTS "AuditLog" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    action TEXT NOT NULL,
    "userId" TEXT,
    changes JSONB NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Insert default admin user
INSERT INTO "User" (id, email, password, "firstName", "lastName", role)
VALUES (
    'admin-user-id-001',
    'admin@rpd.com',
    'temp-password-change-me',
    'System',
    'Administrator',
    'ADMIN'
) ON CONFLICT (email) DO NOTHING;