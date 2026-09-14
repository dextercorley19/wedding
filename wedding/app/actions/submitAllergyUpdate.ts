"use server";

import { allergyLookupSchema } from "@/db/zod/schema";
import { findRsvpsByName, setAllergyNotes } from "@/lib/rsvp-queries";

/**
 * `not-found` is the case the FAQ form exists for, so the dialog renders an
 * RSVP link alongside it; the rest are plain messages.
 */
export type AllergyUpdateResult =
  | { success: true; events: ("wedding" | "rehearsal")[] }
  | { success: false; reason: "invalid" | "not-found" | "ambiguous" | "error"; error: string };

const NOT_FOUND =
  "We can't find an RSVP under that name. Double-check the spelling, or send your reply first — " +
  "if you've already RSVP'd, reach out to Sami or Dexter and we'll add it for you.";

const SAVE_FAILED =
  "Sorry — we couldn't save that just now. Please try again, or reach out to Sami or Dexter.";

const AMBIGUOUS =
  "We found more than one RSVP under that name, so we can't tell which is yours. " +
  "Please reach out to Sami or Dexter and we'll add it for you.";

/**
 * Attach an allergy to an RSVP that's already been filed.
 *
 * Guests who replied before the RSVP form asked about allergies have no way
 * back into their own submission, so this matches them on name and updates
 * every event they're on — an allergy belongs to the person, not the dinner.
 * A name matching two guests is left alone rather than guessed at.
 */
export async function submitAllergyUpdate(data: unknown): Promise<AllergyUpdateResult> {
  const parsed = allergyLookupSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      reason: "invalid",
      error: "Some details are missing or invalid. Please check and try again.",
    };
  }

  const { firstName, lastName, allergyNotes } = parsed.data;

  try {
    const { wedding, rehearsal } = await findRsvpsByName(firstName, lastName);

    if (wedding.length === 0 && rehearsal.length === 0) {
      return { success: false, reason: "not-found", error: NOT_FOUND };
    }

    // Two guests sharing a name is rare but real, and picking one at random
    // would put an allergy on the wrong plate.
    if (wedding.length > 1 || rehearsal.length > 1) {
      return { success: false, reason: "ambiguous", error: AMBIGUOUS };
    }

    await setAllergyNotes(
      { wedding: wedding.map((row) => row.id), rehearsal: rehearsal.map((row) => row.id) },
      allergyNotes
    );

    const events: ("wedding" | "rehearsal")[] = [];
    if (wedding.length > 0) events.push("wedding");
    if (rehearsal.length > 0) events.push("rehearsal");

    console.log("Allergy recorded for", `${firstName} ${lastName}`, events);

    return { success: true, events };
  } catch (error) {
    console.error("Allergy update error:", error);
    return { success: false, reason: "error", error: SAVE_FAILED };
  }
}
