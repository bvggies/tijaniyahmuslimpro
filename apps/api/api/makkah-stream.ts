import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { methodNotAllowed, ok, serverError } from '../lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res);

  try {
    const settings = await prisma.appSettings.findFirst();
    
    ok(res, {
      makkahStreamUrl: settings?.makkahStreamUrl || null,
    });
  } catch (error) {
    console.error('makkah-stream error', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    serverError(res, 'INTERNAL_SERVER_ERROR', {
      message: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
    });
  }
}

