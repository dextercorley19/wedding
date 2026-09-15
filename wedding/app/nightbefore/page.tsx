import type { Metadata } from "next";
import { RSVPForm } from "@/components/rsvp/RSVPForm";
import { Navigation } from "@/components/common/Navigation";
import { FloralSprig } from "@/components/common/Floral";

/**
 * The rehearsal dinner RSVP, at `/nightbefore`.
 *
 * Not a subset of the wedding guest list: the URL is shared only with the
 * people who are invited, so nothing on the site links here and the page asks
 * search engines not to index it. (The guest password gate in the root layout
 * still applies, same as every other public page.)
 */
export const metadata: Metadata = {
  title: "The Night Before | Sami & Dexter",
  robots: { index: false, follow: false },
};

export default function RehearsalDinnerRsvpPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-28 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10 space-y-3">
            <FloralSprig />
            <p className="suite-label text-sage-deep">The Night Before</p>
            <h1 className="suite-script text-5xl md:text-6xl">Rehearsal Dinner</h1>
            <p className="suite-label text-muted-foreground">
              Friday, October 23, 2026 — Newport Beach
            </p>
            <p className="suite-label text-muted-foreground">Dinner at 5:00 PM</p>
            <p className="text-lg text-muted-foreground pt-2">
              We&rsquo;d love to have you the evening before. Kindly reply for each member of your
              party.
            </p>
            <p className="text-muted-foreground">
              If you&rsquo;re in the wedding party, the rehearsal runs from 4:00 to 5:00 PM, just
              before dinner.
            </p>
          </div>

          <RSVPForm variant="rehearsal" />
        </div>
      </div>
    </div>
  );
}
