import { NextResponse } from "next/server";
import { clearSession } from "@/lib/firebase/auth";
import { normalizeStudentGameReturnPath } from "@/lib/auth-navigation";

// Clears the session cookie and returns to /login, or an explicitly allowed public game page.
// Used when the session cookie carries stale custom claims (e.g. role granted after login).
export async function GET(request: Request) {
  const returnPath = normalizeStudentGameReturnPath(new URL(request.url).searchParams.get("next"));
  await clearSession();
  const response = NextResponse.redirect(new URL(returnPath ?? "/login", request.url));
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}
