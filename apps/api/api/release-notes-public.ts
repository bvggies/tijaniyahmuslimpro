import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { methodNotAllowed, ok, serverError } from '../lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res);

  try {
    const notes = await prisma.releaseNote.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    ok(res, { notes });
  } catch (error) {
    console.error('release-notes-public error', error);
    serverError(res);
  }
}



