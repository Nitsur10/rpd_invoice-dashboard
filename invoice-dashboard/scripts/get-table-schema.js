#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getTableSchema() {
  console.log('🔍 Getting table schema from information_schema...');
  
  try {
    // Query PostgreSQL system tables to get column information
    const { data, error } = await supabase.rpc('get_table_columns', {
      table_name: 'Invoice'
    });
    
    if (error) {
      console.log('❌ RPC call failed, trying direct query...');
      
      // Alternative: try to get a sample of all columns by selecting with LIMIT 0
      const { data: schemaData, error: schemaError } = await supabase
        .from('Invoice')
        .select('*')
        .limit(0);
      
      if (schemaError) {
        console.error('❌ Could not determine schema:', schemaError);
        
        // Try with some common column names to test
        const testColumns = [
          'id', 'invoiceNumber', 'invoice_number', 
          'vendorName', 'supplier_name', 'supplierName',
          'amount', 'total', 'amountDue', 'amount_due',
          'issueDate', 'invoice_date', 'invoiceDate',
          'dueDate', 'due_date', 'description', 'status'
        ];
        
        console.log('🧪 Testing common column names...');
        
        for (const col of testColumns) {
          try {
            const { error: testError } = await supabase
              .from('Invoice')
              .select(col)
              .limit(0);
            
            if (!testError) {
              console.log(`   ✅ Column exists: ${col}`);
            }
          } catch (e) {
            // Column doesn't exist
          }
        }
        
      } else {
        console.log('✅ Schema query successful (though no data returned)');
        console.log('Available columns found via select *:', Object.keys(schemaData[0] || {}));
      }
      
    } else {
      console.log('✅ Schema retrieved:', data);
    }
    
  } catch (error) {
    console.error('💥 Schema inspection failed:', error);
  }
}

async function main() {
  console.log('📊 Getting Invoice Table Schema\n');
  await getTableSchema();
}

if (require.main === module) {
  main();
}