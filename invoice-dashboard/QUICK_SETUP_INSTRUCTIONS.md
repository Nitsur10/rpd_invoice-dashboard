# 🚀 Quick Setup Instructions

## Step 1: Deploy Table Schema

1. **Go to Supabase Dashboard**: https://auvyyrfbmlfsmmpjnaoc.supabase.co
2. **Click "SQL Editor"** in the left sidebar
3. **Copy the entire contents** of `DROP_AND_CREATE_TABLE.sql`
4. **Paste into SQL Editor** and click **"RUN"**

## Step 2: Import Spreadsheet Data

Once the table is created successfully, run:

```bash
node scripts/import-invoices-from-spreadsheet.js data/current-invoices.xlsx
```

## Expected Results

### After SQL Script:
- ✅ Table "Invoice" created with 32 fields
- ✅ All performance indexes created
- ✅ Auto-timestamp trigger active  
- ✅ Test record inserted and deleted successfully

### After Import Script:
- ✅ All spreadsheet tabs processed
- ✅ Tab names retained in `source` field
- ✅ Duplicates removed based on key fields
- ✅ All 32 fields mapped correctly
- ✅ Data ready for dashboard

## Verification Commands

Run these in Supabase SQL Editor to verify:

```sql
-- Check total records
SELECT COUNT(*) as total_invoices FROM "Invoice";

-- Check tab sources  
SELECT source, COUNT(*) as invoice_count 
FROM "Invoice" 
GROUP BY source 
ORDER BY invoice_count DESC;

-- Sample records
SELECT 
  invoice_number, 
  supplier_name, 
  total, 
  source,
  invoice_date
FROM "Invoice" 
LIMIT 5;
```

## 🎯 Key Features Working

- **Tab Name Retention**: ✅ Each invoice shows original spreadsheet tab in `source` field
- **Smart Duplicate Removal**: ✅ Based on invoice_number + supplier_name + total + invoice_date
- **Complete Field Mapping**: ✅ All 32 spreadsheet fields preserved
- **Dashboard Ready**: ✅ Data structure matches application expectations

Ready to test the dashboard at http://localhost:3002! 🎉