import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase/admin";
import { createSessionCookie, clearSession, verifySession } from "@/lib/firebase/auth";
import {
  ACCESS_COOKIE,
  accessConfig,
  consumeCodeAttempt,
  privateHeaders,
  sameOrigin,
} from "@/lib/speaking/access/server";
import {
  ACCESS_TTL,
  issueAccess,
  matchesAccessCode,
  validAccessConfig,
} from "@/lib/speaking/access/token";

export const dynamic = "force-dynamic";
const json = (value: object, status = 200) =>
  NextResponse.json(value, { status, headers: privateHeaders });
export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "페이지를 새로고침한 뒤 다시 시도하세요." }, 403);
  try {
    const raw = await request.text();
    if (raw.length > 16000) return json({ error: "입력 내용을 확인하세요." }, 400);
    const input = JSON.parse(raw);
    if (!input || typeof input !== "object" || Array.isArray(input))
      return json({ error: "입력 내용을 확인하세요." }, 400);
    if (input.kind === "logout") {
      await clearSession();
      (await cookies()).set(ACCESS_COOKIE, "", { path: "/speaking", maxAge: 0 });
      return json({ ok: true });
    }
    if (input.kind === "login") {
      if (typeof input.idToken !== "string" || input.idToken.length > 12000)
        return json({ error: "로그인 정보를 확인하세요." }, 400);
      const decoded = await getAdminAuth().verifyIdToken(input.idToken, true);
      if (
        decoded.firebase?.sign_in_provider !== "google.com" ||
        Date.now() / 1000 - decoded.auth_time > 300
      )
        return json({ error: "구글 계정으로 다시 로그인하세요." }, 401);
      await createSessionCookie(input.idToken);
      (await cookies()).set(ACCESS_COOKIE, "", { path: "/speaking", maxAge: 0 });
      return json({ ok: true });
    }
    if (input.kind !== "code" || typeof input.code !== "string" || input.code.length > 256)
      return json({ error: "인증코드를 확인하세요." }, 400);
    const session = await verifySession();
    if (!session || session.firebase?.sign_in_provider !== "google.com")
      return json({ error: "구글 계정으로 로그인하세요." }, 401);
    const config = accessConfig();
    if (!validAccessConfig(config))
      return json({ error: "접근 설정을 준비하고 있습니다. 관리자에게 문의하세요." }, 503);
    if (!(await consumeCodeAttempt(session.uid)))
      return json(
        { error: "한 시간에 다섯 번까지 확인할 수 있습니다. 잠시 후 다시 시도하세요." },
        429,
      );
    if (!matchesAccessCode(input.code.trim(), config.code))
      return json({ error: "인증코드가 일치하지 않습니다." }, 403);
    const jar = await cookies();
    jar.set(ACCESS_COOKIE, issueAccess(session.uid, jar.get("session")!.value, config), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/speaking",
      maxAge: ACCESS_TTL,
    });
    return json({ ok: true });
  } catch (error) {
    if (error instanceof SyntaxError) return json({ error: "입력 내용을 확인하세요." }, 400);
    return json(
      { error: "로그인 또는 인증 확인을 완료하지 못했습니다. 잠시 후 다시 시도하세요." },
      503,
    );
  }
}
