import { verifySession } from "@/lib/firebase/auth";
import { EnglishInputError } from "@/lib/english/progress";
import { communityOriginAllowed } from "@/lib/english/community";
import { accountKey, englishFailure, englishPrivateHeaders, readEnglishJson, readEnglishProgress, updateEnglishProgress } from "@/lib/english/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) throw new EnglishInputError("로그인하면 학습 기록을 저장할 수 있습니다.", 401);
    return Response.json({ progress: await readEnglishProgress(session.uid), accountKey: accountKey(session.uid) }, { headers: englishPrivateHeaders });
  } catch (error) { return englishFailure(error); }
}

export async function POST(request: Request) {
  try {
    if (!communityOriginAllowed(request.headers.get("origin"), request.url, request.headers.get("host"))) throw new EnglishInputError("현재 사이트에서 다시 시도해 주세요.", 403);
    const session = await verifySession();
    if (!session) throw new EnglishInputError("로그인 후 기록을 저장할 수 있습니다.", 401);
    const result = await updateEnglishProgress(session.uid, await readEnglishJson(request));
    return Response.json(result, { headers: englishPrivateHeaders });
  } catch (error) { return englishFailure(error); }
}
