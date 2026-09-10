import assert from "node:assert/strict";
import test from "node:test";
import { createMatch, matchHint, matchedCells, swapMatch } from "../lib/games/match-three.ts";
import { createLights, toggleLights } from "../lib/games/lights.ts";
import { createSnake, turnSnake, stepSnake } from "../lib/games/snake.ts";

test("match-three starts stable and playable; valid swaps use exactly one move", () => {
  for (let seed = 0; seed < 50; seed++) {
    let state = createMatch(seed);
    for (let move = 0; move < 30; move++) {
      assert.equal(matchedCells(state.cells).length, 0);
      assert.ok(state.cells.every((gem) => gem >= 0 && gem < 5));
      const pair = matchHint(state.cells);
      assert.ok(pair);
      assert.equal(swapMatch(state, 5, 6), state);
      const next = swapMatch(state, ...pair);
      assert.equal(next.moves, state.moves - 1);
      assert.ok(next.score > state.score);
      assert.ok(next.cleared >= 3);
      state = next;
    }
    assert.equal(state.moves, 0);
    assert.equal(swapMatch(state, ...matchHint(state.cells)), state);
  }
});
test("a non-matching exchange preserves board, score, and random seed", () => {
  const state = createMatch(42);
  let checked = 0;
  for (let i = 0; i < 35; i++) {
    const next = swapMatch(state, i, i + 1);
    if (next === state) {
      assert.equal(next.seed, state.seed);
      checked++;
    }
  }
  assert.ok(checked > 0);
});
test("lights puzzles have a working solution and toggles never wrap rows", () => {
  for (let seed = 0; seed < 100; seed++) {
    let state = createLights(seed);
    assert.ok(state.cells.some(Boolean));
    for (const cell of [...state.solution]) state = toggleLights(state, cell);
    assert.equal(state.won, true);
    assert.ok(state.cells.every((lit) => !lit));
  }
  const state = { cells: Array(25).fill(false), moves: 0, solution: [], won: false };
  assert.deepEqual(
    toggleLights(state, 4).cells.flatMap((v, i) => (v ? [i] : [])),
    [3, 4, 9],
  );
});
test("snake rejects reversals, queues at most two turns, and stops at walls", () => {
  const state = createSnake();
  assert.equal(turnSnake(state, "left"), state);
  const queued = turnSnake(turnSnake(state, "up"), "left");
  assert.equal(turnSnake(queued, "down"), queued);
  const next = stepSnake(queued);
  assert.equal(next.direction, "up");
  assert.deepEqual(next.queue, ["left"]);
  assert.equal(stepSnake(next).direction, "left");
  assert.equal(stepSnake({ ...state, body: [15, 14, 13], food: 0 }).over, true);
});
test("snake can enter a departing tail and places food only in empty cells", () => {
  let state = {
    ...createSnake(),
    body: [17, 18, 34, 33],
    direction: "left",
    food: 100,
    queue: ["down"],
  };
  state = stepSnake(state);
  assert.equal(state.over, false);
  assert.equal(state.body[0], 33);
  const eating = stepSnake({ ...createSnake(), food: 136 });
  assert.equal(eating.score, 10);
  assert.equal(eating.body.length, 4);
  assert.ok(!eating.body.includes(eating.food));
});
