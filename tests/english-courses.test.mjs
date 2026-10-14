import assert from "node:assert/strict";
import { test } from "node:test";
import { allEnglishContent, getEnglishEpisode } from "../lib/english/catalog.ts";
import {
  coursesEnglishDictionary,
  englishCourses,
  getCourseFollowUp,
  getCourseHref,
  getCourseState,
  getEnglishCourse,
} from "../lib/english/courses.ts";
import { englishPracticePacks } from "../lib/english/practice.ts";
import {
  advanceEnglishProgress,
  emptyEnglishProgress,
  setEnglishLevel,
} from "../lib/english/progress.ts";

const firstCourse = getEnglishCourse("first-steps");
const now = new Date("2026-10-14T03:00:00.000Z");
function record(contentId, completedTasks, updatedAt = now.toISOString(), extra = {}) {
  assert.ok(getEnglishEpisode(contentId));
  return { completedTasks, level: "standard", updatedAt, ...extra };
}
function completedProgress(course) {
  const progress = emptyEnglishProgress();
  for (const unit of course.units) {
    const content = getEnglishEpisode(unit.contentId);
    progress.episodes[content.id] = record(
      content.id,
      content.tasks.map((task) => task.id),
    );
  }
  return progress;
}
function firstAttempt(progress, contentId, date = now, level = "standard") {
  const content = getEnglishEpisode(contentId);
  const task = content.tasks[0];
  const version = task.versions[level];
  const result = advanceEnglishProgress(
    progress,
    {
      episodeId: contentId,
      taskId: task.id,
      level,
      ...(task.skill === "speaking"
        ? { selfConfirmed: true }
        : { answer: version.options?.length ? version.correctOption : version.model }),
    },
    content,
    date,
  );
  assert.equal(result.correct, true);
  return result.progress;
}
function link(href) {
  assert.equal(typeof href, "string");
  return new URL(href, "https://example.test");
}

test("four curated courses cover the existing registry without duplicate units or new works", () => {
  assert.equal(englishCourses.length, 4);
  assert.equal(new Set(englishCourses.map((course) => course.id)).size, 4);
  const curated = new Set();
  for (const course of englishCourses) {
    assert.ok(course.units.length >= 6 && course.units.length <= 8);
    assert.equal(new Set(course.units.map((unit) => unit.contentId)).size, course.units.length);
    for (const unit of course.units) {
      const content = getEnglishEpisode(unit.contentId);
      assert.ok(content, unit.contentId);
      assert.ok(content.tasks.length > 0);
      assert.ok(content.tasks.every((task) => task.versions.starter));
      curated.add(content.id);
    }
  }
  assert.deepEqual([...curated].sort(), allEnglishContent.map((item) => item.id).sort());
  assert.ok(!allEnglishContent.some((item) => getEnglishCourse(item.id)));
});

test("the reading course includes every reading pack followed by the postal story", () => {
  const course = getEnglishCourse("read-and-respond");
  const readingIds = englishPracticePacks
    .filter((pack) => pack.practiceFormat === "reading")
    .map((pack) => pack.id);
  assert.deepEqual(
    course.units
      .slice(0, -1)
      .map((unit) => unit.contentId)
      .sort(),
    readingIds.sort(),
  );
  assert.equal(course.units.at(-1).contentId, "moonlight-post");
  const covered = new Set(
    englishCourses.flatMap((item) => item.units.map((unit) => unit.contentId)),
  );
  for (const id of [
    "sentence-relationships",
    "sentence-requests",
    "sentence-directions",
    "sentence-reasons",
  ])
    assert.ok(covered.has(id), id);
});

test("course purposes and ordering rationales have explicit Korean and English copy", () => {
  for (const course of englishCourses) {
    for (const value of [
      course.title,
      course.description,
      course.purpose,
      ...course.units.map((unit) => unit.rationale),
    ]) {
      assert.ok(/[가-힣]/u.test(value.ko));
      assert.ok(value.en.length > 0 && !/[가-힣]/u.test(value.en));
      assert.equal(coursesEnglishDictionary[value.ko], value.en);
    }
  }
});

