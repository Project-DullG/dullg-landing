"use client";

import { ArrowUpRight, List, X } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { primaryNavigation } from "@/lib/navigation";
import { BRAND } from "@/lib/site-config";

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="site-header">
      <nav className="nav shell" aria-label="주요 메뉴">
        <Link className="brand" href="/" aria-label="단서공방 홈">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="brand-name">{BRAND.name}<small>{BRAND.englishName}</small></span>
        </Link>

        <div className="nav-links">
          {primaryNavigation.map((link) => {
            const isActive = link.href === "/"
              ? pathname === "/"
              : pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.label}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <Link className="nav-cta" href="/contact">
          문의하기
          <ArrowUpRight size={17} weight="bold" aria-hidden="true" />
        </Link>

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
      >
        <div className="shell">
          {primaryNavigation.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            className="mobile-navigation-cta"
            href="/contact"
            onClick={() => setIsOpen(false)}
          >
            문의하기
            <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}
