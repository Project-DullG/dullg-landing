import { NextResponse } from "next/server";
import { speakingAccess, privateHeaders, sameOrigin } from "@/lib/speaking/access/server";
import {
  studySnapshot,
  completeStudy,
  featureFish,
  decorateAquarium,
  updateRepeat,
  StudyInputError,
} from "@/lib/speaking/server";
import { buildStudySnapshot, studySelection } from "@/lib/speaking/catalog/view";
import { emptyState } from "@/lib/speaking/catalog/fishing/model";
import { matchesAccessCode } from "@/lib/speaking/access/token";

export const dynamic = "force-dynamic";
const json = (value: object, status = 200) =>
  NextResponse.json(value, { status, headers: privateHeaders });
async function access(request: Request) {
  const result = await speakingAccess();
  return result.status === "ready" &&
    matchesAccessCode(request.headers.get("X-Speaking-Session") || "", result.sessionKey)
    ? result.session.uid
    : null;
}
export async function GET(request: Request) {
  try {
    const uid = await access(request);
    if (!uid) return json({ error: "접속 시간이 만료되었습니다. 다시 인증해 주세요." }, 401);
    const input = Object.fromEntries(new URL(request.url).searchParams);
    return json({ snapshot: await studySnapshot(uid, input) });
  } catch {
    return json({ error: "학습 기록을 불러오지 못했습니다. 잠시 후 다시 시도하세요." }, 503);
  }
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "페이지를 새로고침해 주세요." }, 403);
  try {
    const uid = await access(request);
    if (!uid) return json({ error: "접속 시간이 만료되었습니다. 다시 인증해 주세요." }, 401);
    const raw = await request.text();
    if (raw.length > 8192) return json({ error: "입력 내용을 확인하세요." }, 400);
    const input = JSON.parse(raw);
    if (input?.kind === "repeat") {
      let selection;
      try {
        selection = studySelection(emptyState(), input.selection ?? {});
      } catch {
        return json({ error: "화면을 다시 불러와 주세요." }, 400);
      }
      const result = await updateRepeat(uid, input.repeat);
      return json({
        snapshot: buildStudySnapshot(result.state, selection),
        duplicate: result.duplicate,
      });
    }
    if (
      !input ||
      !input.selection ||
      typeof input.selection !== "object" ||
      Array.isArray(input.selection)
    )
      return json({ error: "학습일을 선택하세요." }, 400);
    let selection;
    try {
      selection = studySelection(emptyState(), input.selection);
    } catch {
      return json({ error: "코스·학습일·시간을 확인하세요." }, 400);
    }
    if (input.kind === "aquarium") {
      const state = await decorateAquarium(uid, input.theme);
      return json({ snapshot: buildStudySnapshot(state, selection) });
    }
    if (input.kind === "feature") {
      const state = await featureFish(uid, input.fish, input.catchId);
      return json({ snapshot: buildStudySnapshot(state, selection) });
    }
    if (input.kind !== "complete" || !input.completion || typeof input.completion !== "object")
      return json({ error: "학습 단계를 확인하세요." }, 400);
    const result = await completeStudy(uid, input.completion);
    return json({
      snapshot: buildStudySnapshot(result.state, selection),
      correct: result.correct,
      explanation: result.explanation,
      duplicate: result.duplicate,
    });
  } catch (error) {
    if (error instanceof SyntaxError) return json({ error: "입력 내용을 확인하세요." }, 400);
    if (error instanceof StudyInputError) return json({ error: error.message }, 400);
    return json({ error: "저장을 완료하지 못했습니다. 기록을 다시 불러온 뒤 시도하세요." }, 503);
  }
}
