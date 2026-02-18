"use server";

import { db } from "@/db";
import { rsvps } from "@/db/schema";
import { rsvpFormSchema } from "@/db/zod/schema";
import { z } from "zod";

export async function submitRsvp(data: unknown) {
  try {
    // Accept array of RSVPs
    const dataArray = Array.isArray(data) ? data : [data];
    const validated = z.array(rsvpFormSchema).parse(dataArray);

    const results = [];

    for (const entry of validated) {
      // Map form data to database schema
      const dbData = {
        firstName: entry.firstName,
        lastName: entry.lastName,
        email: entry.email,
        attending: entry.attendance === "yes",
      };

      try {
        // Insert into database (unique constraint will be enforced by DB)
        const [rsvp] = await db.insert(rsvps).values(dbData).returning();

        results.push(rsvp);
        console.log("RSVP saved:", rsvp.id);
      } catch (error) {
        // Handle unique constraint violation
        if (error instanceof Error && error.message.includes("unique")) {
          throw new Error(
            `An RSVP for ${entry.firstName} ${entry.lastName} (${entry.email}) already exists`
          );
        }
        throw error;
      }
    }

    return { success: true, data: results };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
      throw new Error("Invalid RSVP data");
    }
    console.error("RSVP submission error:", error);
    throw error instanceof Error ? error : new Error("Failed to submit RSVP");
  }
}
