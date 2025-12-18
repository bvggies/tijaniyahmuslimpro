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
        include: { sender: true },
        orderBy: { createdAt: 'asc' },
        take: 200,
      });

      type MessageWithSender = Awaited<ReturnType<typeof prisma.message.findMany<{ include: { sender: true } }>>>[0];

      return ok(res, {
        messages: messages.map((m: MessageWithSender) => ({
          id: m.id,
          content: m.content,
          createdAt: m.createdAt,
          sender: { id: m.sender.id, name: m.sender.name },
          isMine: m.senderId === user.id,
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
    type RoomWithMembers = Awaited<ReturnType<typeof prisma.chatRoom.findUnique<{ include: { members: true } }>>>;
    type RoomMember = NonNullable<RoomWithMembers>['members'][0];

    if (!room || !room.members.some((m: RoomMember) => m.userId === user.id)) {
      return badRequest(res, apiError('FORBIDDEN', 'FORBIDDEN'));
    }

    const message = await prisma.message.create({
      data: {
        roomId,
        senderId: user.id,
        content,
      },
    });

    ok(res, { message });
  } catch (error) {
    console.error('chat-messages error', error);
    if ((error as Error).message === 'UNAUTHORIZED') {
      return badRequest(res, apiError('UNAUTHORIZED', 'UNAUTHORIZED'));
    }
    serverError(res);
  }
}



