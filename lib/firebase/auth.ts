import { cache } from "react";
import { cookies } from "next/headers";
import { getAdminAuth } from "./admin";

const SESSION_COOKIE_NAME = "session";
const SESSION_EXPIRY_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

export async function createSessionCookie(idToken: string) {
  const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
    expiresIn: SESSION_EXPIRY_MS,
  });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_EXPIRY_MS / 1000,
  });
}

// The session cookie snapshots custom claims at login time. Claims change
// after login (owner role granted, academy created, student linked), so we
// overlay the live claims from Firebase Auth. `cache` dedupes this per request
// since layout and page both call it.
export const verifySession = cache(async () => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;
  try {
    const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    const user = await getAdminAuth().getUser(decoded.uid);
    return { ...decoded, ...(user.customClaims ?? {}) };
  } catch {
    return null;
  }
});

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
