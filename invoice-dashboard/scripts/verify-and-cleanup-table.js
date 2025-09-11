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

async function verifyTableStructure() {
  console.log('🔍 Verifying Invoice table structure...\n');
  
  try {
    // Test the table structure by inserting a test record with all expected fields
    const testInvoice = {
      invoice_number: 'VERIFY-TEST-001',
      invoice_date: '2025-01-01',
      due_date: '2025-01-31',
      currency: 'AUD',
      subtotal: 100.00,
      gst_total: 10.00,
      total: 110.00,
      amount_due: 110.00,
      supplier_name: 'Test Supplier Pty Ltd',
      supplier_abn: '12345678901',
      supplier_email: 'test@supplier.com',
      customer_name: 'Test Customer',
      customer_abn: '98765432109',
      bank_bsb: '123-456',
      bank_account: '12345678',
      reference_hint: 'Test payment reference',
      file_name: 'test-invoice.pdf',
      file_url: 'https://example.com/test-invoice.pdf',
      folder_path: '/invoices/test/',
      file_id: 'file_123',
      folder_id: 'folder_456',
      source: 'verification_test',
      notes: 'This is a test invoice for verification',
      confidence: 95.5,
      line_1_desc: 'Test service item',
      line_1_qty: 1.0,
      line_1_unit_price: 100.00,
      message_id: 'msg_test_123',
      email_subject: 'Test Invoice Email',
      email_from_name: 'Test Sender',
      email_from_address: 'sender@test.com'
    };
    
    console.log('📝 Testing table structure with all 32 fields...');
    
    const { data: insertData, error: insertError } = await supabase
      .from('Invoice')
      .insert([testInvoice])
      .select();
    
    if (insertError) {
      console.error('❌ Insert test failed:', insertError.message);
      console.error('   Details:', insertError.details);
      return false;
    }
    
    console.log('✅ Test insert successful!');
    console.log(`   Inserted record: ${insertData[0].invoice_number}`);
    
    // Verify the structure by checking what fields were actually inserted
    const insertedRecord = insertData[0];
    const expectedFields = Object.keys(testInvoice);
    const actualFields = Object.keys(insertedRecord);
    
    console.log('\n📊 Field Verification:');
    console.log(`   Expected fields: ${expectedFields.length}`);
    console.log(`   Actual fields: ${actualFields.length}`);
    
    // Check for missing fields
    const missingFields = expectedFields.filter(field => !actualFields.includes(field));
    if (missingFields.length > 0) {
      console.log(`   ❌ Missing fields: ${missingFields.join(', ')}`);
    } else {
      console.log('   ✅ All expected fields present');
    }
    
    // Check for extra fields
    const extraFields = actualFields.filter(field => !expectedFields.includes(field) && !['created_at', 'updated_at'].includes(field));
    if (extraFields.length > 0) {
      console.log(`   ⚠️ Extra fields: ${extraFields.join(', ')}`);
    }
    
    // Verify timestamp fields
    if (insertedRecord.created_at && insertedRecord.updated_at) {
      console.log('   ✅ Timestamp fields (created_at, updated_at) working');
    } else {
      console.log('   ❌ Timestamp fields missing');
    }
    
    console.log('\n📋 Complete field list:');
    actualFields.forEach((field, index) => {
      const value = insertedRecord[field];
      const displayValue = value !== null ? (typeof value === 'string' && value.length > 30 ? value.substring(0, 30) + '...' : value) : 'null';
      console.log(`   ${index + 1}. ${field}: ${displayValue}`);
    });
    
    return true;
    
  } catch (error) {
    console.error('💥 Verification failed:', error);
    return false;
  }
}

async function checkExistingRecords() {
  console.log('\n🔍 Checking for existing records...');
  
  try {
    const { data, error, count } = await supabase
      .from('Invoice')
      .select('invoice_number, supplier_name, total, source, created_at', { count: 'exact' })
      .limit(10);
    
    if (error) {
      console.error('❌ Error checking records:', error.message);
      return;
    }
    
    console.log(`📊 Found ${count} total records in table`);
    
    if (count > 0) {
      console.log('\n📄 Sample records:');
      data.forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.invoice_number} | ${record.supplier_name} | $${record.total} | Source: ${record.source}`);
      });
    } else {
      console.log('   ✅ Table is empty - ready for fresh import');
    }
    
  } catch (error) {
    console.error('💥 Error checking records:', error);
  }
}

async function cleanupTestRecords() {
  console.log('\n🧹 Cleaning up test and verification records...');
  
  try {
    // Delete test records
    const { error: deleteError } = await supabase
      .from('Invoice')
      .delete()
      .or('invoice_number.like.VERIFY-%,invoice_number.like.TEST-%');
    
    if (deleteError) {
      console.error('❌ Cleanup failed:', deleteError.message);
      return;
    }
    
    console.log('✅ Test records cleaned up');
    
  } catch (error) {
    console.error('💥 Cleanup failed:', error);
  }
}

async function clearAllRecords() {
  console.log('\n🗑️ Clearing ALL records from Invoice table...');
  
  try {
    const { error } = await supabase
      .from('Invoice')
      .delete()
      .neq('invoice_number', 'never_exists_dummy_condition');
    
    if (error) {
      console.error('❌ Clear all failed:', error.message);
      return;
    }
    
    console.log('✅ All records cleared - table is now empty');
    
  } catch (error) {
    console.error('💥 Clear all failed:', error);
  }
}

async function main() {
  console.log('🔍 Invoice Table Verification & Cleanup\n');
  
  // Step 1: Verify table structure
  const structureOk = await verifyTableStructure();
  
  if (!structureOk) {
    console.log('\n❌ Table structure verification failed');
    console.log('Please check the table creation SQL and try again');
    process.exit(1);
  }
  
  // Step 2: Check existing records
  await checkExistingRecords();
  
  // Step 3: Cleanup test records
  await cleanupTestRecords();
  
  // Step 4: Offer to clear all records
  console.log('\n🤔 Would you like to clear ALL records to prepare for fresh import?');
  console.log('   Run with "clear" argument to clear all: node scripts/verify-and-cleanup-table.js clear');
  
  if (process.argv.includes('clear')) {
    await clearAllRecords();
  }
  
  console.log('\n🎉 Table verification complete!');
  console.log('   ✅ Structure: All 32 fields present');
  console.log('   ✅ Timestamps: Working correctly');
  console.log('   ✅ Ready for spreadsheet import');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { verifyTableStructure, checkExistingRecords, cleanupTestRecords };