import { ArrowLeft, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Kicker, PageFrame } from "@/components/site";
import { pageMetadata } from "@/lib/metadata";
import { ulleungPresentation } from "@/lib/presentations";

export const metadata = pageMetadata("/activity/ulleung-high-living-lab", {
  description: "2026년 9월 5일 울릉고 리빙랩 특강과 공개 수업 자료를 안내합니다.",
});

export default function UlleungHighLivingLabPage() {
  return (
    <PageFrame>
      <article className="activity-case">
        <header className="activity-case-hero shell">
          <div>
            <Kicker>교육 활동 · 2026년 9월 5일</Kicker>
            <h1>
              울릉고
              <br />
              <em>리빙랩 특강</em>
            </h1>
          </div>
          <div>
            <p>
              울릉도에서 해보고 싶은 일을 나누고, 게임 체험과 AI 실습을 거쳐 한 줄 기획안을 작성하는
              수업 자료입니다.
            </p>
            <dl>
              <div>
                <dt>기관</dt>
                <dd>울릉고등학교</dd>
              </div>
              <div>
                <dt>일정</dt>
                <dd>2026년 9월 5일</dd>
              </div>
              <div>
                <dt>자료</dt>
                <dd>웹 열람 · PDF · {ulleungPresentation.slides.length}쪽</dd>
              </div>
            </dl>
          </div>
        </header>

        <section className="activity-case-material">
          <div className="shell">
            <div>
              <Kicker>공개 자료</Kicker>
              <h2>수업 발표자료</h2>
              <p>
                발표자료를 다운로드 없이 웹에서 바로 볼 수 있습니다. 이 자료는 울릉군 생태관광 AI
                교육과 별개의 수업 자료입니다.
              </p>
            </div>
            <div>
              <Link href={ulleungPresentation.href}>
                <span>
                  <small>
                    {ulleungPresentation.slides.length}쪽 · {ulleungPresentation.updatedAt} 보강
                  </small>
                  <strong>발표자료 웹에서 보기 →</strong>
                </span>
              </Link>
              <a href={ulleungPresentation.pdf} download>
                <span>
                  <strong>PDF 다운로드</strong>
                </span>
                <DownloadSimple size={22} weight="bold" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <nav className="activity-case-nav shell" aria-label="활동 기록 이동">
          <Link href="/activity">
            <ArrowLeft size={18} weight="bold" aria-hidden="true" /> 제작·활동 기록으로 돌아가기
          </Link>
          <Link href="/materials">수강생 자료실 보기</Link>
        </nav>
      </article>
    </PageFrame>
  );
}
