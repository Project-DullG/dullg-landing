import { createHmac, timingSafeEqual } from "node:crypto";
import { communityOriginAllowed } from "../english/community.ts";
import { GalleryError } from "./model.ts";

export const galleryHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  Vary: "Cookie",
  "X-Content-Type-Options": "nosniff",
};
export const galleryOriginAllowed = communityOriginAllowed;
export const MAX_GALLERY_BYTES = 8 * 1024;
export type GallerySession = { uid: string; firebase?: { sign_in_provider?: string } };

export function participantUid(session: GallerySession | null): string | null {
  return session &&
    typeof session.uid === "string" &&
    session.uid.length > 0 &&
    session.uid.length <= 128 &&
    session.firebase?.sign_in_provider !== "anonymous"
    ? session.uid
    : null;
}
export function stableUidKey(uid: string): string {
  if (!uid || uid.length > 128) throw new GalleryError("로그인 계정을 확인해 주세요.", 401);
  return Buffer.from(uid, "utf8").toString("base64url");
}
export function galleryAccountKey(uid: string, secret: string | undefined): string {
  if (!secret || secret.length < 32)
    throw new GalleryError("참여 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.", 503);
  return createHmac("sha256", secret.replace(/\\n/g, "\n"))
    .update(`student-gallery-account-v1:${uid}`)
    .digest("hex");
}
export function assertGalleryAccount(expected: string, received: unknown): void {
  if (
    typeof received !== "string" ||
    !/^[a-f0-9]{64}$/.test(received) ||
    !timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(received, "utf8"))
  )
    throw new GalleryError("로그인 계정이 바뀌었습니다. 새로고침한 뒤 다시 참여해 주세요.", 409);
}
export async function readGalleryJson(request: Request): Promise<Record<string, unknown>> {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") || ""))
    throw new GalleryError("JSON 요청만 처리할 수 있습니다.", 415);
  if (Number(request.headers.get("content-length")) > MAX_GALLERY_BYTES)
    throw new GalleryError("요청이 너무 큽니다.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new GalleryError("요청 내용이 없습니다.");
  let length = 0;
  const parts: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_GALLERY_BYTES) {
        await reader.cancel();
        throw new GalleryError("요청이 너무 큽니다.", 413);
      }
      parts.push(value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const part of parts) {
      bytes.set(part, offset);
      offset += part.byteLength;
    }
    const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    if (!raw || typeof raw !== "object" || Array.isArray(raw))
      throw new GalleryError("요청 내용을 확인해 주세요.");
    return raw as Record<string, unknown>;
  } catch (error) {
    if (error instanceof GalleryError) throw error;
    throw new GalleryError("요청 내용을 읽을 수 없습니다.");
  } finally {
    reader.releaseLock();
  }
}
