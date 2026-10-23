import { ImageResponse } from "next/og";
import { BrandLogo } from "@/components/brand-mark";

export const alt = "twisdom — Games and learning through stories";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 72,
          background: "#151515",
          color: "#fff",
        }}
      >
        <BrandLogo width={1056} color="#fff" variant="fullLockup" />
      </div>
    ),
    {
      ...size,
    },
  );
}
