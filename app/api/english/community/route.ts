import { verifySession } from "@/lib/firebase/auth";
import { EnglishInputError } from "@/lib/english/progress";
import { communityCategories, communityOriginAllowed, type CommunityCategory } from "@/lib/english/community";
import { accountKey, englishFailure, englishPrivateHeaders, listEnglishCommunity, readEnglishJson, updateEnglishCommunity } from "@/lib/english/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const category = new URL(request.url).searchParams.get("category");
    if (category && !communityCategories.includes(category as CommunityCategory)) throw new EnglishInputError("게시물 분류를 확인해 주세요.");
    const [session, posts] = await Promise.all([verifySession(), listEnglishCommunity(category as CommunityCategory || undefined)]);
    return Response.json({ posts, ...(session ? { accountKey: accountKey(session.uid) } : {}) }, { headers: englishPrivateHeaders });
  } catch (error) { return englishFailure(error); }
}

export async function POST(request: Request) {
  try {
    if (!communityOriginAllowed(request.headers.get("origin"), request.url, request.headers.get("host"))) throw new EnglishInputError("현재 사이트에서 다시 시도해 주세요.", 403);
    const session = await verifySession();
    if (!session) throw new EnglishInputError("로그인 후 참여할 수 있습니다.", 401);
    const result = await updateEnglishCommunity(session.uid, await readEnglishJson(request));
    return Response.json(result, { headers: englishPrivateHeaders });
  } catch (error) { return englishFailure(error); }
}
