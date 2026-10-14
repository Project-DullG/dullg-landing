import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { allEnglishContent } from "../lib/english/catalog.ts";
import {
  advanceEnglishReview,
  emptyEnglishProgress,
  englishDay,
  REVIEW_DAILY_LIMIT,
} from "../lib/english/progress.ts";
import {
  getEnglishReviewQueue,
  reconcileEnglishReviewSession,
  finishEnglishReviewItem,
} from "../lib/english/review-queue.ts";

const expressions = allEnglishContent.flatMap((content) => content.expressions);
const now = new Date("2026-10-14T09:00:00.000Z");
function allDue() {
  return {
    ...emptyEnglishProgress(),
    learnedExpressionIds: expressions.map((item) => item.id),
    reviews: Object.fromEntries(
      expressions.map((item) => [item.id, { dueAt: "2026-10-13T09:00:00.000Z", successes: 0 }]),
    ),
  };
}
function reviewFirst(count, initial = allDue(), time = now) {
  let progress = initial;
  for (const expression of expressions.slice(0, count)) {
    const result = advanceEnglishReview(progress, expression, expression.accepted[0], time);
    assert.equal(result.correct, true);
    progress = result.progress;
  }
  return progress;
}
function session(plan, changes = {}) {
  return { plan, index: 0, answer: "", feedback: null, ...changes };
}

test("65 due expressions produce a completable 20-expression session without changing schedules or earned records", () => {
  assert.equal(expressions.length, 65);
  const original = allDue();
  const snapshot = structuredClone(original);
  const plan = getEnglishReviewQueue(original, expressions, now);
  assert.equal(plan.items.length, 20);
  assert.equal(plan.dueCount, 65);
  assert.equal(plan.deferredCount, 45);
  assert.equal(plan.reviewedToday, 0);
  assert.equal(plan.remainingCapacity, REVIEW_DAILY_LIMIT);
  assert.equal(plan.limitReached, false);
  assert.equal(
    plan.items[0],
    expressions[0],
    "queue items remain compatible with the authored review engine",
  );
  let progress = original;
  for (const expression of plan.items) {
    progress = advanceEnglishReview(progress, expression, expression.accepted[0], now).progress;
  }
  const finished = getEnglishReviewQueue(progress, expressions, now);
  assert.equal(finished.items.length, 0, "the page must not offer the forbidden 21st submission");
  assert.equal(finished.deferredCount, 45);
  assert.equal(finished.limitReached, true);
  assert.equal(progress.dailyActivity[englishDay(now)].reviews, 20);
  assert.equal(progress.xp, 100);
  assert.deepEqual(original, snapshot);
  for (const expression of expressions.slice(20)) {
    assert.equal(progress.reviews[expression.id].dueAt, snapshot.reviews[expression.id].dueAt);
  }
  assert.throws(
    () => advanceEnglishReview(progress, expressions[20], expressions[20].accepted[0], now),
    { status: 429 },
  );
});

test("an older scheduled review comes before an earlier-registered expression, with stable registration order for ties", () => {
  const progress = allDue();
  const registry = expressions.slice(0, 4);
  progress.reviews[registry[0].id].dueAt = "2026-10-14T08:00:00Z";
  progress.reviews[registry[1].id].dueAt = "2026-10-13T08:00:00Z";
  progress.reviews[registry[2].id].dueAt = "2026-10-13T08:00:00Z";
  progress.reviews[registry[3].id].dueAt = "2026-10-12T08:00:00Z";
  const registeredOrder = registry.map((item) => item.id);
  const plan = getEnglishReviewQueue(progress, registry, now);
  assert.deepEqual(
    plan.items.map((item) => item.id),
    [registry[3].id, registry[1].id, registry[2].id, registry[0].id],
  );
  assert.deepEqual(
    registry.map((item) => item.id),
    registeredOrder,
    "sorting must not mutate the content registry",
  );
  assert.equal(plan.dueCount, 4);
  assert.equal(plan.deferredCount, 0);
});

