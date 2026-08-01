"use server";

import { db } from "@/db";
import { rsvps } from "@/db/schema";
import { rsvpFormSchema } from "@/db/zod/schema";
import { z } from "zod";

/** Message shown to guests when something unexpected goes wrong. */
const GENERIC_ERROR =
  "Sorry — we couldn't save your RSVP just now. Please try again, or email us if it keeps happening.";

/** Postgres unique-violation SQLSTATE. */
const UNIQUE_VIOLATION = "23505";

const isUniqueViolation = (error: unknown) =>
  (typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === UNIQUE_VIOLATION) ||
  (error instanceof Error && error.message.includes("rsvps_name_email_unique"));

export type SubmitRsvpResult = { success: true; count: number } | { success: false; error: string };

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
    };

    try {
      const [rsvp] = await db.insert(rsvps).values(dbData).returning();
      count += 1;
      console.log("RSVP saved:", rsvp.id);
    } catch (error) {
      if (isUniqueViolation(error)) {
        return {
          success: false,
          error: `We already have an RSVP for ${entry.firstName} ${entry.lastName} (${entry.email}). Please email us if you need to change it.`,
        };
      }
      // Connection failures and SQL errors stay in the server logs — guests
      // should never see a raw query or stack trace.
      console.error("RSVP submission error:", error);
      return { success: false, error: GENERIC_ERROR };
    }
  }

  return { success: true, count };
}
