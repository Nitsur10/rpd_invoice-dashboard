// Migrate invoice data from JSON to Supabase database
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://auvyyrfbmlfsmmpjnaoc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dnl5cmZibWxmc21tcGpuYW9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY3OTQzOSwiZXhwIjoyMDcxMjU1NDM5fQ.Inezg1ZrUUMWEuwM8rilti08eUlL4WjtHnCF1y5_FlA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Real invoice data from the TypeScript file
const rawInvoiceData = [
  {
    id: "INV-1242-001",
    invoiceNumber: "INV-1242",
    vendorName: "Align.Build Pty Ltd", 
    vendorEmail: "accounts@align.build",
    amount: 9768.00,
    amountDue: 9768.00,
    issueDate: "2025-05-15T00:00:00.000Z",
    dueDate: "2025-06-03T00:00:00.000Z", 
    status: "pending",
    description: "Construction Services - May 2025",
    category: "Construction",
    paymentTerms: "Net 30",
    invoiceUrl: "https://in.xero.com/Invoices/View/INV1242-ABC789",
    receivedDate: "2025-05-15T05:03:26.319Z"
  },
  {
    id: "20285-002",
    invoiceNumber: "20285",
    vendorName: "Tasmanian Water and Sewerage Corporation Pty Ltd",
    vendorEmail: "enquiries@taswater.com.au", 
    amount: 344.66,
    amountDue: 344.66,
    issueDate: "2025-05-20T00:00:00.000Z",
    dueDate: "2025-06-22T00:00:00.000Z",
    status: "pending",
    description: "Water & Sewerage - 10 ZARA CT, STONY RISE - Account 13 6992",
    category: "Utilities",
    paymentTerms: "Net 30",
    invoiceUrl: "https://taswater.com.au/invoice/20285",
    receivedDate: "2025-05-20T13:06:54.101Z"
  },
  {
    id: "INV-2024-003",
    invoiceNumber: "INV-2024",
    vendorName: "Elite Electrical Services",
    vendorEmail: "billing@eliteelectrical.com.au",
    amount: 2850.50,
    amountDue: 2850.50,
    issueDate: "2025-05-22T00:00:00.000Z",
    dueDate: "2025-06-21T00:00:00.000Z",
    status: "pending",
    description: "Electrical Installation - Zara Court Project", 
    category: "Electrical",
    paymentTerms: "Net 30",
    invoiceUrl: "https://xero.com/invoices/INV-2024-view",
    receivedDate: "2025-05-22T08:15:30.000Z"
  },
  {
    id: "PL-5678-004",
    invoiceNumber: "PL-5678",
    vendorName: "Premium Plumbing Solutions",
    vendorEmail: "accounts@premiomplumbing.com.au", 
    amount: 4200.80,
    amountDue: 4200.80,
    issueDate: "2025-05-25T00:00:00.000Z",
    dueDate: "2025-06-24T00:00:00.000Z",
    status: "pending",
    description: "Plumbing Installation & Maintenance",
    category: "Plumbing", 
    paymentTerms: "Net 30",
    invoiceUrl: "https://premioplumbing.com.au/invoices/PL-5678",
    receivedDate: "2025-05-25T10:20:45.000Z"
  },
  {
    id: "MAT-3401-005",
    invoiceNumber: "MAT-3401",
    vendorName: "BuildMart Supplies Pty Ltd",
    vendorEmail: "invoices@buildmart.com.au",
    amount: 15670.25,
    amountDue: 15670.25,
    issueDate: "2025-05-28T00:00:00.000Z", 
    dueDate: "2025-06-27T00:00:00.000Z",
    status: "pending",
    description: "Building Materials - Bulk Order #BM2025-142",
    category: "Materials",
    paymentTerms: "Net 30",
    invoiceUrl: "https://buildmart.com.au/invoice/MAT-3401",
    receivedDate: "2025-05-28T14:35:20.000Z"
  },
  {
    id: "CONS-890-006",
    invoiceNumber: "CONS-890", 
    vendorName: "Steel & Concrete Solutions",
    vendorEmail: "billing@steelconcrete.com.au",
    amount: 8950.00,
    amountDue: 8950.00,
    issueDate: "2025-06-01T00:00:00.000Z",
    dueDate: "2025-07-01T00:00:00.000Z",
    status: "pending",
    description: "Concrete Foundation Work - June 2025",
    category: "Construction", 
    paymentTerms: "Net 30",
    invoiceUrl: "https://steelconcrete.com.au/invoices/CONS-890",
    receivedDate: "2025-06-01T09:45:15.000Z"
  },
  {
    id: "SERV-1205-007",
    invoiceNumber: "SERV-1205",
    vendorName: "Professional Consulting Group",
    vendorEmail: "finance@pcgconsult.com.au",
    amount: 5200.00,
    amountDue: 0.00,
    issueDate: "2025-05-10T00:00:00.000Z",
    dueDate: "2025-06-09T00:00:00.000Z", 
    status: "paid",
    description: "Project Consulting Services - May 2025",
    category: "Professional Services",
    paymentTerms: "Net 30",
    invoiceUrl: "https://pcgconsult.com.au/invoices/SERV-1205",
    receivedDate: "2025-05-10T11:20:30.000Z",
    paidDate: "2025-06-08T16:30:00.000Z"
  },
  {
    id: "TECH-4567-008", 
    invoiceNumber: "TECH-4567",
    vendorName: "TechFlow Systems",
    vendorEmail: "accounts@techflow.com.au",
    amount: 3400.75,
    amountDue: 0.00,
    issueDate: "2025-05-12T00:00:00.000Z",
    dueDate: "2025-06-11T00:00:00.000Z",
    status: "paid",
    description: "IT Infrastructure Setup & Support",
    category: "Technology",
    paymentTerms: "Net 30",
    invoiceUrl: "https://techflow.com.au/billing/TECH-4567",
    receivedDate: "2025-05-12T13:40:25.000Z",
    paidDate: "2025-06-10T14:15:00.000Z"
  },
  {
    id: "LAND-2890-009",
    invoiceNumber: "LAND-2890",
    vendorName: "GreenScape Landscaping",
    vendorEmail: "billing@greenscape.com.au", 
    amount: 6800.30,
    amountDue: 6800.30,
    issueDate: "2025-06-05T00:00:00.000Z",
    dueDate: "2025-07-05T00:00:00.000Z",
    status: "overdue",
    description: "Landscape Design & Installation", 
    category: "Landscaping",
    paymentTerms: "Net 30",
    invoiceUrl: "https://greenscape.com.au/invoices/LAND-2890",
    receivedDate: "2025-06-05T08:25:40.000Z"
  },
  {
    id: "SEC-7890-010",
    invoiceNumber: "SEC-7890",
    vendorName: "SecureGuard Systems",
    vendorEmail: "invoices@secureguard.com.au",
    amount: 2100.00,
    amountDue: 2100.00,
    issueDate: "2025-06-08T00:00:00.000Z",
    dueDate: "2025-07-08T00:00:00.000Z", 
    status: "overdue",
    description: "Security System Installation & Monitoring",
    category: "Security",
    paymentTerms: "Net 30", 
    invoiceUrl: "https://secureguard.com.au/billing/SEC-7890",
    receivedDate: "2025-06-08T15:30:20.000Z"
  }
];

