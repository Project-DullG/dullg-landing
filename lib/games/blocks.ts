export const COLS = 10;
export const ROWS = 16;
export const SHAPES = [
  [[1, 1, 1, 1]],
  [
    [2, 2],
    [2, 2],
  ],
  [
    [0, 3, 0],
    [3, 3, 3],
  ],
  [
    [0, 4, 4],
    [4, 4, 0],
  ],
  [
    [5, 5, 0],
    [0, 5, 5],
  ],
  [
    [6, 0, 0],
    [6, 6, 6],
  ],
  [
    [0, 0, 7],
    [7, 7, 7],
  ],
];
export type Blocks = {
  board: number[][];
  piece: number[][];
  x: number;
  y: number;
  next: number;
  current: number;
  held: number | null;
  canHold: boolean;
  grounded: number;
  bag: number[];
  seed: number;
  lines: number;
  score: number;
  elapsed: number;
  over: boolean;
};
function random(state: Blocks) {
  state.seed = (state.seed * 1664525 + 1013904223) >>> 0;
  return state.seed / 4294967296;
}
function take(state: Blocks) {
  if (!state.bag.length) {
    state.bag = [0, 1, 2, 3, 4, 5, 6];
    for (let i = 6; i > 0; i--) {
      const j = Math.floor(random(state) * (i + 1));
      [state.bag[i], state.bag[j]] = [state.bag[j], state.bag[i]];
    }
  }
  return state.bag.pop()!;
}
export function createBlocks(seed = 42): Blocks {
  const state: Blocks = {
    board: Array.from({ length: ROWS }, () => Array(COLS).fill(0)),
    piece: [],
    x: 3,
    y: 0,
    next: 0,
    current: 0,
    held: null,
    canHold: true,
    grounded: 0,
    bag: [],
    seed,
    lines: 0,
    score: 0,
    elapsed: 0,
    over: false,
  };
  state.current = take(state);
  state.piece = SHAPES[state.current].map((row) => [...row]);
  state.next = take(state);
  return state;
}
export function fits(state: Blocks, piece = state.piece, x = state.x, y = state.y) {
  return piece.every((row, dy) =>
    row.every(
      (cell, dx) =>
        !cell ||
        (x + dx >= 0 &&
          x + dx < COLS &&
          y + dy >= 0 &&
          y + dy < ROWS &&
          !state.board[y + dy][x + dx]),
    ),
  );
}
export function rotateBlocks(state: Blocks) {
  if (state.over) return;
  const rotated = state.piece[0].map((_, i) => state.piece.map((row) => row[i]).reverse());
  for (const offset of [0, -1, 1, -2, 2])
    if (fits(state, rotated, state.x + offset)) {
      state.piece = rotated;
      state.x += offset;
      return;
    }
}
export function moveBlocks(state: Blocks, dx: number) {
  if (!state.over && fits(state, state.piece, state.x + dx)) state.x += dx;
}
export function dropBlocks(state: Blocks) {
  if (state.over) return;
  if (fits(state, state.piece, state.x, state.y + 1)) {
    state.y++;
    return;
  }
  state.piece.forEach((row, dy) =>
    row.forEach((cell, dx) => {
      if (cell) state.board[state.y + dy][state.x + dx] = cell;
    }),
  );
  const kept = state.board.filter((row) => row.some((cell) => !cell));
  const cleared = ROWS - kept.length;
  state.score += [0, 100, 300, 500, 800][cleared] * (1 + Math.floor(state.lines / 5));
  state.lines += cleared;
  state.board = [...Array.from({ length: cleared }, () => Array(COLS).fill(0)), ...kept];
  state.current = state.next;
  state.piece = SHAPES[state.current].map((row) => [...row]);
  state.next = take(state);
  state.canHold = true;
  state.grounded = 0;
  state.x = Math.floor((COLS - state.piece[0].length) / 2);
  state.y = 0;
  state.elapsed = 0;
  state.over = !fits(state);
}
export function hardDrop(state: Blocks) {
  if (state.over) return;
  while (fits(state, state.piece, state.x, state.y + 1)) {
    state.y++;
    state.score += 2;
  }
  dropBlocks(state);
}
export function stepBlocks(state: Blocks, dt: number) {
  if (state.over) return;
  if (!fits(state, state.piece, state.x, state.y + 1)) {
    state.grounded += dt;
    if (state.grounded >= 0.35) dropBlocks(state);
    return;
  }
  state.grounded = 0;
  state.elapsed += dt;
  const interval = Math.max(0.13, 0.72 - Math.floor(state.lines / 5) * 0.08);
  while (state.elapsed >= interval && !state.over) {
    state.elapsed -= interval;
    if (fits(state, state.piece, state.x, state.y + 1)) state.y++;
    else break;
  }
}

export function holdBlocks(state: Blocks) {
  if (state.over || !state.canHold) return;
  const previous = state.current;
  state.current = state.held ?? state.next;
  if (state.held === null) state.next = take(state);
  state.held = previous;
  state.piece = SHAPES[state.current].map((row) => [...row]);
  state.x = Math.floor((COLS - state.piece[0].length) / 2);
  state.y = 0;
  state.elapsed = 0;
  state.grounded = 0;
  state.canHold = false;
  state.over = !fits(state);
}
