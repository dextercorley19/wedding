import { and, asc, eq, gte, inArray } from "drizzle-orm";
import { db } from "@/db";
import { rehearsalRsvps, rehearsalSeats, rehearsalTables } from "@/db/schema";
import { mealLabel } from "@/db/zod/schema";
import {
  DEFAULT_TABLE_SEATS,
  DEFAULT_TABLE_SIDES,
  nextTableName,
  parseTableShape,
  sortGuests,
  tableCapacity,
  type SeatedGuest,
  type SeatingGuest,
  type SeatingPlan,
  type SeatingTable,
  type TableShape,
  type TableSides,
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

type TableRow = Awaited<ReturnType<typeof tablesInOrder>>[number];

/** The stored columns as the shape the chart and its geometry work in. */
const toTableShape = (row: TableRow): Pick<SeatingTable, "shape" | "seats" | "sides"> => ({
  shape: parseTableShape(row.shape),
  seats: row.seats,
  sides: {
    top: row.seatsTop,
    bottom: row.seatsBottom,
    left: row.seatsLeft,
    right: row.seatsRight,
  },
});

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
        seat: rehearsalSeats.seatOrder,
      })
      .from(rehearsalRsvps)
      .leftJoin(rehearsalSeats, eq(rehearsalSeats.rsvpId, rehearsalRsvps.id))
      .where(eq(rehearsalRsvps.attending, true))
      .orderBy(asc(rehearsalRsvps.lastName), asc(rehearsalRsvps.firstName)),
  ]);

  const shapes = new Map(tables.map((row) => [row.id, toTableShape(row)]));
  const seated = new Map<string, SeatedGuest[]>(tables.map((row) => [row.id, []]));
  const unseated: SeatingGuest[] = [];

  for (const row of guests) {
    const guest: SeatingGuest = {
      rsvpId: row.rsvpId,
      firstName: row.firstName,
      lastName: row.lastName,
      mealName: mealLabel(row.mealChoice, "rehearsal"),
      allergyNotes: row.allergyNotes,
    };

    const seats = row.tableId === null ? undefined : seated.get(row.tableId);
    const shape = row.tableId === null ? undefined : shapes.get(row.tableId);

    // A seat beyond the table's current size — or on a table that's gone —
    // shows the guest as unseated rather than hiding them off the chart.
    // `reshapeSeatingTable` clears those rows, so this is a belt-and-braces
    // guard against a row that got past it.
    if (seats && shape && row.seat !== null && row.seat < tableCapacity(shape)) {
      seats.push({ seat: row.seat, guest });
    } else {
      unseated.push(guest);
    }
  }

  return {
    tables: tables.map(
      (row): SeatingTable => ({
        id: row.id,
        name: row.name,
        ...toTableShape(row),
        seated: seated.get(row.id) ?? [],
      })
    ),
    unseated: sortGuests(unseated),
  };
}

/** Add a table to the end of the chart, named for the couple to rename. */
export async function createSeatingTable() {
  const tables = await tablesInOrder();
  const sortOrder = tables.reduce((max, row) => Math.max(max, row.sortOrder), -1) + 1;

  const [created] = await db
    .insert(rehearsalTables)
    .values({
      name: nextTableName(tables.map((row) => row.name)),
      shape: "round",
      seats: DEFAULT_TABLE_SEATS,
      seatsTop: DEFAULT_TABLE_SIDES.top,
      seatsBottom: DEFAULT_TABLE_SIDES.bottom,
      seatsLeft: DEFAULT_TABLE_SIDES.left,
      seatsRight: DEFAULT_TABLE_SIDES.right,
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

/**
 * Change a table's shape or seat counts, unseating anyone whose seat no longer
 * exists. Shrinking a table has to do something with those guests, and the
 * unseated list says so plainly — the same rule `reshapeTable` applies in the
 * chart, so the optimistic view and the stored one agree.
 */
export async function reshapeSeatingTable(
  tableId: string,
  shape: { shape: TableShape; seats: number; sides: TableSides }
) {
  await db
    .update(rehearsalTables)
    .set({
      shape: shape.shape,
      seats: shape.seats,
      seatsTop: shape.sides.top,
      seatsBottom: shape.sides.bottom,
      seatsLeft: shape.sides.left,
      seatsRight: shape.sides.right,
      updatedAt: new Date(),
    })
    .where(eq(rehearsalTables.id, tableId));

  await db
    .delete(rehearsalSeats)
    .where(
      and(eq(rehearsalSeats.tableId, tableId), gte(rehearsalSeats.seatOrder, tableCapacity(shape)))
    );
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

/** Take one guest out of their seat. */
export async function unseatGuestById(rsvpId: string) {
  await db.delete(rehearsalSeats).where(eq(rehearsalSeats.rsvpId, rsvpId));
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
 * Seat a guest in a specific seat.
 *
 * Dropping onto an occupied seat swaps the two when the guest being moved
 * already had a seat, and returns the occupant to the unseated list when they
 * didn't — the same rule `seatGuest` applies in the chart.
 *
 * The neon-http driver has no transactions, so both guests' rows are deleted
 * and then re-inserted rather than updated in place: that's what keeps the
 * `(table_id, seat_order)` unique index from rejecting the swap's intermediate
 * state. If the process dies between the two statements, a guest ends up
 * unseated — visible on the chart and fixed by moving them again, which is a
 * better failure than two names in one chair.
 */
export async function seatGuestInSeat(
  rsvpId: string,
  tableId: string,
  seat: number
): Promise<SeatMoveResult> {
  if (!(await isAttendingGuest(rsvpId))) {
    return { ok: false, error: "That guest isn't on the attending list for the night before." };
  }

  const [table] = await db
    .select()
    .from(rehearsalTables)
    .where(eq(rehearsalTables.id, tableId))
    .limit(1);

  if (!table) {
    return { ok: false, error: "That table has been deleted — refresh the chart." };
  }

  if (seat < 0 || seat >= tableCapacity(toTableShape(table))) {
    return { ok: false, error: "That seat is no longer on the table — refresh the chart." };
  }

  const [occupant, current] = await Promise.all([
    db
      .select({ rsvpId: rehearsalSeats.rsvpId })
      .from(rehearsalSeats)
      .where(and(eq(rehearsalSeats.tableId, tableId), eq(rehearsalSeats.seatOrder, seat)))
      .limit(1),
    db
      .select({ tableId: rehearsalSeats.tableId, seat: rehearsalSeats.seatOrder })
      .from(rehearsalSeats)
      .where(eq(rehearsalSeats.rsvpId, rsvpId))
      .limit(1),
  ]);

  const displaced = occupant[0]?.rsvpId ?? null;
  const from = current[0] ?? null;

  // Already in that seat — nothing to write.
  if (displaced === rsvpId) return { ok: true };

  const updatedAt = new Date();
  const moving = displaced ? [rsvpId, displaced] : [rsvpId];

  await db.delete(rehearsalSeats).where(inArray(rehearsalSeats.rsvpId, moving));

  const values = [{ rsvpId, tableId, seatOrder: seat, updatedAt }];

  // A swap only has somewhere to put the occupant if the guest being moved
  // vacated a seat; otherwise they stay unseated.
  if (displaced && from) {
    values.push({ rsvpId: displaced, tableId: from.tableId, seatOrder: from.seat, updatedAt });
  }

  await db.insert(rehearsalSeats).values(values);

  return { ok: true };
}
