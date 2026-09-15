import { z } from "zod";

/** The two guest lists; each has its own menu. */
export type RsvpEvent = "wedding" | "rehearsal";

/** One plated option. `value` is what we persist; the rest is what guests read. */
export type MealOption = {
  value: string;
  name: string;
  /** The courses that come with it, where we have that copy. */
  description?: string;
};

/**
 * Plated dinner options offered at the reception.
 */
export const MEAL_OPTIONS = [
  {
    value: "chicken",
    name: "Herb Roasted Chicken Breast",
    description: "Milanese Risotto, Market Vegetables, Thyme Infused Jus",
  },
  {
    value: "cod",
    name: "Miso Black Cod",
    description: "Braised Choy Sum, Wasabi Whipped Potato, Sesame, Green Onion",
  },
] as const satisfies readonly MealOption[];

/** Plated dinner options offered at the rehearsal dinner, the night before. */
export const REHEARSAL_MEAL_OPTIONS = [
  { value: "filet", name: "Filet Mignon" },
  { value: "seabass", name: "Chilean Seabass" },
  { value: "vegan", name: "Vegan" },
] as const satisfies readonly MealOption[];

/** The menu a given event's guests choose from. */
export const mealOptionsFor = (event: RsvpEvent): readonly MealOption[] =>
  event === "rehearsal" ? REHEARSAL_MEAL_OPTIONS : MEAL_OPTIONS;

/** Look up the display name for a stored meal value. */
export const mealLabel = (value: string | null | undefined, event: RsvpEvent = "wedding") =>
  mealOptionsFor(event).find((option) => option.value === value)?.name ?? null;

/** How much an allergy note can hold, matching the column it lands in. */
export const ALLERGY_NOTES_MAX = 500;

/**
 * The guest fields every RSVP form collects. Both events share them — and the
 * same inferred type — so one form component can render either. `mealChoice`
 * is a plain string here; which values are actually allowed depends on the
 * event, and is checked in the refinement below.
 *
 * `hasAllergy` only drives the form: what we keep is the note itself, so a
 * ticked box with nothing written down can't reach the database.
 */
const guestFields = {
  // Trimmed before anything else sees them. Phone keyboards love a trailing
  // space, and the `(first_name, last_name, email)` unique index compares exact
  // strings — so "Megan " and "Megan" would file as two different guests.
  firstName: z.string().trim().min(1, "First name is required").max(255),
  lastName: z.string().trim().min(1, "Last name is required").max(255),
  email: z.string().trim().email("Invalid email address").max(255),
  attendance: z.enum(["yes", "no"]),
  mealChoice: z.string().max(32).optional(),
  hasAllergy: z.boolean().optional(),
  allergyNotes: z
    .string()
    .max(ALLERGY_NOTES_MAX, `Please keep this under ${ALLERGY_NOTES_MAX} characters`)
    .optional(),
} as const;

/**
 * Attending guests must pick a dinner, and it has to be one this event offers —
 * so a stale option from the other menu can't be posted straight to the action.
 */
const rsvpFormSchemaFor = (event: RsvpEvent) =>
  z.object(guestFields).superRefine((data, ctx) => {
    // A dinner selection is only meaningful for guests who are coming.
    if (data.attendance !== "yes") return;

    const isOffered = mealOptionsFor(event).some((option) => option.value === data.mealChoice);

    if (!isOffered) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["mealChoice"],
        message: "Please choose a dinner selection",
      });
    }

    // Ticking the box is the guest saying there's something to tell us.
    if (data.hasAllergy && !data.allergyNotes?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["allergyNotes"],
        message: "Please tell us about the allergy or restriction",
      });
    }
  });

// Form schemas that match the RSVP form UI
export const rsvpFormSchema = rsvpFormSchemaFor("wedding");
export const rehearsalRsvpFormSchema = rsvpFormSchemaFor("rehearsal");

export type RSVPFormInput = z.infer<typeof rsvpFormSchema>;

/**
 * The "I have an allergy" form in the FAQ, for guests who replied before the
 * RSVP form asked. There's no email here — the guest is matched on name alone
 * (see `findRsvpsByName`), so the form stays as short as the question deserves.
 */
export const allergyLookupSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(255),
  lastName: z.string().trim().min(1, "Last name is required").max(255),
  allergyNotes: z
    .string()
    .trim()
    .min(1, "Please tell us about the allergy or restriction")
    .max(ALLERGY_NOTES_MAX, `Please keep this under ${ALLERGY_NOTES_MAX} characters`),
});

export type AllergyLookupInput = z.infer<typeof allergyLookupSchema>;
