import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ok } from '../lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  ok(res, { 
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    path: req.url 
  });
}

