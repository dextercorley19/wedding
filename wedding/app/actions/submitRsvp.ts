"use server";

import { db } from "@/db";
import { rsvps } from "@/db/schema";
import { rsvpFormSchema } from "@/db/zod/schema";
import {
  duplicateError,
  GENERIC_ERROR,
  isUniqueViolation,
  type SubmitRsvpResult,
} from "@/lib/rsvp-submit";
import { syncGuestAllergy } from "@/lib/rsvp-queries";
import { z } from "zod";

/**
 * Persist a party's RSVPs.
 *
 * Returns a result rather than throwing: Next.js redacts Server Action error
 * messages in production, so a thrown message would never reach the guest.
 */
export async function submitRsvp(data: unknown): Promise<SubmitRsvpResult> {
  const parsed = z.array(rsvpFormSchema).safeParse(Array.isArray(data) ? data : [data]);

  if (!parsed.success) {
    console.error("RSVP validation error:", parsed.error.errors);
    return {
      success: false,
      error: "Some details are missing or invalid. Please check and try again.",
    };
  }

  let count = 0;

  for (const entry of parsed.data) {
    const attending = entry.attendance === "yes";
    const dbData = {
      firstName: entry.firstName,
      lastName: entry.lastName,
      email: entry.email,
      attending,
      // Guests who decline don't pick a dinner, so store nothing for them.
      mealChoice: attending ? (entry.mealChoice ?? null) : null,
      // Same for allergies, and an unticked box or blank note stays null so
      // the admin view can treat "has something to flag" as "not null".
      allergyNotes: attending && entry.hasAllergy ? entry.allergyNotes?.trim() || null : null,
    };

    try {
      const [rsvp] = await db.insert(rsvps).values(dbData).returning();
      count += 1;
      console.log("RSVP saved:", rsvp.id);
    } catch (error) {
      if (isUniqueViolation(error, "rsvps_name_email_unique")) {
        return { success: false, error: duplicateError(entry) };
      }
      // Connection failures and SQL errors stay in the server logs — guests
      // should never see a raw query or stack trace.
      console.error("RSVP submission error:", error);
      return { success: false, error: GENERIC_ERROR };
    }

    // Outside the insert's catch on purpose: the RSVP is already saved, and a
    // problem syncing the allergy must never be reported as a failed reply.
    // A guest on both guest lists fills in two separate rows, so carry the
    // allergy across rather than making them remember it twice.
    await syncGuestAllergy(entry.firstName, entry.lastName, dbData.allergyNotes);
  }

  return { success: true, count };
}
