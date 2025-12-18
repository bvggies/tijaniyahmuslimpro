import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { requireUser } from '../lib/auth';
import { badRequest, methodNotAllowed, ok, serverError } from '../lib/response';
import { apiError } from '@tmp/shared';
import { z } from 'zod';

const bodySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  target: z.number().int().positive().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'PATCH') {
    return methodNotAllowed(res);
  }

  try {
    const user = await requireUser(req);

    if (req.method === 'GET') {
      const wazifas = await prisma.wazifa.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });
      return ok(res, { wazifas });
    }

    if (req.method === 'POST') {
      const parsed = bodySchema.safeParse(req.body);
      if (!parsed.success) {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', parsed.error.flatten()));
      }

      const wazifa = await prisma.wazifa.create({
        data: {
          ...parsed.data,
          userId: user.id,
        },
      });

      return ok(res, { wazifa });
    }

    const { id, completed } = req.body as { id?: string; completed?: boolean };
    if (!id || typeof completed !== 'boolean') {
      return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT'));
    }

    const updated = await prisma.wazifa.update({
      where: { id },
      data: { completed },
    });

    ok(res, { wazifa: updated });
  } catch (error) {
    console.error('wazifa error', error);
    if ((error as Error).message === 'UNAUTHORIZED') {
      return badRequest(res, apiError('UNAUTHORIZED', 'UNAUTHORIZED'));
    }
    serverError(res);
  }
}



