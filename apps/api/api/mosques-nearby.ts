import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getEnv } from '../lib/env';
import { badRequest, methodNotAllowed, ok, serverError } from '../lib/response';
import { apiError } from '@tmp/shared';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res);

  const { lat, lng } = req.query;
  if (!lat || !lng) {
    return badRequest(res, apiError('INVALID_INPUT', 'Latitude and longitude are required'));
  }

  try {
    const key = getEnv('PLACES_API_KEY');
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=mosque&key=${key}`;

    const upstream = await fetch(url);
    
    if (!upstream.ok) {
      console.error('Google Places API error:', upstream.status, upstream.statusText);
      return serverError(res, 'Failed to fetch nearby mosques from Google Places API');
    }

    const json = await upstream.json();

    // Check for Google API errors
    if (json.status === 'REQUEST_DENIED' || json.status === 'INVALID_REQUEST') {
      console.error('Google Places API error:', json.status, json.error_message);
      return serverError(res, json.error_message || 'Google Places API request failed');
    }

    const mosques =
      json.results?.map((r: any) => ({
        id: r.place_id,
        name: r.name,
        address: r.vicinity,
        lat: r.geometry?.location?.lat,
        lng: r.geometry?.location?.lng,
      })) ?? [];

    ok(res, { mosques });
  } catch (error) {
    console.error('mosques-nearby error:', error);
    serverError(res, `Failed to fetch nearby mosques: ${(error as Error).message}`);
  }
}



