"use server";

import { db } from "@/db";
import { rehearsalRsvps } from "@/db/schema";
import { rehearsalRsvpFormSchema } from "@/db/zod/schema";
import {
  duplicateError,
  GENERIC_ERROR,
  isUniqueViolation,
  type SubmitRsvpResult,
} from "@/lib/rsvp-submit";
import { z } from "zod";

/**
 * Persist a party's rehearsal dinner RSVPs. Same contract as `submitRsvp`,
 * against the `rehearsal_rsvps` table and without a dinner selection.
 */
export async function submitRehearsalRsvp(data: unknown): Promise<SubmitRsvpResult> {
  const parsed = z.array(rehearsalRsvpFormSchema).safeParse(Array.isArray(data) ? data : [data]);

  if (!parsed.success) {
    console.error("Rehearsal RSVP validation error:", parsed.error.errors);
    return {
      success: false,
      error: "Some details are missing or invalid. Please check and try again.",
    };
  }

  let count = 0;

  for (const entry of parsed.data) {
    const dbData = {
      firstName: entry.firstName,
      lastName: entry.lastName,
      email: entry.email,
      attending: entry.attendance === "yes",
    };

    try {
      const [rsvp] = await db.insert(rehearsalRsvps).values(dbData).returning();
      count += 1;
      console.log("Rehearsal RSVP saved:", rsvp.id);
    } catch (error) {
      if (isUniqueViolation(error, "rehearsal_rsvps_name_email_unique")) {
        return { success: false, error: duplicateError(entry) };
      }
      console.error("Rehearsal RSVP submission error:", error);
      return { success: false, error: GENERIC_ERROR };
    }
  }

  return { success: true, count };
}
