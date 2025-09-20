#!/bin/bash

# RPD Invoice Dashboard - Quick Setup Script
echo "🏢 Setting up RPD Invoice Dashboard..."

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node --version | sed 's/v//')
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js version $NODE_VERSION found. Requires 18.0.0+"
    exit 1
fi

echo "✅ Node.js version: $NODE_VERSION"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Build the project
echo "🏗️ Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "🎉 RPD Invoice Dashboard setup complete!"
echo ""
echo "🚀 To start the dashboard:"
echo "   npm run dev    (development mode)"
echo "   npm start      (production mode)"
echo ""
echo "🌐 Dashboard will be available at: http://localhost:3000"
echo "📊 Invoice management: http://localhost:3000/invoices"
echo ""
echo "📋 Features included:"
echo "   ✅ Real invoice data from May 1st, 2025"
echo "   ✅ Clickable invoice links to source systems"
echo "   ✅ Professional RPD branding"
echo "   ✅ Advanced filtering and search"
echo "   ✅ CSV export functionality"
echo "   ✅ Responsive design"
echo ""
echo "📖 See DEPLOYMENT_PACKAGE.md for complete documentation"