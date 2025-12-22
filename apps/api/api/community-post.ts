import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { requireUser } from '../lib/auth';
import { badRequest, methodNotAllowed, ok, serverError } from '../lib/response';
import { apiError } from '@tmp/shared';
import { z } from 'zod';

const createPostSchema = z.object({
  content: z.string().min(1).max(500),
  imageUrl: z.string().url().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res);

  try {
    const user = await requireUser(req);

    const parsed = createPostSchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', parsed.error.flatten()));
    }

    const { content, imageUrl } = parsed.data;

    const post = await prisma.post.create({
      data: {
        content,
        imageUrl,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
        likes: {
          where: {
            userId: user.id,
          },
        },
      },
    });

    // Transform to match frontend format
    ok(res, {
      post: {
        id: post.id,
        content: post.content,
        author: {
          id: post.author.id,
          name: post.author.name || 'Anonymous',
        },
        likes: post._count.likes,
        comments: post._count.comments,
        isLiked: post.likes.length > 0,
        createdAt: post.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('community-post error', error);
    if ((error as Error).message === 'UNAUTHORIZED') {
      return badRequest(res, apiError('UNAUTHORIZED', 'UNAUTHORIZED'));
    }
    serverError(res);
  }
}



