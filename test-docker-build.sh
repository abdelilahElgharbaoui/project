#!/bin/bash

echo "=== Testing Docker Build Process ==="

# Check if files exist
echo "1. Checking if source files exist:"
ls -la src/contexts/
ls -la src/components/

echo ""
echo "2. Checking package.json dependencies:"
cat package.json | grep -A 10 "dependencies"

echo ""
echo "3. Checking TypeScript config:"
cat tsconfig.json | grep -A 5 "paths"

echo ""
echo "4. Testing local build:"
npm run build

echo ""
echo "5. If local build succeeds but Docker fails, the issue is likely:"
echo "   - Docker context not copying files correctly"
echo "   - Environment differences between local and Docker"
echo "   - Path resolution issues in Docker container" 