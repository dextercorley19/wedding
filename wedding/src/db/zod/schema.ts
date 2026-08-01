import { z } from "zod";

/**
 * Plated dinner options offered at the reception. `value` is what we persist;
 * the copy below is what guests see on the RSVP form.
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
] as const;

export type MealChoice = (typeof MEAL_OPTIONS)[number]["value"];

const mealValues = MEAL_OPTIONS.map((option) => option.value) as [MealChoice, ...MealChoice[]];

export const mealChoiceSchema = z.enum(mealValues);

/** Look up the display name for a stored meal value. */
export const mealLabel = (value: string | null | undefined) =>
  MEAL_OPTIONS.find((option) => option.value === value)?.name ?? null;

// Form schema that matches the RSVP form UI
export const rsvpFormSchema = z
  .object({
    firstName: z.string().min(1, "First name is required").max(255),
    lastName: z.string().min(1, "Last name is required").max(255),
    email: z.string().email("Invalid email address").max(255),
    attendance: z.enum(["yes", "no"]),
    mealChoice: mealChoiceSchema.optional(),
  })
  .superRefine((data, ctx) => {
    // A dinner selection is only meaningful for guests who are coming.
    if (data.attendance === "yes" && !data.mealChoice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["mealChoice"],
        message: "Please choose a dinner selection",
      });
    }
  });

export type RSVPFormInput = z.infer<typeof rsvpFormSchema>;
