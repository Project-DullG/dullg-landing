"use server";

import { localizedRedirect } from "@/lib/i18n/server";
import { createSessionCookie, clearSession, verifySession } from "@/lib/firebase/auth";
import { getAdminAuth } from "@/lib/firebase/admin";
import { loginPath, postLoginPath } from "@/lib/auth-navigation";

export async function loginAction(idToken: string, nextPath?: string | null) {
  const decoded = await getAdminAuth().verifyIdToken(idToken, true);
  // Roles can change after an ID token was issued. Use the current claims,
  // just as verifySession does for subsequent authenticated requests.
  const user = await getAdminAuth().getUser(decoded.uid);
  await createSessionCookie(idToken);
  return localizedRedirect(postLoginPath(user.customClaims?.role, nextPath));
}

export async function logoutAction(nextPath?: unknown) {
  const session = await verifySession();
  if (session) {
    await getAdminAuth().revokeRefreshTokens(session.uid);
  }
  await clearSession();
  return localizedRedirect(loginPath(nextPath));
}
