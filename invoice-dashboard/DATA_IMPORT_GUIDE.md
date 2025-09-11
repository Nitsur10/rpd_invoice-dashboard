# RPD Invoice Dashboard - Data Import Guide

## Overview
This guide helps you import your actual spreadsheet data into the RPD Invoice Dashboard after updating the database schema.

## Prerequisites
1. ✅ Execute `updated-schema.sql` in Supabase SQL Editor
2. ✅ Have your Supabase project URL and service role key
3. ✅ Export your spreadsheet as CSV format

## Step 1: Update Database Schema

**In Supabase SQL Editor:**
```sql
-- Copy and paste the complete contents of updated-schema.sql
-- This will drop existing Invoice table and create new one matching your spreadsheet
```

## Step 2: Configure Import Script

**Edit `import-spreadsheet-data.js`:**
```javascript
// Update these lines with your actual Supabase credentials
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_SERVICE_KEY = 'your-service-role-key';
```

## Step 3: Prepare Your Data

### Option A: CSV Export from Spreadsheet
1. Open your Excel/Google Sheets file
2. Export as CSV format
3. Ensure headers match exactly:
   ```
   invoice_number,invoice_date,due_date,currency,subtotal,gst_total,total,amount_due,supplier_name,supplier_abn,supplier_email,customer_name,customer_abn,bank_bsb,bank_account,reference_hint,file_name,file_url,folder_path,file_id,folder_id,source,notes,confidence,line_1_desc,line_1_qty,line_1_unit_price,message_id,email_subject,email_from_name,email_from_address
   ```

### Option B: Test with Sample Data
```bash
node import-spreadsheet-data.js sample
```

## Step 4: Import Your Data

```bash
# Import from CSV file
node import-spreadsheet-data.js csv /path/to/your/invoices.csv

# Example:
node import-spreadsheet-data.js csv ./data/rpd-invoices-export.csv
```

## Expected Import Output
```
🏗️ RPD Invoice Dashboard - Data Import Tool
==========================================
📂 Reading CSV file: ./data/rpd-invoices-export.csv
📊 Detected CSV headers: [invoice_number, invoice_date, ...]
🎯 Expected fields: [invoice_number, invoice_date, ...]
🚀 Importing 150 invoices to Supabase...
✅ Batch 1: 100 invoices imported
✅ Batch 2: 50 invoices imported
🎉 Successfully imported 150 invoices total
```

## Step 5: Verify Import

**Check in Supabase:**
```sql
-- Verify data was imported
SELECT COUNT(*) as total_invoices FROM "Invoice";

-- Check sample records
SELECT invoice_number, supplier_name, total, invoice_date 
FROM "Invoice" 
LIMIT 10;

-- Verify no duplicates
SELECT invoice_number, COUNT(*) 
FROM "Invoice" 
GROUP BY invoice_number 
HAVING COUNT(*) > 1;
```

## Field Mapping Details

| Spreadsheet Field | Database Field | Type | Required |
|------------------|----------------|------|----------|
| invoice_number | invoice_number | TEXT | ✅ PRIMARY KEY |
| invoice_date | invoice_date | TIMESTAMP | ❌ |
| due_date | due_date | TIMESTAMP | ❌ |
| currency | currency | TEXT | ❌ |
| subtotal | subtotal | DECIMAL(10,2) | ❌ |
| gst_total | gst_total | DECIMAL(10,2) | ❌ |
| total | total | DECIMAL(10,2) | ✅ REQUIRED |
| amount_due | amount_due | DECIMAL(10,2) | ❌ |
| supplier_name | supplier_name | TEXT | ✅ REQUIRED |
| supplier_abn | supplier_abn | TEXT | ❌ |
| supplier_email | supplier_email | TEXT | ❌ |
| customer_name | customer_name | TEXT | ❌ |
| customer_abn | customer_abn | TEXT | ❌ |
| bank_bsb | bank_bsb | TEXT | ❌ |
| bank_account | bank_account | TEXT | ❌ |
| reference_hint | reference_hint | TEXT | ❌ |
| file_name | file_name | TEXT | ❌ |
| file_url | file_url | TEXT | ❌ |
| folder_path | folder_path | TEXT | ❌ |
| file_id | file_id | TEXT | ❌ |
| folder_id | folder_id | TEXT | ❌ |
| source | source | TEXT | ❌ |
| notes | notes | TEXT | ❌ |
| confidence | confidence | DECIMAL(5,2) | ❌ |
| line_1_desc | line_1_desc | TEXT | ❌ |
| line_1_qty | line_1_qty | DECIMAL(10,2) | ❌ |
| line_1_unit_price | line_1_unit_price | DECIMAL(10,2) | ❌ |
| message_id | message_id | TEXT | ❌ |
| email_subject | email_subject | TEXT | ❌ |
| email_from_name | email_from_name | TEXT | ❌ |
| email_from_address | email_from_address | TEXT | ❌ |

## Troubleshooting

### Import Fails with "duplicate key" error
- Your CSV contains duplicate invoice_number values
- Check for duplicates: `grep -v "^$" your-file.csv | cut -d',' -f1 | sort | uniq -d`

### Import Fails with "invalid date format"
- Ensure date fields are in ISO format: `YYYY-MM-DDTHH:mm:ss.sssZ`
- Or Excel format: `MM/DD/YYYY` or `DD/MM/YYYY`

### Field validation errors
- Check required fields: `invoice_number`, `total`, `supplier_name` must not be empty
- Numeric fields should contain valid numbers or be empty

### Connection errors
- Verify SUPABASE_URL and SUPABASE_SERVICE_KEY are correct
- Check Supabase project is accessible
- Ensure service role key has table access permissions

## Next Steps
After successful import:
1. 🔄 Update dashboard components to use new field names (snake_case)
2. 🧪 Test dashboard functionality with real data  
3. 📊 Verify all charts and filters work correctly
4. 🚀 Deploy to production

## Support
- Check Supabase logs for detailed error messages
- Verify CSV format matches expected headers exactly
- Ensure all required fields have valid data