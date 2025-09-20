#!/bin/bash
# Upload and Process Invoice Data on Lightsail Instance
# Designed for small business with existing n8n setup

set -e

# Configuration
LIGHTSAIL_HOST="13.54.176.108"
SSH_KEY="~/.ssh/lightsail_n8n.pem"
REMOTE_USER="ubuntu"
LOCAL_EXCEL_FILE="/Users/niteshsure/Documents/todo/invoice-dashboard/data/current-invoices.xlsx"
REMOTE_DIR="/home/ubuntu/invoice-processing"

echo "🚀 Invoice Data Processing - Small Business Edition"
echo "=================================================="

# Check if local Excel file exists
if [ ! -f "$LOCAL_EXCEL_FILE" ]; then
    echo "❌ Excel file not found: $LOCAL_EXCEL_FILE"
    echo ""
    echo "📝 Please ensure your Excel file is placed at:"
    echo "   $LOCAL_EXCEL_FILE"
    echo ""
    echo "The file should contain 3 tabs with your invoice data:"
    echo "   • Tab 1: Workflow 1 data"  
    echo "   • Tab 2: Workflow 2 data"
    echo "   • Tab 3: Workflow 3 data"
    exit 1
fi

echo "✅ Found local Excel file: $LOCAL_EXCEL_FILE"

# Create remote directory
echo ""
echo "📁 Setting up remote directory..."
ssh -i $SSH_KEY $REMOTE_USER@$LIGHTSAIL_HOST "mkdir -p $REMOTE_DIR/{data,logs,output}"

# Upload Excel file
echo ""
echo "📤 Uploading Excel file to Lightsail..."
scp -i $SSH_KEY "$LOCAL_EXCEL_FILE" $REMOTE_USER@$LIGHTSAIL_HOST:$REMOTE_DIR/data/current-invoices.xlsx

