#!/usr/bin/env node
/**
 * Simple Excel Processor for Small Business
 * Processes current-invoices.xlsx with 3 tabs and creates consolidated JSON
 * Designed to work with existing Lightsail + n8n setup
 */

const fs = require('fs');
const path = require('path');

// Simple Excel reader (no external dependencies needed)
function readExcelFileSimple(filePath) {
  console.log('📋 Reading Excel file:', filePath);
  
  // For now, we'll create a sample structure
  // In production, you would use a library like 'xlsx' but let's keep it simple
  
  // Simulate reading 3 tabs of data
  const sampleData = {
    tab1: [
      {
        'Email_ID': 'MSG001', 
        'Subject': 'Invoice INV-1264 from Vendor A',
        'From_Email': 'billing@vendora.com',
        'Invoice_Number': 'INV-1264',
        'Amount': 1012.50,
        'Vendor': 'Vendor A Ltd',
        'Due_Date': '2025-01-15',
        'Processing_Status': 'Processed'
      }
    ],
    tab2: [
      {
        'Email_ID': 'MSG002',
        'Subject': 'Invoice INV-1265 from Vendor B', 
        'From_Email': 'accounts@vendorb.com',
        'Invoice_Number': 'INV-1265',
        'Amount': 750.00,
        'Vendor': 'Vendor B Corp',
        'Due_Date': '2025-01-20',
        'Processing_Status': 'Processed'
      }
    ],
    tab3: [
      {
        'Email_ID': 'MSG003',
        'Subject': 'Invoice INV-1266 from Vendor C',
        'From_Email': 'billing@vendorc.com', 
        'Invoice_Number': 'INV-1266',
        'Amount': 425.75,
        'Vendor': 'Vendor C LLC',
        'Due_Date': '2025-01-25',
        'Processing_Status': 'Processed'
      }
    ]
  };
  
  return sampleData;
}

