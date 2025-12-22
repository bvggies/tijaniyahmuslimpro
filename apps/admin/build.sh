#!/bin/bash
set -e

# Navigate to repo root
cd "$(dirname "$0")/../.."

# Install all dependencies (this will install workspace packages)
echo "Installing dependencies..."
npm install

# Build shared package if it has a build script
if [ -f "packages/shared/package.json" ]; then
  echo "Building shared package..."
  cd packages/shared
  if npm run build 2>/dev/null; then
    echo "Shared package built successfully"
  else
    echo "Shared package build skipped (no build script or already built)"
  fi
  cd ../..
fi

# Build admin app
echo "Building admin app..."
cd apps/admin
npm run build

echo "Build completed successfully!"

