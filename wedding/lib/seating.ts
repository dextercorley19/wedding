import { toCsv } from "@/lib/csv";
import { fileDateStamp } from "@/lib/rsvp-report";

/**
 * Shaping, moves, geometry, and the CSV export for the rehearsal dinner
 * seating chart.
 *
 * Deliberately free of database imports, for the same reason as
 * `lib/rsvp-report.ts`: the chart is a client component, and pulling `@/db` in
 * would drag the Neon client into the browser bundle. The queries live in
 * `lib/seating-queries.ts`.
 *
 * Guests sit in a numbered seat, not merely at a table, so every move is a
 * pure function from one plan to the next — which lets the chart apply a drag
 * immediately and the server check the result against the same rule it renders.
 */

/** A round table seats guests evenly around it; a rectangle seats them per side. */
export type TableShape = "round" | "rect";

export const TABLE_SHAPES = {
  round: { label: "Round" },
  rect: { label: "Rectangle" },
} as const satisfies Record<TableShape, { label: string }>;

/** Anything but "rect" is a round table. */
export const parseTableShape = (value: string | null | undefined): TableShape =>
  value === "rect" ? "rect" : "round";

/** Seats along each edge of a rectangular table. */
export type TableSides = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

/** The four sides, in the order seats are numbered. */
export const SIDE_KEYS = ["top", "bottom", "left", "right"] as const;

export type SideKey = (typeof SIDE_KEYS)[number];

export const SIDE_LABELS = {
  top: "Top",
  bottom: "Bottom",
  left: "Left end",
  right: "Right end",
} as const satisfies Record<SideKey, string>;

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

/** A guest in a numbered seat. `seat` is a 0-based index into `seatSlots`. */
export type SeatedGuest = { seat: number; guest: SeatingGuest };

/** One dinner table: its shape, its seats, and who is in them. */
export type SeatingTable = {
  id: string;
  name: string;
  shape: TableShape;
  /** Seats around a round table. Ignored for a rectangle, which uses `sides`. */
  seats: number;
  sides: TableSides;
  /** Sparse and unordered: an empty seat simply has no entry. */
  seated: SeatedGuest[];
};

export type SeatingPlan = {
  tables: SeatingTable[];
  /** Attending guests not yet placed, alphabetical by last name. */
  unseated: SeatingGuest[];
};

export const EMPTY_PLAN: SeatingPlan = { tables: [], unseated: [] };

/** What a new table starts as: a round table of eight. */
export const DEFAULT_TABLE_SEATS = 8;
export const DEFAULT_TABLE_SIDES: TableSides = { top: 4, bottom: 4, left: 1, right: 1 };

/** Keeps a hand-typed count in a range a real table could have. */
export const MIN_TABLE_SEATS = 1;
export const MAX_TABLE_SEATS = 30;
/** A single edge; 0 is allowed, since plenty of rectangles seat nobody at the ends. */
export const MAX_SIDE_SEATS = 20;

/** Matches the `name` column; also the limit the rename form enforces. */
export const TABLE_NAME_MAX = 120;

export const guestName = (guest: SeatingGuest) => `${guest.firstName} ${guest.lastName}`;

/** "Ada L." — what fits in a seat on the chart. */
export const shortGuestName = (guest: SeatingGuest) =>
  guest.lastName ? `${guest.firstName} ${guest.lastName[0]}.` : guest.firstName;

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
export const nextTableName = (names: readonly string[]) => {
  const used = new Set(names.map((name) => name.trim().toLowerCase()));

  for (let n = 1; ; n += 1) {
    const name = `Table ${n}`;
    if (!used.has(name.toLowerCase())) return name;
  }
};

/** How many seats a table has — around a circle, or summed over four edges. */
export const tableCapacity = (table: Pick<SeatingTable, "shape" | "seats" | "sides">) =>
  table.shape === "round"
    ? table.seats
    : SIDE_KEYS.reduce((total, side) => total + table.sides[side], 0);

/**
 * Where each seat sits, as a fraction of the table's box: `{ x: 0, y: 0 }` is
 * the top-left corner and `{ x: 1, y: 1 }` the bottom-right. The chart and the
 * printable layout both draw from this, so they can't disagree about seat 7.
 *
 * Seats are numbered the way the chart reads them: clockwise from the top of a
 * round table, and for a rectangle along the top edge, then the bottom, then
 * the left end, then the right.
 */
export type SeatSlot = { seat: number; x: number; y: number; side: SideKey | null };

