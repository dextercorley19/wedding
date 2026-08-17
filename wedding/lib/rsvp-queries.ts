import { desc } from "drizzle-orm";
import { db } from "@/db";
import { rsvps } from "@/db/schema";
import { toRsvpRow, type RsvpRow } from "@/lib/rsvp-report";

/** Every RSVP, newest first — server-only; see the note in `lib/rsvp-report.ts`. */
export async function fetchRsvpRows(): Promise<RsvpRow[]> {
  const rows = await db.select().from(rsvps).orderBy(desc(rsvps.createdAt));
  return rows.map(toRsvpRow);
}
