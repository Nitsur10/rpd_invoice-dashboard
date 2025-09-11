// Verify Invoice Dashboard schema was created successfully
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://auvyyrfbmlfsmmpjnaoc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dnl5cmZibWxmc21tcGpuYW9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY3OTQzOSwiZXhwIjoyMDcxMjU1NDM5fQ.Inezg1ZrUUMWEuwM8rilti08eUlL4WjtHnCF1y5_FlA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifySchema() {
  console.log('🔍 Verifying Invoice Dashboard schema...\n');
  
  const requiredTables = ['User', 'Invoice', 'AuditLog'];
  const results = {};
  
  try {
    // Check each table
    for (const tableName of requiredTables) {
      console.log(`📋 Checking ${tableName} table...`);
      
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`  ❌ ${tableName}: ${error.message}`);
          results[tableName] = false;
        } else {
          console.log(`  ✅ ${tableName}: Accessible`);
          results[tableName] = true;
        }
      } catch (err) {
        console.log(`  ❌ ${tableName}: ${err.message}`);
        results[tableName] = false;
      }
    }
    
    console.log('\n📊 Schema Verification Results:');
    console.log('================================');
    
    const successful = Object.values(results).filter(r => r).length;
    const total = requiredTables.length;
    
    requiredTables.forEach(table => {
      const status = results[table] ? '✅' : '❌';
      console.log(`  ${status} ${table}`);
    });
    
    console.log(`\n📈 Success Rate: ${successful}/${total} tables`);
    
    if (successful === total) {
      console.log('\n🎉 ALL TABLES READY! Schema verification successful!');
      console.log('✅ Ready to proceed with data migration');
      return true;
    } else {
      console.log('\n⚠️  Schema incomplete - some tables missing');
      console.log('❗ Please run the SQL schema in Supabase SQL Editor');
      return false;
    }
    
  } catch (err) {
    console.error('❌ Schema verification failed:', err.message);
    return false;
  }
}

// Run verification
verifySchema().then(success => {
  process.exit(success ? 0 : 1);
});