import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { requireRole } from '../lib/auth';
import { badRequest, methodNotAllowed, ok, serverError } from '../lib/response';
import { apiError } from '@tmp/shared';
import { z } from 'zod';

const createSchema = z.object({
  scholarId: z.string().min(1),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(10000),
  mediaUrl: z.string().url().optional().nullable(),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  displayOrder: z.number().int().optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().min(1).max(10000).optional(),
  mediaUrl: z.string().url().optional().nullable(),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  displayOrder: z.number().int().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'DELETE') {
    return methodNotAllowed(res);
  }

  try {
    await requireRole(req, ['SUPER_ADMIN', 'CONTENT_MANAGER']);

    if (req.method === 'GET') {
      const { scholarId } = req.query;
      if (!scholarId || typeof scholarId !== 'string') {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', 'Missing scholarId'));
      }

      const contents = await prisma.scholarContent.findMany({
        where: { scholarId },
        orderBy: { displayOrder: 'asc' },
      });
      return ok(res, { contents });
    }

    if (req.method === 'POST') {
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', parsed.error.flatten()));
      }

      // Verify scholar exists
      const scholar = await prisma.scholar.findUnique({
        where: { id: parsed.data.scholarId },
      });
      if (!scholar) {
        return badRequest(res, apiError('NOT_FOUND', 'NOT_FOUND', 'Scholar not found'));
      }

      // Get max displayOrder if not provided
      let displayOrder = parsed.data.displayOrder;
      if (displayOrder === undefined) {
        const maxOrder = await prisma.scholarContent.findFirst({
          where: { scholarId: parsed.data.scholarId },
          orderBy: { displayOrder: 'desc' },
        });
        displayOrder = maxOrder ? maxOrder.displayOrder + 1 : 0;
      }

      const content = await prisma.scholarContent.create({
        data: {
          ...parsed.data,
          displayOrder,
          backgroundColor: parsed.data.backgroundColor || '#105056',
        },
      });

      return ok(res, { content });
    }

    if (req.method === 'PUT') {
      const { id, ...data } = req.body;
      if (!id) {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', 'Missing id'));
      }

      const parsed = updateSchema.safeParse(data);
      if (!parsed.success) {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', parsed.error.flatten()));
      }

      const content = await prisma.scholarContent.update({
        where: { id },
        data: parsed.data,
      });

      return ok(res, { content });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', 'Missing id'));
      }

      await prisma.scholarContent.delete({
        where: { id },
      });

      return ok(res, { success: true });
    }
  } catch (error) {
    console.error('admin-scholar-content error', error);
    if ((error as Error).message === 'FORBIDDEN') {
      return badRequest(res, apiError('FORBIDDEN', 'FORBIDDEN'));
    }
    if ((error as Error).message === 'UNAUTHORIZED') {
      return badRequest(res, apiError('UNAUTHORIZED', 'UNAUTHORIZED'));
    }
    serverError(res);
  }
}

