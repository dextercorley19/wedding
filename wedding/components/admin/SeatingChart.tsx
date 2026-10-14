"use client";

import { FC, useMemo, useOptimistic, useState, useTransition, type DragEvent } from "react";
import {
  AlertTriangle,
  Download,
  Eraser,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  UserMinus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addSeatingTable,
  clearSeatingChart,
  emptySeatingTable,
  moveGuest,
  removeSeatingTable,
  renameTable,
  setTableSeats,
  type SeatingActionResult,
} from "@/app/admin/seating/actions";
import {
  clearTable,
  findSeat,
  guestName,
  matchesSeatingQuery,
  MAX_TABLE_SEATS,
  MIN_TABLE_SEATS,
  placeGuest,
  removeTable,
  summarizeSeating,
  TABLE_NAME_MAX,
  type SeatingGuest,
  type SeatingPlan,
  type SeatingTable,
} from "@/lib/seating";
import { cn } from "@/lib/utils";

/**
 * The rehearsal dinner seating chart.
 *
 * Guests move three ways, because one of them always fails somewhere: drag and
 * drop with a mouse, tap a guest then tap a table on a phone (HTML5 drag
 * events don't fire on touch), and the same two taps with a keyboard, since the
 * guest chips and the "Seat here" buttons are real buttons.
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
 * The dragged guest's id, if this drag started on a guest chip.
 *
 * The id goes onto the drag twice: under our own type, and as `text/plain` for
 * Safari, which has been unreliable about custom MIME types. Reading our type
 * first means text dragged in from elsewhere falls through to the id check —
 * and an id that isn't a guest's is a no-op in `placeGuest` anyway.
 */
const draggedGuestId = (event: DragEvent) =>
  event.dataTransfer.getData(DRAG_TYPE) || event.dataTransfer.getData("text/plain");

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

interface GuestChipProps {
  guest: SeatingGuest;
  selected: boolean;
  onSelect: () => void;
  /** Present for a seated guest: send them back to the unseated list. */
  onUnseat?: () => void;
  /** Dropping onto a seated guest seats the dragged one in front of them. */
  onDropBefore?: (rsvpId: string) => void;
}

