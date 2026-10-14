import type { EnglishLevel, EnglishProgress, EnglishSkill } from "./types.ts";
import type { EnglishContentGuide } from "./content-guides.ts";

export type ContentKind = "story" | "conversation" | "sentence" | "reading";
export type LibraryFilters = {
  query: string;
  kind: ContentKind | "all";
  skill: EnglishSkill | "all";
  pace: "all" | "quick" | "short" | "long";
  record: "all" | "ongoing" | "completed" | "new";
};
export type EnglishDiscoveryItem = {
  id: string;
  title: string;
  englishTitle: string;
  synopsis: string;
  genreLabel: string;
  minutes: number;
  image: string;
  imageAlt: string;
  kind: ContentKind;
  skills: EnglishSkill[];
  taskIds: string[];
  chapterCount: number;
  cast: { name: string; role: string; motivation: string }[];
  courseIds: string[];
  guide: EnglishContentGuide;
};
export const defaultLibraryFilters: LibraryFilters = {
  query: "",
  kind: "all",
  skill: "all",
  pace: "all",
  record: "all",
};
const one = (value: unknown) => (typeof value === "string" ? value : "");
export function parseLibrarySearch(raw: Record<string, unknown>) {
  const kind = one(raw.kind),
    skill = one(raw.skill),
    pace = one(raw.pace),
    record = one(raw.record);
  return {
    filters: {
      query: one(raw.q).slice(0, 160).trim(),
      kind: ["story", "conversation", "sentence", "reading"].includes(kind) ? kind : "all",
      skill: ["reading", "listening", "writing", "speaking"].includes(skill) ? skill : "all",
      pace: ["quick", "short", "long"].includes(pace) ? pace : "all",
      record: ["ongoing", "completed", "new"].includes(record) ? record : "all",
    } as LibraryFilters,
    focus: /^[a-z0-9-]{1,80}$/.test(one(raw.focus)) ? one(raw.focus) : "",
    level: ["starter", "standard", "challenge"].includes(one(raw.level))
      ? (one(raw.level) as EnglishLevel)
      : undefined,
  };
}
export function getDiscoveryStatus(item: EnglishDiscoveryItem, progress: EnglishProgress | null) {
  if (!progress) return { count: 0, total: item.taskIds.length, finished: false, started: false };
  const saved = new Set(progress.episodes[item.id]?.completedTasks || []);
  const count = item.taskIds.filter((id) => saved.has(id)).length;
  const finished = item.taskIds.length > 0 && item.taskIds.every((id) => saved.has(id));
  return { count, total: item.taskIds.length, finished, started: count > 0 && !finished };
}
const searchable = (text: string) =>
  text.normalize("NFKC").toLocaleLowerCase().replace(/[’‘]/g, "'");
const categoryNames: Record<ContentKind, string> = {
  story: "이야기 모험 Story adventures",
  conversation: "실전 회화 Real-life conversation",
  sentence: "문장과 표현 Sentences and expressions",
  reading: "읽기와 이해 Reading and understanding",
};
export function filterDiscoveryItems(
  items: EnglishDiscoveryItem[],
  filters: LibraryFilters,
  progress: EnglishProgress | null,
) {
  const terms = searchable(filters.query).trim().split(/\s+/).filter(Boolean);
  return items.filter((item) => {
    if (filters.kind !== "all" && item.kind !== filters.kind) return false;
    if (filters.skill !== "all" && !item.skills.includes(filters.skill)) return false;
    if (filters.pace === "quick" && item.minutes > 5) return false;
    if (filters.pace === "short" && item.minutes > 10) return false;
    if (filters.pace === "long" && item.minutes <= 10) return false;
    if (progress && filters.record !== "all") {
      const status = getDiscoveryStatus(item, progress);
      if (filters.record === "ongoing" && !status.started) return false;
      if (filters.record === "completed" && !status.finished) return false;
      if (filters.record === "new" && status.count > 0) return false;
    }
    const words = searchable(
      [
        item.title,
        item.englishTitle,
        item.synopsis,
        item.genreLabel,
        categoryNames[item.kind],
        item.guide.goal.ko,
        item.guide.goal.en,
        item.guide.fit.ko,
        item.guide.fit.en,
        ...Object.values(item.guide.sample).flatMap((sample) => [sample.en, sample.ko]),
      ].join(" "),
    );
    return terms.every((term) => words.includes(term));
  });
}
export function libraryHref(
  filters: LibraryFilters,
  options: { focus?: string; level?: EnglishLevel } = {},
) {
  const query = new URLSearchParams();
  if (filters.query.trim()) query.set("q", filters.query.trim().slice(0, 160));
  for (const key of ["kind", "skill", "pace", "record"] as const)
    if (filters[key] !== "all") query.set(key, filters[key]);
  if (options.focus && /^[a-z0-9-]{1,80}$/.test(options.focus)) query.set("focus", options.focus);
  if (options.level) query.set("level", options.level);
  return "/english/library" + (query.size ? "?" + query.toString() : "");
}
