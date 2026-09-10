import { getText } from "@/lib/i18n/server";
import { localizedRedirect } from "@/lib/i18n/server";
import { verifySession } from "@/lib/firebase/auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { GradeForm } from "@/components/dashboard/grade-form";
import Link from "@/components/i18n/link";
export default async function GradesPage() {
  const t = await getText();
  const session = await verifySession();
  if (!session || session.role !== "owner") return localizedRedirect("/login");
  const academyId = session.academyId as string;
  if (!academyId) return localizedRedirect("/dashboard/onboarding");
  const studentsSnap = await getAdminDb()
    .collection("academies")
    .doc(academyId)
    .collection("students")
    .orderBy("name")
    .get();
  const students = studentsSnap.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
  }));
  return (
    <div>
      <h1 className="dash-page-title">{t("성적 입력")}</h1>
      <p className="dash-description">{t("수업 점수와 일반 시험을 구분해 기록합니다.")}</p>
      {t(
        students.length ? (
          <GradeForm students={students} />
        ) : (
          <div className="dash-card">
            <h2>{t("학생을 먼저 등록해 주세요")}</h2>
            <p>{t("등록된 학생이 있어야 성적을 입력할 수 있습니다.")}</p>
            <Link className="dash-button" href="/dashboard/students">
              {t("학생 등록으로 이동 →")}
            </Link>
          </div>
        ),
      )}
    </div>
  );
}
