#!/usr/bin/env node

const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Spreadsheet headers already match database field names exactly!
// No mapping needed - using direct field names
const expectedFields = [
  'invoice_number', 'invoice_date', 'due_date', 'currency',
  'subtotal', 'gst_total', 'total', 'amount_due',
  'supplier_name', 'supplier_abn', 'supplier_email',
  'customer_name', 'customer_abn',
  'bank_bsb', 'bank_account', 'reference_hint',
  'file_name', 'file_url', 'folder_path', 'file_id', 'folder_id',
  'source', 'notes', 'confidence',
  'line_1_desc', 'line_1_qty', 'line_1_unit_price',
  'message_id', 'email_subject', 'email_from_name', 'email_from_address'
];

function formatDate(dateValue) {
  if (!dateValue) return null;
  
  try {
    // Handle Excel date serial numbers
    if (typeof dateValue === 'number') {
      const date = XLSX.SSF.parse_date_code(dateValue);
      return new Date(date.y, date.m - 1, date.d).toISOString().split('T')[0];
    }
    
    // Handle string dates
    if (typeof dateValue === 'string') {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
    
    return null;
  } catch (error) {
    console.warn(`⚠️ Date formatting error for value: ${dateValue}`, error.message);
    return null;
  }
}

function cleanNumericValue(value) {
  if (value === null || value === undefined || value === '') return null;
  
  // Remove currency symbols and commas
  const cleaned = String(value).replace(/[$,\s]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? null : parsed;
}

function mapRowToInvoice(row, tabName) {
  const invoice = {};
  
  // Process each expected field directly (no mapping needed)
  expectedFields.forEach(field => {
    let value = row[field];
    
    // Skip if field doesn't exist in this row
    if (value === undefined) return;
    
    // Special handling for different field types
    if (field.includes('date')) {
      value = formatDate(value);
    } else if (['subtotal', 'gst_total', 'total', 'amount_due', 'confidence', 'line_1_qty', 'line_1_unit_price'].includes(field)) {
      value = cleanNumericValue(value);
    } else if (value !== null && value !== undefined && value !== 'N/A') {
      value = String(value).trim() || null;
    }
    
    // Only add non-empty values
    if (value !== null && value !== undefined && value !== '' && value !== 'N/A') {
      invoice[field] = value;
    }
  });
  
  // Override the source field with the tab name (CRITICAL REQUIREMENT)
  invoice.source = tabName;
  
  // Ensure required fields are present
  if (!invoice.invoice_number) {
    throw new Error('Missing required field: invoice_number');
  }
  if (!invoice.supplier_name) {
    throw new Error('Missing required field: supplier_name');
  }
  if (!invoice.total) {
    throw new Error('Missing required field: total');
  }
  
  return invoice;
}

function createDuplicateKey(invoice) {
  // Use only invoice_number to match database primary key constraint
  return invoice.invoice_number?.toLowerCase().trim();
}

async function processSpreadsheet(filePath) {
  console.log(`📊 Processing spreadsheet: ${filePath}`);
  
  try {
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    
    console.log(`📋 Found ${sheetNames.length} tabs: ${sheetNames.join(', ')}`);
    
    let allInvoices = [];
    let duplicateKeys = new Set();
    let stats = {
      totalProcessed: 0,
      duplicatesSkipped: 0,
      errorsSkipped: 0,
      successfullyMapped: 0
    };
    
    // Process each tab/sheet
    for (const sheetName of sheetNames) {
      console.log(`\n🔄 Processing tab: "${sheetName}"`);
      
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      console.log(`   📄 Found ${jsonData.length} rows in "${sheetName}"`);
      
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        stats.totalProcessed++;
        
        try {
          // Map row to invoice with tab name as source
          const invoice = mapRowToInvoice(row, sheetName);
          
          // Check for duplicates based on key fields
          const duplicateKey = createDuplicateKey(invoice);
          
          if (duplicateKeys.has(duplicateKey)) {
            console.log(`   ⚠️ Duplicate found - Invoice: ${invoice.invoice_number}, Supplier: ${invoice.supplier_name}, Total: ${invoice.total}`);
            stats.duplicatesSkipped++;
            continue;
          }
          
          duplicateKeys.add(duplicateKey);
          allInvoices.push(invoice);
          stats.successfullyMapped++;
          
        } catch (error) {
          const errorRecord = {
            tabName: sheetName,
            rowNumber: i + 1,
            error: error.message,
            rawData: row
          };
          console.warn(`   ❌ Error processing row ${i + 1} in "${sheetName}": ${error.message}`);
          stats.errorsSkipped++;
          
          // Store error record for review
          if (!global.errorRecords) global.errorRecords = [];
          global.errorRecords.push(errorRecord);
        }
      }
    }
    
    console.log(`\n📊 Processing Summary:`);
    console.log(`   Total rows processed: ${stats.totalProcessed}`);
    console.log(`   Successfully mapped: ${stats.successfullyMapped}`);
    console.log(`   Duplicates skipped: ${stats.duplicatesSkipped}`);
    console.log(`   Errors skipped: ${stats.errorsSkipped}`);
    console.log(`   Final invoice count: ${allInvoices.length}`);
    
    // Save error records for review if any exist
    if (global.errorRecords && global.errorRecords.length > 0) {
      await saveErrorRecordsForReview(global.errorRecords);
    }
    
    return allInvoices;
    
  } catch (error) {
    console.error('❌ Error reading spreadsheet:', error);
    throw error;
  }
}

async function insertInvoicesInBatches(invoices) {
  console.log(`\n🚀 Starting Supabase import of ${invoices.length} invoices...`);
  
  const batchSize = 50; // Supabase batch limit
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < invoices.length; i += batchSize) {
    const batch = invoices.slice(i, i + batchSize);
    
    try {
      console.log(`   📦 Importing batch ${Math.floor(i/batchSize) + 1} (${batch.length} invoices)...`);
      
      const { data, error } = await supabase
        .from('Invoice')
        .insert(batch)
        .select('invoice_number');
      
      if (error) {
        console.error(`   ❌ Batch ${Math.floor(i/batchSize) + 1} failed:`, error.message);
        errorCount += batch.length;
      } else {
        console.log(`   ✅ Batch ${Math.floor(i/batchSize) + 1} imported successfully (${data.length} records)`);
        successCount += data.length;
      }
      
    } catch (error) {
      console.error(`   ❌ Batch ${Math.floor(i/batchSize) + 1} error:`, error.message);
      errorCount += batch.length;
    }
  }
  
  console.log(`\n🎉 Import Complete:`);
  console.log(`   ✅ Successfully imported: ${successCount} invoices`);
  console.log(`   ❌ Failed to import: ${errorCount} invoices`);
  
  return { successCount, errorCount };
}

