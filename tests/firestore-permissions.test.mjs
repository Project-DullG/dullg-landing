import assert from "node:assert/strict";
import { test } from "node:test";

// Run with the local Firestore emulator only. A demo project cannot access live data.
const host = process.env.FIRESTORE_EMULATOR_HOST;
const project = "demo-student-notebook-rules";
if (host && !/^(?:127\.0\.0\.1|localhost):\d+$/.test(host))
  throw new Error("Rules tests require a local emulator.");
const base = `http://${host}/v1/projects/${project}/databases/(default)/documents`;
const run = (name, fn) => test(name, { skip: !host && "Run with local Firestore emulator" }, fn);
const fields = (data) =>
  Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      typeof value === "number"
        ? { integerValue: String(value) }
        : typeof value === "boolean"
          ? { booleanValue: value }
          : { stringValue: String(value) },
    ]),
  );
function token(uid, claims = {}) {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "none", typ: "JWT" })}.${encode({ sub: uid, user_id: uid, aud: project, iss: `https://securetoken.google.com/${project}`, iat: 1, exp: 4102444800, firebase: { sign_in_provider: "google.com", identities: {} }, ...claims })}.`;
}
async function request(path, auth, method = "GET", data) {
  return fetch(`${base}/${path}`, {
    method,
    headers: {
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
      ...(data ? { "Content-Type": "application/json" } : {}),
    },
    ...(data ? { body: JSON.stringify({ fields: fields(data) }) } : {}),
  });
}
async function seed(path, data) {
  const response = await request(path, "owner", "PATCH", data);
  assert.equal(response.status, 200, await response.text());
}
async function expect(path, auth, allowed, method = "GET", data) {
  const response = await request(path, auth, method, data);
  assert.equal(response.status, allowed ? 200 : 403, `${method} ${path}: ${await response.text()}`);
}
async function academyData(id, uid, status, studentId = uid, studentStatus = "active") {
  await seed(`academies/${id}`, { ownerId: `owner-${id}` });
  await seed(`academies/${id}/students/${studentId}`, {
    userId: uid,
    status: studentStatus,
    grade: 5,
  });
  await seed(`academies/${id}/classes/class-one`, { name: "class" });
  await seed(`academies/${id}/grades/own-grade`, { studentId, userId: uid, score: 95 });
  if (status)
    await seed(`academies/${id}/studentApplications/${uid}`, {
      userId: uid,
      academyId: id,
      status,
    });
}

run("student gallery summaries, votes, cheers and limits deny direct client reads and writes", async () => {
  const uid = "gallery-participant";
  for (const path of [
    "studentGameGallery/main",
    "studentGameGallery/main/votes/encoded-account",
    "studentGameGallery/main/games/island-snap/cheers/encoded-account",
    "studentGameGallery/main/cheerLimits/island-snap_encoded-account",
  ]) {
    await seed(path, { authorUid: uid, body: "server-only storage" });
    await expect(path, undefined, false);
    await expect(path, token(uid), false);
    await expect(path, token(uid, { role: "owner" }), false);
    await expect(path, token(uid), false, "PATCH", { authorUid: uid, body: "forged" });
    await expect(path, token(uid), false, "DELETE");
  }
});

run(
  "own UID reads profile/membership/notebook/photos; foreign UID and unauthenticated reads fail",
  async () => {
    const uid = "private-student";
    const auth = token(uid);
    for (const path of [
      `studentProfiles/${uid}`,
      `studentProfiles/${uid}/memberships/academy`,
      `studentNotebooks/${uid}`,
      `studentNotebooks/${uid}/pages/1`,
    ]) {
      await seed(path, { userId: uid });
      await expect(path, auth, true);
      await expect(path, token("other-student"), false);
      await expect(path, undefined, false);
      await expect(path, auth, false, "PATCH", {
        userId: uid,
        status: "approved",
        emailVerified: true,
      });
    }
  },
);

run(
  "canonical pending/rejected/left revoke all student access despite stale legacy claims",
  async () => {
    for (const status of ["pending", "rejected", "left"]) {
      const id = `blocked-${status}`;
      const uid = `student-${status}`;
      await academyData(id, uid, status);
      const auth = token(uid, { role: "student", academyId: id, studentId: uid });
      for (const path of [
        `academies/${id}`,
        `academies/${id}/classes/class-one`,
        `academies/${id}/students/${uid}`,
        `academies/${id}/grades/own-grade`,
      ])
        await expect(path, auth, false);
    }
  },
);

run(
  "canonical approved plus active own record permits only own grades without global student claims",
  async () => {
    const id = "new-approved";
    const uid = "new-student";
    await academyData(id, uid, "approved");
    await seed(`academies/${id}/students/other`, { userId: "other", status: "active" });
    await seed(`academies/${id}/grades/other-grade`, { userId: "other", studentId: "other" });
    const auth = token(uid);
    for (const path of [
      `academies/${id}`,
      `academies/${id}/classes/class-one`,
      `academies/${id}/students/${uid}`,
      `academies/${id}/grades/own-grade`,
    ])
      await expect(path, auth, true);
    await expect(`academies/${id}/students/other`, auth, false);
    await expect(`academies/${id}/grades/other-grade`, auth, false);
    await seed(`academies/${id}/students/${uid}`, { userId: uid, status: "inactive" });
    await expect(`academies/${id}/grades/own-grade`, auth, false);
  },
);

run(
  "legacy linked account works only with no canonical application and an owned noninactive record",
  async () => {
    const id = "legacy-academy";
    const uid = "legacy-student";
    await academyData(id, uid, null, "old-student-id");
    const auth = token(uid, { role: "student", academyId: id, studentId: "old-student-id" });
    await expect(`academies/${id}/grades/own-grade`, auth, true);
    await seed(`academies/${id}/studentApplications/${uid}`, {
      userId: uid,
      academyId: id,
      status: "pending",
    });
    await expect(`academies/${id}/grades/own-grade`, auth, false);
    const id2 = "legacy-inactive";
    await academyData(id2, uid, null, "old-student-id", "inactive");
    await expect(
      `academies/${id2}/grades/own-grade`,
      token(uid, { role: "student", academyId: id2, studentId: "old-student-id" }),
      false,
    );
  },
);

run(
  "application is readable only by its student or actual academy owner and client writes are denied",
  async () => {
    const id = "applications";
    const uid = "applicant";
    await academyData(id, uid, "pending");
    const path = `academies/${id}/studentApplications/${uid}`;
    await expect(path, token(uid), true);
    await expect(path, token(`owner-${id}`, { role: "owner" }), true);
    await expect(path, token("other-owner", { role: "owner" }), false);
    await expect(path, token(uid), false, "PATCH", {
      userId: uid,
      academyId: id,
      status: "approved",
    });
    await expect(path, token(`owner-${id}`, { role: "owner" }), false, "PATCH", {
      userId: uid,
      academyId: id,
      status: "approved",
    });
  },
);

run(
  "owner authority permits grade assignment while verified identity/status remain server-only",
  async () => {
    const id = "owner-protected";
    const uid = "owned-student";
    await academyData(id, uid, "approved");
    const auth = token(`owner-${id}`, { role: "owner" });
    const path = `academies/${id}/students/${uid}`;
    await expect(path, auth, true);
    await expect(path, token("foreign-owner", { role: "owner" }), false);
    await expect(path, auth, true, "PATCH", { userId: uid, status: "active", grade: 7 });
    await expect(path, auth, false, "PATCH", { userId: uid, status: "inactive", grade: 7 });
    await expect(path, auth, false, "PATCH", {
      userId: uid,
      status: "active",
      grade: 7,
      email: "spoof@example.com",
    });
    await expect(path, auth, false, "PATCH", { userId: "other-user", status: "active", grade: 7 });
  },
);
