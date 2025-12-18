import type { VercelRequest } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { prisma } from '@tmp/db';
import { getEnv } from './env';
import type { AppRole } from '@tmp/shared';
import { ROLES } from '@tmp/shared';

interface JwtPayload {
  sub: string;
  role: AppRole;
  type: 'access' | 'refresh';
}

const ACCESS_TTL_SECONDS = 60 * 15; // 15 minutes
const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export function signAccessToken(userId: string, role: AppRole) {
  return jwt.sign(
    { sub: userId, role, type: 'access' } satisfies JwtPayload,
    getEnv('JWT_SECRET'),
    { expiresIn: ACCESS_TTL_SECONDS },
  );
}

export function signRefreshToken(userId: string, role: AppRole) {
  return jwt.sign(
    { sub: userId, role, type: 'refresh' } satisfies JwtPayload,
    getEnv('REFRESH_SECRET'),
    { expiresIn: REFRESH_TTL_SECONDS },
  );
}

export async function createSession(userId: string, role: AppRole) {
  const refreshToken = signRefreshToken(userId, role);

  const decoded = jwt.decode(refreshToken) as jwt.JwtPayload | null;
  const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + REFRESH_TTL_SECONDS * 1000);

  await prisma.session.create({
    data: {
      userId,
      refreshToken,
      expiresAt,
    },
  });

  return refreshToken;
}

export async function revokeSession(refreshToken: string) {
  await prisma.session.deleteMany({
    where: { refreshToken },
  });
}

export async function getUserFromRequest(req: VercelRequest) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;

  const token = auth.slice('Bearer '.length);

  try {
    const decoded = jwt.verify(token, getEnv('JWT_SECRET')) as JwtPayload;
    if (decoded.type !== 'access') return null;

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      include: { role: true },
    });
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.name as AppRole,
    };
  } catch {
    return null;
  }
}

export async function requireUser(req: VercelRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

export async function requireRole(req: VercelRequest, allowed: AppRole[]) {
  const user = await requireUser(req);
  if (!allowed.includes(user.role)) {
    throw new Error('FORBIDDEN');
  }
  return user;
}

export function mapRoleName(input?: string | null): AppRole {
  if (!input) return 'USER';
  if (ROLES.includes(input as AppRole)) return input as AppRole;
  return 'USER';
}


