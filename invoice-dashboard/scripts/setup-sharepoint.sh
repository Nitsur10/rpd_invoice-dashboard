#!/bin/bash
# SharePoint Setup for Rudra Projects Invoice Dashboard
# Uses your specific SharePoint URL for automated daily processing

set -e

echo "🏢 Rudra Projects - Invoice Dashboard Setup"
echo "=========================================="
echo ""

# Your SharePoint configuration
SHAREPOINT_URL="https://rudraprojects-my.sharepoint.com/:x:/g/personal/satyagala_rudraprojects_onmicrosoft_com/ER3BAYrWG4lDiT7yCKNAV5QBEJT7k7j5qiJUJe3nYw2xyw?e=hgKmsq"
EXCEL_FILE_NAME="current-invoices.xlsx"

echo "📊 SharePoint Configuration:"
echo "   • Organization: Rudra Projects"
echo "   • User: satyagala@rudraprojects.onmicrosoft.com"
echo "   • File: $EXCEL_FILE_NAME"
echo "   • URL: $SHAREPOINT_URL"
echo ""

# Create directories
echo "📁 Setting up directories..."
mkdir -p data/onedrive
mkdir -p data/processed  
mkdir -p logs
echo "   ✅ Directories created"

# Create environment configuration
echo ""
echo "⚙️ Creating configuration..."

cat > .env << EOF
# Rudra Projects SharePoint Configuration - Generated $(date)
SHAREPOINT_URL=$SHAREPOINT_URL
SHAREPOINT_ORGANIZATION=rudraprojects
SHAREPOINT_USER=satyagala
SHAREPOINT_DOMAIN=rudraprojects.onmicrosoft.com
EXCEL_FILE_NAME=$EXCEL_FILE_NAME

# Processing Settings
CHECK_INTERVAL_MINUTES=15
ENABLE_AUTO_PROCESSING=true
ENABLE_LIGHTSAIL_SYNC=true

# Lightsail Settings (your existing instance)
LIGHTSAIL_HOST=13.54.176.108
LIGHTSAIL_USER=ubuntu
LIGHTSAIL_KEY=~/.ssh/lightsail_n8n.pem
LIGHTSAIL_REMOTE_DIR=/home/ubuntu/invoice-processing

# Local Settings
LOCAL_DOWNLOAD_DIR=./data/onedrive
LOCAL_PROCESSED_DIR=./data/processed
LOG_FILE=./logs/sharepoint-sync.log

# Notification Settings
NOTIFICATION_EMAIL=satyagala@rudraprojects.onmicrosoft.com
ENABLE_SLACK_NOTIFICATIONS=false
EOF

echo "   ✅ Configuration saved to .env"

# Create startup script
cat > start-invoice-sync.sh << 'EOF'
#!/bin/bash
# Start Rudra Projects Invoice Synchronization

echo "🚀 Starting Rudra Projects Invoice Sync"
echo "======================================"
echo "   SharePoint: rudraprojects-my.sharepoint.com"
echo "   File: current-invoices.xlsx"
echo "   Check interval: 15 minutes"
echo "   Lightsail: 13.54.176.108"
echo ""

# Load configuration
if [ -f .env ]; then
    echo "✅ Configuration loaded"
else
    echo "❌ No configuration found. Run setup-sharepoint.sh first"
    exit 1
fi

echo "📡 Starting monitoring... (Press Ctrl+C to stop)"
echo ""

# Start the SharePoint monitor
node scripts/sharepoint-downloader.js start
EOF

chmod +x start-invoice-sync.sh
echo "   ✅ Startup script created: start-invoice-sync.sh"

# Create test script
cat > test-sharepoint-access.sh << 'EOF'
#!/bin/bash
# Test SharePoint access for Rudra Projects

echo "🧪 Testing SharePoint Access"
echo "============================"

echo "📥 Attempting to download your Excel file..."
node scripts/sharepoint-downloader.js download

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! SharePoint access is working"
    echo ""
    echo "📁 Downloaded files:"
    ls -la data/onedrive/
    echo ""
    echo "🎉 You can now run the full monitoring with:"
    echo "   ./start-invoice-sync.sh"
else
    echo ""
    echo "❌ FAILED! Could not access SharePoint file"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   1. Verify the SharePoint URL is accessible"
    echo "   2. Check if the file has proper sharing permissions"
    echo "   3. Ensure you have network connectivity"
    echo ""
    echo "📞 Contact support if the issue persists"
fi
EOF

chmod +x test-sharepoint-access.sh
echo "   ✅ Test script created: test-sharepoint-access.sh"

# Create deployment script for Lightsail
cat > deploy-to-lightsail.sh << 'EOF'
#!/bin/bash
# Deploy invoice processing to Lightsail

