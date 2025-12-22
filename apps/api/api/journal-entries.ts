import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { requireUser } from '../lib/auth';
import { badRequest, methodNotAllowed, ok, serverError } from '../lib/response';
import { apiError } from '@tmp/shared';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
  tags: z.array(z.string()).optional().default([]),
  mood: z.string().max(50).optional(),
  category: z.string().max(50).optional(),
  isPinned: z.boolean().optional().default(false),
});

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(10000).optional(),
  tags: z.array(z.string()).optional(),
  mood: z.string().max(50).optional().nullable(),
  category: z.string().max(50).optional().nullable(),
  isPinned: z.boolean().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const user = await requireUser(req);
      const { search, category, mood, tag, pinned } = req.query;

      const where: any = { userId: user.id };

      if (search && typeof search === 'string') {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (category && typeof category === 'string') {
        where.category = category;
      }

      if (mood && typeof mood === 'string') {
        where.mood = mood;
      }

      if (tag && typeof tag === 'string') {
        where.tags = { has: tag };
      }

      if (pinned === 'true') {
        where.isPinned = true;
      }

      const entries = await prisma.journalEntry.findMany({
        where,
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' },
        ],
      });

      return ok(res, { entries });
    } catch (error) {
      console.error('journal-entries GET error', error);
      if ((error as Error).message === 'UNAUTHORIZED') {
        return badRequest(res, apiError('UNAUTHORIZED', 'UNAUTHORIZED'));
      }
      serverError(res);
      return;
    }
  }

  if (req.method === 'POST') {
    try {
      const user = await requireUser(req);
      const parsed = createSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', parsed.error.flatten()));
      }

      const { title, content, tags, mood, category, isPinned } = parsed.data;

      const entry = await prisma.journalEntry.create({
        data: {
          title,
          content,
          tags: tags || [],
          mood: mood || null,
          category: category || null,
          isPinned: isPinned || false,
          userId: user.id,
        },
      });

      return ok(res, { entry });
    } catch (error) {
      console.error('journal-entries POST error', error);
      if ((error as Error).message === 'UNAUTHORIZED') {
        return badRequest(res, apiError('UNAUTHORIZED', 'UNAUTHORIZED'));
      }
      serverError(res);
      return;
    }
  }

  if (req.method === 'PUT') {
    try {
      const user = await requireUser(req);
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return badRequest(res, apiError('INVALID_INPUT', 'Entry ID is required'));
      }

      // Verify entry belongs to user
      const existing = await prisma.journalEntry.findFirst({
        where: { id, userId: user.id },
      });

      if (!existing) {
        return badRequest(res, apiError('NOT_FOUND', 'Entry not found'));
      }

      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) {
        return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', parsed.error.flatten()));
      }

      const updateData: any = {};
      if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
      if (parsed.data.content !== undefined) updateData.content = parsed.data.content;
      if (parsed.data.tags !== undefined) updateData.tags = parsed.data.tags;
      if (parsed.data.mood !== undefined) updateData.mood = parsed.data.mood;
      if (parsed.data.category !== undefined) updateData.category = parsed.data.category;
      if (parsed.data.isPinned !== undefined) updateData.isPinned = parsed.data.isPinned;

      const entry = await prisma.journalEntry.update({
        where: { id },
        data: updateData,
      });

      return ok(res, { entry });
    } catch (error) {
      console.error('journal-entries PUT error', error);
      if ((error as Error).message === 'UNAUTHORIZED') {
        return badRequest(res, apiError('UNAUTHORIZED', 'UNAUTHORIZED'));
      }
      serverError(res);
      return;
    }
  }

  if (req.method === 'DELETE') {
    try {
      const user = await requireUser(req);
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return badRequest(res, apiError('INVALID_INPUT', 'Entry ID is required'));
      }

      // Verify entry belongs to user
      const existing = await prisma.journalEntry.findFirst({
        where: { id, userId: user.id },
      });

      if (!existing) {
        return badRequest(res, apiError('NOT_FOUND', 'Entry not found'));
      }

      await prisma.journalEntry.delete({
        where: { id },
      });

      return ok(res, { success: true });
    } catch (error) {
      console.error('journal-entries DELETE error', error);
      if ((error as Error).message === 'UNAUTHORIZED') {
        return badRequest(res, apiError('UNAUTHORIZED', 'UNAUTHORIZED'));
      }
      serverError(res);
      return;
    }
  }

  return methodNotAllowed(res);
}
