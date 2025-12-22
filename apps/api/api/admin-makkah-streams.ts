import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { requireRole } from '../lib/auth';
import { badRequest, methodNotAllowed, ok, serverError } from '../lib/response';
import { apiError } from '@tmp/shared';
import { z } from 'zod';

const createStreamSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().min(1).max(300),
  url: z.string().url(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

const updateStreamSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200).optional(),
  subtitle: z.string().min(1).max(300).optional(),
  url: z.string().url().optional(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'DELETE') {
    return methodNotAllowed(res);
  }

  try {
    await requireRole(req, ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);

    if (req.method === 'GET') {
      const streams = await prisma.makkahStream.findMany({
        orderBy: { displayOrder: 'asc' },
      });

      return ok(res, { streams });
    }

    if (req.method === 'POST') {
      const parsed = createStreamSchema.safeParse(req.body);
      if (!parsed.success) {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', parsed.error.flatten()));
      }

      const stream = await prisma.makkahStream.create({
        data: parsed.data,
      });

      return ok(res, { stream });
    }

    if (req.method === 'PUT') {
      const parsed = updateStreamSchema.safeParse(req.body);
      if (!parsed.success) {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', parsed.error.flatten()));
      }

      const { id, ...data } = parsed.data;

      const stream = await prisma.makkahStream.update({
        where: { id },
        data,
      });

      return ok(res, { stream });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id || typeof id !== 'string') {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', 'Missing stream id'));
      }

      await prisma.makkahStream.delete({
        where: { id },
      });

      return ok(res, { success: true });
    }
  } catch (error) {
    console.error('admin-makkah-streams error', error);
    if ((error as Error).message === 'FORBIDDEN' || (error as Error).message === 'UNAUTHORIZED') {
      return badRequest(res, apiError((error as Error).message, (error as Error).message));
    }
    serverError(res);
  }
}

