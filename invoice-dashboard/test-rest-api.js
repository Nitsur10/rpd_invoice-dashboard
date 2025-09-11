// Test Supabase REST API directly
const fetch = require('node-fetch');

const supabaseUrl = 'https://auvyyrfbmlfsmmpjnaoc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dnl5cmZibWxmc21tcGpuYW9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY3OTQzOSwiZXhwIjoyMDcxMjU1NDM5fQ.Inezg1ZrUUMWEuwM8rilti08eUlL4WjtHnCF1y5_FlA';

async function testRestAPI() {
  console.log('🔄 Testing Supabase REST API directly...\n');
  
  try {
    // Test 1: Basic API health check
    console.log('1️⃣ Testing API health...');
    const healthResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      }
    });
    
    console.log('Status:', healthResponse.status);
    console.log('Status Text:', healthResponse.statusText);
    
    if (healthResponse.ok) {
      console.log('✅ API is accessible');
    } else {
      console.log('❌ API access failed');
      const errorText = await healthResponse.text();
      console.log('Error:', errorText);
      return false;
    }
    
    // Test 2: Try to list tables via information_schema
    console.log('\n2️⃣ Testing schema access...');
    const tablesResponse = await fetch(`${supabaseUrl}/rest/v1/information_schema.tables?select=table_name&table_schema=eq.public`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (tablesResponse.ok) {
      const tables = await tablesResponse.json();
      console.log('✅ Schema accessible');
      console.log('📋 Tables found:', tables.length);
      if (tables.length > 0) {
        console.log('📝 Sample tables:', tables.slice(0, 5).map(t => t.table_name));
      }
    } else {
      console.log('❌ Schema access failed');
      console.log('Status:', tablesResponse.status);
      const errorText = await tablesResponse.text();
      console.log('Error:', errorText);
    }
    
    return true;
    
  } catch (err) {
    console.error('❌ REST API test failed:', err.message);
    return false;
  }
}

testRestAPI().then(success => {
  if (success) {
    console.log('\n🎉 REST API test completed - check results above');
  } else {
    console.log('\n❌ REST API test failed - credentials may be incorrect');
  }
});