import { NextResponse } from "next/server";
import { clearSession } from "@/lib/firebase/auth";

// Clears the session cookie and returns to /login.
// Used when the session cookie carries stale custom claims (e.g. role granted after login).
export async function GET(request: Request) {
  await clearSession();
  return NextResponse.redirect(new URL("/login", request.url));
}
