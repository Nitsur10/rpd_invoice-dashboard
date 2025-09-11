#!/usr/bin/env node
/**
 * Extract All Excel Data - No Deduplication with Correct Field Mappings
 * Uses:
 * - Total column for amounts (not amount_due)
 * - Invoice date as the main date field
 * - Supplier name for stakeholder who sent invoice
 */

const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

function extractExcelData() {
  console.log('🚀 Extracting ALL invoice data from Excel (no deduplication)...\n');
  
  const excelFile = path.join(__dirname, '../data/current_invoices.xlsx');
  
  if (!fs.existsSync(excelFile)) {
    console.error(`❌ Excel file not found: ${excelFile}`);
    return false;
  }
  
  try {
    // Read the Excel file
    const workbook = xlsx.readFile(excelFile);
    const allInvoices = [];
    let totalRecords = 0;
    
    // Process each sheet
    workbook.SheetNames.forEach(sheetName => {
      // Skip Notes sheets
      if (sheetName.toLowerCase().includes('notes')) {
        console.log(`⏭️  Skipping sheet: ${sheetName} (Notes)`);
        return;
      }
      
      console.log(`📋 Processing sheet: ${sheetName}`);
      
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet);
      
      console.log(`   Found ${jsonData.length} rows`);
      
      let sheetRecords = 0;
      
      jsonData.forEach((row, index) => {
        // Skip empty rows
        if (!row.supplier_name || String(row.supplier_name).trim() === '') {
          return;
        }
        
        // Map fields with correct mappings as requested
        const invoiceData = {
          id: `${sheetName}-${index}`,
          invoiceNumber: String(row.invoice_number || `INV-${sheetName}-${index}`),
          vendorName: String(row.supplier_name || ''), // Supplier name = stakeholder who sent invoice
          vendorEmail: String(row.supplier_email || ''),
          amount: parseFloat(row.total) || 0, // Use Total column for amounts
          amountDue: parseFloat(row.amount_due) || 0,
          issueDate: formatDate(row.invoice_date), // Use Invoice date as main date field
          dueDate: formatDate(row.due_date),
          status: determineStatus(row),
          description: String(row.description || ''),
          category: String(row.category || sheetName),
          paymentTerms: String(row.payment_terms || 'Net 30'),
          invoiceUrl: String(row.invoice_url || ''),
          receivedDate: formatDate(row.received_date || row.invoice_date), // Fallback to invoice_date
          paidDate: row.paid_date ? formatDate(row.paid_date) : null,
          source: sheetName
        };
        
        allInvoices.push(invoiceData);
        sheetRecords++;
      });
      
      console.log(`   ✅ Extracted ${sheetRecords} records from ${sheetName}`);
      totalRecords += sheetRecords;
    });
    
    console.log(`\n📊 TOTAL RECORDS EXTRACTED: ${totalRecords} (NO DEDUPLICATION)`);
    
    // Save consolidated data
    const outputFile = path.join(__dirname, '../src/lib/consolidated-invoice-data.json');
    const outputDir = path.dirname(outputFile);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputFile, JSON.stringify(allInvoices, null, 2));
    
    console.log(`💾 Saved consolidated data: ${outputFile}`);
    console.log(`📝 Contains ${allInvoices.length} invoice records from all sheets`);
    
    // Generate summary with corrected field mappings
    console.log('\n📈 SUMMARY BY SOURCE:');
    const sources = {};
    let totalAmount = 0;
    
    allInvoices.forEach(invoice => {
      const source = invoice.source;
      if (!sources[source]) {
        sources[source] = { count: 0, amount: 0 };
      }
      sources[source].count += 1;
      sources[source].amount += invoice.amount; // Using Total column amounts
      totalAmount += invoice.amount;
    });
    
    Object.entries(sources).forEach(([source, data]) => {
      console.log(`   ${source}: ${data.count} invoices, $${data.amount.toLocaleString()}`);
    });
    
    console.log(`\n💰 TOTAL VALUE (from Total column): $${totalAmount.toLocaleString()}`);
    
    console.log('\n✅ FIELD MAPPINGS CONFIRMED:');
    console.log('   • Amount: Total column (not amount_due)');
    console.log('   • Date: Invoice date (main date field)');
    console.log('   • Stakeholder: Supplier name (who sent invoice)');
    
    return true;
    
  } catch (error) {
    console.error(`❌ Error processing Excel file: ${error.message}`);
    return false;
  }
}

function formatDate(dateValue) {
  if (!dateValue || dateValue === 'NaT') {
    return new Date().toISOString();
  }
  
  try {
    // Handle Excel date serial numbers
    if (typeof dateValue === 'number') {
      // Excel date serial number
      const date = new Date((dateValue - 25569) * 86400 * 1000);
      return date.toISOString();
    }
    
    // Handle string dates
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      return new Date().toISOString();
    }
    
    return date.toISOString();
  } catch (e) {
    return new Date().toISOString();
  }
}

function determineStatus(row) {
  const amountDue = parseFloat(row.amount_due) || 0;
  const total = parseFloat(row.total) || 0;
  const dueDate = row.due_date;
  
  // If amount due is 0 and total > 0, it's paid
  if (amountDue === 0 && total > 0) {
    return 'paid';
  }
  
  // If due date has passed and amount due > 0, it's overdue
  if (dueDate) {
    try {
      const due = new Date(dueDate);
      if (due < new Date() && amountDue > 0) {
        return 'overdue';
      }
    } catch (e) {
      // Invalid date, treat as pending
    }
  }
  
  // Otherwise it's pending
  return 'pending';
}

// Run the extraction
if (require.main === module) {
  const success = extractExcelData();
  process.exit(success ? 0 : 1);
}

module.exports = { extractExcelData };