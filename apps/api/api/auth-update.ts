import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { requireUser } from '../lib/auth';
import { badRequest, methodNotAllowed, ok, serverError } from '../lib/response';
import { apiError } from '@tmp/shared';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') return methodNotAllowed(res);

  try {
    const user = await requireUser(req);

    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', parsed.error.flatten()));
    }

    const { name, email } = parsed.data;

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser && existingUser.id !== user.id) {
      return badRequest(res, apiError('EMAIL_IN_USE', 'EMAIL_IN_USE'));
    }

    // Update user
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        email,
      },
      include: { role: true },
    });

    ok(res, {
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role.name,
      },
    });
  } catch (error) {
    console.error('auth-update error', error);
    if ((error as Error).message === 'UNAUTHORIZED') {
      return badRequest(res, apiError('UNAUTHORIZED', 'UNAUTHORIZED'));
    }
    serverError(res);
  }
}

