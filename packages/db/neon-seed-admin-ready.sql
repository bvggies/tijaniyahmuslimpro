-- ============================================
-- READY-TO-USE SQL FOR NEON SQL EDITOR
-- Copy and paste this entire file into Neon SQL Editor
-- ============================================

-- Step 1: Ensure all roles exist
INSERT INTO "Role" (id, name)
VALUES 
  ('role_super_admin', 'SUPER_ADMIN'),
  ('role_admin', 'ADMIN'),
  ('role_moderator', 'MODERATOR'),
  ('role_content_manager', 'CONTENT_MANAGER'),
  ('role_user', 'USER')
ON CONFLICT (name) DO NOTHING;

-- Step 2: Create/Update Super Admin user
INSERT INTO "User" (id, email, "passwordHash", name, "roleId", "createdAt", "updatedAt")
SELECT 
  COALESCE((SELECT id FROM "User" WHERE email = 'superadmin@tijaniyahmuslimpro.com'), 'clx' || substr(md5('superadmin@tijaniyahmuslimpro.com' || random()::text), 1, 26)),
  'superadmin@tijaniyahmuslimpro.com',
  '$2a$12$.OSWj2kAAPleSHWndPw5QODokOkt4KDkXGTHyW82BLlS.iG8jhGti',
  'Super Administrator',
  (SELECT id FROM "Role" WHERE name = 'SUPER_ADMIN'),
  NOW(),
  NOW()
ON CONFLICT (email) DO UPDATE SET
  "passwordHash" = EXCLUDED."passwordHash",
  name = EXCLUDED.name,
  "roleId" = EXCLUDED."roleId",
  "updatedAt" = NOW();

-- Step 3: Create/Update Admin user
INSERT INTO "User" (id, email, "passwordHash", name, "roleId", "createdAt", "updatedAt")
SELECT 
  COALESCE((SELECT id FROM "User" WHERE email = 'admin@tijaniyahmuslimpro.com'), 'clx' || substr(md5('admin@tijaniyahmuslimpro.com' || random()::text), 1, 26)),
  'admin@tijaniyahmuslimpro.com',
  '$2a$12$AsZkCT5I3nc.AWD0X3Rr6.XgCPDwkM8/5mrhFQpEYGChDKfG7rut2',
  'Administrator',
  (SELECT id FROM "Role" WHERE name = 'ADMIN'),
  NOW(),
  NOW()
ON CONFLICT (email) DO UPDATE SET
  "passwordHash" = EXCLUDED."passwordHash",
  name = EXCLUDED.name,
  "roleId" = EXCLUDED."roleId",
  "updatedAt" = NOW();

-- Step 4: Create/Update Moderator user
INSERT INTO "User" (id, email, "passwordHash", name, "roleId", "createdAt", "updatedAt")
SELECT 
  COALESCE((SELECT id FROM "User" WHERE email = 'moderator@tijaniyahmuslimpro.com'), 'clx' || substr(md5('moderator@tijaniyahmuslimpro.com' || random()::text), 1, 26)),
  'moderator@tijaniyahmuslimpro.com',
  '$2a$12$W52kruvVrELftVywhZmY7eUjGRIHS6Tun0WzhVJ3Y9c8LdXAP3iR2',
  'Content Moderator',
  (SELECT id FROM "Role" WHERE name = 'MODERATOR'),
  NOW(),
  NOW()
ON CONFLICT (email) DO UPDATE SET
  "passwordHash" = EXCLUDED."passwordHash",
  name = EXCLUDED.name,
  "roleId" = EXCLUDED."roleId",
  "updatedAt" = NOW();

-- Step 5: Create/Update Content Manager user
INSERT INTO "User" (id, email, "passwordHash", name, "roleId", "createdAt", "updatedAt")
SELECT 
  COALESCE((SELECT id FROM "User" WHERE email = 'content@tijaniyahmuslimpro.com'), 'clx' || substr(md5('content@tijaniyahmuslimpro.com' || random()::text), 1, 26)),
  'content@tijaniyahmuslimpro.com',
  '$2a$12$jXOsJ7Se3AiGq6iqqgIe8O.qNSsMQOiYucSb8neGPY2kvTWR8IMK.',
  'Content Manager',
  (SELECT id FROM "Role" WHERE name = 'CONTENT_MANAGER'),
  NOW(),
  NOW()
ON CONFLICT (email) DO UPDATE SET
  "passwordHash" = EXCLUDED."passwordHash",
  name = EXCLUDED.name,
  "roleId" = EXCLUDED."roleId",
  "updatedAt" = NOW();

-- Step 6: Verify the users were created/updated
SELECT 
  u.email,
  u.name,
  r.name as role,
  u."createdAt",
  u."updatedAt"
FROM "User" u
JOIN "Role" r ON u."roleId" = r.id
WHERE u.email IN (
  'superadmin@tijaniyahmuslimpro.com',
  'admin@tijaniyahmuslimpro.com',
  'moderator@tijaniyahmuslimpro.com',
  'content@tijaniyahmuslimpro.com'
)
ORDER BY r.name;

-- ============================================
-- LOGIN CREDENTIALS:
-- ============================================
-- Super Admin:
--   Email: superadmin@tijaniyahmuslimpro.com
--   Password: SuperAdmin123!@#
--
-- Admin:
--   Email: admin@tijaniyahmuslimpro.com
--   Password: Admin123!@#
--
-- Moderator:
--   Email: moderator@tijaniyahmuslimpro.com
--   Password: Moderator123!@#
--
-- Content Manager:
--   Email: content@tijaniyahmuslimpro.com
--   Password: Content123!@#
-- ============================================

