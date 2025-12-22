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

    console.log('Creating post for user:', user.id, 'Content length:', content.length);

    // Test database connection first
    try {
      await prisma.$connect();
      console.log('Database connection verified');
    } catch (connError) {
      console.error('Database connection error:', connError);
      return serverError(res, 'DATABASE_CONNECTION_ERROR', (connError as Error).message);
    }

    const post = await prisma.post.create({
      data: {
        content,
        imageUrl: imageUrl || null,
        authorId: user.id,
        isHidden: false,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
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

    console.log('Post created successfully:', post.id);

    // Ensure the database write is committed by doing a separate query
    // This helps ensure the data is persisted, especially in serverless environments
    await prisma.$executeRaw`SELECT 1`;

    // Verify the post was actually saved
    const verifyPost = await prisma.post.findUnique({
      where: { id: post.id },
    });

    if (!verifyPost) {
      console.error('Post was not saved to database! Post ID:', post.id);
      return serverError(res, 'POST_CREATION_FAILED', 'Post was created but not found in database');
    }

    console.log('Post verified in database:', verifyPost.id);

    // Transform to match frontend format
    ok(res, {
      post: {
        id: post.id,
        content: post.content,
        imageUrl: post.imageUrl || undefined,
        author: {
          id: post.author.id,
          name: post.author.name || 'Anonymous',
          avatar: post.author.avatarUrl || undefined,
        },
        likes: post._count.likes,
        comments: post._count.comments,
        isLiked: post.likes.length > 0,
        createdAt: post.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('community-post error:', error);
    console.error('Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      name: (error as Error).name,
    });
    if ((error as Error).message === 'UNAUTHORIZED') {
      return badRequest(res, apiError('UNAUTHORIZED', 'UNAUTHORIZED'));
    }
    serverError(res, 'INTERNAL_SERVER_ERROR', (error as Error).message);
  }
}



