import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ROLES } from '@tmp/shared';

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

  // Create sample journal entries for admin user (optional)
  console.log('📔 Creating sample journal entries...');
  const adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (adminUser) {
    const existingEntries = await prisma.journalEntry.count({
      where: { userId: adminUser.id },
    });

    if (existingEntries === 0) {
      const sampleEntries = [
        {
          title: 'Gratitude for Today',
          content: 'Alhamdulillah for another day of blessings. Today I am grateful for the opportunity to learn and grow in my faith. May Allah continue to guide me on the straight path.',
          tags: ['gratitude', 'reflection', 'daily'],
          mood: 'grateful',
          category: 'gratitude',
          isPinned: true,
        },
        {
          title: 'Reflection on Patience',
          content: 'Today I learned the importance of patience (sabr) in Islam. The Prophet (SAW) said: "Patience is a light." I will strive to practice patience in all aspects of my life.',
          tags: ['patience', 'hadith', 'character'],
          mood: 'reflective',
          category: 'lesson',
          isPinned: false,
        },
        {
          title: 'Duʿā for Guidance',
          content: 'O Allah, guide me to the best of actions and the best of manners. None can guide to the best of them except You, and none can avert the worst of them except You.',
          tags: ['dua', 'guidance', 'prayer'],
          mood: 'prayerful',
          category: 'dua',
          isPinned: false,
        },
        {
          title: 'Goal: Daily Dhikr',
          content: 'My goal this week is to increase my daily dhikr. I will set aside time after each prayer to remember Allah and seek His forgiveness.',
          tags: ['goal', 'dhikr', 'worship'],
          mood: 'hopeful',
          category: 'goal',
          isPinned: false,
        },
        {
          title: 'Peace in Prayer',
          content: 'There is something so peaceful about standing in prayer, knowing that I am directly communicating with my Creator. This is where I find my greatest peace.',
          tags: ['prayer', 'peace', 'spirituality'],
          mood: 'peaceful',
          category: 'reflection',
          isPinned: true,
        },
      ];

      for (const entry of sampleEntries) {
        await prisma.journalEntry.create({
          data: {
            ...entry,
            userId: adminUser.id,
          },
        });
      }
      console.log(`  ✓ Created ${sampleEntries.length} sample journal entries`);
    } else {
      console.log(`  ✓ Journal entries already exist (${existingEntries} entries)`);
    }
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

