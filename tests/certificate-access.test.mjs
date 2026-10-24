import test from "node:test";
import assert from "node:assert/strict";
import {
  ACCESS_TTL,
  ATTEMPT_WINDOW_MS,
  ATTEMPT_LIMIT,
  validAccessConfig,
  matchesAccessCode,
  issueAccess,
  verifyAccess,
  nextAttempts,
  attemptKey,
  normalizeCertificateName,
  certificateDate,
} from "../lib/certificates/access-token.ts";

const config = {
  code: "test-certificate-code",
  secret: "synthetic-certificate-secret-for-tests-only",
};

test("certificate configuration rejects missing values and secrets shorter than 32 bytes", () => {
  assert.equal(validAccessConfig(config), true);
  assert.equal(validAccessConfig({ ...config, secret: "s".repeat(32) }), true);
  for (const invalid of [
    { code: "", secret: config.secret },
    { code: config.code, secret: "" },
    { code: config.code, secret: "s".repeat(31) },
  ]) {
    assert.equal(validAccessConfig(invalid), false);
    assert.throws(() => issueAccess(invalid, 1_000));
    assert.equal(verifyAccess("invalid", invalid, 1_000), false);
  }
});

test("certificate access expires exactly at its two-hour deadline and rejects future tokens", () => {
  const now = 1_000;
  const token = issueAccess(config, now);
  assert.equal(ACCESS_TTL, 2 * 60 * 60);
  assert.equal(verifyAccess(token, config, now), true);
  assert.equal(verifyAccess(token, config, now + ACCESS_TTL - 1), true);
  assert.equal(verifyAccess(token, config, now + ACCESS_TTL), false);
  assert.equal(verifyAccess(token, config, now + ACCESS_TTL + 1), false);
  assert.equal(verifyAccess(token, config, now - 1), false);
});

test("certificate tokens have fresh nonces and contain neither the access code nor signing key", () => {
  const first = issueAccess(config, 1_000);
  const second = issueAccess(config, 1_000);
  assert.notEqual(first, second);
  assert.equal(verifyAccess(second, config, 1_001), true);
  const body = Buffer.from(first.split(".")[0], "base64url").toString("utf8");
  assert.doesNotMatch(body, /test-certificate-code/);
  assert.ok(!body.includes(config.secret));
  assert.doesNotThrow(() => JSON.parse(body));
});

test("certificate access rejects modified payloads, signatures, and malformed tokens", () => {
  const token = issueAccess(config, 1_000);
  const [body, signature] = token.split(".");
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  const modified = Buffer.from(JSON.stringify({ ...payload, exp: 999_999 })).toString("base64url");
  const alteredSignature = `${signature[0] === "A" ? "B" : "A"}${signature.slice(1)}`;
  for (const invalid of [
    "",
    "not-a-token",
    ".",
    `${body}.`,
    `.${signature}`,
    `${body}.${alteredSignature}`,
    `${modified}.${signature}`,
    `${token}.extra`,
    "x".repeat(4_096),
  ]) {
    assert.equal(verifyAccess(invalid, config, 1_001), false, invalid.slice(0, 30));
  }
});

test("rotating either the certificate code or secret invalidates existing tokens", () => {
  const token = issueAccess(config, 1_000);
  assert.equal(verifyAccess(token, config, 1_001), true);
  assert.equal(verifyAccess(token, { ...config, code: "rotated-test-code" }, 1_001), false);
  assert.equal(
    verifyAccess(
      token,
      { ...config, secret: "another-synthetic-certificate-secret-for-tests" },
      1_001,
    ),
    false,
  );
});

test("code comparison handles mismatched values and lengths without throwing", () => {
  assert.equal(matchesAccessCode(config.code, config.code), true);
  for (const input of ["", "x", "x".repeat(256), `${config.code} `, config.code.toUpperCase()]) {
    assert.equal(matchesAccessCode(input, config.code), false);
  }
});

test("the sliding rate limit permits ten attempts and releases each after fifteen minutes", () => {
  const now = 10_000_000;
  let attempts = [];
  assert.equal(ATTEMPT_LIMIT, 10);
  assert.equal(ATTEMPT_WINDOW_MS, 15 * 60 * 1_000);
  for (let index = 0; index < ATTEMPT_LIMIT; index++) {
    const result = nextAttempts(attempts, now + index * 1_000);
    assert.equal(result.allowed, true);
    assert.equal(result.attempts.length, index + 1);
    attempts = result.attempts;
  }
  const denied = nextAttempts(attempts, now + 10_000);
  assert.equal(denied.allowed, false);
  assert.deepEqual(denied.attempts, attempts);
  assert.equal(nextAttempts(attempts, now + ATTEMPT_WINDOW_MS - 1).allowed, false);
  const reset = nextAttempts(attempts, now + ATTEMPT_WINDOW_MS);
  assert.equal(reset.allowed, true);
  assert.equal(reset.attempts.length, ATTEMPT_LIMIT);
  assert.ok(!reset.attempts.includes(now));
  assert.equal(reset.attempts.at(-1), now + ATTEMPT_WINDOW_MS);
});

