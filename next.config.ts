import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // db/ and worker/ use Cloudflare-specific types not needed for Vercel
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
