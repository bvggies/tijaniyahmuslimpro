import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { requireRole } from '../lib/auth';
import { badRequest, methodNotAllowed, ok, serverError } from '../lib/response';
import { apiError } from '@tmp/shared';
import { z } from 'zod';

const createDuaSchema = z.object({
  title: z.string().min(1),
  arabic: z.string().min(1),
  translation: z.string().min(1),
  reference: z.string().optional(),
  categoryName: z.string().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') return methodNotAllowed(res);

  try {
    await requireRole(req, ['SUPER_ADMIN', 'CONTENT_MANAGER']);

    if (req.method === 'GET') {
      const duas = await prisma.dua.findMany({
        orderBy: { createdAt: 'desc' },
        include: { category: true },
      });
      return ok(res, { duas });
    }

    const parsed = createDuaSchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', parsed.error.flatten()));
    }

    const { title, arabic, translation, reference, categoryName } = parsed.data;

    let categoryId: string | undefined;
    if (categoryName) {
      const category = await prisma.duaCategory.upsert({
        where: { name: categoryName },
        create: { name: categoryName },
        update: {},
      });
      categoryId = category.id;
    }

    const dua = await prisma.dua.create({
      data: {
        title,
        arabic,
        translation,
        reference,
        categoryId,
      },
      include: { category: true },
    });

    ok(res, { dua });
  } catch (error) {
    console.error('admin-duas error', error);
    if ((error as Error).message === 'FORBIDDEN') {
      return badRequest(res, apiError('FORBIDDEN', 'FORBIDDEN'));
    }
    if ((error as Error).message === 'UNAUTHORIZED') {
      return badRequest(res, apiError('UNAUTHORIZED', 'UNAUTHORIZED'));
    }
    serverError(res);
  }
}



