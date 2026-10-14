import assert from "node:assert/strict";
import { test } from "node:test";
import { allEnglishContent } from "../lib/english/catalog.ts";
import { englishDiscoveryLibrary } from "../lib/english/discovery-library.ts";
import {
  defaultLibraryFilters,
  filterDiscoveryItems,
  getDiscoveryStatus,
  libraryHref,
  parseLibrarySearch,
} from "../lib/english/discovery.ts";
import { emptyEnglishProgress } from "../lib/english/progress.ts";
import { englishCourses } from "../lib/english/courses.ts";
import { translateText } from "../lib/i18n/translate.ts";

const items = englishDiscoveryLibrary();
const filter = (changes, progress = null) =>
  filterDiscoveryItems(items, { ...defaultLibraryFilters, ...changes }, progress);
const book = items.find((item) => item.id === "closed-bookshop");

test("the library exposes all existing works and current task IDs without exercise solutions or endings", () => {
  assert.equal(items.length, 25);
  assert.equal(
    items.reduce((count, item) => count + item.taskIds.length, 0),
    139,
  );
  assert.deepEqual(
    items.map((item) => item.id),
    allEnglishContent.map((item) => item.id),
  );
  for (const item of items) {
    const original = allEnglishContent.find((content) => content.id === item.id);
    assert.deepEqual(
      item.taskIds,
      original.tasks.map((task) => task.id),
    );
    assert.deepEqual(item.skills, [...new Set(original.tasks.map((task) => task.skill))]);
    assert.deepEqual(
      item.courseIds,
      englishCourses
        .filter((course) => course.units.some((unit) => unit.contentId === item.id))
        .map((course) => course.id),
    );
    function inspect(value) {
      if (!value || typeof value !== "object") return;
      for (const [key, child] of Object.entries(value)) {
        assert.ok(
          ![
            "tasks",
            "versions",
            "correctOption",
            "accepted",
            "keywords",
            "model",
            "ending",
            "takeaway",
            "chapters",
            "debrief",
          ].includes(key),
          `${item.id}: exposed ${key}`,
        );
        inspect(child);
      }
    }
    inspect(item);
  }
});

test("format filters match the 6 stories and 19 focused packs, and combine with real activity areas", () => {
  for (const [kind, count] of [
    ["story", 6],
    ["conversation", 6],
    ["sentence", 7],
    ["reading", 6],
  ])
    assert.equal(filter({ kind }).length, count);
  const selected = filter({ kind: "sentence", skill: "reading" });
  assert.ok(selected.length > 0);
  for (const item of selected) {
    assert.equal(item.kind, "sentence");
    assert.ok(item.skills.includes("reading"));
  }
  assert.ok(
    !filter({ kind: "sentence", skill: "reading" }).some((item) => item.id === "sentence-requests"),
  );
});

test("search accepts Korean goals and English titles, case, full-width text and multiple terms", () => {
  assert.deepEqual(
    filter({ query: "ＳＥＶＥＮ   locker" }).map((item) => item.id),
    ["locker-seven"],
  );
  assert.ok(filter({ query: book.guide.goal.ko }).some((item) => item.id === book.id));
  assert.ok(filter({ query: book.guide.fit.en.toUpperCase() }).some((item) => item.id === book.id));
  for (const item of items)
    for (const sample of Object.values(item.guide.sample)) {
      assert.ok(filter({ query: sample.en }).some((result) => result.id === item.id));
      assert.ok(filter({ query: sample.ko }).some((result) => result.id === item.id));
    }
  assert.equal(filter({ query: "unrelated-no-content" }).length, 0);
  for (const query of ["카페", "공항", "도서관"])
    assert.ok(filter({ query }).length > 0, query + ": search example must find real content");
  assert.ok(filter({ query: "실전 회화" }).every((item) => item.kind === "conversation"));
});

