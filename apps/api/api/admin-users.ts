import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { prisma } from '@tmp/db';
import { requireRole } from '../lib/auth';
import { methodNotAllowed, ok, serverError, badRequest } from '../lib/response';
import { apiError } from '@tmp/shared';
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
  roleName: z.string(),
});

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional().nullable(),
  roleName: z.string().optional(),
  password: z.string().min(8).optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'DELETE') {
    return methodNotAllowed(res);
  }

  try {
    await requireRole(req, ['SUPER_ADMIN', 'ADMIN']);

    if (req.method === 'GET') {
      const users = await prisma.user.findMany({
        include: { role: true },
        orderBy: { createdAt: 'desc' },
      });

      return ok(res, {
        users: users.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role.name,
          avatarUrl: u.avatarUrl,
          createdAt: u.createdAt,
        })),
      });
    }

    if (req.method === 'POST') {
      const parsed = createUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', parsed.error.flatten()));
      }

      const { email, password, name, roleName } = parsed.data;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return badRequest(res, apiError('EMAIL_IN_USE', 'EMAIL_IN_USE'));
      }

      const role = await prisma.role.findUnique({ where: { name: roleName } });
      if (!role) {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', 'Invalid role'));
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          roleId: role.id,
        },
        include: { role: true },
      });

      return ok(res, {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role.name,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
        },
      });
    }

    if (req.method === 'PUT') {
      const { id, ...data } = req.body;
      if (!id) {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', 'Missing id'));
      }

      const parsed = updateUserSchema.safeParse(data);
      if (!parsed.success) {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', parsed.error.flatten()));
      }

      const updateData: any = {};
      if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
      if (parsed.data.email) {
        const existing = await prisma.user.findFirst({
          where: { email: parsed.data.email, NOT: { id } },
        });
        if (existing) {
          return badRequest(res, apiError('EMAIL_IN_USE', 'EMAIL_IN_USE'));
        }
        updateData.email = parsed.data.email;
      }
      if (parsed.data.password) {
        updateData.passwordHash = await bcrypt.hash(parsed.data.password, 12);
      }
      if (parsed.data.roleName) {
        const role = await prisma.role.findUnique({ where: { name: parsed.data.roleName } });
        if (!role) {
          return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', 'Invalid role'));
        }
        updateData.roleId = role.id;
      }

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        include: { role: true },
      });

      return ok(res, {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role.name,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
        },
      });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', 'Missing id'));
      }

      await prisma.user.delete({
        where: { id },
      });

      return ok(res, { success: true });
    }
  } catch (error) {
    console.error('admin-users error', error);
    if ((error as Error).message === 'FORBIDDEN') {
      return badRequest(res, apiError('FORBIDDEN', 'FORBIDDEN'));
    }
    if ((error as Error).message === 'UNAUTHORIZED') {
      return badRequest(res, apiError('UNAUTHORIZED', 'UNAUTHORIZED'));
    }
    serverError(res);
  }
}
