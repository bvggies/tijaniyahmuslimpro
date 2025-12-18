const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '..');
const rootDir = path.join(apiDir, '../..');

console.log('📦 Starting package copy...');
console.log('API Dir:', apiDir);
console.log('Root Dir:', rootDir);

// Copy to both node_modules (for local dev) and _packages (for Vercel deployment)
const nodeModulesDir = path.join(apiDir, 'node_modules');
const packagesDir = path.join(apiDir, '_packages');

// Ensure directories exist
if (!fs.existsSync(nodeModulesDir)) {
  fs.mkdirSync(nodeModulesDir, { recursive: true });
}
if (!fs.existsSync(packagesDir)) {
  fs.mkdirSync(packagesDir, { recursive: true });
}

function copyPackage(packageName, srcPath) {
  // Copy compiled dist to node_modules
  const nodeModulesPackageDir = path.join(nodeModulesDir, '@tmp', packageName);
  if (!fs.existsSync(nodeModulesPackageDir)) {
    fs.mkdirSync(nodeModulesPackageDir, { recursive: true });
  }
  
  // Try to copy dist (compiled JS) first, fallback to src (TS) if dist doesn't exist
  const distPath = path.join(srcPath, 'dist');
  const srcPath_actual = path.join(srcPath, 'src');
  const nodeModulesDest = nodeModulesPackageDir;
  
  if (fs.existsSync(distPath)) {
    // Copy compiled JavaScript
    copyRecursiveSync(distPath, path.join(nodeModulesDest, 'dist'));
    console.log(`✅ Copied @tmp/${packageName} dist to node_modules`);
  } else if (fs.existsSync(srcPath_actual)) {
    // Fallback: copy TypeScript source
    copyRecursiveSync(srcPath_actual, path.join(nodeModulesDest, 'src'));
    console.log(`⚠️  Copied @tmp/${packageName} src (TS) to node_modules (dist not found)`);
  }
  
  // Copy package.json
  const pkgJson = path.join(srcPath, 'package.json');
  if (fs.existsSync(pkgJson)) {
    fs.copyFileSync(pkgJson, path.join(nodeModulesDest, 'package.json'));
  }
}

// Copy shared package
const sharedSrc = path.join(rootDir, 'packages/shared');
if (fs.existsSync(sharedSrc)) {
  copyPackage('shared', sharedSrc);
} else {
  console.error('❌ Shared source not found:', sharedSrc);
}

// Copy db package
const dbSrc = path.join(rootDir, 'packages/db');
if (fs.existsSync(dbSrc)) {
  copyPackage('db', dbSrc);
  
  // Also copy Prisma files to node_modules (needed for Prisma client)
  const prismaSrc = path.join(dbSrc, 'prisma');
  const prismaDest = path.join(nodeModulesDir, '@tmp', 'db', 'prisma');
  if (fs.existsSync(prismaSrc)) {
    copyRecursiveSync(prismaSrc, prismaDest);
  }
  
  // Copy node_modules/@prisma/client if it exists (for Prisma client)
  const prismaClientSrc = path.join(dbSrc, 'node_modules', '@prisma', 'client');
  const prismaClientDest = path.join(nodeModulesDir, '@prisma', 'client');
  if (fs.existsSync(prismaClientSrc)) {
    if (!fs.existsSync(path.join(nodeModulesDir, '@prisma'))) {
      fs.mkdirSync(path.join(nodeModulesDir, '@prisma'), { recursive: true });
    }
    copyRecursiveSync(prismaClientSrc, prismaClientDest);
    console.log('✅ Copied @prisma/client to node_modules');
  }
} else {
  console.error('❌ DB source not found:', dbSrc);
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('✅ Copied workspace packages to node_modules');

