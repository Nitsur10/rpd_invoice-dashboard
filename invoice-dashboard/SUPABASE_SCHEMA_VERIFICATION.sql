-- Supabase Invoice Table Schema Verification
-- Based on migration from Prisma to Supabase with snake_case standardization
-- This schema matches the spreadsheet exactly with 32 fields

-- Main Invoice Table
CREATE TABLE IF NOT EXISTS "Invoice" (
  -- Primary identifiers
  invoice_number TEXT PRIMARY KEY,
  
  -- Financial data
  invoice_date DATE,
  due_date DATE,
  currency TEXT DEFAULT 'AUD',
  subtotal DECIMAL(12,2),
  gst_total DECIMAL(12,2),
  total DECIMAL(12,2) NOT NULL,
  amount_due DECIMAL(12,2),
  
  -- Supplier information
  supplier_name TEXT NOT NULL,
  supplier_abn TEXT,
  supplier_email TEXT,
  
  -- Customer information  
  customer_name TEXT,
  customer_abn TEXT,
  
  -- Banking details
  bank_bsb TEXT,
  bank_account TEXT,
  reference_hint TEXT,
  
  -- File information
  file_name TEXT,
  file_url TEXT,
  folder_path TEXT,
  file_id TEXT,
  folder_id TEXT,
  
  -- Processing metadata
  source TEXT,
  notes TEXT,
  confidence DECIMAL(5,2),
  
  -- Line item details (first line only)
  line_1_desc TEXT,
  line_1_qty DECIMAL(10,2),
  line_1_unit_price DECIMAL(10,2),
  
  -- Email information
  message_id TEXT,
  email_subject TEXT,
  email_from_name TEXT,
  email_from_address TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs table for tracking changes
CREATE TABLE IF NOT EXISTS "audit_logs" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entityType TEXT NOT NULL,
  entityId TEXT NOT NULL,
  action TEXT NOT NULL,
  userId UUID,
  changes JSONB,
  ipAddress TEXT,
  userAgent TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table for authentication
CREATE TABLE IF NOT EXISTS "users" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  role TEXT DEFAULT 'VIEWER' CHECK (role IN ('ADMIN', 'EMPLOYEE', 'CLIENT', 'VIEWER')),
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoice_supplier_name ON "Invoice"(supplier_name);
CREATE INDEX IF NOT EXISTS idx_invoice_date ON "Invoice"(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoice_due_date ON "Invoice"(due_date);
CREATE INDEX IF NOT EXISTS idx_invoice_total ON "Invoice"(total);
CREATE INDEX IF NOT EXISTS idx_invoice_created_at ON "Invoice"(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for Invoice table
CREATE POLICY "Enable read access for all users" ON "Invoice"
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON "Invoice"
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON "Invoice"
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_invoice_updated_at 
  BEFORE UPDATE ON "Invoice" 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();