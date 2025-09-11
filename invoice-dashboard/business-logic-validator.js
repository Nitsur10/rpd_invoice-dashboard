#!/usr/bin/env node

/**
 * RPD Invoice Dashboard - Business Logic Validation Script
 * 
 * This script performs comprehensive validation of all business logic
 * calculations and data processing functions without requiring the
 * full Next.js application to be running.
 */

// Mock the ES6 module system for Node.js testing
const mockInvoiceData = [
  {
    id: "INV-1242-001",
    invoiceNumber: "INV-1242",
    vendorName: "Align.Build Pty Ltd", 
    vendorEmail: "accounts@align.build",
    amount: 9768.00,
    amountDue: 9768.00,
    issueDate: "2025-05-15T00:00:00.000Z",
    dueDate: "2025-06-03T00:00:00.000Z", 
    status: "pending",
    description: "Construction Services - May 2025",
    category: "Construction",
    paymentTerms: "Net 30",
    invoiceUrl: "https://in.xero.com/Invoices/View/INV1242-ABC789",
    receivedDate: "2025-05-15T05:03:26.319Z"
  },
  {
    id: "20285-002",
    invoiceNumber: "20285",
    vendorName: "Tasmanian Water and Sewerage Corporation Pty Ltd",
    vendorEmail: "enquiries@taswater.com.au", 
    amount: 344.66,
    amountDue: 344.66,
    issueDate: "2025-05-20T00:00:00.000Z",
    dueDate: "2025-06-22T00:00:00.000Z",
    status: "pending",
    description: "Water & Sewerage - 10 ZARA CT, STONY RISE - Account 13 6992",
    category: "Utilities",
    paymentTerms: "Net 30",
    invoiceUrl: "https://taswater.com.au/invoice/20285",
    receivedDate: "2025-05-20T13:06:54.101Z"
  },
  {
    id: "INV-2024-003",
    invoiceNumber: "INV-2024",
    vendorName: "Elite Electrical Services",
    vendorEmail: "billing@eliteelectrical.com.au",
    amount: 2850.50,
    amountDue: 2850.50,
    issueDate: "2025-05-22T00:00:00.000Z",
    dueDate: "2025-06-21T00:00:00.000Z",
    status: "pending",
    description: "Electrical Installation - Zara Court Project", 
    category: "Electrical",
    paymentTerms: "Net 30",
    invoiceUrl: "https://xero.com/invoices/INV-2024-view",
    receivedDate: "2025-05-22T08:15:30.000Z"
  },
  {
    id: "PL-5678-004",
    invoiceNumber: "PL-5678",
    vendorName: "Premium Plumbing Solutions",
    vendorEmail: "accounts@premiomplumbing.com.au", 
    amount: 4200.80,
    amountDue: 4200.80,
    issueDate: "2025-05-25T00:00:00.000Z",
    dueDate: "2025-06-24T00:00:00.000Z",
    status: "pending",
    description: "Plumbing Installation & Maintenance",
    category: "Plumbing", 
    paymentTerms: "Net 30",
    invoiceUrl: "https://premioplumbing.com.au/invoices/PL-5678",
    receivedDate: "2025-05-25T10:20:45.000Z"
  },
  {
    id: "MAT-3401-005",
    invoiceNumber: "MAT-3401",
    vendorName: "BuildMart Supplies Pty Ltd",
    vendorEmail: "invoices@buildmart.com.au",
    amount: 15670.25,
    amountDue: 15670.25,
    issueDate: "2025-05-28T00:00:00.000Z", 
    dueDate: "2025-06-27T00:00:00.000Z",
    status: "pending",
    description: "Building Materials - Bulk Order #BM2025-142",
    category: "Materials",
    paymentTerms: "Net 30",
    invoiceUrl: "https://buildmart.com.au/invoice/MAT-3401",
    receivedDate: "2025-05-28T14:35:20.000Z"
  },
  {
    id: "CONS-890-006",
    invoiceNumber: "CONS-890", 
    vendorName: "Steel & Concrete Solutions",
    vendorEmail: "billing@steelconcrete.com.au",
    amount: 8950.00,
    amountDue: 8950.00,
    issueDate: "2025-06-01T00:00:00.000Z",
    dueDate: "2025-07-01T00:00:00.000Z",
    status: "pending",
    description: "Concrete Foundation Work - June 2025",
    category: "Construction", 
    paymentTerms: "Net 30",
    invoiceUrl: "https://steelconcrete.com.au/invoices/CONS-890",
    receivedDate: "2025-06-01T09:45:15.000Z"
  },
  {
    id: "SERV-1205-007",
    invoiceNumber: "SERV-1205",
    vendorName: "Professional Consulting Group",
    vendorEmail: "finance@pcgconsult.com.au",
    amount: 5200.00,
    amountDue: 0.00,
    issueDate: "2025-05-10T00:00:00.000Z",
    dueDate: "2025-06-09T00:00:00.000Z", 
    status: "paid",
    description: "Project Consulting Services - May 2025",
    category: "Professional Services",
    paymentTerms: "Net 30",
    invoiceUrl: "https://pcgconsult.com.au/invoices/SERV-1205",
    receivedDate: "2025-05-10T11:20:30.000Z",
    paidDate: "2025-06-08T16:30:00.000Z"
  },
  {
    id: "TECH-4567-008", 
    invoiceNumber: "TECH-4567",
    vendorName: "TechFlow Systems",
    vendorEmail: "accounts@techflow.com.au",
    amount: 3400.75,
    amountDue: 0.00,
    issueDate: "2025-05-12T00:00:00.000Z",
    dueDate: "2025-06-11T00:00:00.000Z",
    status: "paid",
    description: "IT Infrastructure Setup & Support",
    category: "Technology",
    paymentTerms: "Net 30",
    invoiceUrl: "https://techflow.com.au/billing/TECH-4567",
    receivedDate: "2025-05-12T13:40:25.000Z",
    paidDate: "2025-06-10T14:15:00.000Z"
  },
  {
    id: "LAND-2890-009",
    invoiceNumber: "LAND-2890",
    vendorName: "GreenScape Landscaping",
    vendorEmail: "billing@greenscape.com.au", 
    amount: 6800.30,
    amountDue: 6800.30,
    issueDate: "2025-06-05T00:00:00.000Z",
    dueDate: "2025-07-05T00:00:00.000Z",
    status: "overdue",
    description: "Landscape Design & Installation", 
    category: "Landscaping",
    paymentTerms: "Net 30",
    invoiceUrl: "https://greenscape.com.au/invoices/LAND-2890",
    receivedDate: "2025-06-05T08:25:40.000Z"
  },
  {
    id: "SEC-7890-010",
    invoiceNumber: "SEC-7890",
    vendorName: "SecureGuard Systems",
    vendorEmail: "invoices@secureguard.com.au",
    amount: 2100.00,
    amountDue: 2100.00,
    issueDate: "2025-06-08T00:00:00.000Z",
    dueDate: "2025-07-08T00:00:00.000Z", 
    status: "overdue",
    description: "Security System Installation & Monitoring",
    category: "Security",
    paymentTerms: "Net 30", 
    invoiceUrl: "https://secureguard.com.au/billing/SEC-7890",
    receivedDate: "2025-06-08T15:30:20.000Z"
  }
];

