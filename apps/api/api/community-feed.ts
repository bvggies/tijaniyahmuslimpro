import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { getUserFromRequest } from '../lib/auth';
import { methodNotAllowed, ok, serverError } from '../lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res);

  try {
    const viewer = await getUserFromRequest(req);

    const posts = await prisma.post.findMany({
      where: { isHidden: false },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        likes: viewer ? {
          where: {
            userId: viewer.id,
          },
        } : false,
        _count: { select: { comments: true, likes: true } },
      },
      take: 50,
    });

    ok(res, {
      posts: posts.map((p: typeof posts[0]) => ({
        id: p.id,
        content: p.content,
        imageUrl: p.imageUrl || undefined,
        createdAt: p.createdAt.toISOString(),
        author: {
          id: p.author.id,
          name: p.author.name || 'Anonymous',
          avatarUrl: p.author.avatarUrl || undefined,
        },
        likeCount: p._count.likes,
        commentCount: p._count.comments,
        likedByViewer: viewer && Array.isArray(p.likes) ? p.likes.some((l: typeof p.likes[0]) => l.userId === viewer.id) : false,
      })),
    });
  } catch (error) {
    console.error('community-feed error', error);
    serverError(res);
  }
}



