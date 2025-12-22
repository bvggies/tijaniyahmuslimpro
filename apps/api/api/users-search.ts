import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { requireUser } from '../lib/auth';
import { methodNotAllowed, ok, serverError } from '../lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res);

  try {
    const user = await requireUser(req);
    const query = (req.query.q as string) || '';
    const limit = parseInt((req.query.limit as string) || '20', 10);

    const users = await prisma.user.findMany({
      where: {
        id: { not: user.id }, // Exclude current user
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      take: limit,
      orderBy: { name: 'asc' },
    });

    ok(res, { users });
  } catch (error) {
    console.error('users-search error', error);
    if ((error as Error).message === 'UNAUTHORIZED') {
      return ok(res, { users: [] });
    }
    serverError(res);
  }
}

