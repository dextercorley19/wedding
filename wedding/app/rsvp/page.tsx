"use client";

import { useState } from "react";
import { PasswordGate } from "@/components/rsvp/PasswordGate";
import { RSVPForm } from "@/components/rsvp/RSVPForm";
import { SuccessMessage } from "@/components/rsvp/SuccessMessage";

type PageState = "password" | "form" | "success";

export default function RSVPPage() {
  const [pageState, setPageState] = useState<PageState>("password");
  const [attendance, setAttendance] = useState<"yes" | "no">("yes");

  if (pageState === "password") {
    return (
      <PasswordGate
        onAuthenticated={() => setPageState("form")}
      />
    );
  }

  if (pageState === "success") {
    return (
      <SuccessMessage attendance={attendance} />
    );
  }

  return (
    <RSVPForm
      onSuccess={() => {
        setPageState("success");
      }}
    />
  );
}
