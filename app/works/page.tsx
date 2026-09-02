import type { Metadata } from "next";
import Link from "next/link";
import { Kicker, PageFrame } from "@/components/site";

export const metadata: Metadata = {
  title: "작품과 펀딩 · 단서공방",
  description: "단서공방(ProjectDullG)이 만든 추리·교육 콘텐츠와 공개 가능한 펀딩 기록을 소개합니다.",
};

export default function WorksPage() {
  return (
    <PageFrame>
      <section className="works-hero shell">
        <div>
          <Kicker>작품과 기록</Kicker>
          <h1>단서에서 시작해,<br />하나의 경험으로.</h1>
        </div>
        <p>단서공방은 이야기를 읽고 서로의 근거를 비교하며 결론을 만드는 콘텐츠를 제작합니다. 완성된 자료와 준비 중인 계획을 구분해 소개합니다.</p>
      </section>

      <section className="featured-work shell">
        <figure>
          <img src="/assets/dullg/mat-story-book.webp" width="1536" height="1024" alt="보충반의 사라진 열쇠 스토리북 시제품" />
          <figcaption>현재 제작 완료 · 영어 미스터리 수업팩 시제품</figcaption>
        </figure>
        <div>
          <span>첫 번째 교육 작품</span>
          <h2>보충반의<br />사라진 열쇠</h2>
          <p>학생이 사건 속 영어 단서를 읽고 질문하며, 팀의 판단을 근거와 함께 보고서로 남기는 4차시 수업팩입니다.</p>
          <dl>
            <div><dt>현재 상태</dt><dd>시제품 제작 완료 · 파일럿 준비 중</dd></div>
            <div><dt>구성</dt><dd>스토리북 · 단서 카드 · 워크북 · 교사용 진행안</dd></div>
          </dl>
          <Link href="/episode">작품 상세 보기 →</Link>
        </div>
      </section>

      <section className="funding-record shell">
        <div>
          <Kicker>텀블벅 펀딩 작품</Kicker>
          <h2>공식 기록을 확인한 뒤<br />정확하게 공개하겠습니다.</h2>
        </div>
        <div>
          <p>펀딩 작품의 제목, 대표 이미지, 진행 기간, 공식 링크와 결과 자료를 확인해 이곳에 정리할 예정입니다. 현재 확인되지 않은 수치나 성과는 임의로 표시하지 않습니다.</p>
          <a href="mailto:cluedullg@gmail.com">작품 자료 전달하기 →</a>
        </div>
      </section>
    </PageFrame>
  );
}
