import assert from "node:assert/strict";
import { test } from "node:test";
import {
  advanceEnglishProgress,
  advanceEnglishReview,
  emptyEnglishProgress,
  englishAnswerAccepted,
  englishDay,
  getEnglishGrowth,
  setEnglishLevel,
  validateEnglishAttempt,
} from "../lib/english/progress.ts";

const now = new Date("2026-10-14T08:00:00.000Z");
const expression = {
  id: "test-key",
  en: "The key is under the red box.",
  ko: "열쇠는 빨간 상자 아래에 있어요.",
  recall: "열쇠 위치를 전달하세요.",
  accepted: ["The key is under the red box."],
};
function version(skill) {
  return {
    passage: "The key is under the red box.",
    translation: "열쇠는 빨간 상자 아래에 있어요.",
    prompt: "열쇠를 찾으세요.",
    model: expression.en,
    ...(skill === "reading" || skill === "listening"
      ? {
          options: [
            { id: "red", text: "Red box" },
            { id: "blue", text: "Blue box" },
          ],
          correctOption: "red",
        }
      : {}),
    ...(skill === "writing" ? { keywords: [["key"], ["under", "below"], ["red box"]] } : {}),
  };
}
const episode = {
  id: "test-story",
  title: "Test",
  englishTitle: "Test",
  genre: "escape",
  genreLabel: "탈출",
  synopsis: "",
  intro: "",
  ending: "",
  takeaway: "",
  minutes: 10,
  image: "",
  imageAlt: "",
  accent: "#123",
  tasks: ["reading", "listening", "writing", "speaking"].map((skill, i) => ({
    id: `task-${i + 1}`,
    skill,
    title: "Test",
    context: "",
    feedback: "잘 전달했어요.",
    consequence: "다음 장면이 열립니다.",
    expressionIds: [expression.id],
    versions: { starter: version(skill), standard: version(skill), challenge: version(skill) },
  })),
  expressions: [expression],
};
const attempt = (taskId, extra = {}) => ({
  episodeId: episode.id,
  taskId,
  level: "standard",
  ...extra,
});
const completeFirst = () =>
  advanceEnglishProgress(emptyEnglishProgress(), attempt("task-1", { answer: "red" }), episode, now)
    .progress;

test("only a correct authored option advances the sequential episode", () => {
  const initial = emptyEnglishProgress();
  const wrong = advanceEnglishProgress(
    initial,
    attempt("task-1", { answer: "blue" }),
    episode,
    now,
  );
  assert.equal(wrong.correct, false);
  assert.equal(wrong.progress, initial);
  assert.equal(wrong.progress.xp, 0);
  assert.throws(
    () =>
      advanceEnglishProgress(initial, attempt("task-3", { answer: expression.en }), episode, now),
    { status: 409 },
  );
  const result = advanceEnglishProgress(
    initial,
    attempt("task-1", { answer: "red" }),
    episode,
    now,
  );
  assert.deepEqual(result.progress.episodes[episode.id].completedTasks, ["task-1"]);
  assert.equal(result.progress.skills.reading, 1);
  assert.equal(result.progress.xp, 20);
  assert.equal(result.consequence, episode.tasks[0].consequence);
  assert.deepEqual(initial.episodes, {});
});

test("replays and changed difficulty cannot duplicate XP or collected expressions", () => {
  const progress = completeFirst();
  const duplicate = advanceEnglishProgress(
    progress,
    attempt("task-1", { answer: "red", level: "challenge" }),
    episode,
    now,
  );
  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.progress, progress);
  assert.equal(duplicate.progress.xp, 20);
  assert.deepEqual(duplicate.progress.learnedExpressionIds, [expression.id]);
  assert.equal(duplicate.progress.dailyActivity["2026-10-14"].tasks, 1);
});

test("correct practice on another day extends activity once without farming rewards", () => {
  const progress = completeFirst();
  const tomorrow = new Date("2026-10-15T08:00:00Z");
  const practiced = advanceEnglishProgress(
    progress,
    attempt("task-1", { answer: "red" }),
    episode,
    tomorrow,
  );
  assert.equal(practiced.duplicate, true);
  assert.equal(practiced.progress.xp, progress.xp);
  assert.deepEqual(practiced.progress.skills, progress.skills);
  assert.equal(practiced.progress.dailyActivity["2026-10-15"].tasks, 1);
  assert.equal(getEnglishGrowth(practiced.progress, tomorrow).streak, 2);
  const repeated = advanceEnglishProgress(
    practiced.progress,
    attempt("task-1", { answer: "red" }),
    episode,
    tomorrow,
  );
  assert.equal(repeated.progress, practiced.progress);
  const wrong = advanceEnglishProgress(
    progress,
    attempt("task-1", { answer: "blue" }),
    episode,
    tomorrow,
  );
  assert.equal(wrong.progress, progress);
});

test("long-term learning levels continue beyond the initial story titles", () => {
  const initial = emptyEnglishProgress();
  for (const [xp, level, next] of [
    [650, 6, 950],
    [950, 7, 1250],
    [1250, 8, 1550],
  ]) {
    const growth = getEnglishGrowth({ ...initial, xp }, now);
    assert.equal(growth.level, level);
    assert.equal(growth.nextLevelXp, next);
  }
});

