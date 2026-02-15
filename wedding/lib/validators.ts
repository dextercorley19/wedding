import { z } from "zod";

export const rsvpSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email address"),
  attendance: z.enum(["yes", "no"], {
    errorMap: () => ({ message: "Please select an attendance option" }),
  }),
  guestCount: z.coerce
    .number()
    .int()
    .positive("Guest count must be at least 1")
    .max(10, "Maximum 10 guests"),
  dietaryRestrictions: z.string().max(500).optional(),
  song: z.string().max(500).optional(),
});

export type RSVPData = z.infer<typeof rsvpSchema>;
