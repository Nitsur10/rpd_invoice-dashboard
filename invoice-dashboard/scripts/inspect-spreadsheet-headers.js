#!/usr/bin/env node

const XLSX = require('xlsx');

async function inspectSpreadsheetHeaders(filePath) {
  console.log(`🔍 Inspecting spreadsheet headers: ${filePath}\n`);
  
  try {
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    
    console.log(`📋 Found ${sheetNames.length} tabs: ${sheetNames.join(', ')}\n`);
    
    // Process each tab/sheet
    for (const sheetName of sheetNames) {
      console.log(`📄 Tab: "${sheetName}"`);
      console.log('='.repeat(50));
      
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Get raw arrays
      
      if (jsonData.length === 0) {
        console.log('   ⚠️ No data found in this tab\n');
        continue;
      }
      
      // Get headers (first row)
      const headers = jsonData[0];
      console.log(`   📊 Found ${headers.length} columns`);
      console.log(`   📄 ${jsonData.length - 1} data rows\n`);
      
      // Display all headers
      console.log('   📋 Column Headers:');
      headers.forEach((header, index) => {
        console.log(`      ${index + 1}. "${header}"`);
      });
      
      // Show a sample row if available
      if (jsonData.length > 1) {
        console.log('\n   📄 Sample Data Row:');
        const sampleRow = jsonData[1];
        headers.forEach((header, index) => {
          const value = sampleRow[index] || 'N/A';
          const displayValue = typeof value === 'string' && value.length > 30 
            ? value.substring(0, 30) + '...' 
            : value;
          console.log(`      ${header}: ${displayValue}`);
        });
      }
      
      console.log('\n');
    }
    
  } catch (error) {
    console.error('❌ Error reading spreadsheet:', error.message);
  }
}

async function main() {
  const filePath = process.argv[2] || 'data/current-invoices.xlsx';
  
  console.log('📊 Spreadsheet Header Inspector\n');
  await inspectSpreadsheetHeaders(filePath);
  
  console.log('💡 Next Steps:');
  console.log('   1. Review the column headers above');
  console.log('   2. Update the field mapping in the import script');
  console.log('   3. Run the import script again with correct mappings');
}

if (require.main === module) {
  main();
}