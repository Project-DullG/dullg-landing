import assert from "node:assert/strict";
import test from "node:test";
import { createMines, revealMine, flagMine, neighbors } from "../lib/games/mines.ts";
import {
  createSolitaire,
  drawCard,
  moveCard,
  canMoveCard,
  solitaireHint,
} from "../lib/games/solitaire.ts";
import { createMerge, mergeLine, moveMerge, mergeOver } from "../lib/games/merge.ts";
import { createSudoku, fillSudoku, hintSudoku, sudokuConflicts } from "../lib/games/sudoku.ts";
import { createSliding, slideTile } from "../lib/games/sliding.ts";
import { createMemory, flipMemory, closeMemory } from "../lib/games/memory.ts";
import { applyTurn, undoTurn, resetTurn } from "../lib/games/history.ts";

test("mines protect every possible first click across seeds and preserve mine count", () => {
  for (let seed = 1; seed <= 40; seed++)
    for (let i = 0; i < 36; i++) {
      const s = revealMine(createMines(seed), i);
      assert.equal(s.mines.length, 6);
      assert.notEqual(s.status, "lost");
      if (s.status === "won") assert.equal(s.open.length, 30);
      assert.ok([i, ...neighbors(i, 6)].every((cell) => !s.mines.includes(cell)));
      assert.ok(s.open.every((cell) => !s.mines.includes(cell)));
    }
});
test("mine flags do not consume first click; safe cells, not flags, determine victory", () => {
  let s = flagMine(createMines(), 0);
  assert.equal(s.started, false);
  assert.equal(revealMine(s, 0), s);
  s = revealMine(s, 35);
  assert.equal(s.open.includes(0), false);
  for (let i = 0; i < 36; i++)
    if (!s.mines.includes(i)) {
      if (s.flags.includes(i)) s = flagMine(s, i);
      s = revealMine(s, i);
    }
  assert.equal(s.status, "won");
  assert.equal(s.open.length, 30);
});
test("tiny custom mine boards retain their mine and can finish", () => {
  let s = revealMine(createMines(42, 3, 1), 4);
  assert.equal(s.mines.length, 1);
  assert.equal(s.mines.includes(4), false);
  for (let i = 0; i < 9; i++) if (!s.mines.includes(i)) s = revealMine(s, i);
  assert.equal(s.status, "won");
});
const card = (rank, suit = 0, up = true) => ({ id: suit * 13 + rank - 1, rank, suit, up });
const blank = () => ({
  stock: [],
  waste: [],
  columns: Array.from({ length: 7 }, () => []),
  foundations: Array.from({ length: 4 }, () => []),
  moves: 0,
  won: false,
});
const column = (pile, index = 0) => ({ kind: "column", pile, index });
const target = (pile) => ({ kind: "column", pile });
test("solitaire deals 52 unique cards, seven columns and a 24-card stock", () => {
  for (let seed = 1; seed < 40; seed++) {
    const s = createSolitaire(seed);
    assert.deepEqual(
      s.columns.map((c) => c.length),
      [1, 2, 3, 4, 5, 6, 7],
    );
    assert.equal(s.stock.length, 24);
    assert.ok(s.columns.every((c) => c.at(-1).up && c.slice(0, -1).every((card) => !card.up)));
    assert.equal(new Set([...s.stock, ...s.columns.flat()].map((c) => c.id)).size, 52);
  }
});
test("solitaire enforces alternating colors, ranks, face-up runs and empty-column kings", () => {
  const s = blank();
  s.columns[0] = [card(7)];
  s.columns[1] = [card(8, 1)];
  s.columns[2] = [card(8, 2)];
  assert.equal(canMoveCard(s, column(0), target(1)), true);
  assert.equal(canMoveCard(s, column(0), target(2)), false);
  assert.equal(canMoveCard(s, column(0), target(3)), false);
  s.columns[0] = [card(13), card(12, 1)];
  assert.equal(canMoveCard(s, column(0), target(3)), true);
  s.columns[0][1] = card(11, 1);
  assert.equal(canMoveCard(s, column(0), target(3)), false);
  s.columns[0] = [card(13, 0, false)];
  assert.equal(canMoveCard(s, column(0), target(3)), false);
});
test("solitaire exposes the next hidden card and foundation requires one matching card", () => {
  let s = blank();
  s.columns[0] = [card(6, 1, false), card(1, 0)];
  assert.equal(canMoveCard(s, column(0, 1), { kind: "foundation", pile: 1 }), false);
  s = moveCard(s, column(0, 1), { kind: "foundation", pile: 0 });
  assert.equal(s.columns[0][0].up, true);
  assert.equal(s.foundations[0].length, 1);
  s.columns[1] = [card(2, 1)];
  const hint = solitaireHint(s);
  assert.ok(hint);
  assert.ok(canMoveCard(s, hint.from, hint.to));
});
test("stock recycling preserves draw order and undo restores complete state", () => {
  let s = blank();
  s.stock = [card(2), card(3), card(4)];
  let history = { state: s, past: [], seed: 42 };
  for (let i = 0; i < 3; i++) history = applyTurn(history, drawCard);
  assert.deepEqual(
    history.state.waste.map((c) => c.rank),
    [2, 3, 4],
  );
  const before = structuredClone(history.state);
  history = applyTurn(history, drawCard);
  assert.deepEqual(
    history.state.stock.map((c) => c.rank),
    [2, 3, 4],
  );
  assert.deepEqual(undoTurn(history).state, before);
  history = applyTurn(history, drawCard);
  assert.equal(history.state.waste[0].rank, 2);
  const reset = resetTurn(history, createSolitaire);
  assert.equal(reset.past.length, 0);
  assert.equal(reset.seed, 43);
  assert.equal(reset.state.moves, 0);
});
test("solitaire win is reached only after all 52 foundation cards", () => {
  let s = blank();
  s.foundations = Array.from({ length: 4 }, (_, suit) =>
    Array.from({ length: suit === 3 ? 12 : 13 }, (_, i) => card(i + 1, suit)),
  );
  s.waste = [card(13, 3)];
  assert.equal(s.won, false);
  s = moveCard(s, { kind: "waste", pile: 0, index: 0 }, { kind: "foundation", pile: 3 });
  assert.equal(s.won, true);
  assert.equal(drawCard(s), s);
});
test("2048 merges each tile once and scores only merges", () => {
  assert.deepEqual(mergeLine([2, 2, 2, 2]), { line: [4, 4, 0, 0], score: 8 });
  assert.deepEqual(mergeLine([2, 2, 4, 0]), { line: [4, 4, 0, 0], score: 4 });
  const s = { ...createMerge(), cells: [2, 0, 0, 0, ...Array(12).fill(0)] };
  assert.equal(moveMerge(s, "left"), s);
  const next = moveMerge(s, "right");
  assert.equal(next.cells.filter(Boolean).length, 2);
  assert.equal(next.moves, 1);
  assert.equal(next.score, 0);
  assert.equal(mergeOver([2, 4, 2, 4, 4, 2, 4, 2, 2, 4, 2, 4, 4, 2, 4, 2]), true);
  assert.equal(mergeOver([2, 2, 2, 4, 4, 2, 4, 2, 2, 4, 2, 4, 4, 2, 4, 2]), false);
});
function solutionCount(values) {
  const cells = [...values];
  let count = 0;
  function solve() {
    if (count >= 2) return;
    let best = -1,
      options = [];
    for (let i = 0; i < 81; i++)
      if (!cells[i]) {
        const candidates = [];
        for (let v = 1; v <= 9; v++) {
          cells[i] = v;
          if (!sudokuConflicts(cells).includes(i)) candidates.push(v);
        }
        cells[i] = 0;
        if (!candidates.length) return;
        if (best === -1 || candidates.length < options.length) {
          best = i;
          options = candidates;
        }
      }
    if (best === -1) {
      count++;
      return;
    }
    for (const v of options) {
      cells[best] = v;
      solve();
    }
    cells[best] = 0;
  }
  solve();
  return count;
}
test("generated Sudoku variants have one valid solution", () => {
  for (let seed = 1; seed <= 8; seed++) {
    const s = createSudoku(seed);
    assert.equal(sudokuConflicts(s.solution).length, 0);
    assert.ok(s.givens.every((v, i) => !v || s.solution[i] === v));
    assert.equal(solutionCount(s.givens), 1);
  }
});
test("Sudoku protects givens, manages notes and detects completed solutions", () => {
  let s = createSudoku(),
    given = s.givens.findIndex(Boolean),
    empty = s.givens.findIndex((v) => !v);
  assert.equal(fillSudoku(s, given, 0), s);
  s = fillSudoku(s, empty, 3, true);
  assert.deepEqual(s.notes[empty], [3]);
  assert.equal(s.cells[empty], 0);
  s = hintSudoku(s, empty);
  assert.equal(s.cells[empty], s.solution[empty]);
  assert.equal(s.hints, 1);
  assert.deepEqual(s.notes[empty], []);
  for (let i = 0; i < 81; i++) if (!s.givens[i]) s = fillSudoku(s, i, s.solution[i]);
  assert.equal(s.won, true);
});
test("sliding boards are solvable, legal moves cannot wrap a row, and final move wins", () => {
  for (let seed = 1; seed <= 100; seed++) {
    const s = createSliding(seed);
    assert.equal(new Set(s.cells).size, 16);
    assert.equal(s.won, false);
    const values = s.cells.filter(Boolean);
    let inversions = 0;
    values.forEach((v, i) =>
      values.slice(i + 1).forEach((w) => {
        if (v > w) inversions++;
      }),
    );
    assert.equal((inversions + 4 - Math.floor(s.cells.indexOf(0) / 4)) % 2, 1);
  }
  const s = { cells: [1, 2, 3, 0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], moves: 0, won: false };
  assert.equal(slideTile(s, 4), s);
  const final = {
    cells: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0, 15],
    moves: 0,
    won: false,
  };
  assert.equal(slideTile(final, 15).won, true);
});
test("memory counts pairs, blocks duplicate and third clicks, and resolves mismatch", () => {
  let s = createMemory();
  for (let v = 0; v < 6; v++) assert.equal(s.cards.filter((c) => c === v).length, 2);
  s = flipMemory(s, 0);
  assert.equal(flipMemory(s, 0), s);
  const other = s.cards.findIndex((v) => v !== s.cards[0]);
  s = flipMemory(s, other);
  assert.equal(s.attempts, 1);
  assert.equal(flipMemory(s, 5), s);
  s = closeMemory(s);
  assert.deepEqual(s.flipped, []);
  for (let value = 0; value < 6; value++)
    for (const i of s.cards.flatMap((v, i) => (v === value ? [i] : []))) s = flipMemory(s, i);
  assert.equal(s.won, true);
  assert.equal(s.matched.length, 12);
});
test("history ignores invalid actions, bounds undo records and isolates new games", () => {
  let h = { state: { n: 0 }, past: [], seed: 1 };
  assert.equal(
    applyTurn(h, (s) => s),
    h,
  );
  for (let i = 0; i < 120; i++) h = applyTurn(h, (s) => ({ n: s.n + 1 }));
  assert.equal(h.past.length, 100);
  assert.equal(undoTurn(h).state.n, 119);
  const fresh = resetTurn(h, () => ({ n: 0 }));
  assert.equal(undoTurn(fresh), fresh);
});
