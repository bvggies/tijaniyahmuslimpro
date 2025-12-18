## Tijaniyah Muslim Pro – Monorepo

This repository contains the full Tijaniyah Muslim Pro ecosystem:

- **Mobile app** (`apps/mobile`) – Expo + React Native + TypeScript
- **Admin dashboard** (`apps/admin`) – CRA + TypeScript
- **Public website** (`apps/website`) – Vite + React + TypeScript
- **Backend API** (`apps/api`) – Node.js + TypeScript on Vercel functions
- **Shared packages** (`packages/*`) – UI kit, shared types/validators, Prisma db client

### 1. Prerequisites

- Node.js 18+
- npm (or pnpm/yarn, if you adapt the workspaces)
- Neon Postgres database

### 2. Install dependencies

From the monorepo root:

```bash
npm install
```

### 3. Database (Neon + Prisma)

1. Create a Neon Postgres database and grab the connection string.
2. In the **API app’s env** (see next section), set:

```bash
DATABASE_URL=postgresql://user:password@host:5432/tijaniyah
```

3. From the monorepo root, run Prisma migrations (once you’ve created the env in your shell):

```bash
cd packages/db
npx prisma migrate dev
```

This creates all models defined in `packages/db/prisma/schema.prisma`.

### 4. Environment variables (all apps)

Create environment files **per app** with the following variables:

- **API (`apps/api`)**

```bash
DATABASE_URL=postgresql://user:password@host:5432/tijaniyah
JWT_SECRET=change-me-jwt-secret
REFRESH_SECRET=change-me-refresh-secret
PLACES_API_KEY=your-places-api-key
MAKKAH_STREAM_URL=https://example.com/makkah-stream
AI_NOOR_PROVIDER_KEY=your-ai-provider-key
```

- **Mobile (`apps/mobile`)**

```bash
EXPO_PUBLIC_API_BASE_URL=https://tijaniyahmuslimpro-admin-mu.vercel.app
EXPO_PUBLIC_MAKKAH_STREAM_URL=$MAKKAH_STREAM_URL
EXPO_PUBLIC_PLACES_API_KEY=$PLACES_API_KEY
```

- **Admin (`apps/admin`)**

```bash
REACT_APP_API_BASE_URL=https://tijaniyahmuslimpro-admin-mu.vercel.app
```

- **Website (`apps/website`)**

```bash
VITE_APPSTORE_URL=https://apps.apple.com/your-app
VITE_PLAYSTORE_URL=https://play.google.com/store/apps/details?id=your.app.id
VITE_API_BASE_URL=https://tijaniyahmuslimpro-admin-mu.vercel.app
```

### 5. Running locally

- **API**

```bash
cd apps/api
npx vercel dev
```

This serves all `apps/api/api/*.ts` endpoints at `/api/*`.

- **Mobile (Expo)**

```bash
cd apps/mobile
npx expo start
```

Make sure `EXPO_PUBLIC_API_BASE_URL` points to your running API (e.g. `http://localhost:3000` when using `vercel dev`).

- **Admin dashboard**

```bash
cd apps/admin
npm start
```

- **Website**

```bash
cd apps/website
npm run dev
```

### 6. Deployment (Vercel)

Create **three Vercel projects**, each pointing at a different subdirectory of this repo:

- **API project**
  - Root directory: `apps/api`
  - Framework preset: Node.js / Vercel Functions
  - Build command: `npm run build` (or leave empty; Vercel will compile TS for functions)
  - Env vars: set the API env vars from section 4

- **Website project**
  - Root directory: `apps/website`
  - Framework preset: Vite
  - Build command: `npm run build`
  - Output directory: `dist`
  - Env vars: `VITE_APPSTORE_URL`, `VITE_PLAYSTORE_URL`

- **Admin project**
  - Root directory: `apps/admin`
  - Framework preset: Create React App
  - Build command: `npm run build`
  - Output directory: `build`
  - Env vars: `REACT_APP_API_BASE_URL` (set to the deployed API URL)

Update `EXPO_PUBLIC_API_BASE_URL` in the mobile app to the deployed API URL.

### 7. Auth, RBAC, and admin flows

- API exposes `POST /api/auth-register`, `POST /api/auth-login`, and `GET /api/auth-me` for JWT-based auth.
- Admin dashboard:
  - Login page at `/login` (email + password).
  - Tokens stored in local storage and sent as `Authorization: Bearer <token>`.
  - Role-based access enforced in the UI using `RequireRole`, and on the API via `requireRole`.
  - Examples:
    - `/api/admin-users` – list users (SUPER_ADMIN, ADMIN).
    - `/api/admin-duas` – list/create duas (SUPER_ADMIN, CONTENT_MANAGER).
    - `/api/admin-support-tickets` – list/close tickets (SUPER_ADMIN, ADMIN, MODERATOR).

### 8. Design system

- Shared Tailwind preset in `packages/ui/tailwind.preset.cjs` using the required colors:
  - `dark-teal`, `pine-blue`, `muted-teal`, `evergreen`, `onyx`.
- Shared React components in `packages/ui`:
  - `IslamicBackground` – dark, modern Islamic gradient with soft animated glows.
  - `Card`, `Button` – rounded cards, soft shadows, premium feel.
- All three web surfaces (admin, website, Expo-native UI via NativeWind classes) use this design language.

### 9. Notes

- The mobile app implements:
  - Onboarding + auth (sign in / sign up / forgot password) with Expo Secure Store.
  - Bottom tab navigation: Home, Prayer, Quran, Community, Profile.
  - Themed screens for prayer, Qur’an, community, and settings, ready to be wired to more API endpoints.
- The admin dashboard and website are ready for production builds; you can iterate on content and add further pages using the existing patterns.


