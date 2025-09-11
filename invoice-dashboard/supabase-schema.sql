-- RPD Invoice Dashboard - Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "Invoice_paymentStatus_idx" ON "Invoice"("paymentStatus");
CREATE INDEX IF NOT EXISTS "Invoice_vendor_idx" ON "Invoice"(vendor);
CREATE INDEX IF NOT EXISTS "Invoice_receivedDate_idx" ON "Invoice"("receivedDate");
CREATE INDEX IF NOT EXISTS "Invoice_processingStatus_idx" ON "Invoice"("processingStatus");
CREATE INDEX IF NOT EXISTS "Invoice_category_idx" ON "Invoice"(category);

CREATE INDEX IF NOT EXISTS "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"(action);
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId");

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_user_updated_at ON "User";
CREATE TRIGGER update_user_updated_at
    BEFORE UPDATE ON "User"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoice_updated_at ON "Invoice";
CREATE TRIGGER update_invoice_updated_at
    BEFORE UPDATE ON "Invoice"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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

-- Enable RLS (optional - can be enabled later)
-- ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;

-- Create basic policies (uncomment if RLS is enabled)
-- CREATE POLICY "Users can read own data" ON "User"
--     FOR SELECT USING (auth.uid()::text = id);

-- CREATE POLICY "Authenticated users can read invoices" ON "Invoice"
--     FOR SELECT USING (auth.role() = 'authenticated');

-- CREATE POLICY "Authenticated users can modify invoices" ON "Invoice"
--     FOR ALL USING (auth.role() = 'authenticated');

-- CREATE POLICY "Authenticated users can read audit logs" ON "AuditLog"
--     FOR SELECT USING (auth.role() = 'authenticated');

-- Verify tables were created
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('User', 'Invoice', 'AuditLog')
ORDER BY table_name;