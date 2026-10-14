import { allEnglishContent, getEnglishEpisode } from "./catalog.ts";
import { englishCourses, getEnglishCourse, getCourseHref, getCourseState } from "./courses.ts";
import { getEnglishContinuation, getEnglishLearningRecords } from "./journal.ts";
import { emptyEnglishProgress, getEnglishEpisodeStatus } from "./progress.ts";
import type { EnglishLevel, EnglishProgress } from "./types.ts";
import type { EnglishPracticePack } from "./practice.ts";
import { defaultLibraryFilters, libraryHref } from "./discovery.ts";

/** Preview links resume at the saved level without making a new preference choice. */
export function getEnglishHomePreviewHref(
  contentId: string,
  progress: EnglishProgress | null,
  selectedLevel: EnglishLevel,
) {
  const content = getEnglishEpisode(contentId);
  if (!content) return null;
  const status = progress ? getEnglishEpisodeStatus(progress, content) : undefined;
  const level =
    status?.completedCount && !status.finished
      ? progress?.episodes[contentId]?.level || selectedLevel
      : selectedLevel;
  return libraryHref(
    {
      ...defaultLibraryFilters,
      kind:
        content.format === "practice" ? (content as EnglishPracticePack).practiceFormat : "story",
    },
    { focus: content.id, level },
  );
}

/** One honest next action, based on saved activity IDs and course context. */
export function getEnglishHomePlan(progress: EnglishProgress | null, selectedLevel: EnglishLevel) {
  if (progress) {
    const continuation = getEnglishContinuation(progress);
    if (continuation)
      return {
        content: continuation.content,
        reason: "continue" as const,
        count: continuation.completedCount,
        total: continuation.total,
        level: continuation.level,
        courseId: continuation.courseId,
        href: getCourseHref(continuation.content.id, continuation.level, {
          courseId: continuation.courseId,
        })!,
      };
    const records = getEnglishLearningRecords(progress);
    const recentCourse = records
      .map((record) => {
        const course = getEnglishCourse(record.courseId || "");
        return course?.units.some((unit) => unit.contentId === record.content.id)
          ? course
          : undefined;
      })
      .find(Boolean);
    const orderedCourses = [
      ...(recentCourse ? [recentCourse] : []),
      ...englishCourses.filter((course) => course.id !== recentCourse?.id),
    ];
    for (const course of orderedCourses) {
      const unit = getCourseState(course, progress).nextUnit;
      const content = unit && getEnglishEpisode(unit.contentId);
      if (content)
        return {
          content,
          reason: records.length ? ("course-next" as const) : ("first-step" as const),
          count: 0,
          total: content.tasks.length,
          level: selectedLevel,
          courseId: course.id,
          href: getCourseHref(content.id, selectedLevel, { courseId: course.id })!,
        };
    }
  }
  const content = getEnglishEpisode("closed-bookshop")!;
  const finished = progress ? getEnglishEpisodeStatus(progress, content).finished : false;
  return {
    content,
    reason: finished ? ("replay" as const) : ("explore" as const),
    count: 0,
    total: content.tasks.length,
    level: selectedLevel,
    courseId: undefined,
    href: getCourseHref(content.id, selectedLevel, { replay: finished })!,
  };
}

/** A course's next start, without marking unseen activities as completed. */
export function getEnglishCourseStart(
  courseId: string,
  progress: EnglishProgress | null,
  level: EnglishLevel,
) {
  const course = getEnglishCourse(courseId);
  if (!course) return null;
  const state = getCourseState(course, progress || emptyEnglishProgress());
  const contentId = state.nextUnit?.contentId || course.units[0]?.contentId;
  if (!contentId) return null;
  const saved = progress?.episodes[contentId];
  return {
    state,
    href: getCourseHref(contentId, state.nextUnit?.inProgress ? saved?.level || level : level, {
      courseId: course.id,
      replay: state.allComplete,
    })!,
  };
}

export function getEnglishContentTotals(progress: EnglishProgress | null) {
  if (!progress) return { stories: 0, practices: 0, expressions: 0 };
  const finished = allEnglishContent.filter(
    (content) => getEnglishEpisodeStatus(progress, content).finished,
  );
  const known = new Set(
    allEnglishContent.flatMap((content) => content.expressions.map((expression) => expression.id)),
  );
  return {
    stories: finished.filter((content) => content.format !== "practice").length,
    practices: finished.filter((content) => content.format === "practice").length,
    expressions: new Set(progress.learnedExpressionIds.filter((id) => known.has(id))).size,
  };
}
