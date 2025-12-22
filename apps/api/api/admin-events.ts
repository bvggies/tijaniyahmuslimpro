import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { requireRole } from '../lib/auth';
import { badRequest, methodNotAllowed, ok, serverError } from '../lib/response';
import { apiError } from '@tmp/shared';
import { z } from 'zod';

const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional().nullable(),
  location: z.string().max(500).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().default(true),
});

const updateEventSchema = createEventSchema.partial();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'DELETE') {
    return methodNotAllowed(res);
  }

  try {
    await requireRole(req, ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER']);

    if (req.method === 'GET') {
      const events = await prisma.event.findMany({
        orderBy: { startDate: 'desc' },
      });
      return ok(res, { events });
    }

    if (req.method === 'POST') {
      const parsed = createEventSchema.safeParse(req.body);
      if (!parsed.success) {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', parsed.error.flatten()));
      }

      const event = await prisma.event.create({
        data: {
          title: parsed.data.title,
          description: parsed.data.description,
          startDate: new Date(parsed.data.startDate),
          endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
          imageUrl: parsed.data.imageUrl,
          location: parsed.data.location,
          isActive: parsed.data.isActive,
        },
      });

      return ok(res, { event });
    }

    if (req.method === 'PUT') {
      const { id, ...data } = req.body;
      if (!id) {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', 'Missing id'));
      }

      const parsed = updateEventSchema.safeParse(data);
      if (!parsed.success) {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', parsed.error.flatten()));
      }

      const updateData: any = {};
      if (parsed.data.title) updateData.title = parsed.data.title;
      if (parsed.data.description) updateData.description = parsed.data.description;
      if (parsed.data.startDate) updateData.startDate = new Date(parsed.data.startDate);
      if (parsed.data.endDate !== undefined) {
        updateData.endDate = parsed.data.endDate ? new Date(parsed.data.endDate) : null;
      }
      if (parsed.data.location !== undefined) updateData.location = parsed.data.location;
      if (parsed.data.imageUrl !== undefined) updateData.imageUrl = parsed.data.imageUrl;
      if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive;

      const event = await prisma.event.update({
        where: { id },
        data: updateData,
      });

      return ok(res, { event });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', 'Missing id'));
      }

      await prisma.event.delete({
        where: { id },
      });

      return ok(res, { success: true });
    }
  } catch (error) {
    console.error('admin-events error', error);
    if ((error as Error).message === 'FORBIDDEN') {
      return badRequest(res, apiError('FORBIDDEN', 'FORBIDDEN'));
    }
    if ((error as Error).message === 'UNAUTHORIZED') {
      return badRequest(res, apiError('UNAUTHORIZED', 'UNAUTHORIZED'));
    }
    serverError(res);
  }
}

