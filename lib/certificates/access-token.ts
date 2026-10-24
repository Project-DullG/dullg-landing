import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const ACCESS_TTL = 2 * 60 * 60;
export const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
export const ATTEMPT_LIMIT = 10;
export type AccessConfig = { code: string; secret: string };

export function validAccessConfig(config: AccessConfig) {
  return (
    typeof config.code === "string" &&
    config.code.length >= 4 &&
    config.code.length <= 256 &&
    config.code.trim() === config.code &&
    !/[\p{C}\s]/u.test(config.code) &&
    typeof config.secret === "string" &&
    Buffer.byteLength(config.secret, "utf8") >= 32
  );
}

const digest = (value: string) => createHash("sha256").update(value).digest();

export function matchesAccessCode(input: string, expected: string) {
  return timingSafeEqual(digest(input), digest(expected));
}

function signature(body: string, config: AccessConfig) {
  return createHmac("sha256", config.secret)
    .update(JSON.stringify(["certificate-access-v1", config.code, body]))
    .digest("base64url");
}

export function issueAccess(config: AccessConfig, now = Math.floor(Date.now() / 1000)) {
  if (!validAccessConfig(config) || !Number.isSafeInteger(now) || now < 0)
    throw new Error("수료증 접근 설정을 확인하세요.");
  const body = Buffer.from(
    JSON.stringify({
      v: 1,
      iat: now,
      exp: now + ACCESS_TTL,
      nonce: randomBytes(16).toString("base64url"),
    }),
  ).toString("base64url");
  return `${body}.${signature(body, config)}`;
}

export function verifyAccess(
  token: string,
  config: AccessConfig,
  now = Math.floor(Date.now() / 1000),
) {
  if (
    !validAccessConfig(config) ||
    typeof token !== "string" ||
    token.length > 1024 ||
    !Number.isSafeInteger(now) ||
    now < 0
  )
    return false;
  try {
    const parts = token.split(".");
    if (
      parts.length !== 2 ||
      !/^[A-Za-z0-9_-]+$/.test(parts[0]) ||
      !/^[A-Za-z0-9_-]{43}$/.test(parts[1]) ||
      !matchesAccessCode(parts[1], signature(parts[0], config))
    )
      return false;
    const value = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    return Boolean(
      value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        value.v === 1 &&
        Number.isSafeInteger(value.iat) &&
        Number.isSafeInteger(value.exp) &&
        value.iat >= 0 &&
        value.iat <= now &&
        value.exp > now &&
        value.exp - value.iat === ACCESS_TTL &&
        typeof value.nonce === "string" &&
        /^[A-Za-z0-9_-]{22}$/.test(value.nonce),
    );
  } catch {
    return false;
  }
}

export function nextAttempts(attempts: unknown[], now: number, recordFailure = true) {
  const recent = attempts.filter(
    (time): time is number =>
      typeof time === "number" &&
      Number.isSafeInteger(time) &&
      time >= 0 &&
      time > now - ATTEMPT_WINDOW_MS,
  );
  if (recent.length >= ATTEMPT_LIMIT) return { allowed: false, attempts: recent };
  return { allowed: true, attempts: recordFailure ? [...recent, now] : recent };
}

export function attemptKey(ip: string, secret: string) {
  return createHmac("sha256", secret)
    .update(JSON.stringify(["certificate-code-attempt-v1", ip]))
    .digest("hex");
}

export function normalizeCertificateName(input: unknown): string | null {
  if (typeof input !== "string" || input.length > 160) return null;
  // Validate before trimming so controls, bidi marks and non-ASCII whitespace cannot disappear.
  const normalized = input.normalize("NFC");
  if (!/^[A-Za-z가-힣\p{Script=Han} '\-·]+$/u.test(normalized)) return null;
  const name = normalized.replace(/ +/g, " ").trim();
  if (!name || [...name].length > 40 || !/[A-Za-z가-힣\p{Script=Han}]/u.test(name)) return null;
  return name;
}

export function certificateDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((value) => value.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