export const seatSlots = (table: Pick<SeatingTable, "shape" | "seats" | "sides">): SeatSlot[] => {
  if (table.shape === "round") {
    const count = Math.max(0, table.seats);

    return Array.from({ length: count }, (_unused, seat) => {
      // Start at twelve o'clock and work clockwise.
      const angle = -Math.PI / 2 + (seat * 2 * Math.PI) / count;
      return {
        seat,
        x: 0.5 + 0.5 * Math.cos(angle),
        y: 0.5 + 0.5 * Math.sin(angle),
        side: null,
      };
    });
  }

  const slots: SeatSlot[] = [];

  // Evenly spaced along each edge, inset so the first and last seat don't
  // land on a corner: seat i of n sits at (i + 1) / (n + 1) along the side.
  for (const side of SIDE_KEYS) {
    const count = Math.max(0, table.sides[side]);

    for (let i = 0; i < count; i += 1) {
      const along = (i + 1) / (count + 1);
      const position =
        side === "top"
          ? { x: along, y: 0 }
          : side === "bottom"
            ? { x: along, y: 1 }
            : side === "left"
              ? { x: 0, y: along }
              : { x: 1, y: along };

      slots.push({ seat: slots.length, ...position, side });
    }
  }

  return slots;
};

/**
 * How much room one seat is drawn in, and how far apart neighbouring seats sit,
 * in `rem`. The gap between them is the difference.
 */
export const SEAT_SIZE_REM = 4.1;
export const SEAT_PITCH_REM = 4.75;

/** Vertical pitch is tighter: a seat is much shorter than it is wide. */
const SEAT_ROW_PITCH_REM = 2.9;

/** Nothing is drawn smaller than this, however few seats it has. */
const MIN_SURFACE_REM = 10;

/**
 * How big the table is drawn, in `rem`, derived from its seat count.
 *
 * The table is sized to its seats rather than squeezed into whatever the card
 * is wide: at a fixed size, a table of thirty crushes its seats into slivers,
 * which is exactly what a rehearsal dinner of three big tables does. Every seat
 * therefore gets `SEAT_PITCH_REM` of edge no matter how many there are, and a
 * table too wide for the screen scrolls sideways inside its card instead of
 * shrinking its names away.
 *
 * `rem`, not percentages, because the result has to be a real size the card can
 * scroll: a percentage would just re-divide whatever width it was given.
 */
export const tableBoxRem = (table: Pick<SeatingTable, "shape" | "seats" | "sides">) => {
  if (table.shape === "round") {
    const count = Math.max(1, table.seats);

    // Seats sit on the circumference, so the chord between neighbours is what
    // needs to be a seat wide: chord = diameter × sin(π / n). Two seats or
    // fewer have no meaningful chord, so they fall back to the floor.
    const diameter = count <= 2 ? MIN_SURFACE_REM : SEAT_PITCH_REM / Math.sin(Math.PI / count);

    const size = Math.max(MIN_SURFACE_REM, diameter);
    return { width: size, height: size };
  }

  const across = Math.max(table.sides.top, table.sides.bottom);
  const ends = Math.max(table.sides.left, table.sides.right);

  const width = Math.max(MIN_SURFACE_REM, (across + 1) * SEAT_PITCH_REM);

  // Tall enough for the seats on the ends, and never so flat or so tall that
  // it stops reading as a table.
  const height = Math.min(width * 2.5, Math.max(6, width / 5, (ends + 1) * SEAT_ROW_PITCH_REM));

  return { width, height };
};

/**
 * The printable area of a US Letter page at the 0.5in margins `@page` sets,
 * in `rem` (1rem = 16px and CSS prints at 96dpi, so an inch is 6rem).
 *
 * The height leaves room for the table's heading above the drawing, so a
 * table scaled to this still has somewhere to put its name.
 */
export const PRINT_PAGE_REM = { width: 45, height: 54 } as const;

export type PrintFit = {
  /** Zoom to draw the table at so the whole of it lands on the page. */
  scale: number;
  /** Whether it is turned a quarter turn to use the page's long side. */
  rotated: boolean;
};

/**
 * How to get a whole table onto a printed page.
 *
 * Paper doesn't scroll, so a table wider than the page is simply cut off —
 * which is what a 15-a-side banquet table did. Scaling it down always fits it,
 * but a long table squeezed into the short side of the page ends up tiny, so a
 * table that would have to shrink a lot is turned on its side to use the
 * page's long side instead, the way you'd turn the paper to read it.
 *
 * Turning it costs something — the names read sideways — so it only happens
 * when the table is genuinely cramped upright *and* turning buys a materially
 * bigger drawing. A table that already fits is left alone at full size.
 */
