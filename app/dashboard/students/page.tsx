import { localizedRedirect } from "@/lib/i18n/server";
import { verifySession } from "@/lib/firebase/auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { LiveStudents } from "./live-students";
import { StudentApplications } from "@/components/dashboard/student-applications";
export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string | string[] }>;
}) {
  const startRegistration = (await searchParams).new === "1";
  const session = await verifySession();
  if (!session) {
    const destination = `/dashboard/students${startRegistration ? "?new=1" : ""}`;
    return localizedRedirect(`/login?next=${encodeURIComponent(destination)}`);
  }
  if (session.role !== "owner") return localizedRedirect("/dashboard");
  const academyId = session.academyId as string;
  if (!academyId) return localizedRedirect("/dashboard/onboarding");
  const academy = getAdminDb().collection("academies").doc(academyId);
  const academyDoc = await academy.get();
  if (!academyDoc.exists || academyDoc.data()?.ownerId !== session.uid)
    return localizedRedirect("/dashboard");
  const [studentsSnap, classesSnap, applicationsSnap] = await Promise.all([
    academy.collection("students").orderBy("createdAt", "desc").limit(100).get(),
    academy.collection("classes").get(),
    academy.collection("studentApplications").where("status", "==", "pending").get(),
  ]);
  const students = studentsSnap.docs
    .filter((doc) => !["inactive", "left"].includes(doc.data().status))
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: String(data.name ?? ""),
        grade:
          typeof data.grade === "number" &&
          Number.isInteger(data.grade) &&
          data.grade >= 1 &&
          data.grade <= 12
            ? data.grade
            : null,
        classId: String(data.classId ?? ""),
        parentContact: String(data.parentContact ?? ""),
        phoneNumber: typeof data.phoneNumber === "string" ? data.phoneNumber : undefined,
        email: typeof data.email === "string" ? data.email : undefined,
      };
    });
  const classes = classesSnap.docs.map((doc) => ({
    id: doc.id,
    name: String(doc.data().name ?? ""),
  }));
  const applications = applicationsSnap.docs
    .filter((doc) => doc.data().userId === doc.id && doc.data().academyId === academyId)
    .map((doc) => ({
      userId: doc.id,
      name: String(doc.data().name ?? ""),
      email: String(doc.data().email ?? ""),
      phoneNumber: String(doc.data().phoneNumber ?? ""),
    }));
  return (
    <>
      <StudentApplications applications={applications} />
      <LiveStudents
        students={students}
        classes={classes}
        limited={studentsSnap.docs.length === 100}
        startRegistration={startRegistration}
      />
    </>
  );
}
