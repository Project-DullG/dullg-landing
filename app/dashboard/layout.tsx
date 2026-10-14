import { getText } from "@/lib/i18n/server";
import { headers } from "next/headers";
import { localizedRedirect } from "@/lib/i18n/server";
import { verifySession } from "@/lib/firebase/auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { Sidebar } from "@/components/dashboard/sidebar";
import { loginPath } from "@/lib/auth-navigation";
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const t = await getText();
  const session = await verifySession();
  if (!session) {
    const headerList = await headers();
    return localizedRedirect(loginPath(headerList.get("x-dashboard-return-path")));
  }
  const role = (session.role as string) || "none";
  const pathname = (await headers()).get("x-pathname") || "";
  if (pathname === "/dashboard/notebook") {
    return (
      <main id="main-content" className="dash-main" style={{ padding: "24px 16px" }}>
        {children}
      </main>
    );
  }
  let academyName = "학원";
  // Unassigned accounts can enter their own student information.
  if (role === "none") {
    const headerList = await headers();
    const pathname = headerList.get("x-pathname") || "";
    if (
      pathname !== "/dashboard/register" &&
      pathname !== "/dashboard/link" &&
      pathname !== "/dashboard/my"
    ) {
      return localizedRedirect("/dashboard/notebook");
    }
  }
  // Students see their own records or registration status.
  if (role === "student") {
    const headerList = await headers();
    const pathname = headerList.get("x-pathname") || "";
    if (
      !pathname.startsWith("/dashboard/my") &&
      pathname !== "/dashboard/link" &&
      pathname !== "/dashboard/register"
    ) {
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
