import { verifySession } from "@/lib/firebase/auth";
import { normalizeDashboardReturnPath, normalizeStudentGameReturnPath, postLoginPath } from "@/lib/auth-navigation";
import { localizedRedirect } from "@/lib/i18n/server";
import LoginForm from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const nextPath = normalizeDashboardReturnPath((await searchParams).next);
  const session = await verifySession();
  // Gallery participation requires a registered account. An anonymous session
  // must reach Google sign-in instead of immediately returning as a guest.
  const anonymousGallerySession = normalizeStudentGameReturnPath(nextPath) !== null
    && session?.firebase?.sign_in_provider === "anonymous";
  if (session && !anonymousGallerySession) return localizedRedirect(postLoginPath(session.role, nextPath));
  return <LoginForm nextPath={nextPath} />;
}