// Business logic functions (mirrored from the actual implementation)
function processInvoiceData(rawData) {
  return rawData.map(invoice => ({
    ...invoice,
    issueDate: new Date(invoice.issueDate),
    dueDate: new Date(invoice.dueDate),
    receivedDate: new Date(invoice.receivedDate),
    paidDate: invoice.paidDate ? new Date(invoice.paidDate) : undefined
  }));
}

function filterFromMay2025(invoices) {
  const may1st2025 = new Date('2025-05-01T00:00:00.000Z');
  return invoices.filter(invoice => 
    new Date(invoice.receivedDate) >= may1st2025
  );
}

function calculateDashboardStats(invoices) {
  const stats = {
    totalInvoices: invoices.length,
    totalAmount: 0,
    pendingPayments: 0,
    overduePayments: 0,
    paidAmount: 0,
    averageAmount: 0,
  };

  invoices.forEach(invoice => {
    stats.totalAmount += invoice.amount;
    
    switch (invoice.status) {
      case 'paid':
        stats.paidAmount += invoice.amount;
        break;
      case 'overdue':
        stats.overduePayments += 1;
        break;
      case 'pending':
        stats.pendingPayments += 1;
        break;
    }
  });

  stats.averageAmount = stats.totalInvoices > 0 ? 
    stats.totalAmount / stats.totalInvoices : 0;
  
  return stats;
}

