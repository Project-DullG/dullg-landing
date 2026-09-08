import { shuffled } from "./random.ts";
const PUZZLE = "530070000600195000098000060800060003400803001700020006060000280000419005000080079";
const SOLUTION =
  "534678912672195348198342567859761423426853791713924856961537284287419635345286179";
export type Sudoku = {
  givens: number[];
  cells: number[];
  solution: number[];
  notes: number[][];
  moves: number;
  hints: number;
  won: boolean;
};
export function createSudoku(seed = 42): Sudoku {
  const digits = shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9], seed);
  const order = (offset: number) =>
    shuffled([0, 1, 2], seed + offset).flatMap((band) =>
      shuffled([0, 1, 2], seed + offset + band + 1).map((row) => band * 3 + row),
    );
  const rows = order(10),
    cols = order(20);
  const convert = (source: string) =>
    rows.flatMap((row) =>
      cols.map((col) =>
        Number(source[row * 9 + col]) ? digits[Number(source[row * 9 + col]) - 1] : 0,
      ),
    );
  const givens = convert(PUZZLE);
  return {
    givens,
    cells: [...givens],
    solution: convert(SOLUTION),
    notes: Array.from({ length: 81 }, () => []),
    moves: 0,
    hints: 0,
    won: false,
  };
}
export function sudokuConflicts(cells: number[]): number[] {
  return cells.flatMap((v, i) =>
    v &&
    cells.some(
      (other, j) =>
        i !== j &&
        v === other &&
        (Math.floor(i / 9) === Math.floor(j / 9) ||
          i % 9 === j % 9 ||
          (Math.floor(i / 27) === Math.floor(j / 27) &&
            Math.floor((i % 9) / 3) === Math.floor((j % 9) / 3))),
    )
      ? [i]
      : [],
  );
}
export function fillSudoku(s: Sudoku, index: number, value: number, pencil = false): Sudoku {
  if (s.won || s.givens[index] || index < 0 || index >= 81 || value < 0 || value > 9) return s;
  const next = structuredClone(s);
  if (pencil && value) {
    if (s.cells[index]) return s;
    next.notes[index] = s.notes[index].includes(value)
      ? s.notes[index].filter((v) => v !== value)
      : [...s.notes[index], value].sort();
  } else {
    if (s.cells[index] === value && !s.notes[index].length) return s;
    next.cells[index] = value;
    next.notes[index] = [];
  }
  next.moves++;
  next.won = next.cells.every(Boolean) && sudokuConflicts(next.cells).length === 0;
  return next;
}
export function hintSudoku(s: Sudoku, index: number): Sudoku {
  if (s.won) return s;
  const target =
    !s.givens[index] && s.cells[index] !== s.solution[index]
      ? index
      : s.cells.findIndex((v, i) => v !== s.solution[i]);
  if (target < 0) return s;
  const next = fillSudoku(s, target, s.solution[target]);
  return { ...next, hints: s.hints + 1 };
}
