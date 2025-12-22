import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verifying admin user...\n');

  const email = 'superadmin@tijaniyahmuslimpro.com';
  const password = 'SuperAdmin123!@#';

  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  if (!user) {
    console.log(`❌ User not found: ${email}`);
    console.log('\n📝 Creating user...');
    
    const role = await prisma.role.findUnique({
      where: { name: 'SUPER_ADMIN' },
    });

    if (!role) {
      console.error('❌ SUPER_ADMIN role not found');
      process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: 'Super Administrator',
        roleId: role.id,
      },
      include: { role: true },
    });

    console.log(`✅ User created: ${newUser.email}`);
    console.log(`   Role: ${newUser.role.name}`);
    console.log(`   Password: ${password}`);
  } else {
    console.log(`✅ User found: ${user.email}`);
    console.log(`   Role: ${user.role.name}`);
    console.log(`   Name: ${user.name}`);
    
    // Test password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (passwordMatch) {
      console.log(`✅ Password verification: PASSED`);
    } else {
      console.log(`❌ Password verification: FAILED`);
      console.log('\n🔄 Resetting password...');
      
      const newPasswordHash = await bcrypt.hash(password, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newPasswordHash },
      });
      
      console.log(`✅ Password reset successful`);
      console.log(`   New password: ${password}`);
    }
  }

  console.log('\n✅ Verification complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

