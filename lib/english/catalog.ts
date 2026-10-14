import type { EnglishEpisode, EnglishExpression } from "./types.ts";
import { revisedEnglishEpisodes } from "./revised-episodes.ts";
import { newEnglishEpisodes } from "./new-episodes.ts";
import { englishPracticePacks } from "./practice.ts";

// Reviewed original content. Public models are study material, not examination secrets.
export const englishEpisodes: EnglishEpisode[] = [...revisedEnglishEpisodes, ...newEnglishEpisodes];
export const allEnglishContent: EnglishEpisode[] = [...englishEpisodes, ...englishPracticePacks];
export function getEnglishEpisode(id: string): EnglishEpisode | undefined {
  return allEnglishContent.find((episode) => episode.id === id);
}
export function getEnglishExpression(id: string): EnglishExpression | undefined {
  for (const episode of allEnglishContent) {
    const expression = episode.expressions.find((item) => item.id === id);
    if (expression) return expression;
  }
  return undefined;
}
