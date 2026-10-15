"use client";

import { FC, useCallback, useState } from "react";
import { Maximize2, Minus, Plus, Search, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { diagramSizeRem, TableDiagram } from "@/components/admin/TableDiagram";
import { draggedGuestId, GuestChip, SeatButton } from "@/components/admin/SeatingPieces";
import {
  guestName,
  matchesSeatingQuery,
  tableCapacity,
  TABLE_SHAPES,
  type SeatingGuest,
  type SeatingTable,
} from "@/lib/seating";

/**
 * One table, full screen.
 *
 * A table of thirty is wider than any card, so the chart alone can't show the
 * whole thing at once. This opens a single table on its own, zoomed to fit the
 * window, with the unseated list beside it so it's somewhere to *work* and not
 * just somewhere to look.
 */

/** The zoom stops the −/+ buttons walk through. */
const ZOOM_STEPS = [0.3, 0.4, 0.5, 0.6, 0.75, 0.9, 1, 1.25, 1.5, 2] as const;

const MIN_ZOOM = ZOOM_STEPS[0];
const MAX_ZOOM = ZOOM_STEPS[ZOOM_STEPS.length - 1];

/** One rem in pixels, so a `rem` drawing can be measured against a pixel box. */
const rootFontSize = () => {
  const size = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  return Number.isFinite(size) && size > 0 ? size : 16;
};

/**
 * The zoom at which the whole table fits the space it's given.
 *
 * Measured with a `ResizeObserver` rather than on every render: it fires once
 * when it starts observing, which is the first measurement, and again whenever
 * the window changes — so there's no `setState` during render or in an effect
 * body to cascade.
 */
const useFitZoom = (widthRem: number, heightRem: number) => {
  const [viewport, setViewport] = useState<{ width: number; height: number } | null>(null);

  const ref = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setViewport({ width, height });
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Never zoom *in* to fit — a small table centred at its natural size reads
  // better than one blown up to fill the window.
  const fit = viewport
    ? Math.min(
        1,
        Math.max(
          MIN_ZOOM,
          Math.min(
            viewport.width / (widthRem * rootFontSize()),
            viewport.height / (heightRem * rootFontSize())
          )
        )
      )
    : 1;

  return { ref, fit };
};

interface TableFocusViewProps {
  table: SeatingTable;
  unseated: SeatingGuest[];
  selectedId: string | null;
  selectedGuest: SeatingGuest | null;
  onSelectGuest: (rsvpId: string) => void;
  onSeat: (rsvpId: string, seat: number) => void;
  onUnseat: (rsvpId: string) => void;
  onClose: () => void;
}

export const TableFocusView: FC<TableFocusViewProps> = ({
  table,
  unseated,
  selectedId,
  selectedGuest,
  onSelectGuest,
  onSeat,
  onUnseat,
  onClose,
}) => {
  const [query, setQuery] = useState("");
  /** Null means "fit": the zoom follows the window until it's set by hand. */
  const [zoom, setZoom] = useState<number | null>(null);

  const size = diagramSizeRem(table);
  const { ref, fit } = useFitZoom(size.width, size.height);
  const effective = zoom ?? fit;

  const step = (direction: 1 | -1) => {
    const next =
      direction === 1
        ? (ZOOM_STEPS.find((candidate) => candidate > effective + 0.001) ?? MAX_ZOOM)
        : ([...ZOOM_STEPS].reverse().find((candidate) => candidate < effective - 0.001) ??
          MIN_ZOOM);

    setZoom(next);
  };

  const visible = unseated.filter((guest) => matchesSeatingQuery(guest, query));
  const capacity = tableCapacity(table);

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        className="w-screen h-[100dvh] max-h-none max-w-none sm:max-w-none translate-x-0 translate-y-0 top-0 left-0 p-0 gap-0 grid-rows-[auto_1fr] rounded-none overflow-hidden overflow-y-hidden"
        // The whole point is room to see the table; the dialog shouldn't steal
        // focus into the guest list and scroll it away on open.
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-sage/25 px-4 py-3 pr-14">
          <div className="min-w-0">
            <DialogTitle className="font-serif text-2xl truncate">{table.name}</DialogTitle>
            <p className="text-xs text-muted-foreground">
              {TABLE_SHAPES[table.shape].label} · {table.seated.length} of {capacity} seats
            </p>
          </div>

          <div className="flex items-center gap-1 ml-auto">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => step(-1)}
              disabled={effective <= MIN_ZOOM + 0.001}
              aria-label="Zoom out"
            >
              <Minus className="w-4 h-4" />
            </Button>

            {/* Not a label but a control: it's how you get back to "fit". */}
            <button
              type="button"
              onClick={() => setZoom(null)}
              className="suite-label text-xs w-16 text-center tabular-nums hover:text-foreground text-muted-foreground"
              title="Fit the whole table on screen"
            >
              {Math.round(effective * 100)}%
            </button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => step(1)}
              disabled={effective >= MAX_ZOOM - 0.001}
              aria-label="Zoom in"
            >
              <Plus className="w-4 h-4" />
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setZoom(null)}
              disabled={zoom === null}
            >
              <Maximize2 className="w-4 h-4" />
              Fit
            </Button>
          </div>
        </header>

        <div className="grid min-h-0 md:grid-cols-[17rem_1fr]">
          {/* The unseated list, and the drop target for taking someone out. */}
          <aside
            className="hidden md:flex flex-col gap-3 border-r border-sage/25 p-4 min-h-0"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const rsvpId = draggedGuestId(event);
              if (rsvpId) onUnseat(rsvpId);
            }}
          >
            <div className="flex items-baseline justify-between">
              <p className="suite-label text-xs text-sage-deep">Not yet seated</p>
              <p className="font-serif text-xl">{unseated.length}</p>
            </div>

            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                aria-hidden
              />
              <Input
                type="search"
                value={query}
                onChange={(changed) => setQuery(changed.target.value)}
                placeholder="Search guests"
                className="pl-9"
                aria-label="Search unseated guests"
              />
            </div>

            <div className="space-y-1.5 overflow-y-auto min-h-0">
              {visible.map((guest) => (
                <GuestChip
                  key={guest.rsvpId}
                  guest={guest}
                  selected={selectedId === guest.rsvpId}
                  onSelect={() => onSelectGuest(guest.rsvpId)}
                />
              ))}

              {visible.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {unseated.length === 0 ? "Everyone has a seat." : "No guests match this search."}
                </p>
              )}
            </div>
          </aside>

          <div className="flex flex-col min-h-0 min-w-0">
            {selectedGuest && (
              <p
                className="flex flex-wrap items-center justify-center gap-2 border-b border-sage/25 px-4 py-2 text-sm text-muted-foreground"
                aria-live="polite"
              >
                <span>
                  <span className="text-foreground">{guestName(selectedGuest)}</span> selected —
                  choose a seat.
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onUnseat(selectedGuest.rsvpId)}
                >
                  <UserMinus className="w-4 h-4" />
                  Unseat
                </Button>
              </p>
            )}

            {/* The box the fit is measured against; the diagram scrolls inside
                it once zoomed past what fits. */}
            <div ref={ref} className="flex-1 min-h-0 overflow-auto p-4">
              <TableDiagram
                table={table}
                scale={effective}
                renderSeat={(slot) => (
                  <SeatButton
                    slot={slot}
                    tableName={table.name}
                    selectedGuest={selectedGuest}
                    selectedId={selectedId}
                    onSelectGuest={onSelectGuest}
                    onSeat={onSeat}
                  />
                )}
              >
                <span className="suite-label text-[0.65rem] text-sage-deep">{table.name}</span>
                <span className="text-[0.65rem] text-muted-foreground">
                  {table.seated.length}/{capacity}
                </span>
              </TableDiagram>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
