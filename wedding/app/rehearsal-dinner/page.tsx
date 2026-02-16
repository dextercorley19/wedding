"use client";

import type React from "react";
import { useState } from "react";
import { Lock, MapPin, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navigation } from "@/components/common/Navigation";

export default function RehearsalDinnerPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check - guests will have their unique password
    if (password === "wedding2025" || password.trim() !== "") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Please enter your password");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <Navigation />

        <div className="pt-24 pb-16 flex items-center justify-center min-h-screen">
          <div className="w-full max-w-md px-4">
            <div className="text-center mb-8">
              <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h1 className="font-serif text-4xl mb-2">Rehearsal Dinner</h1>
              <p className="text-muted-foreground">This page is for invited guests only</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full">
                Continue
              </Button>
            </form>

            <p className="text-sm text-muted-foreground text-center mt-6">
              Your password was included in your rehearsal dinner invitation
            </p>
            <p className="text-xs text-muted-foreground text-center mt-2">
              (Dev password: wedding2025)
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="font-serif text-5xl md:text-6xl mb-4">Rehearsal Dinner</h1>
            <p className="text-xl text-muted-foreground">Friday Evening</p>
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {/* Event Details */}
            <div className="space-y-8">
              <div>
                <div className="flex items-start gap-4 mb-6">
                  <Calendar className="w-6 h-6 text-muted-foreground mt-1" />
                  <div>
                    <h3 className="font-serif text-2xl mb-2">Date</h3>
                    <p className="text-muted-foreground">Friday, June 14, 2025</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 mb-6">
                  <Clock className="w-6 h-6 text-muted-foreground mt-1" />
                  <div>
                    <h3 className="font-serif text-2xl mb-2">Time</h3>
                    <p className="text-muted-foreground">6:00 PM - 9:00 PM</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cocktails at 6:00 PM, Dinner at 7:00 PM
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-muted-foreground mt-1" />
                  <div>
                    <h3 className="font-serif text-2xl mb-2">Location</h3>
                    <p className="text-muted-foreground mb-2">The Waterfront Restaurant</p>
                    <p className="text-sm text-muted-foreground">123 Harbor Drive</p>
                    <p className="text-sm text-muted-foreground mb-3">Maui, HI 96753</p>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href="https://maps.google.com/?q=Maui+Hawaii"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Get Directions
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-8">
              <div>
                <h3 className="font-serif text-2xl mb-4">Dress Code</h3>
                <p className="text-muted-foreground">Resort Casual</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Think sundresses, linen shirts, and comfortable footwear. The venue has a
                  beautiful oceanfront patio.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-2xl mb-4">What to Expect</h3>
                <p className="text-muted-foreground mb-3">
                  Join us for an intimate evening with our closest family and friends as we
                  celebrate the night before the wedding.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Welcome cocktails and appetizers</li>
                  <li>• Three-course dinner with wine pairings</li>
                  <li>• Toasts and stories (bring your favorites!)</li>
                  <li>• Dessert and coffee</li>
                </ul>
              </div>

              <div>
                <h3 className="font-serif text-2xl mb-4">RSVP</h3>
                <p className="text-muted-foreground mb-3">
                  Please confirm your attendance by May 1, 2025
                </p>
                <Button asChild>
                  <a href="/rsvp">RSVP Now</a>
                </Button>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="mt-16 p-6 bg-muted/50 rounded-lg">
            <h3 className="font-serif text-xl mb-3">Questions?</h3>
            <p className="text-muted-foreground text-sm">
              If you have any questions about the rehearsal dinner, please reach out to our wedding
              planner at planner@example.com or call (555) 123-4567.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
