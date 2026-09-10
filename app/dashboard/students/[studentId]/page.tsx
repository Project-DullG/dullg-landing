import { getText } from "@/lib/i18n/server";
import { localizedRedirect } from "@/lib/i18n/server";
import { verifySession } from "@/lib/firebase/auth";
import { getAdminDb } from "@/lib/firebase/admin";
import Link from "@/components/i18n/link";
import { ScoreChart } from "@/components/dashboard/score-chart";
export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{
    studentId: string;
  }>;
}) {
  const t = await getText();
  const { studentId } = await params;
  const session = await verifySession();
  if (!session || session.role !== "owner") return localizedRedirect("/login");
  const academyId = session.academyId as string;
  if (!academyId) return localizedRedirect("/dashboard/onboarding");
  const studentDoc = await getAdminDb()
    .collection("academies")
    .doc(academyId)
    .collection("students")
    .doc(studentId)
    .get();
  if (!studentDoc.exists) return localizedRedirect("/dashboard/students");
  const student = studentDoc.data()!;
  const gradesSnap = await getAdminDb()
    .collection("academies")
    .doc(academyId)
    .collection("grades")
    .where("studentId", "==", studentId)
    .orderBy("date", "desc")
    .limit(50)
    .get();
  const grades = gradesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const chartScores = [1, 2, 3, 4].map((session) => {
    const record = gradesSnap.docs
      .find((doc) => doc.data().type === "dullg" && doc.data().session === session)
      ?.data();
    return {
      label: `${session}차시`,
      score: record && Number.isFinite(record.score) ? Number(record.score) : null,
    };
  });
  return (
    <div>
      <Link href="/dashboard/students">{t("← 학생 목록으로")}</Link>
      <h1 className="dash-page-title">{t(student.name)}</h1>

      <div className="dash-card">
        <h2>{t("기본 정보")}</h2>
        <p>
          {t("학년:")}
          {t(student.grade)}
          {t("학년")}
        </p>
        <p>
          {t("학부모 연락처:")}
          {t(student.parentContact)}
        </p>
      </div>

      <div className="dash-card">
        <ScoreChart scores={chartScores} />
        <p>{t("최근 50개 기록 중 각 차시의 가장 최근 점수를 표시합니다.")}</p>
        <h2>{t("성적 이력")}</h2>
        {t(
          grades.length === 0 ? (
            <p style={{ color: "rgba(21,37,30,0.4)" }}>{t("성적 기록이 없습니다.")}</p>
          ) : (
            <table className="dash-table">
              <thead>
                <tr>
                  <th>{t("유형")}</th>
                  <th>{t("내용")}</th>
                  <th>{t("점수")}</th>
                  <th>{t("날짜")}</th>
                </tr>
              </thead>
              <tbody>
                {t(
                  grades.map((g: Record<string, unknown>) => (
                    <tr key={g.id as string}>
                      <td>{t(g.type === "dullg" ? "미스터리 수업" : "시험")}</td>
                      <td>
                        {t(
                          g.type === "dullg"
                            ? `${g.session}차시 (참여도: ${g.participation})`
                            : `${g.subject} - ${g.examName}`,
                        )}
                      </td>
                      <td>
                        {t(g.type === "dullg" ? `${g.score}점` : `${g.score}/${g.totalScore}`)}
                      </td>
                      <td>
                        {t(
                          (
                            g.date as {
                              toDate?: () => Date;
                            }
                          )?.toDate
                            ? (
                                g.date as {
                                  toDate: () => Date;
                                }
                              )
                                .toDate()
                                .toLocaleDateString("ko-KR")
                            : "-",
                        )}
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
