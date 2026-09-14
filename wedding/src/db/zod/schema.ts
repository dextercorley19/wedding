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

/**
 * The guest fields every RSVP form collects. Both events share them — and the
 * same inferred type — so one form component can render either. `mealChoice`
 * is a plain string here; which values are actually allowed depends on the
 * event, and is checked in the refinement below.
 */
const guestFields = {
  firstName: z.string().min(1, "First name is required").max(255),
  lastName: z.string().min(1, "Last name is required").max(255),
  email: z.string().email("Invalid email address").max(255),
  attendance: z.enum(["yes", "no"]),
  mealChoice: z.string().max(32).optional(),
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
  });

// Form schemas that match the RSVP form UI
export const rsvpFormSchema = rsvpFormSchemaFor("wedding");
export const rehearsalRsvpFormSchema = rsvpFormSchemaFor("rehearsal");

export type RSVPFormInput = z.infer<typeof rsvpFormSchema>;
