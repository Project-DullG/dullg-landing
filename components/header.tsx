"use client";

import { ArrowUpRight, List, X } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/academy", label: "수업팩" },
  { href: "/works", label: "작품" },
  { href: "/materials", label: "수강생 자료실" },
  { href: "/about", label: "단서공방" },
];

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
          <span className="brand-name">단서공방<small>ProjectDullG</small></span>
        </Link>

        <div className="nav-links">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

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

        <Link className="nav-cta" href="/#apply">
          검토팩 요청
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
          {navLinks.map((link) => (
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
            href="/#apply"
            onClick={() => setIsOpen(false)}
          >
            무료 검토팩 요청
            <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}
