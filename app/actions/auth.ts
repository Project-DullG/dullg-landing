"use server";

import { localizedRedirect } from "@/lib/i18n/server";
import { createSessionCookie, clearSession, verifySession } from "@/lib/firebase/auth";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { postLoginPath } from "@/lib/auth-navigation";

export async function loginAction(idToken: string, nextPath?: string | null) {
  const decoded = await getAdminAuth().verifyIdToken(idToken, true);
  // Roles can change after an ID token was issued. Use the current claims,
  // just as verifySession does for subsequent authenticated requests.
  const user = await getAdminAuth().getUser(decoded.uid);
  await createSessionCookie(idToken);
  return localizedRedirect(postLoginPath(user.customClaims?.role, nextPath));
}

export async function logoutAction() {
  const session = await verifySession();
  if (session) {
    await getAdminAuth().revokeRefreshTokens(session.uid);
  }
  await clearSession();
  return localizedRedirect("/login");
}

export async function linkStudentAction(academyId: string, studentName: string) {
  const session = await verifySession();
  if (!session) throw new Error("로그인이 필요합니다.");

  // Find matching student in the academy
  const studentsSnap = await getAdminDb()
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
  await getAdminAuth().setCustomUserClaims(session.uid, {
    role: "student",
    academyId,
    studentId: studentDoc.id,
  });

  return localizedRedirect("/dashboard/my");
}
