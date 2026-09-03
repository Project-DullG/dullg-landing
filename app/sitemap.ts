import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { publicRoutes } from "@/lib/routes";
import { works } from "@/lib/works";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = publicRoutes.map((r) => ({
    url: `${SITE_URL}${r.path === "/" ? "" : r.path}`,
    priority: r.priority,
    changeFrequency: r.changeFrequency,
  }));
  const workPages = works.map((work) => ({
    url: `${SITE_URL}/works/${work.slug}`,
    priority: 0.7,
    changeFrequency: "monthly" as const,
  }));
  return [...pages, ...workPages];
}
