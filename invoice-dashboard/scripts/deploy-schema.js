#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deploySchema() {
  console.log('🗄️ Deploying Supabase Invoice table schema...');
  
  try {
    // SQL for Invoice table with all 32 fields
    const createInvoiceTableSQL = `
      -- Drop existing table if it exists (for clean deployment)
      DROP TABLE IF EXISTS "Invoice" CASCADE;
      
      -- Main Invoice Table with all 32 fields matching spreadsheet
      CREATE TABLE "Invoice" (
        -- Primary identifiers
        invoice_number TEXT PRIMARY KEY,
        
        -- Financial data
        invoice_date DATE,
        due_date DATE,
        currency TEXT DEFAULT 'AUD',
        subtotal DECIMAL(12,2),
        gst_total DECIMAL(12,2),
        total DECIMAL(12,2) NOT NULL,
        amount_due DECIMAL(12,2),
        
        -- Supplier information
        supplier_name TEXT NOT NULL,
        supplier_abn TEXT,
        supplier_email TEXT,
        
        -- Customer information  
        customer_name TEXT,
        customer_abn TEXT,
        
        -- Banking details
        bank_bsb TEXT,
        bank_account TEXT,
        reference_hint TEXT,
        
        -- File information
        file_name TEXT,
        file_url TEXT,
        folder_path TEXT,
        file_id TEXT,
        folder_id TEXT,
        
        -- Processing metadata
        source TEXT,
        notes TEXT,
        confidence DECIMAL(5,2),
        
        -- Line item details (first line only)
        line_1_desc TEXT,
        line_1_qty DECIMAL(10,2),
        line_1_unit_price DECIMAL(10,2),
        
        -- Email information
        message_id TEXT,
        email_subject TEXT,
        email_from_name TEXT,
        email_from_address TEXT,
        
        -- Timestamps
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    console.log('📝 Creating Invoice table...');
    const { error: tableError } = await supabase.rpc('exec_sql', { sql: createInvoiceTableSQL });
    
    if (tableError) {
      console.error('❌ Error creating Invoice table:', tableError);
      throw tableError;
    }
    
    console.log('✅ Invoice table created successfully');
    
    // Create indexes for performance
    const indexesSQL = `
      -- Indexes for performance
      CREATE INDEX IF NOT EXISTS idx_invoice_supplier_name ON "Invoice"(supplier_name);
      CREATE INDEX IF NOT EXISTS idx_invoice_date ON "Invoice"(invoice_date);
      CREATE INDEX IF NOT EXISTS idx_invoice_due_date ON "Invoice"(due_date);
      CREATE INDEX IF NOT EXISTS idx_invoice_total ON "Invoice"(total);
      CREATE INDEX IF NOT EXISTS idx_invoice_created_at ON "Invoice"(created_at);
      CREATE INDEX IF NOT EXISTS idx_invoice_source ON "Invoice"(source);
    `;
    
    console.log('📊 Creating performance indexes...');
    const { error: indexError } = await supabase.rpc('exec_sql', { sql: indexesSQL });
    
    if (indexError) {
      console.error('❌ Error creating indexes:', indexError);
      throw indexError;
    }
    
    console.log('✅ Indexes created successfully');
    
    // Create update timestamp trigger
    const triggerSQL = `
      -- Trigger to update updated_at timestamp
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_invoice_updated_at ON "Invoice";
      CREATE TRIGGER update_invoice_updated_at 
        BEFORE UPDATE ON "Invoice" 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    `;
    
    console.log('⚡ Creating timestamp trigger...');
    const { error: triggerError } = await supabase.rpc('exec_sql', { sql: triggerSQL });
    
    if (triggerError) {
      console.error('❌ Error creating trigger:', triggerError);
      throw triggerError;
    }
    
    console.log('✅ Timestamp trigger created successfully');
    
    // Verify table structure
    console.log('🔍 Verifying table structure...');
    const { data: tableInfo, error: verifyError } = await supabase
      .from('Invoice')
      .select('*')
      .limit(0);
    
    if (verifyError) {
      console.error('❌ Error verifying table:', verifyError);
      throw verifyError;
    }
    
    console.log('✅ Table verification successful');
    console.log('🎉 Supabase schema deployment complete!');
    
    return true;
    
  } catch (error) {
    console.error('💥 Schema deployment failed:', error);
    throw error;
  }
}

// Alternative method using direct SQL execution
async function deploySchemaAlternative() {
  console.log('🗄️ Deploying schema using alternative method...');
  
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('SUPABASE_SCHEMA_VERIFICATION.sql', 'utf8');
    
    // Split into individual statements and execute
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length === 0) continue;
      
      console.log(`   ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
      
      if (error) {
        console.error(`   ❌ Statement ${i + 1} failed:`, error.message);
        if (!error.message.includes('already exists')) {
          throw error;
        }
      } else {
        console.log(`   ✅ Statement ${i + 1} executed successfully`);
      }
    }
    
    console.log('🎉 Alternative schema deployment complete!');
    return true;
    
  } catch (error) {
    console.error('💥 Alternative deployment failed:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Supabase Schema Deployment Starting...\n');
  console.log(`🔗 Supabase URL: ${supabaseUrl}\n`);
  
  try {
    // Try primary method first
    await deploySchema();
    
  } catch (error) {
    console.log('\n⚠️ Primary method failed, trying alternative...\n');
    
    try {
      await deploySchemaAlternative();
    } catch (altError) {
      console.error('💥 Both deployment methods failed');
      process.exit(1);
    }
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { deploySchema };