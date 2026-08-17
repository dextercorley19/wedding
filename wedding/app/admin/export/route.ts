import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { withBom } from "@/lib/csv";
import { fetchRsvpRows } from "@/lib/rsvp-queries";
import { csvFilename, filterRsvpRows, parseStatusFilter, rsvpRowsToCsv } from "@/lib/rsvp-report";

/**
 * CSV download for the admin dashboard. Accepts the same `status`/`q` filters
 * the table uses, so the file matches whatever the couple is looking at.
 */
export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const rows = filterRsvpRows(await fetchRsvpRows(), {
    status: parseStatusFilter(searchParams.get("status")),
    query: searchParams.get("q") ?? "",
  });

  return new NextResponse(withBom(rsvpRowsToCsv(rows)), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${csvFilename(new Date())}"`,
      "Cache-Control": "no-store",
    },
  });
}
