CREATE TABLE "rehearsal_seats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rsvp_id" uuid NOT NULL,
	"table_id" uuid NOT NULL,
	"seat_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rehearsal_tables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"seats" integer DEFAULT 8 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rehearsal_seats" ADD CONSTRAINT "rehearsal_seats_rsvp_id_rehearsal_rsvps_id_fk" FOREIGN KEY ("rsvp_id") REFERENCES "public"."rehearsal_rsvps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rehearsal_seats" ADD CONSTRAINT "rehearsal_seats_table_id_rehearsal_tables_id_fk" FOREIGN KEY ("table_id") REFERENCES "public"."rehearsal_tables"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "rehearsal_seats_rsvp_unique" ON "rehearsal_seats" USING btree ("rsvp_id");--> statement-breakpoint
CREATE INDEX "rehearsal_seats_table_idx" ON "rehearsal_seats" USING btree ("table_id","seat_order");--> statement-breakpoint
CREATE INDEX "rehearsal_tables_sort_order_idx" ON "rehearsal_tables" USING btree ("sort_order","created_at");