export type Direction = "left" | "right" | "up" | "down";
export type Merge = {
  cells: number[];
  score: number;
  seed: number;
  moves: number;
  over: boolean;
  won: boolean;
};
function spawn(s: Merge) {
  const empty = s.cells.flatMap((v, i) => (v === 0 ? [i] : []));
  if (!empty.length) return;
  s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0;
  const index = empty[Math.floor((s.seed / 4294967296) * empty.length)];
  s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0;
  s.cells[index] = s.seed / 4294967296 < 0.9 ? 2 : 4;
}
export function createMerge(seed = 42): Merge {
  const s = { cells: Array(16).fill(0), score: 0, seed, moves: 0, over: false, won: false };
  spawn(s);
  spawn(s);
  return s;
}
export function mergeLine(line: number[]): { line: number[]; score: number } {
  const compact = line.filter(Boolean),
    result: number[] = [];
  let score = 0;
  for (let i = 0; i < compact.length; i++) {
    if (compact[i] === compact[i + 1]) {
      result.push(compact[i] * 2);
      score += compact[i] * 2;
      i++;
    } else result.push(compact[i]);
  }
  return { line: [...result, ...Array(4 - result.length).fill(0)], score };
}
export function mergeOver(cells: number[]): boolean {
  return (
    !cells.includes(0) &&
    cells.every(
      (cell, i) => (i % 4 === 3 || cells[i + 1] !== cell) && (i >= 12 || cells[i + 4] !== cell),
    )
  );
}
export function moveMerge(s: Merge, direction: Direction): Merge {
  if (s.over) return s;
  const next = structuredClone(s);
  for (let line = 0; line < 4; line++) {
    const ids = Array.from({ length: 4 }, (_, i) =>
      direction === "left"
        ? line * 4 + i
        : direction === "right"
          ? line * 4 + 3 - i
          : direction === "up"
            ? i * 4 + line
            : (3 - i) * 4 + line,
    );
    const merged = mergeLine(ids.map((i) => s.cells[i]));
    ids.forEach((id, i) => (next.cells[id] = merged.line[i]));
    next.score += merged.score;
  }
  if (next.cells.every((v, i) => v === s.cells[i])) return s;
  spawn(next);
  next.moves++;
  next.won = next.cells.some((v) => v >= 2048);
  next.over = mergeOver(next.cells);
  return next;
}
