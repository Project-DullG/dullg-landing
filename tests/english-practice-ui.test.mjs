import assert from "node:assert/strict";
import { test } from "node:test";
import {
  practiceRecommendationId,
  practiceSentence,
  practiceTokenPool,
} from "../lib/english/practice-ui.ts";

test("sentence chunks retain distinct occurrences while the initial pool changes answer order", () => {
  const tokens = ["Could I", "change", "my order", "please?"];
  const pool = practiceTokenPool(tokens);
  assert.notDeepEqual(
    pool.map((token) => token.text),
    tokens,
  );
  assert.deepEqual(
    [...pool].sort((a, b) => a.id - b.id).map((token) => token.text),
    tokens,
  );
  assert.equal(practiceSentence(tokens, [0, 1, 2, 3]), "Could I change my order please?");
  assert.equal(practiceSentence(tokens, [1, 0, 2, 3]), "change Could I my order please?");
});

test("same-text chunks can be selected independently and removed without losing another occurrence", () => {
  const tokens = ["I", "think", "I", "can help."];
  const pool = practiceTokenPool(tokens);
  assert.equal(pool.filter((token) => token.text === "I").length, 2);
  assert.equal(new Set(pool.map((token) => token.id)).size, 4);
  assert.equal(practiceSentence(tokens, [0, 1, 2, 3]), "I think I can help.");
  assert.equal(practiceSentence(tokens, [0, 1, 3]), "I think can help.");
  assert.equal(practiceSentence(tokens, [0, 1, 2]), "I think I");
  assert.equal(practiceSentence(tokens, []), "");
});

test("rapid duplicate input and invalid chunk IDs cannot duplicate or inject text", () => {
  assert.equal(practiceSentence(["Please", "help me."], [0, 0, -1, 1, 99, 0.5]), "Please help me.");
  assert.deepEqual(practiceTokenPool([]), []);
  assert.deepEqual(practiceTokenPool(["Hello."]), [{ id: 0, text: "Hello." }]);
});

test("daily suggestions are stable within one Korean day and stay in the actual topic list", () => {
  const ids = ["a", "b", "c", "d", "e", "f"];
  const first = practiceRecommendationId(ids, "2026-10-14");
  assert.ok(ids.includes(first));
  assert.equal(practiceRecommendationId(ids, "2026-10-14"), first);
  const next = practiceRecommendationId(ids, "2026-10-15");
  assert.ok(ids.includes(next));
  assert.notEqual(next, first);
  assert.equal(practiceRecommendationId([], "2026-10-14"), undefined);
  assert.equal(practiceRecommendationId(ids, "invalid"), "a");
});
