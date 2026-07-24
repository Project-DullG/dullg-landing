import type { ReactNode } from "react";

export const curriculum = [
  { session: "01", title: "사건을 읽다", label: "READ THE CASE", body: "사건의 배경과 인물을 읽고, 직접 제시된 사실과 중요한 단서를 골라냅니다.", output: "단서 기록지" },
  { session: "02", title: "단서를 연결하다", label: "CONNECT THE CLUES", body: "질문하고 추측하며 시간·장소·인물 사이의 관계와 모순을 찾아갑니다.", output: "팀 추론 보드" },
  { session: "03", title: "근거를 비교하다", label: "TEST THE THEORY", body: "여러 가설을 비교하고 새로운 증거가 나왔을 때 자신의 판단을 수정합니다.", output: "주장·근거 정리" },
  { session: "04", title: "사건을 보고하다", label: "TELL THE STORY", body: "최종 판단과 두 가지 근거를 영어 문장으로 정리해 팀 사건 보고서를 완성합니다.", output: "팀 보고서 · 개인 영작" },
];

export function Header() {
  return <nav className="nav shell" aria-label="주요 메뉴">
    <a className="brand" href="/" aria-label="DullG 홈"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span>DullG</span></a>
    <div className="nav-links"><a href="/#flow">수업 방식</a><a href="/#materials">제공 자료</a><a href="/#pilot">파일럿 안내</a><a href="/#apply">샘플 요청</a></div>
    <a className="nav-cta" href="/#apply">샘플·파일럿 문의 <span>↗</span></a>
  </nav>;
}

export function Footer() {
  return <footer className="footer shell"><a className="brand" href="/"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span>DullG</span></a><p>© 2026 DullG. Read the clues. Tell your story.</p><div><a href="/academy">Academy</a><a href="mailto:hello@dullg.com">Contact</a></div></footer>;
}

export function PageFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <main className={className}><Header />{children}<Footer /></main>;
}

export function Kicker({ children }: { children: ReactNode }) { return <p className="section-kicker">{children}</p>; }
export function ArrowButton({ children, light = false, href = "/academy/pilot" }: { children: ReactNode; light?: boolean; href?: string }) { return <a className={`button ${light ? "button-light" : "button-dark"}`} href={href}>{children} <span>↗</span></a>; }