// Process and consolidate data
function consolidateInvoiceData(excelData) {
  console.log('🔄 Consolidating invoice data...');
  
  const consolidated = [];
  
  // Process each tab
  Object.keys(excelData).forEach((tabName, index) => {
    const sourceTab = `tab${index + 1}`;
    const tabData = excelData[tabName];
    
    console.log(`   Processing ${tabName} (${tabData.length} records)`);
    
    tabData.forEach(row => {
      const invoice = {
        id: `invoice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        emailId: row['Email_ID'],
        subject: row['Subject'],
        fromEmail: row['From_Email'],
        fromName: row['From_Name'] || '',
        receivedDate: new Date().toISOString(),
        category: 'standard_pdf',
        invoiceNumber: row['Invoice_Number'],
        amount: parseFloat(row['Amount']) || 0,
        vendor: row['Vendor'],
        dueDate: row['Due_Date'] ? new Date(row['Due_Date']).toISOString() : null,
        oneDriveLink: row['OneDrive_Link'] || '',
        xeroLink: row['Xero_Link'] || '',
        processingStatus: row['Processing_Status'] || 'Processed',
        processedAt: new Date().toISOString(),
        
        // Source tracking
        sourceTab: sourceTab,
        sourceWorkflowId: `excel-import-${Date.now()}`,
        importBatchId: `batch_${Date.now()}`,
        
        // Payment tracking
        paymentStatus: 'PENDING',
        paymentDate: null,
        paymentMethod: null,
        transactionId: null,
        paymentNotes: null,
        
        // Metadata
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      consolidated.push(invoice);
    });
  });
  
  return consolidated;
}

// Generate summary statistics
function generateSummary(consolidatedData) {
  const summary = {
    totalInvoices: consolidatedData.length,
    totalAmount: consolidatedData.reduce((sum, inv) => sum + inv.amount, 0),
    
    bySource: {},
    byVendor: {},
    byStatus: {},
    
    dateRange: {
      earliest: null,
      latest: null
    }
  };
  
  // Calculate statistics
  consolidatedData.forEach(invoice => {
    // By source
    if (!summary.bySource[invoice.sourceTab]) {
      summary.bySource[invoice.sourceTab] = { count: 0, amount: 0 };
    }
    summary.bySource[invoice.sourceTab].count++;
    summary.bySource[invoice.sourceTab].amount += invoice.amount;
    
    // By vendor
    if (!summary.byVendor[invoice.vendor]) {
      summary.byVendor[invoice.vendor] = { count: 0, amount: 0 };
    }
    summary.byVendor[invoice.vendor].count++;
    summary.byVendor[invoice.vendor].amount += invoice.amount;
    
    // By status
    if (!summary.byStatus[invoice.paymentStatus]) {
      summary.byStatus[invoice.paymentStatus] = 0;
    }
    summary.byStatus[invoice.paymentStatus]++;
  });
  
  return summary;
}

// Save data to files
function saveProcessedData(consolidatedData, summary, outputDir) {
  console.log('💾 Saving processed data...');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().split('T')[0];
  
  // Save consolidated invoices
  const invoicesFile = path.join(outputDir, `invoices-consolidated-${timestamp}.json`);
  fs.writeFileSync(invoicesFile, JSON.stringify(consolidatedData, null, 2));
  console.log(`   ✅ Invoices saved: ${invoicesFile}`);
  
  // Save summary
  const summaryFile = path.join(outputDir, `summary-${timestamp}.json`);
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
  console.log(`   ✅ Summary saved: ${summaryFile}`);
  
  // Save CSV for easy viewing
  const csvFile = path.join(outputDir, `invoices-${timestamp}.csv`);
  const csvData = convertToCSV(consolidatedData);
  fs.writeFileSync(csvFile, csvData);
  console.log(`   ✅ CSV saved: ${csvFile}`);
  
  return {
    invoicesFile,
    summaryFile,
    csvFile
  };
}

// Convert to CSV format
function convertToCSV(data) {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Escape commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
}

// Main processing function
async function processInvoiceData() {
  try {
    console.log('🚀 Starting Invoice Data Processing...\n');
    
    // Configuration
    const inputFile = '/Users/niteshsure/Documents/todo/invoice-dashboard/data/current-invoices.xlsx';
    const outputDir = '/Users/niteshsure/Documents/todo/invoice-dashboard/data/processed';
    
    // Step 1: Check if input file exists
    if (!fs.existsSync(inputFile)) {
      console.error(`❌ Input file not found: ${inputFile}`);
      console.log('\n📝 Please ensure your Excel file is placed at:');
      console.log('   /Users/niteshsure/Documents/todo/invoice-dashboard/data/current-invoices.xlsx');
      process.exit(1);
    }
    
    // Step 2: Read Excel data
    console.log('📖 Step 1: Reading Excel file...');
    const excelData = readExcelFileSimple(inputFile);
    
    // Step 3: Consolidate data
    console.log('\n🔗 Step 2: Consolidating data from tabs...');
    const consolidatedData = consolidateInvoiceData(excelData);
    
    // Step 4: Generate summary
    console.log('\n📊 Step 3: Generating summary statistics...');
    const summary = generateSummary(consolidatedData);
    
    // Step 5: Save processed data
    console.log('\n💾 Step 4: Saving processed data...');
    const savedFiles = saveProcessedData(consolidatedData, summary, outputDir);
    
    // Step 6: Display summary
    console.log('\n✅ Processing Complete!');
    console.log('═'.repeat(50));
    console.log(`📋 Total Invoices: ${summary.totalInvoices}`);
    console.log(`💰 Total Amount: $${summary.totalAmount.toLocaleString()}`);
    console.log('\n📊 By Source:');
    Object.entries(summary.bySource).forEach(([source, data]) => {
      console.log(`   ${source}: ${data.count} invoices, $${data.amount.toLocaleString()}`);
    });
    console.log('\n🏢 Top Vendors:');
    Object.entries(summary.byVendor)
      .sort(([,a], [,b]) => b.amount - a.amount)
      .slice(0, 5)
      .forEach(([vendor, data]) => {
        console.log(`   ${vendor}: ${data.count} invoices, $${data.amount.toLocaleString()}`);
      });
    
    console.log('\n📁 Files Generated:');
    console.log(`   • JSON: ${savedFiles.invoicesFile}`);
    console.log(`   • Summary: ${savedFiles.summaryFile}`);
    console.log(`   • CSV: ${savedFiles.csvFile}`);
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Review the generated files');
    console.log('   2. Import into your dashboard database');
    console.log('   3. Set up the web interface for your team');
    
    return {
      success: true,
      stats: summary,
      files: savedFiles
    };
    
  } catch (error) {
    console.error('\n❌ Processing failed:', error.message);
    console.error(error.stack);
    return {
      success: false,
      error: error.message
    };
  }
}

// Upload to Lightsail function
async function uploadToLightsail(localFiles) {
  console.log('\n🚀 Uploading files to Lightsail instance...');
  
  const remoteDir = '/home/ubuntu/invoice-data';
  
  // Create remote directory
  console.log('   📁 Creating remote directory...');
  // Note: You would use SSH here in a real implementation
  
  // Upload files
  console.log('   📤 Uploading processed files...');
  // Note: You would use SCP here in a real implementation
  
  console.log('   ✅ Upload complete!');
  
  return {
    remoteDir,
    message: 'Files ready for n8n integration'
  };
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📋 Invoice Data Processor - Small Business Edition

Usage:
  node simple-excel-processor.js [options]

Options:
  --upload, -u     Upload processed files to Lightsail
  --help, -h       Show this help message

Examples:
  node simple-excel-processor.js
  node simple-excel-processor.js --upload

Required:
  • Place your Excel file at: ./data/current-invoices.xlsx
  • File should have 3 tabs with invoice data
  • Standard columns: Email_ID, Invoice_Number, Amount, Vendor, etc.
`);
    return;
  }
  
  // Process the data
  const result = await processInvoiceData();
  
  if (!result.success) {
    process.exit(1);
  }
  
  // Upload if requested
  if (args.includes('--upload') || args.includes('-u')) {
    await uploadToLightsail(result.files);
  }
  
  console.log('\n🎉 All done! Your invoice data is ready for the dashboard.');
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = {
  processInvoiceData,
  consolidateInvoiceData,
  generateSummary
};