import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navigation } from "@/components/common/Navigation";
import { FloralSprig } from "@/components/common/Floral";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { SeatingChart } from "@/components/admin/SeatingChart";
import { isAdminAuthenticated, isAdminConfigured } from "@/lib/admin-auth";
import { fetchSeatingPlan } from "@/lib/seating-queries";

export const metadata: Metadata = {
  title: "Seating Chart | Sami & Dexter",
  robots: { index: false, follow: false },
};

// The guest list changes as replies come in, and the page is gated on a cookie.
export const dynamic = "force-dynamic";

/**
 * Seating chart for the rehearsal dinner, built from that event's attending
 * guests. Behind the same admin password as the dashboard it links back to.
 */
export default async function SeatingPage() {
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

  const plan = await fetchSeatingPlan();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-7xl space-y-8">
          <div className="text-center space-y-3">
            <FloralSprig />
            <p className="suite-label text-sage-deep">The Night Before</p>
            <h1 className="font-serif text-5xl md:text-6xl">Seating Chart</h1>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Everyone attending the rehearsal dinner starts in the unseated list. Drag a guest onto
              a table — or tap a guest, then tap a table — and export the CSV to send the planners.
            </p>
          </div>

          <SeatingChart plan={plan} />

          <div className="flex justify-center pt-4">
            <Link
              href="/admin?event=rehearsal"
              className="suite-label text-xs flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden />
              Back to RSVPs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