const GuestChip: FC<GuestChipProps> = ({ guest, selected, onSelect, onUnseat, onDropBefore }) => {
  const [over, setOver] = useState(false);

  return (
    <div
      className={cn("flex items-center gap-1", over && "border-t-2 border-hydrangea")}
      onDragOver={
        onDropBefore &&
        ((event) => {
          event.preventDefault();
          setOver(true);
        })
      }
      onDragLeave={onDropBefore && (() => setOver(false))}
      onDrop={
        onDropBefore &&
        ((event) => {
          setOver(false);
          const rsvpId = draggedGuestId(event);
          if (!rsvpId) return;
          // Stop the table underneath from also handling it and appending.
          event.preventDefault();
          event.stopPropagation();
          onDropBefore(rsvpId);
        })
      }
    >
      <button
        type="button"
        draggable
        onDragStart={(event) => {
          event.dataTransfer.setData(DRAG_TYPE, guest.rsvpId);
          event.dataTransfer.setData("text/plain", guest.rsvpId);
          event.dataTransfer.effectAllowed = "move";
        }}
        onClick={onSelect}
        aria-pressed={selected}
        className={cn(
          "flex-1 min-w-0 text-left px-2.5 py-1.5 rounded-sm border transition-colors cursor-grab active:cursor-grabbing",
          selected
            ? "border-hydrangea bg-hydrangea-pale/40"
            : "border-sage/25 bg-background hover:border-sage/60"
        )}
      >
        <span className="block truncate text-sm">{guestName(guest)}</span>
        <MealAndAllergy guest={guest} />
      </button>

      {onUnseat && (
        <button
          type="button"
          onClick={onUnseat}
          title={`Unseat ${guestName(guest)}`}
          aria-label={`Unseat ${guestName(guest)}`}
          className="p-1 text-muted-foreground hover:text-foreground"
        >
          <UserMinus className="w-3.5 h-3.5" aria-hidden />
        </button>
      )}
    </div>
  );
};

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

  const selectedGuest = useMemo(
    () =>
      selected
        ? ([...plan.unseated, ...plan.tables.flatMap((table) => table.guests)].find(
            (guest) => guest.rsvpId === selected
          ) ?? null)
        : null,
    [selected, plan]
  );

  const seat = (rsvpId: string, tableId: string | null, index?: number) => {
    // A no-op drop (same table, same spot) shouldn't cost a round trip.
    const current = findSeat(plan, rsvpId);
    const unchanged =
      tableId === null
        ? current === null
        : current?.tableId === tableId && (index === undefined || current.index === index);

    setSelected(null);
    if (unchanged) return;

    commit(placeGuest(plan, rsvpId, tableId, index), () => moveGuest({ rsvpId, tableId, index }));
  };

  const summary = summarizeSeating(plan);
  const visibleUnseated = plan.unseated.filter((guest) => matchesSeatingQuery(guest, query));

  /** The drop handler every table card and the unseated panel share. */
  const dropHandler = (tableId: string | null, index?: number) => (event: DragEvent) => {
    // These panels opt into drops, so anything let go over one — a file, a link
    // — would otherwise be opened by the browser and lose the chart.
    event.preventDefault();

    const rsvpId = draggedGuestId(event);
    if (rsvpId) seat(rsvpId, tableId, index);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          {summary.seated} of {summary.total} attending {summary.total === 1 ? "guest" : "guests"}{" "}
          seated
          {plan.tables.length > 0 && (
            <> across {plan.tables.length === 1 ? "1 table" : `${plan.tables.length} tables`}</>
          )}
          {summary.overfilled > 0 && (
            <>
              {" — "}
              <span className="text-hydrangea-deep">{summary.overfilled} over capacity</span>
            </>
          )}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setError(null);
              // The new table's id comes from the server, so there's nothing to
              // predict locally — the revalidated render brings it in.
              startTransition(async () => {
                const result = await addSeatingTable();
                if (!result.success) setError(result.error);
              });
            }}
          >
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
        <p className="text-sm text-center text-muted-foreground" aria-live="polite">
          <span className="text-foreground">{guestName(selectedGuest)}</span> selected — choose
          &ldquo;Seat here&rdquo; on a table, or drag them where you want them.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[20rem_1fr] items-start">
        {/* The unseated pool, and the drop target for taking someone out. */}
        <aside
          className="suite-frame p-4 space-y-3"
          onDragOver={(event) => event.preventDefault()}
          onDrop={dropHandler(null)}
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
                Add a table for each one in the room, then drag guests onto it.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {plan.tables.map((table) => (
                <TableCard
                  key={table.id}
                  table={table}
                  selectedGuest={selectedGuest}
                  selectedId={selected}
                  onSelectGuest={(rsvpId) => setSelected(selected === rsvpId ? null : rsvpId)}
                  onDrop={dropHandler(table.id)}
                  onDropBefore={(rsvpId, index) => seat(rsvpId, table.id, index)}
                  onSeatSelected={() => selectedGuest && seat(selectedGuest.rsvpId, table.id)}
                  onUnseat={(rsvpId) => seat(rsvpId, null)}
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
                  onSeatsChange={(seats) =>
                    commit(
                      {
                        ...plan,
                        tables: plan.tables.map((candidate) =>
                          candidate.id === table.id ? { ...candidate, seats } : candidate
                        ),
                      },
                      () => setTableSeats({ tableId: table.id, seats })
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

interface TableCardProps {
  table: SeatingTable;
  selectedGuest: SeatingGuest | null;
  selectedId: string | null;
  onSelectGuest: (rsvpId: string) => void;
  onDrop: (event: DragEvent) => void;
  onDropBefore: (rsvpId: string, index: number) => void;
  onSeatSelected: () => void;
  onUnseat: (rsvpId: string) => void;
  onRename: (name: string) => void;
  onSeatsChange: (seats: number) => void;
  onEmpty: () => void;
  onRemove: () => void;
}

const TableCard: FC<TableCardProps> = ({
  table,
  selectedGuest,
  selectedId,
  onSelectGuest,
  onDrop,
  onDropBefore,
  onSeatSelected,
  onUnseat,
  onRename,
  onSeatsChange,
  onEmpty,
  onRemove,
}) => {
  const [over, setOver] = useState(false);

  const overCapacity = table.guests.length > table.seats;

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

  const commitSeats = (input: HTMLInputElement) => {
    const parsed = Number.parseInt(input.value, 10);

    if (!Number.isFinite(parsed)) {
      input.value = String(table.seats);
      return;
    }

    const clamped = Math.min(MAX_TABLE_SEATS, Math.max(MIN_TABLE_SEATS, parsed));
    input.value = String(clamped);
    if (clamped !== table.seats) onSeatsChange(clamped);
  };

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        setOver(false);
        onDrop(event);
      }}
      className={cn(
        "suite-frame p-4 space-y-3 transition-colors",
        over && "bg-hydrangea-pale/30",
        overCapacity && "ring-1 ring-hydrangea"
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
          {table.guests.length > 0 && (
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

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className={cn(overCapacity && "text-hydrangea-deep")}>
          {table.guests.length} seated
        </span>
        <span aria-hidden>/</span>
        <label className="flex items-center gap-1">
          <input
            type="number"
            inputMode="numeric"
            min={MIN_TABLE_SEATS}
            max={MAX_TABLE_SEATS}
            key={table.seats}
            defaultValue={table.seats}
            onBlur={(event) => commitSeats(event.currentTarget)}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
              if (event.key === "Escape") event.currentTarget.value = String(table.seats);
            }}
            aria-label={`Seats at ${table.name}`}
            className="w-12 bg-transparent border-b border-transparent hover:border-sage/40 focus:border-hydrangea focus:outline-none text-center"
          />
          seats
        </label>
        {overCapacity && <span className="text-hydrangea-deep">over capacity</span>}
      </div>

      <div className="space-y-1.5 min-h-24">
        {table.guests.map((guest, index) => (
          <GuestChip
            key={guest.rsvpId}
            guest={guest}
            selected={selectedId === guest.rsvpId}
            onSelect={() => onSelectGuest(guest.rsvpId)}
            onUnseat={() => onUnseat(guest.rsvpId)}
            onDropBefore={(rsvpId) => onDropBefore(rsvpId, index)}
          />
        ))}

        {table.guests.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">Drag guests here</p>
        )}
      </div>

      {selectedGuest && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onSeatSelected}
        >
          Seat {guestName(selectedGuest)} here
        </Button>
      )}
    </div>
  );
};