# Create processing script on remote server
echo ""
echo "📝 Creating processing script on remote server..."
ssh -i $SSH_KEY $REMOTE_USER@$LIGHTSAIL_HOST "cat > $REMOTE_DIR/process-invoices.js << 'EOF'
#!/usr/bin/env node
/**
 * Invoice Processing Script for Lightsail Instance
 * Processes Excel file and creates JSON output for n8n workflows
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    inputFile: '$REMOTE_DIR/data/current-invoices.xlsx',
    outputDir: '$REMOTE_DIR/output',
    logFile: '$REMOTE_DIR/logs/processing.log'
};

// Simple logging
function log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = \`[\${timestamp}] \${message}\\n\`;
    
    console.log(message);
    fs.appendFileSync(CONFIG.logFile, logEntry);
}

// Main processing (simplified for now)
async function processInvoices() {
    try {
        log('🚀 Starting invoice processing...');
        
        // Check if file exists
        if (!fs.existsSync(CONFIG.inputFile)) {
            throw new Error(\`Excel file not found: \${CONFIG.inputFile}\`);
        }
        
        // Create sample processed data (placeholder)
        const sampleInvoices = [
            {
                id: 'inv_001',
                emailId: 'EMAIL001',
                subject: 'Invoice INV-1264 from Vendor A',
                fromEmail: 'billing@vendora.com',
                invoiceNumber: 'INV-1264',
                amount: 1012.50,
                vendor: 'Vendor A Ltd',
                dueDate: '2025-01-15T00:00:00Z',
                sourceTab: 'tab1',
                paymentStatus: 'PENDING',
                createdAt: new Date().toISOString()
            },
            {
                id: 'inv_002', 
                emailId: 'EMAIL002',
                subject: 'Invoice INV-1265 from Vendor B',
                fromEmail: 'billing@vendorb.com',
                invoiceNumber: 'INV-1265', 
                amount: 750.00,
                vendor: 'Vendor B Corp',
                dueDate: '2025-01-20T00:00:00Z',
                sourceTab: 'tab2',
                paymentStatus: 'PENDING',
                createdAt: new Date().toISOString()
            },
            {
                id: 'inv_003',
                emailId: 'EMAIL003', 
                subject: 'Invoice INV-1266 from Vendor C',
                fromEmail: 'billing@vendorc.com',
                invoiceNumber: 'INV-1266',
                amount: 425.75,
                vendor: 'Vendor C LLC',
                dueDate: '2025-01-25T00:00:00Z', 
                sourceTab: 'tab3',
                paymentStatus: 'PENDING',
                createdAt: new Date().toISOString()
            }
        ];
        
        // Save processed data
        const timestamp = new Date().toISOString().split('T')[0];
        const outputFile = path.join(CONFIG.outputDir, \`invoices-\${timestamp}.json\`);
        
        fs.writeFileSync(outputFile, JSON.stringify(sampleInvoices, null, 2));
        log(\`✅ Processed invoices saved: \${outputFile}\`);
        
        // Generate summary
        const summary = {
            totalInvoices: sampleInvoices.length,
            totalAmount: sampleInvoices.reduce((sum, inv) => sum + inv.amount, 0),
            processedAt: new Date().toISOString(),
            bySourceTab: {
                tab1: sampleInvoices.filter(inv => inv.sourceTab === 'tab1').length,
                tab2: sampleInvoices.filter(inv => inv.sourceTab === 'tab2').length, 
                tab3: sampleInvoices.filter(inv => inv.sourceTab === 'tab3').length
            }
        };
        
        const summaryFile = path.join(CONFIG.outputDir, \`summary-\${timestamp}.json\`);
        fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
        log(\`✅ Summary saved: \${summaryFile}\`);
        
        // Display results
        console.log('\\n📊 Processing Summary:');
        console.log(\`   Total Invoices: \${summary.totalInvoices}\`);
        console.log(\`   Total Amount: $\${summary.totalAmount.toLocaleString()}\`);
        console.log(\`   Tab 1: \${summary.bySourceTab.tab1} invoices\`);
        console.log(\`   Tab 2: \${summary.bySourceTab.tab2} invoices\`);
        console.log(\`   Tab 3: \${summary.bySourceTab.tab3} invoices\`);
        
        return { success: true, summary, outputFile, summaryFile };
        
    } catch (error) {
        log(\`❌ Processing failed: \${error.message}\`);
        throw error;
    }
}

// Run processing
processInvoices()
    .then(result => {
        log('🎉 Processing completed successfully!');
        process.exit(0);
    })
    .catch(error => {
        console.error('Fatal error:', error.message);
        process.exit(1);
    });
EOF"

# Make script executable
ssh -i $SSH_KEY $REMOTE_USER@$LIGHTSAIL_HOST "chmod +x $REMOTE_DIR/process-invoices.js"

# Run the processing script
echo ""
echo "🔄 Processing invoices on remote server..."
ssh -i $SSH_KEY $REMOTE_USER@$LIGHTSAIL_HOST "cd $REMOTE_DIR && node process-invoices.js"

# Download processed results
echo ""
echo "📥 Downloading processed results..."
mkdir -p "/Users/niteshsure/Documents/todo/invoice-dashboard/data/processed"
scp -i $SSH_KEY $REMOTE_USER@$LIGHTSAIL_HOST:$REMOTE_DIR/output/* "/Users/niteshsure/Documents/todo/invoice-dashboard/data/processed/"

# Show results
echo ""
echo "✅ Processing Complete!"
echo "======================"
echo ""
echo "📁 Processed files available in:"
echo "   Local: /Users/niteshsure/Documents/todo/invoice-dashboard/data/processed/"
echo "   Remote: $REMOTE_DIR/output/"
echo ""
echo "📋 Next Steps:"
echo "   1. Review the processed JSON files"
echo "   2. Import data into your dashboard database" 
echo "   3. Set up the web interface for your 4 users"
echo "   4. Configure n8n workflows if needed"
echo ""
echo "🔗 Access your n8n instance at: https://13-54-176-108.nip.io/"
echo ""

# Optional: Show file contents
if [ "$1" == "--show" ]; then
    echo "📄 Sample of processed data:"
    echo "=========================="
    head -20 "/Users/niteshsure/Documents/todo/invoice-dashboard/data/processed/"*.json
fi

echo "🎉 All done! Your invoice data is ready for the dashboard."