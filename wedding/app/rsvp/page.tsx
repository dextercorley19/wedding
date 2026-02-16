"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PasswordGate } from "@/components/rsvp/PasswordGate";
import { RSVPForm } from "@/components/rsvp/RSVPForm";
import { SuccessMessage } from "@/components/rsvp/SuccessMessage";

type PageState = "password" | "form" | "success" | "loading";

interface TokenData {
  firstName: string;
  lastName: string;
  email: string;
}

function RSVPPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [pageState, setPageState] = useState<PageState>(token ? "loading" : "password");
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [tokenError, setTokenError] = useState("");
  const [attendance, setAttendance] = useState<"yes" | "no">("yes");

  // Validate token on mount
  useEffect(() => {
    if (token) {
      validateToken();
    }
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await fetch(`/api/invites/validate?token=${token}`);
      if (!response.ok) {
        setTokenError("Invalid or expired invitation link");
        setPageState("password");
        return;
      }

      const data = await response.json();
      setTokenData(data.guest);
      setPageState("form");
    } catch (error) {
      console.error("Error validating token:", error);
      setTokenError("Failed to validate invitation");
      setPageState("password");
    }
  };

  if (pageState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading your invitation...</p>
        </div>
      </div>
    );
  }

  if (pageState === "password") {
    return <PasswordGate onAuthenticated={() => setPageState("form")} error={tokenError} />;
  }

  if (pageState === "success") {
    return <SuccessMessage attendance={attendance} />;
  }

  return (
    <RSVPForm
      prefilledData={tokenData}
      token={token}
      onSuccess={() => {
        setPageState("success");
      }}
    />
  );
}

export default function RSVPPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RSVPPageContent />
    </Suspense>
  );
}
