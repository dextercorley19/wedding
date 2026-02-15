"use server";

import { rsvpSchema, type RSVPData } from "@/lib/validators";

export async function submitRsvp(data: RSVPData) {
  // Validate input
  const validated = rsvpSchema.parse(data);

  try {
    // TODO: Save to database when Drizzle schema is set up
    // For now, just log to console
    console.log("RSVP submitted:", validated);

    // In the future:
    // const [rsvp] = await db
    //   .insert(rsvps)
    //   .values({
    //     name: validated.name,
    //     email: validated.email,
    //     attendance: validated.attendance,
    //     guestCount: validated.guestCount,
    //     dietaryRestrictions: validated.dietaryRestrictions,
    //     song: validated.song,
    //     submittedAt: new Date(),
    //   })
    //   .returning();
    //
    // return rsvp;

    return { success: true, data: validated };
  } catch (error) {
    console.error("RSVP submission error:", error);
    throw new Error("Failed to submit RSVP");
  }
}
