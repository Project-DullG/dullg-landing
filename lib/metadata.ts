import type { Metadata } from "next";
import { getRoute } from "./routes.ts";

type Overrides = {
  title?: string;
  absoluteTitle?: string;
  description?: string;
  ogImage?: string;
};

export function pageMetadata(path: string, overrides: Overrides = {}): Metadata {
  const route = getRoute(path);
  const title = overrides.title ?? route.title;
  const description = overrides.description ?? route.description;
  const images = [{ url: overrides.ogImage ?? "/opengraph-image", width: 1200, height: 630 }];
  return {
    title: overrides.absoluteTitle ? { absolute: overrides.absoluteTitle } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
      locale: "ko_KR",
      siteName: "단서공방",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}
