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
