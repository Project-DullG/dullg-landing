import { allEnglishContent } from "./catalog.ts";
import { englishDay, getEnglishEpisodeStatus } from "./progress.ts";
import type { EnglishEpisode, EnglishProgress } from "./types.ts";

const DAY_MS = 86_400_000;
const count = (value: number | undefined) =>
  Number.isFinite(value) && value! > 0 ? Math.floor(value!) : 0;

/** Recorded counts only: older active dates never imply an invented duration or task count. */
export function getEnglishWeek(progress: EnglishProgress, now: Date = new Date()) {
  const today = englishDay(now);
  const end = Date.parse(today + "T12:00:00Z");
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(end - (6 - index) * DAY_MS).toISOString().slice(0, 10);
    const activity = progress.dailyActivity[day];
    const tasks = count(activity?.tasks),
      reviews = count(activity?.reviews);
    return {
      day,
      tasks,
      reviews,
      total: tasks + reviews,
      active: progress.activeDates.includes(day) || tasks + reviews > 0,
    };
  });
}

export function getEnglishLearningRecords(
  progress: EnglishProgress,
  content: EnglishEpisode[] = allEnglishContent,
) {
  return content
    .flatMap((item) => {
      const status = getEnglishEpisodeStatus(progress, item);
      if (!status.completedCount) return [];
      const saved = progress.episodes[item.id];
      const stamp = Date.parse(saved?.updatedAt || "");
      const repeatedDays = item.tasks
        .map((task) => progress.practiceDates?.[task.id])
        .filter(
          (day): day is string =>
            typeof day === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(day) &&
            Number.isFinite(Date.parse(day + "T00:00:00Z")) &&
            new Date(day + "T00:00:00Z").toISOString().slice(0, 10) === day,
        );
      // Repeated practice records a Korean date, not a precise time; never invent an hour.
      const lastPractice = repeatedDays.length
        ? Date.parse(repeatedDays.sort().at(-1)! + "T00:00:00+09:00")
        : 0;
      return [
        {
          content: item,
          ...status,
          level: saved.level,
          courseId: saved.courseId,
          updatedAt: Math.max(Number.isFinite(stamp) ? stamp : 0, lastPractice),
        },
      ];
    })
    .sort((a, b) => b.updatedAt - a.updatedAt || a.content.id.localeCompare(b.content.id));
}

/** Continuation includes focused practice as well as stories, using current authored task IDs. */
export function getEnglishContinuation(
  progress: EnglishProgress,
  content: EnglishEpisode[] = allEnglishContent,
) {
  return getEnglishLearningRecords(progress, content).find((record) => !record.finished);
}

export function getEnglishExpressionNotes(
  progress: EnglishProgress,
  now: Date = new Date(),
  content: EnglishEpisode[] = allEnglishContent,
) {
  const learned = new Set(progress.learnedExpressionIds);
  return content
    .flatMap((source) =>
      source.expressions
        .filter((expression) => learned.has(expression.id))
        .map((expression) => {
          const review = progress.reviews[expression.id];
          const stamp = Date.parse(review?.dueAt || "");
          const dueAt = Number.isFinite(stamp) ? stamp : null;
          return {
            expression,
            source,
            dueAt,
            due: dueAt !== null && dueAt <= now.getTime(),
            successes: count(review?.successes),
          };
        }),
    )
    .sort(
      (a, b) =>
        Number(b.due) - Number(a.due) ||
        (a.dueAt ?? Infinity) - (b.dueAt ?? Infinity) ||
        a.expression.id.localeCompare(b.expression.id),
    );
}

export function filterEnglishExpressionNotes(
  notes: ReturnType<typeof getEnglishExpressionNotes>,
  {
    query = "",
    source = "",
    dueOnly = false,
  }: { query?: string; source?: string; dueOnly?: boolean },
) {
  const needle = query.normalize("NFKC").toLocaleLowerCase().trim();
  return notes.filter(
    (note) =>
      (!source || note.source.id === source) &&
      (!dueOnly || note.due) &&
      (!needle ||
        [note.expression.en, note.expression.ko, note.source.title, note.source.englishTitle].some(
          (value) => value.normalize("NFKC").toLocaleLowerCase().includes(needle),
        )),
  );
}
