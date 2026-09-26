import { collectionSummary } from "./fishing/collection.ts";
import { repeatDecks, repeatProgress } from "./speaking/repeat.ts";
import audioCatalog from "./speaking/lesson-audio.json" with { type: "json" };
import { courses, type CourseId } from "./speaking/courses.ts";
import {
  getQuestion,
  questions,
  schedules,
  soundCards,
  sources,
  taskTypes,
} from "./speaking/content.ts";
import { patternFor, plans } from "./speaking/learning.ts";
import { pronunciationFor, pronunciationSentences } from "./speaking/pronunciation-guides.ts";
import {
  activeDay,
  clearedDays,
  dayEvents,
  fishNames,
  minutesForDay,
  nextUnlock,
  reviewFor,
  roomNames,
  stepsFor,
  studyIds,
  type FishingState,
  type StudyMinutes,
} from "./fishing/model.ts";
import { quizzes } from "./fishing/quizzes.ts";

type AudioClip = {
  text: string;
  src: string;
  kind: "ai" | "human";
  reviewed?: boolean;
  ready?: boolean;
  contentChecked?: boolean;
};
function audioFor(text: string) {
  const clip = (audioCatalog.clips as AudioClip[]).find(
    (c) =>
      (c.reviewed || (c.ready && c.contentChecked)) &&
      c.text.trim().replace(/\s+/g, " ") === text.trim().replace(/\s+/g, " ") &&
      /^\/audio\/[a-zA-Z0-9_-]+\.(mp3|m4a|wav|ogg)$/.test(c.src),
  );
  return clip ? { text, kind: clip.kind, src: `/speaking/assets${clip.src}` } : null;
}
export type Selection = { course: CourseId; day: number; minutes: StudyMinutes; question?: string };
export function studySelection(
  state: FishingState,
  input: Record<string, unknown> = {},
): Selection {
  if (input.course !== undefined && !courses.some((c) => c.id === input.course))
    throw new Error("코스를 확인하세요.");
  const course =
    courses.find((c) => c.id === input.course) ||
    courses.find((c) => c.days.length > activeDay(state)) ||
    courses[2];
  const day =
    input.day === undefined
      ? Math.min(activeDay(state), course.days.length - 1)
      : Number(input.day);
  if (!Number.isInteger(day) || day < 0 || day >= course.days.length)
    throw new Error("학습일을 확인하세요.");
  const minutes = Number(input.minutes || 60);
  if (![60, 90, 120].includes(minutes)) throw new Error("학습 시간을 확인하세요.");
  const question = typeof input.question === "string" ? input.question : undefined;
  if (question && !getQuestion(question)) throw new Error("문항을 찾지 못했습니다.");
  return { course: course.id, day, minutes: minutes as StudyMinutes, question };
}
export function buildStudySnapshot(state: FishingState, selection: Selection) {
  const course = courses.find((c) => c.id === selection.course)!;
  const day = selection.day;
  const minutes = minutesForDay(state, day, selection.minutes);
  const steps = stepsFor(day, reviewFor(state, day), minutes);
  const done = dayEvents(state, day).length;
  const finished = done >= steps.length;
  const step = steps[Math.min(done, steps.length - 1)];
  const q = getQuestion(selection.question || step.questionId);
  const pattern = patternFor(q);
  const quiz = quizzes[courses[2].days[day].ids[0]];
  const collection = collectionSummary(state);
  const fish = collection.records;
  const repeat = repeatProgress(state);
  const repeatIds = new Set([
    ...repeatDecks.flatMap((d) => d.ids),
    ...repeat.bookmarks,
    ...(repeat.active?.ids || []),
  ]);
  const cleared = clearedDays(state);
  return {
    selection: { ...selection, minutes },
    courses: courses.map((c) => ({
      id: c.id,
      name: c.name,
      label: c.label,
      description: c.description,
      length: c.days.length,
    })),
    days: course.days.map((d, i) => ({
      title: d.title,
      goal: d.goal,
      done: cleared.includes(i),
      locked: i > activeDay(state),
    })),
    lesson: course.days[day],
    completed: done,
    total: steps.length,
    finished,
    activeDay: activeDay(state),
    clearedDays: cleared.length,
    started: done > 0,
    step,
    rooms: roomNames.map((name, room) => ({
      name,
      done: steps.every((s, i) => s.room !== room || i < done),
      active: !finished && step.room === room,
    })),
    question: { ...q, photo: q.photo ? `/speaking/assets/practice/${q.photo}` : undefined },
    sentences: pronunciationSentences(pronunciationFor(q)),
    example: pattern.example,
    frame: pattern.frame,
    audio: {
      full: audioFor(q.type === "read" ? q.passage! : pattern.example),
      question: audioFor(q.prompt),
    },
    schedule: q.table ? schedules[q.table] : null,
    quiz: { question: quiz.prompt, options: quiz.choices },
    reviewOptions: studyIds(day, minutes).map((id) => ({ id, title: getQuestion(id).title })),
    questionList: questions.map((item) => ({ id: item.id, title: item.title, type: item.type })),
    taskTypes,
    soundCards: soundCards.map((card) => ({ ...card, audio: audioFor(card.phrase) })),
    sources,
    plan: plans[minutes],
    fish: fishNames.map((name, id) => ({
      id,
      name,
      count: fish.filter((f) => f.fish === id).length,
      starred: fish.some((f) => f.fish === id && f.star),
      featured: state.featured === id,
    })),
    collection,
    repeat,
    repeatDecks,
    repeatItems: questions
      .filter((item) => repeatIds.has(item.id))
      .map((item) => {
        const example = patternFor(item).example;
        return {
          question: {
            ...item,
            photo: item.photo ? `/speaking/assets/practice/${item.photo}` : undefined,
          },
          sentences: pronunciationSentences(pronunciationFor(item)),
          example,
          audio: {
            full: audioFor(item.type === "read" ? item.passage! : example),
            question: audioFor(item.prompt),
          },
          schedule: item.table ? schedules[item.table] : null,
        };
      }),
    totalFish: fish.length,
    stars: fish.filter((f) => f.star).length,
    nextUnlock: nextUnlock(cleared.length),
  };
}
export type StudySnapshot = ReturnType<typeof buildStudySnapshot>;
