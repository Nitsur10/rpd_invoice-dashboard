// Test all Supabase connections
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://auvyyrfbmlfsmmpjnaoc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dnl5cmZibWxmc21tcGpuYW9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY3OTQzOSwiZXhwIjoyMDcxMjU1NDM5fQ.Inezg1ZrUUMWEuwM8rilti08eUlL4WjtHnCF1y5_FlA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnections() {
  console.log('🔄 Testing Supabase connections...\n');
  
  try {
    // Test 1: Check if tables exist
    console.log('1️⃣ Testing table structure...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['User', 'Invoice', 'AuditLog']);
    
    if (tablesError) {
      console.log('❌ Tables check failed:', tablesError.message);
      return false;
    }
    
    const tableNames = tables.map(t => t.table_name).sort();
    console.log('✅ Tables found:', tableNames);
    
    if (tableNames.length !== 3) {
      console.log('❌ Expected 3 tables (User, Invoice, AuditLog), found:', tableNames.length);
      return false;
    }
    
    // Test 2: Check User table
    console.log('\n2️⃣ Testing User table...');
    const { data: users, error: usersError } = await supabase
      .from('User')
      .select('id, email, firstName, lastName, role')
      .limit(5);
    
    if (usersError) {
      console.log('❌ User table test failed:', usersError.message);
      return false;
    }
    
    console.log('✅ User table accessible');
    console.log('📊 Users found:', users.length);
    if (users.length > 0) {
      console.log('👤 Sample user:', users[0].email, '-', users[0].role);
    }
    
    // Test 3: Check Invoice table structure
    console.log('\n3️⃣ Testing Invoice table...');
    const { data: invoices, error: invoicesError } = await supabase
      .from('Invoice')
      .select('id, invoiceNumber, vendor, amount, paymentStatus')
      .limit(5);
    
    if (invoicesError) {
      console.log('❌ Invoice table test failed:', invoicesError.message);
      return false;
    }
    
    console.log('✅ Invoice table accessible');
    console.log('📊 Invoices found:', invoices.length);
    if (invoices.length > 0) {
      console.log('📄 Sample invoice:', invoices[0].invoiceNumber, '-', invoices[0].vendor);
    }
    
    // Test 4: Check AuditLog table
    console.log('\n4️⃣ Testing AuditLog table...');
    const { data: auditLogs, error: auditError } = await supabase
      .from('AuditLog')
      .select('id, entityType, action, createdAt')
      .limit(5);
    
    if (auditError) {
      console.log('❌ AuditLog table test failed:', auditError.message);
      return false;
    }
    
    console.log('✅ AuditLog table accessible');
    console.log('📊 Audit logs found:', auditLogs.length);
    
    // Test 5: Test write permissions
    console.log('\n5️⃣ Testing write permissions...');
    const testTime = new Date().toISOString();
    const { data: testLog, error: writeError } = await supabase
      .from('AuditLog')
      .insert({
        entityType: 'test',
        entityId: 'connection-test',
        action: 'CONNECTION_TEST',
        changes: { test: true, timestamp: testTime }
      })
      .select()
      .single();
    
    if (writeError) {
      console.log('❌ Write test failed:', writeError.message);
      return false;
    }
    
    console.log('✅ Write permissions working');
    console.log('🆔 Test log created with ID:', testLog.id);
    
    // Clean up test data
    await supabase
      .from('AuditLog')
      .delete()
      .eq('id', testLog.id);
    
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('\n📋 Connection Summary:');
    console.log('   ✅ Database schema created');
    console.log('   ✅ All 3 tables accessible');
    console.log('   ✅ Read permissions working');
    console.log('   ✅ Write permissions working');
    console.log('   ✅ Ready for data migration!');
    
    return true;
    
  } catch (err) {
    console.error('❌ Connection test failed:', err.message);
    return false;
  }
}

// Run the test
testConnections().then(success => {
  if (success) {
    console.log('\n🚀 READY TO PROCEED with data migration!');
  } else {
    console.log('\n❌ Please check the SQL schema was run correctly in Supabase');
  }
  process.exit(success ? 0 : 1);
});