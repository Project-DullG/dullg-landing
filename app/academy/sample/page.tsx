import type { Metadata } from "next";
import { ArrowButton, Kicker, PageFrame } from "@/components/site";

export const metadata: Metadata = {
  title: "실제 수업 자료 · DullG",
  description:
    "DullG 학생용 단서 카드, 교사용 진행안과 무료 검토팩 구성을 확인하세요.",
};

export default function SamplePage() {
  return (
    <PageFrame>
      <section className="inner-hero shell">
        <Kicker>실제 제공 자료 · CASE FILE 01</Kicker>
        <h1>
          어떤 자료를 받고,
          <br />
          <em>어떻게 쓰는지 살펴보세요.</em>
        </h1>
        <p>
          실제 1회차 단서 카드와 교사용 진행안입니다. 학생은 읽고 비교해
          기록하고, 교사는 안내된 순서에 따라 수업을 진행합니다.
        </p>
      </section>

      <section className="sample-grid shell">
        <article className="sample-card sample-clue">
          <img
            src="/assets/dullg/card-cover-1.png"
            alt="윤지원 단서 카드 표지"
            loading="lazy"
          />
          <div>
            <span className="sample-label">ITEM CARD / 01</span>
            <h2>
              학생이 처음 받는
              <br />
              <em>단서 카드</em>
            </h2>
          </div>
        </article>
        <article className="sample-card sample-workbook">
          <img
            src="/assets/dullg/card-body-1.png"
            alt="실제 단서 카드 내용"
            loading="lazy"
          />
          <div>
            <span className="sample-label">EVIDENCE / READ</span>
            <h2>
              읽고 비교하는
              <br />
              <em>실제 단서</em>
            </h2>
          </div>
        </article>
        <article className="sample-card sample-report">
          <img
            src="/assets/dullg/rulebook-flow.png"
            alt="룰북의 게임 흐름 안내 페이지"
            loading="lazy"
          />
          <div>
            <span className="sample-label">GUIDE / PLAY FLOW</span>
            <h2>
              교사가 따라가는
              <br />
              <em>수업 진행안</em>
            </h2>
          </div>
        </article>
      </section>

      <section className="sample-gallery shell">
        <div>
          <Kicker>자료가 쓰이는 장면</Kicker>
          <h2>
            사건을 이해하는
            <br />
            <span>교실과 자료.</span>
          </h2>
          <p>교실의 분위기와 실제 활동 자료가 한 장면 안에서 연결됩니다.</p>
        </div>
        <div className="gallery-images">
          <figure>
            <img
              src="/assets/dullg/classroom-case.png"
              alt="잠긴 보관함과 단서 자료가 놓인 밝은 교실"
              loading="lazy"
            />
            <figcaption>사건이 시작되는 교실</figcaption>
          </figure>
          <figure>
            <img
              src="/assets/dullg/students-investigation.png"
              alt="학생들이 단서와 평면도를 함께 살펴보는 장면"
              loading="lazy"
            />
            <figcaption>단서를 함께 읽는 시간</figcaption>
          </figure>
        </div>
      </section>

      <section className="sample-bottom shell">
        <div>
          <Kicker>무료 검토팩 구성</Kicker>
          <h2>
            도입 전에 확인할
            <br />
            <span>핵심 자료.</span>
          </h2>
        </div>
        <ul>
          <li>원장 검토팩 1p</li>
          <li>4차시 커리큘럼</li>
          <li>1회차 학생용 단서 카드</li>
          <li>교사용 진행안 샘플</li>
          <li>수업 운영 체크리스트</li>
        </ul>
        <ArrowButton href="/#apply">무료 샘플 받아보기</ArrowButton>
      </section>
    </PageFrame>
  );
}
