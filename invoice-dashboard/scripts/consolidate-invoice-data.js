const fs = require('fs');
const path = require('path');

// Read the extracted Excel data
const rawData = JSON.parse(fs.readFileSync('data/excel_data_extracted.json', 'utf8'));

function processInvoiceData() {
  console.log('🔄 Processing invoice data from 3 tabs...\n');
  
  // Extract data from each relevant tab (skip Notes tab)
  const xeroData = rawData['Xero only'] || [];
  const frankData = rawData['Frank'] || [];
  const taxcellentData = rawData['Taxcellent Non Xero'] || [];
  
  console.log(`📊 Data Summary:`);
  console.log(`- Xero only: ${xeroData.length} records`);
  console.log(`- Frank: ${frankData.length} records`);
  console.log(`- Taxcellent Non Xero: ${taxcellentData.length} records`);
  console.log(`- Total raw records: ${xeroData.length + frankData.length + taxcellentData.length}\n`);
  
  // Combine all data
  const allInvoices = [...xeroData, ...frankData, ...taxcellentData];
  
  // Transform and normalize data
  const normalizedInvoices = allInvoices.map((invoice, index) => {
    // Handle different data types and formats
    const invoiceNumber = String(invoice.invoice_number || `UNKNOWN-${index}`);
    const amountDue = parseFloat(invoice.amount_due) || parseFloat(invoice.total) || 0;
    const total = parseFloat(invoice.total) || 0;
    const supplierName = String(invoice.supplier_name || '').trim();
    
    // Parse dates
    let invoiceDate = null;
    let dueDate = null;
    
    if (invoice.invoice_date && invoice.invoice_date !== 'NaT') {
      invoiceDate = new Date(invoice.invoice_date);
    }
    
    if (invoice.due_date && invoice.due_date !== 'NaT') {
      dueDate = new Date(invoice.due_date);
    }
    
    // Determine status based on due date and amount due
    let status = 'pending';
    if (amountDue === 0 && total > 0) {
      status = 'paid';
    } else if (dueDate && dueDate < new Date() && amountDue > 0) {
      status = 'overdue';
    }
    
    // Categorize based on supplier name and description
    let category = 'Other';
    const description = String(invoice.line_1_desc || invoice.notes || '').toLowerCase();
    const supplier = supplierName.toLowerCase();
    
    if (supplier.includes('align') || supplier.includes('build')) {
      category = 'Construction';
    } else if (supplier.includes('power') || supplier.includes('electricity')) {
      category = 'Utilities';
    } else if (supplier.includes('taxcellent') || supplier.includes('tax')) {
      category = 'Professional Services';
    } else if (supplier.includes('consulting') || supplier.includes('tonkin')) {
      category = 'Consulting';
    } else if (description.includes('water') || description.includes('sewer')) {
      category = 'Utilities';
    } else if (description.includes('survey') || description.includes('engineering')) {
      category = 'Engineering';
    } else if (description.includes('asset') || description.includes('development')) {
      category = 'Development';
    }
    
    return {
      id: `${invoiceNumber}-${index}`,
      invoiceNumber,
      vendorName: supplierName,
      vendorEmail: String(invoice.supplier_email || ''),
      amount: total,
      amountDue: amountDue,
      issueDate: invoiceDate ? invoiceDate.toISOString() : null,
      dueDate: dueDate ? dueDate.toISOString() : null,
      status,
      description: String(invoice.line_1_desc || invoice.notes || '').substring(0, 200),
      category,
      paymentTerms: String(invoice.notes || '').includes('30') ? 'Net 30' : 
                   String(invoice.notes || '').includes('14') ? 'Net 14' : 
                   'Net 30',
      invoiceUrl: String(invoice.file_url || ''),
      receivedDate: invoiceDate ? invoiceDate.toISOString() : new Date().toISOString(),
      paidDate: status === 'paid' ? new Date().toISOString() : null,
      // Additional fields for reference
      originalData: {
        source: getSourceTab(invoice),
        supplierAbn: String(invoice.supplier_abn || ''),
        customerName: String(invoice.customer_name || ''),
        currency: String(invoice.currency || 'AUD'),
        subtotal: parseFloat(invoice.subtotal) || 0,
        gstTotal: parseFloat(invoice.gst_total) || 0
      }
    };
  }).filter(invoice => invoice.invoiceNumber !== 'UNKNOWN-0' && invoice.amount > 0);
  
  console.log(`✨ Normalized to ${normalizedInvoices.length} valid invoices\n`);
  
  // Deduplication logic
  console.log('🔍 Performing deduplication...\n');
  
  const duplicates = [];
  const unique = [];
  const seen = new Map();
  
  normalizedInvoices.forEach((invoice, index) => {
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
  
  console.log(`\n📋 Deduplication Results:`);
  console.log(`- Unique invoices: ${unique.length}`);
  console.log(`- Duplicates removed: ${duplicates.length}\n`);
  
  // Generate summary statistics
  const totalAmount = unique.reduce((sum, inv) => sum + inv.amount, 0);
  const totalAmountDue = unique.reduce((sum, inv) => sum + inv.amountDue, 0);
  const statusBreakdown = unique.reduce((acc, inv) => {
    acc[inv.status] = (acc[inv.status] || 0) + 1;
    return acc;
  }, {});
  const categoryBreakdown = unique.reduce((acc, inv) => {
    acc[inv.category] = (acc[inv.category] || 0) + 1;
    return acc;
  }, {});
  
  // Date range analysis
  const validDates = unique.filter(inv => inv.issueDate).map(inv => new Date(inv.issueDate));
  const dateRange = validDates.length > 0 ? {
    earliest: new Date(Math.min(...validDates)).toISOString().split('T')[0],
    latest: new Date(Math.max(...validDates)).toISOString().split('T')[0]
  } : null;
  
  const summary = {
    totalInvoices: unique.length,
    totalAmount: totalAmount,
    totalAmountDue: totalAmountDue,
    statusBreakdown,
    categoryBreakdown,
    dateRange,
    duplicatesRemoved: duplicates.length,
    sourceBreakdown: {
      'Xero only': unique.filter(inv => inv.originalData.source === 'Xero only').length,
      'Frank': unique.filter(inv => inv.originalData.source === 'Frank').length,
      'Taxcellent Non Xero': unique.filter(inv => inv.originalData.source === 'Taxcellent Non Xero').length
    }
  };
  
  console.log('📊 Final Data Summary:');
  console.log(`- Total invoices: ${summary.totalInvoices}`);
  console.log(`- Total amount: $${summary.totalAmount.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`);
  console.log(`- Amount due: $${summary.totalAmountDue.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`);
  console.log(`- Status breakdown:`, statusBreakdown);
  console.log(`- Category breakdown:`, categoryBreakdown);
  console.log(`- Date range: ${dateRange?.earliest} to ${dateRange?.latest}`);
  console.log(`- Source breakdown:`, summary.sourceBreakdown);
  
  return {
    invoices: unique,
    duplicates,
    summary
  };
}

function getSourceTab(invoice) {
  // Determine which tab this invoice came from based on data patterns
  if (invoice.message_id && invoice.email_from_address) {
    if (invoice.email_from_address.includes('xero') || invoice.email_from_address.includes('messaging-service')) {
      return 'Xero only';
    } else if (invoice.email_from_address.includes('frank@fbcs.com.au')) {
      return 'Frank';
    }
  }
  
  // Check supplier patterns
  if (invoice.supplier_name && invoice.supplier_name.includes('Australian Taxation Office')) {
    return 'Taxcellent Non Xero';
  }
  
  // Default fallback
  return 'Unknown';
}

// Main execution
try {
  const result = processInvoiceData();
  
  // Save consolidated data
  fs.writeFileSync('src/lib/consolidated-invoice-data.json', JSON.stringify(result.invoices, null, 2));
  fs.writeFileSync('data/consolidation-report.json', JSON.stringify({
    summary: result.summary,
    duplicates: result.duplicates
  }, null, 2));
  
  console.log('\n✅ Files created:');
  console.log('- src/lib/consolidated-invoice-data.json (for dashboard)');
  console.log('- data/consolidation-report.json (detailed report)');
  
} catch (error) {
  console.error('❌ Error processing invoice data:', error);
  process.exit(1);
}

function getSourceTab(invoice) {
  // Determine source tab based on data structure and content
  if (invoice.email_from_address) {
    if (invoice.email_from_address.includes('xero') || invoice.email_from_address.includes('messaging-service')) {
      return 'Xero only';
    } else if (invoice.email_from_address.includes('frank@fbcs.com.au')) {
      return 'Frank';
    } else if (invoice.email_from_address.includes('admin@taxcellent.com.au')) {
      return 'Taxcellent Non Xero';
    }
  }
  
  // Check supplier patterns
  const supplier = String(invoice.supplier_name || '').toLowerCase();
  if (supplier.includes('australian taxation office')) {
    return 'Taxcellent Non Xero';
  }
  
  // Check for Frank-specific patterns
  if (supplier.includes('asset point') || supplier.includes('tonkin consulting')) {
    return 'Frank';
  }
  
  // Default to Xero only for others
  return 'Xero only';
}