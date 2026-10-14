"use client";

import { FC, useMemo, useOptimistic, useState, useTransition, type DragEvent } from "react";
import {
  AlertTriangle,
  Download,
  Eraser,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Trash2,
  UserMinus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableDiagram, type DiagramSeat } from "@/components/admin/TableDiagram";
import {
  addSeatingTable,
  clearSeatingChart,
  emptySeatingTable,
  removeSeatingTable,
  renameTable,
  reshapeTable,
  seatGuest as seatGuestAction,
  unseatGuest as unseatGuestAction,
  type SeatingActionResult,
} from "@/app/admin/seating/actions";
import {
  clearTable,
  findGuest,
  findSeat,
  firstFreeSeat,
  guestName,
  isWideTable,
  matchesSeatingQuery,
  MAX_SIDE_SEATS,
  MAX_TABLE_SEATS,
  MIN_TABLE_SEATS,
  removeTable,
  reshapeTable as reshapeTablePlan,
  seatGuest as seatGuestInPlan,
  shortGuestName,
  SIDE_KEYS,
  SIDE_LABELS,
  summarizeSeating,
  TABLE_NAME_MAX,
  TABLE_SHAPES,
  tableCapacity,
  unseatGuest as unseatGuestInPlan,
  type SeatingGuest,
  type SeatingPlan,
  type SeatingTable,
  type TableShape,
} from "@/lib/seating";
import { cn } from "@/lib/utils";

/**
 * The rehearsal dinner seating chart.
 *
 * Each table is drawn with its seats around it, and a guest goes into a
 * particular seat rather than just onto a table — so the chart answers "who is
 * next to whom", which is the question the printed layout has to answer too.
 *
 * Guests move three ways, because one of them always fails somewhere: drag and
 * drop with a mouse, tap a guest then tap a seat on a phone (HTML5 drag events
 * don't fire on touch), and the same two taps with a keyboard, since the guest
 * chips and the seats are real buttons.
 *
 * Every move is applied optimistically and sent to the server behind it, so
 * dragging never waits on a round trip. The server's copy stays the source of
 * truth: when the action settles, the revalidated plan replaces the guess, so a
 * refused move puts the chart back the way it was on its own and only the
 * message has to be shown.
 */

/** What a drag carries. A plain id is all `dataTransfer` needs to hold. */
const DRAG_TYPE = "application/x-wedding-guest";

/**
 * The dragged guest's id, if this drag started on a guest.
 *
 * The id goes onto the drag twice: under our own type, and as `text/plain` for
 * Safari, which has been unreliable about custom MIME types. Reading our type
 * first means text dragged in from elsewhere falls through to the id check —
 * and an id that isn't a guest's is a no-op in `seatGuest` anyway.
 */
const draggedGuestId = (event: DragEvent) =>
  event.dataTransfer.getData(DRAG_TYPE) || event.dataTransfer.getData("text/plain");

const startGuestDrag = (event: DragEvent, rsvpId: string) => {
  event.dataTransfer.setData(DRAG_TYPE, rsvpId);
  event.dataTransfer.setData("text/plain", rsvpId);
  event.dataTransfer.effectAllowed = "move";
};

interface SeatingChartProps {
  plan: SeatingPlan;
}

const MealAndAllergy: FC<{ guest: SeatingGuest }> = ({ guest }) => (
  <span className="flex items-center gap-1.5 text-[0.7rem] text-muted-foreground">
    {guest.mealName ? <span>{guest.mealName}</span> : <span>No dinner selection</span>}
    {guest.allergyNotes && (
      <span
        className="flex items-center gap-0.5 text-hydrangea-deep"
        title={`Allergy: ${guest.allergyNotes}`}
      >
        <AlertTriangle className="w-3 h-3" aria-hidden />
        <span className="sr-only">Allergy: {guest.allergyNotes}</span>
      </span>
    )}
  </span>
);

/** A guest in the unseated list: draggable, and clickable to select. */
const GuestChip: FC<{
  guest: SeatingGuest;
  selected: boolean;
  onSelect: () => void;
}> = ({ guest, selected, onSelect }) => (
  <button
    type="button"
    draggable
    onDragStart={(event) => startGuestDrag(event, guest.rsvpId)}
    onClick={onSelect}
    aria-pressed={selected}
    className={cn(
      "w-full text-left px-2.5 py-1.5 rounded-sm border transition-colors cursor-grab active:cursor-grabbing",
      selected
        ? "border-hydrangea bg-hydrangea-pale/40"
        : "border-sage/25 bg-background hover:border-sage/60"
    )}
  >
    <span className="block truncate text-sm">{guestName(guest)}</span>
    <MealAndAllergy guest={guest} />
  </button>
);

