import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { localizedPath } from "./translate";
export function bilingualSitemap(entries: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
  return entries.flatMap((entry) => {
    const english = `${SITE_URL}${localizedPath(entry.url.slice(SITE_URL.length) || "/", "en")}`;
    const alternates = { languages: { ko: entry.url, en: english } };
    return [
      { ...entry, alternates },
      { ...entry, url: english, alternates },
    ];
  });
}
