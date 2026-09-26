import { awardCourseGrowth } from "./growth.ts";
import { courses } from "../speaking/courses.ts";
import { quizzes } from "./quizzes.ts";
import {
  activeDay,
  allowedReview,
  minutesForDay,
  type StudyMinutes,
  dayEvents,
  reviewFor,
  stepsFor,
  validDay,
  type FishingState,
} from "./model.ts";
export type Completion = {
  day: number;
  step: number;
  answer?: number;
  review?: string;
  selfReport?: boolean;
  hintOpened?: boolean;
  minutes?: StudyMinutes;
};
export function validateCompletion(state: FishingState, input: Completion) {
  if (!validDay(input.day) || !Number.isInteger(input.step))
    throw new Error("학습 단계를 확인해 주세요.");
  if (input.minutes !== undefined && ![60, 90, 120].includes(input.minutes))
    throw new Error("학습 단계를 확인해 주세요.");
  const minutes = minutesForDay(state, input.day, input.minutes ?? 60);
  const steps = stepsFor(input.day, reviewFor(state, input.day), minutes),
    step = steps[input.step];
  if (!step) throw new Error("학습 단계를 확인해 주세요.");
  if (dayEvents(state, input.day).some((e) => e.step === input.step))
    return { step, duplicate: true };
  if (input.day !== activeDay(state) || input.step !== dayEvents(state, input.day).length)
    throw new Error("진행 기록이 바뀌었습니다. 다시 불러와 주세요.");
  if (step.mode === "quiz") {
    if (!Number.isInteger(input.answer) || input.answer! < 0 || input.answer! >= 3)
      throw new Error("답을 하나 선택해 주세요.");
  } else if (input.selfReport !== true) throw new Error("소리 내어 연습한 뒤 완료해 주세요.");
  if (step.mode === "summary" && !allowedReview(input.day, input.review, minutes))
    throw new Error("다음에 복습할 문제를 선택해 주세요.");
  return { step, duplicate: false };
}
// Pure state transition; the host applies it inside a Firestore transaction.
export function applyCompletion(state: FishingState, input: Completion) {
  const { step, duplicate } = validateCompletion(state, input);
  if (duplicate) return { state, duplicate: true };
  const quiz = quizzes[courses[2].days[input.day].ids[0]],
    correct = step.mode !== "quiz" || quiz.correct === input.answer;
  const next = {
    ...state,
    events: [...state.events],
    quizzes: [...state.quizzes],
  };
  if (step.mode === "quiz") {
    const old = next.quizzes.find((q) => q.day === input.day);
    next.quizzes = next.quizzes
      .filter((q) => q.day !== input.day)
      .concat({
        day: input.day,
        first_correct: old?.first_correct ?? (correct ? 1 : 0),
        attempts: Math.min(99, (old?.attempts ?? 0) + 1),
      });
  }
  if (correct)
    next.events.push({
      day: input.day,
      step: input.step,
      room: step.room,
      payload: JSON.stringify({
        kind: step.mode === "quiz" ? "objective" : "self-report",
        hintOpened: input.hintOpened === true,
        minutes: input.step === 0 ? (input.minutes ?? 60) : undefined,
        review: input.review,
      }),
      created_at: new Date().toISOString(),
    });
  return {
    state: awardCourseGrowth(state, next),
    correct,
    explanation: step.mode === "quiz" ? quiz.explanation : undefined,
  };
}
