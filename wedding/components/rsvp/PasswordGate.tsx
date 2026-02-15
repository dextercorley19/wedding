"use client";

import { FC, FormEvent, useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navigation } from "@/components/common/Navigation";

interface PasswordGateProps {
  onAuthenticated: () => void;
}

export const PasswordGate: FC<PasswordGateProps> = ({ onAuthenticated }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Fix: Only authenticate if password matches (was: || password.trim() !== "")
    if (password === process.env.NEXT_PUBLIC_RSVP_PASSWORD) {
      onAuthenticated();
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-16 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md px-4">
          <div className="text-center mb-8">
            <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h1 className="font-serif text-4xl mb-2">RSVP</h1>
            <p className="text-muted-foreground">
              Please enter the password from your invitation
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full"
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Your password was included in your wedding invitation
          </p>
        </div>
      </div>
    </div>
  );
};