echo "🚀 Deploying to Lightsail Instance"
echo "=================================="

LIGHTSAIL_HOST="13.54.176.108"
LIGHTSAIL_USER="ubuntu"
SSH_KEY="~/.ssh/lightsail_n8n.pem"

echo "📦 Uploading files..."

# Create remote directories
ssh -i $SSH_KEY $LIGHTSAIL_USER@$LIGHTSAIL_HOST "mkdir -p ~/invoice-processing/{scripts,data,logs}"

# Upload configuration and scripts
scp -i $SSH_KEY .env $LIGHTSAIL_USER@$LIGHTSAIL_HOST:~/invoice-processing/
scp -i $SSH_KEY scripts/sharepoint-downloader.js $LIGHTSAIL_USER@$LIGHTSAIL_HOST:~/invoice-processing/scripts/
scp -i $SSH_KEY start-invoice-sync.sh $LIGHTSAIL_USER@$LIGHTSAIL_HOST:~/invoice-processing/

echo ""
echo "🔧 Setting up on Lightsail..."

# Make scripts executable and start monitoring
ssh -i $SSH_KEY $LIGHTSAIL_USER@$LIGHTSAIL_HOST << 'REMOTE_SCRIPT'
cd ~/invoice-processing
chmod +x start-invoice-sync.sh

# Test if Node.js is available
if command -v node >/dev/null 2>&1; then
    echo "✅ Node.js is available"
    
    # Start monitoring in background
    echo "🚀 Starting invoice monitoring..."
    nohup ./start-invoice-sync.sh > monitor.log 2>&1 &
    
    echo "✅ Invoice monitoring started successfully!"
    echo "📋 To check status: ssh and run 'tail -f ~/invoice-processing/monitor.log'"
    
else
    echo "❌ Node.js not found on Lightsail. Installing..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    echo "✅ Node.js installed. Starting monitoring..."
    nohup ./start-invoice-sync.sh > monitor.log 2>&1 &
fi
REMOTE_SCRIPT

echo ""
echo "🎉 Deployment complete!"
echo "======================"
echo ""
echo "🌐 Your invoice processing is now running on:"
echo "   Lightsail: $LIGHTSAIL_HOST"
echo "   Location: ~/invoice-processing/"
echo ""
echo "📋 To monitor:"
echo "   ssh -i ~/.ssh/lightsail_n8n.pem ubuntu@13.54.176.108"
echo "   tail -f ~/invoice-processing/monitor.log"
EOF

chmod +x deploy-to-lightsail.sh
echo "   ✅ Deployment script created: deploy-to-lightsail.sh"

# Test Node.js availability
echo ""
echo "🧪 Testing Node.js..."
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    echo "   ✅ Node.js is available: $NODE_VERSION"
    
    # Test script availability
    if [ -f "scripts/sharepoint-downloader.js" ]; then
        echo "   ✅ SharePoint downloader script is ready"
        
        # Test basic functionality
        echo ""
        echo "🚀 Quick Test:"
        echo "   ./test-sharepoint-access.sh"
        echo ""
        
    else
        echo "   ❌ SharePoint downloader script not found"
    fi
else
    echo "   ❌ Node.js not found. Please install Node.js first:"
    echo "      brew install node  # On macOS"
    echo "      or visit: https://nodejs.org/"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "📁 Files created:"
echo "   ✅ .env - Configuration for Rudra Projects SharePoint"
echo "   ✅ start-invoice-sync.sh - Start monitoring"
echo "   ✅ test-sharepoint-access.sh - Test SharePoint access"
echo "   ✅ deploy-to-lightsail.sh - Deploy to production"
echo ""
echo "🔄 Next Steps:"
echo ""
echo "1. Test SharePoint access:"
echo "   ./test-sharepoint-access.sh"
echo ""
echo "2. Start local monitoring:"
echo "   ./start-invoice-sync.sh"
echo ""
echo "3. Deploy to production:"
echo "   ./deploy-to-lightsail.sh"
echo ""
echo "📊 What this does:"
echo "   • Checks your SharePoint file every 15 minutes"
echo "   • Downloads when changes are detected"
echo "   • Processes all 3 tabs in your Excel file"
echo "   • Creates consolidated invoice data"
echo "   • Syncs to your Lightsail instance"
echo "   • Ready for your dashboard to consume"
echo ""
echo "🏢 Customized for Rudra Projects:"
echo "   • Works with your existing SharePoint setup"
echo "   • Uses your current Lightsail instance (13.54.176.108)"
echo "   • Integrates with your n8n workflows"
echo "   • Optimized for your 4-user team"
echo ""
echo "💡 The system will automatically handle your daily Excel updates!"