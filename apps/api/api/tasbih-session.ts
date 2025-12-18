import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { requireUser } from '../lib/auth';
import { badRequest, methodNotAllowed, ok, serverError } from '../lib/response';
import { apiError } from '@tmp/shared';
import { z } from 'zod';

const bodySchema = z.object({
  phrase: z.string().min(1).max(120),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') return methodNotAllowed(res);

  try {
    const user = await requireUser(req);

    if (req.method === 'GET') {
      const session = await prisma.tasbihSession.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });
      return ok(res, {
        session:
          session ??
          ({
            id: 'virtual',
            phrase: 'SubḥānAllāh',
            target: null,
            count: 0,
          } as const),
      });
    }

    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', parsed.error.flatten()));
    }

    const { phrase } = parsed.data;

    const existing = await prisma.tasbihSession.findFirst({
      where: { userId: user.id, phrase },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      const updated = await prisma.tasbihSession.update({
        where: { id: existing.id },
        data: { count: existing.count + 1 },
      });
      return ok(res, { session: updated });
    }

    const created = await prisma.tasbihSession.create({
      data: { phrase, userId: user.id, count: 1 },
    });
    ok(res, { session: created });
  } catch (error) {
    console.error('tasbih-session error', error);
    if ((error as Error).message === 'UNAUTHORIZED') {
      return badRequest(res, apiError('UNAUTHORIZED', 'UNAUTHORIZED'));
    }
    serverError(res);
  }
}



