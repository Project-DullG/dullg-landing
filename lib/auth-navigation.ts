const DASHBOARD_ROOT = "/dashboard";

/** Only accept canonical, same-site dashboard paths for the login return URL. */
export function normalizeDashboardReturnPath(value: unknown): string | null {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\s\u0000-\u001f\u007f#]/.test(value)
  ) {
    return null;
  }

  const rawPathname = value.split("?")[0];
  // Encoded separators/dot segments (including double encoding) must never
  // change the route after this permission check. Dashboard route IDs are plain.
  if (rawPathname.includes("%") || rawPathname.includes("//")) return null;

  const url = new URL(value, "https://login-return.invalid");
  if (url.origin !== "https://login-return.invalid" || url.pathname !== rawPathname) {
    return null;
  }

  const pathname = rawPathname.replace(/^\/en(?=\/|$)/, "");
  if (pathname !== DASHBOARD_ROOT && !pathname.startsWith(`${DASHBOARD_ROOT}/`)) {
    return null;
  }

  // The login page's locale supplies /en on redirect, so never duplicate it.
  return `${pathname}${url.search}`;
}

function isRouteWithin(pathname: string, root: string) {
  return pathname === root || pathname.startsWith(`${root}/`);
}

export function dashboardPathAllowedForRole(path: unknown, role: unknown): boolean {
  const normalized = normalizeDashboardReturnPath(path);
  if (!normalized) return false;
  const pathname = normalized.split("?")[0];
  if (role === "owner") return true;
  if (role === "student") {
    return isRouteWithin(pathname, "/dashboard/my") || isRouteWithin(pathname, "/dashboard/link");
  }
  return isRouteWithin(pathname, "/dashboard/link");
}

export function postLoginPath(role: unknown, requestedPath: unknown): string {
  const normalized = normalizeDashboardReturnPath(requestedPath);
  if (normalized && dashboardPathAllowedForRole(normalized, role)) return normalized;
  if (role === "owner") return DASHBOARD_ROOT;
  if (role === "student") return "/dashboard/my";
  return "/dashboard/link";
}

export function loginPath(requestedPath: unknown): string {
  const normalized = normalizeDashboardReturnPath(requestedPath);
  return normalized ? `/login?next=${encodeURIComponent(normalized)}` : "/login";
}
