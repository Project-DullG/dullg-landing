import "server-only";
import { cookies } from "next/headers";
import { isIP } from "node:net";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  ATTEMPT_WINDOW_MS,
  attemptKey,
  nextAttempts,
  validAccessConfig,
  verifyAccess,
  type AccessConfig,
} from "./access-token";

export const ACCESS_COOKIE = "certificate_access";
export const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow",
  Vary: "Cookie",
};

export function accessConfig(): AccessConfig {
  return {
    code: process.env.CERTIFICATE_ACCESS_CODE || "",
    secret: process.env.CERTIFICATE_SESSION_SECRET || "",
  };
}

export async function getCertificateAccess(): Promise<boolean> {
  const config = accessConfig();
  if (!validAccessConfig(config)) return false;
  const jar = await cookies();
  return verifyAccess(jar.get(ACCESS_COOKIE)?.value || "", config);
}

export function sameOrigin(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin;
}

export class CertificateRequestError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function readJsonObject(request: Request): Promise<Record<string, unknown>> {
  const limit = 1024;
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") || ""))
    throw new CertificateRequestError("JSON 형식으로 요청해 주세요.", 415);
  const length = request.headers.get("content-length");
  if (length && (!/^\d+$/.test(length) || Number(length) > limit))
    throw new CertificateRequestError("입력 내용이 너무 깁니다.", 413);
  if (!request.body) throw new CertificateRequestError("입력 내용을 확인해 주세요.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > limit) {
        await reader.cancel();
        throw new CertificateRequestError("입력 내용이 너무 깁니다.", 413);
      }
      chunks.push(value);
    }
    const text = new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks));
    const value: unknown = JSON.parse(text);
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new CertificateRequestError("입력 내용을 확인해 주세요.");
    return value as Record<string, unknown>;
  } catch (error) {
    if (error instanceof CertificateRequestError) throw error;
    throw new CertificateRequestError("입력 내용을 확인해 주세요.");
  } finally {
    reader.releaseLock();
  }
}

function clientAddress(request: Request) {
  // Only trust the deployment proxy, not caller-supplied forwarding headers on other hosts.
  // Vercel overwrites this header: https://vercel.com/docs/headers/request-headers#x-forwarded-for
  if (process.env.VERCEL === "1") {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    if (!ip || !isIP(ip)) throw new Error("요청 주소를 확인하지 못했습니다.");
    return ip.toLowerCase();
  }
  if (process.env.NODE_ENV === "production") throw new Error("인증 요청 프록시 설정을 확인하세요.");
  return "127.0.0.1";
}

export async function consumeCodeAttempt(
  request: Request,
  config: AccessConfig,
  recordFailure: boolean,
) {
  if (!validAccessConfig(config)) throw new Error("수료증 접근 설정을 확인하세요.");
  const key = attemptKey(clientAddress(request), config.secret);
  const db = getAdminDb();
  const ref = db.collection("certificateAccessAttempts").doc(key);
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const stored: unknown = snapshot.data()?.attempts;
    if (stored !== undefined && !Array.isArray(stored))
      throw new Error("인증 시도 기록을 확인하지 못했습니다.");
    const now = Date.now();
    const result = nextAttempts(Array.isArray(stored) ? stored : [], now, recordFailure);
    if (result.allowed && recordFailure) {
      transaction.set(ref, {
        attempts: result.attempts,
        expiresAt: new Date(now + ATTEMPT_WINDOW_MS),
      });
    }
    return result.allowed;
  });
}
