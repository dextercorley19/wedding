import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { PrintButton } from "@/components/admin/PrintButton";
import { diagramSizeRem } from "@/components/admin/TableDiagram";
import { PrintedTable } from "@/components/admin/PrintedTable";
import { isAdminAuthenticated, isAdminConfigured } from "@/lib/admin-auth";
import { fetchSeatingPlan } from "@/lib/seating-queries";
import { cn } from "@/lib/utils";
import {
  fitToPrintedPage,
  guestName,
  isWideTable,
  summarizeSeating,
  tableCapacity,
  TABLE_SHAPES,
  type SeatingGuest,
} from "@/lib/seating";

export const metadata: Metadata = {
  title: "Seating Layout | Sami & Dexter",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** The wedding is in Newport Beach — date the sheet the way the couple reads it. */
const printedOn = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Los_Angeles",
  dateStyle: "long",
});

/**
 * The seating chart as a sheet to print or save as a PDF for the planners.
 *
 * Deliberately the same `TableDiagram` the interactive chart draws, so what the
 * planners hold is the arrangement the couple made — seat 7 in the same chair —
 * rather than a second rendering that can drift. Full names here, since there's
 * no hover on paper. No navigation chrome: this page is the handout.
 */
export default async function SeatingPrintPage() {
  if (!(await isAdminAuthenticated())) {
    return (
      <div className="min-h-screen bg-background px-4 py-16">
        <AdminLogin configured={isAdminConfigured()} />
      </div>
    );
  }

  const plan = await fetchSeatingPlan();
  const summary = summarizeSeating(plan);
  const withAllergies = [
    ...plan.tables.flatMap((table) => table.seated.map((entry) => entry.guest)),
    ...plan.unseated,
  ].filter((guest) => guest.allergyNotes);

  return (
    <div className="seating-print min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-10 print:px-0 print:py-0">
        {/* On screen only: the way back, and the print button. */}
        <div className="flex items-center justify-between gap-3 pb-8 print:hidden">
          <Link
            href="/admin/seating"
            className="suite-label text-xs flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden />
            Back to the chart
          </Link>
          <PrintButton label="Print or save as PDF" />
        </div>

        <header className="text-center space-y-1 pb-8">
          <p className="suite-label text-xs text-sage-deep">The Night Before</p>
          <h1 className="font-serif text-4xl">Seating Layout</h1>
          <p className="text-sm text-muted-foreground">
            {summary.seated} of {summary.total} guests seated · {plan.tables.length}{" "}
            {plan.tables.length === 1 ? "table" : "tables"} · {summary.capacity} seats · as of{" "}
            {printedOn.format(new Date())}
          </p>
        </header>

        {plan.tables.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">
            No tables have been laid out yet.
          </p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2">
            {plan.tables.map((table) => (
              <section
                key={table.id}
                className={cn(
                  "seating-table space-y-2 min-w-0",
                  isWideTable(table) && "sm:col-span-2"
                )}
              >
                <h2 className="text-center space-y-0.5">
                  <span className="block font-serif text-2xl">{table.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {TABLE_SHAPES[table.shape].label} · {table.seated.length} of{" "}
                    {tableCapacity(table)} seats
                    {fitToPrintedPage(diagramSizeRem(table)).rotated && " · turned sideways to fit"}
                  </span>
                </h2>

                <PrintedTable table={table} />
              </section>
            ))}
          </div>
        )}

        {/* The kitchen's copy of the allergy notes — a triangle on a seat says
            there's something to know, but not what it is. */}
        {withAllergies.length > 0 && (
          <section className="seating-table pt-10 space-y-2">
            <h2 className="suite-label text-xs text-sage-deep flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-hydrangea-deep" aria-hidden />
              Allergies &amp; restrictions
            </h2>
            <ul className="text-sm space-y-1">
              {withAllergies.map((guest: SeatingGuest) => (
                <li key={guest.rsvpId}>
                  <span className="font-medium">{guestName(guest)}</span>
                  {" — "}
                  <span className="text-muted-foreground">{guest.allergyNotes}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {plan.unseated.length > 0 && (
          <section className="seating-table pt-10 space-y-2">
            <h2 className="suite-label text-xs text-sage-deep">
              Not yet seated ({plan.unseated.length})
            </h2>
            <ul className="text-sm text-muted-foreground columns-2 sm:columns-3">
              {plan.unseated.map((guest) => (
                <li key={guest.rsvpId}>{guestName(guest)}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