test("writing requires each bounded information group and rejects an opposite claim", () => {
  const keywords = version("writing");
  assert.equal(englishAnswerAccepted("The key is below the red box!", keywords), true);
  assert.equal(englishAnswerAccepted("The monkey is under the red box.", keywords), false);
  assert.equal(englishAnswerAccepted("The key is near the red box.", keywords), false);
  assert.equal(englishAnswerAccepted("The key is not under the red box.", keywords), false);
  assert.equal(
    englishAnswerAccepted("The key is under the red box. I don't know who put it there.", keywords),
    true,
  );
  assert.equal(
    englishAnswerAccepted("THE KEY IS UNDER THE RED BOX!", { accepted: [expression.en] }),
    true,
  );
  assert.equal(englishAnswerAccepted("", { accepted: [""] }), false);
});

test("speaking uses explicit self confirmation and awards no pronunciation score", () => {
  let progress = completeFirst();
  progress = advanceEnglishProgress(
    progress,
    attempt("task-2", { answer: "red" }),
    episode,
    now,
  ).progress;
  progress = advanceEnglishProgress(
    progress,
    attempt("task-3", { answer: expression.en }),
    episode,
    now,
  ).progress;
  const missing = advanceEnglishProgress(
    progress,
    attempt("task-4", { answer: expression.en }),
    episode,
    now,
  );
  assert.equal(missing.correct, false);
  const final = advanceEnglishProgress(
    progress,
    attempt("task-4", { selfConfirmed: true }),
    episode,
    now,
  );
  assert.equal(final.correct, true);
  assert.equal(final.progress.xp, 110);
  assert.equal(final.progress.episodes[episode.id].completedAt, now.toISOString());
  assert.equal(getEnglishGrowth(final.progress, now).completedEpisodes, 1);
  assert.deepEqual(final.progress.skills, { reading: 1, listening: 1, writing: 1, speaking: 1 });
  assert.equal("voiceScore" in final, false);
});

test("reject malformed task, level, and oversized answer inputs", () => {
  for (const input of [
    null,
    [],
    { ...attempt("task-1"), level: "impossible" },
    attempt("../secret"),
    attempt("task-1", { answer: "a".repeat(1201) }),
    attempt("task-1", { selfConfirmed: "yes" }),
  ]) {
    assert.throws(() => validateEnglishAttempt(input));
  }
  assert.throws(() =>
    advanceEnglishProgress(emptyEnglishProgress(), attempt("task-1"), undefined, now),
  );
  assert.throws(() =>
    advanceEnglishProgress(emptyEnglishProgress(), attempt("unknown"), episode, now),
  );
  const initial = emptyEnglishProgress();
  const saved = setEnglishLevel(initial, "starter", now);
  assert.equal(saved.preferredLevel, "starter");
  assert.equal(initial.preferredLevel, "standard");
  assert.equal(saved.xp, 0);
});

test("learned expressions become due after one day, then successful intervals grow to three and seven days", () => {
  const progress = completeFirst();
  assert.equal(progress.reviews[expression.id].dueAt, "2026-10-15T08:00:00.000Z");
  assert.throws(() => advanceEnglishReview(progress, expression, expression.en, now), {
    status: 409,
  });
  const first = advanceEnglishReview(
    progress,
    expression,
    expression.en,
    new Date("2026-10-15T08:00:00Z"),
  );
  assert.equal(first.progress.reviews[expression.id].dueAt, "2026-10-18T08:00:00.000Z");
  assert.equal(first.progress.xp, 25);
  const second = advanceEnglishReview(
    first.progress,
    expression,
    expression.en,
    new Date("2026-10-18T08:00:00Z"),
  );
  assert.equal(second.progress.reviews[expression.id].dueAt, "2026-10-25T08:00:00.000Z");
  assert.throws(
    () =>
      advanceEnglishReview(
        second.progress,
        expression,
        expression.en,
        new Date("2026-10-18T08:00:00Z"),
      ),
    { status: 409 },
  );
});

test("review failures give feedback without XP and require a new one day interval", () => {
  const result = advanceEnglishReview(
    completeFirst(),
    expression,
    "I forgot",
    new Date("2026-10-15T08:00:00Z"),
  );
  assert.equal(result.correct, false);
  assert.equal(result.progress.xp, 20);
  assert.equal(result.progress.reviews[expression.id].successes, 0);
  assert.equal(result.progress.reviews[expression.id].dueAt, "2026-10-16T08:00:00.000Z");
  assert.match(result.feedback, /The key/);
  assert.equal(result.progress.dailyActivity["2026-10-15"].reviews, 1);
});

test("unlearned and unknown expressions cannot earn review XP and daily reviews are capped", () => {
  assert.throws(() => advanceEnglishReview(emptyEnglishProgress(), expression, expression.en, now));
  assert.throws(() => advanceEnglishReview(completeFirst(), undefined, expression.en, now));
  const progress = completeFirst();
  const due = new Date("2026-10-15T08:00:00Z");
  progress.dailyActivity["2026-10-15"] = { tasks: 0, reviews: 20 };
  assert.throws(() => advanceEnglishReview(progress, expression, expression.en, due), {
    status: 429,
  });
});

test("daily activity and streak use Korean midnight and include yesterday before today's first action", () => {
  assert.equal(englishDay(new Date("2026-10-14T14:59:59Z")), "2026-10-14");
  assert.equal(englishDay(new Date("2026-10-14T15:00:00Z")), "2026-10-15");
  const progress = emptyEnglishProgress();
  progress.activeDates = ["2026-10-12", "2026-10-13", "2026-10-14"];
  assert.equal(getEnglishGrowth(progress, new Date("2026-10-14T15:00:00Z")).streak, 3);
  assert.equal(getEnglishGrowth(progress, new Date("2026-10-15T15:00:00Z")).streak, 0);
  assert.equal(getEnglishGrowth(progress, now).todayActivities, 0);
});
