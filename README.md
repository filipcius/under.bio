# under.bio

Swag-clean profile pages with Discord login, unique slugs, Supabase storage, and AI-ready JSON templates.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Auth.js (Discord OAuth)
- Supabase Postgres (RLS on, writes via server service role)
- Font Awesome icons with soft glow
- Zod-validated profile JSON schema

## Features

- Discord login gated by membership in a required server (bot membership check)
- Discord avatar + profile stats synced on login
- One page per account (`pages.profile_id` unique)
- Unique URL endings (`under.bio/{slug}`) with reserved-word protection
- Dashboard: Profile, Options, Miscellaneous, Extras, Account
- Import / export JSON matching `templates/underbio-profile.template.json`
- Hidden scrollbars, smooth transitions, white–gray–black theme
- No premium (ready to add later)

## Setup

### 1. Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Open SQL Editor and run [`supabase/schema.sql`](supabase/schema.sql)
3. Copy Project URL, anon key, and service role key into `.env.local`

### 2. Discord application

1. Create an app at [Discord Developer Portal](https://discord.com/developers/applications)
2. OAuth2 → Redirects: `http://localhost:3000/api/auth/callback/discord`
3. Create a bot, invite it to your server (needs ability to fetch members)
4. Enable Server Members Intent if you rely on member lookups
5. Put Client ID, Client Secret, Bot Token, and Guild ID into `.env.local`

### 3. App

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## AI JSON template

Canonical file:

- [`templates/underbio-profile.template.json`](templates/underbio-profile.template.json)
- Also served at `/templates/underbio-profile.template.json`

Workflow:

1. Download / copy the template
2. Ask an AI to fill every field for a profile
3. Dashboard → Profile → paste JSON → Import & apply
4. Server validates with Zod before saving (slug stays locked to your account)

## Security model

- Mutations only through Next.js server actions (service role never shipped to the browser)
- Guild membership verified with the Discord Bot API on sign-in
- Slug uniqueness enforced in Postgres + app checks
- Reserved slugs blocked
- Zod validation on config import/save
- RLS enabled; public read for published pages only
- Session JWT via Auth.js

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
