import assert from "node:assert/strict";
import { test } from "node:test";
import {
  saveStudentProfile,
  requestAcademyMembership,
  leaveAcademyMembership,
  reviewAcademyApplication,
  studentMembershipCanRead,
  validateStudentProfile,
} from "../lib/student-registration.ts";

const uid = "student-uid";
const academy = "academy-one";
const key = (academyId, userId = uid) => `${academyId}/${userId}`;
const identity = {
  uid,
  googleLinked: true,
  email: "student@example.com",
  emailVerified: true,
  phoneNumber: "+821012345678",
};

function fixture() {
  const state = {
    identities: new Map([
      [uid, { ...identity }],
      ["owner-one", { uid: "owner-one", role: "owner", academyId: academy }],
      ["owner-two", { uid: "owner-two", role: "owner", academyId: "academy-two" }],
    ]),
    profiles: new Map(),
    academies: new Map([
      [academy, { ownerId: "owner-one" }],
      ["academy-two", { ownerId: "owner-two" }],
    ]),
    applications: new Map(),
    memberships: new Map(),
    students: new Map(),
    gradeHistory: new Map(),
    profileWrites: 0,
    studentCreates: 0,
    writes: 0,
    failNextCommit: false,
  };
  let lock = Promise.resolve();
  const deps = {
    async getIdentity(userId) {
      const found = state.identities.get(userId);
      if (!found) throw new Error("Unknown identity");
      return { ...found };
    },
    async transaction(work) {
      const previous = lock;
      let release;
      lock = new Promise((resolve) => {
        release = resolve;
      });
      await previous;
      const draft = Object.fromEntries(
        ["profiles", "applications", "memberships", "students"].map((name) => [
          name,
          new Map(state[name]),
        ]),
      );
      let writesStarted = false;
      let writes = 0;
      let profileWrites = 0;
      let studentCreates = 0;
      const read = (map, id) => {
        assert.equal(writesStarted, false, "Firestore transaction read after write");
        return map.get(id) ?? null;
      };
      const save = (map, id, data, exists) => {
        writesStarted = true;
        assert.equal(map.has(id), exists);
        writes += 1;
        map.set(id, {
          ...(map.get(id) ?? { createdAt: state.writes + 1 }),
          ...data,
          updatedAt: state.writes + 1,
        });
      };
      try {
        const result = await work({
          getProfile: async (userId) => read(draft.profiles, userId),
          getAcademy: async (academyId) => read(state.academies, academyId),
          getApplication: async (academyId, userId) =>
            read(draft.applications, key(academyId, userId)),
          getMembership: async (userId, academyId) =>
            read(draft.memberships, key(academyId, userId)),
          getStudent: async (academyId, userId) => read(draft.students, key(academyId, userId)),
          saveProfile(userId, profile, exists) {
            save(draft.profiles, userId, profile, exists);
            profileWrites += 1;
          },
          saveApplication(academyId, userId, application, exists) {
            save(draft.applications, key(academyId, userId), application, exists);
          },
          saveMembership(userId, academyId, application, exists) {
            save(draft.memberships, key(academyId, userId), application, exists);
          },
          createStudent(academyId, userId, student) {
            save(draft.students, key(academyId, userId), student, false);
            studentCreates += 1;
          },
          updateStudentStatus(academyId, userId, status) {
            save(draft.students, key(academyId, userId), { status }, true);
          },
        });
        if (state.failNextCommit) {
          state.failNextCommit = false;
          throw new Error("Temporary transaction failure");
        }
        Object.assign(state, draft);
        state.writes += writes;
        state.profileWrites += profileWrites;
        state.studentCreates += studentCreates;
        return result;
      } finally {
        release();
      }
    },
  };
  return {
    state,
    deps,
    save: (input = { name: "김학생" }) => saveStudentProfile(input, uid, deps),
    request: (academyId = academy) => requestAcademyMembership(academyId, uid, deps),
    leave: (academyId = academy) => leaveAcademyMembership(academyId, uid, deps),
    review: (decision = "approve", owner = "owner-one", academyId = academy, userId = uid) =>
      reviewAcademyApplication(userId, decision, owner, academyId, deps),
    canRead: (academyId = academy) =>
      studentMembershipCanRead(
        uid,
        academyId,
        state.applications.get(key(academyId)),
        state.students.get(key(academyId)),
      ),
  };
}

