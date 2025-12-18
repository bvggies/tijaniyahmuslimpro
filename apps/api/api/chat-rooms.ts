import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { requireUser } from '../lib/auth';
import { badRequest, methodNotAllowed, ok, serverError } from '../lib/response';
import { apiError } from '@tmp/shared';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1).max(120),
  isGroup: z.boolean().default(true),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') return methodNotAllowed(res);

  try {
    const user = await requireUser(req);

    if (req.method === 'GET') {
      const rooms = await prisma.chatRoom.findMany({
        where: {
          members: {
            some: { userId: user.id },
          },
        },
        include: {
          members: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return ok(res, { rooms });
    }

    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', parsed.error.flatten()));
    }

    const { name, isGroup } = parsed.data;

    const room = await prisma.chatRoom.create({
      data: {
        name,
        isGroup,
        members: {
          create: {
            userId: user.id,
            role: 'owner',
          },
        },
      },
    });

    ok(res, { room });
  } catch (error) {
    console.error('chat-rooms error', error);
    if ((error as Error).message === 'UNAUTHORIZED') {
      return badRequest(res, apiError('UNAUTHORIZED', 'UNAUTHORIZED'));
    }
    serverError(res);
  }
}



