#!/usr/bin/env node
/**
 * Excel Data Processing Script
 * Reads the current_invoices.xlsx file with 3 tabs and consolidates into database
 * Optimized for small business use (4 users, ~250 invoices)
 */

const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Configuration
const CONFIG = {
  excelFilePath: path.join(__dirname, '../data/current-invoices.xlsx'),
  backupDir: path.join(__dirname, '../data/archive'),
  logFile: path.join(__dirname, '../logs/data-processing.log'),
  batchSize: 50, // Process in batches for memory efficiency
  
  // Expected tab names (will auto-detect if different)
  expectedTabs: ['Sheet1', 'Sheet2', 'Sheet3'],
  
  // Column mapping - maps Excel columns to database fields
  columnMapping: {
    'Email_ID': 'emailId',
    'Subject': 'subject',
    'From_Email': 'fromEmail',
    'From_Name': 'fromName',
    'Received_Date': 'receivedDate',
    'Category': 'category',
    'Invoice_Number': 'invoiceNumber',
    'Amount': 'amount',
    'Vendor': 'vendor',
    'Due_Date': 'dueDate',
    'OneDrive_Link': 'oneDriveLink',
    'Xero_Link': 'xeroLink',
    'Processing_Status': 'processingStatus',
    'Processed_At': 'processedAt'
  }
};

// Logging utility
class Logger {
  constructor(logFile) {
    this.logFile = logFile;
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };
    
    const logLine = JSON.stringify(logEntry) + '\n';
    fs.appendFileSync(this.logFile, logLine);
    
    // Also log to console
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  info(message, data = null) {
    this.log('info', message, data);
  }

  error(message, data = null) {
    this.log('error', message, data);
  }

  warn(message, data = null) {
    this.log('warn', message, data);
  }
}

// Data processor class
class ExcelDataProcessor {
  constructor() {
    this.logger = new Logger(CONFIG.logFile);
    this.stats = {
      totalProcessed: 0,
      totalCreated: 0,
      totalUpdated: 0,
      totalErrors: 0,
      errors: []
    };
  }

