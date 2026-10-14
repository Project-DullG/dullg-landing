import { allEnglishContent } from "./catalog.ts";
import { englishCourses } from "./courses.ts";
import { getEnglishContentGuide } from "./content-guides.ts";
import type { EnglishPracticePack } from "./practice.ts";
import type { EnglishDiscoveryItem } from "./discovery.ts";

// Public introductions omit the people, destinations, and marks that learners
// are asked to identify later. Original story data remains unchanged.
const previewIntroductionIds = new Set([
  "closed-bookshop",
  "locker-seven",
  "moonlight-post",
  "raincheck-cafe",
]);
const previewHelpers: Record<string, readonly string[]> = {
  "closed-bookshop": ["하나"],
  "locker-seven": ["미나"],
  "moonlight-post": ["솔"],
  "raincheck-cafe": ["Leo", "Maya"],
  "midnight-radio": ["Iris", "Ben"],
  "glasshouse-garden": ["Ada"],
};

/** Returns public selection metadata and task IDs, not task objects or endings. */
export function englishDiscoveryLibrary(): EnglishDiscoveryItem[] {
  return allEnglishContent.map((item) => {
    const guide = getEnglishContentGuide(item.id);
    if (!guide) throw new Error("Missing content guide: " + item.id);
    return {
      id: item.id,
      title: item.title,
      englishTitle: item.englishTitle,
      synopsis: previewIntroductionIds.has(item.id) ? guide.sample.standard.ko : item.synopsis,
      genreLabel: item.genreLabel,
      minutes: item.minutes,
      image: item.image,
      imageAlt: item.imageAlt,
      kind: item.format === "practice" ? (item as EnglishPracticePack).practiceFormat : "story",
      skills: [...new Set(item.tasks.map((task) => task.skill))],
      taskIds: item.tasks.map((task) => task.id),
      chapterCount: item.chapters?.length || 0,
      cast: (item.cast || [])
        .filter((person) => previewHelpers[item.id]?.includes(person.name))
        .map((person) =>
          item.id === "locker-seven" && person.name === "미나"
            ? {
                ...person,
                motivation: "기록을 차근차근 확인하고, 분실물이 맞는 주인에게 돌아가도록 도와요.",
              }
            : person,
        ),
      courseIds: englishCourses
        .filter((course) => course.units.some((unit) => unit.contentId === item.id))
        .map((course) => course.id),
      guide,
    };
  });
}
