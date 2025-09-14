#!/bin/bash

# Comprehensive Prisma Cleanup Script
# This script removes ALL Prisma traces to fix Vercel build errors

set -e

echo "🧹 Starting comprehensive Prisma cleanup..."
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    local status=$1
    local message=$2
    case $status in
        "SUCCESS") echo -e "${GREEN}✅ SUCCESS${NC}: $message" ;;
        "WARNING") echo -e "${YELLOW}⚠️  WARNING${NC}: $message" ;;
        "INFO") echo -e "ℹ️  INFO: $message" ;;
    esac
}

# 1. Remove any remaining Prisma directories
print_status "INFO" "Removing Prisma directories..."
rm -rf prisma/ 2>/dev/null || true
rm -rf node_modules/.prisma/ 2>/dev/null || true
rm -rf node_modules/@prisma/ 2>/dev/null || true
rm -rf .prisma/ 2>/dev/null || true
find . -name "*prisma*" -type d -not -path "./node_modules/*" -exec rm -rf {} + 2>/dev/null || true
print_status "SUCCESS" "Prisma directories cleaned"

# 2. Remove Prisma-related files
print_status "INFO" "Removing Prisma files..."
find . -name "*.prisma" -not -path "./node_modules/*" -delete 2>/dev/null || true
find . -name "prisma-client-*" -delete 2>/dev/null || true
find . -name ".env.prisma" -delete 2>/dev/null || true
print_status "SUCCESS" "Prisma files cleaned"

# 3. Clean node_modules and lock files completely
print_status "INFO" "Cleaning dependency cache..."
rm -rf node_modules/
rm -f package-lock.json yarn.lock pnpm-lock.yaml
print_status "SUCCESS" "Dependency cache cleaned"

# 4. Clean Next.js build artifacts
print_status "INFO" "Cleaning Next.js artifacts..."
rm -rf .next/
rm -rf out/
rm -rf dist/
rm -rf build/
print_status "SUCCESS" "Next.js artifacts cleaned"

# 5. Verify package.json is clean
print_status "INFO" "Verifying package.json..."
if grep -q "prisma\|@prisma" package.json; then
    print_status "WARNING" "Found Prisma references in package.json - please review manually"
    grep -n "prisma\|@prisma" package.json || true
else
    print_status "SUCCESS" "package.json is clean of Prisma references"
fi

# 6. Fresh dependency install
print_status "INFO" "Installing fresh dependencies..."
npm install --no-optional --prefer-offline=false
print_status "SUCCESS" "Dependencies reinstalled"

# 7. Verify no Prisma references in source code
print_status "INFO" "Scanning source code for Prisma references..."
PRISMA_REFS=$(grep -r "import.*prisma\|from.*prisma\|@prisma\|PrismaClient" src/ lib/ pages/ components/ app/ 2>/dev/null | grep -v ".backup" | wc -l || echo "0")
if [ "$PRISMA_REFS" -gt 0 ]; then
    print_status "WARNING" "Found $PRISMA_REFS Prisma references in source code:"
    grep -r "import.*prisma\|from.*prisma\|@prisma\|PrismaClient" src/ lib/ pages/ components/ app/ 2>/dev/null | grep -v ".backup" || true
else
    print_status "SUCCESS" "No Prisma references found in source code"
fi

# 8. Test build locally
print_status "INFO" "Testing local build..."
if npm run build; then
    print_status "SUCCESS" "Local build completed successfully!"
else
    print_status "WARNING" "Local build failed - check logs above"
    exit 1
fi

echo ""
echo "=========================================="
print_status "SUCCESS" "Prisma cleanup completed!"
echo ""
echo "Next steps:"
echo "1. Commit these changes: git add -A && git commit -m 'fix: complete Prisma cleanup for Vercel deployment'"
echo "2. Push to trigger new Vercel build: git push origin main"
echo "3. Monitor Vercel deployment logs"
echo ""