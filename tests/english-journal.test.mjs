import assert from "node:assert/strict";
import { test } from "node:test";
import { allEnglishContent, getEnglishEpisode } from "../lib/english/catalog.ts";
import { advanceEnglishProgress, emptyEnglishProgress } from "../lib/english/progress.ts";
import { getCourseHref } from "../lib/english/courses.ts";
import {
  filterEnglishExpressionNotes,
  getEnglishContinuation,
  getEnglishExpressionNotes,
  getEnglishLearningRecords,
  getEnglishWeek,
} from "../lib/english/journal.ts";

function recorded(content, at, extra = {}) {
  return { completedTasks: [content.tasks[0].id], level: "challenge", updatedAt: at, ...extra };
}
test("continuation finds the most recent real practice and retains its saved level", () => {
  const progress = emptyEnglishProgress();
  const story = getEnglishEpisode("closed-bookshop"),
    practice = getEnglishEpisode("conversation-airport");
  progress.episodes[story.id] = recorded(story, "2026-10-14T03:00:00Z");
  progress.episodes[practice.id] = recorded(practice, "2026-10-14T04:00:00Z", {
    courseId: "everyday-english",
  });
  const next = getEnglishContinuation(progress);
  assert.equal(next.content.id, practice.id);
  assert.equal(next.level, "challenge");
  assert.equal(next.completedCount, 1);
  assert.equal(next.courseId, "everyday-english");
  assert.equal(
    new URL(
      getCourseHref(next.content.id, next.level, { courseId: next.courseId }),
      "https://site.example",
    ).searchParams.get("course"),
    "everyday-english",
  );
});
test("course attempts retain the selected course when the next valid activity omits that optional field", () => {
  const item = getEnglishEpisode("closed-bookshop"),
    now = new Date("2026-10-14T03:00:00Z");
  const attempt = (task, extra = {}) => ({
    episodeId: item.id,
    taskId: task.id,
    level: "starter",
    answer: task.versions.starter.correctOption || task.versions.starter.model,
    ...extra,
  });
  let result = advanceEnglishProgress(
    emptyEnglishProgress(),
    attempt(item.tasks[0], { courseId: "first-steps" }),
    item,
    now,
  );
  assert.equal(result.correct, true);
  assert.equal(result.progress.episodes[item.id].courseId, "first-steps");
  assert.equal(result.progress.xp, 20);
  result = advanceEnglishProgress(result.progress, attempt(item.tasks[1]), item, now);
  assert.equal(result.correct, true);
  assert.equal(result.progress.episodes[item.id].courseId, "first-steps");
  assert.equal(result.progress.xp, 40);
  for (const courseId of [null, "", "../first-steps", ["first-steps"]])
    assert.throws(
      () =>
        advanceEnglishProgress(result.progress, attempt(item.tasks[2], { courseId }), item, now),
      /코스/,
    );
});
test("historical completion timestamps and foreign task IDs cannot hide new activities", () => {
  const progress = emptyEnglishProgress(),
    story = getEnglishEpisode("closed-bookshop");
  progress.episodes[story.id] = recorded(story, "2026-10-14T03:00:00Z", {
    completedAt: "2026-10-01",
    completedTasks: [story.tasks[0].id, "foreign", "foreign", "foreign"],
  });
  progress.episodes["retired-unregistered"] = {
    completedTasks: ["one"],
    level: "starter",
    updatedAt: "2026-10-14T08:00:00Z",
  };
  assert.equal(getEnglishContinuation(progress).content.id, story.id);
  assert.equal(getEnglishLearningRecords(progress).length, 1);
  assert.equal(getEnglishContinuation(progress).completedCount, 1);
  progress.episodes[story.id].completedTasks = story.tasks.map((task) => task.id);
  assert.equal(getEnglishContinuation(progress), undefined);
});
test("a later day of repeat practice is included in recent study without a fabricated time of day", () => {
  const progress = emptyEnglishProgress(),
    item = getEnglishEpisode("sentence-requests");
  progress.episodes[item.id] = recorded(item, "2026-10-01T03:00:00Z");
  progress.practiceDates[item.tasks[0].id] = "2026-10-14";
  const record = getEnglishLearningRecords(progress)[0];
  assert.equal(record.updatedAt, Date.parse("2026-10-14T00:00:00+09:00"));
  progress.practiceDates[item.tasks[0].id] = "2026-02-30";
  assert.equal(
    getEnglishLearningRecords(progress)[0].updatedAt,
    Date.parse("2026-10-01T03:00:00Z"),
  );
});
test("weekly activity follows Korean midnight across month boundaries without inventing legacy counts", () => {
  const progress = emptyEnglishProgress();
  progress.dailyActivity = {
    "2026-09-30": { tasks: 2, reviews: 3 },
    "2026-10-01": { tasks: 4, reviews: 1 },
    "2026-10-02": { tasks: -4, reviews: NaN },
  };
  progress.activeDates = ["2026-09-29"];
  const before = getEnglishWeek(progress, new Date("2026-09-30T14:59:59Z"));
  const after = getEnglishWeek(progress, new Date("2026-09-30T15:00:00Z"));
  assert.equal(before.at(-1).day, "2026-09-30");
  assert.equal(after.at(-1).day, "2026-10-01");
  assert.deepEqual(after.at(-1), {
    day: "2026-10-01",
    tasks: 4,
    reviews: 1,
    total: 5,
    active: true,
  });
  const legacy = after.find((day) => day.day === "2026-09-29");
  assert.equal(legacy.active, true);
  assert.equal(legacy.total, 0);
  assert.deepEqual(getEnglishWeek(progress, new Date("2026-10-02T03:00:00Z")).at(-1), {
    day: "2026-10-02",
    tasks: 0,
    reviews: 0,
    total: 0,
    active: false,
  });
});
test("expression notes expose only registered learned expressions, searchable in both languages and by source", () => {
  const progress = emptyEnglishProgress(),
    story = getEnglishEpisode("closed-bookshop"),
    practice = getEnglishEpisode("sentence-relationships");
  const first = story.expressions[0],
    second = practice.expressions[0];
  progress.learnedExpressionIds = [first.id, first.id, second.id, "unknown"];
  progress.reviews[first.id] = { dueAt: "2026-10-15T03:00:00Z", successes: 2 };
  progress.reviews[second.id] = { dueAt: "2026-10-14T03:00:00Z", successes: 0 };
  const notes = getEnglishExpressionNotes(progress, new Date("2026-10-14T04:00:00Z"));
  assert.equal(notes.length, 2);
  assert.equal(notes[0].expression.id, second.id);
  assert.deepEqual(
    filterEnglishExpressionNotes(notes, { query: "ADDRESS", dueOnly: true }).map(
      (note) => note.expression.id,
    ),
    [second.id],
  );
  assert.equal(
    filterEnglishExpressionNotes(notes, { query: "주소", source: practice.id }).length,
    1,
  );
  assert.equal(filterEnglishExpressionNotes(notes, { source: story.id, dueOnly: true }).length, 0);
  assert.equal(getEnglishExpressionNotes(emptyEnglishProgress()).length, 0);
  assert.equal(
    allEnglishContent.reduce((sum, item) => sum + item.expressions.length, 0),
    65,
  );
});
