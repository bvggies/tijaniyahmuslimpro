import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ok, serverError } from '../lib/response';
import { prisma } from '@tmp/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Test database connection
    await prisma.$connect();
    
    ok(res, { 
      message: 'API is working!',
      timestamp: new Date().toISOString(),
      path: req.url,
      database: 'connected',
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasRefreshSecret: !!process.env.REFRESH_SECRET,
        hasPlacesApiKey: !!process.env.PLACES_API_KEY,
        hasGroqApiKey: !!process.env.GROQ_API_KEY,
      }
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    serverError(res, 'INTERNAL_SERVER_ERROR', {
      message: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error,
    });
  }
}

