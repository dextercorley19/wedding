import {
  pgTable,
  varchar,
  boolean,
  integer,
  timestamp,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * RSVPs table — tracks guest responses
 */
export const rsvps = pgTable(
  "rsvps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    firstName: varchar("first_name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    attending: boolean("attending").notNull(),
    // Dinner selection — only collected from guests who are attending.
    mealChoice: varchar("meal_choice", { length: 32 }),
    // Free text, and only when the guest ticks the allergy box. Null means
    // nothing to flag — an empty note is never stored.
    allergyNotes: varchar("allergy_notes", { length: 500 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("rsvps_name_email_unique").on(table.firstName, table.lastName, table.email),
  ]
);

// Type exports for use in components/server actions
export type RSVP = typeof rsvps.$inferSelect;
export type InsertRSVP = typeof rsvps.$inferInsert;

/**
 * Rehearsal dinner RSVPs — the invite-only "night before" event at
 * `/nightbefore`. Kept in its own table rather than a flag on `rsvps` so a
 * guest can reply to both events independently (and so the duplicate check for
 * one never blocks the other).
 */
export const rehearsalRsvps = pgTable(
  "rehearsal_rsvps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    firstName: varchar("first_name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    attending: boolean("attending").notNull(),
    // Its own menu — see `REHEARSAL_MEAL_OPTIONS` in `src/db/zod/schema.ts`.
    mealChoice: varchar("meal_choice", { length: 32 }),
    allergyNotes: varchar("allergy_notes", { length: 500 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("rehearsal_rsvps_name_email_unique").on(
      table.firstName,
      table.lastName,
      table.email
    ),
  ]
);

export type RehearsalRSVP = typeof rehearsalRsvps.$inferSelect;
export type InsertRehearsalRSVP = typeof rehearsalRsvps.$inferInsert;

/**
 * Seating chart for the rehearsal dinner.
 *
 * Two tables rather than a `table_name` column on `rehearsal_rsvps`: a dinner
 * table exists before anyone is sat at it (you lay out the room first, then
 * fill it), and it carries its own shape and seat layout.
 */
export const rehearsalTables = pgTable(
  "rehearsal_tables",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Whatever the couple calls it — "Table 1", "Head Table", "Corley cousins". */
    name: varchar("name", { length: 120 }).notNull(),
    /** "round" or "rect" — see `TableShape` in `lib/seating.ts`. */
    shape: varchar("shape", { length: 16 }).notNull().default("round"),
    /** Seats around a round table. A rectangle counts its seats per side instead. */
    seats: integer("seats").notNull().default(8),
    /**
     * Seats along each edge of a rectangular table, which is what fixes where
     * each chair is rather than only how many there are. Ignored when the
     * table is round, and kept rather than cleared so switching shape back and
     * forth doesn't lose the layout.
     */
    seatsTop: integer("seats_top").notNull().default(4),
    seatsBottom: integer("seats_bottom").notNull().default(4),
    seatsLeft: integer("seats_left").notNull().default(1),
    seatsRight: integer("seats_right").notNull().default(1),
    /** Display order in the chart; ties fall back to creation time. */
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("rehearsal_tables_sort_order_idx").on(table.sortOrder, table.createdAt)]
);

export type RehearsalTable = typeof rehearsalTables.$inferSelect;
export type InsertRehearsalTable = typeof rehearsalTables.$inferInsert;

/**
 * One row per seated guest. A guest with no row is simply unseated, which is
 * the state the chart starts in, so "not yet placed" needs no flag.
 *
 * Two unique indexes, because a seating chart has two rules: `rsvp_id` means a
 * guest sits in one seat, and `(table_id, seat_order)` means a seat holds one
 * guest. Enforcing the second in the database rather than in the action is
 * worth the extra statements a swap costs — the failure mode becomes a guest
 * left unseated, which is visible on the chart, instead of two names silently
 * sharing a chair.
 *
 * Both foreign keys cascade — deleting a table clears its seats, and a removed
 * RSVP takes its seat with it instead of leaving a name on the planner's chart.
 */
export const rehearsalSeats = pgTable(
  "rehearsal_seats",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    rsvpId: uuid("rsvp_id")
      .notNull()
      .references(() => rehearsalRsvps.id, { onDelete: "cascade" }),
    tableId: uuid("table_id")
      .notNull()
      .references(() => rehearsalTables.id, { onDelete: "cascade" }),
    /**
     * Which seat, as a 0-based index into the table's seats — clockwise from
     * the top of a round table, or top edge then bottom then left then right
     * on a rectangle. `seatSlots` in `lib/seating.ts` is the one definition of
     * that order, and the chart, the CSV, and the printed layout all draw from
     * it, so seat 7 is the same chair in all three.
     */
    seatOrder: integer("seat_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("rehearsal_seats_rsvp_unique").on(table.rsvpId),
    // Unique rather than a plain index: it serves the same per-table lookup
    // and rules out two guests in one seat.
    uniqueIndex("rehearsal_seats_table_seat_unique").on(table.tableId, table.seatOrder),
  ]
);

export type RehearsalSeat = typeof rehearsalSeats.$inferSelect;
export type InsertRehearsalSeat = typeof rehearsalSeats.$inferInsert;
