-- Neon SQL Editor: Seed Admin Users
-- Run this in your Neon SQL Editor to verify and create admin users

-- 1. Ensure all roles exist
INSERT INTO "Role" (id, name)
VALUES 
  ('role_super_admin', 'SUPER_ADMIN'),
  ('role_admin', 'ADMIN'),
  ('role_moderator', 'MODERATOR'),
  ('role_content_manager', 'CONTENT_MANAGER'),
  ('role_user', 'USER')
ON CONFLICT (name) DO NOTHING;

-- 2. Get the role IDs (you'll need these for the next step)
SELECT id, name FROM "Role" WHERE name IN ('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'CONTENT_MANAGER', 'USER');

-- 3. Check if admin users exist
SELECT 
  u.id,
  u.email,
  u.name,
  r.name as role_name,
  u."createdAt"
FROM "User" u
JOIN "Role" r ON u."roleId" = r.id
WHERE u.email IN (
  'superadmin@tijaniyahmuslimpro.com',
  'admin@tijaniyahmuslimpro.com',
  'moderator@tijaniyahmuslimpro.com',
  'content@tijaniyahmuslimpro.com'
)
ORDER BY u.email;

-- 4. Delete existing admin users (if you want to recreate them)
-- WARNING: This will delete existing admin users and their related data
-- DELETE FROM "User" WHERE email IN (
--   'superadmin@tijaniyahmuslimpro.com',
--   'admin@tijaniyahmuslimpro.com',
--   'moderator@tijaniyahmuslimpro.com',
--   'content@tijaniyahmuslimpro.com'
-- );

-- NOTE: Password hashing requires bcrypt, which SQL cannot do.
-- After running the above queries, use the API endpoint to set passwords:
-- POST https://tijaniyahmuslimpro-admin-mu.vercel.app/api/admin-reset-password
-- Body: {
--   "email": "superadmin@tijaniyahmuslimpro.com",
--   "password": "SuperAdmin123!@#",
--   "secret": "CHANGE_THIS_IN_PRODUCTION"
-- }


