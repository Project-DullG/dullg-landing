import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { ReactNode } from "react";
import { primaryNavigation } from "@/lib/navigation";
import { BRAND, emailHref } from "@/lib/site-config";
import { Header } from "./header";

export { Header };

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell site-footer-grid">
        <div className="site-footer-brand">
          <Link className="brand" href="/">
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
          <p>
            머더미스터리를 제작하고
            <br />
            게임·AI 활용 수업을 진행합니다.
          </p>
        </div>

        <div className="site-footer-links">
          <strong>작품·공방</strong>
          {primaryNavigation
            .filter((item) =>
              ["/works", "/mini-projects", "/activity", "/about"].includes(item.href),
            )
            .map((item) => (
              <Link href={item.href} key={item.href}>
                {item.href === "/about" ? "공방 소개" : item.label}
              </Link>
            ))}
        </div>

        <div className="site-footer-links">
          <strong>교육·자료</strong>
          {primaryNavigation
            .filter((item) => ["/academy", "/materials", "/speaking"].includes(item.href))
            .map((item) => (
              <Link href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          <Link href="/login">학원 관리 로그인</Link>
        </div>

        <div className="site-footer-contact">
          <strong>문의</strong>
          <a href={emailHref}>{BRAND.email}</a>
          <p>{BRAND.responseTime}</p>
          <Link className="site-footer-sample" href="/contact">
            프로젝트 문의 →
          </Link>
        </div>
      </div>

      <div className="shell site-footer-bottom">
        <p>
          © 2026 {BRAND.name}({BRAND.englishName}) · 사업자등록번호 {BRAND.businessNumber}
        </p>
        <span>
          <Link href="/sitemap">전체 페이지</Link>
          <Link href="/privacy">개인정보 처리 안내</Link>
        </span>
      </div>
    </footer>
  );
}

export function PageFrame({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return <p className="section-kicker">{children}</p>;
}
export function ArrowButton({
  children,
  light = false,
  href = "/academy/pilot",
}: {
  children: ReactNode;
  light?: boolean;
  href?: string;
}) {
  return (
    <Link className={`button ${light ? "button-light" : "button-dark"}`} href={href}>
      {children}
      <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
    </Link>
  );
}
