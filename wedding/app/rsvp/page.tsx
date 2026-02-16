"use client";

import { useState } from "react";
import { PasswordGate } from "@/components/rsvp/PasswordGate";
import { RSVPForm } from "@/components/rsvp/RSVPForm";

export default function RSVPPage() {
  const [authenticated, setAuthenticated] = useState(false);

  if (!authenticated) {
    return <PasswordGate onAuthenticated={() => setAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-serif mb-2">
            Sami & Dexter
          </h1>
          <p className="text-lg text-muted-foreground">June 15, 2025</p>
        </div>

        <RSVPForm />
      </div>
    </div>
  );
}
