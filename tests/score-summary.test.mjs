import assert from "node:assert/strict";
import test from "node:test";
import { scoreSummary } from "../lib/score-summary.ts";

test("score summary distinguishes zero scores from missing records", () => {
  assert.deepEqual(scoreSummary([null, null]), { count: 0, average: null });
  assert.deepEqual(scoreSummary([0, 100, null]), { count: 2, average: 50 });
  assert.deepEqual(scoreSummary([80, 90, 100, null]), { count: 3, average: 90 });
  assert.deepEqual(scoreSummary([NaN, Infinity, -1, 101, 70]), { count: 1, average: 70 });
});
