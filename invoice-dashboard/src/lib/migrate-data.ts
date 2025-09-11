import { prisma } from './prisma'
import { getRealInvoiceData } from './real-invoice-data'

// Migration script to move data from JSON to database
export async function migrateInvoiceData() {
  try {
    console.log('Starting invoice data migration...')
    
    // Get existing JSON data
    const jsonInvoices = getRealInvoiceData()
    console.log(`Found ${jsonInvoices.length} invoices to migrate`)
    
    // Create a default admin user if it doesn't exist
    let adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })
    
    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@rpd.com',
          password: 'temp-password', // Should be hashed in production
          firstName: 'System',
          lastName: 'Administrator',
          role: 'ADMIN',
        }
      })
      console.log('Created default admin user')
    }
    
    // Migrate each invoice
    const migrationResults = []
    
    for (const invoice of jsonInvoices) {
      try {
        // Check if invoice already exists
        const existingInvoice = await prisma.invoice.findUnique({
          where: { invoiceNumber: invoice.invoiceNumber }
        })
        
        if (existingInvoice) {
          console.log(`Invoice ${invoice.invoiceNumber} already exists, skipping...`)
          continue
        }
        
        // Create new invoice record
        const newInvoice = await prisma.invoice.create({
          data: {
            emailId: `email-${invoice.id}`, // Generate email ID
            subject: `Invoice ${invoice.invoiceNumber} from ${invoice.vendorName}`,
            fromEmail: invoice.vendorEmail || null,
            fromName: invoice.vendorName,
            receivedDate: invoice.receivedDate,
            category: invoice.category,
            invoiceNumber: invoice.invoiceNumber,
            amount: invoice.amount,
            vendor: invoice.vendorName,
            dueDate: invoice.dueDate,
            oneDriveLink: null, // Can be populated later
            xeroLink: invoice.invoiceUrl || null,
            processingStatus: 'COMPLETED',
            processedAt: invoice.receivedDate,
            sourceTab: 'migration', // Mark as migrated data
            sourceWorkflowId: null,
            importBatchId: null,
            paymentStatus: invoice.status === 'paid' ? 'PAID' : 
                          invoice.status === 'overdue' ? 'OVERDUE' : 'PENDING',
            paymentDate: invoice.paidDate || null,
            paymentMethod: invoice.status === 'paid' ? 'BANK_TRANSFER' : null,
            transactionId: null,
            paymentNotes: invoice.description,
            confirmedBy: invoice.status === 'paid' ? adminUser.id : null,
          }
        })
        
        // Create audit log for the migration
        await prisma.auditLog.create({
          data: {
            entityType: 'invoice',
            entityId: newInvoice.id,
            action: 'CREATE',
            userId: adminUser.id,
            changes: {
              operation: 'data_migration',
              source: 'JSON file',
              originalData: {
                id: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                vendorName: invoice.vendorName,
                amount: invoice.amount,
                status: invoice.status
              },
              migrationTimestamp: new Date().toISOString()
            },
            ipAddress: '127.0.0.1',
            userAgent: 'Migration Script v1.0'
          }
        })
        
        migrationResults.push({
          success: true,
          invoiceNumber: invoice.invoiceNumber,
          id: newInvoice.id
        })
        
        console.log(`✓ Migrated invoice ${invoice.invoiceNumber}`)
        
      } catch (error) {
        console.error(`✗ Failed to migrate invoice ${invoice.invoiceNumber}:`, error)
        migrationResults.push({
          success: false,
          invoiceNumber: invoice.invoiceNumber,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    // Summary
    const successful = migrationResults.filter(r => r.success).length
    const failed = migrationResults.filter(r => !r.success).length
    
    console.log('\n=== Migration Summary ===')
    console.log(`Total invoices: ${jsonInvoices.length}`)
    console.log(`Successfully migrated: ${successful}`)
    console.log(`Failed: ${failed}`)
    
    if (failed > 0) {
      console.log('\nFailed migrations:')
      migrationResults
        .filter(r => !r.success)
        .forEach(r => console.log(`- ${r.invoiceNumber}: ${r.error}`))
    }
    
    return {
      total: jsonInvoices.length,
      successful,
      failed,
      results: migrationResults
    }
    
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Helper function to run migration from command line
if (require.main === module) {
  migrateInvoiceData()
    .then(result => {
      console.log('Migration completed:', result)
      process.exit(0)
    })
    .catch(error => {
      console.error('Migration failed:', error)
      process.exit(1)
    })
}