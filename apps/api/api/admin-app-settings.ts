import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { requireRole } from '../lib/auth';
import { badRequest, methodNotAllowed, ok, serverError } from '../lib/response';
import { apiError } from '@tmp/shared';
import { z } from 'zod';

const settingsSchema = z.object({
  maintenanceMode: z.boolean(),
  faqJson: z.string().optional(),
  makkahStreamUrl: z.string().url().optional().or(z.literal('')),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'PUT') return methodNotAllowed(res);

  try {
    await requireRole(req, ['SUPER_ADMIN']);

    if (req.method === 'GET') {
      const settings = await prisma.appSettings.findFirst();
      return ok(res, {
        settings:
          settings ??
          (await prisma.appSettings.create({
            data: { maintenanceMode: false, makkahStreamUrl: null },
          })),
      });
    }

    const parsed = settingsSchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', parsed.error.flatten()));
    }

    const current = await prisma.appSettings.findFirst();
    const updateData = {
      ...parsed.data,
      makkahStreamUrl: parsed.data.makkahStreamUrl === '' ? null : parsed.data.makkahStreamUrl,
    };
    const updated = await prisma.appSettings.update({
      where: { id: current!.id },
      data: updateData,
    });

    ok(res, { settings: updated });
  } catch (error) {
    console.error('admin-app-settings error', error);
    if ((error as Error).message === 'FORBIDDEN') {
      return badRequest(res, apiError('FORBIDDEN', 'FORBIDDEN'));
    }
    if ((error as Error).message === 'UNAUTHORIZED') {
      return badRequest(res, apiError('UNAUTHORIZED', 'UNAUTHORIZED'));
    }
    serverError(res);
  }
}



