import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { translateText, translateValue, localizedPath } from "./translate";
export async function getText() {
  const locale = await getLocale();
  return <T>(value: T): T => translateValue(value, locale);
}
export async function localizedRedirect(path: string): Promise<never> {
  redirect(localizedPath(path, await getLocale()));
}
export async function localizeMetadata(metadata: Metadata): Promise<Metadata> {
  const locale = await getLocale();
  const original =
    typeof metadata.alternates?.canonical === "string"
      ? metadata.alternates.canonical.replace(SITE_URL, "")
      : "/";
  const t = (value: unknown): unknown => {
    if (typeof value === "string") return translateText(value, locale);
    if (Array.isArray(value)) return value.map(t);
    if (value && typeof value === "object" && !(value instanceof URL))
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, t(v)]));
    return value;
  };
  const result = t(metadata) as Metadata;
  result.alternates = {
    ...metadata.alternates,
    canonical: localizedPath(original, locale),
    languages: { ko: original, en: localizedPath(original, "en"), "x-default": original },
  };
  result.openGraph = {
    ...result.openGraph,
    locale: locale === "en" ? "en_US" : "ko_KR",
    siteName: locale === "en" ? "ProjectDullG" : "단서공방",
    url: localizedPath(original, locale),
  };
  return result;
}
