import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { rehearsalRsvps, rehearsalSeats, rehearsalTables } from "@/db/schema";
import { mealLabel } from "@/db/zod/schema";
import {
  DEFAULT_TABLE_SEATS,
  nextTableName,
  sortGuests,
  type SeatingGuest,
  type SeatingPlan,
  type SeatingTable,
} from "@/lib/seating";

/**
 * Database access for the rehearsal dinner seating chart — server-only; see the
 * note in `lib/seating.ts`.
 *
 * Only attending guests are seated. Someone who declines has no seat to be in,
 * and a guest who changes their reply to "no" drops out of the chart on the
 * next render rather than holding a chair.
 */

/** Tables in chart order; creation time breaks a tie in `sort_order`. */
const tablesInOrder = () =>
  db
    .select()
    .from(rehearsalTables)
    .orderBy(asc(rehearsalTables.sortOrder), asc(rehearsalTables.createdAt));

/**
 * The whole chart in two queries: the tables, and every attending guest with
 * the seat they're in (left join, so an unplaced guest still comes back).
 */
export async function fetchSeatingPlan(): Promise<SeatingPlan> {
  const [tables, guests] = await Promise.all([
    tablesInOrder(),
    db
      .select({
        rsvpId: rehearsalRsvps.id,
        firstName: rehearsalRsvps.firstName,
        lastName: rehearsalRsvps.lastName,
        mealChoice: rehearsalRsvps.mealChoice,
        allergyNotes: rehearsalRsvps.allergyNotes,
        tableId: rehearsalSeats.tableId,
        seatOrder: rehearsalSeats.seatOrder,
      })
      .from(rehearsalRsvps)
      .leftJoin(rehearsalSeats, eq(rehearsalSeats.rsvpId, rehearsalRsvps.id))
      .where(eq(rehearsalRsvps.attending, true))
      .orderBy(asc(rehearsalSeats.seatOrder), asc(rehearsalRsvps.lastName)),
  ]);

  const seated = new Map<string, SeatingGuest[]>(tables.map((table) => [table.id, []]));
  const unseated: SeatingGuest[] = [];

  for (const row of guests) {
    const guest: SeatingGuest = {
      rsvpId: row.rsvpId,
      firstName: row.firstName,
      lastName: row.lastName,
      mealName: mealLabel(row.mealChoice, "rehearsal"),
      allergyNotes: row.allergyNotes,
    };

    // `?? unseated` covers a seat whose table is gone — the cascade should mean
    // there isn't one, but a guest is better unplaced than dropped.
    (row.tableId ? (seated.get(row.tableId) ?? unseated) : unseated).push(guest);
  }

  return {
    tables: tables.map(
      (table): SeatingTable => ({
        id: table.id,
        name: table.name,
        seats: table.seats,
        guests: seated.get(table.id) ?? [],
      })
    ),
    unseated: sortGuests(unseated),
  };
}

/** Add a table to the end of the chart, named for the couple to rename. */
export async function createSeatingTable(seats = DEFAULT_TABLE_SEATS) {
  const tables = await tablesInOrder();
  const sortOrder = tables.reduce((max, table) => Math.max(max, table.sortOrder), -1) + 1;

  const [created] = await db
    .insert(rehearsalTables)
    .values({
      name: nextTableName(
        tables.map((table) => ({ id: table.id, name: table.name, seats: table.seats, guests: [] }))
      ),
      seats,
      sortOrder,
    })
    .returning();

  return created;
}

export async function renameSeatingTable(tableId: string, name: string) {
  await db
    .update(rehearsalTables)
    .set({ name, updatedAt: new Date() })
    .where(eq(rehearsalTables.id, tableId));
}

export async function setSeatingTableSeats(tableId: string, seats: number) {
  await db
    .update(rehearsalTables)
    .set({ seats, updatedAt: new Date() })
    .where(eq(rehearsalTables.id, tableId));
}

/** Delete a table; the cascade on `rehearsal_seats` unseats whoever was there. */
export async function deleteSeatingTable(tableId: string) {
  await db.delete(rehearsalTables).where(eq(rehearsalTables.id, tableId));
}

/** Empty a table but keep it in the chart. */
export async function clearSeatingTable(tableId: string) {
  await db.delete(rehearsalSeats).where(eq(rehearsalSeats.tableId, tableId));
}

/** Send every guest back to the unseated list, leaving the tables laid out. */
export async function clearAllSeats() {
  await db.delete(rehearsalSeats);
}

/** True when this id is an attending rehearsal guest — the only kind that can be seated. */
const isAttendingGuest = async (rsvpId: string) => {
  const [guest] = await db
    .select({ id: rehearsalRsvps.id })
    .from(rehearsalRsvps)
    .where(and(eq(rehearsalRsvps.id, rsvpId), eq(rehearsalRsvps.attending, true)))
    .limit(1);

  return guest !== undefined;
};

export type SeatMoveResult = { ok: true } | { ok: false; error: string };

/**
 * Seat a guest at `tableId`, or unseat them when it's null.
 *
 * `index` is the position within the table; the rest of its seats are
 * renumbered around it so the stored order matches what the chart shows. The
 * guest's seat row is upserted on `rsvp_id`, which is unique, so a move can't
 * leave them sitting in two places at once.
 *
 * The neon-http driver has no transactions, so the upsert and the renumber are
 * separate statements. The worst a failure between them can do is leave a
 * guest at the right table in the wrong seat order — visible on the chart, and
 * fixed by moving them again.
 */
export async function moveGuestToTable(
  rsvpId: string,
  tableId: string | null,
  index?: number
): Promise<SeatMoveResult> {
  if (!(await isAttendingGuest(rsvpId))) {
    return { ok: false, error: "That guest isn't on the attending list for the night before." };
  }

  if (tableId === null) {
    await db.delete(rehearsalSeats).where(eq(rehearsalSeats.rsvpId, rsvpId));
    return { ok: true };
  }

  const [table] = await db
    .select({ id: rehearsalTables.id })
    .from(rehearsalTables)
    .where(eq(rehearsalTables.id, tableId))
    .limit(1);

  if (!table) {
    return { ok: false, error: "That table has been deleted — refresh the chart." };
  }

  const existing = await db
    .select({ rsvpId: rehearsalSeats.rsvpId })
    .from(rehearsalSeats)
    .where(eq(rehearsalSeats.tableId, tableId))
    .orderBy(asc(rehearsalSeats.seatOrder));

  const ordered = existing.map((seat) => seat.rsvpId).filter((id) => id !== rsvpId);
  ordered.splice(index === undefined ? ordered.length : Math.max(0, index), 0, rsvpId);

  const updatedAt = new Date();

  await db
    .insert(rehearsalSeats)
    .values({ rsvpId, tableId, seatOrder: ordered.indexOf(rsvpId), updatedAt })
    .onConflictDoUpdate({
      target: rehearsalSeats.rsvpId,
      set: { tableId, seatOrder: ordered.indexOf(rsvpId), updatedAt },
    });

  // One statement for the renumber: a CASE mapping each guest to their new seat.
  if (ordered.length > 1) {
    const cases = sql.join(
      ordered.map((id, position) => sql`when ${rehearsalSeats.rsvpId} = ${id} then ${position}`),
      sql` `
    );

    await db
      .update(rehearsalSeats)
      .set({
        seatOrder: sql`case ${cases} else ${rehearsalSeats.seatOrder} end`,
        updatedAt,
      })
      .where(inArray(rehearsalSeats.rsvpId, ordered));
  }

  return { ok: true };
}
