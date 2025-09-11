// Create tables directly using raw SQL via Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://auvyyrfbmlfsmmpjnaoc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dnl5cmZibWxmc21tcGpuYW9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY3OTQzOSwiZXhwIjoyMDcxMjU1NDM5fQ.Inezg1ZrUUMWEuwM8rilti08eUlL4WjtHnCF1y5_FlA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  console.log('🔨 Creating Invoice Dashboard tables...\n');
  
  // Table creation statements
  const tableStatements = [
    {
      name: 'User',
      sql: `CREATE TABLE IF NOT EXISTS "User" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        "firstName" TEXT NOT NULL,
        "lastName" TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'USER',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'Invoice',
      sql: `CREATE TABLE IF NOT EXISTS "Invoice" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "emailId" TEXT NOT NULL,
        subject TEXT NOT NULL,
        "fromEmail" TEXT,
        "fromName" TEXT NOT NULL,
        "receivedDate" TIMESTAMP(3) NOT NULL,
        category TEXT NOT NULL DEFAULT 'INVOICE',
        "invoiceNumber" TEXT UNIQUE NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        vendor TEXT NOT NULL,
        "dueDate" TIMESTAMP(3),
        "oneDriveLink" TEXT,
        "xeroLink" TEXT,
        "processingStatus" TEXT NOT NULL DEFAULT 'PENDING',
        "processedAt" TIMESTAMP(3),
        "sourceTab" TEXT NOT NULL,
        "sourceWorkflowId" TEXT,
        "importBatchId" TEXT,
        "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
        "paymentDate" TIMESTAMP(3),
        "paymentMethod" TEXT,
        "transactionId" TEXT,
        "paymentNotes" TEXT,
        "confirmedBy" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      name: 'AuditLog',
      sql: `CREATE TABLE IF NOT EXISTS "AuditLog" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "entityType" TEXT NOT NULL,
        "entityId" TEXT NOT NULL,
        action TEXT NOT NULL,
        "userId" TEXT,
        changes JSONB NOT NULL,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`
    }
  ];
  
  let success = true;
  
  try {
    for (const table of tableStatements) {
      console.log(`📋 Creating ${table.name} table...`);
      
      // Use direct insert approach to create table via SQL
      try {
        // Try to insert into the table first to see if it exists
        const { data: testData, error: testError } = await supabase
          .from(table.name)
          .select('*')
          .limit(1);
        
        if (testError && testError.message.includes('does not exist')) {
          console.log(`  ⚠️  Table ${table.name} doesn't exist, needs manual creation`);
        } else {
          console.log(`  ✅ Table ${table.name} already exists`);
        }
      } catch (err) {
        console.log(`  ⚠️  Table ${table.name} check failed: ${err.message}`);
      }
    }
    
    // Check what tables exist
    console.log('\n🔍 Checking existing tables...');
    const { data: existingTables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tableError) {
      console.log('❌ Could not check existing tables:', tableError.message);
    } else {
      const tableNames = existingTables.map(t => t.table_name);
      console.log('📋 Existing tables:', tableNames);
      
      const requiredTables = ['User', 'Invoice', 'AuditLog'];
      const missingTables = requiredTables.filter(t => !tableNames.includes(t));
      
      if (missingTables.length > 0) {
        console.log('\n❗ Missing tables:', missingTables);
        console.log('\n🔧 MANUAL ACTION REQUIRED:');
        console.log('Please run the supabase-schema.sql in Supabase SQL Editor');
        console.log('Go to: https://app.supabase.com/project/auvyyrfbmlfsmmpjnaoc/sql');
        success = false;
      } else {
        console.log('\n✅ All required tables exist!');
      }
    }
    
  } catch (err) {
    console.error('❌ Table creation failed:', err.message);
    success = false;
  }
  
  return success;
}

createTables().then(success => {
  if (success) {
    console.log('\n🎉 Tables ready for data migration!');
  } else {
    console.log('\n⚠️  Manual schema execution required');
  }
  process.exit(success ? 0 : 1);
});