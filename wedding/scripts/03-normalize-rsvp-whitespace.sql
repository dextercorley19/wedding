-- One-off cleanup: strip stray whitespace from guest names and emails.
--
-- WHY THIS IS A SCRIPT AND NOT A MIGRATION
-- `bun run build` runs `drizzle-kit push --force`, which syncs the schema
-- straight from `src/db/schema.ts`. It never executes the files in `drizzle/`
-- (`drizzle.__drizzle_migrations` is empty — no migration file has ever been
-- applied to this database). A data fix placed there would look applied and
-- silently do nothing, so run this by hand instead.
--
-- WHAT WENT WRONG
-- The `(first_name, last_name, email)` unique index compares exact strings.
-- Phone keyboards append a trailing space, so "Megan " filed as a different
-- guest from "Megan" and the same person RSVP'd twice. Submissions are now
-- trimmed in `src/db/zod/schema.ts`, so this should not recur; this script
-- cleans up the rows that predate that fix.
--
-- ORDER MATTERS: resolve duplicates first. Trimming a row into a collision
-- with an existing one trips the unique index and fails the whole UPDATE.

-- 1. Find rows that only differ by case or whitespace. Review them by hand —
--    do not delete blind. Keep the earliest reply, and before removing the
--    later one, carry over anything it has that the keeper lacks (an allergy
--    note, a dinner selection). Delete only when the survivor loses nothing.
SELECT
  lower(trim(first_name))                                        AS first_norm,
  lower(trim(last_name))                                         AS last_norm,
  lower(trim(email))                                             AS email_norm,
  count(*)                                                       AS rows,
  array_agg(id ORDER BY created_at)                              AS ids,
  array_agg(quote_literal(first_name) ORDER BY created_at)       AS stored_first,
  array_agg(coalesce(meal_choice, '—') ORDER BY created_at)      AS meals,
  array_agg(coalesce(allergy_notes, '—') ORDER BY created_at)    AS allergies,
  array_agg(created_at ORDER BY created_at)                      AS created
FROM rsvps
GROUP BY 1, 2, 3
HAVING count(*) > 1;

-- 2. Back up any row you are about to remove. Keep the output: it restores the
--    row exactly, so the delete stays reversible.
-- SELECT format(
--   'INSERT INTO rsvps (id, first_name, last_name, email, attending, meal_choice, allergy_notes, created_at, updated_at) VALUES (%L, %L, %L, %L, %L, %L, %L, %L, %L);',
--   id, first_name, last_name, email, attending, meal_choice, allergy_notes, created_at, updated_at)
-- FROM rsvps WHERE id = '<duplicate-id>';

-- 3. Remove the reviewed duplicate.
-- DELETE FROM rsvps WHERE id = '<duplicate-id>';

-- 4. Trim what is left. Idempotent, and a no-op once the data is clean.
UPDATE rsvps
SET first_name = trim(first_name),
    last_name  = trim(last_name),
    email      = trim(email),
    updated_at = now()
WHERE first_name <> trim(first_name)
   OR last_name  <> trim(last_name)
   OR email      <> trim(email);

UPDATE rehearsal_rsvps
SET first_name = trim(first_name),
    last_name  = trim(last_name),
    email      = trim(email),
    updated_at = now()
WHERE first_name <> trim(first_name)
   OR last_name  <> trim(last_name)
   OR email      <> trim(email);

-- 5. Confirm. Both columns should read 0.
SELECT 'rsvps' AS tbl, count(*) AS rows,
       count(*) FILTER (WHERE first_name <> trim(first_name)
                          OR last_name  <> trim(last_name)
                          OR email      <> trim(email)) AS untrimmed
FROM rsvps
UNION ALL
SELECT 'rehearsal_rsvps', count(*),
       count(*) FILTER (WHERE first_name <> trim(first_name)
                          OR last_name  <> trim(last_name)
                          OR email      <> trim(email))
FROM rehearsal_rsvps;
