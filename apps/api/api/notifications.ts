import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { requireUser } from '../lib/auth';
import { ok, methodNotAllowed, serverError, badRequest } from '../lib/response';
import { apiError } from '@tmp/shared';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'PUT') return methodNotAllowed(res);

  try {
    const user = await requireUser(req);

    if (req.method === 'GET') {
      const notifications = await prisma.notificationUser.findMany({
        where: { userId: user.id },
        include: {
          notification: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return ok(res, {
        notifications: notifications.map((nu) => ({
          id: nu.notification.id,
          title: nu.notification.title,
          message: nu.notification.message,
          type: nu.notification.type,
          isRead: nu.isRead,
          createdAt: nu.notification.createdAt,
        })),
      });
    }

    if (req.method === 'PUT') {
      const { notificationId } = req.body;
      if (!notificationId) {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', 'Missing notificationId'));
      }

      await prisma.notificationUser.updateMany({
        where: {
          notificationId,
          userId: user.id,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return ok(res, { success: true });
    }
  } catch (error) {
    console.error('notifications error', error);
    serverError(res);
  }
}

