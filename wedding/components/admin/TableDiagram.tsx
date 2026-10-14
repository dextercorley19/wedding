import type { ReactNode } from "react";
import {
  seatSlots,
  tableAspect,
  tableCapacity,
  type SeatingGuest,
  type SeatingTable,
  type SeatSlot,
} from "@/lib/seating";
import { cn } from "@/lib/utils";

/**
 * One table drawn with its seats around it.
 *
 * Shared by the interactive chart and the printable layout so both put seat 7
 * in the same chair: the geometry comes from `seatSlots`, and the caller only
 * decides what goes *in* a seat — a drop target in the chart, a name on the
 * print page. No "use client" here, so the print page stays a server render.
 */

export type DiagramSeat = SeatSlot & { guest: SeatingGuest | null };

interface TableDiagramProps {
  table: SeatingTable;
  renderSeat: (seat: DiagramSeat) => ReactNode;
  /** Shown in the middle of the table — the name on the chart, nothing on print. */
  children?: ReactNode;
  className?: string;
}

/**
 * How wide a seat may be, as a percentage of the table's width.
 *
 * Seats are spaced evenly along an edge, so how much room each one has depends
 * on how many share that edge — a fixed width overlaps its neighbours the
 * moment a table seats six a side. Round tables get the chord between adjacent
 * seats; a rectangle's long edges get their share of the width, and the ends,
 * which only ever hold a seat or two, get a fixed slice.
 *
 * The floor keeps a very long table legible-ish rather than exact: better two
 * names slightly crowded than six unreadable ones.
 */
const seatWidth = (table: SeatingTable, slot: SeatSlot) => {
  // Seats take a little less than their share of the edge, so neighbours don't
  // sit flush — two touching boxes read as one strip, and the one painted
  // second clips the name in the one before it.
  const gap = 0.86;

  if (table.shape === "round") {
    const count = Math.max(1, table.seats);
    // The chord between neighbouring seats is how much room each one has.
    return `${Math.max(18, Math.min(34, 100 * Math.sin(Math.PI / count) * gap))}%`;
  }

  if (slot.side === "left" || slot.side === "right") return "28%";

  const across = Math.max(table.sides.top, table.sides.bottom);
  return `${Math.max(13, (100 / (across + 1)) * gap)}%`;
};

export const TableDiagram = ({ table, renderSeat, children, className }: TableDiagramProps) => {
  const slots = seatSlots(table);
  const taken = new Map(table.seated.map((entry) => [entry.seat, entry.guest]));

  return (
    // The padding is the room the seats need: they're positioned against the
    // table surface and hang half outside it, so the surface is inset from the
    // card by roughly half a seat.
    <div className={cn("relative w-full max-w-[21rem] mx-auto px-8 py-10", className)}>
      <div className="relative w-full" style={{ aspectRatio: tableAspect(table) }}>
        {/* The table surface itself. */}
        <div
          className={cn(
            "absolute inset-0 border border-sage/50 bg-sage/10",
            table.shape === "round" ? "rounded-full" : "rounded-md"
          )}
        />

        {children && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2 pointer-events-none">
            {children}
          </div>
        )}

        {slots.map((slot) => (
          <div
            key={slot.seat}
            className="absolute"
            style={{
              left: `${slot.x * 100}%`,
              top: `${slot.y * 100}%`,
              transform: "translate(-50%, -50%)",
              // Percentages resolve against the table surface, so a seat's
              // width tracks the table's as the card resizes.
              width: seatWidth(table, slot),
              minWidth: "2.25rem",
            }}
          >
            {renderSeat({ ...slot, guest: taken.get(slot.seat) ?? null })}
          </div>
        ))}

        {tableCapacity(table) === 0 && (
          <p className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
            No seats
          </p>
        )}
      </div>
    </div>
  );
};
