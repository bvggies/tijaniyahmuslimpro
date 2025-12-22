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
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      // Transform rooms to include last message and recipient info for DMs
      const transformedRooms = rooms.map((room) => {
        const lastMessage = room.messages[0];
        let roomName = room.name;
        let recipient = null;

        // For direct messages, get the recipient info
        if (!room.isGroup && room.members.length === 2) {
          const recipientMember = room.members.find((m) => m.userId !== user.id);
          if (recipientMember?.user) {
            recipient = recipientMember.user;
            roomName = recipient.name || room.name;
          }
        }

        return {
          id: room.id,
          name: roomName,
          isGroup: room.isGroup,
          recipient: recipient,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                timestamp: lastMessage.createdAt.toISOString(),
                author: lastMessage.author,
              }
            : undefined,
          unreadCount: 0, // TODO: Implement unread count
        };
      });

      return ok(res, { rooms: transformedRooms });
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
          include: {
            author: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Transform to match GET response format
    const lastMessage = room.messages[0];
    let roomName = room.name;
    let recipient = null;

    // For direct messages, get the recipient info
    if (!room.isGroup && room.members.length === 2) {
      const recipientMember = room.members.find((m) => m.userId !== user.id);
      if (recipientMember?.user) {
        recipient = recipientMember.user;
        roomName = recipient.name || room.name;
      }
    }

    ok(res, {
      room: {
        id: room.id,
        name: roomName,
        isGroup: room.isGroup,
        recipient: recipient,
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              timestamp: lastMessage.createdAt.toISOString(),
              author: lastMessage.author,
            }
          : undefined,
        unreadCount: 0,
      },
    });
  } catch (error) {
    console.error('chat-rooms error', error);
    if ((error as Error).message === 'UNAUTHORIZED') {
      return badRequest(res, apiError('UNAUTHORIZED', 'UNAUTHORIZED'));
    }
    serverError(res);
  }
}



