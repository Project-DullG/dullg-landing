export type PracticeToken = { id: number; text: string };

/** Occurrence IDs distinguish repeated words; the initial pool is not the answer order. */
export function practiceTokenPool(tokens: string[]): PracticeToken[] {
  const pool = tokens.map((text, id) => ({ id, text }));
  if (pool.length < 2) return pool;
  const offset = Math.max(1, Math.floor(pool.length / 2));
  return [...pool.slice(offset), ...pool.slice(0, offset)];
}

export function practiceSentence(tokens: string[], selected: number[]): string {
  const seen = new Set<number>();
  return selected
    .flatMap((id) => {
      if (!Number.isInteger(id) || id < 0 || id >= tokens.length || seen.has(id)) return [];
      seen.add(id);
      return [tokens[id]];
    })
    .join(" ");
}

/** A stable Korean calendar day makes the suggestion predictable without invented activity. */
export function practiceRecommendationId(ids: string[], koreanDay: string): string | undefined {
  if (!ids.length) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(koreanDay)) return ids[0];
  const seed =
    [...koreanDay].reduce((value, character) => value * 31 + character.charCodeAt(0), 0) >>> 0;
  return ids[seed % ids.length];
}
