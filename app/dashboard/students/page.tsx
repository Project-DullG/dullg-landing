import { redirect } from "next/navigation";
import Link from "next/link";
import { verifySession } from "@/lib/firebase/auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { StudentForm } from "@/components/dashboard/student-form";
import { deleteStudent } from "@/app/actions/students";

export default async function StudentsPage() {
  const session = await verifySession();
  if (!session || session.role !== "owner") redirect("/login");
  const academyId = session.academyId as string;
  if (!academyId) redirect("/dashboard/onboarding");

  const [studentsSnap, classesSnap] = await Promise.all([
    getAdminDb().collection("academies").doc(academyId).collection("students").orderBy("createdAt", "desc").limit(100).get(),
    getAdminDb().collection("academies").doc(academyId).collection("classes").get(),
  ]);

  const classes = classesSnap.docs.map((doc) => ({ id: doc.id, name: doc.data().name }));
  const classMap = Object.fromEntries(classes.map((c) => [c.id, c.name]));
  const students = studentsSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return (
    <div>
      <h1 className="dash-page-title">학원생 관리</h1>

      <StudentForm classes={classes} />

      <table className="dash-table" style={{ marginTop: 24 }}>
        <thead>
          <tr>
            <th>이름</th>
            <th>학년</th>
            <th>반</th>
            <th>연락처</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {students.map((s: Record<string, unknown>) => (
            <tr key={s.id as string}>
              <td>
                <Link href={`/dashboard/students/${s.id}`} style={{ textDecoration: "underline" }}>
                  {s.name as string}
                </Link>
              </td>
              <td>{s.grade as number}학년</td>
              <td>{s.classId ? classMap[s.classId as string] || "-" : "-"}</td>
              <td>{s.parentContact as string}</td>
              <td>
                <form action={async () => { "use server"; await deleteStudent(s.id as string); }}>
                  <button type="submit" className="dash-button-danger" style={{ fontSize: 12, padding: "4px 10px" }}>삭제</button>
                </form>
              </td>
            </tr>
          ))}
          {students.length === 0 && (
            <tr><td colSpan={5} style={{ textAlign: "center", color: "rgba(21,37,30,0.4)" }}>등록된 학원생이 없습니다.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
