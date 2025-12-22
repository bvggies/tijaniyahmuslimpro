import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { requireUser } from '../lib/auth';
import { badRequest, methodNotAllowed, ok, serverError } from '../lib/response';
import { apiError } from '@tmp/shared';
import { z } from 'zod';

const createDMSchema = z.object({
  recipientId: z.string().min(1),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') return methodNotAllowed(res);

  try {
    const user = await requireUser(req);

    if (req.method === 'GET') {
      // Get all direct message rooms for the user
      const rooms = await prisma.chatRoom.findMany({
        where: {
          isGroup: false,
          members: {
            some: { userId: user.id },
          },
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      // Transform to include recipient info
      const transformedRooms = rooms.map((room) => {
        const recipient = room.members.find((m) => m.userId !== user.id)?.user;
        return {
          id: room.id,
          name: recipient?.name || 'Unknown',
          recipient: recipient,
          lastMessage: room.messages[0]
            ? {
                content: room.messages[0].content,
                timestamp: room.messages[0].createdAt.toISOString(),
              }
            : undefined,
          unreadCount: 0, // TODO: Implement unread count
        };
      });

      return ok(res, { rooms: transformedRooms });
    }

    // POST: Create or get existing direct message room
    const parsed = createDMSchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', parsed.error.flatten()));
    }

    const { recipientId } = parsed.data;

    if (recipientId === user.id) {
      return badRequest(res, apiError('INVALID_INPUT', 'Cannot message yourself'));
    }

    // Check if recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
    });

    if (!recipient) {
      return badRequest(res, apiError('NOT_FOUND', 'User not found'));
    }

    // Check if a direct message room already exists between these two users
    const existingRoom = await prisma.chatRoom.findFirst({
      where: {
        isGroup: false,
        members: {
          every: {
            userId: { in: [user.id, recipientId] },
          },
        },
      },
      include: {
        members: true,
      },
    });

    if (existingRoom) {
      // Verify it has exactly 2 members (this user and recipient)
      if (existingRoom.members.length === 2) {
        return ok(res, { room: existingRoom });
      }
    }

    // Create new direct message room
    const room = await prisma.chatRoom.create({
      data: {
        name: `${user.name} & ${recipient.name}`, // Temporary name, can be improved
        isGroup: false,
        members: {
          create: [
            { userId: user.id, role: 'member' },
            { userId: recipientId, role: 'member' },
          ],
        },
      },
    });

    ok(res, { room });
  } catch (error) {
    console.error('direct-message error', error);
    if ((error as Error).message === 'UNAUTHORIZED') {
      return badRequest(res, apiError('UNAUTHORIZED', 'UNAUTHORIZED'));
    }
    serverError(res);
  }
}

