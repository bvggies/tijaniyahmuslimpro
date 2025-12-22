import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { requireUser } from '../lib/auth';
import { badRequest, methodNotAllowed, ok, serverError } from '../lib/response';
import { apiError } from '@tmp/shared';
import { z } from 'zod';

const bodySchema = z.object({
  phrase: z.string().min(1).max(120),
  target: z.number().int().positive().optional().nullable(),
});

const resetSchema = z.object({
  phrase: z.string().min(1).max(120),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const user = await requireUser(req);
      const phrase = typeof req.query.phrase === 'string' ? req.query.phrase : undefined;

      if (phrase) {
        const session = await prisma.tasbihSession.findFirst({
          where: { userId: user.id, phrase },
          orderBy: { createdAt: 'desc' },
        });
        return ok(res, {
          session:
            session ??
            ({
              id: 'virtual',
              phrase,
              target: null,
              count: 0,
            } as const),
        });
      }

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
    } catch (error) {
      console.error('tasbih-session GET error', error);
      if ((error as Error).message === 'UNAUTHORIZED') {
        return badRequest(res, apiError('UNAUTHORIZED', 'UNAUTHORIZED'));
      }
      serverError(res);
      return;
    }
  }

  if (req.method === 'POST') {
    try {
      const user = await requireUser(req);
      const parsed = bodySchema.safeParse(req.body);
      if (!parsed.success) {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', parsed.error.flatten()));
      }

      const { phrase, target } = parsed.data;

      const existing = await prisma.tasbihSession.findFirst({
        where: { userId: user.id, phrase },
        orderBy: { createdAt: 'desc' },
      });

      if (existing) {
        const updated = await prisma.tasbihSession.update({
          where: { id: existing.id },
          data: { count: existing.count + 1, ...(target !== undefined ? { target } : {}) },
        });
        return ok(res, { session: updated });
      }

      const created = await prisma.tasbihSession.create({
        data: { phrase, userId: user.id, count: 1, ...(target !== undefined ? { target } : {}) },
      });
      return ok(res, { session: created });
    } catch (error) {
      console.error('tasbih-session POST error', error);
      if ((error as Error).message === 'UNAUTHORIZED') {
        return badRequest(res, apiError('UNAUTHORIZED', 'UNAUTHORIZED'));
      }
      serverError(res);
      return;
    }
  }

  if (req.method === 'PUT') {
    try {
      const user = await requireUser(req);
      const parsed = bodySchema.safeParse(req.body);
      if (!parsed.success) {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', parsed.error.flatten()));
      }

      const { phrase, target } = parsed.data;

      const existing = await prisma.tasbihSession.findFirst({
        where: { userId: user.id, phrase },
        orderBy: { createdAt: 'desc' },
      });

      if (existing) {
        const updated = await prisma.tasbihSession.update({
          where: { id: existing.id },
          data: { target: target ?? null },
        });
        return ok(res, { session: updated });
      }

      // Create new session with target
      const created = await prisma.tasbihSession.create({
        data: {
          phrase,
          userId: user.id,
          count: 0,
          target: target ?? null,
        },
      });
      return ok(res, { session: created });
    } catch (error) {
      console.error('tasbih-session PUT error', error);
      if ((error as Error).message === 'UNAUTHORIZED') {
        return badRequest(res, apiError('UNAUTHORIZED', 'UNAUTHORIZED'));
      }
      serverError(res);
      return;
    }
  }

  return methodNotAllowed(res);
}
