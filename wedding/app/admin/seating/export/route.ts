import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { withBom } from "@/lib/csv";
import { seatingCsvFilename, seatingPlanToCsv } from "@/lib/seating";
import { fetchSeatingPlan } from "@/lib/seating-queries";

/**
 * The seating chart as a CSV to hand the planners: one row per guest, grouped
 * by table, with their dinner and any allergy alongside. Excel-safe the same
 * way the RSVP export is — UTF-8 BOM and formula-injection guards, both from
 * `lib/csv.ts`.
 */
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const csv = seatingPlanToCsv(await fetchSeatingPlan());

  return new NextResponse(withBom(csv), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${seatingCsvFilename(new Date())}"`,
      "Cache-Control": "no-store",
    },
  });
}
