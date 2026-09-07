import { redirect } from "next/navigation";
import { verifySession } from "@/lib/firebase/auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { ScoreChart } from "@/components/dashboard/score-chart";

export default async function MyGradesPage() {
  const session = await verifySession();
  if (!session) redirect("/login");
  if (session.role !== "student") redirect("/dashboard");

  const academyId = session.academyId as string;
  const studentId = session.studentId as string;
  if (!academyId || !studentId) redirect("/login");

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
      <h1 className="dash-page-title">{student?.name}님의 성적</h1>
      <div className="dash-card">
        <ScoreChart scores={[1, 2, 3, 4].map((session) => {
          const record = gradesSnap.docs.find((doc) => doc.data().type === "dullg" && doc.data().session === session)?.data();
          return { label: `${session}차시`, score: record && Number.isFinite(record.score) ? Number(record.score) : null };
        })} />
        <p className="dash-description">최근 50건 중 차시별 최신 점수입니다.</p>
      </div>

      <div className="dash-card">
        <h2>미스터리 수업 성적</h2>
        {dullgGrades.length === 0 ? (
          <p>아직 미스터리 수업 성적이 없습니다.</p>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>차시</th>
                <th>점수</th>
                <th>참여도</th>
                <th>메모</th>
              </tr>
            </thead>
            <tbody>
              {dullgGrades.map((g: Record<string, unknown>) => (
                <tr key={g.id as string}>
                  <td>{g.session as number}차시</td>
                  <td>{g.score as number}점</td>
                  <td>{g.participation as string}</td>
                  <td>{(g.note as string) || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="dash-card">
        <h2>일반 시험 성적</h2>
        {examGrades.length === 0 ? (
          <p style={{ color: "rgba(21,37,30,0.4)" }}>시험 성적 기록이 없습니다.</p>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>과목</th>
                <th>시험</th>
                <th>점수</th>
              </tr>
            </thead>
            <tbody>
              {examGrades.map((g: Record<string, unknown>) => (
                <tr key={g.id as string}>
                  <td>{g.subject as string}</td>
                  <td>{g.examName as string}</td>
                  <td>
                    {g.score as number}/{g.totalScore as number}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
