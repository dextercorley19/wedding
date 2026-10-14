"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  clearAllSeats,
  clearSeatingTable,
  createSeatingTable,
  deleteSeatingTable,
  renameSeatingTable,
  reshapeSeatingTable,
  seatGuestInSeat,
  unseatGuestById,
} from "@/lib/seating-queries";
import {
  MAX_SIDE_SEATS,
  MAX_TABLE_SEATS,
  MIN_TABLE_SEATS,
  tableCapacity,
  TABLE_NAME_MAX,
} from "@/lib/seating";

/**
 * Server actions behind the seating chart.
 *
 * Every one re-checks the admin cookie: a Server Action is a public endpoint,
 * and the page's gate only protects the render. Like `submitRsvp`, they return
 * `{ success, error }` rather than throwing, since Next.js redacts Server
 * Action error messages in production.
 */

export type SeatingActionResult = { success: true } | { success: false; error: string };

const GENERIC_ERROR = "Something went wrong saving the chart. Please try again.";
const UNAUTHORIZED = "Your admin session has expired — please sign in again.";

const uuid = z.string().uuid();

const sideSeats = z.number().int().min(0).max(MAX_SIDE_SEATS);

const renameSchema = z.object({
  tableId: uuid,
  name: z.string().trim().min(1).max(TABLE_NAME_MAX),
});

/**
 * A table's shape and its seats. Both layouts are always sent, so switching a
 * table to a rectangle and back doesn't lose the per-side counts — and a
 * table has to end up with at least one seat, since a table nobody can sit at
 * is just clutter on the chart.
 */
const reshapeSchema = z
  .object({
    tableId: uuid,
    shape: z.enum(["round", "rect"]),
    seats: z.number().int().min(MIN_TABLE_SEATS).max(MAX_TABLE_SEATS),
    sides: z.object({
      top: sideSeats,
      bottom: sideSeats,
      left: sideSeats,
      right: sideSeats,
    }),
  })
  .refine((data) => tableCapacity(data) >= MIN_TABLE_SEATS, {
    message: "A table needs at least one seat.",
    path: ["sides"],
  });

const seatSchema = z.object({
  rsvpId: uuid,
  tableId: uuid,
  /** A 0-based index into the table's seats. */
  seat: z
    .number()
    .int()
    .min(0)
    .max(MAX_TABLE_SEATS * 4),
});

/**
 * Shared wrapper: check the session, run the mutation, revalidate the chart.
 * A thrown database error is logged and reported as the generic message, so a
 * connection string never reaches the browser.
 */
const guarded = async (
  run: () => Promise<SeatingActionResult | void>
): Promise<SeatingActionResult> => {
  if (!(await isAdminAuthenticated())) {
    return { success: false, error: UNAUTHORIZED };
  }

  try {
    const result = await run();
    revalidatePath("/admin/seating");
    revalidatePath("/admin/seating/print");
    return result ?? { success: true };
  } catch (error) {
    console.error("Seating chart error:", error);
    return { success: false, error: GENERIC_ERROR };
  }
};

/** Lay out one more table at the end of the chart. */
export async function addSeatingTable(): Promise<SeatingActionResult> {
  return guarded(async () => {
    await createSeatingTable();
  });
}

export async function renameTable(input: unknown): Promise<SeatingActionResult> {
  const parsed = renameSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: `Please give the table a name under ${TABLE_NAME_MAX} characters.`,
    };
  }

  return guarded(async () => {
    await renameSeatingTable(parsed.data.tableId, parsed.data.name);
  });
}

/** Switch a table between round and rectangular, or change its seat counts. */
export async function reshapeTable(input: unknown): Promise<SeatingActionResult> {
  const parsed = reshapeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.errors[0]?.message ??
        `A table seats between ${MIN_TABLE_SEATS} and ${MAX_TABLE_SEATS} guests.`,
    };
  }

  const { tableId, ...shape } = parsed.data;

  return guarded(async () => {
    await reshapeSeatingTable(tableId, shape);
  });
}

/** Remove a table. Whoever was sitting there goes back to the unseated list. */
export async function removeSeatingTable(input: unknown): Promise<SeatingActionResult> {
  const parsed = uuid.safeParse(input);
  if (!parsed.success) return { success: false, error: GENERIC_ERROR };

  return guarded(async () => {
    await deleteSeatingTable(parsed.data);
  });
}

/** Empty a table without removing it. */
export async function emptySeatingTable(input: unknown): Promise<SeatingActionResult> {
  const parsed = uuid.safeParse(input);
  if (!parsed.success) return { success: false, error: GENERIC_ERROR };

  return guarded(async () => {
    await clearSeatingTable(parsed.data);
  });
}

/** Start the seating over, keeping the tables themselves. */
export async function clearSeatingChart(): Promise<SeatingActionResult> {
  return guarded(async () => {
    await clearAllSeats();
  });
}

/** Put a guest in a specific seat, swapping with whoever is already in it. */
export async function seatGuest(input: unknown): Promise<SeatingActionResult> {
  const parsed = seatSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: GENERIC_ERROR };

  return guarded(async () => {
    const moved = await seatGuestInSeat(parsed.data.rsvpId, parsed.data.tableId, parsed.data.seat);
    return moved.ok ? { success: true } : { success: false, error: moved.error };
  });
}

/** Take a guest out of their seat and back to the unseated list. */
export async function unseatGuest(input: unknown): Promise<SeatingActionResult> {
  const parsed = uuid.safeParse(input);
  if (!parsed.success) return { success: false, error: GENERIC_ERROR };

  return guarded(async () => {
    await unseatGuestById(parsed.data);
  });
}
