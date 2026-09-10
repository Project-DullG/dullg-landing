import { getText } from "@/lib/i18n/server";
import { localizedRedirect } from "@/lib/i18n/server";
import { verifySession } from "@/lib/firebase/auth";
import { getAdminDb } from "@/lib/firebase/admin";
export default async function GradeReportPage() {
  const t = await getText();
  const session = await verifySession();
  if (!session || session.role !== "owner") return localizedRedirect("/login");
  const academyId = session.academyId as string;
  if (!academyId) return localizedRedirect("/dashboard/onboarding");
  const [gradesSnap, studentsSnap, classesSnap] = await Promise.all([
    getAdminDb()
      .collection("academies")
      .doc(academyId)
      .collection("grades")
      .orderBy("date", "desc")
      .limit(200)
      .get(),
    getAdminDb().collection("academies").doc(academyId).collection("students").get(),
    getAdminDb().collection("academies").doc(academyId).collection("classes").get(),
  ]);
  const studentMap = Object.fromEntries(
    studentsSnap.docs.map((doc) => [
      doc.id,
      { name: doc.data().name, classId: doc.data().classId },
    ]),
  );
  const classMap = Object.fromEntries(classesSnap.docs.map((doc) => [doc.id, doc.data().name]));
  const grades = gradesSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    studentName: studentMap[doc.data().studentId]?.name || "알 수 없음",
    className: classMap[studentMap[doc.data().studentId]?.classId] || "-",
  }));
  // Calculate averages by class for DullG grades
  const dullgGrades = grades.filter((g: Record<string, unknown>) => g.type === "dullg");
  const classAverages: Record<
    string,
    {
      total: number;
      count: number;
    }
  > = {};
  dullgGrades.forEach((g: Record<string, unknown>) => {
    const cn = g.className as string;
    if (!classAverages[cn]) classAverages[cn] = { total: 0, count: 0 };
    classAverages[cn].total += g.score as number;
    classAverages[cn].count += 1;
  });
  return (
    <div>
      <h1 className="dash-page-title">{t("성적 리포트")}</h1>
      <p className="dash-description">
        {t(
          "최근 성적 최대 200건 기준입니다. 반별 평균은 현재 배정 반에 따라 미스터리 수업 기록만 집계하며, 동일 학생의 여러 기록이 포함됩니다.",
        )}
      </p>

      {t(
        Object.keys(classAverages).length > 0 && (
          <div className="dash-card">
            <h2>{t("미스터리 수업 \u00B7 반별 평균")}</h2>
            <table className="dash-table">
              <thead>
                <tr>
                  <th>{t("반")}</th>
                  <th>{t("평균 점수")}</th>
                  <th>{t("기록 수")}</th>
                </tr>
              </thead>
              <tbody>
                {t(
                  Object.entries(classAverages).map(([cn, data]) => (
                    <tr key={cn}>
                      <td>{t(cn)}</td>
                      <td>
                        <meter
                          className="dash-meter"
                          min={0}
                          max={100}
                          value={data.total / data.count}
                          aria-label={t(`${cn} 평균 ${(data.total / data.count).toFixed(1)}점`)}
                        />
                        {t((data.total / data.count).toFixed(1))}
                        {t("점")}
                      </td>
                      <td>
                        {t(data.count)}
                        {t("건")}
                      </td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
        ),
      )}

      <div className="dash-card">
        <h2>{t("최근 성적 기록")}</h2>
        <table className="dash-table">
          <thead>
            <tr>
              <th>{t("학생")}</th>
              <th>{t("반")}</th>
              <th>{t("유형")}</th>
              <th>{t("내용")}</th>
              <th>{t("점수")}</th>
            </tr>
          </thead>
          <tbody>
            {t(
              grades.map((g: Record<string, unknown>) => (
                <tr key={g.id as string}>
                  <td>{t(g.studentName as string)}</td>
                  <td>{t(g.className as string)}</td>
                  <td>{t(g.type === "dullg" ? "미스터리 수업" : "시험")}</td>
                  <td>
                    {t(g.type === "dullg" ? `${g.session}차시` : `${g.subject} - ${g.examName}`)}
                  </td>
                  <td>{t(g.type === "dullg" ? `${g.score}점` : `${g.score}/${g.totalScore}`)}</td>
                </tr>
              )),
            )}
            {t(
              grades.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "rgba(21,37,30,0.4)" }}>
                    {t("성적 기록이 없습니다.")}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