test("profile input accepts only a trimmed name and rejects client verification/contact claims", () => {
  assert.deepEqual(validateStudentProfile({ name: " 김학생 " }), { name: "김학생" });
  for (const input of [
    undefined,
    null,
    [],
    "name",
    {},
    { name: 3 },
    { name: " " },
    { name: "n".repeat(51) },
    { name: "a\nb" },
    { name: "student", grade: 3 },
    { name: "student", emailVerified: true },
    { name: "student", phoneNumber: "+821011112222" },
    { name: "student", email: "other@example.com" },
  ]) {
    assert.throws(() => validateStudentProfile(input));
  }
});

test("profile identity fields come only from the verified Admin identity and are idempotent", async () => {
  const f = fixture();
  await f.save();
  const profile = f.state.profiles.get(uid);
  assert.equal(profile.email, identity.email);
  assert.equal(profile.phoneNumber, identity.phoneNumber);
  assert.equal(profile.userId, uid);
  assert.equal(profile.emailVerified, true);
  assert.equal(profile.phoneVerified, true);
  await f.save();
  assert.equal(f.state.profileWrites, 1);
  assert.equal(f.state.profiles.get(uid).createdAt, profile.createdAt);
  assert.equal(f.state.applications.size, 0);
  assert.equal(f.state.students.size, 0);
  assert.equal(f.state.identities.get(uid).role, undefined);
});

test("profile name updates retain createdAt and cannot overwrite a foreign-owned profile", async () => {
  const f = fixture();
  await f.save();
  const createdAt = f.state.profiles.get(uid).createdAt;
  await f.save({ name: "새이름" });
  assert.equal(f.state.profiles.get(uid).name, "새이름");
  assert.equal(f.state.profiles.get(uid).createdAt, createdAt);
  f.state.profiles.set(uid, { userId: "other-user" });
  await assert.rejects(f.save(), /계정/);
});

test("unverified email, unlinked Google, or missing/invalid phone cannot save or request", async () => {
  for (const patch of [
    { emailVerified: false },
    { googleLinked: false },
    { email: null },
    { phoneNumber: null },
    { phoneNumber: "01012345678" },
    { phoneNumber: "+0" },
  ]) {
    const f = fixture();
    f.state.identities.set(uid, { ...identity, ...patch });
    await assert.rejects(f.save(), /인증/);
    await assert.rejects(f.request(), /인증/);
    assert.equal(f.state.writes, 0);
  }
});

test("owner/admin/unknown roles cannot self-register or request; existing roles remain intact", async () => {
  for (const role of ["owner", "admin", "teacher", "unexpected", "", false]) {
    const f = fixture();
    f.state.identities.set(uid, { ...identity, role });
    await assert.rejects(f.save(), /학생 계정/);
    await assert.rejects(f.request(), /학생 계정/);
    assert.equal(f.state.identities.get(uid).role, role);
    assert.equal(f.state.writes, 0);
  }
});

test("request requires the student's own verified profile and an existing valid academy", async () => {
  const f = fixture();
  await assert.rejects(f.request(), /학생 정보를 먼저/);
  await f.save();
  for (const academyId of [
    undefined,
    null,
    "",
    "a/b",
    "a.b",
    "__reserved__",
    "a".repeat(129),
    "missing",
  ]) {
    await assert.rejects(requestAcademyMembership(academyId, uid, f.deps));
  }
  assert.equal(f.state.applications.size, 0);
  f.state.identities.get(uid).phoneNumber = "+821099998888";
  await assert.rejects(f.request(), /학생 정보를 먼저/);
});

test("request creates only pending mirrored application; pending cannot read grades", async () => {
  const f = fixture();
  await f.save();
  assert.deepEqual(await f.request(), { success: true, status: "pending" });
  assert.deepEqual(f.state.applications.get(key(academy)), f.state.memberships.get(key(academy)));
  assert.equal(f.state.students.size, 0);
  assert.equal(f.canRead(), false);
  assert.equal(f.state.identities.get(uid).role, undefined);
  const writes = f.state.writes;
  await f.request();
  assert.equal(f.state.writes, writes);
});

test("concurrent same-academy requests create one pending application", async () => {
  const f = fixture();
  await f.save();
  await Promise.all(Array.from({ length: 10 }, () => f.request()));
  assert.equal(f.state.applications.size, 1);
  assert.equal(f.state.memberships.size, 1);
  assert.equal(f.state.students.size, 0);
});

