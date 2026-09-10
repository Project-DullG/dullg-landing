import NextLink from "next/link";
import { useLocale } from "next-intl";
import { localizedPath } from "@/lib/i18n/translate";
import type { ComponentProps } from "react";
export default function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const locale = useLocale();
  const target =
    typeof href === "string"
      ? localizedPath(href, locale)
      : { ...href, pathname: href.pathname ? localizedPath(href.pathname, locale) : href.pathname };
  return <NextLink {...props} href={target} />;
}
