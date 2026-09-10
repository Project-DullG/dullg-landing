import { rng } from "./random.ts";

export const MATCH_SIZE = 6;
export const GEM_SYMBOLS = ["◆", "●", "▲", "■", "✦"];
export type MatchState = {
  cells: number[];
  moves: number;
  score: number;
  seed: number;
  combo: number;
  cleared: number;
  shuffled: boolean;
};
export function matchedCells(cells: number[]) {
  const matched = new Set<number>();
  for (let i = 0; i < 36; i++) {
    for (const step of [1, 6]) {
      const run = [i];
      for (let j = i + step; j < 36; j += step) {
        if (step === 1 && Math.floor(j / 6) !== Math.floor(i / 6)) break;
        if (cells[j] !== cells[i]) break;
        run.push(j);
      }
      if (run.length >= 3) run.forEach((cell) => matched.add(cell));
    }
  }
  return [...matched];
}
function adjacent(a: number, b: number) {
  return (
    a >= 0 &&
    b >= 0 &&
    a < 36 &&
    b < 36 &&
    (Math.abs(a - b) === 6 || (Math.abs(a - b) === 1 && Math.floor(a / 6) === Math.floor(b / 6)))
  );
}
export function matchHint(cells: number[]): [number, number] | null {
  for (let i = 0; i < 36; i++) {
    for (const j of [i + 1, i + 6]) {
      if (!adjacent(i, j)) continue;
      const next = [...cells];
      [next[i], next[j]] = [next[j], next[i]];
      if (matchedCells(next).length) return [i, j];
    }
  }
  return null;
}
function freshBoard(random: () => number) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const cells: number[] = [];
    for (let i = 0; i < 36; i++) {
      const allowed = [0, 1, 2, 3, 4].filter(
        (v) =>
          !(i % 6 >= 2 && cells[i - 1] === v && cells[i - 2] === v) &&
          !(i >= 12 && cells[i - 6] === v && cells[i - 12] === v),
      );
      cells.push(allowed[Math.floor(random() * allowed.length)]);
    }
    if (matchHint(cells)) return cells;
  }
  // The fixed arrangement has a legal swap and no starting match.
  return Array.from({ length: 36 }, (_, i) =>
    i === 1 ? 1 : i === 6 ? 0 : i === 2 ? 0 : (i + Math.floor(i / 6)) % 5,
  );
}
export function createMatch(seed = 42): MatchState {
  return {
    cells: freshBoard(rng(seed)),
    moves: 30,
    score: 0,
    seed,
    combo: 0,
    cleared: 0,
    shuffled: false,
  };
}
export function swapMatch(state: MatchState, a: number, b: number): MatchState {
  if (!state.moves || !adjacent(a, b)) return state;
  let cells = [...state.cells];
  [cells[a], cells[b]] = [cells[b], cells[a]];
  let matches = matchedCells(cells);
  if (!matches.length) return state;
  const seed = (state.seed + 1) >>> 0;
  const random = rng(seed);
  let combo = 0,
    score = state.score,
    cleared = 0;
  while (matches.length && combo < 50) {
    combo++;
    cleared += matches.length;
    score += matches.length * 10 * combo;
    const removed = new Set(matches);
    for (let x = 0; x < 6; x++) {
      const column = Array.from({ length: 6 }, (_, y) => y * 6 + x)
        .filter((index) => !removed.has(index))
        .map((index) => cells[index]);
      while (column.length < 6) column.unshift(Math.floor(random() * 5));
      column.forEach((value, y) => {
        cells[y * 6 + x] = value;
      });
    }
    matches = matchedCells(cells);
  }
  const shuffled = matches.length > 0 || !matchHint(cells);
  if (shuffled) cells = freshBoard(random);
  return { cells, moves: state.moves - 1, score, seed, combo, cleared, shuffled };
}
