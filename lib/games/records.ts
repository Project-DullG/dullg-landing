export function parseBest(value: string | null): number {
  const score = Number(value);
  return Number.isSafeInteger(score) && score >= 0 && score <= 1000000000 ? score : 0;
}
export function readBest(kind: string) {
  try {
    return parseBest(localStorage.getItem(`dullg.arcade.best.${kind}`));
  } catch {
    return 0;
  }
}
export function saveBest(kind: string, score: number) {
  const best = Math.max(readBest(kind), parseBest(String(score)));
  try {
    localStorage.setItem(`dullg.arcade.best.${kind}`, String(best));
  } catch {
    /* Optional device-local state. */
  }
  return best;
}
