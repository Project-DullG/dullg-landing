import { redirect } from "next/navigation";
import { verifySession } from "@/lib/firebase/auth";
import { getAdminDb } from "@/lib/firebase/admin";

export default async function DashboardPage() {
  const session = await verifySession();
  if (!session) redirect("/login");

  if (session.role === "student") redirect("/dashboard/my");
  if (session.role !== "owner") redirect("/dashboard/onboarding");

  const academyId = session.academyId as string;
  if (!academyId) redirect("/dashboard/onboarding");

  // Fetch counts
  const [studentsSnap, classesSnap, gradesSnap] = await Promise.all([
    getAdminDb().collection("academies").doc(academyId).collection("students").count().get(),
    getAdminDb().collection("academies").doc(academyId).collection("classes").count().get(),
    getAdminDb().collection("academies").doc(academyId).collection("grades").count().get(),
  ]);

  const stats = {
    students: studentsSnap.data().count,
    classes: classesSnap.data().count,
    grades: gradesSnap.data().count,
  };

  return (
    <div>
      <h1 className="dash-page-title">대시보드</h1>
      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <span className="dash-stat-value">{stats.students}</span>
          <span className="dash-stat-label">학원생</span>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-value">{stats.classes}</span>
          <span className="dash-stat-label">반</span>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-value">{stats.grades}</span>
          <span className="dash-stat-label">성적 기록</span>
        </div>
      </div>
    </div>
  );
}
