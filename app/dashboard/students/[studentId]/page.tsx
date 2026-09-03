import { redirect } from "next/navigation";
import { verifySession } from "@/lib/firebase/auth";
import { getAdminDb } from "@/lib/firebase/admin";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const session = await verifySession();
  if (!session || session.role !== "owner") redirect("/login");
  const academyId = session.academyId as string;
  if (!academyId) redirect("/dashboard/onboarding");

  const studentDoc = await getAdminDb()
    .collection("academies")
    .doc(academyId)
    .collection("students")
    .doc(studentId)
    .get();

  if (!studentDoc.exists) redirect("/dashboard/students");
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

  return (
    <div>
      <h1 className="dash-page-title">{student.name}</h1>

      <div className="dash-card">
        <h2>기본 정보</h2>
        <p>학년: {student.grade}학년</p>
        <p>학부모 연락처: {student.parentContact}</p>
      </div>

      <div className="dash-card">
        <h2>성적 이력</h2>
        {grades.length === 0 ? (
          <p style={{ color: "rgba(21,37,30,0.4)" }}>성적 기록이 없습니다.</p>
        ) : (
          <table className="dash-table">
            <thead>
              <tr>
                <th>유형</th>
                <th>내용</th>
                <th>점수</th>
                <th>날짜</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g: Record<string, unknown>) => (
                <tr key={g.id as string}>
                  <td>{g.type === "dullg" ? "DullG" : "시험"}</td>
                  <td>
                    {g.type === "dullg"
                      ? `${g.session}차시 (참여도: ${g.participation})`
                      : `${g.subject} - ${g.examName}`}
                  </td>
                  <td>{g.type === "dullg" ? `${g.score}점` : `${g.score}/${g.totalScore}`}</td>
                  <td>
                    {(g.date as { toDate?: () => Date })?.toDate
                      ? (g.date as { toDate: () => Date }).toDate().toLocaleDateString("ko-KR")
                      : "-"}
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
