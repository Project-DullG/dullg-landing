import { collectionRecords } from "../fishing/collection.ts";
import { fishHash, studyDate } from "../fishing/growth.ts";
import { awardPracticeCatch } from "../fishing/growth.ts";
import { getQuestion, questions } from "./content.ts";
import type { FishingState } from "../fishing/model.ts";

export const repeatDecks = [
  {
    id: "read",
    title: "짧은 안내문 읽기",
    description: "출발·조식·물품 수령 안내를 읽어요.",
    ids: ["R02", "YR02", "YR04"],
  },
  {
    id: "respond",
    title: "질문에 바로 답하기",
    description: "생활 속 질문에 짧게 답해요.",
    ids: ["Q01", "YQ01", "YQ04"],
  },
  {
    id: "time",
    title: "시간과 장소 말하기",
    description: "일정표에서 시간·장소·기간을 찾아 말해요.",
    ids: ["I01", "I04", "YI04"],
  },
  {
    id: "correct",
    title: "틀린 정보 바로잡기",
    description: "질문의 잘못된 정보를 고쳐 말해요.",
    ids: ["I02", "XI05", "YI05"],
  },
  {
    id: "opinion",
    title: "선택에 이유 붙이기",
    description: "선택한 답에 이유와 예를 붙여요.",
    ids: ["O01", "YO02", "YO03"],
  },
  {
    id: "photo",
    title: "사진 속 장면 말하기",
    description: "사람의 행동과 물건의 위치를 말해요.",
    ids: ["PW01", "YP01", "YP02"],
  },
];
export type RepeatRun = {
  run: number;
  deck: string;
  ids: string[];
  step: number;
  feeding?: { catchId: string; fish: number };
};
export type RepeatProgress = {
  version: 1;
  nextRun: number;
  rounds: Record<string, number>;
  bookmarks: string[];
  active?: RepeatRun;
};
export const emptyRepeat = (): RepeatProgress => ({
  version: 1,
  nextRun: 1,
  rounds: {},
  bookmarks: [],
});
export function repeatProgress(state: FishingState): RepeatProgress {
  return state.repeat ?? emptyRepeat();
}
export type RepeatAction = {
  action: "begin" | "advance" | "abandon" | "bookmark";
  deck?: string;
  expectedRun?: number;
  run?: number;
  step?: number;
  selfReport?: boolean;
  question?: string;
  saved?: boolean;
  catchId?: string;
};
export function applyRepeat(state: FishingState, input: RepeatAction, now = new Date()) {
  if (!input || typeof input !== "object") throw new Error("연습 요청을 확인하세요.");
  const previous = repeatProgress(state);
  let rewardEligible = false;
  let feedingDone: RepeatRun["feeding"];
  const next: RepeatProgress = {
    ...previous,
    rounds: { ...previous.rounds },
    bookmarks: [...previous.bookmarks],
    ...(previous.active ? { active: { ...previous.active, ids: [...previous.active.ids] } } : {}),
  };
  if (input.action === "bookmark") {
    if (
      typeof input.question !== "string" ||
      !questions.some((q) => q.id === input.question) ||
      typeof input.saved !== "boolean"
    )
      throw new Error("다시 연습할 문항을 확인하세요.");
    if (next.bookmarks.includes(input.question) === input.saved) return { state, duplicate: true };
    next.bookmarks = next.bookmarks.filter((id) => id !== input.question);
    if (input.saved) next.bookmarks.push(input.question);
  } else if (input.action === "begin") {
    if (next.active) {
      if (
        input.expectedRun === next.active.run &&
        input.deck === next.active.deck &&
        input.catchId === next.active.feeding?.catchId
      )
        return { state, duplicate: true };
      throw new Error("진행 중인 연습을 이어서 하거나 종료한 뒤 새로 시작하세요.");
    }
    if (input.expectedRun !== next.nextRun)
      throw new Error("연습 기록이 바뀌었습니다. 다시 불러와 주세요.");
    const deck = repeatDecks.find((d) => d.id === input.deck);
    const feeding =
      input.deck === "feed"
        ? collectionRecords(state).find((c) => c.id === input.catchId)
        : undefined;
    if (input.deck === "feed" && !feeding) throw new Error("수조에 있는 물고기를 선택하세요.");
    const feedSeed = `${state.collectionSeed || "legacy"}:feed-v1:${next.nextRun}:${feeding?.id}`;
    const feedIds = questions
      .filter((q) => q.type === "respond" && q.position !== undefined && q.position < 7)
      .map((q) => q.id)
      .sort((a, b) => fishHash(`${feedSeed}:${a}`) - fishHash(`${feedSeed}:${b}`))
      .slice(0, 3);
    const ids =
      input.deck === "feed" ? feedIds : input.deck === "saved" ? next.bookmarks : deck?.ids;
    if (!ids?.length) throw new Error("먼저 다시 연습할 문항을 담아 주세요.");
    const offset = input.deck === "saved" ? ((next.rounds.saved || 0) * 3) % ids.length : 0;
    const selected = Array.from(
      { length: Math.min(3, ids.length) },
      (_, i) => ids[(offset + i) % ids.length],
    );
    if (selected.some((id) => !getQuestion(id))) throw new Error("연습 문항을 확인하세요.");
    next.active = {
      run: next.nextRun,
      deck: input.deck!,
      ids: selected,
      step: 0,
      ...(feeding ? { feeding: { catchId: feeding.id, fish: feeding.fish } } : {}),
    };
    next.nextRun++;
  } else if (input.action === "advance" || input.action === "abandon") {
    if (!Number.isSafeInteger(input.run) || input.run! < 1 || input.run! >= next.nextRun)
      throw new Error("연습 회차를 확인하세요.");
    if (!next.active || input.run !== next.active.run) return { state, duplicate: true };
    if (input.action === "abandon") delete next.active;
    else {
      if (
        !Number.isInteger(input.step) ||
        input.step! < 0 ||
        input.step! >= next.active.ids.length * 2
      )
        throw new Error("연습 단계를 확인하세요.");
      if (input.step! < next.active.step) return { state, duplicate: true };
      if (input.step !== next.active.step || input.selfReport !== true)
        throw new Error("현재 문항을 소리 내어 연습한 뒤 넘어가세요.");
      next.active.step++;
      if (next.active.step === next.active.ids.length * 2) {
        rewardEligible = new Set(next.active.ids).size >= 3;
        feedingDone = next.active.feeding;
        next.rounds[next.active.deck] = (next.rounds[next.active.deck] || 0) + 1;
        delete next.active;
      }
    }
  } else throw new Error("연습 요청을 확인하세요.");
  const result = {
    ...state,
    repeat: next,
    ...(feedingDone
      ? {
          feedingLog: {
            ...state.feedingLog,
            [feedingDone.catchId]: {
              count: (state.feedingLog?.[feedingDone.catchId]?.count || 0) + 1,
              date: studyDate(now),
              run: input.run!,
            },
          },
        }
      : {}),
  };
  return { state: rewardEligible ? awardPracticeCatch(result, now) : result, duplicate: false };
}