test("a guest has no invented activity and can open any unit at any difficulty", () => {
  for (const course of englishCourses) {
    const state = getCourseState(course, null);
    assert.equal(state.completedUnits, 0);
    assert.equal(state.totalUnits, course.units.length);
    assert.equal(state.percent, 0);
    assert.equal(state.allComplete, false);
    assert.equal(state.nextUnit.contentId, course.units[0].contentId);
    assert.ok(state.units.every((unit) => unit.count === 0 && !unit.completed && !unit.inProgress));
    assert.equal(
      link(getCourseHref(course.units.at(-1).contentId, "challenge")).searchParams.get("level"),
      "challenge",
    );
  }
  assert.deepEqual(getCourseState(firstCourse, undefined), getCourseState(firstCourse, null));
});

test("the recommendation resumes the most recently progressed incomplete unit", () => {
  const earlier = firstCourse.units[0].contentId;
  const later = firstCourse.units[4].contentId;
  let progress = firstAttempt(emptyEnglishProgress(), earlier, new Date("2026-10-13T03:00:00Z"));
  progress = firstAttempt(progress, later, now);
  const before = structuredClone(progress);
  const state = getCourseState(firstCourse, progress);
  assert.equal(state.nextUnit.contentId, later);
  assert.equal(state.nextUnit.inProgress, true);
  assert.equal(state.nextUnit.count, 1);
  assert.ok(state.percent > 0 && state.percent < 100);
  assert.deepEqual(progress, before);

  progress.episodes[later].completedTasks = getEnglishEpisode(later).tasks.map((task) => task.id);
  assert.equal(getCourseState(firstCourse, progress).nextUnit.contentId, earlier);
});

test("without an incomplete started unit, the first current incomplete unit is suggested", () => {
  const progress = emptyEnglishProgress();
  const first = getEnglishEpisode(firstCourse.units[0].contentId);
  progress.episodes[first.id] = record(
    first.id,
    first.tasks.map((task) => task.id),
  );
  // A recently touched retired task does not count as having started today's content.
  const retired = firstCourse.units[5].contentId;
  progress.episodes[retired] = record(retired, ["retired-task"], "2026-10-15T03:00:00Z", {
    completedAt: "2026-10-15T03:00:00Z",
  });
  const state = getCourseState(firstCourse, progress);
  assert.equal(state.completedUnits, 1);
  assert.equal(state.nextUnit.contentId, firstCourse.units[1].contentId);
  assert.equal(state.units[5].count, 0);
  assert.equal(state.units[5].inProgress, false);
  assert.equal(state.units[5].completed, false);
});

test("ties and invalid activity dates produce a stable recommendation in course order", () => {
  const progress = emptyEnglishProgress();
  const ids = firstCourse.units.slice(2, 4).map((unit) => unit.contentId);
  for (const id of ids)
    progress.episodes[id] = record(id, [getEnglishEpisode(id).tasks[0].id], "bad date");
  assert.equal(getCourseState(firstCourse, progress).nextUnit.contentId, ids[0]);
  for (const id of ids) progress.episodes[id].updatedAt = now.toISOString();
  assert.equal(getCourseState(firstCourse, progress).nextUnit.contentId, ids[0]);
});

test("a historic five-task bookshop completion reopens its current missing tasks without changing saved data", () => {
  const progress = completedProgress(firstCourse);
  const bookshop = getEnglishEpisode("closed-bookshop");
  const originalFive = [
    "bookshop-notice",
    "bookshop-message",
    "bookshop-intercom",
    "bookshop-release",
    "bookshop-goodbye",
  ];
  assert.ok(originalFive.every((id) => bookshop.tasks.some((task) => task.id === id)));
  assert.ok(bookshop.tasks.length > originalFive.length);
  progress.xp = 130;
  progress.episodes[bookshop.id] = record(
    bookshop.id,
    [
      ...originalFive,
      ...Array.from(
        { length: bookshop.tasks.length - originalFive.length },
        (_, i) => `retired-${i}`,
      ),
    ],
    now.toISOString(),
    { completedAt: "2026-10-01T03:00:00Z", completionRewarded: true },
  );
  const before = structuredClone(progress);
  const state = getCourseState(firstCourse, progress);
  const unit = state.units.find((item) => item.contentId === bookshop.id);
  assert.equal(unit.count, 5);
  assert.equal(unit.total, bookshop.tasks.length);
  assert.equal(unit.completed, false);
  assert.equal(unit.inProgress, true);
  assert.equal(state.completedUnits, firstCourse.units.length - 1);
  assert.equal(state.allComplete, false);
  assert.ok(state.percent < 100);
  assert.equal(state.nextUnit.contentId, bookshop.id);
  assert.deepEqual(progress, before);
});