async function migrateInvoices() {
  console.log('🚀 Starting invoice data migration...\n');
  
  try {
    // Check if invoices already exist
    console.log('🔍 Checking existing invoices...');
    const { data: existingInvoices, error: checkError } = await supabase
      .from('Invoice')
      .select('invoiceNumber')
      .limit(5);
    
    if (checkError) {
      console.log('❌ Error checking invoices:', checkError.message);
      return false;
    }
    
    if (existingInvoices && existingInvoices.length > 0) {
      console.log(`⚠️  Found ${existingInvoices.length} existing invoices`);
      console.log('🔄 Proceeding with migration (will skip duplicates)...\n');
    } else {
      console.log('✅ No existing invoices found\n');
    }
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    console.log(`📄 Processing ${rawInvoiceData.length} invoices...\n`);
    
    for (const invoice of rawInvoiceData) {
      console.log(`⚡ Processing ${invoice.invoiceNumber} (${invoice.vendorName})...`);
      
      // Map the invoice data to match database schema
      const dbInvoice = {
        id: invoice.id,
        emailId: `email-${invoice.id}`, // Generate email ID
        subject: `Invoice ${invoice.invoiceNumber} - ${invoice.description}`,
        fromEmail: invoice.vendorEmail,
        fromName: invoice.vendorName,
        receivedDate: invoice.receivedDate,
        category: invoice.category || 'INVOICE',
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.amount,
        vendor: invoice.vendorName,
        dueDate: invoice.dueDate,
        oneDriveLink: null,
        xeroLink: invoice.invoiceUrl,
        processingStatus: 'PROCESSED',
        processedAt: new Date().toISOString(),
        sourceTab: 'dashboard-migration',
        sourceWorkflowId: 'migration-script-v1',
        importBatchId: `batch-${Date.now()}`,
        paymentStatus: invoice.status.toUpperCase(),
        paymentDate: invoice.paidDate || null,
        paymentMethod: invoice.status === 'paid' ? 'BANK_TRANSFER' : null,
        transactionId: invoice.status === 'paid' ? `TXN-${invoice.invoiceNumber}` : null,
        paymentNotes: invoice.status === 'paid' ? 'Migrated as paid' : null,
        confirmedBy: null
      };
      
      try {
        const { data, error } = await supabase
          .from('Invoice')
          .insert(dbInvoice)
          .select()
          .single();
        
        if (error) {
          if (error.code === '23505') { // Unique constraint violation
            console.log(`  ⏭️  Skipped (already exists)`);
            skipCount++;
          } else {
            console.log(`  ❌ Error: ${error.message}`);
            errorCount++;
          }
        } else {
          console.log(`  ✅ Migrated successfully (ID: ${data.id})`);
          successCount++;
          
          // Create audit log entry
          await supabase
            .from('AuditLog')
            .insert({
              entityType: 'invoice',
              entityId: data.id,
              action: 'MIGRATED',
              userId: 'admin-user-id-001',
              changes: {
                operation: 'data_migration',
                source: 'real-invoice-data.ts',
                originalId: invoice.id,
                migratedAt: new Date().toISOString()
              },
              ipAddress: '127.0.0.1',
              userAgent: 'migration-script'
            });
        }
      } catch (err) {
        console.log(`  ❌ Exception: ${err.message}`);
        errorCount++;
      }
      
      // Small delay between operations
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n📊 Migration Results:');
    console.log('=====================');
    console.log(`✅ Successfully migrated: ${successCount}`);
    console.log(`⏭️  Skipped (duplicates): ${skipCount}`);
    console.log(`❌ Errors encountered: ${errorCount}`);
    console.log(`📄 Total processed: ${rawInvoiceData.length}`);
    
    // Verify migration
    console.log('\n🔍 Verifying migration...');
    const { data: finalCount, error: countError } = await supabase
      .from('Invoice')
      .select('id', { count: 'exact' });
    
    if (countError) {
      console.log('❌ Verification failed:', countError.message);
    } else {
      console.log(`✅ Total invoices in database: ${finalCount.length}`);
    }
    
    if (successCount > 0) {
      console.log('\n🎉 DATA MIGRATION COMPLETED SUCCESSFULLY!');
      console.log('✅ Invoice dashboard ready with real data');
      return true;
    } else {
      console.log('\n⚠️  No new data migrated');
      return skipCount > 0; // Still success if data already exists
    }
    
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    return false;
  }
}

// Run migration
migrateInvoices().then(success => {
  if (success) {
    console.log('\n🚀 Ready to use the invoice dashboard!');
  } else {
    console.log('\n❌ Migration incomplete');
  }
  process.exit(success ? 0 : 1);
});