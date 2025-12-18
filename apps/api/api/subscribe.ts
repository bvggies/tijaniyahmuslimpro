import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { badRequest, methodNotAllowed, ok } from '../lib/response';
import { apiError } from '@tmp/shared';
import { z } from 'zod';

const bodySchema = z.object({
  email: z.string().email(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res);

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', parsed.error.flatten()));
  }

  const { email } = parsed.data;

  await prisma.subscriber.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  ok(res, { ok: true });
}



