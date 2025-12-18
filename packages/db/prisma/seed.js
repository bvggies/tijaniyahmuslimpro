const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'MODERATOR',
  'CONTENT_MANAGER',
  'USER',
];

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create all roles
  console.log('📋 Creating roles...');
  for (const roleName of ROLES) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
    console.log(`  ✓ Role "${roleName}" created/verified`);
  }

  // Create initial AppSettings if it doesn't exist
  console.log('⚙️  Creating app settings...');
  const existingSettings = await prisma.appSettings.findFirst();
  if (!existingSettings) {
    await prisma.appSettings.create({
      data: {
        maintenanceMode: false,
        makkahStreamUrl: null,
        faqJson: null,
      },
    });
    console.log('  ✓ App settings created');
  } else {
    console.log('  ✓ App settings already exist');
  }

  // Create initial SUPER_ADMIN user (if not exists)
  console.log('👤 Creating initial admin user...');
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@tijaniyahmuslimpro.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin123!@#';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`  ✓ Admin user already exists: ${adminEmail}`);
  } else {
    const superAdminRole = await prisma.role.findUnique({
      where: { name: 'SUPER_ADMIN' },
    });

    if (!superAdminRole) {
      throw new Error('SUPER_ADMIN role not found');
    }

    const passwordHash = await bcrypt.hash(adminPassword, 12);

    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: 'Super Admin',
        roleId: superAdminRole.id,
      },
    });

    console.log(`  ✓ Admin user created: ${adminEmail}`);
    console.log(`  ⚠️  Default password: ${adminPassword}`);
    console.log(`  ⚠️  Please change this password after first login!`);
  }

  console.log('✅ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

