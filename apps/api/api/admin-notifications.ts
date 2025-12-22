import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { requireRole } from '../lib/auth';
import { badRequest, methodNotAllowed, ok, serverError } from '../lib/response';
import { apiError } from '@tmp/shared';
import { z } from 'zod';

const createNotificationSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  type: z.enum(['info', 'warning', 'success', 'error']).default('info'),
  targetType: z.enum(['all', 'group', 'individual']),
  targetUserIds: z.array(z.string()).optional(),
  targetGroupId: z.string().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'DELETE') {
    return methodNotAllowed(res);
  }

  try {
    await requireRole(req, ['SUPER_ADMIN', 'ADMIN']);

    if (req.method === 'GET') {
      const notifications = await prisma.notification.findMany({
        include: {
          targetUsers: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      return ok(res, { notifications });
    }

    if (req.method === 'POST') {
      const parsed = createNotificationSchema.safeParse(req.body);
      if (!parsed.success) {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', parsed.error.flatten()));
      }

      const { targetType, targetUserIds, targetGroupId } = parsed.data;

      let userIds: string[] = [];

      if (targetType === 'all') {
        const allUsers = await prisma.user.findMany({
          select: { id: true },
        });
        userIds = allUsers.map((u: { id: string }) => u.id);
      } else if (targetType === 'group' && targetGroupId) {
        const groupMembers = await prisma.userGroupMember.findMany({
          where: { groupId: targetGroupId },
          select: { userId: true },
        });
        userIds = groupMembers.map((m: { userId: string }) => m.userId);
      } else if (targetType === 'individual' && targetUserIds) {
        userIds = targetUserIds;
      } else {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', 'Invalid target configuration'));
      }

      if (userIds.length === 0) {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', 'No users to notify'));
      }

      const notification = await prisma.notification.create({
        data: {
          title: parsed.data.title,
          message: parsed.data.message,
          type: parsed.data.type,
          targetType: parsed.data.targetType,
          targetUsers: {
            create: userIds.map((userId) => ({
              userId,
            })),
          },
        },
        include: {
          targetUsers: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return ok(res, { notification });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', 'Missing id'));
      }

      await prisma.notification.delete({
        where: { id },
      });

      return ok(res, { success: true });
    }
  } catch (error) {
    console.error('admin-notifications error', error);
    if ((error as Error).message === 'FORBIDDEN') {
      return badRequest(res, apiError('FORBIDDEN', 'FORBIDDEN'));
    }
    if ((error as Error).message === 'UNAUTHORIZED') {
      return badRequest(res, apiError('UNAUTHORIZED', 'UNAUTHORIZED'));
    }
    serverError(res);
  }
}

