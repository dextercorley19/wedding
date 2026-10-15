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
  /**
   * Zoom. 1 draws the table at its natural size; below that it shrinks to fit
   * more of a big table on screen, above it magnifies.
   *
   * A CSS transform rather than smaller `rem` values, so everything — seats,
   * names, the table itself — scales together and the drawing stays the one
   * the geometry describes.
   */
  scale?: number;
  className?: string;
}

/** Room for the seats that hang outside the table's edge. */
const PAD_X_REM = SEAT_SIZE_REM / 2 + 0.4;
const PAD_Y_REM = 1.6;

/**
 * The whole drawing's size in `rem`, seats included — what a caller needs to
 * work out the zoom that fits a table in the space it has.
 */
export const diagramSizeRem = (table: Parameters<typeof tableBoxRem>[0]) => {
  const box = tableBoxRem(table);
  return { width: box.width + PAD_X_REM * 2, height: box.height + PAD_Y_REM * 2 };
};

export const TableDiagram = ({
  table,
  renderSeat,
  children,
  scale = 1,
  className,
}: TableDiagramProps) => {
  const slots = seatSlots(table);
  const taken = new Map(table.seated.map((entry) => [entry.seat, entry.guest]));
  const box = tableBoxRem(table);
  const size = diagramSizeRem(table);

  return (
    // The scroller is the card's width; the table inside keeps its own size.
    <div className={cn("w-full overflow-auto", className)}>
      {/* Transforms don't affect layout, so the outer box carries the scaled
          size and the inner one is drawn at full size and then scaled into it. */}
      <div
        className="relative mx-auto"
        style={{ width: `${size.width * scale}rem`, height: `${size.height * scale}rem` }}
      >
        <div
          className="absolute top-0 left-0"
          style={{
            width: `${size.width}rem`,
            height: `${size.height}rem`,
            padding: `${PAD_Y_REM}rem ${PAD_X_REM}rem`,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <div
            className="relative"
            style={{ width: `${box.width}rem`, height: `${box.height}rem` }}
          >
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
    </div>
  );
};
