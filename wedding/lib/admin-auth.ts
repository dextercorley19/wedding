import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Admin auth for the RSVP dashboard.
 *
 * The guest-facing gate (`GlobalPasswordGate`) checks a `NEXT_PUBLIC_` password
 * in the browser, which is fine for a "don't index this" curtain but useless
 * for guest contact details. Admin access is therefore checked on the server
 * with a password that never reaches the client bundle.
 */

export const ADMIN_COOKIE = "wedding-admin";

/** Session lifetime — long enough to work through a seating chart, short enough to expire. */
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12;

/** Signed payload; bumping it invalidates every existing session. */
const SESSION_PAYLOAD = "wedding-admin-v1";

const adminPassword = () => {
  const password = process.env.ADMIN_PASSWORD?.trim();
  return password ? password : null;
};

/** False when `ADMIN_PASSWORD` is unset — the dashboard then refuses everyone. */
export const isAdminConfigured = () => adminPassword() !== null;

/**
 * Constant-time comparison. Hashing first gives both sides a fixed length, so
 * `timingSafeEqual` never throws on a mismatched-length guess.
 */
const equals = (a: string, b: string) =>
  timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());

/**
 * The cookie value: an HMAC of a fixed payload keyed by the password. It can't
 * be forged without the password, and rotating the password logs everyone out.
 */
const sessionToken = (password: string) =>
  createHmac("sha256", password).update(SESSION_PAYLOAD).digest("hex");

export const verifyAdminPassword = (candidate: string) => {
  const password = adminPassword();
  return password !== null && equals(candidate, password);
};

/** Cookie options shared by the login action; scoped to `/admin` so it never rides along elsewhere. */
export const adminCookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/admin",
  maxAge: ADMIN_SESSION_MAX_AGE,
});

export const adminCookieValue = () => {
  const password = adminPassword();
  if (!password) {
    throw new Error("ADMIN_PASSWORD must be set before issuing an admin session");
  }
  return sessionToken(password);
};

export async function isAdminAuthenticated() {
  const password = adminPassword();
  if (!password) {
    return false;
  }

  const cookie = (await cookies()).get(ADMIN_COOKIE)?.value;
  return cookie !== undefined && equals(cookie, sessionToken(password));
}
