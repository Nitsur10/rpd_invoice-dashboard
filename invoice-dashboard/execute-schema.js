// Execute SQL schema via Supabase API
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://auvyyrfbmlfsmmpjnaoc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dnl5cmZibWxmc21tcGpuYW9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY3OTQzOSwiZXhwIjoyMDcxMjU1NDM5fQ.Inezg1ZrUUMWEuwM8rilti08eUlL4WjtHnCF1y5_FlA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSchema() {
  console.log('🚀 Executing Invoice Dashboard schema...\n');
  
  try {
    // Read the schema file
    const schemaSQL = fs.readFileSync('supabase-schema.sql', 'utf8');
    
    // Split into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📄 Found ${statements.length} SQL statements to execute\n`);
    
    let successCount = 0;
    let errors = [];
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.trim().length === 0) {
        continue;
      }
      
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        });
        
        if (error) {
          console.log(`  ❌ Error: ${error.message}`);
          errors.push(`Statement ${i + 1}: ${error.message}`);
        } else {
          console.log(`  ✅ Success`);
          successCount++;
        }
      } catch (err) {
        console.log(`  ❌ Exception: ${err.message}`);
        errors.push(`Statement ${i + 1}: ${err.message}`);
      }
      
      // Small delay between statements
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n📊 Execution Summary:');
    console.log('====================');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n🚨 Errors encountered:');
      errors.forEach(error => console.log(`  • ${error}`));
    }
    
    if (successCount > 0) {
      console.log('\n🎉 Schema execution completed!');
      console.log('🔍 Running verification...\n');
      
      // Verify tables were created
      const { data: tables, error: verifyError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .in('table_name', ['User', 'Invoice', 'AuditLog']);
      
      if (verifyError) {
        console.log('❌ Verification failed:', verifyError.message);
      } else {
        const foundTables = tables.map(t => t.table_name).sort();
        console.log('✅ Tables created:', foundTables);
        
        if (foundTables.length === 3) {
          console.log('\n🎉 ALL TABLES CREATED SUCCESSFULLY!');
          return true;
        } else {
          console.log('\n⚠️  Some tables missing');
        }
      }
    }
    
    return successCount > 0;
    
  } catch (err) {
    console.error('❌ Schema execution failed:', err.message);
    return false;
  }
}

executeSchema().then(success => {
  if (success) {
    console.log('\n🚀 Ready for data migration!');
  } else {
    console.log('\n❌ Schema execution incomplete');
  }
  process.exit(success ? 0 : 1);
});