export const SeatingChart: FC<SeatingChartProps> = ({ plan: serverPlan }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // The chart renders the guess while a move is in flight and the server's own
  // plan the moment it settles — so a refused move needs no manual undo, and a
  // change made in another tab arrives on the next revalidate.
  const [plan, showPlan] = useOptimistic(serverPlan, (_current, next: SeatingPlan) => next);

  /** Show a change straight away, then send it. Say why if it's refused. */
  const commit = (next: SeatingPlan, action: () => Promise<SeatingActionResult>) => {
    setError(null);

    startTransition(async () => {
      showPlan(next);
      const result = await action();
      if (!result.success) setError(result.error);
    });
  };

  /** For an action whose result the client can't predict, like a new table's id. */
  const send = (action: () => Promise<SeatingActionResult>) => {
    setError(null);

    startTransition(async () => {
      const result = await action();
      if (!result.success) setError(result.error);
    });
  };

  const selectedGuest = useMemo(
    () => (selected ? findGuest(plan, selected) : null),
    [selected, plan]
  );

  /** Put a guest in a seat. Swapping with whoever is there is `seatGuest`'s job. */
  const seat = (rsvpId: string, tableId: string, seatIndex: number) => {
    setSelected(null);

    const next = seatGuestInPlan(plan, rsvpId, tableId, seatIndex);
    // An unchanged plan means the move was a no-op (same seat) or impossible
    // (a seat or guest the chart no longer has) — either way, nothing to send.
    if (next === plan) return;

    commit(next, () => seatGuestAction({ rsvpId, tableId, seat: seatIndex }));
  };

  const unseat = (rsvpId: string) => {
    setSelected(null);

    const next = unseatGuestInPlan(plan, rsvpId);
    if (next === plan) return;

    commit(next, () => unseatGuestAction(rsvpId));
  };

  const summary = summarizeSeating(plan);
  const visibleUnseated = plan.unseated.filter((guest) => matchesSeatingQuery(guest, query));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          {summary.seated} of {summary.total} attending {summary.total === 1 ? "guest" : "guests"}{" "}
          seated
          {plan.tables.length > 0 && (
            <>
              {" across "}
              {plan.tables.length === 1 ? "1 table" : `${plan.tables.length} tables`} ·{" "}
              {summary.capacity} {summary.capacity === 1 ? "seat" : "seats"}
            </>
          )}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => send(addSeatingTable)}>
            <Plus className="w-4 h-4" />
            Add table
          </Button>

          {summary.seated > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (!window.confirm("Unseat every guest? The tables themselves stay.")) return;
                commit(
                  plan.tables.reduce((next, table) => clearTable(next, table.id), plan),
                  clearSeatingChart
                );
              }}
            >
              <RotateCcw className="w-4 h-4" />
              Reset seating
            </Button>
          )}

          {/* Opened in a tab of its own: it's a layout to print, not a step in
              the chart, and coming back shouldn't mean reloading the chart. */}
          <Button asChild variant="outline" size="sm">
            <a href="/admin/seating/print" target="_blank" rel="noopener noreferrer">
              <Printer className="w-4 h-4" />
              Printable layout
            </a>
          </Button>

          {/* `disabled` on a Slot-rendered <a> does nothing, so swap the element
              rather than the attribute — the same trick `RsvpTable` uses. */}
          {summary.total === 0 ? (
            <Button type="button" size="sm" disabled>
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          ) : (
            <Button asChild size="sm">
              <a href="/admin/seating/export">
                <Download className="w-4 h-4" />
                Export CSV
              </a>
            </Button>
          )}
        </div>
      </div>

      {error && (
        <p className="suite-frame p-3 text-sm text-center text-hydrangea-deep" role="alert">
          {error}
        </p>
      )}

      {selectedGuest && (
        <div
          className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground"
          aria-live="polite"
        >
          <span>
            <span className="text-foreground">{guestName(selectedGuest)}</span> selected — choose a
            seat, or drag them to one.
          </span>
          {findSeat(plan, selectedGuest.rsvpId) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => unseat(selectedGuest.rsvpId)}
            >
              <UserMinus className="w-4 h-4" />
              Unseat
            </Button>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={() => setSelected(null)}>
            <X className="w-4 h-4" />
            Cancel
          </Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[20rem_1fr] items-start">
        {/* The unseated pool, and the drop target for taking someone out. */}
        <aside
          className="suite-frame p-4 space-y-3"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            // This panel opts into drops, so anything let go over it — a file,
            // a link — would otherwise be opened by the browser.
            event.preventDefault();
            const rsvpId = draggedGuestId(event);
            if (rsvpId) unseat(rsvpId);
          }}
        >
          <div className="space-y-1">
            <p className="suite-label text-xs text-sage-deep">Not yet seated</p>
            <p className="font-serif text-3xl">{summary.unseated}</p>
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

          <div className="space-y-1.5 max-h-[32rem] overflow-y-auto">
            {visibleUnseated.map((guest) => (
              <GuestChip
                key={guest.rsvpId}
                guest={guest}
                selected={selected === guest.rsvpId}
                onSelect={() => setSelected(selected === guest.rsvpId ? null : guest.rsvpId)}
              />
            ))}

            {visibleUnseated.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {plan.unseated.length === 0
                  ? summary.total === 0
                    ? "No attending guests yet."
                    : "Everyone has a seat."
                  : "No guests match this search."}
              </p>
            )}
          </div>
        </aside>

        <section className="space-y-4">
          {plan.tables.length === 0 ? (
            <div className="suite-frame p-10 text-center space-y-2">
              <p className="font-serif text-2xl">No tables yet</p>
              <p className="text-sm text-muted-foreground">
                Add a table for each one in the room, pick round or rectangle, then drop guests into
                seats.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
              {plan.tables.map((table) => (
                <TableCard
                  key={table.id}
                  table={table}
                  /* A long banquet table needs the room; a round of eight
                     doesn't. The grid follows the table, not the other way. */
                  wide={isWideTable(table)}
                  selectedGuest={selectedGuest}
                  selectedId={selected}
                  onSelectGuest={(rsvpId) => setSelected(selected === rsvpId ? null : rsvpId)}
                  onSeat={(rsvpId, seatIndex) => seat(rsvpId, table.id, seatIndex)}
                  onRename={(name) =>
                    commit(
                      {
                        ...plan,
                        tables: plan.tables.map((candidate) =>
                          candidate.id === table.id ? { ...candidate, name } : candidate
                        ),
                      },
                      () => renameTable({ tableId: table.id, name })
                    )
                  }
                  onReshape={(shape) =>
                    commit(reshapeTablePlan(plan, table.id, shape), () =>
                      reshapeTable({ tableId: table.id, ...shape })
                    )
                  }
                  onEmpty={() =>
                    commit(clearTable(plan, table.id), () => emptySeatingTable(table.id))
                  }
                  onRemove={() => {
                    if (
                      !window.confirm(
                        `Delete ${table.name}? Anyone sitting there goes back to the unseated list.`
                      )
                    ) {
                      return;
                    }
                    commit(removeTable(plan, table.id), () => removeSeatingTable(table.id));
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

/** The shape and seat counts a table can be changed to. */
type TableLayout = Pick<SeatingTable, "shape" | "seats" | "sides">;

interface TableCardProps {
  table: SeatingTable;
  /** Whether this table claims a whole row of the chart. */
  wide: boolean;
  selectedGuest: SeatingGuest | null;
  selectedId: string | null;
  onSelectGuest: (rsvpId: string) => void;
  onSeat: (rsvpId: string, seat: number) => void;
  onRename: (name: string) => void;
  onReshape: (layout: TableLayout) => void;
  onEmpty: () => void;
  onRemove: () => void;
}

const TableCard: FC<TableCardProps> = ({
  table,
  wide,
  selectedGuest,
  selectedId,
  onSelectGuest,
  onSeat,
  onRename,
  onReshape,
  onEmpty,
  onRemove,
}) => {
  const layout: TableLayout = { shape: table.shape, seats: table.seats, sides: table.sides };
  const capacity = tableCapacity(table);
  const openSeat = firstFreeSeat(table);

  /**
   * The name and seat inputs are uncontrolled, keyed on the value the server
   * sent: typing is local until it's committed, and a `key` change remounts the
   * input with the saved value rather than fighting a keystroke mid-edit.
   */
  const commitName = (input: HTMLInputElement) => {
    const trimmed = input.value.trim().slice(0, TABLE_NAME_MAX);

    // An empty name would leave an unlabelled table; put the old one back.
    if (!trimmed) {
      input.value = table.name;
      return;
    }

    input.value = trimmed;
    if (trimmed !== table.name) onRename(trimmed);
  };

  /** Clamp a typed count and report it only when it actually changed. */
  const commitCount = (input: HTMLInputElement, current: number, min: number, max: number) => {
    const parsed = Number.parseInt(input.value, 10);

    if (!Number.isFinite(parsed)) {
      input.value = String(current);
      return null;
    }

    const clamped = Math.min(max, Math.max(min, parsed));
    input.value = String(clamped);
    return clamped === current ? null : clamped;
  };

  return (
    <div
      className={cn(
        // `min-w-0`: a grid item sizes to its content by default, which would
        // let a wide table stretch the card and scroll the whole page
        // sideways instead of scrolling inside the diagram.
        "suite-frame p-4 space-y-3 min-w-0",
        wide && "lg:col-span-2 2xl:col-span-3"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <input
          key={table.name}
          defaultValue={table.name}
          maxLength={TABLE_NAME_MAX}
          onBlur={(event) => commitName(event.currentTarget)}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
            if (event.key === "Escape") event.currentTarget.value = table.name;
          }}
          aria-label={`Name of ${table.name}`}
          className="font-serif text-xl bg-transparent border-b border-transparent hover:border-sage/40 focus:border-hydrangea focus:outline-none min-w-0 flex-1"
        />

        <div className="flex items-center gap-0.5 shrink-0">
          {table.seated.length > 0 && (
            <button
              type="button"
              onClick={onEmpty}
              title={`Empty ${table.name}`}
              aria-label={`Empty ${table.name}`}
              className="p-1.5 text-muted-foreground hover:text-foreground"
            >
              <Eraser className="w-4 h-4" aria-hidden />
            </button>
          )}
          <button
            type="button"
            onClick={onRemove}
            title={`Delete ${table.name}`}
            aria-label={`Delete ${table.name}`}
            className="p-1.5 text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="w-4 h-4" aria-hidden />
          </button>
        </div>
      </div>

      {/* Shape first: it decides which seat inputs are worth showing. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1" role="group" aria-label={`Shape of ${table.name}`}>
          {(Object.keys(TABLE_SHAPES) as TableShape[]).map((shape) => (
            <button
              key={shape}
              type="button"
              onClick={() => shape !== table.shape && onReshape({ ...layout, shape })}
              aria-pressed={shape === table.shape}
              className={cn(
                "suite-label text-[0.65rem] px-2 py-1 rounded-sm transition-colors",
                shape === table.shape
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {TABLE_SHAPES[shape].label}
            </button>
          ))}
        </div>

        {table.shape === "round" ? (
          <label className="flex items-center gap-1">
            <input
              key={table.seats}
              type="number"
              inputMode="numeric"
              min={MIN_TABLE_SEATS}
              max={MAX_TABLE_SEATS}
              defaultValue={table.seats}
              onBlur={(event) => {
                const seats = commitCount(
                  event.currentTarget,
                  table.seats,
                  MIN_TABLE_SEATS,
                  MAX_TABLE_SEATS
                );
                if (seats !== null) onReshape({ ...layout, seats });
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
                if (event.key === "Escape") event.currentTarget.value = String(table.seats);
              }}
              aria-label={`Seats around ${table.name}`}
              className="w-12 bg-transparent border-b border-transparent hover:border-sage/40 focus:border-hydrangea focus:outline-none text-center"
            />
            seats
          </label>
        ) : (
          // Per side, because that's what fixes which chair a guest is in: a
          // rectangle of ten is a different room at 5+5 than at 4+4+1+1.
          <div className="flex flex-wrap items-center gap-2">
            {SIDE_KEYS.map((side) => (
              <label key={side} className="flex items-center gap-1">
                <span className="sr-only">{`${SIDE_LABELS[side]} seats at ${table.name}`}</span>
                <span aria-hidden>{SIDE_LABELS[side].replace(" end", "")}</span>
                <input
                  key={table.sides[side]}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={MAX_SIDE_SEATS}
                  defaultValue={table.sides[side]}
                  onBlur={(event) => {
                    const count = commitCount(
                      event.currentTarget,
                      table.sides[side],
                      0,
                      MAX_SIDE_SEATS
                    );
                    if (count !== null) {
                      onReshape({ ...layout, sides: { ...table.sides, [side]: count } });
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") event.currentTarget.blur();
                    if (event.key === "Escape") {
                      event.currentTarget.value = String(table.sides[side]);
                    }
                  }}
                  className="w-10 bg-transparent border-b border-transparent hover:border-sage/40 focus:border-hydrangea focus:outline-none text-center"
                />
              </label>
            ))}
          </div>
        )}
      </div>

      <TableDiagram
        table={table}
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

      {selectedGuest && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          disabled={openSeat === null}
          onClick={() => openSeat !== null && onSeat(selectedGuest.rsvpId, openSeat)}
        >
          {openSeat === null
            ? `${table.name} is full`
            : `Seat ${shortGuestName(selectedGuest)} in seat ${openSeat + 1}`}
        </Button>
      )}
    </div>
  );
};

interface SeatButtonProps {
  slot: DiagramSeat;
  tableName: string;
  selectedGuest: SeatingGuest | null;
  selectedId: string | null;
  onSelectGuest: (rsvpId: string) => void;
  onSeat: (rsvpId: string, seat: number) => void;
}

/**
 * One seat: a drop target, and a button.
 *
 * Clicking an empty seat puts the selected guest in it; clicking an occupied
 * one selects whoever is sitting there, so the next click moves them. That's
 * the whole interaction on a touchscreen, where no drag event ever fires.
 */
const SeatButton: FC<SeatButtonProps> = ({
  slot,
  tableName,
  selectedGuest,
  selectedId,
  onSelectGuest,
  onSeat,
}) => {
  const [over, setOver] = useState(false);
  const { guest, seat } = slot;
  const number = seat + 1;

  const swapping = guest && selectedGuest && selectedGuest.rsvpId !== guest.rsvpId;

  const label = guest
    ? `Seat ${number} at ${tableName}, ${guestName(guest)}${swapping ? ` — swap with ${guestName(selectedGuest)}` : ""}`
    : selectedGuest
      ? `Seat ${number} at ${tableName}, empty — seat ${guestName(selectedGuest)} here`
      : `Seat ${number} at ${tableName}, empty`;

  return (
    <button
      type="button"
      draggable={guest !== null}
      onDragStart={guest ? (event) => startGuestDrag(event, guest.rsvpId) : undefined}
      onDragOver={(event) => {
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        const rsvpId = draggedGuestId(event);
        if (rsvpId) onSeat(rsvpId, seat);
      }}
      onClick={() => {
        // An occupied seat selects its guest; an empty one takes the selection.
        if (selectedGuest && (!guest || guest.rsvpId !== selectedGuest.rsvpId)) {
          onSeat(selectedGuest.rsvpId, seat);
        } else if (guest) {
          onSelectGuest(guest.rsvpId);
        }
      }}
      title={
        guest
          ? [
              guestName(guest),
              guest.mealName,
              guest.allergyNotes && `Allergy: ${guest.allergyNotes}`,
            ]
              .filter(Boolean)
              .join(" · ")
          : label
      }
      aria-label={label}
      aria-pressed={guest ? selectedId === guest.rsvpId : undefined}
      className={cn(
        "w-full px-1 py-1 rounded-sm border text-[0.65rem] leading-tight transition-colors",
        guest ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        over
          ? "border-hydrangea bg-hydrangea-pale/60"
          : guest
            ? selectedId === guest.rsvpId
              ? "border-hydrangea bg-hydrangea-pale/40"
              : "border-sage/40 bg-background hover:border-sage"
            : "border-dashed border-sage/40 bg-background/60 text-muted-foreground hover:border-sage"
      )}
    >
      {guest ? (
        <span className="flex items-center justify-center gap-0.5">
          {/* Wrapping rather than truncating: on a crowded table a second line
              still reads, where a clipped one just loses the name. */}
          <span className="break-words">{shortGuestName(guest)}</span>
          {guest.allergyNotes && (
            <AlertTriangle className="w-2.5 h-2.5 shrink-0 text-hydrangea-deep" aria-hidden />
          )}
        </span>
      ) : (
        <span>{number}</span>
      )}
    </button>
  );
};
