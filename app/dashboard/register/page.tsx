import Link from "@/components/i18n/link";
import { logoutAction } from "@/app/actions/auth";
import { loginPath } from "@/lib/auth-navigation";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/firebase/auth";
import { getText, localizedRedirect } from "@/lib/i18n/server";
import { StudentRegistrationForm } from "./registration-form";

export default async function StudentRegistrationPage({
  searchParams,
}: {
  searchParams: Promise<{ academy?: string | string[] }>;
}) {
  const rawAcademy = (await searchParams).academy;
  const requestedAcademyId =
    typeof rawAcademy === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(rawAcademy) ? rawAcademy : "";
  const returnPath = `/dashboard/register${requestedAcademyId ? `?academy=${requestedAcademyId}` : ""}`;
  const session = await verifySession();
  if (!session) return localizedRedirect(loginPath(returnPath));
  const t = await getText();
  if (session.role && session.role !== "student") {
    return (
      <section className="dash-onboarding">
        <h1>{t("학생 본인 인증")}</h1>
        <p>{t("학생 본인의 Google 계정으로 로그인해 주세요.")}</p>
        <Link href="/dashboard/notebook">{t("추리노트로 돌아가기")}</Link>
        <form action={logoutAction.bind(null, returnPath)} className="dash-onboarding-footer">
          <button type="submit" className="dash-text-button">
            {t("다른 계정으로 로그인")}
          </button>
        </form>
      </section>
    );
  }
  const [user, profile] = await Promise.all([
    getAdminAuth().getUser(session.uid),
    getAdminDb().collection("studentProfiles").doc(session.uid).get(),
  ]);
  const data = profile.data();
  const initialName =
    data?.userId === session.uid && typeof data.name === "string"
      ? data.name
      : (user.displayName ?? "");
  return (
    <StudentRegistrationForm
      uid={session.uid}
      initialName={initialName}
      email={user.email ?? ""}
      emailVerified={user.emailVerified}
      phoneNumber={user.phoneNumber ?? null}
      requestedAcademyId={requestedAcademyId}
    />
  );
}
