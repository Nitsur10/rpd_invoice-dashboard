#!/usr/bin/env node

/**
 * RPD Invoice Dashboard - Performance & Workflow Testing
 * 
 * This script simulates user workflows and measures performance
 * characteristics of core dashboard functionality.
 */

const { performance } = require('perf_hooks');

// Simulate large dataset for performance testing
function generateLargeInvoiceDataset(count = 1000) {
  const vendors = [
    "BuildCorp Pty Ltd", "Construction Plus", "Elite Electrical", "Premium Plumbing",
    "Steel Solutions", "Concrete Kings", "Material Suppliers", "Tech Services",
    "Professional Consulting", "Security Systems", "Landscape Design", "Utility Corp"
  ];
  
  const categories = [
    "Construction", "Electrical", "Plumbing", "Materials", "Technology", 
    "Professional Services", "Security", "Landscaping", "Utilities"
  ];
  
  const statuses = ["pending", "paid", "overdue"];
  
  const dataset = [];
  
  for (let i = 1; i <= count; i++) {
    const vendor = vendors[Math.floor(Math.random() * vendors.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const amount = parseFloat((Math.random() * 50000 + 100).toFixed(2));
    
    const issueDate = new Date(2025, 4 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 28) + 1);
    const dueDate = new Date(issueDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days later
    
    dataset.push({
      id: `INV-${String(i).padStart(4, '0')}`,
      invoiceNumber: `INV-${String(i).padStart(4, '0')}`,
      vendorName: vendor,
      vendorEmail: `billing@${vendor.toLowerCase().replace(/[^a-z]/g, '')}.com.au`,
      amount: amount,
      amountDue: status === 'paid' ? 0 : amount,
      issueDate: issueDate,
      dueDate: dueDate,
      receivedDate: new Date(issueDate.getTime() + (Math.random() * 2 * 24 * 60 * 60 * 1000)),
      status: status,
      description: `${category} services for project ${i}`,
      category: category,
      paymentTerms: "Net 30",
      invoiceUrl: `https://vendor.com/invoice/INV-${String(i).padStart(4, '0')}`,
      paidDate: status === 'paid' ? new Date() : undefined
    });
  }
  
  return dataset;
}

// Simulate table filtering operations
function simulateTableFiltering(dataset, filters = {}) {
  const startTime = performance.now();
  
  let filteredData = dataset;
  
  // Date range filtering
  if (filters.startDate) {
    filteredData = filteredData.filter(invoice => 
      invoice.receivedDate >= filters.startDate
    );
  }
  
  if (filters.endDate) {
    filteredData = filteredData.filter(invoice => 
      invoice.receivedDate <= filters.endDate
    );
  }
  
  // Status filtering
  if (filters.status && filters.status.length > 0) {
    filteredData = filteredData.filter(invoice => 
      filters.status.includes(invoice.status)
    );
  }
  
  // Vendor search
  if (filters.vendorSearch) {
    filteredData = filteredData.filter(invoice => 
      invoice.vendorName.toLowerCase().includes(filters.vendorSearch.toLowerCase())
    );
  }
  
  // Category filtering
  if (filters.category && filters.category.length > 0) {
    filteredData = filteredData.filter(invoice => 
      filters.category.includes(invoice.category)
    );
  }
  
  // Amount range filtering
  if (filters.amountMin !== undefined) {
    filteredData = filteredData.filter(invoice => 
      invoice.amount >= filters.amountMin
    );
  }
  
  if (filters.amountMax !== undefined) {
    filteredData = filteredData.filter(invoice => 
      invoice.amount <= filters.amountMax
    );
  }
  
  const endTime = performance.now();
  
  return {
    filteredData,
    filterTime: endTime - startTime,
    resultCount: filteredData.length
  };
}

// Simulate table sorting operations
function simulateTableSorting(dataset, sortBy = 'amount', direction = 'desc') {
  const startTime = performance.now();
  
  const sortedData = [...dataset].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // Handle different data types
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue instanceof Date) {
      aValue = aValue.getTime();
      bValue = bValue.getTime();
    }
    
    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return direction === 'asc' ? comparison : -comparison;
  });
  
  const endTime = performance.now();
  
  return {
    sortedData,
    sortTime: endTime - startTime
  };
}

