import { createHash } from "node:crypto";
import { EnglishInputError } from "./progress.ts";

export function accountKey(uid: string): string {
  return createHash("sha256").update(`english-account-v1:${uid}`).digest("hex").slice(0, 24);
}
export function assertEnglishAccount(uid: string, value: unknown) {
  if (typeof value !== "string" || value !== accountKey(uid))
    throw new EnglishInputError("로그인 계정이 바뀌었습니다. 페이지를 새로 열어 주세요.", 409);
}

export async function readEnglishJson(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json"))
    throw new EnglishInputError("JSON 요청만 처리할 수 있습니다.", 415);
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > 12_000) throw new EnglishInputError("요청이 너무 큽니다.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new EnglishInputError("요청 내용이 없습니다.");
  let total = 0;
  const parts: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > 12_000) { await reader.cancel(); throw new EnglishInputError("요청이 너무 큽니다.", 413); }
      parts.push(value);
    }
    const merged = new Uint8Array(total);
    let position = 0;
    for (const part of parts) { merged.set(part, position); position += part.length; }
    const value: unknown = JSON.parse(new TextDecoder().decode(merged));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new EnglishInputError("요청 내용을 확인해 주세요.");
    return value as Record<string, unknown>;
  } catch (error) {
    if (error instanceof EnglishInputError) throw error;
    throw new EnglishInputError("요청 내용을 읽을 수 없습니다.");
  } finally { reader.releaseLock(); }
}
