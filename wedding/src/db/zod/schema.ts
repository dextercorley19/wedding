import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { rsvps } from "../schema";

export const rsvpInsertSchema = createInsertSchema(rsvps, {
  firstName: z.string().min(1, "First name is required").max(255),
  lastName: z.string().min(1, "Last name is required").max(255),
  email: z.string().email("Invalid email address").max(255),
  phone: z.string().optional(),
  attending: z.boolean(),
  numGuests: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  allergies: z.string().optional(),
  notes: z.string().optional(),
}).omit({
  id: true,
  guestId: true,
  createdAt: true,
  updatedAt: true,
});

export type RSVPFormData = z.infer<typeof rsvpInsertSchema>;

// Also support the old form structure for backward compatibility
export const rsvpFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  firstName: z.string().min(1, "First name is required").max(255),
  lastName: z.string().min(1, "Last name is required").max(255),
  email: z.string().email("Invalid email address").max(255),
  attendance: z.enum(["yes", "no"]),
  guestCount: z.coerce.number().int().positive().max(10),
  dietaryRestrictions: z.string().optional(),
  allergies: z.string().optional(),
  notes: z.string().optional(),
});

export type RSVPFormInput = z.infer<typeof rsvpFormSchema>;