// Simulate pagination operations
function simulatePagination(dataset, page = 1, pageSize = 20) {
  const startTime = performance.now();
  
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = dataset.slice(startIndex, endIndex);
  
  const totalPages = Math.ceil(dataset.length / pageSize);
  
  const endTime = performance.now();
  
  return {
    paginatedData,
    paginationTime: endTime - startTime,
    currentPage: page,
    totalPages,
    totalItems: dataset.length
  };
}

// Simulate CSV export generation
function simulateCSVExport(dataset) {
  const startTime = performance.now();
  
  const headers = [
    'Invoice Number', 'Vendor Name', 'Amount', 'Amount Due', 
    'Issue Date', 'Due Date', 'Status', 'Category', 'Description'
  ];
  
  let csvContent = headers.join(',') + '\\n';
  
  dataset.forEach(invoice => {
    const row = [
      invoice.invoiceNumber,
      `"${invoice.vendorName}"`,
      invoice.amount.toFixed(2),
      invoice.amountDue.toFixed(2),
      invoice.issueDate.toISOString().split('T')[0],
      invoice.dueDate.toISOString().split('T')[0],
      invoice.status,
      invoice.category,
      `"${invoice.description}"`
    ];
    csvContent += row.join(',') + '\\n';
  });
  
  const endTime = performance.now();
  
  return {
    csvContent,
    exportTime: endTime - startTime,
    sizeKB: (csvContent.length / 1024).toFixed(2)
  };
}

