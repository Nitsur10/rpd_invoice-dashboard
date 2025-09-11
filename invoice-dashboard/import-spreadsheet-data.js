#!/usr/bin/env node

/**
 * RPD Invoice Dashboard - Spreadsheet Data Import
 * Imports invoice data directly from spreadsheet to Supabase
 * Matches updated schema with exact field mapping
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_SERVICE_KEY = 'your-service-role-key'; // Replace with actual service key

// Expected spreadsheet fields (exactly as you provided)
const SPREADSHEET_FIELDS = [
    'invoice_number', 'invoice_date', 'due_date', 'currency', 'subtotal', 
    'gst_total', 'total', 'amount_due', 'supplier_name', 'supplier_abn', 
    'supplier_email', 'customer_name', 'customer_abn', 'bank_bsb', 
    'bank_account', 'reference_hint', 'file_name', 'file_url', 
    'folder_path', 'file_id', 'folder_id', 'source', 'notes', 
    'confidence', 'line_1_desc', 'line_1_qty', 'line_1_unit_price', 
    'message_id', 'email_subject', 'email_from_name', 'email_from_address'
];

/**
 * Parse CSV data from spreadsheet export
 */
function parseCSV(csvContent) {
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    console.log('📊 Detected CSV headers:', headers);
    console.log('🎯 Expected fields:', SPREADSHEET_FIELDS);
    
    // Validate headers match expected fields
    const missingFields = SPREADSHEET_FIELDS.filter(field => !headers.includes(field));
    const extraFields = headers.filter(header => !SPREADSHEET_FIELDS.includes(header));
    
    if (missingFields.length > 0) {
        console.warn('⚠️ Missing expected fields:', missingFields);
    }
    if (extraFields.length > 0) {
        console.log('ℹ️ Extra fields found:', extraFields);
    }
    
    const invoices = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length < headers.length) continue;
        
        const invoice = {};
        headers.forEach((header, index) => {
            let value = values[index];
            
            // Data type conversions
            if (header.includes('date') && value) {
                // Convert date strings to ISO format
                value = new Date(value).toISOString();
            } else if (['subtotal', 'gst_total', 'total', 'amount_due', 'line_1_qty', 'line_1_unit_price', 'confidence'].includes(header)) {
                // Convert numeric fields
                value = value ? parseFloat(value) : null;
            } else if (value === '' || value === 'NULL') {
                value = null;
            }
            
            invoice[header] = value;
        });
        
        // Validate required fields
        if (invoice.invoice_number && invoice.total && invoice.supplier_name) {
            invoices.push(invoice);
        } else {
            console.warn(`⚠️ Skipping invalid row ${i}: missing required fields`);
        }
    }
    
    return invoices;
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    values.push(current.trim());
    return values;
}

/**
 * Import invoices to Supabase
 */
async function importToSupabase(invoices) {
    try {
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        
        console.log(`🚀 Importing ${invoices.length} invoices to Supabase...`);
        
        // Batch insert in chunks of 100
        const BATCH_SIZE = 100;
        let totalInserted = 0;
        
        for (let i = 0; i < invoices.length; i += BATCH_SIZE) {
            const batch = invoices.slice(i, i + BATCH_SIZE);
            
            const { data, error } = await supabase
                .from('Invoice')
                .upsert(batch, { 
                    onConflict: 'invoice_number',
                    returning: 'minimal' 
                });
            
            if (error) {
                console.error(`❌ Batch ${Math.floor(i/BATCH_SIZE) + 1} failed:`, error);
                throw error;
            }
            
            totalInserted += batch.length;
            console.log(`✅ Batch ${Math.floor(i/BATCH_SIZE) + 1}: ${batch.length} invoices imported`);
        }
        
        console.log(`🎉 Successfully imported ${totalInserted} invoices total`);
        return totalInserted;
        
    } catch (error) {
        console.error('❌ Import failed:', error);
        throw error;
    }
}

/**
 * Generate sample data for testing
 */
function generateSampleData() {
    const samples = [
        {
            invoice_number: 'INV-2025-001',
            invoice_date: '2025-01-15T00:00:00.000Z',
            due_date: '2025-02-15T00:00:00.000Z',
            currency: 'AUD',
            subtotal: 1000.00,
            gst_total: 100.00,
            total: 1100.00,
            amount_due: 1100.00,
            supplier_name: 'ABC Contractors Pty Ltd',
            supplier_abn: '12345678901',
            supplier_email: 'accounts@abc-contractors.com',
            customer_name: 'Rudra Projects and Development',
            customer_abn: '98765432109',
            source: 'email_import',
            notes: 'Sample invoice for testing',
            confidence: 95.5
        },
        {
            invoice_number: 'INV-2025-002', 
            invoice_date: '2025-01-20T00:00:00.000Z',
            due_date: '2025-02-20T00:00:00.000Z',
            currency: 'AUD',
            subtotal: 2500.00,
            gst_total: 250.00,
            total: 2750.00,
            amount_due: 2750.00,
            supplier_name: 'XYZ Building Supplies',
            supplier_abn: '11223344556',
            supplier_email: 'billing@xyz-supplies.com.au',
            customer_name: 'Rudra Projects and Development',
            customer_abn: '98765432109',
            source: 'pdf_extraction',
            notes: 'Building materials for Project Alpha',
            confidence: 87.2
        }
    ];
    
    return samples;
}

/**
 * Main execution
 */
async function main() {
    console.log('🏗️ RPD Invoice Dashboard - Data Import Tool');
    console.log('==========================================');
    
    const args = process.argv.slice(2);
    const command = args[0];
    
    if (command === 'sample') {
        console.log('📝 Generating sample data...');
        const sampleInvoices = generateSampleData();
        await importToSupabase(sampleInvoices);
        return;
    }
    
    if (command === 'csv' && args[1]) {
        const csvFile = args[1];
        console.log(`📂 Reading CSV file: ${csvFile}`);
        
        if (!fs.existsSync(csvFile)) {
            console.error(`❌ File not found: ${csvFile}`);
            process.exit(1);
        }
        
        const csvContent = fs.readFileSync(csvFile, 'utf8');
        const invoices = parseCSV(csvContent);
        
        if (invoices.length === 0) {
            console.error('❌ No valid invoices found in CSV');
            process.exit(1);
        }
        
        await importToSupabase(invoices);
        return;
    }
    
    // Show usage
    console.log('Usage:');
    console.log('  node import-spreadsheet-data.js sample              # Import sample data');
    console.log('  node import-spreadsheet-data.js csv path/to/file.csv # Import from CSV');
    console.log('');
    console.log('Before running:');
    console.log('1. Update SUPABASE_URL and SUPABASE_SERVICE_KEY in this file');
    console.log('2. Ensure you have run the updated-schema.sql in Supabase');
    console.log('3. Install @supabase/supabase-js: npm install @supabase/supabase-js');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { parseCSV, importToSupabase, generateSampleData };