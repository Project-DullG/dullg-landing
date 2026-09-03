import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "단서공방 — 머더미스터리 작품과 영어 미스터리 수업팩";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const fontData = await readFile(join(process.cwd(), "public/fonts/noto-sans-kr-700-subset.ttf"));
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#111412",
          color: "#fff",
          fontFamily: '"Noto Sans KR"',
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ width: 88, height: 12, background: "#fff", borderRadius: 6 }} />
          <div style={{ width: 66, height: 12, background: "#fff", borderRadius: 6 }} />
          <div style={{ width: 88, height: 12, background: "#c96645", borderRadius: 6 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: -2 }}>단서공방</div>
          <div style={{ fontSize: 34, color: "#cfd3cf" }}>
            머더미스터리 작품 · 영어 미스터리 수업팩 · 학원 운영 도구
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Noto Sans KR", data: fontData, weight: 700, style: "normal" }],
    },
  );
}
