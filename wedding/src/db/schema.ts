import {
  pgTable,
  text,
  varchar,
  boolean,
  timestamp,
  uuid,
  primaryKey,
  foreignKey,
} from "drizzle-orm/pg-core";

/**
 * Guests table — stores all invited guests
 */
export const guests = pgTable("guests", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  dietaryRestrictions: text("dietary_restrictions"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * RSVPs table — tracks guest responses
 */
export const rsvps = pgTable(
  "rsvps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    guestId: uuid("guest_id"),
    firstName: varchar("first_name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    attending: boolean("attending").notNull(),
    numGuests: text("num_guests"), // "1", "2", etc.
    dietaryRestrictions: text("dietary_restrictions"),
    allergies: text("allergies"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.guestId],
      foreignColumns: [guests.id],
      name: "rsvps_guest_id_fk",
    }).onDelete("cascade"),
  ]
);

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
export type Guest = typeof guests.$inferSelect;
export type InsertGuest = typeof guests.$inferInsert;

export type RSVP = typeof rsvps.$inferSelect;
export type InsertRSVP = typeof rsvps.$inferInsert;

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;
