const DEFAULT_SITE_URL = "https://dullg-landing.vercel.app";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL
).replace(/\/+$/, "");
