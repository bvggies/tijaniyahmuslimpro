import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { requireUser } from '../lib/auth';
import { badRequest, methodNotAllowed, ok, serverError } from '../lib/response';
import { apiError } from '@tmp/shared';
import { z } from 'zod';

const sendSchema = z.object({
  roomId: z.string().min(1),
  content: z.string().min(1).max(1000),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') return methodNotAllowed(res);

  try {
    const user = await requireUser(req);

    if (req.method === 'GET') {
      const { roomId } = req.query;
      if (!roomId || typeof roomId !== 'string') {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT'));
      }

      const messages = await prisma.message.findMany({
        where: { roomId },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
        take: 200,
      });

      return ok(res, {
        messages: messages.map((m: typeof messages[0]) => ({
          id: m.id,
          content: m.content,
          timestamp: m.createdAt.toISOString(),
          author: {
            id: m.sender.id,
            name: m.sender.name || 'Anonymous',
            avatar: m.sender.avatarUrl || undefined,
          },
        })),
      });
    }

    const parsed = sendSchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', parsed.error.flatten()));
    }

    const { roomId, content } = parsed.data;

    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: { members: true },
    });
    if (!room || !room.members.some((m: typeof room.members[0]) => m.userId === user.id)) {
      return badRequest(res, apiError('FORBIDDEN', 'FORBIDDEN'));
    }

    // Create message - Prisma will automatically update room's updatedAt via @updatedAt
    const message = await prisma.message.create({
      data: {
        roomId,
        senderId: user.id,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    // Touch the room to trigger updatedAt (Prisma handles this automatically)
    await prisma.chatRoom.update({
      where: { id: roomId },
      data: {}, // Empty update triggers @updatedAt
    });

    ok(res, {
      message: {
        id: message.id,
        content: message.content,
        timestamp: message.createdAt.toISOString(),
        author: {
          id: message.sender.id,
          name: message.sender.name || 'Anonymous',
        },
      },
    });
  } catch (error) {
    console.error('chat-messages error', error);
    if ((error as Error).message === 'UNAUTHORIZED') {
      return badRequest(res, apiError('UNAUTHORIZED', 'UNAUTHORIZED'));
    }
    serverError(res);
  }
}



