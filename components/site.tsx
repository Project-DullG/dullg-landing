import { useText } from "@/lib/i18n/use-text";
import { BrandMark } from "@/components/brand-mark";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "@/components/i18n/link";
import type { ReactNode } from "react";
import { primaryNavigation } from "@/lib/navigation";
import { BRAND, emailHref } from "@/lib/site-config";
import { Header } from "./header";
export { Header };
export function Footer() {
  const t = useText();
  return (
    <footer className="site-footer">
      <div className="shell site-footer-grid">
        <div className="site-footer-brand">
          <Link className="brand" href="/">
            <BrandMark />
            <span className="brand-name">
              {t(BRAND.name)}
              <small>{t(BRAND.englishName)}</small>
            </span>
          </Link>
          <p>
            {t("이야기로 배우는 영어와")}
            <br />
            {t("함께 푸는 추리 콘텐츠를 만듭니다.")}
          </p>
        </div>

        <div className="site-footer-links">
          <strong>{t("작품·활동")}</strong>
          {t(
            [
              { href: "/studio", label: "작품·활동" },
              { href: "/mini-projects", label: "웹게임" },
              { href: "/works", label: "작품과 펀딩" },
              { href: "/activity", label: "제작·활동 기록" },
              { href: "/about", label: "브랜드 소개" },
              { href: "/academy", label: "수업·교육 협업" },
              { href: "/materials", label: "수강생 자료실" },
            ].map((item) => (
              <Link href={item.href} key={item.href}>
                {t(item.label)}
              </Link>
            )),
          )}
          <Link href="/login">{t("학원 관리 로그인")}</Link>
        </div>

        <div className="site-footer-links">
          <strong>{t("영어 학습")}</strong>
          {t(
            primaryNavigation
              .filter((item) => ["/english", "/english/community"].includes(item.href))
              .map((item) => (
                <Link href={item.href} key={item.href}>
                  {t(item.label)}
                </Link>
              )),
          )}
          <Link href="/english/review">{t("표현 복습")}</Link>
          <Link href="/english/about">{t("학습 설계")}</Link>
          <Link href="/speaking">{t("TOEIC Speaking · 기존 과정")}</Link>
        </div>

        <div className="site-footer-contact">
          <strong>{t("문의")}</strong>
          <a href={emailHref}>{t(BRAND.email)}</a>
          <p>{t(BRAND.responseTime)}</p>
          <Link className="site-footer-sample" href="/contact">
            {t("프로젝트 문의 →")}
          </Link>
        </div>
      </div>

      <div className="shell site-footer-bottom">
        <p>
          © 2026 {t(BRAND.fullName)} · {t("사업자등록번호")} {BRAND.businessNumber}
        </p>
        <span>
          <Link href="/sitemap">{t("전체 페이지")}</Link>
          <Link href="/privacy">{t("개인정보 처리 안내")}</Link>
        </span>
      </div>
    </footer>
  );
}
export function PageFrame({ children }: { children: ReactNode }) {
  const t = useText();
  return (
    <>
      <Header />
      <main id="main-content">{t(children)}</main>
      <Footer />
    </>
  );
}
export function Kicker({ children }: { children: ReactNode }) {
  const t = useText();
  return <p className="section-kicker">{t(children)}</p>;
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
  const t = useText();
  return (
    <Link className={`button ${light ? "button-light" : "button-dark"}`} href={href}>
      {t(children)}
      <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
    </Link>
  );
}
