import { redirect } from "next/navigation";
import { verifySession } from "@/lib/firebase/auth";
import { getAdminDb } from "@/lib/firebase/admin";

export default async function GradeReportPage() {
  const session = await verifySession();
  if (!session || session.role !== "owner") redirect("/login");
  const academyId = session.academyId as string;
  if (!academyId) redirect("/dashboard/onboarding");

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
  const classAverages: Record<string, { total: number; count: number }> = {};
  dullgGrades.forEach((g: Record<string, unknown>) => {
    const cn = g.className as string;
    if (!classAverages[cn]) classAverages[cn] = { total: 0, count: 0 };
    classAverages[cn].total += g.score as number;
    classAverages[cn].count += 1;
  });

  return (
    <div>
      <h1 className="dash-page-title">성적 리포트</h1>

      {Object.keys(classAverages).length > 0 && (
        <div className="dash-card">
          <h2>DullG 반별 평균</h2>
          <table className="dash-table">
            <thead>
              <tr>
                <th>반</th>
                <th>평균 점수</th>
                <th>기록 수</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(classAverages).map(([cn, data]) => (
                <tr key={cn}>
                  <td>{cn}</td>
                  <td>{(data.total / data.count).toFixed(1)}점</td>
                  <td>{data.count}건</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="dash-card">
        <h2>최근 성적 기록</h2>
        <table className="dash-table">
          <thead>
            <tr>
              <th>학생</th>
              <th>반</th>
              <th>유형</th>
              <th>내용</th>
              <th>점수</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((g: Record<string, unknown>) => (
              <tr key={g.id as string}>
                <td>{g.studentName as string}</td>
                <td>{g.className as string}</td>
                <td>{g.type === "dullg" ? "DullG" : "시험"}</td>
                <td>{g.type === "dullg" ? `${g.session}차시` : `${g.subject} - ${g.examName}`}</td>
                <td>{g.type === "dullg" ? `${g.score}점` : `${g.score}/${g.totalScore}`}</td>
              </tr>
            ))}
            {grades.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "rgba(21,37,30,0.4)" }}>
                  성적 기록이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
