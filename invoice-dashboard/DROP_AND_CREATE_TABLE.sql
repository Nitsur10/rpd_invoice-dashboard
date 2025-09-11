-- =============================================
-- DROP AND CREATE INVOICE TABLE SCRIPT
-- =============================================
-- This script will completely recreate the Invoice table
-- with the correct snake_case schema for spreadsheet import

-- Step 1: Drop existing table and all dependencies
DROP TABLE IF EXISTS "Invoice" CASCADE;

-- Step 2: Create the Invoice table with all 32 fields matching spreadsheet exactly
CREATE TABLE "Invoice" (
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

-- Step 3: Create performance indexes
CREATE INDEX idx_invoice_supplier_name ON "Invoice"(supplier_name);
CREATE INDEX idx_invoice_date ON "Invoice"(invoice_date);
CREATE INDEX idx_invoice_due_date ON "Invoice"(due_date);
CREATE INDEX idx_invoice_total ON "Invoice"(total);
CREATE INDEX idx_invoice_created_at ON "Invoice"(created_at);
CREATE INDEX idx_invoice_source ON "Invoice"(source);

-- Step 4: Create trigger function for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 5: Create trigger to auto-update updated_at field
CREATE TRIGGER update_invoice_updated_at 
  BEFORE UPDATE ON "Invoice" 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Verify table creation
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'Invoice' 
ORDER BY ordinal_position;

-- Step 7: Test insert to verify structure
INSERT INTO "Invoice" (
  invoice_number,
  supplier_name,
  total,
  currency,
  source
) VALUES (
  'TEST-VERIFY-001',
  'Test Supplier Ltd',
  999.99,
  'AUD',
  'verification_test'
);

-- Step 8: Show test record
SELECT 
  invoice_number,
  supplier_name,
  total,
  currency,
  source,
  created_at
FROM "Invoice" 
WHERE invoice_number = 'TEST-VERIFY-001';

-- Step 9: Clean up test record
DELETE FROM "Invoice" WHERE invoice_number = 'TEST-VERIFY-001';

-- =============================================
-- EXPECTED RESULTS:
-- =============================================
-- ✅ Table "Invoice" created with 32 fields
-- ✅ All indexes created successfully  
-- ✅ Trigger function created
-- ✅ Updated_at trigger active
-- ✅ Test insert/delete successful
-- ✅ Ready for spreadsheet import
-- =============================================