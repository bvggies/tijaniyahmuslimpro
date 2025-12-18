import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { requireUser } from '../lib/auth';
import { badRequest, methodNotAllowed, ok, serverError } from '../lib/response';
import { apiError } from '@tmp/shared';
import { z } from 'zod';

const settingsSchema = z.object({
  calculationMethod: z.string().min(1),
  madhab: z.string().min(1),
  latitudeAdjustment: z.string().min(1),
  notificationsOn: z.boolean(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'PUT') return methodNotAllowed(res);

  try {
    const user = await requireUser(req);

    if (req.method === 'GET') {
      const settings = await prisma.prayerSettings.findUnique({
        where: { userId: user.id },
      });
      return ok(res, {
        settings: settings ?? {
          calculationMethod: 'MuslimWorldLeague',
          madhab: 'Standard',
          latitudeAdjustment: 'None',
          notificationsOn: true,
        },
      });
    }

    const parsed = settingsSchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', parsed.error.flatten()));
    }

    const data = parsed.data;

    const updated = await prisma.prayerSettings.upsert({
      where: { userId: user.id },
      update: data,
      create: { ...data, userId: user.id },
    });

    ok(res, { settings: updated });
  } catch (error) {
    console.error('prayer-settings error', error);
    if ((error as Error).message === 'UNAUTHORIZED') {
      return badRequest(res, apiError('UNAUTHORIZED', 'UNAUTHORIZED'));
    }
    serverError(res);
  }
}



