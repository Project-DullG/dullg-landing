"use client";
import { useText } from "@/lib/i18n/use-text";
import { BrandMark } from "@/components/brand-mark";
import { ArrowUpRight, List, X } from "@phosphor-icons/react";
import Link from "@/components/i18n/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { primaryNavigation } from "@/lib/navigation";
import { BRAND } from "@/lib/site-config";
import { LanguageSwitch } from "./i18n/language-switch";
export function Header() {
  const t = useText();
  const pathname = usePathname().replace(/^\/en(?=\/|$)/, "") || "/";
  const [isOpen, setIsOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuPanel = useRef<HTMLDivElement>(null);
  // 경로가 바뀌면 메뉴를 닫는다. (렌더 중 상태 보정 — effect 없이 처리)
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setIsOpen(false);
  }
  // 열려 있는 동안 배경 스크롤 잠금 + Esc로 닫기.
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        menuButton.current?.focus();
      }
      if (e.key === "Tab") {
        const links = menuPanel.current?.querySelectorAll<HTMLAnchorElement>("a[href]");
        const last = links?.[links.length - 1];
        if (e.shiftKey && document.activeElement === menuButton.current) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          menuButton.current?.focus();
        }
      }
    };
    const compact = window.matchMedia("(max-width: 1200px)");
    const closeOnDesktop = () => {
      if (!compact.matches) setIsOpen(false);
    };
    compact.addEventListener("change", closeOnDesktop);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      compact.removeEventListener("change", closeOnDesktop);
    };
  }, [isOpen]);
  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href ||
        pathname.startsWith(`${href}/`) ||
        (href === "/academy" && pathname === "/episode");
  return (
    <header className="site-header">
      <nav className="nav shell" aria-label={t("주요 메뉴")}>
        <Link className="brand" href="/" aria-label={t("단서공방 홈")}>
          <BrandMark />
          <span className="brand-name">
            {t(BRAND.name)}
            <small>{t(BRAND.englishName)}</small>
          </span>
        </Link>

        <div className="nav-links">
          {t(
            primaryNavigation
              .filter((link) => link.href !== "/")
              .map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                >
                  {t(link.href === "/about" ? "공방 소개" : link.label)}
                </Link>
              )),
          )}
        </div>

        <div className="nav-actions">
          <Link className="nav-cta" href="/contact">
            {t("문의하기")}
            <ArrowUpRight size={17} weight="bold" aria-hidden="true" />
          </Link>
        </div>

        <LanguageSwitch />
        <button
          ref={menuButton}
          className="nav-menu-button"
          type="button"
          aria-label={t(isOpen ? "메뉴 닫기" : "메뉴 열기")}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsOpen((value) => !value)}
        >
          {t(isOpen ? <X size={24} /> : <List size={24} />)}
        </button>
      </nav>

      <div
        ref={menuPanel}
        className={`mobile-navigation ${isOpen ? "is-open" : ""}`}
        id="mobile-navigation"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className="shell">
          {t(
            primaryNavigation.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                onClick={() => setIsOpen(false)}
              >
                {t(link.href === "/about" ? "공방 소개" : link.label)}
              </Link>
            )),
          )}
          <Link className="mobile-navigation-cta" href="/contact" onClick={() => setIsOpen(false)}>
            {t("문의하기")}
            <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
          </Link>
          <Link className="mobile-navigation-login" href="/login" onClick={() => setIsOpen(false)}>
            {t("학원 관리 로그인 →")}
          </Link>
        </div>
      </div>
    </header>
  );
}
