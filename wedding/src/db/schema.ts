import {
  pgTable,
  text,
  varchar,
  boolean,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * RSVPs table — tracks guest responses
 */
export const rsvps = pgTable("rsvps", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  attending: boolean("attending").notNull(),
  numGuests: text("num_guests"),
  dietaryRestrictions: text("dietary_restrictions"),
  allergies: text("allergies"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Events table — wedding events (ceremony, reception, rehearsal dinner, etc.)
 */
export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  date: timestamp("date", { withTimezone: true }).notNull(),
  location: varchar("location", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Type exports for use in components/server actions
export type RSVP = typeof rsvps.$inferSelect;
export type InsertRSVP = typeof rsvps.$inferInsert;

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;
