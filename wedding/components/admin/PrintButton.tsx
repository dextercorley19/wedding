"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Opens the browser's print dialog, which is also how the layout is saved as a
 * PDF to send on. A client component purely for the one `window.print()` call,
 * so the page around it stays a server render.
 */
export const PrintButton = ({ label = "Print" }: { label?: string }) => (
  <Button type="button" size="sm" onClick={() => window.print()}>
    <Printer className="w-4 h-4" />
    {label}
  </Button>
);
