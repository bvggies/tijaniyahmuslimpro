import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserFromRequest } from '../lib/auth';
import { methodNotAllowed, ok, unauthorized } from '../lib/response';
import { apiError } from '@tmp/shared';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res);

  const user = await getUserFromRequest(req);
  if (!user) {
    return unauthorized(res, apiError('UNAUTHORIZED', 'UNAUTHORIZED'));
  }

  ok(res, { user });
}


