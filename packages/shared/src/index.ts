import { z } from 'zod';

export const ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'MODERATOR',
  'CONTENT_MANAGER',
  'USER',
] as const;

export type AppRole = (typeof ROLES)[number];

export const roleSchema = z.enum(ROLES);

export const authRegisterSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const authLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const authResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string().email(),
    role: roleSchema,
  }),
});

export type AuthRegisterInput = z.infer<typeof authRegisterSchema>;
export type AuthLoginInput = z.infer<typeof authLoginSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;

export interface ApiErrorShape {
  error: string;
  code?: string;
  issues?: unknown;
}

export const apiError = (error: string, code?: string, issues?: unknown) =>
  ({ error, code, issues }) satisfies ApiErrorShape;

export const PRAYER_FEATURE_KEYS = {
  times: ['prayerTimes'] as const,
  settings: ['prayerSettings'] as const,
};

export const COMMUNITY_FEATURE_KEYS = {
  feed: ['communityFeed'] as const,
  chatRooms: ['chatRooms'] as const,
  messages: (roomId: string) => ['chatMessages', roomId] as const,
};

export const DESIGN_TOKENS = {
  colors: {
    darkTeal: {
      light: '#29c8d6',
      dark: '#061c1e',
    },
    pineBlue: {
      light: '#4db3a8',
      dark: '#0b1918',
    },
    mutedTeal: {
      light: '#609f75',
      dark: '#0d1610',
    },
    evergreen: {
      light: '#08f774',
      dark: '#012310',
    },
    onyx: {
      light: '#0bf417',
      dark: '#022203',
    },
  },
} as const;


