import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getEnv } from '../lib/env';
import { badRequest, methodNotAllowed, ok } from '../lib/response';
import { apiError } from '@tmp/shared';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res);

  const { lat, lng } = req.query;
  if (!lat || !lng) {
    return badRequest(res, apiError('INVALID_INPUT', 'INVALID_INPUT'));
  }

  const key = getEnv('PLACES_API_KEY');
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=mosque&key=${key}`;

  const upstream = await fetch(url);
  const json = await upstream.json();

  const mosques =
    json.results?.map((r: any) => ({
      id: r.place_id,
      name: r.name,
      address: r.vicinity,
      lat: r.geometry?.location?.lat,
      lng: r.geometry?.location?.lng,
    })) ?? [];

  ok(res, { mosques });
}



