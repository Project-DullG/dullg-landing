import assert from "node:assert/strict";
import { test } from "node:test";
import { getEnglishEpisode } from "../lib/english/catalog.ts";
import { getCourseHref } from "../lib/english/courses.ts";
import { getEnglishContinuation } from "../lib/english/journal.ts";
import { advanceEnglishProgress, emptyEnglishProgress } from "../lib/english/progress.ts";
import {
  canChooseEnglishLevel,
  ENGLISH_SESSION_TIMEOUT_MS,
  getEnglishReloadIndex,
  getEnglishSessionHref,
  readEnglishSession,
} from "../lib/english/session-ui.ts";

const story = getEnglishEpisode("closed-bookshop");
const pack = getEnglishEpisode("conversation-airport");
const now = new Date("2026-10-15T03:00:00.000Z");
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
function started(content = story) {
  const first = content.tasks[0],
    version = first.versions.challenge;
  return advanceEnglishProgress(
    emptyEnglishProgress(),
    {
      episodeId: content.id,
      taskId: first.id,
      level: "challenge",
      ...(content.id === story.id ? { courseId: "first-steps" } : {}),
      answer: version.correctOption || version.model,
      ...(first.skill === "speaking" ? { selfConfirmed: true } : {}),
    },
    content,
    now,
  ).progress;
}
function finished(content) {
  const progress = emptyEnglishProgress();
  progress.episodes[content.id] = {
    completedTasks: content.tasks.map((task) => task.id),
    level: "challenge",
    updatedAt: now.toISOString(),
    ...(content.id === story.id ? { courseId: "first-steps" } : {}),
  };
  return progress;
}
function url(href) {
  assert.equal(typeof href, "string");
  return new URL(href, "https://example.test");
}

test("pending session reads block level choice while guest and error states retain local choice", async () => {
  let resolveRead;
  const pending = new Promise((resolve) => (resolveRead = resolve));
  const read = readEnglishSession({ fetcher: () => pending });
  assert.equal(canChooseEnglishLevel("loading"), false);
  resolveRead(Response.json({ progress: emptyEnglishProgress(), accountKey: "demo-account" }));
  const session = await read;
  assert.equal(session.progress.preferredLevel, "standard");
  assert.equal(canChooseEnglishLevel("ready"), true);
  assert.equal(canChooseEnglishLevel("ready", true), false);
  assert.equal(canChooseEnglishLevel("guest"), true);
  assert.equal(canChooseEnglishLevel("error"), true);
});

test("session reads keep authentication outcomes distinct from unavailable progress", async () => {
  assert.equal(
    await readEnglishSession({ fetcher: async () => new Response(null, { status: 401 }) }),
    null,
  );
  await assert.rejects(
    () => readEnglishSession({ fetcher: async () => new Response(null, { status: 503 }) }),
    /unavailable/,
  );
  await assert.rejects(
    () =>
      readEnglishSession({
        fetcher: async () => {
          throw new Error("local transport failed");
        },
      }),
    /local transport failed/,
  );
});

test("a ten-second default deadline aborts stalled headers or JSON instead of leaving loading forever", async () => {
  assert.equal(ENGLISH_SESSION_TIMEOUT_MS, 10_000);
  for (const phase of ["headers", "body"]) {
    let requestSignal;
    const pending = new Promise(() => {});
    const fetcher = async (target, options) => {
      assert.equal(target, "/api/english/progress");
      assert.equal(options.credentials, "same-origin");
      assert.equal(options.cache, "no-store");
      requestSignal = options.signal;
      return phase === "headers" ? pending : { status: 200, ok: true, json: () => pending };
    };
    await assert.rejects(() => readEnglishSession({ fetcher, timeoutMs: 10 }), /timed out/);
    assert.equal(requestSignal.aborted, true);
  }
});

test("a completed session read clears its deadline and a timed-out read cannot succeed later", async () => {
  let successfulSignal;
  const progress = emptyEnglishProgress();
  assert.deepEqual(
    await readEnglishSession({
      timeoutMs: 10,
      fetcher: async (_, options) => {
        successfulSignal = options.signal;
        return Response.json({ progress, accountKey: "demo-account" });
      },
    }),
    { progress, accountKey: "demo-account" },
  );
  await delay(20);
  assert.equal(successfulSignal.aborted, false);
  let resolveLate;
  const late = new Promise((resolve) => (resolveLate = resolve));
  const timedOut = readEnglishSession({ timeoutMs: 10, fetcher: () => late });
  await assert.rejects(() => timedOut, /timed out/);
  resolveLate(Response.json({ progress, accountKey: "demo-account" }));
  await assert.rejects(() => timedOut, /timed out/);
});

test("an already cancelled caller never starts a progress request", async () => {
  const caller = new AbortController();
  const reason = new Error("This local request was replaced");
  caller.abort(reason);
  let requests = 0;
  await assert.rejects(
    () =>
      readEnglishSession({
        signal: caller.signal,
        fetcher: async () => {
          requests++;
          return Response.json({ progress: emptyEnglishProgress(), accountKey: "demo-account" });
        },
      }),
    (error) => error === reason,
  );
  assert.equal(requests, 0);
});

test("caller cancellation aborts stalled headers or JSON and stays distinct from a timeout", async () => {
  for (const phase of ["headers", "body"]) {
    const caller = new AbortController();
    let requestSignal, enterBody;
    const bodyStarted = new Promise((resolve) => (enterBody = resolve));
    const pending = new Promise(() => {});
    const reading = readEnglishSession({
      signal: caller.signal,
      fetcher: async (_, options) => {
        requestSignal = options.signal;
        return phase === "headers"
          ? pending
          : {
              status: 200,
              ok: true,
              json: () => {
                enterBody();
                return pending;
              },
            };
      },
    });
    if (phase === "body") await bodyStarted;
    caller.abort();
    await assert.rejects(() => reading, { name: "AbortError" });
    assert.equal(caller.signal.aborted, true);
    assert.equal(requestSignal.aborted, true);
    const next = await readEnglishSession({
      signal: new AbortController().signal,
      fetcher: async () =>
        Response.json({ progress: emptyEnglishProgress(), accountKey: "next-account" }),
    });
    assert.equal(next.accountKey, "next-account");
  }
});

