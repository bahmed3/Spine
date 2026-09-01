# Spine

A social home for readers — track what you're reading, build public
shelves worth browsing, and discover your next book through people,
not just an algorithm.

## Stack

- **Next.js** (App Router, TypeScript, Tailwind v4)
- **Supabase** — auth (Google OAuth + email/password) and Postgres database
- **Open Library API** — book search, covers, and metadata (free, no API key)

## What's actually wired up right now

- `/` — landing page with a working "Continue with Google" button
- `/discover` — a real page that fetches live trending + searched books
  from Open Library and renders actual cover art
- Supabase auth scaffolding: browser client, server client, session-refresh
  middleware, and the OAuth callback route

## What's still mockup-only

The homepage feed, profile page, and shelves themselves aren't wired to a
database yet — those live as static HTML mockups in this project's chat
history. Next real steps:

1. Design the Postgres schema in Supabase (users, shelves, shelf_books,
   reading_status, reviews)
2. Turn the homepage/profile mockups into real components reading from
   that schema
3. Add the ability to actually create/edit shelves

## Getting started

```bash
npm install
cp .env.local.example .env.local
```

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a free project, then
from **Settings → API** copy your Project URL and anon public key into
`.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Enable Google sign-in

In Supabase: **Authentication → Providers → Google** — you'll need a
Google Cloud OAuth client ID/secret. Supabase's docs walk through this:
https://supabase.com/docs/guides/auth/social-login/auth-google

Set the redirect URL in your Google Cloud console to:
`https://your-project.supabase.co/auth/v1/callback`

### 3. Run it

```bash
npm run dev
```

Visit `http://localhost:3000` — the landing page and `/discover` (real
Open Library data) work immediately. Sign-in works once step 2 is done.

## Design system

Colors, type, and the spine/shelf visual language are defined as CSS
variables and Tailwind theme tokens in `src/app/globals.css`. Palette:
ink-navy background, warm paper-cream text, brass-gold accents, oxblood
red as the "bookmark ribbon" accent. Fraunces (serif) for headlines,
Inter for UI, Spline Sans Mono for metadata/dates.