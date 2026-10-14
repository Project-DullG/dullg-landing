import type { DecodedIdToken } from "firebase-admin/auth";

const AUTH_FIELDS = new Set([
  "uid",
  "sub",
  "aud",
  "iss",
  "iat",
  "exp",
  "auth_time",
  "firebase",
  "email",
  "email_verified",
  "phone_number",
  "name",
  "picture",
]);

/** Keep identity from the verified token, and permissions only from live claims. */
export function currentSessionClaims(
  decoded: DecodedIdToken,
  liveClaims: Record<string, unknown>,
): DecodedIdToken {
  const identity = Object.fromEntries(
    Object.entries(decoded).filter(([key]) => AUTH_FIELDS.has(key)),
  );
  const permissions = Object.fromEntries(
    Object.entries(liveClaims).filter(([key]) => !AUTH_FIELDS.has(key)),
  );
  return { ...identity, ...permissions, uid: decoded.uid } as DecodedIdToken;
}
