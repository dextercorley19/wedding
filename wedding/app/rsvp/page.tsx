"use client";

import { RSVPForm } from "@/components/rsvp/RSVPForm";
import { Navigation } from "@/components/common/Navigation";
import { FloralSprig } from "@/components/common/Floral";

export default function RSVPPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-28 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10 space-y-3">
            <FloralSprig />
            <h1 className="suite-script text-5xl md:text-6xl">Sami &amp; Dexter</h1>
            <p className="suite-label text-muted-foreground">
              Saturday, October 24, 2026 — Newport Beach
            </p>
            <p className="text-lg text-muted-foreground pt-2">
              Kindly reply for each member of your party.
            </p>
          </div>

          <RSVPForm />
        </div>
      </div>
    </div>
  );
}