test("twenty unsuccessful recalls do not starve the forty-five older waiting expressions on the next day", () => {
  const original = allDue();
  const today = getEnglishReviewQueue(original, expressions, now);
  let progress = original;
  for (const expression of today.items) {
    const result = advanceEnglishReview(
      progress,
      expression,
      "I cannot remember this expression.",
      now,
    );
    assert.equal(result.correct, false);
    progress = result.progress;
    assert.equal(progress.reviews[expression.id].dueAt, "2026-10-15T09:00:00.000Z");
  }
  assert.equal(progress.dailyActivity[englishDay(now)].reviews, 20);
  assert.equal(getEnglishReviewQueue(progress, expressions, now).items.length, 0);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const next = getEnglishReviewQueue(progress, expressions, tomorrow);
  assert.equal(next.dueCount, 65);
  assert.equal(next.items.length, 20);
  assert.equal(next.deferredCount, 45);
  assert.deepEqual(
    next.items.map((item) => item.id),
    expressions.slice(20, 40).map((item) => item.id),
    "expressions waiting since yesterday precede newly scheduled retries",
  );
  const retriedIds = new Set(today.items.map((item) => item.id));
  assert.equal(
    next.items.some((item) => retriedIds.has(item.id)),
    false,
  );
  assert.equal(next.reviewedToday, 0);
  assert.equal(next.remainingCapacity, 20);
});

test("18 already recorded reviews leave two slots, and unsuccessful recall also uses a daily slot", () => {
  const original = reviewFirst(18);
  const plan = getEnglishReviewQueue(original, expressions, now);
  assert.equal(plan.reviewedToday, 18);
  assert.equal(plan.remainingCapacity, 2);
  assert.equal(plan.items.length, 2);
  assert.equal(plan.dueCount, 47);
  assert.equal(plan.deferredCount, 45);
  let progress = original;
  for (const expression of plan.items) {
    const result = advanceEnglishReview(
      progress,
      expression,
      "I cannot remember this expression.",
      now,
    );
    assert.equal(result.correct, false);
    progress = result.progress;
  }
  assert.equal(progress.dailyActivity[englishDay(now)].reviews, 20);
  assert.equal(progress.xp, original.xp);
  assert.equal(getEnglishReviewQueue(progress, expressions, now).items.length, 0);
});

test("the allowance resets at Korean midnight, while the original server due dates still control eligibility", () => {
  const beforeMidnight = new Date("2026-10-14T14:59:59.999Z");
  const midnight = new Date("2026-10-14T15:00:00.000Z");
  const progress = reviewFirst(20);
  const before = getEnglishReviewQueue(progress, expressions, beforeMidnight);
  assert.equal(before.day, "2026-10-14");
  assert.equal(before.items.length, 0);
  assert.equal(before.resetAt, midnight.toISOString());
  const after = getEnglishReviewQueue(progress, expressions, midnight);
  assert.equal(after.day, "2026-10-15");
  assert.equal(after.reviewedToday, 0);
  assert.equal(after.items.length, 20);
  assert.equal(
    after.dueCount,
    45,
    "successful expressions scheduled for later are not made due at midnight",
  );
  assert.equal(after.deferredCount, 25);
  const result = advanceEnglishReview(
    progress,
    after.items[0],
    after.items[0].accepted[0],
    midnight,
  );
  assert.equal(result.correct, true);
  assert.equal(result.progress.dailyActivity["2026-10-14"].reviews, 20);
  assert.equal(result.progress.dailyActivity["2026-10-15"].reviews, 1);
});

