# Wedding Site

Customer-facing wedding site + RSVP flow for Dexter & Sami. Built with **Next.js 16 + Drizzle + Neon** and deployed on Vercel.

## Stack
- **Frontend:** Next.js App Router, Tailwind 4, shadcn components
- **Database:** Neon PostgreSQL (serverless) accessed via Drizzle ORM
- **Auth:** Simple password gate for RSVP (no guest accounts)
- **Admin tooling:** Excel export + Gmail delivery via root-level `scripts-shared/export_rsvps.py`

## Linting & Formatting
- Follow [TYPESCRIPT-CONVENTIONS.md](../TYPESCRIPT-CONVENTIONS.md) and keep shadcn components in sync via the MCP client.
- Ensure `bun run verify` (lint + format + type-check) passes before committing. If the pipeline is missing, add [`prek`](https://github.com/j178/prek) or extend the existing scripts to cover ESLint/Prettier/TSC.

## Local Development
```bash
cd fullstack-ts-wedding-site/wedding
bun install          # or npm install
bun run dev          # next dev on http://localhost:3000
```
The build script (`bun run build`) automatically runs `drizzle-kit push --force` before compiling, so ensure your Neon credentials are correct.

### Required Environment Variables (`fullstack-ts-wedding-site/wedding/.env.local`)
```env
DATABASE_URL="postgresql://user:password@region.neon.tech/dbname?sslmode=require&channel_binding=require"
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_RSVP_PASSWORD=<password shown to invitees>
```
Keep `DATABASE_URL` in 1Password (vault: "son of anton") and never commit the real value.

## Features
- **Public pages:** Details, RSVP, Registry (Gallery/Story removed per Feb 2026 refresh)
- **Timeline:** Ceremony + reception schedule baked into `app/page.tsx`
- **RSVP flow:**
  - Password gate (`components/rsvp/PasswordGate.tsx`)
  - Add multiple guests before submitting
  - Duplicate detection on `(firstName, lastName, email)`
  - Inline validation powered by `react-hook-form` + `zod`
- **Admin Export:** Run from repo root:
  ```bash
  uv run scripts-shared/export_rsvps.py
  ```
  Generates a styled Excel file (auto-fit columns, headers) and emails it via Gmail API.

## Deployment
- Hosted on Vercel (production branch: `main`).
- Always create a PR for code changes; Vercel deploys after merge.
- Environment variables managed through Vercel dashboard—mirror `.env.local`.

## Useful Paths
- `app/` – route files (Details, RSVP, Registry)
- `components/` – shared UI, navigation, RSVP form/pw gate
- `src/db/schema.ts` – Drizzle schema definitions
- `scripts-shared/export_rsvps.py` (workspace root) – Neon + Gmail export utility

Keep this README updated when timelines, env vars, or workflows change.
