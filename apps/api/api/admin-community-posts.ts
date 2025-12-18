import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { requireRole } from '../lib/auth';
import { badRequest, methodNotAllowed, ok, serverError } from '../lib/response';
import { apiError } from '@tmp/shared';
import { z } from 'zod';

const updateSchema = z.object({
  id: z.string().min(1),
  isHidden: z.boolean(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'PATCH') return methodNotAllowed(res);

  try {
    await requireRole(req, ['SUPER_ADMIN', 'MODERATOR']);

    if (req.method === 'GET') {
      const posts = await prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          author: true,
          _count: { select: { comments: true, likes: true } },
        },
        take: 100,
      });
      type PostWithAuthor = Awaited<ReturnType<typeof prisma.post.findMany<{ include: { author: true; _count: { select: { comments: true; likes: true } } } }>>>[0];
      
      return ok(res, {
        posts: posts.map((p: PostWithAuthor) => ({
          id: p.id,
          content: p.content,
          createdAt: p.createdAt,
          isHidden: p.isHidden,
          author: { id: p.author.id, email: p.author.email, name: p.author.name },
          comments: p._count.comments,
          likes: p._count.likes,
        })),
      });
    }

    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', parsed.error.flatten()));
    }

    const updated = await prisma.post.update({
      where: { id: parsed.data.id },
      data: { isHidden: parsed.data.isHidden },
    });

    ok(res, { post: updated });
  } catch (error) {
    console.error('admin-community-posts error', error);
    if ((error as Error).message === 'FORBIDDEN') {
      return badRequest(res, apiError('FORBIDDEN', 'FORBIDDEN'));
    }
    if ((error as Error).message === 'UNAUTHORIZED') {
      return badRequest(res, apiError('UNAUTHORIZED', 'UNAUTHORIZED'));
    }
    serverError(res);
  }
}



