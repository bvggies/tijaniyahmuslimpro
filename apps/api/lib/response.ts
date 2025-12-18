import type { VercelResponse } from '@vercel/node';
import type { ApiErrorShape } from '@tmp/shared';

export function json(res: VercelResponse, status: number, data: unknown) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(data));
}

export function ok(res: VercelResponse, data: unknown) {
  json(res, 200, data);
}

export function badRequest(res: VercelResponse, error: ApiErrorShape) {
  json(res, 400, error);
}

export function unauthorized(res: VercelResponse, error: ApiErrorShape) {
  json(res, 401, error);
}

export function forbidden(res: VercelResponse, error: ApiErrorShape) {
  json(res, 403, error);
}

export function methodNotAllowed(res: VercelResponse) {
  json(
    res,
    405,
    { error: 'METHOD_NOT_ALLOWED' } satisfies ApiErrorShape,
  );
}

export function serverError(res: VercelResponse, message = 'INTERNAL_SERVER_ERROR') {
  json(
    res,
    500,
    { error: message } satisfies ApiErrorShape,
  );
}


