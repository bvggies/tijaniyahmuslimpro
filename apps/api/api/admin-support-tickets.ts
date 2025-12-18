import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { requireRole } from '../lib/auth';
import { badRequest, methodNotAllowed, ok, serverError } from '../lib/response';
import { apiError } from '@tmp/shared';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'PATCH') return methodNotAllowed(res);

  try {
    await requireRole(req, ['SUPER_ADMIN', 'ADMIN', 'MODERATOR']);

    if (req.method === 'GET') {
      const tickets = await prisma.supportTicket.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return ok(res, { tickets });
    }

    const { id, status } = req.body as { id?: string; status?: string };
    if (!id || !status) {
      return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT'));
    }

    const updated = await prisma.supportTicket.update({
      where: { id },
      data: { status },
    });

    ok(res, { ticket: updated });
  } catch (error) {
    console.error('admin-support-tickets error', error);
    if ((error as Error).message === 'FORBIDDEN') {
      return badRequest(res, apiError('FORBIDDEN', 'FORBIDDEN'));
    }
    if ((error as Error).message === 'UNAUTHORIZED') {
      return badRequest(res, apiError('UNAUTHORIZED', 'UNAUTHORIZED'));
    }
    serverError(res);
  }
}



