"use client";

import { FC } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/common/Navigation";

interface SuccessMessageProps {
  attendance: "yes" | "no";
}

export const SuccessMessage: FC<SuccessMessageProps> = ({ attendance }) => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-16 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md px-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="font-serif text-4xl mb-4">Thank You!</h1>
          <p className="text-lg text-muted-foreground mb-8">
            {attendance === "yes"
              ? "We're so excited to celebrate with you on our special day!"
              : "We'll miss you on our special day, but we understand."}
          </p>
          <Button asChild variant="outline">
            <a href="/">Return Home</a>
          </Button>
        </div>
      </div>
    </div>
  );
};
