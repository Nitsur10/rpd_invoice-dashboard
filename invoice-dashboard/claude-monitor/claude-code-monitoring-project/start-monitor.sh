#!/bin/bash

# Claude Code Real-Time Monitoring System
# Quick launcher script

echo "🎯 Claude Code Real-Time Monitoring System"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "src/server.py" ]; then
    echo "❌ Error: Please run this script from the claude-code-monitoring-project directory"
    echo "   Expected file: src/server.py"
    exit 1
fi

# Kill any existing servers on port 7778
echo "🔍 Checking for existing servers on port 7778..."
if lsof -ti:7778 >/dev/null 2>&1; then
    echo "🛑 Killing existing server..."
    lsof -ti:7778 | xargs kill -9
    sleep 1
fi

# Change to src directory
cd src

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: python3 is required but not installed"
    exit 1
fi

echo "🚀 Starting Claude Code monitoring server..."
echo "📊 Dashboard will be available at: http://127.0.0.1:7778"
echo "⚡ Features: Real-time agents, usage history, token analytics"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=================================="

# Start the server
python3 server.py