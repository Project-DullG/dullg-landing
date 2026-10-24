import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import {
  CertificateRequestError,
  accessConfig,
  getCertificateAccess,
  privateHeaders,
  readJsonObject,
  sameOrigin,
} from "@/lib/certificates/access-server";
import {
  certificateDate,
  normalizeCertificateName,
  validAccessConfig,
} from "@/lib/certificates/access-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (value: object, status = 200) =>
  NextResponse.json(value, { status, headers: privateHeaders });

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "같은 사이트에서 다시 요청해 주세요." }, 403);
  if (!validAccessConfig(accessConfig()))
    return json(
      { error: "수료증 발급 설정을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요." },
      503,
    );
  try {
    if (!(await getCertificateAccess()))
      return json({ error: "인증번호를 다시 입력해 주세요." }, 401);
    const input = await readJsonObject(request);
    if (
      Object.keys(input).length !== 2 ||
      !Object.hasOwn(input, "name") ||
      input.confirmed !== true
    )
      return json({ error: "이름과 교육 참여 확인을 입력해 주세요." }, 400);
    const name = normalizeCertificateName(input.name);
    if (!name)
      return json(
        {
          error:
            "이름은 한글·영문·한자와 공백, 작은따옴표, 하이픈, 가운뎃점으로 40자 이내로 입력해 주세요.",
        },
        400,
      );
    const issuedAt = certificateDate();
    // A random display reference, not a stored issuance record or a check against a student roster.
    // Course and issuer are fixed page content; neither can be supplied by this request.
    const reference = `TW-${issuedAt.replaceAll("-", "")}-${randomBytes(8).toString("hex").toUpperCase()}`;
    return json({ ok: true, certificate: { name, issuedAt, reference } });
  } catch (error) {
    if (error instanceof CertificateRequestError)
      return json({ error: error.message }, error.status);
    return json({ error: "수료증을 준비하지 못했습니다. 잠시 후 다시 시도해 주세요." }, 503);
  }
}
