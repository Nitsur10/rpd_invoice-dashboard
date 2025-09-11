#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testTableExists() {
  console.log('🔍 Testing if Invoice table exists...');
  
  try {
    // Try to query the table to see if it exists
    const { data, error } = await supabase
      .from('Invoice')
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST106' || error.message.includes('not exist')) {
        console.log('❌ Invoice table does not exist');
        return false;
      } else {
        console.error('❌ Unexpected error:', error);
        return false;
      }
    }
    
    console.log('✅ Invoice table exists and is accessible');
    return true;
    
  } catch (error) {
    console.error('❌ Error testing table:', error);
    return false;
  }
}

async function createDummyInvoice() {
  console.log('🧪 Testing table by inserting dummy invoice...');
  
  const dummyInvoice = {
    invoice_number: 'TEST-001',
    supplier_name: 'Test Supplier',
    total: 100.00,
    currency: 'AUD',
    source: 'test_tab',
    created_at: new Date().toISOString()
  };
  
  try {
    const { data, error } = await supabase
      .from('Invoice')
      .insert([dummyInvoice])
      .select();
    
    if (error) {
      console.error('❌ Error inserting test invoice:', error);
      return false;
    }
    
    console.log('✅ Successfully inserted test invoice:', data[0]?.invoice_number);
    
    // Clean up - delete the test invoice
    await supabase
      .from('Invoice')
      .delete()
      .eq('invoice_number', 'TEST-001');
    
    console.log('🗑️ Cleaned up test invoice');
    return true;
    
  } catch (error) {
    console.error('❌ Error in dummy invoice test:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Testing Supabase Invoice Table...\n');
  console.log(`🔗 Supabase URL: ${supabaseUrl}\n`);
  
  // Test if table exists
  const tableExists = await testTableExists();
  
  if (!tableExists) {
    console.log('\n📋 TABLE CREATION REQUIRED');
    console.log('Please follow these steps:');
    console.log('1. Go to: https://auvyyrfbmlfsmmpjnaoc.supabase.co');
    console.log('2. Click "SQL Editor" in the sidebar');
    console.log('3. Copy the SQL from MANUAL_SCHEMA_SETUP.md');
    console.log('4. Run the SQL in the editor');
    console.log('5. Come back and run this script again');
    process.exit(1);
  }
  
  // Test insert operation
  const insertWorks = await createDummyInvoice();
  
  if (!insertWorks) {
    console.log('\n❌ Table exists but insert failed');
    console.log('Check the table structure and permissions');
    process.exit(1);
  }
  
  console.log('\n🎉 Invoice table is ready for data import!');
  console.log('You can now run: node scripts/import-invoices-from-spreadsheet.js');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { testTableExists, createDummyInvoice };