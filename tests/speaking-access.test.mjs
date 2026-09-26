import test from "node:test";
import assert from "node:assert/strict";
import {
  ACCESS_TTL,
  issueAccess,
  verifyAccess,
  matchesAccessCode,
  nextAttempts,
  studySessionKey,
  validAccessConfig,
} from "../lib/speaking/access/token.ts";
const config = { code: "test-code-only", secret: "test-secret-only-32-characters-minimum" };

test("4자리 코드 설정을 허용하고 학습 요청은 화면을 발급한 세션에만 대응한다", () => {
  assert.ok(validAccessConfig({ ...config, code: "1234" }));
  assert.equal(validAccessConfig({ ...config, code: "123" }), false);
  const a = studySessionKey("alice", "session-a", config.secret);
  assert.equal(a, studySessionKey("alice", "session-a", config.secret));
  assert.notEqual(a, studySessionKey("bob", "session-a", config.secret));
  assert.notEqual(a, studySessionKey("alice", "session-b", config.secret));
  assert.ok(!a.includes("session-a"));
});

test("접근 쿠키는 계정·로그인 세션에 묶이며 만료·변조·설정 회전 시 차단한다", () => {
  const issued = issueAccess("alice", "session-a", config, 1000);
  assert.ok(verifyAccess(issued, "alice", "session-a", config, 1001));
  assert.equal(verifyAccess(issued, "bob", "session-a", config, 1001), false);
  assert.equal(verifyAccess(issued, "alice", "session-b", config, 1001), false);
  assert.equal(verifyAccess(issued, "alice", "session-a", config, 1000 + ACCESS_TTL), false);
  assert.equal(verifyAccess(issued, "alice", "session-a", config, 999), false);
  assert.equal(verifyAccess(`${issued}x`, "alice", "session-a", config, 1001), false);
  assert.equal(
    verifyAccess(issued, "alice", "session-a", { ...config, code: "new-code" }, 1001),
    false,
  );
  assert.equal(
    verifyAccess(
      issued,
      "alice",
      "session-a",
      { ...config, secret: config.secret + "rotated" },
      1001,
    ),
    false,
  );
  assert.equal(verifyAccess(issued, "alice", "session-a", { code: "", secret: "" }, 1001), false);
  const payload = Buffer.from(issued.split(".")[0], "base64url").toString();
  assert.ok(!payload.includes(config.code));
  assert.ok(!payload.includes("session-a"));
});
test("코드 비교는 길이가 다르거나 빈 값이어도 올바르게 실패한다", () => {
  assert.ok(matchesAccessCode(config.code, config.code));
  assert.equal(matchesAccessCode("", config.code), false);
  assert.equal(matchesAccessCode("x".repeat(256), config.code), false);
});
test("최근 한 시간 입력 다섯 번 제한은 시각 경계에서도 유지한다", () => {
  const now = 10_000_000;
  let attempts = [];
  for (let i = 0; i < 5; i++) {
    const result = nextAttempts(attempts, now + i * 1000);
    assert.equal(result.allowed, true);
    attempts = result.attempts;
  }
  assert.equal(nextAttempts(attempts, now + 5000).allowed, false);
  assert.equal(nextAttempts(attempts, now + 3_599_999).allowed, false);
  assert.equal(nextAttempts(attempts, now + 3_600_000).allowed, true);
});
