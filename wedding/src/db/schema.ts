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
 * fill it), and it carries a seat count of its own so the chart can say when
 * one is over capacity.
 */
export const rehearsalTables = pgTable(
  "rehearsal_tables",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Whatever the couple calls it — "Table 1", "Head Table", "Corley cousins". */
    name: varchar("name", { length: 120 }).notNull(),
    /** How many the table holds. Seating past it is allowed, and flagged. */
    seats: integer("seats").notNull().default(8),
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
 * `rsvpId` is unique: a guest sits at one table, so moving them is an upsert
 * rather than a delete-then-insert. Both foreign keys cascade — deleting a
 * table clears its seats, and a removed RSVP takes its seat with it instead of
 * leaving a name on the planner's chart.
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
    /** Order within the table, so a chart reads the same way twice. */
    seatOrder: integer("seat_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("rehearsal_seats_rsvp_unique").on(table.rsvpId),
    index("rehearsal_seats_table_idx").on(table.tableId, table.seatOrder),
  ]
);

export type RehearsalSeat = typeof rehearsalSeats.$inferSelect;
export type InsertRehearsalSeat = typeof rehearsalSeats.$inferInsert;
