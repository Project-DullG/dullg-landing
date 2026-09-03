import { redirect } from "next/navigation";
import { verifySession } from "@/lib/firebase/auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const session = await verifySession();
  if (!session || session.role !== "owner") redirect("/login");
  const academyId = session.academyId as string;
  if (!academyId) redirect("/dashboard/onboarding");

  const doc = await getAdminDb().collection("academies").doc(academyId).get();
  const academy = doc.exists ? { id: doc.id, name: doc.data()?.name || "" } : null;
  if (!academy) redirect("/dashboard/onboarding");

  return (
    <div>
      <h1 className="dash-page-title">학원 설정</h1>
      <SettingsForm academyId={academy.id} currentName={academy.name} />
    </div>
  );
}
