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
ADMIN_PASSWORD=<password for /admin — server-only, keep it different from the guest one>
```
Keep `DATABASE_URL` in 1Password (vault: "son of anton") and never commit the real value.

## Features
- **Public pages:** the home page (one scroll: details, events, attire, travel, registry,
  FAQ — the nav links are anchors into it) and RSVP. `/registry` 308-redirects to the
  `#registry` section (see `next.config.ts`); Gallery/Story removed per Feb 2026 refresh
- **Rehearsal dinner (`/thenightbefore`):** unlisted RSVP page for the night-before
  dinner — nothing on the site links to it and it's `noindex, nofollow`, so the URL is
  shared only with the guests who are invited. `/rehearsal-dinner` (an unused scaffold
  page) 308-redirects here.
- **Timeline:** Ceremony (4:30 PM), reception (5:00–10:30 PM), and weekend events —
  welcome drinks and the optional Wedding Walk — baked into `app/page.tsx`
- **Attire:** Black tie optional, in the `#attire` section of `app/page.tsx`
- **Theme:** Matches our printed invitation suite — ivory paper, blue hydrangea, sage
  vine. Tokens live in `app/globals.css` (`--hydrangea*`, `--sage*`) alongside the
  `.suite-frame` / `.suite-label` / `.suite-script` helpers; the floral SVG motifs are
  in `components/common/Floral.tsx`.
- **RSVP flow:**
  - Password gate (`components/rsvp/PasswordGate.tsx`)
  - Add multiple guests before submitting
  - Dinner selection per attending guest — each event's menu is defined once in
    `src/db/zod/schema.ts` (`MEAL_OPTIONS` for the wedding, `REHEARSAL_MEAL_OPTIONS`
    for the night before), persisted to `meal_choice`. The schema rejects a choice
    that isn't on that event's menu, so the two can't be crossed.
  - Allergy checkbox per attending guest — ticking it opens a required note,
    persisted to `allergy_notes`. Unticking discards what was typed, so a blank
    or stale note never reaches the database and `allergy_notes IS NOT NULL`
    means "there's something for the kitchen".
  - **Late allergies:** the FAQ on the home page has a "Tell us about an allergy"
    dialog (`components/rsvp/AllergyDialog.tsx` → `submitAllergyUpdate`) for guests
    who replied before the form asked. It matches on first + last name — case- and
    whitespace-insensitive, bound as parameters so `%` matches nobody — and updates
    every event that guest is on. No match returns "we can't find an RSVP under that
    name" with a link to the RSVP form; two guests sharing a name is reported rather
    than guessed at, since either choice could put an allergy on the wrong plate.
  - **Allergies are shared across both events.** A guest on both guest lists fills
    in two separate rows, so `syncGuestAllergy` reconciles them after every reply:
    the note just submitted wins, and a reply with no allergy inherits whatever is
    already on file rather than leaving that kitchen with a clean record. A reply
    never clears an allergy, and a name matching two different guests is skipped
    rather than guessed at. The rule itself is `resolveSharedAllergy` in
    `lib/rsvp-submit.ts` — pure, so it can be reasoned about without a database.
    Deliberately different notes per event aren't supported; edit those in the DB.
  - Duplicate detection on `(firstName, lastName, email)`
  - Inline validation powered by `react-hook-form` + `zod`
  - `submitRsvp` returns `{ success, error }` rather than throwing, since Next.js
    redacts Server Action error messages in production
  - The rehearsal dinner reuses the same form (`<RSVPForm variant="rehearsal" />`):
    same fields, menu of its own, and duplicate detection, writing to the separate
    `rehearsal_rsvps` table via `submitRehearsalRsvp` — so a guest can reply to both
    events independently
- **Admin dashboard (`/admin`):**
  - Password-gated on the server with `ADMIN_PASSWORD` (guest contact details never
    reach the client bundle unauthenticated) — the guest gate steps aside on `/admin`
    so only the admin password is needed. Session is a 12-hour httpOnly cookie.
  - Two tabs — **Wedding** (`/admin`) and **The Night Before** (`/admin?event=rehearsal`).
    Each tab is its own server render, so a tab is a shareable URL.
  - Response counts, attending/declined split, and per-dinner totals for whichever
    event's menu the active tab uses, plus a count of guests with an allergy
  - Allergy notes show as their own column, are matched by the search box, and
    ride along in the CSV
  - Searchable, filterable guest table
  - **Export CSV** button → `/admin/export`, which re-applies the on-screen
    tab/search/filter server-side. Excel-safe: UTF-8 BOM and formula-injection guards.
  - Shared shaping/filter/CSV logic lives in `wedding/lib/rsvp-report.ts`, keyed by
    `RsvpEvent` (`"wedding" | "rehearsal"`)
- **Admin Excel + email export:** Run from repo root:
  ```bash
  uv run scripts-shared/export_rsvps.py
  ```
  Generates a styled Excel file (auto-fit columns, headers) and emails it via Gmail API.

## Deployment
- Hosted on Vercel (production branch: `main`).
- Always create a PR for code changes; Vercel deploys after merge.
- Environment variables managed through Vercel dashboard—mirror `.env.local`.

## Useful Paths
- `app/page.tsx` – the whole public site, section by section (registry + Venmo funds included)
- `app/` – other route files (RSVP, `/thenightbefore`, Admin)
- `app/admin/` – dashboard page, login/logout actions, `export/route.ts` CSV download
- `components/` – shared UI, navigation, RSVP form/pw gate
- `src/db/schema.ts` – Drizzle schema definitions
- `scripts-shared/export_rsvps.py` (workspace root) – Neon + Gmail export utility

Keep this README updated when timelines, env vars, or workflows change.
