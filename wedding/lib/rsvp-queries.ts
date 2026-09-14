import { desc } from "drizzle-orm";
import { db } from "@/db";
import { rehearsalRsvps, rsvps } from "@/db/schema";
import { toRehearsalRsvpRow, toRsvpRow, type RsvpEvent, type RsvpRow } from "@/lib/rsvp-report";

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
