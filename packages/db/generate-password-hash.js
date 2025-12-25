// Quick script to generate bcrypt password hashes for SQL insertion
// Run: node generate-password-hash.js

const bcrypt = require('bcryptjs');

const passwords = {
  superadmin: 'SuperAdmin123!@#',
  admin: 'Admin123!@#',
  moderator: 'Moderator123!@#',
  content: 'Content123!@#'
};

async function generateHashes() {
  console.log('Generating bcrypt hashes for admin passwords...\n');
  
  for (const [role, password] of Object.entries(passwords)) {
    const hash = await bcrypt.hash(password, 12);
    console.log(`${role.toUpperCase()}:`);
    console.log(`  Email: ${role}@tijaniyahmuslimpro.com`);
    console.log(`  Password: ${password}`);
    console.log(`  Hash: ${hash}\n`);
  }
  
  console.log('\nUse these hashes in the SQL INSERT statements below.');
}

generateHashes().catch(console.error);


