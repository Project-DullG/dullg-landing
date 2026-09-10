"use client";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { localizedPath } from "@/lib/i18n/translate";
export function LanguageSwitch() {
  const locale = useLocale();
  const pathname = usePathname();
  const target = locale === "en" ? "ko" : "en";
  return (
    <a
      className="language-switch"
      href={localizedPath(pathname, target)}
      lang={target}
      hrefLang={target}
      aria-label={target === "en" ? "View this page in English" : "이 페이지를 한국어로 보기"}
      onClick={(event) => {
        event.preventDefault();
        window.location.assign(
          localizedPath(window.location.pathname, target) +
            window.location.search +
            window.location.hash,
        );
      }}
    >
      {target === "en" ? "EN" : "한국어"}
    </a>
  );
}
