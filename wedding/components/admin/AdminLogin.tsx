"use client";

import { FC, useActionState, useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAdmin, type AdminLoginState } from "@/app/admin/actions";

const INITIAL_STATE: AdminLoginState = { error: null };

interface AdminLoginProps {
  /** False when `ADMIN_PASSWORD` is missing, in which case no password can work. */
  configured: boolean;
}

export const AdminLogin: FC<AdminLoginProps> = ({ configured }) => {
  const [state, formAction, pending] = useActionState(loginAdmin, INITIAL_STATE);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <Lock className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
        <h1 className="font-serif text-4xl mb-2">Admin</h1>
        <p className="text-muted-foreground">RSVP responses for Sami &amp; Dexter</p>
      </div>

      {configured ? (
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-password">Admin password</Label>
            <div className="relative">
              <Input
                id="admin-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter the admin password"
                className="w-full pr-10"
                autoComplete="current-password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {state.error && <p className="text-sm text-red-500">{state.error}</p>}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Checking…" : "Continue"}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground text-center">
          Admin access isn&apos;t configured yet. Set{" "}
          <code className="font-mono">ADMIN_PASSWORD</code> in the environment and redeploy.
        </p>
      )}
    </div>
  );
};
