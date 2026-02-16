ALTER TABLE "guests" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "invites" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "guests" CASCADE;--> statement-breakpoint
DROP TABLE "invites" CASCADE;--> statement-breakpoint
ALTER TABLE "rsvps" DROP CONSTRAINT "rsvps_invite_id_invites_id_fk";
--> statement-breakpoint
ALTER TABLE "rsvps" DROP CONSTRAINT "rsvps_invite_id_fk";
--> statement-breakpoint
ALTER TABLE "rsvps" DROP COLUMN "invite_id";--> statement-breakpoint
ALTER TABLE "rsvps" DROP COLUMN "guest_id";--> statement-breakpoint
ALTER TABLE "rsvps" DROP COLUMN "phone";