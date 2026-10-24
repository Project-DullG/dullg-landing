import { createHash } from "node:crypto";
import { getCertificateAccess, privateHeaders } from "@/lib/certificates/access-server";
import { getAdminDb } from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const assets = new Set(["kim-byeongcheol", "lee-seongro", "ulleung-education-seal"]);
const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const maxAssetBytes = 2_000_000;
const chunkSize = 524_288;
const maxChunks = 4;
const headers = {
  ...privateHeaders,
  "X-Content-Type-Options": "nosniff",
  "Cross-Origin-Resource-Policy": "same-origin",
};
const error = (message: string, status: number) =>
  Response.json({ error: message }, { status, headers });

export async function GET(_request: Request, context: { params: Promise<{ asset: string }> }) {
  try {
    if (!(await getCertificateAccess())) return error("인증번호를 다시 입력해 주세요.", 401);
  } catch {
    return error("인증을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.", 503);
  }

  const { asset } = await context.params;
  if (!assets.has(asset)) return error("수료증 이미지를 찾을 수 없습니다.", 404);

  try {
    // Original signatures and the seal stay in an Admin-only collection, never in the repository.
    const ref = getAdminDb().collection("certificateAssets").doc(asset);
    const snapshot = await ref.get();
    if (!snapshot.exists) return error("수료증 이미지를 찾을 수 없습니다.", 404);
    const record = snapshot.data();
    let data: unknown = record?.png;
    if (record?.format === "png-chunks-v1") {
      const { byteLength, sha256, chunkCount } = record;
      if (
        !Number.isSafeInteger(byteLength) ||
        byteLength < pngMagic.byteLength ||
        byteLength > maxAssetBytes ||
        !Number.isSafeInteger(chunkCount) ||
        chunkCount < 1 ||
        chunkCount > maxChunks ||
        chunkCount !== Math.ceil(byteLength / chunkSize) ||
        typeof sha256 !== "string" ||
        !/^[a-f0-9]{64}$/.test(sha256)
      )
        throw new Error("Invalid certificate asset manifest");

      const chunks = await Promise.all(
        Array.from({ length: chunkCount }, async (_, index) => {
          const part = await ref.collection("chunks").doc(String(index)).get();
          const bytes: unknown = part.data()?.png;
          const expectedBytes = Math.min(chunkSize, byteLength - index * chunkSize);
          if (!part.exists || !Buffer.isBuffer(bytes) || bytes.byteLength !== expectedBytes)
            throw new Error("Invalid certificate asset chunk");
          return bytes;
        }),
      );
      const assembled = Buffer.concat(chunks, byteLength);
      if (createHash("sha256").update(assembled).digest("hex") !== sha256)
        throw new Error("Certificate asset checksum mismatch");
      data = assembled;
    } else if (record?.format !== undefined) {
      throw new Error("Invalid certificate asset format");
    }
    if (
      !Buffer.isBuffer(data) ||
      data.byteLength < pngMagic.byteLength ||
      data.byteLength > maxAssetBytes ||
      !data.subarray(0, pngMagic.byteLength).equals(pngMagic)
    )
      return error("수료증 이미지를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.", 503);
    return new Response(new Uint8Array(data), {
      headers: {
        ...headers,
        "Content-Type": "image/png",
        "Content-Length": String(data.byteLength),
      },
    });
  } catch {
    return error("수료증 이미지를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.", 503);
  }
}