test("duplicate or unknown completed IDs cannot substitute for required current IDs", () => {
  const content = getEnglishEpisode(firstCourse.units[0].contentId);
  const progress = emptyEnglishProgress();
  progress.episodes[content.id] = record(
    content.id,
    Array(content.tasks.length).fill(content.tasks[0].id),
    now.toISOString(),
    { completedAt: now.toISOString() },
  );
  const unit = getCourseState(firstCourse, progress).units[0];
  assert.equal(unit.count, 1);
  assert.equal(unit.completed, false);
  progress.episodes[content.id].completedTasks = content.tasks.map((task) => `old-${task.id}`);
  assert.equal(getCourseState(firstCourse, progress).units[0].count, 0);
});

test("all current tasks complete a course even without completion timestamps, with review kept separate", () => {
  for (const course of englishCourses) {
    const progress = completedProgress(course);
    const state = getCourseState(course, progress);
    assert.equal(state.completedUnits, course.units.length);
    assert.equal(state.percent, 100);
    assert.equal(state.allComplete, true);
    assert.equal(state.nextUnit, undefined);
    assert.ok(state.units.every((unit) => unit.completed && !unit.inProgress));
    const review = link(
      getCourseHref(course.units[0].contentId, progress.preferredLevel, {
        replay: true,
        courseId: course.id,
      }),
    );
    assert.equal(review.searchParams.get("replay"), "1");
    assert.equal(review.searchParams.get("course"), course.id);
  }
});

test("course links use the registered route and retain the chosen or saved learning level", () => {
  for (const content of allEnglishContent) {
    for (const level of ["starter", "standard", "challenge"]) {
      const url = link(getCourseHref(content.id, level));
      assert.equal(
        url.pathname,
        `/english/${content.format === "practice" ? "practice" : "play"}/${content.id}`,
      );
      assert.equal(url.searchParams.get("level"), level);
      assert.equal(url.searchParams.has("replay"), false);
    }
  }
  const id = firstCourse.units[0].contentId;
  let progress = firstAttempt(emptyEnglishProgress(), id, now, "challenge");
  progress = setEnglishLevel(progress, "starter", now);
  const next = getCourseState(firstCourse, progress).nextUnit;
  assert.equal(next.contentId, id);
  const resume = link(
    getCourseHref(next.contentId, progress.episodes[next.contentId].level, {
      courseId: firstCourse.id,
    }),
  );
  assert.equal(resume.searchParams.get("level"), "challenge");
  assert.equal(resume.searchParams.get("course"), "first-steps");
  const fresh = link(getCourseHref(firstCourse.units[1].contentId, progress.preferredLevel));
  assert.equal(fresh.searchParams.get("level"), "starter");
});

test("unknown targets and invalid levels cannot create links, and unrelated course queries are omitted", () => {
  for (const id of [
    "unknown-story",
    "../../community",
    "raincheck-cafe?level=challenge",
    "__proto__",
  ])
    assert.equal(getCourseHref(id, "standard"), null);
  assert.equal(getCourseHref("closed-bookshop", "unknown"), null);
  assert.equal(getCourseHref("closed-bookshop", "starter&replay=1"), null);
  assert.equal(getEnglishCourse("not-a-course"), undefined);
  const invalid = link(
    getCourseHref("closed-bookshop", "standard", {
      courseId: "first-steps&replay=1",
      replay: false,
    }),
  );
  assert.equal(invalid.searchParams.has("course"), false);
  assert.equal(invalid.searchParams.has("replay"), false);
  const unrelated = link(
    getCourseHref("closed-bookshop", "standard", { courseId: "read-and-respond" }),
  );
  assert.equal(unrelated.searchParams.has("course"), false);
});

