import assert from "node:assert/strict";
import { test } from "node:test";
import { allEnglishContent, getEnglishEpisode } from "../lib/english/catalog.ts";
import { englishCourses, getEnglishCourse } from "../lib/english/courses.ts";
import { emptyEnglishProgress } from "../lib/english/progress.ts";
import {
  getEnglishHomePlan,
  getEnglishCourseStart,
  getEnglishContentTotals,
  getEnglishHomePreviewHref,
} from "../lib/english/home-plan.ts";
const saved = (contentId, count, extra = {}) => ({
  completedTasks: getEnglishEpisode(contentId)
    .tasks.slice(0, count)
    .map((task) => task.id),
  level: "challenge",
  updatedAt: "2026-10-15T03:00:00Z",
  ...extra,
});
const url = (href) => new URL(href, "https://example.test");

test("guests can start a real story at their own level without invented progress", () => {
  const plan = getEnglishHomePlan(null, "starter");
  assert.equal(plan.content.id, "closed-bookshop");
  assert.equal(plan.reason, "explore");
  assert.equal(plan.count, 0);
  assert.equal(url(plan.href).searchParams.get("level"), "starter");
  assert.equal(url(plan.href).searchParams.has("replay"), false);
  assert.deepEqual(getEnglishContentTotals(null), { stories: 0, practices: 0, expressions: 0 });
});
test("story preview links retain saved difficulty, while new or completed works respect the selected level", () => {
  const progress = emptyEnglishProgress();
  progress.episodes["closed-bookshop"] = saved("closed-bookshop", 2);
  assert.equal(
    url(getEnglishHomePreviewHref("closed-bookshop", progress, "starter")).searchParams.get(
      "level",
    ),
    "challenge",
  );
  assert.equal(
    url(getEnglishHomePreviewHref("closed-bookshop", null, "starter")).searchParams.get("level"),
    "starter",
  );
  progress.episodes["closed-bookshop"] = saved("closed-bookshop", 11);
  assert.equal(
    url(getEnglishHomePreviewHref("closed-bookshop", progress, "standard")).searchParams.get(
      "level",
    ),
    "standard",
  );
  assert.equal(getEnglishHomePreviewHref("retired-work", progress, "standard"), null);
});
test("a new account starts with an actual first course activity rather than fabricated recommendations", () => {
  const progress = emptyEnglishProgress(),
    snapshot = structuredClone(progress);
  const plan = getEnglishHomePlan(progress, "standard");
  assert.equal(plan.reason, "first-step");
  assert.equal(plan.content.id, "sentence-requests");
  assert.equal(plan.courseId, "first-steps");
  assert.deepEqual(progress, snapshot);
});
test("the most recently started unfinished story or practice takes priority and preserves its level and course", () => {
  const progress = emptyEnglishProgress();
  progress.episodes["closed-bookshop"] = saved("closed-bookshop", 2, {
    updatedAt: "2026-10-14T03:00:00Z",
  });
  progress.episodes["conversation-airport"] = saved("conversation-airport", 1, {
    courseId: "everyday-english",
  });
  const plan = getEnglishHomePlan(progress, "starter");
  assert.equal(plan.content.id, "conversation-airport");
  assert.equal(plan.reason, "continue");
  assert.equal(plan.level, "challenge");
  assert.equal(plan.count, 1);
  assert.equal(url(plan.href).searchParams.get("course"), "everyday-english");
  assert.equal(url(plan.href).searchParams.get("level"), "challenge");
});
test("older completion timestamps never suppress added story activities or inflate finished totals", () => {
  const progress = emptyEnglishProgress();
  progress.episodes["closed-bookshop"] = saved("closed-bookshop", 5, {
    completedAt: "2026-10-14T03:00:00Z",
  });
  assert.equal(getEnglishHomePlan(progress, "starter").reason, "continue");
  assert.equal(getEnglishContentTotals(progress).stories, 0);
});
test("a completed unit moves to the next actual unit in its course, skipping other completed units", () => {
  const progress = emptyEnglishProgress(),
    course = getEnglishCourse("everyday-english");
  for (const unit of course.units.slice(0, 2)) {
    const content = getEnglishEpisode(unit.contentId);
    progress.episodes[content.id] = saved(content.id, content.tasks.length, {
      courseId: course.id,
    });
  }
  const plan = getEnglishHomePlan(progress, "starter");
  assert.equal(plan.reason, "course-next");
  assert.equal(plan.courseId, course.id);
  assert.equal(plan.content.id, course.units[2].contentId);
  assert.equal(plan.level, "starter");
});
test("a fully completed catalogue offers explicit replay, and expression totals exclude obsolete or duplicate IDs", () => {
  const progress = emptyEnglishProgress();
  for (const content of allEnglishContent)
    progress.episodes[content.id] = saved(content.id, content.tasks.length);
  const expression = allEnglishContent[0].expressions[0].id;
  progress.learnedExpressionIds = [expression, expression, "retired-expression"];
  assert.equal(getEnglishHomePlan(progress, "challenge").reason, "replay");
  assert.equal(url(getEnglishHomePlan(progress, "challenge").href).searchParams.get("replay"), "1");
  assert.deepEqual(getEnglishContentTotals(progress), {
    stories: 6,
    practices: 19,
    expressions: 1,
  });
});
test("course starts keep saved difficulty for ongoing units and replay complete courses without mutation", () => {
  const progress = emptyEnglishProgress(),
    course = englishCourses[0],
    contentId = course.units[0].contentId;
  progress.episodes[contentId] = saved(contentId, 1);
  assert.equal(
    url(getEnglishCourseStart(course.id, progress, "starter").href).searchParams.get("level"),
    "challenge",
  );
  for (const unit of course.units) {
    const content = getEnglishEpisode(unit.contentId);
    progress.episodes[content.id] = saved(content.id, content.tasks.length);
  }
  const snapshot = structuredClone(progress),
    start = getEnglishCourseStart(course.id, progress, "starter");
  assert.equal(start.state.allComplete, true);
  assert.equal(url(start.href).searchParams.get("replay"), "1");
  assert.deepEqual(progress, snapshot);
  assert.equal(getEnglishCourseStart("not-a-course", progress, "starter"), null);
});