test("rate-limit history discards invalid values and elapsed attempts", () => {
  const now = 10_000_000;
  const result = nextAttempts(
    [undefined, null, "10000000", {}, NaN, Infinity, -Infinity, now - ATTEMPT_WINDOW_MS, now - 1],
    now,
  );
  assert.equal(result.allowed, true);
  assert.deepEqual(result.attempts, [now - 1, now]);
});

test("successful code checks do not consume the shared IP failure budget", () => {
  const now = 10_000_000;
  let attempts = [];
  for (let index = 0; index < 30; index++) {
    const result = nextAttempts(attempts, now + index * 1_000, false);
    assert.equal(result.allowed, true);
    assert.deepEqual(result.attempts, []);
    attempts = result.attempts;
  }
  const recentFailures = [now - 2_000, now - 1_000];
  const successful = nextAttempts(recentFailures, now, false);
  assert.equal(successful.allowed, true);
  assert.deepEqual(successful.attempts, recentFailures);
});

test("ten recent failures also block a correct code until the failure window expires", () => {
  const now = 10_000_000;
  let attempts = [];
  for (let index = 0; index < ATTEMPT_LIMIT; index++) {
    const failed = nextAttempts(attempts, now, true);
    assert.equal(failed.allowed, true);
    attempts = failed.attempts;
  }
  const blocked = nextAttempts(attempts, now + 1, false);
  assert.equal(blocked.allowed, false);
  assert.deepEqual(blocked.attempts, attempts);
  assert.equal(nextAttempts(attempts, now + ATTEMPT_WINDOW_MS - 1, false).allowed, false);
  const released = nextAttempts(attempts, now + ATTEMPT_WINDOW_MS, false);
  assert.equal(released.allowed, true);
  assert.deepEqual(released.attempts, []);
});

test("rate-limit keys use a keyed digest rather than retaining the client IP", () => {
  const ip = "192.0.2.42";
  const first = attemptKey(ip, config.secret);
  assert.match(first, /^[a-f0-9]{64}$/);
  assert.equal(first, attemptKey(ip, config.secret));
  assert.notEqual(first, attemptKey("192.0.2.43", config.secret));
  assert.notEqual(first, attemptKey(ip, `${config.secret}-rotated`));
  assert.ok(!first.includes(ip));
});

test("certificate names accept supported scripts and normalize ASCII spacing and NFC", () => {
  for (const [input, expected] of [
    ["김울릉", "김울릉"],
    ["  김  독도  ", "김 독도"],
    ["Kim Ulleung", "Kim Ulleung"],
    ["王小明", "王小明"],
    ["Anne-Marie O'Neil", "Anne-Marie O'Neil"],
    ["김·독도", "김·독도"],
    ["김울릉".normalize("NFD"), "김울릉"],
    ["A".repeat(40), "A".repeat(40)],
  ]) {
    assert.equal(normalizeCertificateName(input), expected, JSON.stringify(input));
  }
});

test("certificate names reject unsupported text, HTML, control characters, and bidi controls", () => {
  for (const input of [
    undefined,
    null,
    123,
    {},
    [],
    "",
    "   ",
    "-'·",
    "A".repeat(41),
    " ".repeat(161),
    "Student 1",
    "<b>김울릉</b>",
    "Kim&Lee",
    "김😀",
    "김\u0000울릉",
    "김\u007f울릉",
    "김\t울릉",
    "김\n울릉",
    "김\r울릉",
    "김\u00a0울릉",
    "김\u200b울릉",
    "김\u2028울릉",
    "김\u202e울릉",
    "김\u2066울릉\u2069",
  ]) {
    assert.equal(normalizeCertificateName(input), null, JSON.stringify(input));
  }
});

test("certificate dates use the calendar date in Korea rather than UTC", () => {
  assert.equal(certificateDate(new Date("2026-10-23T14:59:59.999Z")), "2026-10-23");
  assert.equal(certificateDate(new Date("2026-10-23T15:00:00.000Z")), "2026-10-24");
  assert.equal(certificateDate(new Date("2026-12-31T15:00:00.000Z")), "2027-01-01");
});