// Memory usage monitoring
function measureMemoryUsage(operationName, operation) {
  if (typeof global.gc !== 'undefined') {
    global.gc(); // Force garbage collection if available
  }
  
  const memBefore = process.memoryUsage();
  const result = operation();
  const memAfter = process.memoryUsage();
  
  return {
    result,
    memoryUsage: {
      heapUsedDiff: (memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024, // MB
      heapTotalDiff: (memAfter.heapTotal - memBefore.heapTotal) / 1024 / 1024, // MB
      rssUsed: memAfter.rss / 1024 / 1024, // MB
      operationName
    }
  };
}

// Complete workflow simulation
function simulateCompleteUserWorkflow() {
  console.log('🚀 RPD Invoice Dashboard - Performance & Workflow Testing');
  console.log('=' .repeat(70));
  
  // Generate test datasets of varying sizes
  const datasets = {
    small: generateLargeInvoiceDataset(10),
    medium: generateLargeInvoiceDataset(100),
    large: generateLargeInvoiceDataset(1000),
    xlarge: generateLargeInvoiceDataset(5000)
  };
  
  console.log('\\n📊 Dataset Generation Complete');
  Object.entries(datasets).forEach(([size, data]) => {
    console.log(`${size.toUpperCase()}: ${data.length} invoices`);
  });
  
  // Test 1: Basic Operations Performance
  console.log('\\n⚡ Test 1: Basic Operations Performance');
  console.log('-'.repeat(50));
  
  Object.entries(datasets).forEach(([size, data]) => {
    console.log(`\\n${size.toUpperCase()} dataset (${data.length} invoices):`);
    
    // Filtering performance
    const filterTest = simulateTableFiltering(data, {
      status: ['pending'],
      vendorSearch: 'Build',
      amountMin: 1000
    });
    console.log(`  Filter: ${filterTest.filterTime.toFixed(2)}ms (${filterTest.resultCount} results)`);
    
    // Sorting performance
    const sortTest = simulateTableSorting(data, 'amount', 'desc');
    console.log(`  Sort: ${sortTest.sortTime.toFixed(2)}ms`);
    
    // Pagination performance
    const paginationTest = simulatePagination(data, 1, 20);
    console.log(`  Pagination: ${paginationTest.paginationTime.toFixed(2)}ms`);
    
    // CSV Export performance
    const exportTest = simulateCSVExport(data);
    console.log(`  CSV Export: ${exportTest.exportTime.toFixed(2)}ms (${exportTest.sizeKB}KB)`);
  });
  
  // Test 2: Complex Filter Combinations
  console.log('\\n🔍 Test 2: Complex Filter Combinations');
  console.log('-'.repeat(50));
  
  const complexFilters = [
    {
      name: 'Date Range + Status',
      filter: {
        startDate: new Date('2025-05-15'),
        endDate: new Date('2025-06-15'),
        status: ['pending', 'overdue']
      }
    },
    {
      name: 'Vendor Search + Amount Range',
      filter: {
        vendorSearch: 'Construction',
        amountMin: 5000,
        amountMax: 20000
      }
    },
    {
      name: 'Multi-Category + Status',
      filter: {
        category: ['Construction', 'Materials', 'Electrical'],
        status: ['pending']
      }
    }
  ];
  
  complexFilters.forEach(({ name, filter }) => {
    console.log(`\\n${name}:`);
    const result = simulateTableFiltering(datasets.large, filter);
    console.log(`  Time: ${result.filterTime.toFixed(2)}ms`);
    console.log(`  Results: ${result.resultCount}/${datasets.large.length} invoices`);
  });
  
  // Test 3: Memory Usage Analysis
  console.log('\\n💾 Test 3: Memory Usage Analysis');
  console.log('-'.repeat(50));
  
  const memoryTests = [
    {
      name: 'Large Dataset Filtering',
      operation: () => simulateTableFiltering(datasets.xlarge, { status: ['pending'] })
    },
    {
      name: 'Large Dataset Sorting',
      operation: () => simulateTableSorting(datasets.xlarge, 'amount')
    },
    {
      name: 'CSV Export Generation',
      operation: () => simulateCSVExport(datasets.large)
    }
  ];
  
  memoryTests.forEach(({ name, operation }) => {
    const { result, memoryUsage } = measureMemoryUsage(name, operation);
    console.log(`\\n${name}:`);
    console.log(`  Heap Used: ${memoryUsage.heapUsedDiff.toFixed(2)}MB`);
    console.log(`  Total RSS: ${memoryUsage.rssUsed.toFixed(2)}MB`);
  });
  
  // Test 4: User Journey Simulation
  console.log('\\n👤 Test 4: Complete User Journey Simulation');
  console.log('-'.repeat(50));
  
  const journeyStartTime = performance.now();
  
  console.log('\\n📱 Mobile User Journey (375px viewport):');
  console.log('  1. Landing page load: ✅ (simulated)');
  console.log('  2. Navigate to invoices: ✅ (simulated)');
  
  // Simulate mobile filtering (smaller dataset)
  const mobileFilter = simulateTableFiltering(datasets.medium, { status: ['overdue'] });
  console.log(`  3. Apply status filter: ${mobileFilter.filterTime.toFixed(2)}ms`);
  
  // Simulate touch-friendly pagination
  const mobilePagination = simulatePagination(mobileFilter.filteredData, 1, 10);
  console.log(`  4. Mobile pagination: ${mobilePagination.paginationTime.toFixed(2)}ms`);
  
  console.log('\\n💻 Desktop User Journey (1920px viewport):');
  console.log('  1. Dashboard overview: ✅ (simulated)');
  
  // Simulate complex desktop workflow
  const desktopFilter = simulateTableFiltering(datasets.large, {
    vendorSearch: 'Construction',
    amountMin: 5000,
    status: ['pending']
  });
  console.log(`  2. Complex filtering: ${desktopFilter.filterTime.toFixed(2)}ms`);
  
  const desktopSort = simulateTableSorting(desktopFilter.filteredData, 'dueDate');
  console.log(`  3. Sort by due date: ${desktopSort.sortTime.toFixed(2)}ms`);
  
  const desktopExport = simulateCSVExport(desktopSort.sortedData);
  console.log(`  4. Export filtered data: ${desktopExport.exportTime.toFixed(2)}ms`);
  
  const journeyEndTime = performance.now();
  const totalJourneyTime = journeyEndTime - journeyStartTime;
  
  console.log(`\\n⏱️ Total User Journey Time: ${totalJourneyTime.toFixed(2)}ms`);
  
  // Test 5: Performance Benchmarks
  console.log('\\n🎯 Test 5: Performance Benchmark Assessment');
  console.log('-'.repeat(50));
  
  const benchmarks = {
    'Filter Response Time': { target: 500, actual: mobileFilter.filterTime },
    'Sort Response Time': { target: 1000, actual: desktopSort.sortTime },
    'CSV Export Time': { target: 2000, actual: desktopExport.exportTime },
    'Pagination Response': { target: 100, actual: mobilePagination.paginationTime }
  };
  
  console.log('\\nBenchmark Results:');
  Object.entries(benchmarks).forEach(([test, { target, actual }]) => {
    const status = actual <= target ? '✅' : '⚠️';
    const performance = ((target - actual) / target * 100).toFixed(1);
    console.log(`  ${status} ${test}: ${actual.toFixed(2)}ms (target: ${target}ms, ${performance}% ${actual <= target ? 'under' : 'over'})`);
  });
  
  // Test 6: Responsiveness Simulation
  console.log('\\n📱 Test 6: Responsive Design Simulation');
  console.log('-'.repeat(50));
  
  const viewports = [
    { name: 'Mobile Portrait', width: 375, elements: 'Single column, stacked filters' },
    { name: 'Mobile Landscape', width: 667, elements: 'Two-column layout, compact table' },
    { name: 'Tablet Portrait', width: 768, elements: 'Sidebar navigation, expandable filters' },
    { name: 'Desktop Small', width: 1024, elements: 'Full table view, side-by-side panels' },
    { name: 'Desktop Large', width: 1920, elements: 'Wide table, expanded detail panels' }
  ];
  
  viewports.forEach(({ name, width, elements }) => {
    // Simulate different pagination sizes for different viewports
    const pageSize = width < 768 ? 5 : width < 1024 ? 10 : 20;
    const viewportTest = simulatePagination(datasets.medium, 1, pageSize);
    
    console.log(`\\n${name} (${width}px):`);
    console.log(`  Layout: ${elements}`);
    console.log(`  Page Size: ${pageSize} items`);
    console.log(`  Render Time: ${viewportTest.paginationTime.toFixed(2)}ms`);
  });
  
  console.log('\\n' + '='.repeat(70));
  console.log('🎯 Performance & Workflow Testing Complete');
  
  // Final Assessment
  const passedBenchmarks = Object.values(benchmarks).filter(({ target, actual }) => actual <= target).length;
  const totalBenchmarks = Object.keys(benchmarks).length;
  
  console.log(`\\n📊 Performance Assessment:`);
  console.log(`  Benchmarks Passed: ${passedBenchmarks}/${totalBenchmarks}`);
  console.log(`  Overall Status: ${passedBenchmarks === totalBenchmarks ? '✅ EXCELLENT' : passedBenchmarks >= totalBenchmarks * 0.75 ? '✅ GOOD' : '⚠️ NEEDS OPTIMIZATION'}`);
  
  // Recommendations
  console.log(`\\n💡 Performance Recommendations:`);
  console.log(`  • Implement virtual scrolling for large datasets (>1000 items)`);
  console.log(`  • Add debounced search for real-time filtering`);
  console.log(`  • Consider server-side pagination for production`);
  console.log(`  • Implement progressive loading for mobile devices`);
  console.log(`  • Add loading states for all async operations`);
}

// Error boundary simulation
function simulateErrorScenarios() {
  console.log('\\n🚨 Error Scenario Testing');
  console.log('-'.repeat(50));
  
  const errorScenarios = [
    {
      name: 'Empty Dataset',
      test: () => simulateTableFiltering([], { status: ['pending'] })
    },
    {
      name: 'Invalid Date Range',
      test: () => simulateTableFiltering(datasets.small, { 
        startDate: new Date('2025-12-01'), 
        endDate: new Date('2025-01-01') 
      })
    },
    {
      name: 'Large Export Operation',
      test: () => simulateCSVExport(generateLargeInvoiceDataset(10000))
    }
  ];
  
  errorScenarios.forEach(({ name, test }) => {
    try {
      const result = test();
      console.log(`  ✅ ${name}: Handled gracefully`);
    } catch (error) {
      console.log(`  ❌ ${name}: Error occurred - ${error.message}`);
    }
  });
}

// Run all tests
if (require.main === module) {
  simulateCompleteUserWorkflow();
  simulateErrorScenarios();
}

module.exports = {
  generateLargeInvoiceDataset,
  simulateTableFiltering,
  simulateTableSorting,
  simulatePagination,
  simulateCSVExport,
  measureMemoryUsage,
  simulateCompleteUserWorkflow
};