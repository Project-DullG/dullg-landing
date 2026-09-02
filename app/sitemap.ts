import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, priority: 1.0, changeFrequency: "weekly" },
    { url: `${SITE_URL}/academy`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${SITE_URL}/episode`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${SITE_URL}/academy/curriculum`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${SITE_URL}/academy/sample`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${SITE_URL}/academy/pilot`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${SITE_URL}/activity`, priority: 0.7, changeFrequency: "weekly" },
    { url: `${SITE_URL}/works`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${SITE_URL}/materials`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${SITE_URL}/about`, priority: 0.6, changeFrequency: "monthly" },
    { url: `${SITE_URL}/contact`, priority: 0.6, changeFrequency: "monthly" },
    { url: `${SITE_URL}/privacy`, priority: 0.3, changeFrequency: "yearly" },
    { url: `${SITE_URL}/sitemap`, priority: 0.4, changeFrequency: "monthly" },
  ];
}
