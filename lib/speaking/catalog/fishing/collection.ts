import { catches, type FishingState } from "./model.ts";
import {
  fishHash as hash,
  levelForXP,
  auroraRate,
  growthSummary,
  aquariumSummary,
  practiceSpecies,
} from "./growth.ts";

export const sizeGrades = ["아담", "보통", "대형", "특대"];
export const fishPatterns = ["기본", "반점", "오로라"];
const baseLengths = [12, 10, 18, 20, 9, 16, 22, 17, 20, 15, 32, 26, 13, 28, 24, 15, 11, 30];
export function catchTraits(
  day: number,
  room: number,
  fish: number,
  seed = "legacy",
  level = 1,
  token = `${day}:${room}`,
) {
  const roll = hash(`${seed}:size-v1:${token}`) % 100;
  // Every seventh completed study day ends with a trophy-size specimen.
  const grade =
    room === 4 && (day + 1) % 7 === 0 ? 3 : roll < 40 ? 0 : roll < 75 ? 1 : roll < 95 ? 2 : 3;
  const lengthRoll = hash(`${seed}:length-v1:${token}`) % 100;
  const length =
    Math.round(baseLengths[fish] * ([0.6, 0.85, 1.1, 1.4][grade] + lengthRoll / 500) * 10) / 10;
  const patternRoll = hash(`${seed}:pattern-v1:${token}`) % 100;
  const pattern =
    room === 4 && (day + 1) % 7 === 0
      ? 2
      : patternRoll < 72 - auroraRate(level)
        ? 0
        : patternRoll < 100 - auroraRate(level)
          ? 1
          : 2;
  return {
    id: token,
    level,
    motion: hash(`${seed}:motion-v1:${token}`) % 3,
    grade,
    gradeName: sizeGrades[grade],
    length,
    pattern,
    patternName: fishPatterns[pattern],
  };
}
export function collectionRecords(state: FishingState) {
  const course = catches(state).map((c) => ({
    ...c,
    source: "course" as const,
    date: "",
    ...catchTraits(
      c.day,
      c.room,
      c.fish,
      state.collectionSeed,
      state.catchLevels?.[`${c.day}:${c.room}`] ?? levelForXP((c.day * 5 + c.room + 1) * 20),
    ),
  }));
  const practice = (state.practiceCatches || []).map((c) => ({
    fish: c.fish,
    day: -1,
    room: -1,
    star: false,
    source: "repeat" as const,
    date: c.date,
    ...catchTraits(-1, -1, c.fish, state.collectionSeed, c.level, `repeat:${c.date}`),
  }));
  return [...course, ...practice];
}
export type FishRecord = ReturnType<typeof collectionRecords>[number];
export function collectionSummary(state: FishingState) {
  const records = collectionRecords(state);
  const largest = [...records].sort((a, b) => b.length - a.length)[0] ?? null;
  const featured =
    records.find((c) => c.id === state.featuredCatchId && c.fish === state.featured) ??
    [...records].filter((c) => c.fish === state.featured).sort((a, b) => b.length - a.length)[0] ??
    records[0] ??
    null;
  return {
    records,
    feedingLog: state.feedingLog || {},
    practiceSpecies,
    growth: growthSummary(state),
    aquarium: aquariumSummary(state),
    largest,
    featured,
    grades: sizeGrades.map((name, grade) => ({
      name,
      count: records.filter((c) => c.grade === grade).length,
    })),
    patterns: fishPatterns.map((name, pattern) => ({
      name,
      count: records.filter((c) => c.pattern === pattern).length,
    })),
  };
}
