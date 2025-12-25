import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserFromRequest } from '../lib/auth';
import { methodNotAllowed, ok, unauthorized } from '../lib/response';
import { apiError } from '@tmp/shared';

const ADMIN_ORIGIN = process.env.ADMIN_DASHBOARD_ORIGIN ?? 'https://tijaniyahmuslimpro-admin-fawn.vercel.app';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Basic CORS for admin dashboard
  res.setHeader('Access-Control-Allow-Origin', ADMIN_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    // Preflight request
    return res.status(204).end();
  }

  if (req.method !== 'GET') return methodNotAllowed(res);

  const user = await getUserFromRequest(req);
  if (!user) {
    return unauthorized(res, apiError('UNAUTHORIZED', 'UNAUTHORIZED'));
  }

  ok(res, { user });
}


