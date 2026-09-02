import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { ReactNode } from "react";
import { Header } from "./header";

export const curriculum = [
  { session: "01", title: "사건을 읽다", label: "READ THE CASE", body: "사건의 배경과 인물을 읽고, 직접 제시된 사실과 중요한 단서를 골라냅니다.", output: "단서 기록지" },
  { session: "02", title: "단서를 연결하다", label: "CONNECT THE CLUES", body: "질문하고 추측하며 시간·장소·인물 사이의 관계와 모순을 찾아갑니다.", output: "팀 추론 보드" },
  { session: "03", title: "근거를 비교하다", label: "TEST THE THEORY", body: "여러 가설을 비교하고 새로운 증거가 나왔을 때 자신의 판단을 수정합니다.", output: "주장·근거 정리" },
  { session: "04", title: "사건을 보고하다", label: "TELL THE STORY", body: "최종 판단과 두 가지 근거를 영어 문장으로 정리해 팀 사건 보고서를 완성합니다.", output: "팀 보고서 · 개인 영작" },
];

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
            <span className="brand-name">단서공방<small>ProjectDullG</small></span>
          </Link>
          <p>
            이야기를 만들고, 단서를 엮어
            <br />
            머더미스터리와 교육 콘텐츠를 만듭니다.
          </p>
        </div>

        <div className="site-footer-links"><strong>둘러보기</strong><Link href="/">홈</Link><Link href="/works">작품</Link><Link href="/academy">교육</Link><Link href="/materials">수강생 자료실</Link></div>

        <div className="site-footer-links">
          <strong>단서공방</strong>
          <Link href="/about">공방 소개</Link>
          <Link href="/activity">제작·활동 기록</Link>
          <Link href="/contact">문의하기</Link>
        </div>

        <div className="site-footer-contact">
          <strong>문의</strong>
          <a href="mailto:cluedullg@gmail.com">cluedullg@gmail.com</a>
          <p>영업일 기준 1~2일 내 답변</p>
          <Link className="site-footer-sample" href="/contact">프로젝트 문의 →</Link>
        </div>
      </div>

      <div className="shell site-footer-bottom">
        <p>© 2026 단서공방(ProjectDullG) · 사업자등록번호 689-12-03138</p>
        <span><Link href="/sitemap">전체 페이지</Link><Link href="/privacy">개인정보 처리 안내</Link></span>
      </div>
    </footer>
  );
}

export function PageFrame({ children }: { children: ReactNode }) {
  return <><Header /><main id="main-content">{children}</main><Footer /></>;
}

export function Kicker({ children }: { children: ReactNode }) { return <p className="section-kicker">{children}</p>; }
export function ArrowButton({ children, light = false, href = "/academy/pilot" }: { children: ReactNode; light?: boolean; href?: string }) {
  return (
    <a className={`button ${light ? "button-light" : "button-dark"}`} href={href}>
      {children}
      <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
    </a>
  );
}

export { Header } from "./header";
