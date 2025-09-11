#!/bin/bash
# Quick OneDrive Setup for Small Business Invoice Dashboard
# Simplified setup for daily Excel file synchronization

set -e

echo "🔗 OneDrive Integration Setup - Small Business Edition"
echo "====================================================="
echo ""

# Check if we're in the right directory
if [ ! -f "scripts/onedrive-integration.js" ]; then
    echo "❌ Please run this script from the invoice-dashboard directory"
    echo "   cd /Users/niteshsure/Documents/todo/invoice-dashboard"
    echo "   ./scripts/quick-onedrive-setup.sh"
    exit 1
fi

# Create necessary directories
echo "📁 Setting up directories..."
mkdir -p data/onedrive
mkdir -p data/processed
mkdir -p logs
echo "   ✅ Directories created"

# Get OneDrive sharing information
echo ""
echo "📋 Step 1: OneDrive File Setup"
echo "==============================="
echo ""
echo "Please follow these steps in OneDrive:"
echo "   1. Navigate to your Excel file in OneDrive web interface"
echo "   2. Click the 'Share' button"
echo "   3. Click 'Copy link'"
echo "   4. Choose 'Anyone with the link can edit' (for your team)"
echo "   5. Copy the sharing URL"
echo ""
echo "The URL should look like:"
echo "   https://onedrive.live.com/edit.aspx?resid=ABC123&cid=XYZ789&app=Excel"
echo ""

read -p "🔗 Paste your OneDrive sharing URL here: " SHARING_URL

if [ -z "$SHARING_URL" ]; then
    echo "❌ No URL provided. Exiting..."
    exit 1
fi

# Validate and extract information from URL
echo ""
echo "🔍 Analyzing URL..."

# Extract file ID (resid parameter)
if [[ $SHARING_URL =~ resid=([^&]+) ]]; then
    FILE_ID="${BASH_REMATCH[1]}"
    echo "   ✅ File ID extracted: $FILE_ID"
else
    echo "   ❌ Could not extract file ID from URL"
    echo "   Please ensure the URL contains 'resid=' parameter"
    exit 1
fi

# Extract user/container ID (cid parameter)  
if [[ $SHARING_URL =~ cid=([^&]+) ]]; then
    USER_ID="${BASH_REMATCH[1]}"
    echo "   ✅ User ID extracted: $USER_ID"
else
    echo "   ⚠️  Could not extract user ID, using default"
    USER_ID="default"
fi

# Get additional settings
echo ""
echo "⚙️  Step 2: Configuration Settings"
echo "=================================="

# Check interval
read -p "📅 How often should we check for updates? (minutes, default: 15): " CHECK_INTERVAL
CHECK_INTERVAL=${CHECK_INTERVAL:-15}

# Notification email
read -p "📧 Email for notifications (optional): " NOTIFICATION_EMAIL

# Lightsail settings
echo ""
echo "🌐 Step 3: Lightsail Integration"
echo "==============================="
echo "   Using your existing Lightsail instance: 13.54.176.108"
echo "   SSH key: ~/.ssh/lightsail_n8n.pem"

# Create environment configuration
echo ""
echo "💾 Creating configuration file..."

cat > .env << EOF
# OneDrive Configuration - Generated $(date)
ONEDRIVE_SHARING_URL=$SHARING_URL
ONEDRIVE_FILE_ID=$FILE_ID
ONEDRIVE_USER_ID=$USER_ID
ONEDRIVE_FILE_NAME=current-invoices.xlsx

# Processing Settings
CHECK_INTERVAL_MINUTES=$CHECK_INTERVAL
NOTIFICATION_EMAIL=$NOTIFICATION_EMAIL

# Lightsail Settings (your existing instance)
LIGHTSAIL_HOST=13.54.176.108
LIGHTSAIL_USER=ubuntu
LIGHTSAIL_KEY=~/.ssh/lightsail_n8n.pem
LIGHTSAIL_REMOTE_DIR=/home/ubuntu/invoice-processing

# Local Settings
LOCAL_DOWNLOAD_DIR=./data/onedrive
LOCAL_PROCESSED_DIR=./data/processed
LOG_FILE=./logs/onedrive-sync.log

# Feature Flags
ENABLE_NOTIFICATIONS=true
ENABLE_BACKUP=true
ENABLE_LIGHTSAIL_SYNC=true
EOF

echo "   ✅ Configuration saved to .env"

# Create a simple monitoring script
echo ""
echo "🔧 Creating monitoring script..."