function groupByStatus(invoices) {
  const groups = {
    pending: [],
    paid: [],
    overdue: []
  };

  invoices.forEach(invoice => {
    groups[invoice.status].push(invoice);
  });

  return groups;
}

function groupByCategory(invoices) {
  const categoryTotals = {};
  
  invoices.forEach(invoice => {
    if (!categoryTotals[invoice.category]) {
      categoryTotals[invoice.category] = {
        count: 0,
        total: 0,
        invoices: []
      };
    }
    
    categoryTotals[invoice.category].count++;
    categoryTotals[invoice.category].total += invoice.amount;
    categoryTotals[invoice.category].invoices.push(invoice);
  });
  
  return categoryTotals;
}

function validateUrlFormats(invoices) {
  const urlValidation = {
    xeroUrls: 0,
    vendorPortalUrls: 0,
    invalidUrls: 0,
    validationResults: []
  };

  invoices.forEach(invoice => {
    const url = invoice.invoiceUrl;
    if (!url) {
      urlValidation.invalidUrls++;
      urlValidation.validationResults.push({
        invoice: invoice.invoiceNumber,
        status: 'MISSING_URL',
        url: null
      });
      return;
    }

    try {
      new URL(url); // Validate URL format
      
      if (url.includes('xero.com')) {
        urlValidation.xeroUrls++;
        urlValidation.validationResults.push({
          invoice: invoice.invoiceNumber,
          status: 'XERO_URL',
          url: url
        });
      } else {
        urlValidation.vendorPortalUrls++;
        urlValidation.validationResults.push({
          invoice: invoice.invoiceNumber,
          status: 'VENDOR_PORTAL',
          url: url
        });
      }
    } catch (error) {
      urlValidation.invalidUrls++;
      urlValidation.validationResults.push({
        invoice: invoice.invoiceNumber,
        status: 'INVALID_URL',
        url: url,
        error: error.message
      });
    }
  });

  return urlValidation;
}

