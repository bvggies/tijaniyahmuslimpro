import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { prisma } from '@tmp/db';
import {
  authLoginSchema,
  authResponseSchema,
  apiError,
} from '@tmp/shared';
import { createSession, mapRoleName, signAccessToken } from '../lib/auth';
import { badRequest, methodNotAllowed, ok, serverError } from '../lib/response';

const ADMIN_ORIGIN = process.env.ADMIN_DASHBOARD_ORIGIN ?? 'https://tijaniyahmuslimpro-admin-fawn.vercel.app';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Basic CORS for admin dashboard
  res.setHeader('Access-Control-Allow-Origin', ADMIN_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    // Preflight request
    return res.status(204).end();
  }

  if (req.method !== 'POST') return methodNotAllowed(res);

  try {
    const parseResult = authLoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT', parseResult.error.flatten()));
    }

    const { email, password } = parseResult.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
    if (!user) {
      console.error(`[auth-login] User not found: ${email}`);
      return badRequest(res, apiError('INVALID_CREDENTIALS', 'INVALID_CREDENTIALS'));
    }

    const okPassword = await bcrypt.compare(password, user.passwordHash);
    if (!okPassword) {
      console.error(`[auth-login] Invalid password for user: ${email}`);
      return badRequest(res, apiError('INVALID_CREDENTIALS', 'INVALID_CREDENTIALS'));
    }

    const role = mapRoleName(user.role.name);
    const accessToken = signAccessToken(user.id, role);
    const refreshToken = await createSession(user.id, role);

    const payload = {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role,
      },
    };

    const validated = authResponseSchema.parse(payload);
    ok(res, validated);
  } catch (error) {
    console.error('auth-login error', error);
    serverError(res);
  }
}