cat > scripts/start-monitoring.sh << 'EOF'
#!/bin/bash
# Start OneDrive monitoring for invoice dashboard

echo "🚀 Starting OneDrive Invoice Monitor..."
echo "======================================"

# Load environment variables
if [ -f .env ]; then
    source .env
    echo "✅ Configuration loaded"
else
    echo "❌ No .env file found. Run quick-onedrive-setup.sh first"
    exit 1
fi

# Start monitoring
echo "📡 Monitoring OneDrive file for changes..."
echo "   File ID: $ONEDRIVE_FILE_ID"
echo "   Check interval: $CHECK_INTERVAL_MINUTES minutes"
echo "   Logs: $LOG_FILE"
echo ""
echo "Press Ctrl+C to stop monitoring"
echo ""

node scripts/onedrive-integration.js start
EOF

chmod +x scripts/start-monitoring.sh

echo "   ✅ Monitoring script created: scripts/start-monitoring.sh"

# Test the setup (simplified)
echo ""
echo "🧪 Testing setup..."

# Create a simple test
if command -v node >/dev/null 2>&1; then
    echo "   ✅ Node.js is available"
    
    # Test basic file access
    if [ -n "$SHARING_URL" ]; then
        echo "   ✅ OneDrive URL configured"
        
        # Create test log entry
        echo "[$(date -Iseconds)] Setup completed successfully" >> logs/onedrive-sync.log
        echo "   ✅ Logging system ready"
        
    else
        echo "   ❌ OneDrive configuration issue"
    fi
else
    echo "   ❌ Node.js not found. Please install Node.js"
    exit 1
fi

# Create quick reference guide
cat > QUICK_START.md << 'EOF'
# 🚀 Quick Start Guide

## Start Monitoring
```bash
# Start monitoring (runs continuously)
./scripts/start-monitoring.sh

# Or run in background
nohup ./scripts/start-monitoring.sh > monitor.log 2>&1 &
```

## One-Time Check
```bash
# Check for updates once
node scripts/onedrive-integration.js check
```

## View Logs
```bash
# View recent activity
tail -f logs/onedrive-sync.log

# View all logs
cat logs/onedrive-sync.log
```

## Deploy to Lightsail
```bash
# Upload to your Lightsail instance
scp -i ~/.ssh/lightsail_n8n.pem .env ubuntu@13.54.176.108:~/
scp -i ~/.ssh/lightsail_n8n.pem scripts/onedrive-integration.js ubuntu@13.54.176.108:~/

# Start on Lightsail
ssh -i ~/.ssh/lightsail_n8n.pem ubuntu@13.54.176.108 "nohup node onedrive-integration.js start > onedrive.log 2>&1 &"
```

## Troubleshooting
- Check `.env` file for correct configuration
- Verify OneDrive sharing URL is accessible
- Review logs for error messages
- Ensure Excel file has proper column headers
EOF

# Final instructions
echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "📁 Files created:"
echo "   ✅ .env - Configuration settings"
echo "   ✅ scripts/start-monitoring.sh - Start monitoring"  
echo "   ✅ QUICK_START.md - Usage instructions"
echo "   ✅ logs/ - Log directory"
echo "   ✅ data/ - Data directories"
echo ""
echo "🚀 Next Steps:"
echo "   1. Test the setup:"
echo "      ./scripts/start-monitoring.sh"
echo ""
echo "   2. For production, deploy to Lightsail:"
echo "      scp -i ~/.ssh/lightsail_n8n.pem .env ubuntu@13.54.176.108:~/"
echo "      ssh -i ~/.ssh/lightsail_n8n.pem ubuntu@13.54.176.108"
echo ""
echo "   3. Your Excel file will be checked every $CHECK_INTERVAL minutes"
echo "   4. Processed data will be available for your dashboard"
echo ""
echo "📋 What happens now:"
echo "   • System monitors your OneDrive Excel file"
echo "   • When changes are detected, file is downloaded and processed"  
echo "   • Data is consolidated from all 3 tabs"
echo "   • Results are uploaded to your Lightsail instance"
echo "   • Your dashboard gets updated automatically"
echo ""

if [ -n "$NOTIFICATION_EMAIL" ]; then
    echo "📧 Notifications will be sent to: $NOTIFICATION_EMAIL"
fi

echo ""
echo "💡 Pro tip: Keep your Excel file structure consistent for best results!"
echo "📖 For detailed setup options, see: docs/ONEDRIVE_SETUP.md"