import assert from "node:assert/strict";
import test from "node:test";
import { validateGrade } from "../lib/validators.ts";

const valid = { type: "exam", studentId: "example", subject: "영어", examName: "예시 시험", score: 80, totalScore: 100, date: new Date("2026-09-07") };
test("grade validation rejects invalid scores, dates and missing students", () => {
  assert.equal(validateGrade(valid), null);
  for (const patch of [{ score: NaN }, { score: Infinity }, { score: 101 }, { totalScore: NaN }, { date: new Date("invalid") }, { studentId: "" }]) {
    assert.equal(typeof validateGrade({ ...valid, ...patch }), "string");
  }
  assert.equal(validateGrade({ ...valid, score: 0 }), null);
});