test("a deadline aborts only the internal request so the caller can display a retryable error", async () => {
  const caller = new AbortController();
  let requestSignal;
  await assert.rejects(
    () =>
      readEnglishSession({
        signal: caller.signal,
        timeoutMs: 10,
        fetcher: async (_, options) => {
          requestSignal = options.signal;
          return new Promise(() => {});
        },
      }),
    /timed out/,
  );
  assert.equal(requestSignal.aborted, true);
  assert.equal(caller.signal.aborted, false);
});

test("completed reads detach caller cancellation along with their deadline", async () => {
  const caller = new AbortController();
  let requestSignal;
  const reading = readEnglishSession({
    signal: caller.signal,
    timeoutMs: 10,
    fetcher: async (_, options) => {
      requestSignal = options.signal;
      return Response.json({ progress: emptyEnglishProgress(), accountKey: "demo-account" });
    },
  });
  assert.equal((await reading).accountKey, "demo-account");
  caller.abort();
  await delay(20);
  assert.equal(requestSignal.aborted, false);
});

test("a story card resumes at the same saved level and course as the main continuation", () => {
  const progress = started();
  assert.equal(progress.preferredLevel, "standard");
  const continuation = getEnglishContinuation(progress);
  const card = getEnglishSessionHref(story.id, "standard", progress);
  assert.equal(
    card,
    getCourseHref(continuation.content.id, continuation.level, {
      courseId: continuation.courseId,
    }),
  );
  assert.equal(url(card).searchParams.get("level"), "challenge");
  assert.equal(url(card).searchParams.get("course"), "first-steps");
  assert.equal(url(card).searchParams.has("replay"), false);
});

test("finished current task IDs open a replay at the selected level even without completedAt", () => {
  for (const content of [story, pack]) {
    const progress = finished(content),
      before = structuredClone(progress);
    const href = url(getEnglishSessionHref(content.id, "starter", progress));
    assert.equal(href.searchParams.get("level"), "starter");
    assert.equal(href.searchParams.get("replay"), "1");
    assert.equal(
      href.pathname,
      `/english/${content.format === "practice" ? "practice" : "play"}/${content.id}`,
    );
    assert.deepEqual(progress, before);
  }
});

test("historic completion timestamps or retired IDs cannot turn expanded content into a replay", () => {
  const progress = emptyEnglishProgress();
  progress.episodes[story.id] = {
    completedTasks: [
      "bookshop-notice",
      "bookshop-message",
      "bookshop-intercom",
      "bookshop-release",
      "bookshop-goodbye",
      "retired-task",
    ],
    completedAt: now.toISOString(),
    updatedAt: now.toISOString(),
    level: "challenge",
    courseId: "first-steps",
  };
  const before = structuredClone(progress);
  const resume = url(getEnglishSessionHref(story.id, "starter", progress));
  assert.equal(resume.searchParams.get("level"), "challenge");
  assert.equal(resume.searchParams.has("replay"), false);
  assert.deepEqual(progress, before);
  progress.episodes[story.id].completedTasks = ["retired-task"];
  const unstarted = url(getEnglishSessionHref(story.id, "starter", progress));
  assert.equal(unstarted.searchParams.get("level"), "starter");
  assert.equal(unstarted.searchParams.has("replay"), false);
  assert.equal(getEnglishSessionHref("unregistered-content", "standard", progress), null);
});

test("guest and fresh learning links use the selected level and do not invent replay state", () => {
  for (const progress of [null, undefined, emptyEnglishProgress()]) {
    const href = url(getEnglishSessionHref(story.id, "challenge", progress));
    assert.equal(href.searchParams.get("level"), "challenge");
    assert.equal(href.searchParams.has("replay"), false);
  }
});

test("story and practice refresh preserve replay position including zero and the finished position", () => {
  for (const content of [story, pack]) {
    const progress = finished(content);
    for (const index of [0, 2, content.tasks.length])
      assert.equal(getEnglishReloadIndex(progress, content, true, index), index);
    assert.equal(getEnglishReloadIndex(progress, content, true, -5), 0);
    assert.equal(
      getEnglishReloadIndex(progress, content, true, content.tasks.length + 5),
      content.tasks.length,
    );
    assert.equal(getEnglishReloadIndex(progress, content, true, 2.5), 2);
    assert.equal(getEnglishReloadIndex(progress, content, true, NaN), 0);
  }
});

test("normal refresh follows the first current missing task, including an expanded old completion", () => {
  for (const content of [story, pack]) {
    const progress = started(content);
    assert.equal(getEnglishReloadIndex(progress, content, false, content.tasks.length), 1);
    assert.equal(getEnglishReloadIndex(finished(content), content, false, 0), content.tasks.length);
  }
  const progress = finished(story);
  progress.episodes[story.id].completedTasks = [
    "bookshop-notice",
    "bookshop-message",
    "bookshop-intercom",
    "bookshop-release",
    "bookshop-goodbye",
  ];
  progress.episodes[story.id].completedAt = now.toISOString();
  assert.equal(getEnglishReloadIndex(progress, story, false, story.tasks.length), 0);
  assert.equal(getEnglishReloadIndex(progress, story, true, 3), 3);
});