test("unknown, unlearned, duplicate, invalid-date, and future expressions never enter today's review", () => {
  const progress = allDue();
  progress.learnedExpressionIds.push("unregistered-expression");
  progress.reviews["unregistered-expression"] = { dueAt: "2026-10-13T09:00:00Z", successes: 0 };
  progress.learnedExpressionIds = progress.learnedExpressionIds.filter(
    (id) => id !== expressions[0].id,
  );
  progress.reviews[expressions[1].id].dueAt = "invalid-date";
  progress.reviews[expressions[2].id].dueAt = "2026-10-15T09:00:00Z";
  const registry = [...expressions, expressions[3]];
  const plan = getEnglishReviewQueue(progress, registry, now);
  assert.equal(plan.dueCount, 62);
  assert.equal(new Set(plan.items.map((item) => item.id)).size, plan.items.length);
  assert.equal(
    plan.items.some((item) =>
      ["unregistered-expression", ...expressions.slice(0, 3).map((item) => item.id)].includes(
        item.id,
      ),
    ),
    false,
  );
  assert.equal(getEnglishReviewQueue(null, registry, now).items.length, 0);
  const legacy = { ...emptyEnglishProgress() };
  delete legacy.dailyActivity;
  assert.equal(getEnglishReviewQueue(legacy, expressions, now).remainingCapacity, 20);
});

test("same-day focus refresh preserves the final feedback and original 20/20 completion total", () => {
  const originalPlan = getEnglishReviewQueue(allDue(), expressions, now);
  const finishedPlan = getEnglishReviewQueue(reviewFirst(20), expressions, now);
  const previous = session(originalPlan, {
    index: 19,
    answer: expressions[19].en,
    feedback: { correct: true, feedback: "Saved" },
  });
  const refreshed = reconcileEnglishReviewSession(previous, finishedPlan);
  assert.equal(refreshed.plan.items.length, 20);
  assert.equal(refreshed.index, 19);
  assert.equal(refreshed.feedback, previous.feedback);
  assert.equal(refreshed.plan.limitReached, true);
  assert.equal(refreshed.plan.deferredCount, 45);
  const closed = { ...refreshed, index: 20, answer: "", feedback: null };
  const closedRefresh = reconcileEnglishReviewSession(closed, finishedPlan);
  assert.equal(closedRefresh.index, closedRefresh.plan.items.length);
  assert.equal(closedRefresh.plan.items.length, 20);
});

test("saved reviews immediately update the remaining allowance and retain the original completion total", () => {
  let progress = allDue();
  let currentSession = session(getEnglishReviewQueue(progress, expressions, now));
  for (let index = 0; index < 20; index++) {
    const expression = currentSession.plan.items[index];
    const result = advanceEnglishReview(progress, expression, expression.accepted[0], now);
    progress = result.progress;
    currentSession = finishEnglishReviewItem(
      currentSession,
      getEnglishReviewQueue(progress, expressions, now),
      result,
    );
    assert.equal(currentSession.plan.items.length, 20);
    assert.equal(currentSession.plan.reviewedToday, index + 1);
    assert.equal(currentSession.plan.remainingCapacity, 19 - index);
    assert.equal(currentSession.plan.deferredCount, 45);
    currentSession = { ...currentSession, index: index + 1, answer: "", feedback: null };
  }
  assert.equal(currentSession.index, 20);
  assert.equal(currentSession.plan.items.length, 20);
  assert.equal(currentSession.plan.limitReached, true);
});

test("a successful save after other-tab activity shortens the session rather than offering a forbidden next review", () => {
  const original = allDue();
  const before = session(getEnglishReviewQueue(original, expressions, now));
  let external = original;
  // A second tab reviewed other expressions while the first tab's answer was open.
  for (const expression of expressions.slice(1, 20)) {
    external = advanceEnglishReview(external, expression, expression.accepted[0], now).progress;
  }
  const result = advanceEnglishReview(external, expressions[0], expressions[0].accepted[0], now);
  const finished = finishEnglishReviewItem(
    before,
    getEnglishReviewQueue(result.progress, expressions, now),
    result,
  );
  assert.equal(
    finished.plan.items.length,
    1,
    "only the expression actually reviewed in this session is counted",
  );
  assert.equal(finished.plan.limitReached, true);
  assert.equal(finished.plan.deferredCount, 45);
  assert.equal(finished.feedback.correct, true);
  assert.equal(finished.plan.items[finished.index + 1], undefined);
});

