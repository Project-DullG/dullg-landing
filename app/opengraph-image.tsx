import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { BrandMark } from "@/components/brand-mark";

export const alt = "ProjectDullG — Story-based English learning and mystery games";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const fontData = await readFile(join(process.cwd(), "public/fonts/english-journal-og-bold.ttf"));
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
          background: "#203b30",
          color: "#fff",
          fontFamily: '"English Journal OG"',
        }}
      >
        <BrandMark size={88} color="#fff" />
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: -2 }}>단서공방</div>
          <div style={{ fontSize: 34, color: "#cfd3cf" }}>
            이야기를 따라, 영어가 쌓이는 곳
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "English Journal OG", data: fontData, weight: 700, style: "normal" }],
    },
  );
}
