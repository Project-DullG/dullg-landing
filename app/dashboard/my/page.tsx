import { getText } from "@/lib/i18n/server";
import { localizedRedirect } from "@/lib/i18n/server";
import { verifySession } from "@/lib/firebase/auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { ScoreChart } from "@/components/dashboard/score-chart";
export default async function MyGradesPage() {
  const t = await getText();
  const session = await verifySession();
  if (!session) return localizedRedirect("/login");
  if (session.role !== "student") return localizedRedirect("/dashboard");
  const academyId = session.academyId as string;
  const studentId = session.studentId as string;
  if (!academyId || !studentId) return localizedRedirect("/login");
  const [studentDoc, gradesSnap] = await Promise.all([
    getAdminDb().collection("academies").doc(academyId).collection("students").doc(studentId).get(),
    getAdminDb()
      .collection("academies")
      .doc(academyId)
      .collection("grades")
      .where("studentId", "==", studentId)
      .orderBy("date", "desc")
      .limit(50)
      .get(),
  ]);
  const student = studentDoc.data();
  const grades = gradesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const dullgGrades = grades.filter((g: Record<string, unknown>) => g.type === "dullg");
  const examGrades = grades.filter((g: Record<string, unknown>) => g.type === "exam");
  return (
    <div>
      <h1 className="dash-page-title">
        {t(student?.name)}
        {t("님의 성적")}
      </h1>
      <div className="dash-card">
        <ScoreChart
          scores={[1, 2, 3, 4].map((session) => {
            const record = gradesSnap.docs
              .find((doc) => doc.data().type === "dullg" && doc.data().session === session)
              ?.data();
            return {
              label: `${session}차시`,
              score: record && Number.isFinite(record.score) ? Number(record.score) : null,
            };
          })}
        />
        <p className="dash-description">{t("최근 50건 중 차시별 최신 점수입니다.")}</p>
      </div>

      <div className="dash-card">
        <h2>{t("미스터리 수업 성적")}</h2>
        {t(
          dullgGrades.length === 0 ? (
            <p>{t("아직 미스터리 수업 성적이 없습니다.")}</p>
          ) : (
            <table className="dash-table">
              <thead>
                <tr>
                  <th>{t("차시")}</th>
                  <th>{t("점수")}</th>
                  <th>{t("참여도")}</th>
                  <th>{t("메모")}</th>
                </tr>
              </thead>
              <tbody>
                {t(
                  dullgGrades.map((g: Record<string, unknown>) => (
                    <tr key={g.id as string}>
                      <td>
                        {t(g.session as number)}
                        {t("차시")}
                      </td>
                      <td>
                        {t(g.score as number)}
                        {t("점")}
                      </td>
                      <td>{t(g.participation as string)}</td>
                      <td>{t((g.note as string) || "-")}</td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          ),
        )}
      </div>

      <div className="dash-card">
        <h2>{t("일반 시험 성적")}</h2>
        {t(
          examGrades.length === 0 ? (
            <p style={{ color: "rgba(21,37,30,0.4)" }}>{t("시험 성적 기록이 없습니다.")}</p>
          ) : (
            <table className="dash-table">
              <thead>
                <tr>
                  <th>{t("과목")}</th>
                  <th>{t("시험")}</th>
                  <th>{t("점수")}</th>
                </tr>
              </thead>
              <tbody>
                {t(
                  examGrades.map((g: Record<string, unknown>) => (
                    <tr key={g.id as string}>
                      <td>{t(g.subject as string)}</td>
                      <td>{t(g.examName as string)}</td>
                      <td>
                        {t(g.score as number)}/{t(g.totalScore as number)}
                      </td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          ),
        )}
      </div>
    </div>
  );
}
