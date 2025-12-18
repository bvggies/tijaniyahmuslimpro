const fs = require('fs');
const path = require('path');

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
  // Copy to node_modules
  const nodeModulesPackageDir = path.join(nodeModulesDir, '@tmp', packageName);
  if (!fs.existsSync(nodeModulesPackageDir)) {
    fs.mkdirSync(nodeModulesPackageDir, { recursive: true });
  }
  
  const nodeModulesSrc = path.join(srcPath, 'src');
  const nodeModulesDest = path.join(nodeModulesPackageDir, 'src');
  if (fs.existsSync(nodeModulesSrc)) {
    copyRecursiveSync(nodeModulesSrc, nodeModulesDest);
    const pkgJson = path.join(srcPath, 'package.json');
    if (fs.existsSync(pkgJson)) {
      fs.copyFileSync(pkgJson, path.join(nodeModulesPackageDir, 'package.json'));
    }
    console.log(`✅ Copied @tmp/${packageName} to node_modules`);
  }
  
  // Copy to _packages (for Vercel)
  const packagesPackageDir = path.join(packagesDir, '@tmp', packageName);
  if (!fs.existsSync(packagesPackageDir)) {
    fs.mkdirSync(packagesPackageDir, { recursive: true });
  }
  
  const packagesSrc = path.join(srcPath, 'src');
  const packagesDest = path.join(packagesPackageDir, 'src');
  if (fs.existsSync(packagesSrc)) {
    copyRecursiveSync(packagesSrc, packagesDest);
    const pkgJson = path.join(srcPath, 'package.json');
    if (fs.existsSync(pkgJson)) {
      fs.copyFileSync(pkgJson, path.join(packagesPackageDir, 'package.json'));
    }
    console.log(`✅ Copied @tmp/${packageName} to _packages`);
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

