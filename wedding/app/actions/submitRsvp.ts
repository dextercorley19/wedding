"use server";

import { db } from "@/db";
import { rsvps } from "@/db/schema";
import { rsvpFormSchema } from "@/db/zod/schema";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

export async function submitRsvp(data: unknown) {
  try {
    const validated = rsvpFormSchema.parse(data);

    // Check for duplicate email
    const emailExists = await db
      .select()
      .from(rsvps)
      .where(eq(rsvps.email, validated.email))
      .limit(1)
      .execute();

    if (emailExists.length > 0) {
      throw new Error("An RSVP with this email address already exists");
    }

    // Check for duplicate name combination
    const nameExists = await db
      .select()
      .from(rsvps)
      .where(
        and(
          eq(rsvps.firstName, validated.firstName),
          eq(rsvps.lastName, validated.lastName)
        )
      )
      .limit(1)
      .execute();

    if (nameExists.length > 0) {
      throw new Error("An RSVP for this person already exists");
    }

    // Map form data to database schema
    const dbData = {
      firstName: validated.firstName,
      lastName: validated.lastName,
      email: validated.email,
      attending: validated.attendance === "yes",
      numGuests: null, // No longer used
      dietaryRestrictions: validated.dietaryRestrictions,
      allergies: validated.allergies,
      notes: validated.notes,
    };

    // Insert into database
    const [rsvp] = await db
      .insert(rsvps)
      .values(dbData)
      .returning();

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
