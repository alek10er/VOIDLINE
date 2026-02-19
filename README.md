# VOIDLINE Now

VOIDLINE is a dark, premium web messenger with real-time messaging and audio-only calls.

## Stack

- Next.js 14 (App Router) + TypeScript
- TailwindCSS
- Supabase (Auth, Postgres, Realtime, RLS)
- LiveKit (audio-only rooms)
- Zustand (lightweight state)

## Features

- Email/password auth (`/login`, `/register`)
- Protected dashboard routes via `middleware.ts`
- Chat list + message timeline
- Realtime message streaming (Supabase Realtime)
- Audio call flow (ringing → active → ended)
- LiveKit JWT generation in server API route
- SQL migration including RLS policies

## Routes

- `/`
- `/login`
- `/register`
- `/dashboard`
- `/dashboard/chat/[id]`
- `/dashboard/call/[callId]`
- `POST /api/livekit/token`

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env.local
```

3. Fill required values in `.env.local`.

4. Run Supabase SQL migration:

- Open Supabase SQL editor and run `supabase/migrations/0001_init.sql`,
- or run via Supabase CLI migration workflow.

5. Start dev server:

```bash
npm run dev
```

## Realtime notes

- `messages` table is added to publication `supabase_realtime`.
- Client subscribes to `postgres_changes` filtered by `chat_id`.

## LiveKit call flow

1. User clicks **Start Audio Call**.
2. App creates `calls` row with status `ringing`.
3. `/api/livekit/token` validates Supabase session and returns JWT.
4. Client connects to LiveKit room and enables microphone only.
5. Call status updated to `active`.
6. On hangup, status is set to `ended` with `ended_at`.

## Security

- RLS enabled for all domain tables.
- Policies ensure users only access chats they belong to.
- LiveKit secret is server-side only.

## Deploy to Vercel

- Import repo into Vercel.
- Set all variables from `.env.example`.
- Ensure Supabase URL/keys and LiveKit secrets are configured.

