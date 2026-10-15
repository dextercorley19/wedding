"use client";

import { FC, useState, type DragEvent } from "react";
import { AlertTriangle } from "lucide-react";
import type { DiagramSeat } from "@/components/admin/TableDiagram";
import { guestName, shortGuestName, type SeatingGuest } from "@/lib/seating";
import { cn } from "@/lib/utils";

/**
 * The parts a guest is moved with: a chip in the unseated list, a seat at a
 * table, and the drag plumbing between them.
 *
 * Shared by the chart and the full-screen view of a single table, so a guest
 * behaves the same in both — the same drag, the same tap-to-select, the same
 * swap on a taken seat.
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
export const draggedGuestId = (event: DragEvent) =>
  event.dataTransfer.getData(DRAG_TYPE) || event.dataTransfer.getData("text/plain");

export const startGuestDrag = (event: DragEvent, rsvpId: string) => {
  event.dataTransfer.setData(DRAG_TYPE, rsvpId);
  event.dataTransfer.setData("text/plain", rsvpId);
  event.dataTransfer.effectAllowed = "move";
};

export const MealAndAllergy: FC<{ guest: SeatingGuest }> = ({ guest }) => (
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
export const GuestChip: FC<{
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
export const SeatButton: FC<SeatButtonProps> = ({
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
