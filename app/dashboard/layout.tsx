import { getText } from "@/lib/i18n/server";
import { headers } from "next/headers";
import { localizedRedirect } from "@/lib/i18n/server";
import { verifySession } from "@/lib/firebase/auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { Sidebar } from "@/components/dashboard/sidebar";
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const t = await getText();
  const session = await verifySession();
  if (!session) return localizedRedirect("/login");
  const role = (session.role as string) || "none";
  let academyName = "학원";
  // No role → student linking page
  if (role === "none") {
    const headerList = await headers();
    const pathname = headerList.get("x-pathname") || "";
    if (!pathname.startsWith("/dashboard/link")) {
      return localizedRedirect("/dashboard/link");
    }
  }
  // Student can only access /dashboard/my and /dashboard/link
  if (role === "student") {
    const headerList = await headers();
    const pathname = headerList.get("x-pathname") || "";
    if (!pathname.startsWith("/dashboard/my") && !pathname.startsWith("/dashboard/link")) {
      return localizedRedirect("/dashboard/my");
    }
  }
  // Owner: fetch academy name
  if (role === "owner" && session.academyId) {
    const academyDoc = await getAdminDb()
      .collection("academies")
      .doc(session.academyId as string)
      .get();
    if (academyDoc.exists) {
      academyName = academyDoc.data()?.name || "학원";
    }
  }
  // Student layout: no sidebar
  if (role === "student" || role === "none") {
    return (
      <main className="dash-main" style={{ padding: "32px 40px" }}>
        {t(children)}
      </main>
    );
  }
  return (
    <div className="dash-layout">
      <Sidebar role={role} academyName={academyName} />
      <main className="dash-main">{t(children)}</main>
    </div>
  );
}
