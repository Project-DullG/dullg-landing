import readGuides from "./read-guides.json" with { type: "json" };
import answerGuides from "./answer-guides.json" with { type: "json" };
import type { Question } from "./content.ts";
export type PronunciationSegment = { english: string; hangul: string };
export const pronunciationGuides: Record<string, PronunciationSegment[]> = {
  ...readGuides,
  ...answerGuides,
};
export function pronunciationFor(q: Question) {
  return pronunciationGuides[q.id] || [];
}

// Keep each English sentence beside its existing Korean approximation.
// Chunks are editorial boundaries, so do not split or regenerate their Hangul.
export function pronunciationSentences(segments: PronunciationSegment[]) {
  const sentences: PronunciationSegment[] = [];
  let current: PronunciationSegment = { english: "", hangul: "" };
  for (const segment of segments) {
    current.english = [current.english, segment.english].filter(Boolean).join(" ");
    current.hangul = [current.hangul, segment.hangul].filter(Boolean).join(" ");
    if (/[.!?][”"']?$/.test(segment.english.trim())) {
      sentences.push(current);
      current = { english: "", hangul: "" };
    }
  }
  if (current.english) sentences.push(current);
  return sentences;
}
