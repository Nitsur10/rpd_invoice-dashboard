#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectTable() {
  console.log('🔍 Inspecting Invoice table structure...');
  
  try {
    // Try to get any existing data to see structure
    const { data, error } = await supabase
      .from('Invoice')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Error querying Invoice table:', error);
      return;
    }
    
    console.log(`📊 Found ${data.length} existing records`);
    
    if (data.length > 0) {
      console.log('📋 Table columns found:');
      Object.keys(data[0]).forEach((key, index) => {
        console.log(`   ${index + 1}. ${key} = ${data[0][key]}`);
      });
      
      console.log('\n📄 Sample records:');
      data.forEach((record, index) => {
        console.log(`\n   Record ${index + 1}:`);
        console.log(`   - ID/Number: ${record.id || record.invoiceNumber || record.invoice_number || 'N/A'}`);
        console.log(`   - Vendor: ${record.vendorName || record.supplier_name || 'N/A'}`);
        console.log(`   - Total: ${record.amount || record.total || 'N/A'}`);
      });
    } else {
      console.log('📋 Table is empty, trying to insert a test record to see the structure...');
      
      // Try minimal insert to understand structure
      const testRecord = {
        invoiceNumber: 'TEST-001',
        vendorName: 'Test Vendor',
        amount: 100
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('Invoice')
        .insert([testRecord])
        .select();
      
      if (insertError) {
        console.log('❌ Test insert failed (snake_case columns):', insertError.message);
        
        // Try with camelCase
        const testRecord2 = {
          invoice_number: 'TEST-001',
          supplier_name: 'Test Vendor', 
          total: 100
        };
        
        const { data: insertData2, error: insertError2 } = await supabase
          .from('Invoice')
          .insert([testRecord2])
          .select();
        
        if (insertError2) {
          console.log('❌ Test insert failed (camelCase columns):', insertError2.message);
        } else {
          console.log('✅ Test insert succeeded with snake_case columns');
          console.log('📋 Columns confirmed:', Object.keys(insertData2[0]));
          
          // Clean up
          await supabase
            .from('Invoice')
            .delete()
            .eq('invoice_number', 'TEST-001');
        }
      } else {
        console.log('✅ Test insert succeeded with camelCase columns');
        console.log('📋 Columns confirmed:', Object.keys(insertData[0]));
        
        // Clean up
        await supabase
          .from('Invoice')
          .delete()
          .eq('invoiceNumber', 'TEST-001');
      }
    }
    
  } catch (error) {
    console.error('💥 Inspection failed:', error);
  }
}

async function main() {
  console.log('🔍 Invoice Table Inspector\n');
  await inspectTable();
}

if (require.main === module) {
  main();
}