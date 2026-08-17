"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  adminCookieValue,
  isAdminConfigured,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export type AdminLoginState = { error: string | null };

export async function loginAdmin(
  _previous: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  if (!isAdminConfigured()) {
    return { error: "Admin access isn't configured — set ADMIN_PASSWORD and redeploy." };
  }

  const password = formData.get("password");

  if (typeof password !== "string" || !verifyAdminPassword(password)) {
    return { error: "Incorrect password." };
  }

  const store = await cookies();
  store.set({ name: ADMIN_COOKIE, value: adminCookieValue(), ...adminCookieOptions() });

  // Re-render the page as an authenticated request rather than patching state.
  redirect("/admin");
}

export async function logoutAdmin() {
  const store = await cookies();
  store.set({ name: ADMIN_COOKIE, value: "", ...adminCookieOptions(), maxAge: 0 });
  redirect("/admin");
}
