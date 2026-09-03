import { redirect } from "next/navigation";
import { verifySession } from "@/lib/firebase/auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { GradeForm } from "@/components/dashboard/grade-form";

export default async function GradesPage() {
  const session = await verifySession();
  if (!session || session.role !== "owner") redirect("/login");
  const academyId = session.academyId as string;
  if (!academyId) redirect("/dashboard/onboarding");

  const studentsSnap = await getAdminDb()
    .collection("academies").doc(academyId)
    .collection("students").orderBy("name").get();

  const students = studentsSnap.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
  }));

  return (
    <div>
      <h1 className="dash-page-title">성적 입력</h1>
      <GradeForm students={students} />
    </div>
  );
}
