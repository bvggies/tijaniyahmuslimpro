import type { VercelRequest, VercelResponse } from '@vercel/node';
import { badRequest, methodNotAllowed, ok, serverError } from '../lib/response';
import { apiError } from '@tmp/shared';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res);

  const { lat, lng } = req.query;
  if (!lat || !lng || typeof lat !== 'string' || typeof lng !== 'string') {
    return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT'));
  }

  try {
    const url = `https://api.aladhan.com/v1/timings?latitude=${encodeURIComponent(
      lat,
    )}&longitude=${encodeURIComponent(lng)}&method=3`;
    const upstream = await fetch(url);
    if (!upstream.ok) {
      throw new Error('Upstream prayer API failed');
    }
    const json = (await upstream.json()) as any;

    const t = json?.data?.timings ?? {};

    ok(res, {
      timings: {
        Fajr: t.Fajr,
        Dhuhr: t.Dhuhr,
        Asr: t.Asr,
        Maghrib: t.Maghrib,
        Isha: t.Isha,
      },
      date: json?.data?.date,
      meta: json?.data?.meta,
    });
  } catch (error) {
    console.error('prayer-times error', error);
    serverError(res, `Failed to fetch prayer times: ${(error as Error).message}`);
  }
}



