import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ok, serverError } from '../lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    ok(res, {
      status: 'ok',
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
    });
  } catch (error) {
    console.error('Health check error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    serverError(res, 'INTERNAL_SERVER_ERROR', {
      message: errorMessage,
    });
  }
}

