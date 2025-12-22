import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { ok, methodNotAllowed, serverError } from '../lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res);

  try {
    const events = await prisma.event.findMany({
      where: { isActive: true },
      orderBy: { startDate: 'desc' },
    });

    return ok(res, { events });
  } catch (error) {
    console.error('events error', error);
    serverError(res);
  }
}

