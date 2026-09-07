# Pivotum — Winning in the Age of AI

A free AI career-exposure index plus **Winning in the Age of AI**, a paid
membership community (living Career Map, Together pods, Judgment Gym, Workflow
Rebuilds, events).

This is a [Next.js](https://nextjs.org) (App Router + TypeScript) site on
[Vercel](https://vercel.com), with Vercel Postgres (Drizzle), Vercel Blob,
Clerk auth, Stripe subscriptions, Resend email, web-push, and Anthropic Claude.

## Getting started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the local development server   |
| `npm run build` | Create a production build            |
| `npm run start` | Serve the production build locally   |
| `npm run lint`  | Run Next.js linting                  |

## Deploying to Vercel

The public site builds with zero config, but the paid community (`/hub`) needs
data stores, env vars, a Stripe product, and a one-time schema install. Do these
in order:

1. **Import** the repo in [Vercel](https://vercel.com/new).
2. **Attach stores**: add a Vercel **Postgres** store and a **Blob** store to the
   project (these auto-inject `POSTGRES_URL` and `BLOB_READ_WRITE_TOKEN`).
3. **Set env vars** (Project → Settings → Environment Variables) — see
   `.env.example` for the full, annotated list. At minimum for the community:
   Clerk keys, `STRIPE_SECRET_KEY`, `STRIPE_MEMBERSHIP_PRICE_ID`,
   `STRIPE_WEBHOOK_SECRET`, `CRON_SECRET`, `ANTHROPIC_API_KEY`, the three
   `VAPID*` keys, and `FOUNDER_EMAILS`.
4. **Generate VAPID keys**: `npx web-push generate-vapid-keys` → set
   `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `NEXT_PUBLIC_VAPID_PUBLIC_KEY`.
5. **Stripe**: create a recurring **Price** for the membership →
   `STRIPE_MEMBERSHIP_PRICE_ID`; add a webhook endpoint at `/api/webhook`
   subscribed to `checkout.session.completed` and `customer.subscription.*`,
   then copy its signing secret → `STRIPE_WEBHOOK_SECRET`.
6. **Deploy.**
7. **Install the schema** (once), signed in as a `FOUNDER_EMAILS` account:
   - Fresh DB: `POST /api/admin/migrate` with header
     `x-migrate-confirm: RESET-SCHEMA` (this DROPs + recreates the schema — only
     for an empty database), **then** `GET /api/admin/migrate?patch=1` (adds the
     later tables + seeds badges and the starter pods). Alternatively
     `npx drizzle-kit push` then `GET /api/admin/migrate?patch=1`.
   - `GET /api/admin/migrate` (no params) is a safe diagnostic; `/api/health`
     checks Postgres + Blob.
8. **Crons** in `vercel.json` register automatically on deploy; they return 503
   until `CRON_SECRET` is set.

Every push to the connected branch triggers a new deployment automatically.

## Project structure

```
app/            Routes — public site, /map, /hub (member platform), /api
components/      React components (public + hub/)
lib/            Server logic — billing, gate, gym, rebuild, notifications, …
db/             Drizzle schema (schema.ts) + DDL/patches (ddl.ts)
content/        MDX — careers, legal pages, articles
```
