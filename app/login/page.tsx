import { verifySession } from "@/lib/firebase/auth";
import { normalizeDashboardReturnPath, postLoginPath } from "@/lib/auth-navigation";
import { localizedRedirect } from "@/lib/i18n/server";
import LoginForm from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const nextPath = normalizeDashboardReturnPath((await searchParams).next);
  const session = await verifySession();
  if (session) return localizedRedirect(postLoginPath(session.role, nextPath));
  return <LoginForm nextPath={nextPath} />;
}
