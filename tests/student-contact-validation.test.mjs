import assert from "node:assert/strict";
import test from "node:test";
import { validateStudent } from "../lib/validators.ts";

const manual = { name: "가상 학생", grade: 6, parentContact: "010-0000-0000", classId: "" };

test("unknown school year stays null and valid years retain their boundaries", () => {
  for (const grade of [null, 1, 12]) assert.equal(validateStudent({ ...manual, grade }), null);
  for (const grade of [0, 13, 1.5, NaN, undefined, "6"]) {
    assert.equal(typeof validateStudent({ ...manual, grade }), "string");
  }
});

test("a verified student's own phone supports editing without a caregiver contact", () => {
  assert.equal(
    validateStudent({ ...manual, grade: null, parentContact: "", phoneNumber: "+821099990000" }),
    null,
  );
  assert.equal(typeof validateStudent({ ...manual, parentContact: "" }), "string");
  assert.equal(
    typeof validateStudent({ ...manual, parentContact: "", phoneNumber: " " }),
    "string",
  );
  assert.equal(typeof validateStudent({ ...manual, name: " " }), "string");
});