test("invalid authored course units fail visibly rather than becoming falsely complete", () => {
  assert.throws(
    () =>
      getCourseState(
        {
          ...firstCourse,
          units: [{ contentId: "unknown-content", rationale: firstCourse.purpose }],
        },
        emptyEnglishProgress(),
      ),
    RangeError,
  );
  assert.throws(
    () =>
      getCourseState({ ...firstCourse, units: [firstCourse.units[0], firstCourse.units[0]] }, null),
    RangeError,
  );
  const empty = getCourseState({ ...firstCourse, units: [] }, null);
  assert.equal(empty.allComplete, false);
  assert.equal(empty.percent, 0);
  assert.equal(empty.nextUnit, undefined);
});

test("a guest proceeds from the first unit to the second and the second to the third", () => {
  for (const course of englishCourses) {
    assert.equal(
      getCourseFollowUp(course, null, course.units[0].contentId, false).contentId,
      course.units[1].contentId,
    );
    assert.equal(
      getCourseFollowUp(course, undefined, course.units[1].contentId, false).contentId,
      course.units[2].contentId,
    );
  }
});

test("a guest's page-local completion never sends them back to an earlier unsaved unit", () => {
  const course = firstCourse;
  const second = getEnglishEpisode(course.units[1].contentId);
  const ephemeral = emptyEnglishProgress();
  ephemeral.episodes[second.id] = record(
    second.id,
    second.tasks.map((task) => task.id),
  );
  assert.equal(getCourseState(course, ephemeral).nextUnit.contentId, course.units[0].contentId);
  const before = structuredClone(ephemeral);
  assert.equal(
    getCourseFollowUp(course, ephemeral, second.id, false).contentId,
    course.units[2].contentId,
  );
  assert.equal(
    getCourseFollowUp(course, ephemeral, course.units[5].contentId, false).contentId,
    course.units[6].contentId,
  );
  assert.deepEqual(ephemeral, before);
});

test("the final guest unit has no follow-up, and unknown or unrelated current content is rejected", () => {
  for (const course of englishCourses)
    assert.equal(getCourseFollowUp(course, null, course.units.at(-1).contentId, false), undefined);
  assert.equal(getCourseFollowUp(firstCourse, null, "unknown-content", false), undefined);
  assert.equal(getCourseFollowUp(firstCourse, null, "raincheck-cafe", false), undefined);
});

test("a saved account follows its recent unfinished work rather than the current unit's next index", () => {
  const course = firstCourse;
  const earlier = course.units[1].contentId;
  const recent = course.units[5].contentId;
  let progress = firstAttempt(emptyEnglishProgress(), earlier, new Date("2026-10-13T03:00:00Z"));
  progress = firstAttempt(progress, recent, now);
  assert.equal(
    getCourseFollowUp(course, progress, course.units[3].contentId, true).contentId,
    recent,
  );
  assert.equal(
    getCourseFollowUp(course, progress, course.units[6].contentId, true).contentId,
    recent,
  );
  progress.episodes[recent].completedTasks = getEnglishEpisode(recent).tasks.map((task) => task.id);
  assert.equal(getCourseFollowUp(course, progress, recent, true).contentId, earlier);
  progress.episodes[earlier].completedTasks = getEnglishEpisode(earlier).tasks.map(
    (task) => task.id,
  );
  assert.equal(
    getCourseFollowUp(course, progress, course.units[6].contentId, true).contentId,
    course.units[0].contentId,
  );
});

test("a fully completed saved course has no follow-up", () => {
  for (const course of englishCourses)
    assert.equal(
      getCourseFollowUp(course, completedProgress(course), course.units[2].contentId, true),
      undefined,
    );
});
