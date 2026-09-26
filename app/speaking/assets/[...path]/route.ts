import { readFile } from "node:fs/promises";
import path from "node:path";
import { speakingAccess, privateHeaders } from "@/lib/speaking/access/server";
import { byteRange } from "@/lib/speaking/byte-range";

export const dynamic = "force-dynamic";
export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const access = await speakingAccess();
  if (access.status !== "ready")
    return new Response("접근 권한을 확인하세요.", { status: 401, headers: privateHeaders });
  const segments = (await context.params).path;
  const file = segments.join("/");
  const images = new Set([
    "fish-atlas.png",
    "fish-spots.png",
    "fish-aurora.png",
    "aquarium-themes.png",
    "fish-expansion.png",
    "practice/cafe-generated.png",
    "practice/library-generated.png",
    "practice/farmers-market-generated.png",
    "practice/community-workshop-generated.png",
  ]);
  if (!images.has(file) && !/^audio\/[a-zA-Z0-9_-]+\.(mp3|m4a|wav|ogg)$/.test(file))
    return new Response("자료를 찾을 수 없습니다.", { status: 404, headers: privateHeaders });
  try {
    const data = await readFile(path.join(process.cwd(), "private-assets/speaking", file));
    const type = images.has(file)
      ? "image/png"
      : file.endsWith(".wav")
        ? "audio/wav"
        : file.endsWith(".ogg")
          ? "audio/ogg"
          : file.endsWith(".m4a")
            ? "audio/mp4"
            : "audio/mpeg";
    const range = byteRange(request.headers.get("Range"), data.length);
    if (range === false)
      return new Response(null, {
        status: 416,
        headers: { ...privateHeaders, "Content-Range": `bytes */${data.length}` },
      });
    const body = range ? data.subarray(range.start, range.end + 1) : data;
    return new Response(body, {
      status: range ? 206 : 200,
      headers: {
        ...privateHeaders,
        "Content-Type": type,
        "Content-Length": String(body.length),
        "Accept-Ranges": "bytes",
        ...(range ? { "Content-Range": `bytes ${range.start}-${range.end}/${data.length}` } : {}),
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("자료를 찾을 수 없습니다.", { status: 404, headers: privateHeaders });
  }
}