test("only actual academy owner with current matching role may approve", async () => {
  const f = fixture();
  await f.save();
  await f.request();
  await assert.rejects(f.review("approve", uid), /관리 권한/);
  await assert.rejects(f.review("approve", "owner-two"), /관리 권한/);
  f.state.academies.set(academy, { ownerId: "someone-else" });
  await assert.rejects(f.review(), /관리 권한/);
  assert.equal(f.state.students.size, 0);
  assert.equal(f.state.applications.get(key(academy)).status, "pending");
});

test("approval creates active own-UID student and only then permits grade access", async () => {
  const f = fixture();
  await f.save();
  await f.request();
  assert.deepEqual(await f.review(), { success: true, status: "approved" });
  const student = f.state.students.get(key(academy));
  assert.equal(student.userId, uid);
  assert.equal(student.grade, null);
  assert.equal(student.classId, "");
  assert.equal(student.status, "active");
  assert.equal(f.canRead(), true);
  const writes = f.state.writes;
  await f.review();
  await f.request();
  assert.equal(f.state.writes, writes);
  assert.equal(f.state.studentCreates, 1);
});

test("student can independently apply to and receive approval from multiple academies", async () => {
  const f = fixture();
  await f.save();
  await Promise.all([f.request(), f.request("academy-two")]);
  await f.review();
  await f.review("approve", "owner-two", "academy-two");
  assert.equal(f.state.applications.size, 2);
  assert.equal(f.state.memberships.size, 2);
  assert.equal(f.state.students.size, 2);
  assert.equal(f.canRead(), true);
  assert.equal(f.canRead("academy-two"), true);
  assert.deepEqual(f.state.identities.get(uid), identity);
});

test("withdraw pending application at any time, including after contact verification is lost", async () => {
  const f = fixture();
  await f.save();
  await f.request();
  f.state.identities.get(uid).phoneNumber = null;
  assert.deepEqual(await f.leave(), { success: true, status: "left" });
  assert.equal(f.state.memberships.get(key(academy)).status, "left");
  assert.equal(f.state.students.size, 0);
  f.state.identities.get(uid).phoneNumber = identity.phoneNumber;
  await assert.rejects(f.review(), /대기 중인 신청만/);
  assert.equal(f.canRead(), false);
});

test("leaving approved academy immediately disables access but preserves teacher grade/class/history", async () => {
  const f = fixture();
  await f.save();
  await f.request();
  await f.review();
  Object.assign(f.state.students.get(key(academy)), { grade: 7, classId: "teacher-class" });
  f.state.gradeHistory.set(key(academy), [{ score: 92 }]);
  const createdAt = f.state.students.get(key(academy)).createdAt;
  await f.leave();
  const student = f.state.students.get(key(academy));
  assert.equal(student.status, "inactive");
  assert.equal(student.grade, 7);
  assert.equal(student.classId, "teacher-class");
  assert.equal(student.createdAt, createdAt);
  assert.deepEqual(f.state.gradeHistory.get(key(academy)), [{ score: 92 }]);
  assert.equal(f.canRead(), false);
  const writes = f.state.writes;
  await f.leave();
  assert.equal(f.state.writes, writes);
});

test("withdrawal racing owner approval always ends left/inactive and cannot leave stale access", async () => {
  for (const leaveFirst of [false, true]) {
    const f = fixture();
    await f.save();
    await f.request();
    await Promise.allSettled(leaveFirst ? [f.leave(), f.review()] : [f.review(), f.leave()]);
    assert.equal(f.state.applications.get(key(academy)).status, "left");
    assert.equal(f.state.memberships.get(key(academy)).status, "left");
    assert.equal(f.canRead(), false);
    const student = f.state.students.get(key(academy));
    if (student) assert.equal(student.status, "inactive");
  }
});

test("rejected/left applications can reapply; reapproval reuses student and teacher assignments", async () => {
  const f = fixture();
  await f.save();
  await f.request();
  await f.review("reject");
  assert.equal(f.canRead(), false);
  await f.request();
  await f.review();
  Object.assign(f.state.students.get(key(academy)), { grade: 9, classId: "existing-class" });
  await f.leave();
  await f.request();
  assert.equal(f.canRead(), false);
  await f.review();
  assert.equal(f.state.studentCreates, 1);
  assert.equal(f.state.students.get(key(academy)).grade, 9);
  assert.equal(f.state.students.get(key(academy)).classId, "existing-class");
  assert.equal(f.canRead(), true);
});

