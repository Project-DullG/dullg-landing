import { englishDay, REVIEW_DAILY_LIMIT } from "./progress.ts";
import type { EnglishExpression, EnglishProgress } from "./types.ts";

export type EnglishReviewQueue<T> = {
  day: string;
  resetAt: string;
  items: T[];
  dueCount: number;
  deferredCount: number;
  reviewedToday: number;
  remainingCapacity: number;
  limitReached: boolean;
};

/** Reads existing records only; the server remains authoritative for review limits. */
export function getEnglishReviewQueue<T extends Pick<EnglishExpression, "id">>(
  progress: EnglishProgress | null,
  registeredExpressions: readonly T[],
  now: Date = new Date(),
  serverLimitedDay?: string | null,
): EnglishReviewQueue<T> {
  const day = englishDay(now);
  const recorded = progress?.dailyActivity?.[day]?.reviews || 0;
  const reviewedToday = Number.isFinite(recorded) ? Math.max(0, Math.floor(recorded)) : 0;
  const remainingCapacity =
    serverLimitedDay === day ? 0 : Math.max(0, REVIEW_DAILY_LIMIT - reviewedToday);
  const learned = new Set(progress?.learnedExpressionIds || []);
  const included = new Set<string>();
  const due = registeredExpressions
    .filter((expression) => {
      if (included.has(expression.id) || !learned.has(expression.id)) return false;
      const dueAt = Date.parse(progress?.reviews[expression.id]?.dueAt || "");
      if (!Number.isFinite(dueAt) || dueAt > now.getTime()) return false;
      included.add(expression.id);
      return true;
    })
    // Oldest scheduled reviews go first. Stable sort preserves registration
    // order for ties without repeatedly delaying overdue expressions.
    .sort(
      (first, second) =>
        Date.parse(progress!.reviews[first.id].dueAt) -
        Date.parse(progress!.reviews[second.id].dueAt),
    );
  const items = due.slice(0, remainingCapacity);
  return {
    day,
    // 15:00 UTC on this date is midnight starting the following Korean day.
    resetAt: `${day}T15:00:00.000Z`,
    items,
    dueCount: due.length,
    deferredCount: due.length - items.length,
    reviewedToday,
    remainingCapacity,
    limitReached: remainingCapacity === 0,
  };
}

export type EnglishReviewSession<T> = {
  plan: EnglishReviewQueue<T>;
  index: number;
  answer: string;
  feedback: { correct: boolean; feedback: string } | null;
};

/** Refreshes external changes without erasing this session's completion total. */
export function reconcileEnglishReviewSession<T extends Pick<EnglishExpression, "id">>(
  previous: EnglishReviewSession<T>,
  nextPlan: EnglishReviewQueue<T>,
  changedAccount = false,
): EnglishReviewSession<T> {
  const unfinished = previous.plan.items.slice(previous.index + (previous.feedback ? 1 : 0));
  const sameRemaining =
    unfinished.length === nextPlan.items.length &&
    unfinished.every((item, position) => item.id === nextPlan.items[position].id);
  if (changedAccount || previous.plan.day !== nextPlan.day || !sameRemaining) {
    return { plan: nextPlan, index: 0, answer: "", feedback: null };
  }
  return { ...previous, plan: { ...nextPlan, items: previous.plan.items } };
}

/** Incorporates a saved review, including allowance consumed in another tab. */
export function finishEnglishReviewItem<T extends Pick<EnglishExpression, "id">>(
  previous: EnglishReviewSession<T>,
  nextPlan: EnglishReviewQueue<T>,
  feedback: NonNullable<EnglishReviewSession<T>["feedback"]>,
): EnglishReviewSession<T> {
  if (previous.plan.day !== nextPlan.day) {
    return { plan: nextPlan, index: 0, answer: "", feedback: null };
  }
  return {
    ...previous,
    plan: {
      ...nextPlan,
      items: [...previous.plan.items.slice(0, previous.index + 1), ...nextPlan.items],
    },
    feedback,
  };
}
