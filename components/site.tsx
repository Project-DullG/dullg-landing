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
            <span>DullG</span>
          </Link>
          <p>
            영어를 읽고, 추리하고, 설명하는
            <br />
            4차시 미스터리 수업팩
          </p>
        </div>

        <div className="site-footer-links">
          <strong>제품</strong>
          <Link href="/academy">제품 소개</Link>
          <Link href="/academy/curriculum">4차시 커리큘럼</Link>
          <Link href="/academy/sample">실제 수업 자료</Link>
          <Link href="/episode">에피소드 01</Link>
          <Link href="/activity">활동 기록</Link>
        </div>

        <div className="site-footer-links">
          <strong>운영</strong>
          <Link href="/academy/pilot">파일럿 운영 안내</Link>
          <Link href="/about">DullG 소개</Link>
          <Link href="/contact">문의하기</Link>
          <a href="/sitemap.xml">사이트맵</a>
        </div>

        <div className="site-footer-contact">
          <strong>문의</strong>
          <a href="mailto:hello@dullg.com">hello@dullg.com</a>
          <p>영업일 1~2일 내 답변</p>
          <p>현재 파일럿 단계</p>
        </div>
      </div>

      <div className="shell site-footer-bottom">
        <p>© 2026 DullG. Read the clues. Tell your story.</p>
        <Link href="/privacy">개인정보 처리 안내</Link>
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
