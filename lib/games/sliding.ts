import { rng } from "./random.ts";
export type Sliding = { cells: number[]; moves: number; won: boolean };
export function adjacent(a: number, b: number) {
  return Math.abs(Math.floor(a / 4) - Math.floor(b / 4)) + Math.abs((a % 4) - (b % 4)) === 1;
}
export function slideTile(s: Sliding, index: number): Sliding {
  const empty = s.cells.indexOf(0);
  if (s.won || index < 0 || index >= 16 || !adjacent(index, empty)) return s;
  const cells = [...s.cells];
  [cells[index], cells[empty]] = [cells[empty], cells[index]];
  return { cells, moves: s.moves + 1, won: cells.every((v, i) => v === (i + 1) % 16) };
}
export function createSliding(seed = 42): Sliding {
  const random = rng(seed);
  let s: Sliding = {
      cells: Array.from({ length: 16 }, (_, i) => (i + 1) % 16),
      moves: 0,
      won: false,
    },
    last = -1;
  for (let i = 0; i < 120; i++) {
    const empty = s.cells.indexOf(0),
      options = s.cells.flatMap((_, index) =>
        index !== last && adjacent(index, empty) ? [index] : [],
      );
    s = slideTile({ ...s, won: false }, options[Math.floor(random() * options.length)]);
    last = empty;
  }
  if (s.won) s = slideTile({ ...s, won: false }, 14);
  return { ...s, moves: 0, won: false };
}
