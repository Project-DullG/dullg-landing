import Image from "next/image";
import { ArrowButton, Kicker, PageFrame } from "@/components/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("/academy/sample", { title: "수업 자료 미리보기" });

export default function SamplePage() {
  return (
    <PageFrame>
      <section className="inner-hero shell">
        <Kicker>수업용 시제품 · CASE FILE 01</Kicker>
        <h1>
          어떤 자료를 받고,
          <br />
          <em>어떻게 쓰는지 살펴보세요.</em>
        </h1>
        <p>
          첫 영어 수업 제품의 골든 샘플로 검토 중인 단서 카드와 교사용
          진행안입니다. 정식 제공본은 파일럿 결과에 따라 조정될 수 있습니다.
        </p>
      </section>

      <section className="sample-grid shell">
        <article className="sample-card sample-clue">
          <Image
            src="/assets/dullg/card-cover-1.png"
            alt="윤지원 단서 카드 표지"
            width={408}
            height={650}
            sizes="(max-width: 760px) 100vw, 33vw"
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
          <Image
            src="/assets/dullg/card-body-1.png"
            alt="실제 단서 카드 내용"
            width={408}
            height={650}
            sizes="(max-width: 760px) 100vw, 33vw"
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
          <Image
            src="/assets/dullg/rulebook-flow.png"
            alt="룰북의 게임 흐름 안내 페이지"
            width={944}
            height={1330}
            sizes="(max-width: 760px) 100vw, 33vw"
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
          <Kicker>실제 제작 자료</Kicker>
          <h2>
            수업에서 사용하는
            <br />
            <span>사건 자료와 규칙서.</span>
          </h2>
          <p>연출 이미지 대신 현재 제작된 시제품을 그대로 보여드립니다.</p>
        </div>
        <div className="gallery-images">
          <figure>
            <Image
              src="/assets/dullg/mat-story-book.webp"
              alt="보충반의 사라진 열쇠 사건 자료 시제품"
              width={1448}
              height={1086}
              sizes="(max-width: 760px) 100vw, 50vw"
            />
            <figcaption>제작 완료 · 사건 자료 시제품</figcaption>
          </figure>
          <figure>
            <Image
              src="/assets/dullg/mat-rulebook.webp"
              alt="진행 순서와 규칙이 담긴 수업 규칙서 시제품"
              width={1536}
              height={1024}
              sizes="(max-width: 760px) 100vw, 50vw"
            />
            <figcaption>제작 완료 · 수업 규칙서 시제품</figcaption>
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
        <ArrowButton href="/#apply">무료 검토팩 요청</ArrowButton>
      </section>
    </PageFrame>
  );
}
