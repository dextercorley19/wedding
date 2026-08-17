import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/common/Navigation";
import { FloralSprig } from "@/components/common/Floral";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { RsvpTable } from "@/components/admin/RsvpTable";
import { isAdminAuthenticated, isAdminConfigured } from "@/lib/admin-auth";
import { fetchRsvpRows } from "@/lib/rsvp-queries";
import { summarizeRsvps } from "@/lib/rsvp-report";
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

export default async function AdminPage() {
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

  const rows = await fetchRsvpRows();
  const summary = summarizeRsvps(rows);

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

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
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

          <RsvpTable rows={rows} />

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
