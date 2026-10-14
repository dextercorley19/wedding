import { toCsv } from "@/lib/csv";
import { fileDateStamp } from "@/lib/rsvp-report";

/**
 * Shaping, moves, and the CSV export for the rehearsal dinner seating chart.
 *
 * Deliberately free of database imports, for the same reason as
 * `lib/rsvp-report.ts`: the chart is a client component, and pulling `@/db` in
 * would drag the Neon client into the browser bundle. The queries live in
 * `lib/seating-queries.ts`.
 *
 * Every move is a pure function from one plan to the next, so the chart can
 * apply a drag immediately and the server action can be checked against the
 * same rule it renders.
 */

/** An attending rehearsal dinner guest, seated or not. */
export type SeatingGuest = {
  /** The guest's row in `rehearsal_rsvps` — the id a seat points at. */
  rsvpId: string;
  firstName: string;
  lastName: string;
  /** Their dinner selection, resolved to the rehearsal menu's label. */
  mealName: string | null;
  allergyNotes: string | null;
};

/** One dinner table and whoever is sitting at it, in seat order. */
export type SeatingTable = {
  id: string;
  name: string;
  seats: number;
  guests: SeatingGuest[];
};

export type SeatingPlan = {
  tables: SeatingTable[];
  /** Attending guests not yet placed, alphabetical by last name. */
  unseated: SeatingGuest[];
};

export const EMPTY_PLAN: SeatingPlan = { tables: [], unseated: [] };

/** What a new table holds until the couple says otherwise. */
export const DEFAULT_TABLE_SEATS = 8;

/** Keeps a hand-typed seat count in a range a real table could have. */
export const MIN_TABLE_SEATS = 1;
export const MAX_TABLE_SEATS = 30;

/** Matches the `name` column; also the limit the rename form enforces. */
export const TABLE_NAME_MAX = 120;

export const guestName = (guest: SeatingGuest) => `${guest.firstName} ${guest.lastName}`;

/** Alphabetical by last name, then first — how a guest list reads. */
const byName = (a: SeatingGuest, b: SeatingGuest) =>
  a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName);

export const sortGuests = (guests: readonly SeatingGuest[]) => [...guests].sort(byName);

/**
 * The default name for the next table: the lowest "Table N" not already taken.
 *
 * Counting from 1 rather than from the number of tables means renaming one to
 * "Head Table" frees its number up, instead of leaving a gap in the chart.
 */
export const nextTableName = (tables: readonly SeatingTable[]) => {
  const used = new Set(tables.map((table) => table.name.trim().toLowerCase()));

  for (let n = 1; ; n += 1) {
    const name = `Table ${n}`;
    if (!used.has(name.toLowerCase())) return name;
  }
};

export type SeatingSummary = {
  /** Attending guests, seated or not — the number the room has to hold. */
  total: number;
  seated: number;
  unseated: number;
  /** Seats laid out across every table, whether or not anyone is in them. */
  capacity: number;
  /** Tables seating more guests than they hold. */
  overfilled: number;
};

export const summarizeSeating = (plan: SeatingPlan): SeatingSummary => {
  const seated = plan.tables.reduce((count, table) => count + table.guests.length, 0);

  return {
    total: seated + plan.unseated.length,
    seated,
    unseated: plan.unseated.length,
    capacity: plan.tables.reduce((count, table) => count + table.seats, 0),
    overfilled: plan.tables.filter((table) => table.guests.length > table.seats).length,
  };
};

/** Name, dinner, and allergy — the same fields the guest search box covers. */
export const matchesSeatingQuery = (guest: SeatingGuest, query: string) => {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  return [guest.firstName, guest.lastName, guest.mealName ?? "", guest.allergyNotes ?? ""]
    .join(" ")
    .toLowerCase()
    .includes(needle);
};

