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
    <footer className="footer shell">
      <Link className="brand" href="/">
        <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
        <span>DullG</span>
      </Link>
      <p>© 2026 DullG. Read the clues. Tell your story.</p>
      <div>
        <a href="/about">소개</a>
        <a href="/episode">에피소드</a>
        <a href="/academy/curriculum">커리큘럼</a>
        <a href="/academy/sample">샘플 자료</a>
        <a href="/academy/pilot">파일럿 안내</a>
        <a href="/contact">Contact</a>
      </div>
    </footer>
  );
}

export function PageFrame({ children }: { children: ReactNode }) {
  return <><Header /><main>{children}</main><Footer /></>;
}

export function Kicker({ children }: { children: ReactNode }) { return <p className="section-kicker">{children}</p>; }
export function ArrowButton({ children, light = false, href = "/academy/pilot" }: { children: ReactNode; light?: boolean; href?: string }) { return <a className={`button ${light ? "button-light" : "button-dark"}`} href={href}>{children} <span>↗</span></a>; }

export { Header } from "./header";
