import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { requireRole } from '../lib/auth';
import { badRequest, methodNotAllowed, ok, serverError } from '../lib/response';
import { apiError } from '@tmp/shared';
import { z } from 'zod';

const createGroupSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  userIds: z.array(z.string()).optional(),
});

const updateGroupSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  userIds: z.array(z.string()).optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'DELETE') {
    return methodNotAllowed(res);
  }

  try {
    await requireRole(req, ['SUPER_ADMIN', 'ADMIN']);

    if (req.method === 'GET') {
      const groups = await prisma.userGroup.findMany({
        include: {
          users: {
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
      });
      return ok(res, { groups });
    }

    if (req.method === 'POST') {
      const parsed = createGroupSchema.safeParse(req.body);
      if (!parsed.success) {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', parsed.error.flatten()));
      }

      const group = await prisma.userGroup.create({
        data: {
          name: parsed.data.name,
          description: parsed.data.description,
          users: parsed.data.userIds
            ? {
                create: parsed.data.userIds.map((userId) => ({
                  userId,
                })),
              }
            : undefined,
        },
        include: {
          users: {
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

      return ok(res, { group });
    }

    if (req.method === 'PUT') {
      const { id, ...data } = req.body;
      if (!id) {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', 'Missing id'));
      }

      const parsed = updateGroupSchema.safeParse(data);
      if (!parsed.success) {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', parsed.error.flatten()));
      }

      const updateData: any = {};
      if (parsed.data.name) updateData.name = parsed.data.name;
      if (parsed.data.description !== undefined) updateData.description = parsed.data.description;

      if (parsed.data.userIds !== undefined) {
        await prisma.userGroupMember.deleteMany({
          where: { groupId: id },
        });
        updateData.users = {
          create: parsed.data.userIds.map((userId: string) => ({
            userId,
          })),
        };
      }

      const group = await prisma.userGroup.update({
        where: { id },
        data: updateData,
        include: {
          users: {
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

      return ok(res, { group });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', 'Missing id'));
      }

      await prisma.userGroup.delete({
        where: { id },
      });

      return ok(res, { success: true });
    }
  } catch (error) {
    console.error('admin-groups error', error);
    if ((error as Error).message === 'FORBIDDEN') {
      return badRequest(res, apiError('FORBIDDEN', 'FORBIDDEN'));
    }
    if ((error as Error).message === 'UNAUTHORIZED') {
      return badRequest(res, apiError('UNAUTHORIZED', 'UNAUTHORIZED'));
    }
    serverError(res);
  }
}

