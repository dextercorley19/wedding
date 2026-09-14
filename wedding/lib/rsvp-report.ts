import type { RehearsalRSVP, RSVP } from "@/db/schema";
import { mealLabel, mealOptionsFor, type RsvpEvent } from "@/db/zod/schema";
import { toCsv } from "@/lib/csv";

/**
 * Shaping and filtering for the admin dashboard. The page, the table, and the
 * CSV export all go through here so a filtered view and its download agree.
 * Both events — the wedding and the rehearsal dinner — share this module; an
 * `RsvpEvent` says which one a set of rows belongs to.
 *
 * Deliberately free of database imports — the table is a client component, and
 * pulling `@/db` in would drag the Neon client into the browser bundle. The
 * query itself lives in `lib/rsvp-queries.ts`.
 */

/** The wedding is in Newport Beach — show timestamps the way the couple reads them. */
const TIME_ZONE = "America/Los_Angeles";

const timestampFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  dateStyle: "medium",
  timeStyle: "short",
});

const fileDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  dateStyle: "short",
});

/** Which guest list a set of rows came from. */
export type { RsvpEvent };

export const RSVP_EVENTS = {
  wedding: { label: "Wedding", filePrefix: "rsvps" },
  rehearsal: { label: "The Night Before", filePrefix: "rehearsal-rsvps" },
} as const satisfies Record<RsvpEvent, { label: string; filePrefix: string }>;

/** Anything but "rehearsal" falls back to the wedding list. */
export const parseRsvpEvent = (value: string | null | undefined): RsvpEvent =>
  value === "rehearsal" ? "rehearsal" : "wedding";

/** A row after serialization — safe to hand to a client component. */
export type RsvpRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  attending: boolean;
  mealChoice: string | null;
  mealName: string | null;
  /** Null unless the guest ticked the allergy box and told us what it is. */
  allergyNotes: string | null;
  submittedAt: string;
};

export type RsvpStatusFilter = "all" | "attending" | "declined";

export type RsvpFilters = {
  status: RsvpStatusFilter;
  query: string;
};

export const DEFAULT_FILTERS: RsvpFilters = { status: "all", query: "" };

/**
 * Timestamps are formatted here, on the server, so the markup can't disagree
 * with a client re-render in a different timezone.
 */
export const toRsvpRow = (rsvp: RSVP): RsvpRow => ({
  id: rsvp.id,
  firstName: rsvp.firstName,
  lastName: rsvp.lastName,
  email: rsvp.email,
  attending: rsvp.attending,
  mealChoice: rsvp.mealChoice,
  mealName: mealLabel(rsvp.mealChoice),
  allergyNotes: rsvp.allergyNotes,
  submittedAt: timestampFormatter.format(rsvp.createdAt),
});

/** Same shape, resolved against the rehearsal dinner's own menu. */
export const toRehearsalRsvpRow = (rsvp: RehearsalRSVP): RsvpRow => ({
  id: rsvp.id,
  firstName: rsvp.firstName,
  lastName: rsvp.lastName,
  email: rsvp.email,
  attending: rsvp.attending,
  mealChoice: rsvp.mealChoice,
  mealName: mealLabel(rsvp.mealChoice, "rehearsal"),
  allergyNotes: rsvp.allergyNotes,
  submittedAt: timestampFormatter.format(rsvp.createdAt),
});

export const parseStatusFilter = (value: string | null | undefined): RsvpStatusFilter =>
  value === "attending" || value === "declined" ? value : "all";

export const filterRsvpRows = (rows: readonly RsvpRow[], { status, query }: RsvpFilters) => {
  const needle = query.trim().toLowerCase();

  return rows.filter((row) => {
    if (status === "attending" && !row.attending) return false;
    if (status === "declined" && row.attending) return false;
    if (!needle) return true;

    return [row.firstName, row.lastName, row.email, row.mealName ?? "", row.allergyNotes ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });
};

export type RsvpSummary = {
  total: number;
  attending: number;
  declined: number;
  meals: { value: string; name: string; count: number }[];
  /** Attending guests who somehow have no dinner on file. */
  missingMeal: number;
  /** Attending guests with an allergy or restriction to pass to the kitchen. */
  withAllergy: number;
};

export const summarizeRsvps = (
  rows: readonly RsvpRow[],
  event: RsvpEvent = "wedding"
): RsvpSummary => {
  const attendingRows = rows.filter((row) => row.attending);

  return {
    total: rows.length,
    attending: attendingRows.length,
    declined: rows.length - attendingRows.length,
    meals: mealOptionsFor(event).map((option) => ({
      value: option.value,
      name: option.name,
      count: attendingRows.filter((row) => row.mealChoice === option.value).length,
    })),
    missingMeal: attendingRows.filter((row) => !row.mealChoice).length,
    withAllergy: attendingRows.filter((row) => row.allergyNotes).length,
  };
};

const CSV_HEADERS = [
  "First Name",
  "Last Name",
  "Email",
  "Attending",
  "Dinner Selection",
  "Allergy / Restriction",
  "Submitted",
] as const;

export const rsvpRowsToCsv = (rows: readonly RsvpRow[]) =>
  toCsv(
    CSV_HEADERS,
    rows.map((row) => [
      row.firstName,
      row.lastName,
      row.email,
      row.attending ? "Yes" : "No",
      row.mealName ?? "",
      row.allergyNotes ?? "",
      row.submittedAt,
    ])
  );

export const csvFilename = (now: Date, event: RsvpEvent = "wedding") =>
  `${RSVP_EVENTS[event].filePrefix}-${fileDateFormatter.format(now)}.csv`;
