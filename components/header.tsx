"use client";

import { ArrowUpRight, List, X } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { primaryNavigation } from "@/lib/navigation";
import { BRAND } from "@/lib/site-config";

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

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
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="site-header">
      <nav className="nav shell" aria-label="주요 메뉴">
        <Link className="brand" href="/" aria-label="단서공방 홈">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="brand-name">
            {BRAND.name}
            <small>{BRAND.englishName}</small>
          </span>
        </Link>

        <div className="nav-links">
          {primaryNavigation.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="nav-actions">
          <Link className="nav-login" href="/login">
            학원 관리
          </Link>
          <Link className="nav-cta" href="/contact">
            문의하기
            <ArrowUpRight size={17} weight="bold" aria-hidden="true" />
          </Link>
        </div>

        <button
          className="nav-menu-button"
          type="button"
          aria-label={isOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <X size={24} /> : <List size={24} />}
        </button>
      </nav>

      <div
        className={`mobile-navigation ${isOpen ? "is-open" : ""}`}
        id="mobile-navigation"
        aria-hidden={!isOpen}
      >
        <div className="shell">
          {primaryNavigation.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}>
              {link.label}
            </Link>
          ))}
          <Link className="mobile-navigation-cta" href="/contact" onClick={() => setIsOpen(false)}>
            문의하기
            <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
          </Link>
          <Link className="mobile-navigation-login" href="/login" onClick={() => setIsOpen(false)}>
            학원 관리 로그인 →
          </Link>
        </div>
      </div>
    </header>
  );
}
