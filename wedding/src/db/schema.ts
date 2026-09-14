import { pgTable, varchar, boolean, timestamp, uuid, uniqueIndex } from "drizzle-orm/pg-core";

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
 * `/thenightbefore`. Kept in its own table rather than a flag on `rsvps` so a
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
