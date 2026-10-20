# Wedding Site

Customer-facing wedding site + RSVP flow for Dexter & Sami. Built with **Next.js 16 + Drizzle + Neon** and deployed on Vercel.

## Stack
- **Frontend:** Next.js App Router, Tailwind 4, shadcn components
- **Database:** Neon PostgreSQL (serverless) accessed via Drizzle ORM
- **Auth:** None for guests — the site and RSVP are public (no guest accounts); `/admin` is password-gated on the server
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
ADMIN_PASSWORD=<password for /admin — server-only, never prefix with NEXT_PUBLIC_>
```
Keep `DATABASE_URL` in 1Password (vault: "son of anton") and never commit the real value.

## Features
- **Public pages:** the home page (one scroll: details, events, attire, travel, registry,
  FAQ — the nav links are anchors into it) and RSVP. `/registry` 308-redirects to the
  `#registry` section (see `next.config.ts`); Gallery/Story removed per Feb 2026 refresh
- **Rehearsal dinner (`/nightbefore`):** unlisted RSVP page for the night-before
  dinner — nothing on the site links to it and it's `noindex, nofollow`, so the URL is
  shared only with the guests who are invited. `/thenightbefore` (the page's first
  URL) and `/rehearsal-dinner` (an unused scaffold page) both 308-redirect here.
- **Timeline:** Ceremony (4:30 PM), reception (5:00–10:30 PM), and weekend events —
  welcome drinks and the optional Wedding Walk — baked into `app/page.tsx`
- **Attire:** Black tie optional, in the `#attire` section of `app/page.tsx`
- **Theme:** Matches our printed invitation suite — ivory paper, blue hydrangea, sage
  vine. Tokens live in `app/globals.css` (`--hydrangea*`, `--sage*`) alongside the
  `.suite-frame` / `.suite-label` / `.suite-script` helpers; the floral SVG motifs are
  in `components/common/Floral.tsx`.
- **RSVP flow:**
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
    reach the client bundle unauthenticated). Session is a 12-hour httpOnly cookie.
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
- **Rehearsal dinner seating chart (`/admin/seating`):** linked from the
  **The Night Before** tab, behind the same admin password.
  - Each table is **drawn with its seats around it**, and a guest goes into a
    particular seat — so the chart answers "who is next to whom", not just "who is
    at table 3".
  - **Round or rectangle per table.** A round table takes a seat count; a rectangle
    takes seats **per side** (top / bottom / left end / right end), which is what
    fixes which chair someone is in — a rectangle of ten is a different room at 5+5
    than at 4+4+1+1. The drawing's proportions follow from those counts.
  - Everyone attending the night before starts in an **unseated** list. Guests move
    three ways — drag and drop, tap a guest then tap a seat, or the same two steps
    from a keyboard (HTML5 drag events don't fire on touch, and the chips and seats
    are real buttons).
  - **Dropping onto a taken seat swaps the two guests**, or returns the occupant to
    the unseated list if the guest being moved had no seat to give up. One seat
    can't hold two people, and silently discarding either would lose a decision.
  - Rename a table inline, reshape it, empty it, or delete it. Shrinking a table
    or deleting one sends the affected guests back to the unseated list rather than
    refusing the edit or dropping them off the chart.
  - **Any table opens full screen** (the expand icon on its card): one table on its
    own, zoomed to fit the window, with the unseated list beside it so it's somewhere
    to work rather than just somewhere to look. Zoom with −/+, or click the percentage
    (or **Fit**) to go back to fitting the window; the fit is measured with a
    `ResizeObserver`, so it follows the window. Escape closes it. The guest list is
    hidden on a phone, where the table needs the room — select a guest in the chart
    first, then open the table and tap a seat.
  - **Tables are drawn at the size their seats need** (`tableBoxRem`), not squeezed
    into a fixed card: every seat gets the same pitch whether a table seats 8 or 32,
    which is what a dinner of three 30-seat tables needs. A table too wide for the
    card scrolls sideways inside it (the card is `min-w-0`, so the page itself never
    scrolls), and a wide table claims a whole row of the chart while small ones still
    sit two or three across.
  - Each seat carries the guest's dinner selection and an allergy marker, so the
    kitchen-relevant detail is visible while seating rather than only in the export.
  - Moves are optimistic (`useOptimistic`) with the server's plan as the source of
    truth, so a refused move reverts on its own.
  - **Two things to send the planners:**
    - **Export CSV** → `/admin/seating/export`: one row per guest with table, shape,
      **seat number and side**, dinner, and allergy — enough to lay place cards from
      the file alone. Guests with no seat yet are listed at the end under "Unseated"
      rather than omitted.
    - **Printable layout** → `/admin/seating/print`: the tables drawn with full names
      in their seats, plus an allergy list and anyone still unseated. Printed (or
      saved as a PDF) from the browser, so what the planners hold is the same
      arrangement the couple made. Print rules live in `app/globals.css`, scoped to
      `.seating-print`.
      - **Every table lands whole on the page.** Paper doesn't scroll, so a table
        wider than the printable area used to run off the right edge and be lost.
        `fitToPrintedPage` scales each table to the page, and a table that would
        have to shrink a lot upright is instead turned a quarter turn to use the
        page's long side — a 15-a-side table prints at ~67% sideways rather than
        ~56% upright, and its heading says "turned sideways to fit". The turn lives
        in `components/admin/PrintedTable.tsx`, so `TableDiagram` stays the one
        thing that knows where seats go.
  - Seat geometry is defined once, in `seatSlots` (`wedding/lib/seating.ts`), and
    both the interactive chart and the printed layout draw from it via
    `components/admin/TableDiagram.tsx` — so seat 7 is the same chair in the chart,
    the CSV and the print-out.
  - Only *attending* guests can be seated; a guest who changes their reply to "no"
    drops off the chart. Tables live in `rehearsal_tables` (shape + per-side seat
    counts), one seat row per seated guest in `rehearsal_seats`, which is unique on
    `rsvp_id` (a guest sits once) **and** on `(table_id, seat_order)` (a seat holds
    one guest); both foreign keys cascade. Pure plan/geometry/CSV logic is in
    `wedding/lib/seating.ts`, queries in `wedding/lib/seating-queries.ts`.
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
- `app/` – other route files (RSVP, `/nightbefore`, Admin)
- `app/admin/` – dashboard page, login/logout actions, `export/route.ts` CSV download
- `app/admin/seating/` – seating chart, its server actions, CSV export, and `print/` layout
- `components/admin/` – `SeatingChart` (the editor), `TableFocusView` (one table full
  screen), `TableDiagram` (the drawing, shared with print), `SeatingPieces` (seat and
  guest chips plus the drag plumbing, shared by the chart and the full-screen view)
- `components/` – shared UI, navigation, RSVP form/pw gate
- `src/db/schema.ts` – Drizzle schema definitions
- `scripts-shared/export_rsvps.py` (workspace root) – Neon + Gmail export utility

Keep this README updated when timelines, env vars, or workflows change.
