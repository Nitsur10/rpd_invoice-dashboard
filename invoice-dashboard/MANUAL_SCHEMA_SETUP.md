# Manual Supabase Schema Setup

## 🚨 CRITICAL: Deploy Schema First

Since automated deployment failed, you need to manually create the Invoice table in Supabase:

### Step 1: Access Supabase Dashboard
1. Go to [https://auvyyrfbmlfsmmpjnaoc.supabase.co](https://auvyyrfbmlfsmmpjnaoc.supabase.co)
2. Click on "SQL Editor" in the left sidebar

### Step 2: Execute Schema SQL
Copy and paste the following SQL into the SQL Editor and click "RUN":

```sql
-- Invoice table with all 32 fields matching spreadsheet exactly
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

-- Performance indexes
CREATE INDEX idx_invoice_supplier_name ON "Invoice"(supplier_name);
CREATE INDEX idx_invoice_date ON "Invoice"(invoice_date);
CREATE INDEX idx_invoice_due_date ON "Invoice"(due_date);
CREATE INDEX idx_invoice_total ON "Invoice"(total);
CREATE INDEX idx_invoice_created_at ON "Invoice"(created_at);
CREATE INDEX idx_invoice_source ON "Invoice"(source);

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
```

### Step 3: Verify Table Creation
After running the SQL, you should see:
- "Success. No rows returned" message
- The "Invoice" table should appear in the "Table Editor" section

### Step 4: Run Import Script
Once the table is created, run the import script:
```bash
node scripts/import-invoices-from-spreadsheet.js data/current-invoices.xlsx
```

## ✅ Expected Results
- **Required Fields**: invoice_number, supplier_name, total
- **32 Fields Total**: All spreadsheet columns mapped to snake_case
- **Tab Name Retention**: source field will contain spreadsheet tab names
- **Duplicate Removal**: Based on invoice_number + supplier_name + total + invoice_date

## 🔍 Verification Commands
After import, verify in dashboard:
```sql
-- Check total records
SELECT COUNT(*) FROM "Invoice";

-- Check tab sources  
SELECT source, COUNT(*) FROM "Invoice" GROUP BY source;

-- Sample records
SELECT invoice_number, supplier_name, total, source FROM "Invoice" LIMIT 5;
```