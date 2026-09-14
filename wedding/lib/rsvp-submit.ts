/**
 * Bits shared by the two RSVP server actions (`submitRsvp` for the wedding,
 * `submitRehearsalRsvp` for the night before). Kept out of the action files so
 * neither has to re-derive the same error handling.
 */

/** Message shown to guests when something unexpected goes wrong. */
export const GENERIC_ERROR =
  "Sorry — we couldn't save your RSVP just now. Please try again, or email us if it keeps happening.";

/** Postgres unique-violation SQLSTATE. */
const UNIQUE_VIOLATION = "23505";

/**
 * True when the insert tripped the given table's `(first, last, email)` index —
 * i.e. this guest has already replied to this event.
 */
export const isUniqueViolation = (error: unknown, constraint: string) =>
  (typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === UNIQUE_VIOLATION) ||
  (error instanceof Error && error.message.includes(constraint));

export const duplicateError = (guest: { firstName: string; lastName: string; email: string }) =>
  `We already have an RSVP for ${guest.firstName} ${guest.lastName} (${guest.email}). Please email us if you need to change it.`;

export type SubmitRsvpResult = { success: true; count: number } | { success: false; error: string };