/** Where a guest is sitting, or null if they haven't been placed. */
export const findSeat = (plan: SeatingPlan, rsvpId: string) => {
  for (const table of plan.tables) {
    const index = table.guests.findIndex((guest) => guest.rsvpId === rsvpId);
    if (index !== -1) return { tableId: table.id, index };
  }
  return null;
};

const takeGuest = (plan: SeatingPlan, rsvpId: string) => {
  const guest =
    plan.unseated.find((candidate) => candidate.rsvpId === rsvpId) ??
    plan.tables.flatMap((table) => table.guests).find((candidate) => candidate.rsvpId === rsvpId);

  if (!guest) return null;

  return {
    guest,
    rest: {
      tables: plan.tables.map((table) => ({
        ...table,
        guests: table.guests.filter((candidate) => candidate.rsvpId !== rsvpId),
      })),
      unseated: plan.unseated.filter((candidate) => candidate.rsvpId !== rsvpId),
    },
  };
};

/**
 * Move a guest to a table, or back to the unseated list when `tableId` is null.
 *
 * Pulling them out of wherever they were first is what keeps a guest in one
 * seat: dropping onto the table they already sit at is a reorder, not a
 * duplicate. An unknown guest or table leaves the plan untouched, so a stale
 * drag from a chart that's since changed can't invent a seat.
 *
 * `index` is where in the table they land; past the end (or omitted) appends.
 */
export const placeGuest = (
  plan: SeatingPlan,
  rsvpId: string,
  tableId: string | null,
  index?: number
): SeatingPlan => {
  if (tableId !== null && !plan.tables.some((table) => table.id === tableId)) return plan;

  const taken = takeGuest(plan, rsvpId);
  if (!taken) return plan;

  const { guest, rest } = taken;

  if (tableId === null) {
    return { ...rest, unseated: sortGuests([...rest.unseated, guest]) };
  }

  return {
    ...rest,
    tables: rest.tables.map((table) => {
      if (table.id !== tableId) return table;

      const guests = [...table.guests];
      guests.splice(index === undefined ? guests.length : Math.max(0, index), 0, guest);
      return { ...table, guests };
    }),
  };
};

/** Clear a table's seats without removing the table itself. */
export const clearTable = (plan: SeatingPlan, tableId: string): SeatingPlan => {
  const table = plan.tables.find((candidate) => candidate.id === tableId);
  if (!table) return plan;

  return {
    tables: plan.tables.map((candidate) =>
      candidate.id === tableId ? { ...candidate, guests: [] } : candidate
    ),
    unseated: sortGuests([...plan.unseated, ...table.guests]),
  };
};

/** Remove a table; whoever was sitting there goes back to the unseated list. */
export const removeTable = (plan: SeatingPlan, tableId: string): SeatingPlan => {
  const cleared = clearTable(plan, tableId);
  return { ...cleared, tables: cleared.tables.filter((table) => table.id !== tableId) };
};

const SEATING_CSV_HEADERS = [
  "Table",
  "Seat",
  "First Name",
  "Last Name",
  "Dinner Selection",
  "Allergy / Restriction",
] as const;

/**
 * The chart as one row per guest, grouped by table in chart order.
 *
 * Guests who haven't been placed are listed at the end under "Unseated" rather
 * than left out — a planner reading the file needs to know someone still has
 * nowhere to sit.
 */
export const seatingPlanToCsv = (plan: SeatingPlan) =>
  toCsv(SEATING_CSV_HEADERS, [
    ...plan.tables.flatMap((table) =>
      table.guests.map((guest, seat) => [
        table.name,
        String(seat + 1),
        guest.firstName,
        guest.lastName,
        guest.mealName ?? "",
        guest.allergyNotes ?? "",
      ])
    ),
    ...plan.unseated.map((guest) => [
      "Unseated",
      "",
      guest.firstName,
      guest.lastName,
      guest.mealName ?? "",
      guest.allergyNotes ?? "",
    ]),
  ]);

export const seatingCsvFilename = (now: Date) => `rehearsal-seating-${fileDateStamp(now)}.csv`;
