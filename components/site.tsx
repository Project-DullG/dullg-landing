import { useText } from "@/lib/i18n/use-text";
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
            <span className="brand-mark" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="brand-name">
              {t(BRAND.name)}
              <small>{t(BRAND.englishName)}</small>
            </span>
          </Link>
          <p>
            {t("머더미스터리를 제작하고")}
            <br />
            {t("게임\u00B7AI 활용 수업을 진행합니다.")}
          </p>
        </div>

        <div className="site-footer-links">
          <strong>{t("작품\u00B7공방")}</strong>
          {t(
            primaryNavigation
              .filter((item) =>
                ["/works", "/mini-projects", "/activity", "/about"].includes(item.href),
              )
              .map((item) => (
                <Link href={item.href} key={item.href}>
                  {t(item.href === "/about" ? "공방 소개" : item.label)}
                </Link>
              )),
          )}
        </div>

        <div className="site-footer-links">
          <strong>{t("교육\u00B7자료")}</strong>
          {t(
            primaryNavigation
              .filter((item) => ["/academy", "/materials", "/speaking"].includes(item.href))
              .map((item) => (
                <Link href={item.href} key={item.href}>
                  {t(item.label)}
                </Link>
              )),
          )}
          <Link href="/login">{t("학원 관리 로그인")}</Link>
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
          © 2026 {t("단서공방(ProjectDullG)")} · {t("사업자등록번호")} {BRAND.businessNumber}
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
