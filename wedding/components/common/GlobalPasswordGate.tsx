"use client";

import { FC, ReactNode, useState, useSyncExternalStore } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navigation } from "@/components/common/Navigation";

interface GlobalPasswordGateProps {
  children: ReactNode;
}

const AUTH_KEY = "wedding-authenticated";

/**
 * Auth lives in localStorage, which the server can't see. Exposing it as an
 * external store (rather than reading it in an effect) keeps the server and
 * client renders consistent without deferring the read — a deferred read via
 * requestAnimationFrame never resolves in a background tab, leaving the page
 * blank until it is focused.
 */
const authListeners = new Set<() => void>();
const notifyAuthChanged = () => authListeners.forEach((listener) => listener());

const subscribeToAuth = (listener: () => void) => {
  authListeners.add(listener);
  // Keeps other tabs in sync; same-tab changes go through notifyAuthChanged.
  window.addEventListener("storage", notifyAuthChanged);
  return () => {
    authListeners.delete(listener);
    if (authListeners.size === 0) {
      window.removeEventListener("storage", notifyAuthChanged);
    }
  };
};

const getIsAuthenticated = () => localStorage.getItem(AUTH_KEY) === "true";

/** Never authenticated during SSR — there's no localStorage to read. */
const getIsAuthenticatedOnServer = () => false;

/** Resolves to false on the server and true once the client has hydrated. */
const subscribeToNothing = () => () => {};
const getHasHydrated = () => true;
const getHasHydratedOnServer = () => false;

export const GlobalPasswordGate: FC<GlobalPasswordGateProps> = ({ children }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const hasHydrated = useSyncExternalStore(
    subscribeToNothing,
    getHasHydrated,
    getHasHydratedOnServer
  );
  const isAuthenticated = useSyncExternalStore(
    subscribeToAuth,
    getIsAuthenticated,
    getIsAuthenticatedOnServer
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password === process.env.NEXT_PUBLIC_RSVP_PASSWORD) {
      localStorage.setItem(AUTH_KEY, "true");
      notifyAuthChanged();
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
      setPassword("");
    }
  };

  // Render nothing until hydration so guests never see the gate flash by.
  if (!hasHydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="pt-24 pb-16 flex items-center justify-center min-h-screen">
          <div className="w-full max-w-md px-4">
            <div className="text-center mb-8">
              <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h1 className="font-serif text-4xl mb-2">Sami & Dexter</h1>
              <p className="text-muted-foreground">
                Please enter the password from your invitation
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
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
  }

  return <>{children}</>;
};
