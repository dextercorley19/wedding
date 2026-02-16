"use server";

import { db } from "@/db";
import { rsvps } from "@/db/schema";
import { rsvpFormSchema } from "@/db/zod/schema";
import { z } from "zod";

export async function submitRsvp(data: unknown) {
  try {
    const validated = rsvpFormSchema.parse(data);

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
