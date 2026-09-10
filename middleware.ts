import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const originalPath = request.nextUrl.pathname;
  const english = originalPath === "/en" || originalPath.startsWith("/en/");
  const pathname = english ? originalPath.slice(3) || "/" : originalPath;
  const destination = (path: string) => new URL(`${english ? "/en" : ""}${path}`, request.url);

  // Protect /dashboard routes
  if (pathname.startsWith("/dashboard") && !session) {
    return NextResponse.redirect(destination("/login"));
  }

  // Redirect logged-in users away from /login
  if (pathname === "/login" && session) {
    return NextResponse.redirect(destination("/dashboard"));
  }

  // Pass pathname to server components via header (for role-based redirects in layout)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  requestHeaders.set("x-dullg-locale", english ? "en" : "ko");
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const response = english
    ? NextResponse.rewrite(url, { request: { headers: requestHeaders } })
    : NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Language", english ? "en" : "ko");
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|assets|speaking|.*\\..*).*)"],
};
