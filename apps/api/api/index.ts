import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ok } from '../lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  ok(res, {
    name: 'Tijaniyah Muslim Pro API',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      test: '/api/test',
      auth: {
        login: 'POST /api/auth-login',
        register: 'POST /api/auth-register',
        me: 'GET /api/auth-me',
      },
      prayer: {
        times: 'GET /api/prayer-times?lat={lat}&lng={lng}',
        settings: 'GET /api/prayer-settings',
      },
      community: {
        feed: 'GET /api/community-feed',
        post: 'POST /api/community-post',
        like: 'POST /api/community-like',
      },
      makkahStream: 'GET /api/makkah-stream',
      makkahStreams: 'GET /api/makkah-streams',
      mosquesNearby: 'GET /api/mosques-nearby?lat={lat}&lng={lng}',
      aiNoor: 'POST /api/ai-noor',
      campaigns: 'GET /api/campaigns',
      tijaniyahDuas: 'GET /api/tijaniyah-duas',
      wazifa: 'GET /api/wazifa',
      lazim: 'GET /api/lazim',
      tasbih: 'GET /api/tasbih-session',
      journal: 'GET /api/journal-entries',
      chat: {
        rooms: 'GET /api/chat-rooms',
        messages: 'GET /api/chat-messages?roomId={id}',
      },
      public: {
        releaseNotes: 'GET /api/release-notes-public',
        subscribe: 'POST /api/subscribe',
        contact: 'POST /api/contact',
      },
      events: 'GET /api/events',
      notifications: 'GET /api/notifications',
      admin: {
        users: 'GET/POST/PUT/DELETE /api/admin-users',
        scholars: 'GET/POST/PUT/DELETE /api/admin-scholars',
        scholarContent: 'GET/POST/PUT/DELETE /api/admin-scholar-content',
        events: 'GET/POST/PUT/DELETE /api/admin-events',
        notifications: 'GET/POST/DELETE /api/admin-notifications',
        groups: 'GET/POST/PUT/DELETE /api/admin-groups',
        makkahStreams: 'GET/POST/PUT/DELETE /api/admin-makkah-streams',
      },
    },
    documentation: 'See README.md for API documentation',
  });
}

