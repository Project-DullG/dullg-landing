import assert from "node:assert/strict";
import test from "node:test";
import {
  createBlocks,
  fits,
  moveBlocks,
  rotateBlocks,
  dropBlocks,
  hardDrop,
  holdBlocks,
  stepBlocks,
} from "../lib/games/blocks.ts";
import { createPinball, launchBall, stepPinball, BUMPERS } from "../lib/games/pinball.ts";
import { createDodge, moveDodge, stepDodge } from "../lib/games/dodge.ts";
import { parseBest } from "../lib/games/records.ts";

test("block generation is repeatable and wall inputs preserve a valid board", () => {
  assert.deepEqual(createBlocks(15), createBlocks(15));
  const s = createBlocks(15);
  for (let i = 0; i < 20; i++) moveBlocks(s, -1);
  assert.equal(s.x, 0);
  rotateBlocks(s);
  assert.ok(fits(s));
  for (let i = 0; i < 20; i++) moveBlocks(s, 1);
  assert.ok(fits(s));
  assert.equal(fits(s, s.piece, s.x + 1), false);
});
test("block hold can only be used once per falling piece", () => {
  const s = createBlocks(),
    first = s.current,
    next = s.next;
  holdBlocks(s);
  assert.equal(s.held, first);
  assert.equal(s.current, next);
  const snapshot = structuredClone(s);
  holdBlocks(s);
  assert.deepEqual(s, snapshot);
  hardDrop(s);
  assert.equal(s.canHold, true);
  holdBlocks(s);
  assert.equal(s.current, first);
});
test("one through four completed rows clear and score correctly", () => {
  for (let count = 1; count <= 4; count++) {
    const s = createBlocks();
    for (let y = 16 - count; y < 16; y++) s.board[y] = [0, ...Array(9).fill(2)];
    s.piece = Array.from({ length: count }, () => [1]);
    s.x = 0;
    s.y = 16 - count;
    dropBlocks(s);
    assert.equal(s.lines, count);
    assert.equal(s.score, [0, 100, 300, 500, 800][count]);
    assert.equal(s.board.length, 16);
    assert.ok(s.board.every((row) => row.every((cell) => cell === 0)));
  }
});
test("blocks allow a short landing delay and stop after top-out", () => {
  const s = createBlocks();
  s.piece = [[1]];
  s.x = 0;
  s.y = 15;
  stepBlocks(s, 0.2);
  assert.equal(s.board[15][0], 0);
  stepBlocks(s, 0.16);
  assert.equal(s.board[15][0], 1);
  s.board = s.board.map(() => Array(10).fill(0));
  s.board[0][3] = 2;
  s.board[0][4] = 2;
  s.board[0][5] = 2;
  s.piece = [[1]];
  s.y = 15;
  s.x = 0;
  dropBlocks(s);
  assert.equal(s.over, true);
  const before = structuredClone(s);
  hardDrop(s);
  holdBlocks(s);
  rotateBlocks(s);
  moveBlocks(s, 1);
  stepBlocks(s, 1);
  assert.deepEqual(s, before);
});
test("pinball launch reaches the upper table before descending to flippers", () => {
  const s = createPinball();
  launchBall(s);
  const launched = structuredClone(s);
  launchBall(s);
  assert.deepEqual(s, launched);
  let minY = s.y;
  for (let i = 0; i < 240; i++) {
    stepPinball(s, 1 / 120);
    minY = Math.min(minY, s.y);
    assert.ok(Number.isFinite(s.x + s.y + s.vx + s.vy));
  }
  assert.ok(minY < 50, `launch only reached y=${minY}`);
  assert.equal(s.lives, 3);
  assert.ok(s.score > 0, "launch should reach the bumper region");
});
test("pinball awards the three-bumper bonus exactly once", () => {
  const s = createPinball();
  s.ready = false;
  for (const b of BUMPERS) {
    s.x = b.x;
    s.y = b.y - b.r - 8.8;
    s.vx = 0;
    s.vy = 100;
    stepPinball(s, 1 / 240);
  }
  assert.equal(s.score, 800);
  assert.deepEqual(s.hits, [false, false, false]);
  assert.ok(s.bonus > 0);
});
test("three pinball drains end the game and reset safe launch coordinates", () => {
  const s = createPinball();
  for (let remaining = 2; remaining >= 0; remaining--) {
    launchBall(s);
    s.y = 546;
    s.x = 180;
    s.vy = 100;
    stepPinball(s, 1 / 120);
    assert.equal(s.lives, remaining);
    assert.equal(s.ready, true);
    assert.equal(s.x, 300);
    assert.equal(s.y, 320);
  }
  assert.equal(s.over, true);
  const before = structuredClone(s);
  launchBall(s);
  stepPinball(s, 1);
  assert.deepEqual(s, before);
});
test("dodge moves continuously, clamps lanes and detects collision on the actual car", () => {
  const s = createDodge();
  moveDodge(s, -1);
  stepDodge(s, 0.05);
  assert.equal(s.x, 130);
  stepDodge(s, 0.05);
  assert.equal(s.x, 80);
  moveDodge(s, -1);
  assert.equal(s.lane, 0);
  s.obstacles = [{ lane: 0, y: 428 }];
  stepDodge(s, 1 / 120);
  assert.equal(s.over, true);
  const before = structuredClone(s);
  moveDodge(s, 1);
  stepDodge(s, 1);
  assert.deepEqual(s, before);
});
test("a passed car scores only once and seeded traffic is repeatable", () => {
  const s = createDodge();
  s.obstacles = [{ lane: 0, y: 531 }];
  stepDodge(s, 1 / 120);
  assert.equal(s.score, 10);
  stepDodge(s, 1 / 120);
  assert.equal(s.score, 10);
  const a = createDodge(61),
    b = createDodge(61);
  for (let i = 0; i < 300; i++) {
    stepDodge(a, 1 / 120);
    stepDodge(b, 1 / 120);
  }
  assert.deepEqual(a, b);
});
test("stored records reject invalid or excessive values", () => {
  for (const value of [null, "oops", "Infinity", "-1", "0.5", "1000000001"])
    assert.equal(parseBest(value), 0);
  assert.equal(parseBest("12400"), 12400);
});
