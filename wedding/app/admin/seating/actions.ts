"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  clearAllSeats,
  clearSeatingTable,
  createSeatingTable,
  deleteSeatingTable,
  moveGuestToTable,
  renameSeatingTable,
  setSeatingTableSeats,
} from "@/lib/seating-queries";
import { MAX_TABLE_SEATS, MIN_TABLE_SEATS, TABLE_NAME_MAX } from "@/lib/seating";

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

const tableSeatsSchema = z.object({
  tableId: uuid,
  seats: z.number().int().min(MIN_TABLE_SEATS).max(MAX_TABLE_SEATS),
});

const renameSchema = z.object({
  tableId: uuid,
  name: z.string().trim().min(1).max(TABLE_NAME_MAX),
});

const moveSchema = z.object({
  rsvpId: uuid,
  /** Null means "back to the unseated list". */
  tableId: uuid.nullable(),
  index: z.number().int().min(0).optional(),
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

export async function setTableSeats(input: unknown): Promise<SeatingActionResult> {
  const parsed = tableSeatsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: `A table can seat between ${MIN_TABLE_SEATS} and ${MAX_TABLE_SEATS} guests.`,
    };
  }

  return guarded(async () => {
    await setSeatingTableSeats(parsed.data.tableId, parsed.data.seats);
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

/** Drop a guest onto a table, or back onto the unseated list. */
export async function moveGuest(input: unknown): Promise<SeatingActionResult> {
  const parsed = moveSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: GENERIC_ERROR };

  return guarded(async () => {
    const moved = await moveGuestToTable(
      parsed.data.rsvpId,
      parsed.data.tableId,
      parsed.data.index
    );

    return moved.ok ? { success: true } : { success: false, error: moved.error };
  });
}
