import { getText } from "@/lib/i18n/server";
import { localizedRedirect } from "@/lib/i18n/server";
import { verifySession } from "@/lib/firebase/auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { SettingsForm } from "./settings-form";
export default async function SettingsPage() {
  const t = await getText();
  const session = await verifySession();
  if (!session || session.role !== "owner") return localizedRedirect("/login");
  const academyId = session.academyId as string;
  if (!academyId) return localizedRedirect("/dashboard/onboarding");
  const doc = await getAdminDb().collection("academies").doc(academyId).get();
  const academy = doc.exists ? { id: doc.id, name: doc.data()?.name || "" } : null;
  if (!academy) return localizedRedirect("/dashboard/onboarding");
  return (
    <div>
      <h1 className="dash-page-title">{t("학원 설정")}</h1>
      <SettingsForm academyId={academy.id} currentName={academy.name} />
    </div>
  );
}
