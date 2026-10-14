import assert from "node:assert/strict";
import test from "node:test";
import { currentSessionClaims } from "../lib/firebase/session-claims.ts";

test("removed permissions never survive in an old session cookie", () => {
  const current = currentSessionClaims({ uid: "student", role: "owner", academyId: "school", permissions: ["manage"] }, {});
  assert.equal(current.uid, "student");
  for (const field of ["role", "academyId", "permissions"]) assert.equal(field in current, false);
});

test("live permissions replace stale roles while verified identity stays unchanged", () => {
  const current = currentSessionClaims({ uid: "student", email: "student@example.com", auth_time: 10, role: "owner", studentId: "old" }, { role: "student", academyId: "new", uid: "foreign", email: "foreign@example.com" });
  assert.equal(current.role, "student");
  assert.equal(current.academyId, "new");
  assert.equal("studentId" in current, false);
  assert.equal(current.uid, "student");
  assert.equal(current.email, "student@example.com");
  assert.equal(current.auth_time, 10);
});
