-- Complete Neon SQL: Create Admin Users with Password Hashes
-- 
-- STEP 1: Run generate-password-hash.js to get the password hashes:
--   cd packages/db
--   node generate-password-hash.js
--
-- STEP 2: Replace the password hashes below with the ones generated
-- STEP 3: Run this SQL in Neon SQL Editor

-- Ensure all roles exist
INSERT INTO "Role" (id, name)
VALUES 
  ('role_super_admin', 'SUPER_ADMIN'),
  ('role_admin', 'ADMIN'),
  ('role_moderator', 'MODERATOR'),
  ('role_content_manager', 'CONTENT_MANAGER'),
  ('role_user', 'USER')
ON CONFLICT (name) DO NOTHING;

-- Get role IDs (run this first to get the IDs, then use them in the INSERT below)
-- SELECT id, name FROM "Role" WHERE name IN ('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'CONTENT_MANAGER');

-- Create/Update admin users
-- Replace the role IDs and password hashes with actual values from step 1

-- Super Admin
INSERT INTO "User" (id, email, "passwordHash", name, "roleId", "createdAt", "updatedAt")
VALUES (
  'user_superadmin',
  'superadmin@tijaniyahmuslimpro.com',
  'REPLACE_WITH_SUPERADMIN_HASH', -- From generate-password-hash.js
  'Super Administrator',
  (SELECT id FROM "Role" WHERE name = 'SUPER_ADMIN'),
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  "passwordHash" = EXCLUDED."passwordHash",
  name = EXCLUDED.name,
  "roleId" = EXCLUDED."roleId",
  "updatedAt" = NOW();

-- Admin
INSERT INTO "User" (id, email, "passwordHash", name, "roleId", "createdAt", "updatedAt")
VALUES (
  'user_admin',
  'admin@tijaniyahmuslimpro.com',
  'REPLACE_WITH_ADMIN_HASH', -- From generate-password-hash.js
  'Administrator',
  (SELECT id FROM "Role" WHERE name = 'ADMIN'),
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  "passwordHash" = EXCLUDED."passwordHash",
  name = EXCLUDED.name,
  "roleId" = EXCLUDED."roleId",
  "updatedAt" = NOW();

-- Moderator
INSERT INTO "User" (id, email, "passwordHash", name, "roleId", "createdAt", "updatedAt")
VALUES (
  'user_moderator',
  'moderator@tijaniyahmuslimpro.com',
  'REPLACE_WITH_MODERATOR_HASH', -- From generate-password-hash.js
  'Content Moderator',
  (SELECT id FROM "Role" WHERE name = 'MODERATOR'),
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  "passwordHash" = EXCLUDED."passwordHash",
  name = EXCLUDED.name,
  "roleId" = EXCLUDED."roleId",
  "updatedAt" = NOW();

-- Content Manager
INSERT INTO "User" (id, email, "passwordHash", name, "roleId", "createdAt", "updatedAt")
VALUES (
  'user_content',
  'content@tijaniyahmuslimpro.com',
  'REPLACE_WITH_CONTENT_HASH', -- From generate-password-hash.js
  'Content Manager',
  (SELECT id FROM "Role" WHERE name = 'CONTENT_MANAGER'),
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  "passwordHash" = EXCLUDED."passwordHash",
  name = EXCLUDED.name,
  "roleId" = EXCLUDED."roleId",
  "updatedAt" = NOW();

-- Verify the users were created
SELECT 
  u.email,
  u.name,
  r.name as role,
  u."createdAt"
FROM "User" u
JOIN "Role" r ON u."roleId" = r.id
WHERE u.email IN (
  'superadmin@tijaniyahmuslimpro.com',
  'admin@tijaniyahmuslimpro.com',
  'moderator@tijaniyahmuslimpro.com',
  'content@tijaniyahmuslimpro.com'
)
ORDER BY r.name;

