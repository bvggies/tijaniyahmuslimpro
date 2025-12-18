import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { methodNotAllowed, ok, serverError } from '../lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res);

  try {
    const settings = await prisma.appSettings.findFirst();
    
    ok(res, {
      streamUrl: settings?.makkahStreamUrl || null,
    });
  } catch (error) {
    console.error('makkah-stream error', error);
    serverError(res);
  }
}