  async process() {
    try {
      this.logger.info('Starting Excel data processing...');
      
      // Validate file exists
      if (!fs.existsSync(CONFIG.excelFilePath)) {
        throw new Error(`Excel file not found: ${CONFIG.excelFilePath}`);
      }

      // Create backup
      await this.createBackup();

      // Read Excel file
      const workbook = this.readExcelFile();
      
      // Get all sheet names
      const sheetNames = workbook.SheetNames;
      this.logger.info(`Found ${sheetNames.length} sheets: ${sheetNames.join(', ')}`);

      // Process each sheet
      for (let i = 0; i < sheetNames.length; i++) {
        const sheetName = sheetNames[i];
        const sourceTab = `tab${i + 1}`; // tab1, tab2, tab3
        
        this.logger.info(`Processing sheet: ${sheetName} as ${sourceTab}`);
        await this.processSheet(workbook, sheetName, sourceTab);
      }

      // Generate summary
      await this.generateSummary();
      
      this.logger.info('Excel data processing completed successfully', this.stats);
      return this.stats;

    } catch (error) {
      this.logger.error('Excel processing failed', { error: error.message, stack: error.stack });
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

  readExcelFile() {
    try {
      this.logger.info(`Reading Excel file: ${CONFIG.excelFilePath}`);
      const workbook = xlsx.readFile(CONFIG.excelFilePath);
      return workbook;
    } catch (error) {
      throw new Error(`Failed to read Excel file: ${error.message}`);
    }
  }

  async processSheet(workbook, sheetName, sourceTab) {
    try {
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert sheet to JSON
      const jsonData = xlsx.utils.sheet_to_json(worksheet, {
        header: 1, // Use first row as header
        defval: '', // Default value for empty cells
        blankrows: false // Skip blank rows
      });

      if (jsonData.length === 0) {
        this.logger.warn(`Sheet ${sheetName} is empty, skipping`);
        return;
      }

      // Extract headers and validate
      const headers = jsonData[0];
      const dataRows = jsonData.slice(1);
      
      this.logger.info(`Sheet ${sheetName}: ${headers.length} columns, ${dataRows.length} rows`);

      // Validate headers
      const mappedHeaders = this.validateAndMapHeaders(headers);
      
      // Process rows in batches
      const batches = this.createBatches(dataRows, CONFIG.batchSize);
      
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        this.logger.info(`Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} rows)`);
        
        await this.processBatch(batch, mappedHeaders, sourceTab, sheetName);
      }

    } catch (error) {
      this.logger.error(`Error processing sheet ${sheetName}`, { error: error.message });
      throw error;
    }
  }

  validateAndMapHeaders(headers) {
    const mappedHeaders = {};
    const missingRequired = [];

    // Map known columns
    headers.forEach((header, index) => {
      const trimmedHeader = header.toString().trim();
      if (CONFIG.columnMapping[trimmedHeader]) {
        mappedHeaders[index] = {
          field: CONFIG.columnMapping[trimmedHeader],
          original: trimmedHeader
        };
      }
    });

    // Check for required fields
    const requiredFields = ['emailId', 'invoiceNumber', 'amount', 'vendor'];
    const mappedFields = Object.values(mappedHeaders).map(h => h.field);
    
    requiredFields.forEach(field => {
      if (!mappedFields.includes(field)) {
        missingRequired.push(field);
      }
    });

    if (missingRequired.length > 0) {
      this.logger.warn('Some required columns are missing', { 
        missing: missingRequired,
        available: headers 
      });
    }

    return mappedHeaders;
  }

  async processBatch(rows, mappedHeaders, sourceTab, sheetName) {
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      
      try {
        const invoiceData = this.transformRowToInvoice(row, mappedHeaders, sourceTab);
        
        if (!invoiceData) {
          continue; // Skip empty/invalid rows
        }

        // Upsert invoice (update if exists, create if not)
        const result = await this.upsertInvoice(invoiceData);
        
        if (result.created) {
          this.stats.totalCreated++;
        } else {
          this.stats.totalUpdated++;
        }
        
        this.stats.totalProcessed++;

      } catch (error) {
        this.stats.totalErrors++;
        this.stats.errors.push({
          sheet: sheetName,
          row: rowIndex + 2, // +2 because Excel is 1-indexed and we skip header
          error: error.message,
          data: row
        });
        
        this.logger.error(`Error processing row ${rowIndex + 2} in ${sheetName}`, {
          error: error.message,
          row: row
        });
      }
    }
  }

