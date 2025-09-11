#!/usr/bin/env node
/**
 * Extract Filtered & Deduplicated Invoice Data
 * - Remove all rows prior to May 1st, 2025
 * - Apply deduplication logic
 * - Use correct field mappings (Total column, Invoice date, Supplier name)
 */

const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

function extractFilteredData() {
  console.log('🚀 Extracting filtered invoice data (May 1st, 2025 onwards) with deduplication...\n');
  
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
    let filteredRecords = 0;
    
    // Filter date - May 1st, 2025
    const filterDate = new Date('2025-05-01');
    console.log(`📅 Filter date: ${filterDate.toISOString().split('T')[0]}`);
    
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
      let sheetFiltered = 0;
      
      jsonData.forEach((row, index) => {
        // Skip empty rows
        if (!row.supplier_name || String(row.supplier_name).trim() === '') {
          return;
        }
        
        totalRecords++;
        
        // Check invoice date filter
        const invoiceDate = parseDate(row.invoice_date);
        if (!invoiceDate || invoiceDate < filterDate) {
          return; // Skip records before May 1st, 2025
        }
        
        filteredRecords++;
        
        // Map fields with correct mappings
        const invoiceData = {
          id: `${sheetName}-${index}`,
          invoiceNumber: String(row.invoice_number || `INV-${sheetName}-${index}`),
          vendorName: String(row.supplier_name || ''),
          vendorEmail: String(row.supplier_email || ''),
          amount: parseFloat(row.total) || 0,
          amountDue: parseFloat(row.amount_due) || 0,
          issueDate: invoiceDate.toISOString(),
          dueDate: formatDate(row.due_date),
          status: determineStatus(row),
          description: String(row.description || ''),
          category: String(row.category || sheetName),
          paymentTerms: String(row.payment_terms || 'Net 30'),
          invoiceUrl: String(row.invoice_url || ''),
          receivedDate: invoiceDate.toISOString(),
          paidDate: row.paid_date ? formatDate(row.paid_date) : null,
          source: sheetName
        };
        
        allInvoices.push(invoiceData);
        sheetRecords++;
        sheetFiltered++;
      });
      
      console.log(`   ✅ Extracted ${sheetFiltered} records from ${sheetName} (after date filter)`);
    });
    
    console.log(`\n📊 BEFORE DEDUPLICATION:`);
    console.log(`   Total records found: ${totalRecords}`);
    console.log(`   After date filter (May 1+ 2025): ${filteredRecords}`);
    
    // Apply deduplication logic
    console.log('\n🔍 Applying deduplication logic...\n');
    
    const duplicates = [];
    const unique = [];
    const seen = new Map();
    
    allInvoices.forEach((invoice, index) => {
      // Create deduplication key based on critical fields
      const key = `${invoice.invoiceNumber}-${invoice.amount}-${invoice.vendorName.toLowerCase().trim()}`;
      
      if (seen.has(key)) {
        const existingInvoice = seen.get(key);
        duplicates.push({
          duplicate: invoice,
          original: existingInvoice,
          reason: 'Same invoice number, amount, and vendor'
        });
        console.log(`🔄 Duplicate found: Invoice ${invoice.invoiceNumber} from ${invoice.vendorName} ($${invoice.amount})`);
      } else {
        seen.set(key, invoice);
        unique.push(invoice);
      }
    });
    
    console.log(`\n📋 FINAL RESULTS:`);
    console.log(`   Unique invoices: ${unique.length}`);
    console.log(`   Duplicates removed: ${duplicates.length}`);
    
    // Save consolidated data
    const outputFile = path.join(__dirname, '../src/lib/consolidated-invoice-data.json');
    const outputDir = path.dirname(outputFile);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputFile, JSON.stringify(unique, null, 2));
    
    console.log(`\n💾 Saved consolidated data: ${outputFile}`);
    console.log(`📝 Contains ${unique.length} invoice records (May 1st 2025+ only, deduplicated)`);
    
    // Generate summary with filtered data
    console.log('\n📈 SUMMARY BY SOURCE:');
    const sources = {};
    let totalAmount = 0;
    
    unique.forEach(invoice => {
      const source = invoice.source;
      if (!sources[source]) {
        sources[source] = { count: 0, amount: 0 };
      }
      sources[source].count += 1;
      sources[source].amount += invoice.amount;
      totalAmount += invoice.amount;
    });
    
    Object.entries(sources).forEach(([source, data]) => {
      console.log(`   ${source}: ${data.count} invoices, $${data.amount.toLocaleString()}`);
    });
    
    console.log(`\n💰 TOTAL VALUE (filtered & deduplicated): $${totalAmount.toLocaleString()}`);
    
    // Status breakdown
    const statusBreakdown = unique.reduce((acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📊 STATUS BREAKDOWN:');
    Object.entries(statusBreakdown).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} invoices`);
    });
    
    // Date range analysis
    const dates = unique.map(inv => new Date(inv.issueDate)).sort((a, b) => a - b);
    console.log(`\n📅 DATE RANGE: ${dates[0].toISOString().split('T')[0]} to ${dates[dates.length-1].toISOString().split('T')[0]}`);
    
    return true;
    
  } catch (error) {
    console.error(`❌ Error processing Excel file: ${error.message}`);
    return false;
  }
}

function parseDate(dateValue) {
  if (!dateValue || dateValue === 'NaT') {
    return null;
  }
  
  try {
    // Handle Excel date serial numbers
    if (typeof dateValue === 'number') {
      const date = new Date((dateValue - 25569) * 86400 * 1000);
      return date;
    }
    
    // Handle string dates
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      return null;
    }
    
    return date;
  } catch (e) {
    return null;
  }
}

function formatDate(dateValue) {
  const date = parseDate(dateValue);
  return date ? date.toISOString() : new Date().toISOString();
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
      const due = parseDate(dueDate);
      if (due && due < new Date() && amountDue > 0) {
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
  const success = extractFilteredData();
  process.exit(success ? 0 : 1);
}

module.exports = { extractFilteredData };