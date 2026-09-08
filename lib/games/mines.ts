import { shuffled } from "./random.ts";
export type Mines = {
  size: number;
  count: number;
  seed: number;
  mines: number[];
  open: number[];
  flags: number[];
  started: boolean;
  status: "playing" | "won" | "lost";
  hit: number | null;
};
export function createMines(seed = 42, size = 6, count = 6): Mines {
  return {
    size,
    count,
    seed,
    mines: [],
    open: [],
    flags: [],
    started: false,
    status: "playing",
    hit: null,
  };
}
export function neighbors(index: number, size: number): number[] {
  const row = Math.floor(index / size),
    col = index % size,
    result: number[] = [];
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      const y = row + dy,
        x = col + dx;
      if ((dx || dy) && x >= 0 && x < size && y >= 0 && y < size) result.push(y * size + x);
    }
  return result;
}
export const mineCount = (s: Mines, index: number) =>
  neighbors(index, s.size).filter((i) => s.mines.includes(i)).length;
export function flagMine(s: Mines, index: number): Mines {
  if (s.status !== "playing" || s.open.includes(index)) return s;
  return {
    ...s,
    flags: s.flags.includes(index)
      ? s.flags.filter((i) => i !== index)
      : s.flags.length < s.count
        ? [...s.flags, index]
        : s.flags,
  };
}
export function revealMine(previous: Mines, index: number): Mines {
  if (
    previous.status !== "playing" ||
    previous.flags.includes(index) ||
    index < 0 ||
    index >= previous.size ** 2
  )
    return previous;
  const s = structuredClone(previous);
  if (!s.started) {
    const safe = new Set([index, ...neighbors(index, s.size)]);
    const cells = Array.from({ length: s.size ** 2 }, (_, i) => i);
    let candidates = cells.filter((i) => !safe.has(i));
    if (candidates.length < s.count) candidates = cells.filter((i) => i !== index);
    s.count = Math.min(s.count, candidates.length);
    s.mines = shuffled(candidates, s.seed).slice(0, s.count);
    s.started = true;
  }
  const queue = s.open.includes(index)
    ? neighbors(index, s.size).filter((i) => !s.flags.includes(i) && !s.open.includes(i))
    : [index];
  if (
    s.open.includes(index) &&
    neighbors(index, s.size).filter((i) => s.flags.includes(i)).length !== mineCount(s, index)
  )
    return previous;
  while (queue.length) {
    const cell = queue.pop()!;
    if (s.open.includes(cell) || s.flags.includes(cell)) continue;
    if (s.mines.includes(cell)) {
      s.status = "lost";
      s.hit = cell;
      return s;
    }
    s.open.push(cell);
    if (mineCount(s, cell) === 0)
      queue.push(...neighbors(cell, s.size).filter((i) => !s.open.includes(i)));
  }
  if (s.open.length === s.size ** 2 - s.count) {
    s.status = "won";
    s.flags = [...s.mines];
  }
  return s;
}