test("other-tab activity rebuilds only the remaining allowance and clears an obsolete answer", () => {
  const previous = session(getEnglishReviewQueue(allDue(), expressions, now), {
    answer: "An unsent answer",
  });
  const fresh = getEnglishReviewQueue(reviewFirst(18), expressions, now);
  const updated = reconcileEnglishReviewSession(previous, fresh);
  assert.equal(updated.index, 0);
  assert.equal(updated.answer, "");
  assert.equal(updated.plan.items.length, 2);
  assert.deepEqual(
    updated.plan.items.map((item) => item.id),
    expressions.slice(18, 20).map((item) => item.id),
  );
});

test("a changed account or a new Korean day resets answers, feedback, and the session cursor", () => {
  const plan = getEnglishReviewQueue(allDue(), expressions, now);
  const previous = session(plan, {
    index: 4,
    answer: "Old account answer",
    feedback: { correct: true, feedback: "Old account result" },
  });
  const account = reconcileEnglishReviewSession(previous, plan, true);
  assert.equal(account.index, 0);
  assert.equal(account.answer, "");
  assert.equal(account.feedback, null);
  const newDay = getEnglishReviewQueue(allDue(), expressions, new Date("2026-10-14T15:00:00Z"));
  const tomorrow = reconcileEnglishReviewSession(previous, newDay);
  assert.equal(tomorrow.plan.day, "2026-10-15");
  assert.equal(tomorrow.index, 0);
  assert.equal(tomorrow.answer, "");
  assert.equal(tomorrow.feedback, null);
});

test("a server-reported 429 closes the stale queue even if its refresh fails, and does not block the next day", () => {
  const stale = reviewFirst(18);
  const today = getEnglishReviewQueue(stale, expressions, now, "2026-10-14");
  assert.equal(today.items.length, 0);
  assert.equal(today.remainingCapacity, 0);
  assert.equal(today.limitReached, true);
  assert.equal(today.reviewedToday, 18, "a local safety block must not fabricate saved activity");
  assert.equal(today.deferredCount, 47);
  const nextDay = getEnglishReviewQueue(
    stale,
    expressions,
    new Date("2026-10-14T15:00:00Z"),
    "2026-10-14",
  );
  assert.equal(nextDay.items.length, 20);
  assert.equal(nextDay.limitReached, false);
  const exceeded = allDue();
  exceeded.dailyActivity["2026-10-14"] = { tasks: 0, reviews: 25 };
  assert.equal(getEnglishReviewQueue(exceeded, expressions, now).items.length, 0);
});

test("the daily-policy, deferred-work, and completion messages have natural English mappings", () => {
  const dictionary = JSON.parse(
    readFileSync(new URL("../lib/i18n/en-review-queue.json", import.meta.url), "utf8"),
  );
  for (const phrase of [
    "복습은 하루에 최대 20개까지 기록할 수 있어요.",
    "남은 표현은 다음 학습일에 이어서 복습할 수 있어요.",
    "한국시간 자정이 지나면 오늘의 복습 한도가 새로 시작돼요.",
    "표현 복습 완료",
    "로그인해 연습하면 배운 표현이 여기에 쌓여요.",
    "배운 표현",
  ]) {
    assert.ok(dictionary[phrase]);
    assert.doesNotMatch(dictionary[phrase], /[가-힣]/);
  }
  assert.match(dictionary["복습은 하루에 최대 20개까지 기록할 수 있어요."], /20.*per day/);
  assert.match(
    dictionary["한국시간 자정이 지나면 오늘의 복습 한도가 새로 시작돼요."],
    /midnight.*Korea Standard Time/,
  );
});