export const fitToPrintedPage = (
  size: { width: number; height: number },
  page: { width: number; height: number } = PRINT_PAGE_REM
): PrintFit => {
  const upright = Math.min(1, page.width / size.width, page.height / size.height);
  // Turned a quarter turn, the table's width runs down the page.
  const turned = Math.min(1, page.height / size.width, page.width / size.height);

  return upright < 0.8 && turned >= upright * 1.15
    ? { scale: turned, rotated: true }
    : { scale: upright, rotated: false };
};

/**
 * Whether a table needs a row of the chart to itself.
 *
 * A long banquet table in a third-width card is unreadable, while a round of
 * eight in a full-width one is mostly empty space — so the card grid follows
 * the table rather than the other way round.
 */
export const isWideTable = (table: Pick<SeatingTable, "shape" | "seats" | "sides">) =>
  tableBoxRem(table).width > 26;

/** The guest in a given seat, if anyone. */
export const guestInSeat = (table: SeatingTable, seat: number) =>
  table.seated.find((entry) => entry.seat === seat)?.guest ?? null;

/** Seats in numbered order, each with whoever is in it. */
export const tableSeating = (table: SeatingTable) =>
  seatSlots(table).map((slot) => ({ ...slot, guest: guestInSeat(table, slot.seat) }));

export type SeatingSummary = {
  /** Attending guests, seated or not — the number the room has to hold. */
  total: number;
  seated: number;
  unseated: number;
  /** Seats laid out across every table, whether or not anyone is in them. */
  capacity: number;
};

