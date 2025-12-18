const fs = require('fs');
const path = require('path');

// Copy shared package
const sharedSrc = path.join(__dirname, '../../../packages/shared/src');
const sharedDest = path.join(__dirname, '../node_modules/@tmp/shared/src');
if (fs.existsSync(sharedSrc)) {
  if (!fs.existsSync(path.dirname(sharedDest))) {
    fs.mkdirSync(path.dirname(sharedDest), { recursive: true });
  }
  copyRecursiveSync(sharedSrc, sharedDest);
  // Copy package.json
  fs.copyFileSync(
    path.join(__dirname, '../../../packages/shared/package.json'),
    path.join(__dirname, '../node_modules/@tmp/shared/package.json')
  );
}

// Copy db package
const dbSrc = path.join(__dirname, '../../../packages/db/src');
const dbDest = path.join(__dirname, '../node_modules/@tmp/db/src');
if (fs.existsSync(dbSrc)) {
  if (!fs.existsSync(path.dirname(dbDest))) {
    fs.mkdirSync(path.dirname(dbDest), { recursive: true });
  }
  copyRecursiveSync(dbSrc, dbDest);
  // Copy package.json
  fs.copyFileSync(
    path.join(__dirname, '../../../packages/db/package.json'),
    path.join(__dirname, '../node_modules/@tmp/db/package.json')
  );
  // Copy prisma directory
  const prismaSrc = path.join(__dirname, '../../../packages/db/prisma');
  const prismaDest = path.join(__dirname, '../node_modules/@tmp/db/prisma');
  if (fs.existsSync(prismaSrc)) {
    copyRecursiveSync(prismaSrc, prismaDest);
  }
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

