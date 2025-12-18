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
        author: true,
        likes: true,
        _count: { select: { comments: true, likes: true } },
      },
      take: 50,
    });

    ok(res, {
      posts: posts.map((p) => ({
        id: p.id,
        content: p.content,
        imageUrl: p.imageUrl,
        createdAt: p.createdAt,
        author: {
          id: p.author.id,
          name: p.author.name,
        },
        likeCount: p._count.likes,
        commentCount: p._count.comments,
        likedByViewer: viewer ? p.likes.some((l) => l.userId === viewer.id) : false,
      })),
    });
  } catch (error) {
    console.error('community-feed error', error);
    serverError(res);
  }
}



