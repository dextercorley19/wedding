import type { Metadata } from "next";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/common/Navigation";
import { FloralSprig } from "@/components/common/Floral";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { RsvpTable } from "@/components/admin/RsvpTable";
import { isAdminAuthenticated, isAdminConfigured } from "@/lib/admin-auth";
import { fetchRsvpRowsForEvent } from "@/lib/rsvp-queries";
import { parseRsvpEvent, RSVP_EVENTS, summarizeRsvps, type RsvpEvent } from "@/lib/rsvp-report";
import { cn } from "@/lib/utils";
import { logoutAdmin } from "./actions";

export const metadata: Metadata = {
  title: "Admin | Sami & Dexter",
  robots: { index: false, follow: false },
};

// Responses change as guests reply, and the page is gated on a cookie.
export const dynamic = "force-dynamic";

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="suite-frame p-5 text-center">
    <p className="suite-label text-xs text-sage-deep">{label}</p>
    <p className="font-serif text-4xl mt-1">{value}</p>
  </div>
);

const EVENT_TABS = Object.keys(RSVP_EVENTS) as RsvpEvent[];

/**
 * The three response tiles plus one per dinner option — five for the wedding,
 * six for the rehearsal dinner. Spelled out rather than interpolated, since
 * Tailwind only ships class names it can find in the source.
 */
const statColumns = (tiles: number) => (tiles > 5 ? "lg:grid-cols-6" : "lg:grid-cols-5");

/**
 * One tab per guest list. Plain links rather than client state, so each tab is
 * its own server render (and its own shareable URL).
 */
const EventTabs = ({ active }: { active: RsvpEvent }) => (
  <div className="flex justify-center">
    <div className="inline-flex items-center gap-1 border-b border-sage/25">
      {EVENT_TABS.map((event) => (
        <Link
          key={event}
          href={event === "wedding" ? "/admin" : `/admin?event=${event}`}
          aria-current={event === active ? "page" : undefined}
          className={cn(
            "suite-label text-xs px-4 py-2 -mb-px border-b-2 transition-colors",
            event === active
              ? "border-hydrangea text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {RSVP_EVENTS[event].label}
        </Link>
      ))}
    </div>
  </div>
);

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  if (!(await isAdminAuthenticated())) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-28 pb-20 px-4">
          <AdminLogin configured={isAdminConfigured()} />
        </div>
      </div>
    );
  }

  const event = parseRsvpEvent((await searchParams).event);
  const rows = await fetchRsvpRowsForEvent(event);
  const summary = summarizeRsvps(rows, event);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-6xl space-y-8">
          <div className="text-center space-y-3">
            <FloralSprig />
            <p className="suite-label text-sage-deep">Guest List</p>
            <h1 className="font-serif text-5xl md:text-6xl">RSVPs</h1>
          </div>

          <EventTabs active={event} />

          <div
            className={cn(
              "grid grid-cols-2 gap-4 sm:grid-cols-3",
              statColumns(3 + summary.meals.length)
            )}
          >
            <Stat label="Responses" value={summary.total} />
            <Stat label="Attending" value={summary.attending} />
            <Stat label="Declined" value={summary.declined} />
            {summary.meals.map((meal) => (
              <Stat key={meal.value} label={meal.name} value={meal.count} />
            ))}
          </div>

          {summary.missingMeal > 0 && (
            <p className="text-sm text-muted-foreground text-center">
              {summary.missingMeal} attending{" "}
              {summary.missingMeal === 1 ? "guest has" : "guests have"} no dinner selection on file.
            </p>
          )}

          <RsvpTable rows={rows} event={event} />

          <form action={logoutAdmin} className="flex justify-center pt-4">
            <Button type="submit" variant="ghost" size="sm">
              <LogOut className="w-4 h-4" />
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
