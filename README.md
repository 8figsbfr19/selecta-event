# Selecta Event

The full Selecta Event platform: a premium public website plus a private
business-management system for running DJ bookings end to end.

## Stack

- **Next.js 14** (App Router, Server Actions) + TypeScript
- **Tailwind CSS** for the dark/gold glass design system
- **Prisma + Supabase Postgres** for the database — production-safe on
  Vercel (no local file, survives redeploys)
- **Supabase Storage** for all uploaded media — logo, gallery photos, event
  posters, service images. Nothing is written to the server's local
  filesystem, so it's safe on Vercel's ephemeral/serverless filesystem
- **Resend** for all outbound email — every email is logged in
  **Admin → Emails** regardless of whether `RESEND_API_KEY` is configured, so
  nothing is lost, and failed sends can be retried from that screen

## Getting started

1. Create a Supabase project (or use an existing one) and a Storage bucket —
   see "Supabase setup" below.
2. Copy `.env.example` to `.env` and fill in real values.
3. Install and set up the database:

```bash
npm install
npx prisma migrate dev --name init   # creates the schema on your Supabase DB
npx tsx prisma/seed.ts               # creates the admin login + starter data
npm run dev
```

Visit `http://localhost:3000` for the public site and
`http://localhost:3000/admin` for the business dashboard.

Default admin login (from `.env` / seed): see `ADMIN_EMAIL` / `ADMIN_PASSWORD`
in `.env`. **Change the password from Admin → Settings → Security** as soon
as you log in for the first time.

## Supabase setup

**Database** — Project Settings → Database → Connection string. Copy both:
- the **Transaction pooler** string (port 6543) into `DATABASE_URL`
- the **direct/session** string (port 5432) into `DIRECT_URL`

The app uses the pooler for normal queries (required on serverless — Postgres
has a low connection limit and every Vercel function is a new connection) and
the direct URL only for running migrations.

**Storage** — Storage → New bucket:
- Name: `selecta-media` (or whatever you set `SUPABASE_STORAGE_BUCKET` to)
- **Public bucket: on** — logo/gallery/poster/service images are public
  marketing assets, same as they were as static files before
- Add a policy allowing `service_role` to `INSERT`/`SELECT` (the service role
  key already bypasses RLS by default, but if you've changed default Storage
  policies, make sure uploads and public reads aren't blocked)

**API keys** — Project Settings → API:
- `SUPABASE_URL` = Project URL
- `SUPABASE_SERVICE_ROLE_KEY` = the `service_role` secret key — **server-only,
  never expose this to the browser or commit it**

## Environment variables

Copy `.env.example` to `.env` and fill in real values before deploying. See
that file for full comments on each one; in short:

- `DATABASE_URL` / `DIRECT_URL` — Supabase Postgres (pooled / direct)
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_STORAGE_BUCKET` —
  Supabase Storage, server-side only
- `AUTH_SECRET` — long random string used to sign admin session cookies
- `NEXT_PUBLIC_SITE_URL` — the real public URL (used in contract/email links)
- `RESEND_API_KEY` / `RESEND_FROM_EMAIL` — outbound email. Leave the key
  blank to run without sending — every attempt still gets logged

## Deploying (Vercel)

This is a full Node application. The build (`npm run build`) runs
`prisma generate && prisma migrate deploy && next build`, so every deploy
automatically applies any pending migrations to your Supabase database before
building — set `DATABASE_URL` and `DIRECT_URL` in the Vercel project's
environment variables (all environments) or the build will fail trying to
reach Postgres.

Nothing in the app writes to the local filesystem at runtime anymore —
uploads go to Supabase Storage and all data lives in Supabase Postgres, so
normal Vercel redeploys (including from a fresh checkout) are safe.

## What's here

- **Public site**: Home, About, Services, Gallery, Events (toggleable),
  Get a Quote, Contact — all content-managed from the admin
- **Admin**: Dashboard, Calendar, Inquiries, Quotes, Bookings, Contracts
  (templates + signable contracts), Clients, Payments, Receipts, Events,
  RSVPs, Emails, Gallery, Services, Settings (Security / password change,
  Email Sending, Email Templates)
- **Public contract signing**: `/contract/[token]` — no customer account
  required, signed contracts are locked and can only be duplicated (never
  overwritten)
- **Reminders**: contract signature reminders, payment reminders
  (deposit/balance/final), quote follow-ups — all with editable templates and
  a "Needs Attention" summary on the dashboard

## Legacy

`legacy-countdown/` holds the original static countdown launch page, kept for
reference. It's no longer wired up to anything.
