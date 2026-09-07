import { redirect } from "next/navigation";
import { verifySession } from "@/lib/firebase/auth";
import { getAdminDb } from "@/lib/firebase/admin";
import Link from "next/link";

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
      <h1 className="dash-page-title">학원 운영 현황</h1>
      <p className="dash-description">학생과 반을 등록한 뒤 수업별 성적을 기록하세요.</p>
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
      <section className="dash-card">
        <h2>바로 시작하기</h2>
        <div className="dash-shortcuts">
          <Link href="/dashboard/students"><strong>학생 관리 →</strong><span>학생 등록·검색·반 배정</span></Link>
          <Link href="/dashboard/classes"><strong>반 관리 →</strong><span>반 생성·이름 변경·인원 확인</span></Link>
          <Link href="/dashboard/grades"><strong>성적 입력 →</strong><span>차시 점수·참여도·시험 기록</span></Link>
          <Link href="/dashboard/grades/report"><strong>성적 리포트 →</strong><span>반별 평균과 최근 기록 확인</span></Link>
        </div>
      </section>
    </div>
  );
}
