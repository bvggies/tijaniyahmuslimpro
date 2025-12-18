-- Database Seed Script for Neon SQL Editor
-- Run this in Neon's SQL Editor to populate initial data

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
-- Default password: Admin123!@#
-- 
-- To generate the bcrypt hash:
-- 1. Go to https://bcrypt-generator.com/
-- 2. Enter password: Admin123!@#
-- 3. Set rounds: 12
-- 4. Copy the generated hash and replace the one below
--
-- OR use this pre-generated hash (for Admin123!@#):
-- Generated using bcrypt with 12 rounds

INSERT INTO "User" (id, email, "passwordHash", name, "roleId", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  'admin@tijaniyahmuslimpro.com',
  '$2a$12$rKqXqXqXqXqXqXqXqXqXeKqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqX', -- TODO: Replace with actual bcrypt hash from https://bcrypt-generator.com/
  'Super Admin',
  (SELECT id FROM "Role" WHERE name = 'SUPER_ADMIN' LIMIT 1),
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM "User" WHERE email = 'admin@tijaniyahmuslimpro.com');

-- Verify the data was created
SELECT 'Roles created:' as info;
SELECT id, name FROM "Role" ORDER BY name;

SELECT 'AppSettings created:' as info;
SELECT id, "maintenanceMode", "makkahStreamUrl" FROM "AppSettings";

SELECT 'Admin user created:' as info;
SELECT u.id, u.email, u.name, r.name as role 
FROM "User" u 
JOIN "Role" r ON u."roleId" = r.id 
WHERE u.email = 'admin@tijaniyahmuslimpro.com';

