#!/bin/bash

# Agent Development Monitor Startup Script
# This script starts the standalone agent monitoring dashboard

echo "🎯 Starting Agent Development Monitor..."
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    echo "Please install Python 3 and try again."
    exit 1
fi

# Navigate to monitor directory
cd "$(dirname "$0")/dev-monitor"

echo "📊 Agent Development Monitor"
echo "🚀 Dashboard will open at: http://localhost:8888"
echo "💡 Use this to track agent performance during development"
echo "📋 Features:"
echo "   • Real-time agent status tracking"
echo "   • Performance metrics and analytics"
echo "   • Activity logging and history"
echo "   • Task execution monitoring"
echo ""
echo "🔄 Starting server..."
echo ""

# Start the Python server
python3 server.py