import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { prisma } from '@tmp/db';
import {
  authRegisterSchema,
  authResponseSchema,
  apiError,
  ROLES,
} from '@tmp/shared';
import { createSession, mapRoleName, signAccessToken } from '../lib/auth';
import { badRequest, methodNotAllowed, ok, serverError } from '../lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res);

  try {
    const parseResult = authRegisterSchema.safeParse(req.body);
    if (!parseResult.success) {
      return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', parseResult.error.flatten()));
    }

    const { name, email, password } = parseResult.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return badRequest(res, apiError('EMAIL_IN_USE', 'EMAIL_IN_USE'));
    }

    const role = await prisma.role.upsert({
      where: { name: 'USER' },
      update: {},
      create: { name: 'USER' },
    });

    // Ensure admin roles exist for later
    for (const r of ROLES) {
      // eslint-disable-next-line no-await-in-loop
      await prisma.role.upsert({
        where: { name: r },
        update: {},
        create: { name: r },
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        roleId: role.id,
      },
      include: { role: true },
    });

    const accessToken = signAccessToken(user.id, mapRoleName(user.role.name));
    const refreshToken = await createSession(user.id, mapRoleName(user.role.name));

    const payload = {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: mapRoleName(user.role.name),
      },
    };

    const validated = authResponseSchema.parse(payload);
    ok(res, validated);
  } catch (error) {
    console.error('auth-register error', error);
    serverError(res);
  }
}


