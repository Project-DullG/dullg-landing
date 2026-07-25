"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const navLinks = isHome
    ? [
        { href: "/#flow", label: "수업 방식" },
        { href: "/#materials", label: "제공 자료" },
        { href: "/#process", label: "파일럿 안내" },
        { href: "/#apply", label: "샘플 요청" },
      ]
    : [
        { href: "/academy/curriculum", label: "수업 방식" },
        { href: "/academy/sample", label: "제공 자료" },
        { href: "/academy/pilot", label: "파일럿 안내" },
        { href: "/#apply", label: "샘플 요청" },
      ];

  return (
    <nav className="nav shell" aria-label="주요 메뉴">
      <Link className="brand" href="/" aria-label="DullG 홈">
        <span className="brand-mark" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>DullG</span>
      </Link>
      <div className="nav-links">
        {navLinks.map((link) => (
          <a key={link.label} href={link.href}>
            {link.label}
          </a>
        ))}
      </div>
      <Link className="nav-cta" href="/#apply">
        샘플·파일럿 문의 <span>↗</span>
      </Link>
    </nav>
  );
}
