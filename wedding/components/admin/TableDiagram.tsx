import type { ReactNode } from "react";
import {
  seatSlots,
  SEAT_SIZE_REM,
  tableBoxRem,
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
 *
 * The table is drawn at the size its seats need (`tableBoxRem`) rather than
 * stretched to fill the card. A table with thirty seats is simply a big table:
 * it keeps every seat readable and scrolls sideways inside its card if the
 * screen is too narrow, instead of shrinking names into slivers.
 */

export type DiagramSeat = SeatSlot & { guest: SeatingGuest | null };

interface TableDiagramProps {
  table: SeatingTable;
  renderSeat: (seat: DiagramSeat) => ReactNode;
  /** Shown in the middle of the table — the name on the chart, nothing on print. */
  children?: ReactNode;
  className?: string;
}

/** Room for the seats that hang outside the table's edge. */
const PAD_X_REM = SEAT_SIZE_REM / 2 + 0.4;
const PAD_Y_REM = 1.6;

export const TableDiagram = ({ table, renderSeat, children, className }: TableDiagramProps) => {
  const slots = seatSlots(table);
  const taken = new Map(table.seated.map((entry) => [entry.seat, entry.guest]));
  const box = tableBoxRem(table);

  return (
    // The scroller is the card's width; the table inside keeps its own size.
    <div className={cn("w-full overflow-x-auto", className)}>
      <div
        className="relative mx-auto"
        style={{
          width: `${box.width + PAD_X_REM * 2}rem`,
          padding: `${PAD_Y_REM}rem ${PAD_X_REM}rem`,
        }}
      >
        <div className="relative" style={{ width: `${box.width}rem`, height: `${box.height}rem` }}>
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
                // One fixed, readable size: the table was sized so that every
                // seat has room for it.
                width: `${SEAT_SIZE_REM}rem`,
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
    </div>
  );
};
