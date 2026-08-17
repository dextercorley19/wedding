"use client";

import { FC, useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DEFAULT_FILTERS,
  filterRsvpRows,
  type RsvpRow,
  type RsvpStatusFilter,
} from "@/lib/rsvp-report";
import { cn } from "@/lib/utils";

const STATUS_TABS: { value: RsvpStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "attending", label: "Attending" },
  { value: "declined", label: "Declined" },
];

interface RsvpTableProps {
  rows: RsvpRow[];
}

export const RsvpTable: FC<RsvpTableProps> = ({ rows }) => {
  const [status, setStatus] = useState<RsvpStatusFilter>(DEFAULT_FILTERS.status);
  const [query, setQuery] = useState(DEFAULT_FILTERS.query);

  const visibleRows = useMemo(() => filterRsvpRows(rows, { status, query }), [rows, status, query]);

  // The export route re-applies these filters server-side, so the download
  // always matches what's on screen.
  const exportParams = new URLSearchParams();
  if (status !== "all") exportParams.set("status", status);
  if (query.trim()) exportParams.set("q", query.trim());
  const exportHref = `/admin/export${exportParams.size ? `?${exportParams}` : ""}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatus(tab.value)}
              className={cn(
                "suite-label text-xs px-3 py-1.5 rounded-sm transition-colors",
                status === tab.value
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-pressed={status === tab.value}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, email, dinner"
              className="pl-9 sm:w-64"
              aria-label="Search RSVPs"
            />
          </div>

          {visibleRows.length === 0 ? (
            <Button disabled>
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          ) : (
            <Button asChild>
              <a href={exportHref}>
                <Download className="w-4 h-4" />
                Export CSV ({visibleRows.length})
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="suite-frame p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-sage/25">
                <th className="suite-label text-xs px-4 py-3 whitespace-nowrap">Guest</th>
                <th className="suite-label text-xs px-4 py-3 whitespace-nowrap">Email</th>
                <th className="suite-label text-xs px-4 py-3 whitespace-nowrap">Status</th>
                <th className="suite-label text-xs px-4 py-3 whitespace-nowrap">Dinner</th>
                <th className="suite-label text-xs px-4 py-3 whitespace-nowrap">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.firstName} {row.lastName}
                  </td>
                  {/* Nowrap over wrapping: the table already scrolls sideways,
                      and wrapped addresses make every row tall on a phone. */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <a href={`mailto:${row.email}`} className="text-hydrangea-deep hover:underline">
                      {row.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={cn(
                        "suite-label text-[0.65rem] px-2 py-1 rounded-sm",
                        row.attending
                          ? "bg-sage/20 text-sage-deep"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {row.attending ? "Attending" : "Declined"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {row.attending ? (row.mealName ?? "—") : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {row.submittedAt}
                  </td>
                </tr>
              ))}

              {visibleRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    {rows.length === 0 ? "No RSVPs yet." : "No RSVPs match this search."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
