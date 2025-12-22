import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { requireRole } from '../lib/auth';
import { badRequest, methodNotAllowed, ok, serverError } from '../lib/response';
import { apiError } from '@tmp/shared';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1).max(200),
  bio: z.string().min(1).max(4000),
  avatarUrl: z.string().url().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  bio: z.string().min(1).max(4000).optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'DELETE') {
    return methodNotAllowed(res);
  }

  try {
    await requireRole(req, ['SUPER_ADMIN', 'CONTENT_MANAGER']);

    if (req.method === 'GET') {
      const scholars = await prisma.scholar.findMany({
        include: {
          contents: {
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return ok(res, { scholars });
    }

    if (req.method === 'POST') {
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', parsed.error.flatten()));
      }

      const scholar = await prisma.scholar.create({
        data: parsed.data,
      });

      return ok(res, { scholar });
    }

    if (req.method === 'PUT') {
      const { id, ...data } = req.body;
      if (!id) {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', 'Missing id'));
      }

      const parsed = updateSchema.safeParse(data);
      if (!parsed.success) {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', parsed.error.flatten()));
      }

      const scholar = await prisma.scholar.update({
        where: { id },
        data: parsed.data,
      });

      return ok(res, { scholar });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', 'Missing id'));
      }

      await prisma.scholar.delete({
        where: { id },
      });

      return ok(res, { success: true });
    }
  } catch (error) {
    console.error('admin-scholars error', error);
    if ((error as Error).message === 'FORBIDDEN') {
      return badRequest(res, apiError('FORBIDDEN', 'FORBIDDEN'));
    }
    if ((error as Error).message === 'UNAUTHORIZED') {
      return badRequest(res, apiError('UNAUTHORIZED', 'UNAUTHORIZED'));
    }
    serverError(res);
  }
}



