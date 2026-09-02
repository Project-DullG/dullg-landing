import { ArrowLeft, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { Kicker, PageFrame } from "@/components/site";

export const metadata: Metadata = {
  title: "울릉고 리빙랩 특강 · 단서공방",
  description: "2026년 9월 5일 울릉고 리빙랩 특강과 공개 수업 자료를 안내합니다.",
  alternates: { canonical: "/activity/ulleung-high-living-lab" },
};

export default function UlleungHighLivingLabPage() {
  return <PageFrame>
    <article className="activity-case">
      <header className="activity-case-hero shell">
        <div><Kicker>교육 활동 · 2026년 9월 5일</Kicker><h1>울릉고<br /><em>리빙랩 특강</em></h1></div>
        <div><p>울릉도의 자원과 생활 속 문제를 살펴보고, 이를 게임 기획 활동으로 구체화하는 수업 자료를 준비했습니다.</p><dl><div><dt>기관</dt><dd>울릉고등학교</dd></div><div><dt>일정</dt><dd>2026년 9월 5일</dd></div><div><dt>자료</dt><dd>발표자료 PDF · 13쪽</dd></div></dl></div>
      </header>

      <section className="activity-case-material">
        <div className="shell">
          <div><Kicker>공개 자료</Kicker><h2>수업 발표자료</h2><p>수업에서 사용한 발표자료를 PDF로 확인할 수 있습니다. 이 자료는 울릉군 생태관광 AI 교육과 별개의 수업 자료입니다.</p></div>
          <a href="/assets/materials/ulleung-high-living-lab-2026.pdf" download><span><small>PDF · 13쪽</small><strong>울릉고 리빙랩 특강 자료</strong></span><DownloadSimple size={22} weight="bold" aria-hidden="true" /></a>
        </div>
      </section>

      <nav className="activity-case-nav shell" aria-label="활동 기록 이동"><Link href="/activity"><ArrowLeft size={18} weight="bold" aria-hidden="true" /> 제작·활동 기록으로 돌아가기</Link><Link href="/materials">수강생 자료실 보기</Link></nav>
    </article>
  </PageFrame>;
}
