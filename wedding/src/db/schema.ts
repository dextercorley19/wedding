import {
  pgTable,
  varchar,
  boolean,
  timestamp,
  uuid,
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
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("rsvps_name_email_unique").on(
      table.firstName,
      table.lastName,
      table.email
    ),
  ]
);

// Type exports for use in components/server actions
export type RSVP = typeof rsvps.$inferSelect;
export type InsertRSVP = typeof rsvps.$inferInsert;

