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
