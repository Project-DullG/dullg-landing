import "server-only";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { verifySession } from "@/lib/firebase/auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { validAccessConfig, verifyAccess, nextAttempts, studySessionKey } from "./token";

export const ACCESS_COOKIE = "speaking_access";
export const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow",
  Vary: "Cookie",
};
export function accessConfig() {
  return {
    code: process.env.SPEAKING_ACCESS_CODE || "",
    secret: process.env.SPEAKING_SESSION_SECRET || "",
  };
}
export async function speakingAccess() {
  const session = await verifySession();
  if (!session || session.firebase?.sign_in_provider !== "google.com")
    return { status: "login" as const };
  const config = accessConfig();
  if (!validAccessConfig(config)) return { status: "setup" as const, session };
  const jar = await cookies();
  const rawSession = jar.get("session")?.value || "";
  const token = jar.get(ACCESS_COOKIE)?.value || "";
  if (!verifyAccess(token, session.uid, rawSession, config))
    return { status: "code" as const, session };
  return {
    status: "ready" as const,
    session,
    sessionKey: studySessionKey(session.uid, rawSession, config.secret),
  };
}
export function sameOrigin(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin;
}
export async function consumeCodeAttempt(uid: string) {
  const db = getAdminDb();
  const ref = db
    .collection("speakingAccessAttempts")
    .doc(createHash("sha256").update(uid).digest("hex"));
  return db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    const stored = doc.data()?.attempts;
    const result = nextAttempts(Array.isArray(stored) ? stored : [], Date.now());
    if (result.allowed) tx.set(ref, { attempts: result.attempts });
    return result.allowed;
  });
}
