"use client";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import {
  House,
  Search,
  Map,
  NotebookPen,
  RotateCcw,
  MessageCircle,
  MoreHorizontal,
  Lightbulb,
} from "lucide-react";
import Link from "@/components/i18n/link";
import { translateText } from "@/lib/i18n/translate";
import type { EnglishLevel } from "@/lib/english/types";
import styles from "./study-navigation.module.css";
const mainLinks = [
  { href: "/english", label: "학습 홈", icon: House },
  { href: "/english/library", label: "콘텐츠 찾기", icon: Search },
  { href: "/english/courses", label: "학습 코스", icon: Map },
  { href: "/english/journal", label: "나의 학습", icon: NotebookPen },
];
const tools = [
  { href: "/english/review", label: "표현 복습", icon: RotateCcw },
  { href: "/english/community", label: "커뮤니티", icon: MessageCircle },
  { href: "/english/about", label: "학습 설계", icon: Lightbulb },
];
export function StudyNavigation({
  className = "",
  level,
}: {
  className?: string;
  level?: EnglishLevel;
}) {
  const locale = useLocale();
  const pathname = (usePathname() || "").replace(/^\/en(?=\/|$)/, "").replace(/\/+$/, "");
  const within = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const active =
    mainLinks.find(({ href }) => href !== "/english" && within(href))?.href ||
    (pathname === "" || pathname === "/english" || /\/english\/(play|practice)\//.test(pathname)
      ? "/english"
      : null);
  return (
    <nav
      className={styles.navigation + " " + className}
      aria-label={translateText("영어 학습 메뉴", locale)}
    >
      <div className={styles.links}>
        {mainLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={level && href !== "/english/journal" ? href + "?level=" + level : href}
            aria-current={active === href ? "page" : undefined}
          >
            <Icon size={17} aria-hidden="true" />
            <span>{translateText(label, locale)}</span>
          </Link>
        ))}
      </div>
      <details className={styles.tools} key={pathname}>
        <summary
          aria-label={translateText("추가 학습 메뉴", locale)}
          data-active={tools.some(({ href }) => within(href))}
        >
          <MoreHorizontal size={21} aria-hidden="true" />
          <span>{translateText("더보기", locale)}</span>
        </summary>
        <div className={styles.toolMenu}>
          {tools.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} aria-current={within(href) ? "page" : undefined}>
              <Icon size={17} aria-hidden="true" />
              {translateText(label, locale)}
            </Link>
          ))}
        </div>
      </details>
    </nav>
  );
}
