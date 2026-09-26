import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const ACCESS_TTL = 12 * 60 * 60;
export type AccessConfig = { code: string; secret: string };
const digest = (value: string) => createHash("sha256").update(value).digest();
export function validAccessConfig(config: AccessConfig) {
  return config.code.length >= 4 && config.secret.length >= 32;
}
export function studySessionKey(uid: string, session: string, secret: string) {
  return createHmac("sha256", secret)
    .update(JSON.stringify(["speaking-study-session-v1", uid, session]))
    .digest("base64url");
}
export function matchesAccessCode(input: string, expected: string) {
  return timingSafeEqual(digest(input), digest(expected));
}
function signature(body: string, config: AccessConfig) {
  return createHmac("sha256", config.secret)
    .update(JSON.stringify(["speaking-v1", config.code, body]))
    .digest("base64url");
}
export function issueAccess(
  uid: string,
  session: string,
  config: AccessConfig,
  now = Math.floor(Date.now() / 1000),
) {
  if (!validAccessConfig(config)) throw new Error("접근 설정이 필요합니다.");
  const body = Buffer.from(
    JSON.stringify({
      v: 1,
      uid,
      session: digest(session).toString("base64url"),
      iat: now,
      exp: now + ACCESS_TTL,
      nonce: randomBytes(16).toString("base64url"),
    }),
  ).toString("base64url");
  return `${body}.${signature(body, config)}`;
}
export function verifyAccess(
  token: string,
  uid: string,
  session: string,
  config: AccessConfig,
  now = Math.floor(Date.now() / 1000),
) {
  if (!validAccessConfig(config) || !token || token.length > 2048) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 2 || !matchesAccessCode(parts[1], signature(parts[0], config)))
      return false;
    const value = JSON.parse(Buffer.from(parts[0], "base64url").toString());
    return (
      value.v === 1 &&
      value.uid === uid &&
      value.session === digest(session).toString("base64url") &&
      Number.isInteger(value.iat) &&
      Number.isInteger(value.exp) &&
      value.iat <= now &&
      value.exp > now &&
      value.exp - value.iat === ACCESS_TTL
    );
  } catch {
    return false;
  }
}

export function nextAttempts(attempts: number[], now: number) {
  const recent = attempts.filter((time) => Number.isFinite(time) && time > now - 3600000);
  if (recent.length >= 5) return { allowed: false, attempts: recent };
  return { allowed: true, attempts: [...recent, now] };
}
