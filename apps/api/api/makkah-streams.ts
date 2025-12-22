import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { ok, methodNotAllowed, serverError, badRequest } from '../lib/response';
import { apiError } from '@tmp/shared';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res);

  try {
    const streams = await prisma.makkahStream.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });

    return ok(res, {
      streams: streams.map((s) => ({
        id: s.id,
        title: s.title,
        subtitle: s.subtitle,
        url: s.url,
      })),
    });
  } catch (error) {
    console.error('makkah-streams error', error);
    serverError(res);
  }
}

