import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ACCESS_COOKIE,
  CertificateRequestError,
  accessConfig,
  consumeCodeAttempt,
  getCertificateAccess,
  privateHeaders,
  readJsonObject,
  sameOrigin,
} from "@/lib/certificates/access-server";
import {
  ACCESS_TTL,
  issueAccess,
  matchesAccessCode,
  validAccessConfig,
} from "@/lib/certificates/access-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (value: object, status = 200) =>
  NextResponse.json(value, { status, headers: privateHeaders });
const unavailable = () =>
  json({ error: "인증을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요." }, 503);
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

export async function GET() {
  try {
    return json({ authorized: await getCertificateAccess() });
  } catch {
    return json({ authorized: false });
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "같은 사이트에서 다시 요청해 주세요." }, 403);
  const config = accessConfig();
  if (!validAccessConfig(config)) return unavailable();
  try {
    const input = await readJsonObject(request);
    if (
      Object.keys(input).length !== 1 ||
      typeof input.code !== "string" ||
      input.code.length === 0 ||
      input.code.length > 256
    )
      return json({ error: "인증번호를 확인해 주세요." }, 400);
    const matches = matchesAccessCode(input.code.trim(), config.code);
    // Even a matching code must pass the shared IP's persisted failure limit first.
    if (!(await consumeCodeAttempt(request, config, !matches))) {
      const response = json(
        { error: "인증을 여러 번 실패했습니다. 15분 뒤 다시 시도해 주세요." },
        429,
      );
      response.headers.set("Retry-After", "900");
      return response;
    }
    if (!matches) return json({ error: "인증번호가 일치하지 않습니다." }, 403);
    (await cookies()).set(ACCESS_COOKIE, issueAccess(config), {
      ...cookieOptions,
      maxAge: ACCESS_TTL,
    });
    return json({ ok: true });
  } catch (error) {
    if (error instanceof CertificateRequestError)
      return json({ error: error.message }, error.status);
    return unavailable();
  }
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return json({ error: "같은 사이트에서 다시 요청해 주세요." }, 403);
  (await cookies()).set(ACCESS_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  return json({ ok: true });
}
