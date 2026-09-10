import { getText } from "@/lib/i18n/server";
import { localizedRedirect } from "@/lib/i18n/server";
import { verifySession } from "@/lib/firebase/auth";
import { getAdminDb } from "@/lib/firebase/admin";
import Link from "@/components/i18n/link";
export default async function DashboardPage() {
  const t = await getText();
  const session = await verifySession();
  if (!session) return localizedRedirect("/login");
  if (session.role === "student") return localizedRedirect("/dashboard/my");
  if (session.role !== "owner") return localizedRedirect("/dashboard/onboarding");
  const academyId = session.academyId as string;
  if (!academyId) return localizedRedirect("/dashboard/onboarding");
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
      <h1 className="dash-page-title">{t("학원 운영 현황")}</h1>
      <p className="dash-description">{t("학생과 반을 등록한 뒤 수업별 성적을 기록하세요.")}</p>
      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <span className="dash-stat-value">{t(stats.students)}</span>
          <span className="dash-stat-label">{t("학원생")}</span>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-value">{t(stats.classes)}</span>
          <span className="dash-stat-label">{t("반")}</span>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-value">{t(stats.grades)}</span>
          <span className="dash-stat-label">{t("성적 기록")}</span>
        </div>
      </div>
      <section className="dash-card">
        <h2>{t("바로 시작하기")}</h2>
        <div className="dash-shortcuts">
          <Link href="/dashboard/students">
            <strong>{t("학생 관리 →")}</strong>
            <span>{t("학생 등록\u00B7검색\u00B7반 배정")}</span>
          </Link>
          <Link href="/dashboard/classes">
            <strong>{t("반 관리 →")}</strong>
            <span>{t("반 생성\u00B7이름 변경\u00B7인원 확인")}</span>
          </Link>
          <Link href="/dashboard/grades">
            <strong>{t("성적 입력 →")}</strong>
            <span>{t("차시 점수\u00B7참여도\u00B7시험 기록")}</span>
          </Link>
          <Link href="/dashboard/grades/report">
            <strong>{t("성적 리포트 →")}</strong>
            <span>{t("반별 평균과 최근 기록 확인")}</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