test("approval never claims same-name teacher record or a foreign-owned UID collision", async () => {
  const f = fixture();
  await f.save();
  await f.request();
  const teacherRecord = { name: "김학생", userId: null, grade: 7, classId: "teacher-class" };
  f.state.students.set(key(academy, "precreated"), teacherRecord);
  await f.review();
  assert.equal(f.state.students.get(key(academy, "precreated")), teacherRecord);
  assert.equal(f.state.students.size, 2);
  const collision = fixture();
  await collision.save();
  await collision.request();
  collision.state.students.set(key(academy), { userId: "other-user" });
  await assert.rejects(collision.review(), /신청 정보를 확인/);
  assert.equal(collision.state.applications.get(key(academy)).status, "pending");
});

test("canonical pending/rejected/left defeats stale active student and legacy role claims", () => {
  const student = { userId: uid, status: "active" };
  for (const status of ["pending", "rejected", "left", undefined]) {
    assert.equal(
      studentMembershipCanRead(uid, academy, { userId: uid, academyId: academy, status }, student),
      false,
    );
  }
  assert.equal(studentMembershipCanRead(uid, academy, null, student), false);
  assert.equal(
    studentMembershipCanRead(
      uid,
      academy,
      { userId: uid, academyId: academy, status: "approved" },
      { userId: "other-user", status: "active" },
    ),
    false,
  );
  assert.equal(
    studentMembershipCanRead(
      uid,
      academy,
      { userId: uid, academyId: academy, status: "approved" },
      { userId: uid, status: "inactive" },
    ),
    false,
  );
});

test("transaction failure and retries never produce half mirrors or duplicate student records", async () => {
  const f = fixture();
  await f.save();
  f.state.failNextCommit = true;
  await assert.rejects(f.request(), /Temporary transaction failure/);
  assert.equal(f.state.applications.size, 0);
  assert.equal(f.state.memberships.size, 0);
  await f.request();
  f.state.failNextCommit = true;
  await assert.rejects(f.review(), /Temporary transaction failure/);
  assert.equal(f.state.applications.get(key(academy)).status, "pending");
  assert.equal(f.state.students.size, 0);
  await f.review();
  assert.equal(f.state.studentCreates, 1);
});

test("corrupted or foreign-owned mirrors are refused instead of enabling access", async () => {
  const f = fixture();
  await f.save();
  await f.request();
  f.state.memberships.set(key(academy), {
    ...f.state.memberships.get(key(academy)),
    userId: "other-user",
  });
  await assert.rejects(f.review(), /신청 정보를 확인/);
  await assert.rejects(f.leave(), /신청 정보를 확인/);
  assert.equal(f.state.students.size, 0);
});

test("legacy student can leave without fresh contact proof, retaining old record/history and revoking claims access", async () => {
  const f = fixture();
  f.state.identities.set(uid, {
    ...identity,
    role: "student",
    academyId: academy,
    studentId: "teacher-created-id",
    emailVerified: false,
    phoneNumber: null,
  });
  const old = { userId: uid, name: "기존학생", grade: 8, classId: "legacy-class", createdAt: 100 };
  f.state.students.set(key(academy, "teacher-created-id"), old);
  f.state.gradeHistory.set(key(academy, "teacher-created-id"), [{ score: 91 }]);
  assert.deepEqual(await f.leave(), { success: true, status: "left" });
  assert.equal(f.state.applications.get(key(academy)).status, "left");
  assert.equal(f.state.memberships.get(key(academy)).status, "left");
  const remaining = f.state.students.get(key(academy, "teacher-created-id"));
  assert.equal(remaining.status, "inactive");
  assert.equal(remaining.grade, 8);
  assert.equal(remaining.classId, "legacy-class");
  assert.equal(remaining.createdAt, 100);
  assert.deepEqual(f.state.gradeHistory.get(key(academy, "teacher-created-id")), [{ score: 91 }]);
  assert.equal(f.state.studentCreates, 0);
  assert.equal(f.canRead(), false);
});

test("legacy leave never deactivates a foreign student's claimed record", async () => {
  const f = fixture();
  f.state.identities.set(uid, {
    ...identity,
    role: "student",
    academyId: academy,
    studentId: "foreign-record",
  });
  f.state.students.set(key(academy, "foreign-record"), { userId: "other-user", status: "active" });
  await assert.rejects(f.leave(), /신청 정보를 확인/);
  assert.equal(f.state.students.get(key(academy, "foreign-record")).status, "active");
  assert.equal(f.state.applications.size, 0);
});
