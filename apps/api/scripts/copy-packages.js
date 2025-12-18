const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '..');
const rootDir = path.join(apiDir, '../..');

// Ensure node_modules exists
const nodeModulesDir = path.join(apiDir, 'node_modules');
if (!fs.existsSync(nodeModulesDir)) {
  fs.mkdirSync(nodeModulesDir, { recursive: true });
}

// Copy shared package
const sharedPackageDir = path.join(nodeModulesDir, '@tmp', 'shared');
if (!fs.existsSync(sharedPackageDir)) {
  fs.mkdirSync(sharedPackageDir, { recursive: true });
}

const sharedSrc = path.join(rootDir, 'packages/shared/src');
const sharedDest = path.join(sharedPackageDir, 'src');
if (fs.existsSync(sharedSrc)) {
  copyRecursiveSync(sharedSrc, sharedDest);
  // Copy package.json
  const sharedPkgJson = path.join(rootDir, 'packages/shared/package.json');
  if (fs.existsSync(sharedPkgJson)) {
    fs.copyFileSync(sharedPkgJson, path.join(sharedPackageDir, 'package.json'));
  }
  console.log('✅ Copied @tmp/shared package');
}

// Copy db package
const dbPackageDir = path.join(nodeModulesDir, '@tmp', 'db');
if (!fs.existsSync(dbPackageDir)) {
  fs.mkdirSync(dbPackageDir, { recursive: true });
}

const dbSrc = path.join(rootDir, 'packages/db/src');
const dbDest = path.join(dbPackageDir, 'src');
if (fs.existsSync(dbSrc)) {
  copyRecursiveSync(dbSrc, dbDest);
  // Copy package.json
  const dbPkgJson = path.join(rootDir, 'packages/db/package.json');
  if (fs.existsSync(dbPkgJson)) {
    fs.copyFileSync(dbPkgJson, path.join(dbPackageDir, 'package.json'));
  }
  // Copy prisma directory (needed for generated client)
  const prismaSrc = path.join(rootDir, 'packages/db/prisma');
  const prismaDest = path.join(dbPackageDir, 'prisma');
  if (fs.existsSync(prismaSrc)) {
    copyRecursiveSync(prismaSrc, prismaDest);
  }
  console.log('✅ Copied @tmp/db package');
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

