import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { prisma } from '@tmp/db';
import { badRequest, methodNotAllowed, ok, serverError } from '../lib/response';

/**
 * Emergency endpoint to reset admin password
 * Only works if no admin users exist, or if called with a secret key
 * SECURITY: Remove or protect this endpoint in production!
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res);

  try {
    const { email, password, secret } = req.body;

    // Basic protection - require a secret key
    const expectedSecret = process.env.ADMIN_RESET_SECRET || 'CHANGE_THIS_IN_PRODUCTION';
    if (secret !== expectedSecret) {
      return badRequest(res, { error: 'INVALID_SECRET', message: 'Invalid secret key' });
    }

    if (!email || !password) {
      return badRequest(res, { error: 'INVALID_INPUT', message: 'Email and password required' });
    }

    // Find or create the user
    let user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      // Create user if doesn't exist
      const role = await prisma.role.findUnique({
        where: { name: 'SUPER_ADMIN' },
      });

      if (!role) {
        return serverError(res, { error: 'ROLE_NOT_FOUND', message: 'SUPER_ADMIN role not found' });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name: 'Super Administrator',
          roleId: role.id,
        },
        include: { role: true },
      });

      return ok(res, {
        message: 'User created successfully',
        email: user.email,
        role: user.role.name,
      });
    } else {
      // Reset password for existing user
      const passwordHash = await bcrypt.hash(password, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });

      return ok(res, {
        message: 'Password reset successfully',
        email: user.email,
        role: user.role.name,
      });
    }
  } catch (error) {
    console.error('admin-reset-password error', error);
    return serverError(res);
  }
}

