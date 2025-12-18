import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { badRequest, methodNotAllowed, ok } from '../lib/response';
import { apiError } from '@tmp/shared';
import { z } from 'zod';

const bodySchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  message: z.string().min(1).max(2000),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res);

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', parsed.error.flatten()));
  }

  const { name, email, message } = parsed.data;

  await prisma.contactSubmission.create({
    data: { name, email, message },
  });

  ok(res, { ok: true });
}



