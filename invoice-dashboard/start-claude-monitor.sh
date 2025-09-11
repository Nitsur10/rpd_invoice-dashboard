#!/bin/bash

# Claude Code Live Agent Monitor Startup Script
# Real-time monitoring of Claude Code agent activity and token usage

echo "🎯 Starting Claude Code Live Agent Monitor..."
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    echo "Please install Python 3 and try again."
    exit 1
fi

# Navigate to monitor directory
cd "$(dirname "$0")/claude-monitor"

echo "🔴 Claude Code - Live Agent Monitor"
echo "📊 Dashboard will open at: http://localhost:7777"
echo "⚡ Features:"
echo "   • Real-time Claude Code integration"
echo "   • Live token usage tracking (32k/200k)"
echo "   • Agent activity monitoring"
echo "   • File system change detection"
echo "   • Session time and cost tracking"
echo ""
echo "💡 This monitor connects to your actual Claude Code session"
echo "📈 Track agent performance and token consumption in real-time"
echo ""
echo "🔄 Starting server..."
echo ""

# Start the Python server
python3 server.py