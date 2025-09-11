// Force create tables using direct API calls
const fetch = require('node-fetch');

const supabaseUrl = 'https://auvyyrfbmlfsmmpjnaoc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dnl5cmZibWxmc21tcGpuYW9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY3OTQzOSwiZXhwIjoyMDcxMjU1NDM5fQ.Inezg1ZrUUMWEuwM8rilti08eUlL4WjtHnCF1y5_FlA';

async function createExecFunction() {
  console.log('🔧 Creating exec_sql function...\n');
  
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$;
  `;
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql: createFunctionSQL })
    });
    
    if (response.ok) {
      console.log('✅ exec_sql function created');
      return true;
    } else {
      console.log('❌ Function creation failed:', response.status);
      return false;
    }
  } catch (err) {
    console.log('❌ Function creation error:', err.message);
    return false;
  }
}

async function executeSQL(sql, description) {
  console.log(`⚡ ${description}...`);
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql })
    });
    
    if (response.ok) {
      console.log('  ✅ Success');
      return true;
    } else {
      const error = await response.text();
      console.log(`  ❌ Failed: ${error}`);
      return false;
    }
  } catch (err) {
    console.log(`  ❌ Error: ${err.message}`);
    return false;
  }
}

async function forceCreateTables() {
  console.log('🚀 Force creating Invoice Dashboard tables...\n');
  
  // First create the exec function
  await createExecFunction();
  
  // Table creation statements
  const statements = [
    {
      sql: `CREATE TABLE IF NOT EXISTS "User" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        "firstName" TEXT NOT NULL,
        "lastName" TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'USER',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      description: 'Creating User table'
    },
    {
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
      )`,
      description: 'Creating Invoice table'
    },
    {
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
      )`,
      description: 'Creating AuditLog table'
    },
    {
      sql: `INSERT INTO "User" (id, email, password, "firstName", "lastName", role)
            VALUES (
              'admin-user-id-001',
              'admin@rpd.com',
              'temp-password-change-me',
              'System',
              'Administrator',
              'ADMIN'
            ) ON CONFLICT (email) DO NOTHING`,
      description: 'Creating default admin user'
    }
  ];
  
  let successCount = 0;
  
  for (const statement of statements) {
    const success = await executeSQL(statement.sql, statement.description);
    if (success) successCount++;
    
    // Small delay between operations
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`\n📊 Results: ${successCount}/${statements.length} operations successful\n`);
  
  // Verify tables
  console.log('🔍 Verifying tables...');
  
  try {
    const verifyResponse = await fetch(`${supabaseUrl}/rest/v1/User?select=id&limit=1`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    });
    
    if (verifyResponse.ok) {
      console.log('✅ User table accessible');
    } else {
      console.log('❌ User table verification failed');
    }
  } catch (err) {
    console.log('❌ Verification error:', err.message);
  }
  
  return successCount === statements.length;
}

forceCreateTables().then(success => {
  if (success) {
    console.log('\n🎉 ALL TABLES CREATED SUCCESSFULLY!');
    console.log('✅ Ready for data migration');
  } else {
    console.log('\n⚠️  Some operations failed');
  }
  process.exit(success ? 0 : 1);
});