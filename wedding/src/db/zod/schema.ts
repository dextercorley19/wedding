import { z } from "zod";

// Form schema that matches the RSVP form UI
export const rsvpFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(255),
  lastName: z.string().min(1, "Last name is required").max(255),
  email: z.string().email("Invalid email address").max(255),
  attendance: z.enum(["yes", "no"]),
});

export type RSVPFormInput = z.infer<typeof rsvpFormSchema>;