export const summarizeSeating = (plan: SeatingPlan): SeatingSummary => {
  const seated = plan.tables.reduce((count, table) => count + table.seated.length, 0);

  return {
    total: seated + plan.unseated.length,
    seated,
    unseated: plan.unseated.length,
    capacity: plan.tables.reduce((count, table) => count + tableCapacity(table), 0),
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

/** Which seat a guest is in, or null if they haven't been placed. */
export const findSeat = (plan: SeatingPlan, rsvpId: string) => {
  for (const table of plan.tables) {
    const entry = table.seated.find((candidate) => candidate.guest.rsvpId === rsvpId);
    if (entry) return { tableId: table.id, seat: entry.seat };
  }
  return null;
};

/** Every guest on the plan, seated or not. */
const allGuests = (plan: SeatingPlan) => [
  ...plan.unseated,
  ...plan.tables.flatMap((table) => table.seated.map((entry) => entry.guest)),
];

export const findGuest = (plan: SeatingPlan, rsvpId: string) =>
  allGuests(plan).find((guest) => guest.rsvpId === rsvpId) ?? null;

/** Lift a guest out of wherever they are, leaving the rest of the plan alone. */
const withoutGuests = (plan: SeatingPlan, rsvpIds: readonly string[]): SeatingPlan => {
  const removing = new Set(rsvpIds);

  return {
    tables: plan.tables.map((table) => ({
      ...table,
      seated: table.seated.filter((entry) => !removing.has(entry.guest.rsvpId)),
    })),
    unseated: plan.unseated.filter((guest) => !removing.has(guest.rsvpId)),
  };
};

/** Put guests back in the unseated list, keeping it alphabetical. */
const intoPool = (plan: SeatingPlan, guests: readonly SeatingGuest[]): SeatingPlan => ({
  ...plan,
  unseated: sortGuests([...plan.unseated, ...guests]),
});

/**
 * Seat a guest in a specific seat.
 *
 * Dropping onto an occupied seat swaps the two guests when the one being
 * dragged already had a seat, and sends the occupant back to the unseated list
 * when they didn't — which is the only honest answer, since one seat can't hold
 * two people and silently discarding either would lose a decision.
 *
 * A seat that doesn't exist on that table, or an unknown guest, leaves the plan
 * untouched: a drag from a chart that's since changed can't invent a seat.
 */
export const seatGuest = (
  plan: SeatingPlan,
  rsvpId: string,
  tableId: string,
  seat: number
): SeatingPlan => {
  const table = plan.tables.find((candidate) => candidate.id === tableId);
  if (!table) return plan;
  if (seat < 0 || seat >= tableCapacity(table)) return plan;

  const guest = findGuest(plan, rsvpId);
  if (!guest) return plan;

  const from = findSeat(plan, rsvpId);
  if (from?.tableId === tableId && from.seat === seat) return plan;

  const occupant = guestInSeat(table, seat);

  // Clear both guests out first, so neither a stale seat nor a double booking
  // can survive the move.
  let next = withoutGuests(plan, occupant ? [rsvpId, occupant.rsvpId] : [rsvpId]);

  const place = (target: string, index: number, who: SeatingGuest) => {
    next = {
      ...next,
      tables: next.tables.map((candidate) =>
        candidate.id === target
          ? { ...candidate, seated: [...candidate.seated, { seat: index, guest: who }] }
          : candidate
      ),
    };
  };

  place(tableId, seat, guest);

  if (occupant) {
    // A swap when the dragged guest had a seat to give up; otherwise the
    // occupant goes back to the pool rather than vanishing.
    if (from) place(from.tableId, from.seat, occupant);
    else next = intoPool(next, [occupant]);
  }

  return next;
};

/** Send a guest back to the unseated list. */
export const unseatGuest = (plan: SeatingPlan, rsvpId: string): SeatingPlan => {
  const guest = findGuest(plan, rsvpId);
  if (!guest || !findSeat(plan, rsvpId)) return plan;

  return intoPool(withoutGuests(plan, [rsvpId]), [guest]);
};

/** The first free seat at a table, or null when it's full. */
export const firstFreeSeat = (table: SeatingTable) => {
  const taken = new Set(table.seated.map((entry) => entry.seat));
  const slot = seatSlots(table).find((candidate) => !taken.has(candidate.seat));
  return slot?.seat ?? null;
};

/** Clear a table's seats without removing the table itself. */
export const clearTable = (plan: SeatingPlan, tableId: string): SeatingPlan => {
  const table = plan.tables.find((candidate) => candidate.id === tableId);
  if (!table) return plan;

  const guests = table.seated.map((entry) => entry.guest);
  return intoPool(
    withoutGuests(
      plan,
      guests.map((guest) => guest.rsvpId)
    ),
    guests
  );
};

/** Remove a table; whoever was sitting there goes back to the unseated list. */
export const removeTable = (plan: SeatingPlan, tableId: string): SeatingPlan => {
  const cleared = clearTable(plan, tableId);
  return { ...cleared, tables: cleared.tables.filter((table) => table.id !== tableId) };
};

/**
 * Reshape a table, unseating anyone whose seat no longer exists.
 *
 * Shrinking a table has to do something with the guests in the seats being
 * removed, and putting them back in the unseated list says so plainly instead
 * of refusing the edit or quietly dropping them off the chart.
 */
export const reshapeTable = (
  plan: SeatingPlan,
  tableId: string,
  shape: Pick<SeatingTable, "shape" | "seats" | "sides">
): SeatingPlan => {
  const table = plan.tables.find((candidate) => candidate.id === tableId);
  if (!table) return plan;

  const capacity = tableCapacity(shape);
  const displaced = table.seated
    .filter((entry) => entry.seat >= capacity)
    .map((entry) => entry.guest);

  const next: SeatingPlan = {
    ...plan,
    tables: plan.tables.map((candidate) =>
      candidate.id === tableId
        ? {
            ...candidate,
            ...shape,
            seated: candidate.seated.filter((entry) => entry.seat < capacity),
          }
        : candidate
    ),
  };

  return displaced.length > 0
    ? intoPool(
        withoutGuests(
          next,
          displaced.map((guest) => guest.rsvpId)
        ),
        displaced
      )
    : next;
};

const SEATING_CSV_HEADERS = [
  "Table",
  "Shape",
  "Seat",
  "Side",
  "First Name",
  "Last Name",
  "Dinner Selection",
  "Allergy / Restriction",
] as const;

/**
 * The chart as one row per guest, by table and then seat number.
 *
 * `Seat` and `Side` are what let a planner lay place cards from the file alone
 * — seat 7 is the same seat here, on the chart, and on the printed layout.
 * Guests who haven't been placed are listed at the end under "Unseated" rather
 * than left out: a planner needs to know someone still has nowhere to sit.
 */
export const seatingPlanToCsv = (plan: SeatingPlan) =>
  toCsv(SEATING_CSV_HEADERS, [
    ...plan.tables.flatMap((table) =>
      tableSeating(table)
        .filter((slot) => slot.guest !== null)
        .map((slot) => [
          table.name,
          TABLE_SHAPES[table.shape].label,
          String(slot.seat + 1),
          slot.side ? SIDE_LABELS[slot.side] : "",
          slot.guest!.firstName,
          slot.guest!.lastName,
          slot.guest!.mealName ?? "",
          slot.guest!.allergyNotes ?? "",
        ])
    ),
    ...plan.unseated.map((guest) => [
      "Unseated",
      "",
      "",
      "",
      guest.firstName,
      guest.lastName,
      guest.mealName ?? "",
      guest.allergyNotes ?? "",
    ]),
  ]);

export const seatingCsvFilename = (now: Date) => `rehearsal-seating-${fileDateStamp(now)}.csv`;
