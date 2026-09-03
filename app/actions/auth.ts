"use server";

import { redirect } from "next/navigation";
import { createSessionCookie, clearSession, verifySession } from "@/lib/firebase/auth";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function loginAction(idToken: string) {
  await createSessionCookie(idToken);

  const decoded = await adminAuth.verifyIdToken(idToken);
  const role = decoded.role as string | undefined;

  if (role === "student") {
    redirect("/dashboard/my");
  } else if (role === "owner") {
    redirect("/dashboard");
  } else {
    // No role: could be a student needing to link, or unknown user
    redirect("/dashboard/link");
  }
}

export async function logoutAction() {
  const session = await verifySession();
  if (session) {
    await adminAuth.revokeRefreshTokens(session.uid);
  }
  await clearSession();
  redirect("/login");
}

export async function linkStudentAction(academyId: string, studentName: string) {
  const session = await verifySession();
  if (!session) throw new Error("로그인이 필요합니다.");

  // Find matching student in the academy
  const studentsSnap = await adminDb
    .collection("academies")
    .doc(academyId)
    .collection("students")
    .where("name", "==", studentName)
    .where("userId", "==", null)
    .limit(1)
    .get();

  if (studentsSnap.empty) {
    throw new Error("일치하는 학생 정보를 찾을 수 없습니다. 원장님에게 문의하세요.");
  }

  const studentDoc = studentsSnap.docs[0];

  // Link userId
  await studentDoc.ref.update({ userId: session.uid });

  // Set custom claims
  await adminAuth.setCustomUserClaims(session.uid, {
    role: "student",
    academyId,
    studentId: studentDoc.id,
  });

  redirect("/dashboard/my");
}
