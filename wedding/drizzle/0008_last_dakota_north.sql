DROP INDEX "rehearsal_seats_table_idx";--> statement-breakpoint
ALTER TABLE "rehearsal_tables" ADD COLUMN "shape" varchar(16) DEFAULT 'round' NOT NULL;--> statement-breakpoint
ALTER TABLE "rehearsal_tables" ADD COLUMN "seats_top" integer DEFAULT 4 NOT NULL;--> statement-breakpoint
ALTER TABLE "rehearsal_tables" ADD COLUMN "seats_bottom" integer DEFAULT 4 NOT NULL;--> statement-breakpoint
ALTER TABLE "rehearsal_tables" ADD COLUMN "seats_left" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "rehearsal_tables" ADD COLUMN "seats_right" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "rehearsal_seats_table_seat_unique" ON "rehearsal_seats" USING btree ("table_id","seat_order");