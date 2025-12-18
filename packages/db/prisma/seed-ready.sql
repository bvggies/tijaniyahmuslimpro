-- Database Seed Script for Neon SQL Editor
-- This script is ready to run - just generate the password hash first!

-- STEP 1: Generate password hash
-- Go to: https://bcrypt-generator.com/
-- Password: Admin123!@#
-- Rounds: 12
-- Copy the generated hash and replace <PASSWORD_HASH> below

-- STEP 2: Run this entire script in Neon SQL Editor

-- 1. Create all roles
INSERT INTO "Role" (id, name)
VALUES 
  (gen_random_uuid()::text, 'SUPER_ADMIN'),
  (gen_random_uuid()::text, 'ADMIN'),
  (gen_random_uuid()::text, 'MODERATOR'),
  (gen_random_uuid()::text, 'CONTENT_MANAGER'),
  (gen_random_uuid()::text, 'USER')
ON CONFLICT (name) DO NOTHING;

-- 2. Create initial AppSettings (if it doesn't exist)
INSERT INTO "AppSettings" (id, "maintenanceMode", "makkahStreamUrl", "faqJson", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  false,
  NULL,
  NULL,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM "AppSettings" LIMIT 1);

-- 3. Create initial SUPER_ADMIN user
-- REPLACE <PASSWORD_HASH> with the hash from bcrypt-generator.com
INSERT INTO "User" (id, email, "passwordHash", name, "roleId", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  'admin@tijaniyahmuslimpro.com',
  '$2a$12$Pyq1eHKWryDqGWxtnoX46uYdCoWHLvLEyYNBZzl.3l9zMFZoJcBq2', -- REPLACE THIS: Get hash from https://bcrypt-generator.com/ (password: Admin123!@#, rounds: 12)
  'Super Admin',
  (SELECT id FROM "Role" WHERE name = 'SUPER_ADMIN' LIMIT 1),
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM "User" WHERE email = 'admin@tijaniyahmuslimpro.com');

-- 4. Verify the data was created
SELECT '✓ Roles created:' as status;
SELECT id, name FROM "Role" ORDER BY name;

SELECT '✓ AppSettings created:' as status;
SELECT id, "maintenanceMode", "makkahStreamUrl" FROM "AppSettings";

SELECT '✓ Admin user created:' as status;
SELECT u.id, u.email, u.name, r.name as role 
FROM "User" u 
JOIN "Role" r ON u."roleId" = r.id 
WHERE u.email = 'admin@tijaniyahmuslimpro.com';

