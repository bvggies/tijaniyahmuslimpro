import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { requireRole } from '../lib/auth';
import { badRequest, methodNotAllowed, ok, serverError } from '../lib/response';
import { apiError } from '@tmp/shared';
import { z } from 'zod';

const createSchema = z.object({
  version: z.string().min(1).max(50),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(4000),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') return methodNotAllowed(res);

  try {
    await requireRole(req, ['SUPER_ADMIN', 'ADMIN']);

    if (req.method === 'GET') {
      const notes = await prisma.releaseNote.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return ok(res, { notes });
    }

    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', parsed.error.flatten()));
    }

    const note = await prisma.releaseNote.create({
      data: parsed.data,
    });

    ok(res, { note });
  } catch (error) {
    console.error('admin-release-notes error', error);
    if ((error as Error).message === 'FORBIDDEN') {
      return badRequest(res, apiError('FORBIDDEN', 'FORBIDDEN'));
    }
    if ((error as Error).message === 'UNAUTHORIZED') {
      return badRequest(res, apiError('UNAUTHORIZED', 'UNAUTHORIZED'));
    }
    serverError(res);
  }
}



