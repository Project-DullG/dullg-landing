import { redirect } from "next/navigation";
import { verifySession } from "@/lib/firebase/auth";
import { getAdminDb } from "@/lib/firebase/admin";

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
        <h2>DullG 수업 성적</h2>
        {dullgGrades.length === 0 ? (
          <p style={{ color: "rgba(21,37,30,0.4)" }}>DullG 성적 기록이 없습니다.</p>
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
