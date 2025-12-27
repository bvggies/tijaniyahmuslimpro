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
              sender: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: [
          { createdAt: 'desc' },
        ],
      });

      // Transform rooms to include last message and recipient info for DMs
      // Use a loose type here to avoid over-constraining Prisma's generated types in the build
      const transformedRooms = (rooms as any[]).map((room) => {
        const lastMessage = room.messages?.[0];
        let roomName = room.name as string;
        let recipient = null;

        // For direct messages, get the recipient info
        if (!room.isGroup && room.members?.length === 2) {
          const recipientMember = room.members.find((m: any) => m.userId !== user.id);
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
                author: lastMessage.sender,
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

    console.log('Creating chat room for user:', user.id, 'Name:', name, 'IsGroup:', isGroup ?? true);

    // Test database connection first
    try {
      await prisma.$connect();
      console.log('Database connection verified');
    } catch (connError) {
      console.error('Database connection error:', connError);
      return serverError(res, 'DATABASE_CONNECTION_ERROR', (connError as Error).message);
    }

    const room = await prisma.chatRoom.create({
      data: {
        name,
        isGroup: isGroup ?? true,
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
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    console.log('Chat room created successfully:', room.id);

    // Ensure the database write is committed by doing a separate query
    // This helps ensure the data is persisted, especially in serverless environments
    await prisma.$executeRaw`SELECT 1`;

    // Verify the room was actually saved
    const verifyRoom = await prisma.chatRoom.findUnique({
      where: { id: room.id },
    });

    if (!verifyRoom) {
      console.error('Chat room was not saved to database! Room ID:', room.id);
      return serverError(res, 'ROOM_CREATION_FAILED', 'Room was created but not found in database');
    }

    console.log('Chat room verified in database:', verifyRoom.id);

    // Transform to match GET response format
    const lastMessage = (room as any).messages?.[0];
    let roomName = room.name;
    let recipient = null;

    // For direct messages, get the recipient info
    if (!room.isGroup && (room as any).members?.length === 2) {
      const recipientMember = (room as any).members.find((m: any) => m.userId !== user.id);
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
              author: lastMessage.sender,
            }
          : undefined,
        unreadCount: 0,
      },
    });
  } catch (error) {
    console.error('chat-rooms error:', error);
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