async function saveErrorRecordsForReview(errorRecords) {
  console.log(`\n💾 Saving ${errorRecords.length} error records for review...`);
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `import-errors-${timestamp}.json`;
    const filepath = path.join(__dirname, '..', 'data', filename);
    
    const errorReport = {
      timestamp: new Date().toISOString(),
      totalErrors: errorRecords.length,
      errorSummary: {},
      records: errorRecords
    };
    
    // Count error types
    errorRecords.forEach(record => {
      errorReport.errorSummary[record.error] = (errorReport.errorSummary[record.error] || 0) + 1;
    });
    
    await fs.writeFile(filepath, JSON.stringify(errorReport, null, 2));
    console.log(`   ✅ Error records saved to: ${filename}`);
    console.log(`   📊 Error summary:`);
    Object.entries(errorReport.errorSummary).forEach(([error, count]) => {
      console.log(`      ${error}: ${count} records`);
    });
    
    // Also update the review file
    const reviewContent = `IMPORT ERROR RECORDS FOR REVIEW - ${new Date().toLocaleString()}
=====================================

Total Error Records: ${errorRecords.length}

ERROR SUMMARY:
${Object.entries(errorReport.errorSummary).map(([error, count]) => `• ${error}: ${count} records`).join('\n')}

DETAILED RECORDS:
${errorRecords.map((record, index) => `
${index + 1}. Tab: "${record.tabName}" | Row: ${record.rowNumber}
   Error: ${record.error}
   Data: ${JSON.stringify(record.rawData, null, 2).substring(0, 200)}...
`).join('\n')}

ACTION REQUIRED:
[ ] Review each error record above
[ ] Decide on correction approach  
[ ] Update source spreadsheet if needed
[ ] Re-run import after corrections

Full detailed records available in: ${filename}
`;
    
    const reviewPath = path.join(__dirname, '..', 'data', 'import-errors-review.txt');
    await fs.writeFile(reviewPath, reviewContent);
    console.log(`   📝 Review summary updated: import-errors-review.txt`);
    
  } catch (error) {
    console.error('❌ Error saving error records:', error.message);
  }
}

async function clearExistingData() {
  console.log('🗑️ Clearing existing invoice data...');
  
  const { error } = await supabase
    .from('Invoice')
    .delete()
    .neq('invoice_number', 'never_exists'); // Delete all records
  
  if (error) {
    console.error('❌ Error clearing existing data:', error);
    throw error;
  }
  
  console.log('✅ Existing data cleared');
}

async function main() {
  const filePath = process.argv[2] || '/Users/niteshsure/Documents/todo/invoice-dashboard/data/current-invoices.xlsx';
  
  console.log('🚀 Invoice Import Script Starting...\n');
  console.log(`📁 Source file: ${filePath}`);
  console.log(`🗄️ Target: Supabase Invoice table`);
  console.log(`🔗 Supabase URL: ${supabaseUrl}\n`);
  
  try {
    // Step 1: Clear existing data
    await clearExistingData();
    
    // Step 2: Process spreadsheet with tab name retention and duplicate removal
    const invoices = await processSpreadsheet(filePath);
    
    if (invoices.length === 0) {
      console.log('⚠️ No invoices to import. Exiting.');
      return;
    }
    
    // Step 3: Insert into Supabase
    const { successCount, errorCount } = await insertInvoicesInBatches(invoices);
    
    // Step 4: Verify import
    const { count } = await supabase
      .from('Invoice')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\n✅ Final verification: ${count} invoices in database`);
    
    if (errorCount > 0) {
      console.log(`⚠️ Import completed with ${errorCount} errors. Check logs above.`);
      process.exit(1);
    } else {
      console.log(`🎉 All invoices imported successfully!`);
    }
    
  } catch (error) {
    console.error('💥 Import failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { processSpreadsheet, insertInvoicesInBatches };