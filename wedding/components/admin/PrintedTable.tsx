import { AlertTriangle } from "lucide-react";
import { diagramSizeRem, TableDiagram } from "@/components/admin/TableDiagram";
import { fitToPrintedPage, guestName, type SeatingTable } from "@/lib/seating";

/**
 * One table's drawing, sized to land whole on a printed page.
 *
 * Paper doesn't scroll: at full size a long table runs off the right edge and
 * is lost. `fitToPrintedPage` says how much to shrink it, and whether to turn
 * it a quarter turn to use the page's long side instead of its short one.
 *
 * The turn is done here rather than inside `TableDiagram` so the diagram stays
 * the one thing that knows where seats go, and the heading above it stays the
 * right way up.
 */
export const PrintedTable = ({ table }: { table: SeatingTable }) => {
  const fit = fitToPrintedPage(diagramSizeRem(table));
  const size = diagramSizeRem(table);
  const width = size.width * fit.scale;
  const height = size.height * fit.scale;

  const diagram = (
    <TableDiagram
      table={table}
      scale={fit.scale}
      renderSeat={({ seat, guest }) => (
        <div
          className={
            guest
              ? "w-full px-1 py-1 rounded-sm border border-sage/50 bg-background text-center text-[0.6rem] leading-tight"
              : "w-full px-1 py-1 rounded-sm border border-dashed border-sage/30 text-center text-[0.6rem] text-muted-foreground"
          }
        >
          {guest ? (
            <>
              <span className="block font-medium">{guestName(guest)}</span>
              <span className="flex items-center justify-center gap-0.5 text-muted-foreground">
                <span className="truncate">{guest.mealName ?? "No dinner"}</span>
                {guest.allergyNotes && (
                  <AlertTriangle className="w-2.5 h-2.5 shrink-0 text-hydrangea-deep" aria-hidden />
                )}
              </span>
            </>
          ) : (
            <span>Seat {seat + 1}</span>
          )}
        </div>
      )}
    />
  );

  if (!fit.rotated) return diagram;

  return (
    <div className="relative mx-auto" style={{ width: `${height}rem`, height: `${width}rem` }}>
      {/* Rotating doesn't change the space an element takes, so the box above
          carries the turned footprint — width and height swapped — and the
          drawing is rotated into it. Anticlockwise, so the names read upwards
          when the sheet is turned clockwise to look at them. */}
      <div
        className="absolute top-0 left-0"
        style={{
          width: `${width}rem`,
          height: `${height}rem`,
          transformOrigin: "top left",
          transform: `translateY(${width}rem) rotate(-90deg)`,
        }}
      >
        {diagram}
      </div>
    </div>
  );
};
