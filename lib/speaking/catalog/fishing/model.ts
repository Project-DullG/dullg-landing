import { courses } from "../speaking/courses.ts";
import { getQuestion, courseQuestions as questions, taskTypes } from "../speaking/content.ts";
export const MODEL_VERSION = "fishing-v1";
export const roomNames = [
  "꺼내 말하기",
  "첫 답변·퀴즈",
  "듣고 고치기",
  "다시·바꿔 말하기",
  "오늘 정리",
];
export const unlockDays = [0, 0, 1, 3, 5, 7, 10, 14, 18, 22, 26, 30];
export const fishNames = [
  "귤빛 줄무늬",
  "노란 동그라미",
  "청록 꼬리",
  "보랏빛 지느러미",
  "분홍 복어",
  "파란 물결",
  "민트 부채",
  "산호 금붕어",
  "별무늬 보라",
  "청록 나비",
  "금빛 잉어",
  "달빛 꼬리",
  "노을 해마",
  "물결 가오리",
  "둥근 개복치",
  "반딧불 아귀",
  "레몬 상자복",
  "톱니 상어",
];
export type Step = {
  id: string;
  room: number;
  mode: "speak" | "quiz" | "coach" | "summary";
  questionId: string;
  title: string;
  instruction: string;
};
export type StudyEvent = {
  day: number;
  step: number;
  room: number;
  payload: string;
  created_at: string;
};
export type FishingState = {
  collectionSeed?: string;
  aquariumTheme?: string;
  feedingLog?: Record<string, { count: number; date: string; run?: number }>;
  catchLevels?: Record<string, number>;
  practiceCatches?: import("./growth.ts").PracticeCatch[];
  featuredCatchId?: string;
  repeat?: import("../speaking/repeat.ts").RepeatProgress;
  events: StudyEvent[];
  featured: number;
  quizzes: { day: number; first_correct: number; attempts: number }[];
};
export const emptyState = (): FishingState => ({
  events: [],
  featured: 0,
  quizzes: [],
});
export function validDay(day: unknown): day is number {
  return Number.isInteger(day) && Number(day) >= 0 && Number(day) < 30;
}
export type StudyMinutes = 60 | 90 | 120;
export function minutesForDay(
  state: FishingState,
  day: number,
  fallback: StudyMinutes = 60,
): StudyMinutes {
  try {
    const first = state.events.find((e) => e.day === day && e.step === 0);
    const n = first && JSON.parse(first.payload).minutes;
    return [60, 90, 120].includes(n) ? n : fallback;
  } catch {
    return fallback;
  }
}
export function studyIds(day: number, minutes: StudyMinutes = 60) {
  const ids = [...courses[2].days[day].ids],
    first = getQuestion(ids[0])!;
  if (minutes >= 90) {
    const extra =
      questions.find(
        (q) => q.type === first.type && !ids.includes(q.id) && q.id !== first.transfer,
      ) || questions.find((q) => !ids.includes(q.id) && q.id !== first.transfer);
    if (extra) ids.push(extra.id);
  }
  if (minutes === 120) {
    const type = taskTypes[(taskTypes.findIndex((t) => t.id === first.type) + 1) % 5].id;
    const extra =
      questions.find((q) => q.type === type && !ids.includes(q.id)) ||
      questions.find((q) => q.type !== first.type && !ids.includes(q.id));
    if (extra) ids.push(extra.id);
  }
  return ids;
}
export function stepsFor(day: number, reviewId?: string, minutes: StudyMinutes = 60): Step[] {
  if (!validDay(day)) throw new Error("올바른 학습일을 선택하세요.");
  const lesson = courses[2].days[day],
    ids = studyIds(day, minutes),
    first = getQuestion(lesson.ids[0])!;
  const review =
    reviewId && getQuestion(reviewId) ? reviewId : day ? courses[2].days[day - 1].ids[0] : first.id;
  const steps: Step[] = [
    {
      id: "review",
      room: 0,
      mode: "speak",
      questionId: review,
      title: day ? "지난 표현 꺼내 말하기" : "첫 지문 소리 내어 읽기",
      instruction: day
        ? "예문을 가린 채 지난 질문에 다시 답하세요."
        : "영어 음성을 듣고, 한글 안내를 보며 소리 내어 읽으세요.",
    },
  ];
  ids.forEach((id) =>
    steps.push({
      id: `first-${id}`,
      room: 1,
      mode: "speak",
      questionId: id,
      title: "먼저 소리 내어 답하기",
      instruction: "원문을 보고 답하세요. 어려운 구절은 듣고 따라 말하세요.",
    }),
  );
  steps.push({
    id: "quiz",
    room: 1,
    mode: "quiz",
    questionId: first.id,
    title: "답변에 필요한 내용 확인",
    instruction: "정답을 고르세요. 틀린 항목은 설명을 읽은 뒤 다시 고르세요.",
  });
  steps.push({
    id: "coach",
    room: 2,
    mode: "coach",
    questionId: first.id,
    title: "한 구절 듣고, 고쳐 말하기",
    instruction: "어려운 구절을 골라 2~3번 듣고 따라 말하세요.",
  });
  ids.forEach((id) =>
    steps.push({
      id: `retry-${id}`,
      room: 3,
      mode: "speak",
      questionId: id,
      title: "도움 없이 다시 답하기",
      instruction: "뜻·예문·한글 단서를 가렸습니다. 원자료만 보고 답변을 다시 말하세요.",
    }),
  );
  steps.push({
    id: "transfer",
    room: 3,
    mode: "speak",
    questionId: first.transfer,
    title: ids.includes(first.transfer)
      ? "다른 문항에 다시 적용하기"
      : "내용이 다른 문항에 적용하기",
    instruction: ids.includes(first.transfer)
      ? "오늘 이미 본 문항입니다. 같은 표현을 다른 내용에 맞게 바꿔 말합니다."
      : "앞의 답을 그대로 외워 말하지 말고, 바뀐 질문과 자료에 맞게 답하세요.",
  });
  steps.push({
    id: "summary",
    room: 4,
    mode: "summary",
    questionId: first.id,
    title: "오늘 답변 마무리",
    instruction: "이 질문에 한 번 더 답하고 다음에 복습할 문제를 골라 주세요.",
  });
  return steps;
}
export function dayEvents(state: FishingState, day: number) {
  return state.events.filter((e) => e.day === day).sort((a, b) => a.step - b.step);
}
export function reviewFor(state: FishingState, day: number) {
  const last = state.events.find((e) => e.day === day - 1 && e.room === 4);
  try {
    const id = last && JSON.parse(last.payload).review;
    return typeof id === "string" ? id : undefined;
  } catch {
    return undefined;
  }
}
export function roomCleared(state: FishingState, day: number, room: number) {
  const steps = stepsFor(day, reviewFor(state, day), minutesForDay(state, day)),
    events = dayEvents(state, day);
  return steps.every((s, i) => s.room !== room || events.some((e) => e.step === i));
}
export function clearedDays(state: FishingState) {
  return Array.from({ length: 30 }, (_, d) => d).filter((d) => roomCleared(state, d, 4));
}
export function activeDay(state: FishingState) {
  return Math.min(clearedDays(state).length, 29);
}
export function unlockedFish(clearCount: number) {
  return unlockDays
    .map((n, i) => ({ n, i }))
    .filter((x) => x.n <= clearCount)
    .map((x) => x.i);
}
export function fishFor(day: number, room: number) {
  const milestone = unlockDays.indexOf(day + 1);
  if (room === 4 && milestone >= 0) return milestone;
  const pool = unlockedFish(day);
  return pool[(day * 7 + room * 3) % pool.length];
}
export function catches(state: FishingState) {
  const result: { day: number; room: number; fish: number; star: boolean }[] = [];
  for (let day = 0; day < 30; day++)
    for (let room = 0; room < 5; room++)
      if (roomCleared(state, day, room))
        result.push({ day, room, fish: fishFor(day, room), star: room === 4 });
  return result;
}
export function nextUnlock(clearCount: number) {
  const i = unlockDays.findIndex((n) => n > clearCount);
  return i < 0 ? null : { fish: i, remaining: unlockDays[i] - clearCount, day: unlockDays[i] };
}
export function allowedReview(day: number, id: unknown, minutes: StudyMinutes = 60) {
  return typeof id === "string" && validDay(day) && studyIds(day, minutes).includes(id);
}
