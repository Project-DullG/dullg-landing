import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/games/ulleung-marble", destination: "/ulleung-marble/index.html" },
      { source: "/games/wallbreak", destination: "/wallbreak/index.html" },
    ];
  },
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/speaking/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
  outputFileTracingIncludes: {
    "/speaking/assets/*": ["./private-assets/speaking/**/*"],
  },
  turbopack: {
    root: projectRoot,
  },
};

export default createNextIntlPlugin("./i18n/request.ts")(nextConfig);
