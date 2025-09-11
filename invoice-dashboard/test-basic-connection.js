// Basic Supabase connection test
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://auvyyrfbmlfsmmpjnaoc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dnl5cmZibWxmc21tcGpuYW9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY3OTQzOSwiZXhwIjoyMDcxMjU1NDM5fQ.Inezg1ZrUUMWEuwM8rilti08eUlL4WjtHnCF1y5_FlA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testBasicConnection() {
  console.log('🔄 Testing basic Supabase connection...\n');
  
  try {
    // Test basic connection with a simple query
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);
    
    if (error) {
      console.log('❌ Basic connection failed:', error.message);
      
      // Try alternative connection test
      const { data: healthData, error: healthError } = await supabase
        .rpc('version');
      
      if (healthError) {
        console.log('❌ Health check also failed:', healthError.message);
        return false;
      } else {
        console.log('✅ Health check passed, but schema access failed');
        console.log('🔍 This likely means the SQL schema hasn\'t been run yet');
        return 'partial';
      }
    }
    
    console.log('✅ Basic connection working');
    console.log('✅ Schema access working');
    return true;
    
  } catch (err) {
    console.error('❌ Connection test failed:', err.message);
    return false;
  }
}

// Run the test
testBasicConnection().then(result => {
  if (result === true) {
    console.log('\n🎉 CONNECTION SUCCESSFUL - Ready to create tables!');
  } else if (result === 'partial') {
    console.log('\n⚠️ PARTIAL CONNECTION - Credentials work, need to run SQL schema');
  } else {
    console.log('\n❌ CONNECTION FAILED - Check credentials');
  }
});