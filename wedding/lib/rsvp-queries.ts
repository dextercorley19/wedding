import { and, desc, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { rehearsalRsvps, rsvps } from "@/db/schema";
import { toRehearsalRsvpRow, toRsvpRow, type RsvpEvent, type RsvpRow } from "@/lib/rsvp-report";
import { resolveSharedAllergy } from "@/lib/rsvp-submit";

/** Every wedding RSVP, newest first — server-only; see the note in `lib/rsvp-report.ts`. */
export async function fetchRsvpRows(): Promise<RsvpRow[]> {
  const rows = await db.select().from(rsvps).orderBy(desc(rsvps.createdAt));
  return rows.map(toRsvpRow);
}

/** Every rehearsal dinner RSVP, newest first. */
export async function fetchRehearsalRsvpRows(): Promise<RsvpRow[]> {
  const rows = await db.select().from(rehearsalRsvps).orderBy(desc(rehearsalRsvps.createdAt));
  return rows.map(toRehearsalRsvpRow);
}

/** The rows behind one admin tab. */
export const fetchRsvpRowsForEvent = (event: RsvpEvent): Promise<RsvpRow[]> =>
  event === "rehearsal" ? fetchRehearsalRsvpRows() : fetchRsvpRows();

/**
 * Matches a guest's name, case- and whitespace-insensitive on both sides, so
 * "ada  LOVELACE " finds the row stored as "Ada Lovelace".
 *
 * The name is bound as a parameter rather than built into a LIKE pattern, so a
 * guest typing `%` matches nobody instead of everybody.
 */
export const nameMatches = <T extends typeof rsvps | typeof rehearsalRsvps>(
  table: T,
  firstName: string,
  lastName: string
) =>
  and(
    sql`lower(trim(${table.firstName})) = ${firstName.trim().toLowerCase()}`,
    sql`lower(trim(${table.lastName})) = ${lastName.trim().toLowerCase()}`
  );

/**
 * Every RSVP filed under a guest's name, across both events.
 *
 * Names are not unique, so this returns every match and leaves it to the caller
 * to decide what to do when there is more than one.
 */
export async function findRsvpsByName(firstName: string, lastName: string) {
  const [wedding, rehearsal] = await Promise.all([
    db
      .select({ id: rsvps.id, allergyNotes: rsvps.allergyNotes })
      .from(rsvps)
      .where(nameMatches(rsvps, firstName, lastName)),
    db
      .select({ id: rehearsalRsvps.id, allergyNotes: rehearsalRsvps.allergyNotes })
      .from(rehearsalRsvps)
      .where(nameMatches(rehearsalRsvps, firstName, lastName)),
  ]);

  return { wedding, rehearsal };
}

/**
 * Keep a guest's allergy the same on both of their RSVPs.
 *
 * Called after a reply is filed, since a guest who is on both guest lists fills
 * in two separate rows and shouldn't have to remember the allergy twice. Rows
 * that already agree are left untouched, and a name matching two different
 * guests is skipped rather than guessed at — the same call the FAQ dialog makes.
 *
 * Best effort: the RSVP itself is already saved, so a failure here is logged
 * rather than surfaced to the guest.
 */
export async function syncGuestAllergy(
  firstName: string,
  lastName: string,
  submitted: string | null
) {
  try {
    const { wedding, rehearsal } = await findRsvpsByName(firstName, lastName);

    // Two guests sharing a name — copying between them would put one person's
    // allergy on another person's plate.
    if (wedding.length > 1 || rehearsal.length > 1) return;

    const notes = resolveSharedAllergy(
      submitted,
      [...wedding, ...rehearsal].map((row) => row.allergyNotes)
    );

    if (!notes) return;

    const stale = (rows: { id: string; allergyNotes: string | null }[]) =>
      rows.filter((row) => row.allergyNotes !== notes).map((row) => row.id);

    const ids = { wedding: stale(wedding), rehearsal: stale(rehearsal) };

    if (ids.wedding.length === 0 && ids.rehearsal.length === 0) return;

    await setAllergyNotes(ids, notes);
  } catch (error) {
    console.error("Allergy sync error:", error);
  }
}

/** Record an allergy note against RSVPs we've already matched by id. */
export async function setAllergyNotes(
  ids: { wedding: string[]; rehearsal: string[] },
  notes: string
) {
  const updatedAt = new Date();

  await Promise.all([
    ids.wedding.length > 0
      ? db
          .update(rsvps)
          .set({ allergyNotes: notes, updatedAt })
          .where(inArray(rsvps.id, ids.wedding))
      : Promise.resolve(),
    ids.rehearsal.length > 0
      ? db
          .update(rehearsalRsvps)
          .set({ allergyNotes: notes, updatedAt })
          .where(inArray(rehearsalRsvps.id, ids.rehearsal))
      : Promise.resolve(),
  ]);
}
