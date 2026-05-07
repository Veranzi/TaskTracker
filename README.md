# Pulse

Internal task tracker for our team. Built with Next.js 16, Supabase, Drizzle, and Tailwind v4.

## Stack

- **Next.js 16** (App Router, React 19) + TypeScript
- **Tailwind v4** + shadcn/ui (added in Step 2) — slate base, gold accent, dark mode default
- **Supabase** for Auth + Postgres + Realtime
- **Drizzle ORM** for type-safe queries and migrations

No RLS, no multi-tenant — single shared workspace, auth middleware enforces "must be logged in".

## Local setup

### 1. Create a Supabase project

1. Sign up at [supabase.com](https://supabase.com) and create a new project (free tier is fine).
2. Wait for provisioning (~2 min).

### 2. Grab credentials

In the Supabase dashboard:

- **Project Settings → API** → copy the Project URL and `anon` key.
- **Project Settings → Database → Connection string → Transaction pooler** → copy the URL (port 6543). Replace `[YOUR-PASSWORD]` with the DB password you set during project creation.

### 3. Configure environment

```sh
cp .env.example .env.local
```

Fill in:

```
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 4. Install & migrate

```sh
pnpm install
pnpm db:generate    # creates migration SQL in ./drizzle
pnpm db:push        # applies schema directly (use this in dev)
```

> Use `db:push` in development for fast iteration. Use `db:generate` + `db:migrate` for production-style versioned migrations.

### 5. Run

```sh
pnpm dev
```

Open <http://localhost:3000> and visit `/health` to confirm DB connectivity.

## Useful scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` / `pnpm start` | Production build & run |
| `pnpm db:generate` | Generate a new migration from schema changes |
| `pnpm db:push` | Apply schema directly (dev) |
| `pnpm db:migrate` | Run pending migrations (production) |
| `pnpm db:studio` | Open Drizzle Studio for browsing data |

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, import the repo. Set the root directory to `pulse/` if you imported the parent.
3. Add the three env vars from `.env.local` to Vercel project settings.
4. Deploy.

To run migrations against production, run `pnpm db:migrate` locally with your production `DATABASE_URL` set, or wire it into a CI job.

## Project layout

```
pulse/
├── app/
│   ├── health/route.ts     # DB health check
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── lib/
│   ├── db/
│   │   ├── schema.ts       # Drizzle tables: users, projects, tasks, ...
│   │   └── client.ts       # Postgres client + drizzle()
│   └── env.ts              # Zod-validated env access (server-only)
├── drizzle.config.ts
└── drizzle/                # generated migrations (after db:generate)
```

The full structure (auth pages, sidebar, board view, etc.) fills in across Steps 2–9.
