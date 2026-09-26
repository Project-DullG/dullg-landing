import { catches, clearedDays, unlockedFish, type FishingState } from "./model.ts";

export const levelThresholds = [0, 100, 250, 450, 700, 1000, 1400, 1850, 2350, 3000];
export type PracticeCatch = { date: string; fish: number; level: number; version: 1 };
export function fishHash(value: string) {
  let result = 2166136261;
  for (const char of value) result = Math.imul(result ^ char.charCodeAt(0), 16777619);
  result ^= result >>> 16;
  result = Math.imul(result, 0x7feb352d);
  result ^= result >>> 15;
  return result >>> 0;
}
export function levelForXP(xp: number) {
  return Math.max(1, levelThresholds.filter((n) => xp >= n).length);
}
export function auroraRate(level: number) {
  return 12 + (Math.max(1, Math.min(10, level)) - 1) * 2;
}
export function studyDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
export function growthSummary(state: FishingState, now = new Date()) {
  const xp = (catches(state).length + (state.practiceCatches?.length || 0)) * 20;
  const level = levelForXP(xp),
    floor = levelThresholds[level - 1],
    next = levelThresholds[level] ?? null;
  return {
    xp,
    level,
    floor,
    next,
    remaining: next === null ? 0 : next - xp,
    aurora: auroraRate(level),
    weeklyRemaining: 7 - (clearedDays(state).length % 7),
    weeklyAvailable: clearedDays(state).length < 28,
    repeatClaimed: !!state.practiceCatches?.some((c) => c.date === studyDate(now)),
  };
}
// Store the level when the bundle is completed; later practice never rerolls old fish.
export function awardCourseGrowth(previous: FishingState, next: FishingState): FishingState {
  const old = new Set(catches(previous).map((c) => `${c.day}:${c.room}`));
  const fresh = catches(next).filter((c) => !old.has(`${c.day}:${c.room}`));
  if (!fresh.length) return next;
  const level = growthSummary(next).level;
  return {
    ...next,
    catchLevels: {
      ...next.catchLevels,
      ...Object.fromEntries(fresh.map((c) => [`${c.day}:${c.room}`, level])),
    },
  };
}
export const practiceSpecies = [
  { fish: 12, level: 2 },
  { fish: 13, level: 3 },
  { fish: 14, level: 4 },
  { fish: 15, level: 6 },
  { fish: 16, level: 8 },
  { fish: 17, level: 10 },
];
export function awardPracticeCatch(state: FishingState, now: Date): FishingState {
  const date = studyDate(now),
    previous = state.practiceCatches || [];
  if (previous.some((c) => c.date === date)) return state;
  const level = levelForXP((catches(state).length + previous.length + 1) * 20);
  const extras = practiceSpecies.filter((s) => s.level <= level);
  const unseen = extras.find((s) => !previous.some((c) => c.fish === s.fish));
  const pool = [...unlockedFish(clearedDays(state).length), ...extras.map((s) => s.fish)];
  const fish =
    unseen?.fish ??
    pool[fishHash(`${state.collectionSeed || "legacy"}:practice-species-v1:${date}`) % pool.length];
  return { ...state, practiceCatches: [...previous, { date, fish, level, version: 1 }] };
}

export const aquariumThemes = [
  { id: "clear", name: "맑은 자갈 수조", level: 1, slots: 3 },
  { id: "coral", name: "산호 수조", level: 4, slots: 5 },
  { id: "moon", name: "달빛 수조", level: 7, slots: 7 },
] as const;
export function aquariumSummary(state: FishingState) {
  const level = growthSummary(state).level;
  const themes = aquariumThemes.map((t) => ({ ...t, unlocked: level >= t.level }));
  const selected = themes.find((t) => t.id === state.aquariumTheme && t.unlocked) || themes[0];
  const slots = [...themes].reverse().find((t) => t.unlocked)!.slots;
  return { themes, selected, slots, next: themes.find((t) => !t.unlocked) || null };
}
export function applyAquariumTheme(state: FishingState, id: unknown) {
  if (
    typeof id !== "string" ||
    !aquariumSummary(state).themes.some((t) => t.id === id && t.unlocked)
  )
    throw new Error("열린 수조 중에서 선택하세요.");
  return { ...state, aquariumTheme: id };
}
