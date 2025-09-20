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
