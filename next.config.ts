import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/games/ulleung-marble", destination: "/ulleung-marble/index.html" }];
  },
  turbopack: {
    root: projectRoot,
  },
};

export default createNextIntlPlugin("./i18n/request.ts")(nextConfig);
