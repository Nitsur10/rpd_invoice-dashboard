-- Updated Invoice Dashboard Schema - Matching Spreadsheet Fields Only
-- Run this in Supabase SQL Editor to replace current schema

-- Drop existing Invoice table
DROP TABLE IF EXISTS "Invoice" CASCADE;

-- Create new Invoice table with only spreadsheet fields
CREATE TABLE IF NOT EXISTS "Invoice" (
    -- Core invoice fields from spreadsheet
    invoice_number TEXT PRIMARY KEY,
    invoice_date TIMESTAMP(3),
    due_date TIMESTAMP(3),
    currency TEXT,
    subtotal DECIMAL(10,2),
    gst_total DECIMAL(10,2),
    total DECIMAL(10,2) NOT NULL,
    amount_due DECIMAL(10,2),
    
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
    
    -- System timestamps
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "Invoice_supplier_name_idx" ON "Invoice"(supplier_name);
CREATE INDEX IF NOT EXISTS "Invoice_total_idx" ON "Invoice"(total);
CREATE INDEX IF NOT EXISTS "Invoice_invoice_date_idx" ON "Invoice"(invoice_date);
CREATE INDEX IF NOT EXISTS "Invoice_due_date_idx" ON "Invoice"(due_date);
CREATE INDEX IF NOT EXISTS "Invoice_amount_due_idx" ON "Invoice"(amount_due);
CREATE INDEX IF NOT EXISTS "Invoice_source_idx" ON "Invoice"(source);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_invoice_updated_at ON "Invoice";
CREATE TRIGGER update_invoice_updated_at
    BEFORE UPDATE ON "Invoice"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify new table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'Invoice' 
  AND table_schema = 'public'
ORDER BY ordinal_position;