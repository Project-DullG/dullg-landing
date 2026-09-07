import { redirect } from "next/navigation";
import { verifySession } from "@/lib/firebase/auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { LiveStudents } from "./live-students";

export default async function StudentsPage() {
  const session = await verifySession();
  if (!session || session.role !== "owner") redirect("/login");
  const academyId = session.academyId as string;
  if (!academyId) redirect("/dashboard/onboarding");
  const academy = getAdminDb().collection("academies").doc(academyId);
  const [studentsSnap, classesSnap] = await Promise.all([
    academy.collection("students").orderBy("createdAt", "desc").limit(100).get(),
    academy.collection("classes").get(),
  ]);
  const students = studentsSnap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: String(data.name ?? ""),
      grade: Number(data.grade),
      classId: String(data.classId ?? ""),
      parentContact: String(data.parentContact ?? ""),
    };
  });
  const classes = classesSnap.docs.map((doc) => ({
    id: doc.id,
    name: String(doc.data().name ?? ""),
  }));
  return <LiveStudents students={students} classes={classes} limited={students.length === 100} />;
}
