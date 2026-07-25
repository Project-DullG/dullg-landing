import type { MetadataRoute } from "next";

const BASE = "https://dullg.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, priority: 1.0, changeFrequency: "weekly" },
    { url: `${BASE}/academy`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${BASE}/episode`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE}/academy/curriculum`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE}/academy/sample`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE}/academy/pilot`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE}/about`, priority: 0.6, changeFrequency: "monthly" },
    { url: `${BASE}/contact`, priority: 0.6, changeFrequency: "monthly" },
  ];
}
