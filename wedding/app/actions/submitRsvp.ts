"use server";

import { db } from "@/db";
import { rsvps, invites } from "@/db/schema";
import { rsvpFormSchema } from "@/db/zod/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

export async function submitRsvp(data: unknown) {
  try {
    // Extend schema to accept optional token
    const extendedSchema = rsvpFormSchema.extend({
      token: z.string().optional(),
    });

    const validated = extendedSchema.parse(data);

    // Map form data to database schema
    const dbData = {
      firstName: validated.firstName,
      lastName: validated.lastName,
      email: validated.email,
      attending: validated.attendance === "yes",
      numGuests: String(validated.guestCount),
      dietaryRestrictions: validated.dietaryRestrictions,
      allergies: validated.allergies,
      notes: validated.notes,
    };

    // If token is provided, validate and link to invite
    let inviteId: string | undefined;
    if (validated.token) {
      const [invite] = await db
        .select()
        .from(invites)
        .where(eq(invites.token, validated.token))
        .limit(1)
        .execute();

      if (!invite) {
        throw new Error("Invalid invitation token");
      }

      if (invite.rsvpedAt) {
        throw new Error("This invitation has already been used");
      }

      inviteId = invite.id;
    }

    // Insert into database
    const [rsvp] = await db
      .insert(rsvps)
      .values({
        ...dbData,
        inviteId,
      })
      .returning();

    // Mark invite as used if token was provided
    if (inviteId) {
      await db
        .update(invites)
        .set({ rsvpedAt: new Date() })
        .where(eq(invites.id, inviteId))
        .execute();
    }

    console.log("RSVP saved:", rsvp.id);

    return { success: true, data: rsvp };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
      throw new Error("Invalid RSVP data");
    }
    console.error("RSVP submission error:", error);
    throw error instanceof Error ? error : new Error("Failed to submit RSVP");
  }
}
