"use client";

import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { BookOpen, Search, Map, NotebookPen, RotateCcw, MessageCircle } from "lucide-react";
import Link from "@/components/i18n/link";
import { translateText } from "@/lib/i18n/translate";
import styles from "./study-navigation.module.css";

const links = [
  { href: "/english", label: "학습 홈", icon: BookOpen },
  { href: "/english/library", label: "콘텐츠 찾기", icon: Search },
  { href: "/english/courses", label: "학습 코스", icon: Map },
  { href: "/english/journal", label: "나의 학습", icon: NotebookPen },
  { href: "/english/review", label: "표현 복습", icon: RotateCcw },
  { href: "/english/community", label: "커뮤니티", icon: MessageCircle },
] as const;

export function StudyNavigation({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const pathname = (usePathname() || "").replace(/^\/en(?=\/|$)/, "").replace(/\/+$/, "");
  const activeHref =
    links.find(
      ({ href }) => href !== "/english" && (pathname === href || pathname.startsWith(`${href}/`)),
    )?.href ||
    (pathname === "" || pathname === "/english" || pathname.startsWith("/english/")
      ? "/english"
      : null);

  return (
    <nav
      className={`${styles.navigation} ${className}`}
      aria-label={translateText("영어 학습 메뉴", locale)}
    >
      <div className={styles.links}>
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} aria-current={activeHref === href ? "page" : undefined}>
            <Icon size={16} aria-hidden="true" />
            <span>{translateText(label, locale)}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