test("duration filters use the stated estimates, including 5- and 10-minute boundaries", () => {
  const mock = [4, 5, 6, 10, 11].map((minutes) => ({ ...book, id: "minutes-" + minutes, minutes }));
  const find = (pace) =>
    filterDiscoveryItems(mock, { ...defaultLibraryFilters, pace }, null).map(
      (item) => item.minutes,
    );
  assert.deepEqual(find("quick"), [4, 5]);
  assert.deepEqual(find("short"), [4, 5, 6, 10]);
  assert.deepEqual(find("long"), [11]);
});

test("historical completion flags cannot hide newly added activities and foreign task IDs cannot inflate progress", () => {
  const progress = emptyEnglishProgress();
  progress.episodes[book.id] = {
    completedTasks: [...book.taskIds.slice(0, 5), "retired-task", "retired-task"],
    level: "starter",
    updatedAt: "2026-10-14T09:00:00Z",
    completedAt: "2026-10-14T09:00:00Z",
  };
  assert.deepEqual(getDiscoveryStatus(book, progress), {
    count: 5,
    total: 11,
    finished: false,
    started: true,
  });
  assert.ok(filter({ record: "ongoing" }, progress).some((item) => item.id === book.id));
  assert.ok(!filter({ record: "completed" }, progress).some((item) => item.id === book.id));
  progress.episodes[book.id].completedTasks = [...book.taskIds, "retired-task"];
  assert.ok(filter({ record: "completed" }, progress).some((item) => item.id === book.id));
  assert.ok(!filter({ record: "ongoing" }, progress).some((item) => item.id === book.id));
  assert.ok(!filter({ record: "new" }, progress).some((item) => item.id === book.id));
});

test("guests do not receive fabricated progress and discovery never mutates account records", () => {
  for (const record of ["new", "ongoing", "completed"]) assert.equal(filter({ record }).length, 25);
  const progress = emptyEnglishProgress(),
    snapshot = structuredClone(progress);
  filter({ record: "new" }, progress);
  getDiscoveryStatus(book, progress);
  englishDiscoveryLibrary();
  assert.deepEqual(progress, snapshot);
});

test("query parsing rejects invalid selectors and repeated server parameters without unsafe preview IDs", () => {
  const parsed = parseLibrarySearch({
    q: "  hello  ",
    kind: "unknown",
    skill: ["writing"],
    pace: "forever",
    record: "someone-else",
    focus: "../admin",
    level: "advanced",
  });
  assert.deepEqual(parsed, {
    filters: { ...defaultLibraryFilters, query: "hello" },
    focus: "",
    level: undefined,
  });
  assert.equal(parseLibrarySearch({ q: "x".repeat(999) }).filters.query.length, 160);
  assert.equal(
    parseLibrarySearch({ q: ["one", "two"], focus: ["closed-bookshop"] }).filters.query,
    "",
  );
});

test("shareable library URLs round-trip Korean and reserved characters, filter context and preview level", () => {
  const filters = {
    query: "부탁 & rain? #한글",
    kind: "story",
    skill: "reading",
    pace: "long",
    record: "ongoing",
  };
  const href = libraryHref(filters, { focus: book.id, level: "challenge" });
  const url = new URL(href, "https://example.test");
  assert.equal(url.pathname, "/english/library");
  assert.equal(url.hash, "");
  assert.deepEqual(parseLibrarySearch(Object.fromEntries(url.searchParams)), {
    filters,
    focus: book.id,
    level: "challenge",
  });
  assert.equal(libraryHref(defaultLibraryFilters), "/english/library");
  assert.ok(!libraryHref(defaultLibraryFilters, { focus: "//other.invalid" }).includes("focus"));
});

test("all discovery goals and recommended audiences have the authored English counterpart", () => {
  for (const item of items) {
    assert.equal(translateText(item.guide.goal.ko, "en"), item.guide.goal.en);
    assert.equal(translateText(item.guide.fit.ko, "en"), item.guide.fit.en);
  }
});
