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

  // Create admin users with different roles
  console.log('👤 Creating admin users...');
  
  const adminUsers = [
    {
      email: process.env.SEED_SUPER_ADMIN_EMAIL || 'superadmin@tijaniyahmuslimpro.com',
      password: process.env.SEED_SUPER_ADMIN_PASSWORD || 'SuperAdmin123!@#',
      name: 'Super Administrator',
      role: 'SUPER_ADMIN',
    },
    {
      email: process.env.SEED_ADMIN_EMAIL || 'admin@tijaniyahmuslimpro.com',
      password: process.env.SEED_ADMIN_PASSWORD || 'Admin123!@#',
      name: 'Administrator',
      role: 'ADMIN',
    },
    {
      email: process.env.SEED_MODERATOR_EMAIL || 'moderator@tijaniyahmuslimpro.com',
      password: process.env.SEED_MODERATOR_PASSWORD || 'Moderator123!@#',
      name: 'Content Moderator',
      role: 'MODERATOR',
    },
    {
      email: process.env.SEED_CONTENT_MANAGER_EMAIL || 'content@tijaniyahmuslimpro.com',
      password: process.env.SEED_CONTENT_MANAGER_PASSWORD || 'Content123!@#',
      name: 'Content Manager',
      role: 'CONTENT_MANAGER',
    },
  ];

  for (const adminUser of adminUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: adminUser.email },
    });

    if (existingUser) {
      console.log(`  ✓ ${adminUser.role} user already exists: ${adminUser.email}`);
    } else {
      const role = await prisma.role.findUnique({
        where: { name: adminUser.role },
      });

      if (!role) {
        console.error(`  ❌ Role "${adminUser.role}" not found, skipping user creation`);
        continue;
      }

      const passwordHash = await bcrypt.hash(adminUser.password, 12);

      await prisma.user.create({
        data: {
          email: adminUser.email,
          passwordHash,
          name: adminUser.name,
          roleId: role.id,
        },
      });

      console.log(`  ✓ ${adminUser.role} user created: ${adminUser.email}`);
      console.log(`     Password: ${adminUser.password}`);
      console.log(`     ⚠️  Please change this password after first login!`);
    }
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