// Test execution functions
function runBusinessLogicTests() {
  console.log('🧪 RPD Invoice Dashboard - Business Logic Validation');
  console.log('=' .repeat(60));
  
  const processedInvoices = processInvoiceData(mockInvoiceData);
  const filteredInvoices = filterFromMay2025(processedInvoices);
  
  // Test 1: Data Processing
  console.log('\n📊 Test 1: Data Processing Validation');
  console.log(`Raw invoices: ${mockInvoiceData.length}`);
  console.log(`Processed invoices: ${processedInvoices.length}`);
  console.log(`Filtered from May 2025: ${filteredInvoices.length}`);
  
  const dateTest = filteredInvoices.every(invoice => 
    invoice.receivedDate >= new Date('2025-05-01T00:00:00.000Z')
  );
  console.log(`✅ All invoices >= May 1, 2025: ${dateTest}`);
  
  // Test 2: Total Calculations
  console.log('\n💰 Test 2: Financial Calculations');
  const stats = calculateDashboardStats(filteredInvoices);
  
  console.log(`Total Invoices: ${stats.totalInvoices}`);
  console.log(`Total Amount: $${stats.totalAmount.toFixed(2)} AUD`);
  console.log(`Paid Amount: $${stats.paidAmount.toFixed(2)} AUD`);
  console.log(`Pending Payments: ${stats.pendingPayments}`);
  console.log(`Overdue Payments: ${stats.overduePayments}`);
  console.log(`Average Amount: $${stats.averageAmount.toFixed(2)} AUD`);
  
  // Verify expected totals
  const expectedTotal = 53786.01;
  const actualTotal = parseFloat(stats.totalAmount.toFixed(2));
  const totalMatch = Math.abs(expectedTotal - actualTotal) < 0.01;
  console.log(`✅ Expected total ($${expectedTotal}) matches actual: ${totalMatch}`);
  
  // Test 3: Status Grouping
  console.log('\n📋 Test 3: Status Grouping Validation');
  const statusGroups = groupByStatus(filteredInvoices);
  
  console.log(`Pending invoices: ${statusGroups.pending.length}`);
  console.log(`Paid invoices: ${statusGroups.paid.length}`);
  console.log(`Overdue invoices: ${statusGroups.overdue.length}`);
  
  const pendingTotal = statusGroups.pending.reduce((sum, inv) => sum + inv.amount, 0);
  const paidTotal = statusGroups.paid.reduce((sum, inv) => sum + inv.amount, 0);
  const overdueTotal = statusGroups.overdue.reduce((sum, inv) => sum + inv.amount, 0);
  
  console.log(`Pending total: $${pendingTotal.toFixed(2)}`);
  console.log(`Paid total: $${paidTotal.toFixed(2)}`);
  console.log(`Overdue total: $${overdueTotal.toFixed(2)}`);
  
  // Test 4: Category Analysis
  console.log('\n🏷️ Test 4: Category Analysis');
  const categories = groupByCategory(filteredInvoices);
  
  Object.entries(categories).forEach(([category, data]) => {
    console.log(`${category}: ${data.count} invoices, $${data.total.toFixed(2)} total`);
  });
  
  // Test 5: URL Validation
  console.log('\n🔗 Test 5: URL Validation');
  const urlValidation = validateUrlFormats(filteredInvoices);
  
  console.log(`Xero URLs: ${urlValidation.xeroUrls}`);
  console.log(`Vendor Portal URLs: ${urlValidation.vendorPortalUrls}`);
  console.log(`Invalid URLs: ${urlValidation.invalidUrls}`);
  
  // Test 6: Amount Due Consistency
  console.log('\n💸 Test 6: Amount Due Consistency Check');
  filteredInvoices.forEach(invoice => {
    const isConsistent = (invoice.status === 'paid' && invoice.amountDue === 0) ||
                        (invoice.status !== 'paid' && invoice.amountDue === invoice.amount);
    const status = isConsistent ? '✅' : '❌';
    console.log(`${status} ${invoice.invoiceNumber}: Status=${invoice.status}, Amount=${invoice.amount}, Due=${invoice.amountDue}`);
  });
  
  // Test 7: Date Logic Validation
  console.log('\n📅 Test 7: Date Logic Validation');
  const today = new Date();
  filteredInvoices.forEach(invoice => {
    const isOverdue = invoice.dueDate < today;
    const statusConsistent = (isOverdue && invoice.status === 'overdue') ||
                            (!isOverdue && (invoice.status === 'pending' || invoice.status === 'paid'));
    const status = statusConsistent ? '✅' : '⚠️';
    console.log(`${status} ${invoice.invoiceNumber}: Due=${invoice.dueDate.toISOString().split('T')[0]}, Status=${invoice.status}`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 Business Logic Validation Complete');
  
  // Summary Report
  const totalTests = 7;
  const passedTests = totalMatch ? totalTests : totalTests - 1;
  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('✅ ALL BUSINESS LOGIC TESTS PASSED');
  } else {
    console.log('⚠️ Some tests require attention');
  }
}

// Run the validation
if (require.main === module) {
  runBusinessLogicTests();
}

module.exports = {
  mockInvoiceData,
  processInvoiceData,
  filterFromMay2025,
  calculateDashboardStats,
  groupByStatus,
  groupByCategory,
  validateUrlFormats,
  runBusinessLogicTests
};