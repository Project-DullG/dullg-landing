"use server";

import { getAdminAuth } from "@/lib/firebase/admin";
import { createSessionCookie, verifySession } from "@/lib/firebase/auth";

export async function syncStudentIdentityAction(idToken: string) {
  const session = await verifySession();
  if (!session) throw new Error("로그인이 필요합니다.");
  const auth = getAdminAuth();
  const decoded = await auth.verifyIdToken(idToken, true);
  if (decoded.uid !== session.uid)
    throw new Error("로그인한 계정이 다릅니다. 다시 로그인해 주세요.");
  const user = await auth.getUser(session.uid);
  if (user.disabled) throw new Error("계정 정보를 확인해 주세요.");
  await createSessionCookie(idToken);
  return {
    email: user.email ?? "",
    emailVerified: user.emailVerified,
    phoneNumber: user.phoneNumber ?? null,
  };
}