  transformRowToInvoice(row, mappedHeaders, sourceTab) {
    const invoice = {
      sourceTab,
      sourceWorkflowId: `excel-import-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      paymentStatus: 'PENDING'
    };

    // Map columns to invoice fields
    Object.entries(mappedHeaders).forEach(([columnIndex, mapping]) => {
      const value = row[columnIndex];
      
      if (value !== undefined && value !== null && value !== '') {
        invoice[mapping.field] = this.transformValue(mapping.field, value);
      }
    });

    // Validate required fields
    if (!invoice.emailId || !invoice.invoiceNumber) {
      return null; // Skip invalid rows
    }

    // Set defaults
    if (!invoice.receivedDate) {
      invoice.receivedDate = new Date();
    }
    if (!invoice.processedAt) {
      invoice.processedAt = new Date();
    }
    if (!invoice.processingStatus) {
      invoice.processingStatus = 'Processed';
    }
    if (!invoice.category) {
      invoice.category = 'standard_pdf';
    }

    return invoice;
  }

  transformValue(field, value) {
    // Type conversions based on field type
    switch (field) {
      case 'amount':
        const numValue = parseFloat(value);
        return isNaN(numValue) ? 0 : numValue;
        
      case 'receivedDate':
      case 'dueDate':
      case 'processedAt':
        if (typeof value === 'number') {
          // Excel date serial number
          return this.excelDateToJSDate(value);
        } else if (typeof value === 'string') {
          const date = new Date(value);
          return isNaN(date.getTime()) ? null : date;
        }
        return null;
        
      case 'oneDriveLink':
      case 'xeroLink':
        // Ensure it's a valid URL format
        return value.toString().trim();
        
      default:
        return value.toString().trim();
    }
  }

  excelDateToJSDate(excelDate) {
    // Excel dates are stored as days since January 1, 1900
    const excelEpoch = new Date(1900, 0, 1);
    const jsDate = new Date(excelEpoch.getTime() + (excelDate - 1) * 24 * 60 * 60 * 1000);
    return jsDate;
  }

  async upsertInvoice(invoiceData) {
    try {
      // Try to find existing invoice by emailId or invoiceNumber
      const existing = await prisma.invoice.findFirst({
        where: {
          OR: [
            { emailId: invoiceData.emailId },
            { invoiceNumber: invoiceData.invoiceNumber }
          ]
        }
      });

      if (existing) {
        // Update existing invoice
        await prisma.invoice.update({
          where: { id: existing.id },
          data: {
            ...invoiceData,
            id: undefined, // Don't update ID
            createdAt: undefined // Don't update created timestamp
          }
        });
        
        return { created: false, invoice: existing };
      } else {
        // Create new invoice
        const newInvoice = await prisma.invoice.create({
          data: invoiceData
        });
        
        return { created: true, invoice: newInvoice };
      }
    } catch (error) {
      // Handle unique constraint violations
      if (error.code === 'P2002') {
        this.logger.warn(`Duplicate invoice detected: ${invoiceData.invoiceNumber}`);
        return { created: false, invoice: null };
      }
      throw error;
    }
  }

  createBatches(array, batchSize) {
    const batches = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  async createBackup() {
    try {
      if (!fs.existsSync(CONFIG.backupDir)) {
        fs.mkdirSync(CONFIG.backupDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const backupPath = path.join(CONFIG.backupDir, `invoices-backup-${timestamp}.xlsx`);
      
      fs.copyFileSync(CONFIG.excelFilePath, backupPath);
      this.logger.info(`Backup created: ${backupPath}`);
      
    } catch (error) {
      this.logger.warn('Failed to create backup', { error: error.message });
    }
  }

  async generateSummary() {
    try {
      // Get database statistics
      const totalInvoices = await prisma.invoice.count();
      const paidInvoices = await prisma.invoice.count({
        where: { paymentStatus: 'PAID' }
      });
      const pendingInvoices = await prisma.invoice.count({
        where: { paymentStatus: 'PENDING' }
      });
      
      // Get vendor statistics
      const vendorStats = await prisma.invoice.groupBy({
        by: ['vendor'],
        _count: { vendor: true },
        _sum: { amount: true }
      });

      const summary = {
        processing: this.stats,
        database: {
          totalInvoices,
          paidInvoices,
          pendingInvoices,
          vendors: vendorStats.length
        },
        topVendors: vendorStats
          .sort((a, b) => (b._sum.amount || 0) - (a._sum.amount || 0))
          .slice(0, 10)
          .map(v => ({
            vendor: v.vendor,
            count: v._count.vendor,
            totalAmount: v._sum.amount || 0
          }))
      };

      // Save summary to file
      const summaryPath = path.join(__dirname, '../data/processed/processing-summary.json');
      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
      
      this.logger.info('Processing summary saved', { path: summaryPath });
      return summary;
      
    } catch (error) {
      this.logger.error('Failed to generate summary', { error: error.message });
    }
  }
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting Excel Data Processing...\n');
    
    const processor = new ExcelDataProcessor();
    const results = await processor.process();
    
    console.log('\n✅ Processing Complete!');
    console.log('📊 Summary:');
    console.log(`   • Total Processed: ${results.totalProcessed}`);
    console.log(`   • Created: ${results.totalCreated}`);
    console.log(`   • Updated: ${results.totalUpdated}`);
    console.log(`   • Errors: ${results.totalErrors}`);
    
    if (results.totalErrors > 0) {
      console.log('\n⚠️  Errors occurred during processing:');
      results.errors.forEach(error => {
        console.log(`   • ${error.sheet} Row ${error.row}: ${error.error}`);
      });
    }
    
    console.log(`\n📋 Check logs for details: ${CONFIG.logFile}`);
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Processing failed:', error.message);
    process.exit(1);
  }
}

// Handle command line execution
if (require.main === module) {
  main();
}

module.exports = { ExcelDataProcessor, CONFIG };