import { redirect } from "next/navigation";
import { verifySession } from "@/lib/firebase/auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { ClassManager } from "./class-manager";

export default async function ClassesPage() {
  const session = await verifySession();
  if (!session || session.role !== "owner") redirect("/login");
  const academyId = session.academyId as string;
  if (!academyId) redirect("/dashboard/onboarding");

  const [classesSnap, studentsSnap] = await Promise.all([
    getAdminDb()
      .collection("academies")
      .doc(academyId)
      .collection("classes")
      .orderBy("createdAt")
      .get(),
    getAdminDb().collection("academies").doc(academyId).collection("students").get(),
  ]);

  const classes = classesSnap.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
  }));

  // Count students per class
  const classCounts: Record<string, number> = {};
  studentsSnap.docs.forEach((doc) => {
    const cid = doc.data().classId;
    if (cid) classCounts[cid] = (classCounts[cid] || 0) + 1;
  });

  return (
    <div>
      <h1 className="dash-page-title">반 관리</h1>
      <ClassManager classes={classes} classCounts={classCounts} />
    </div>
  );
}
