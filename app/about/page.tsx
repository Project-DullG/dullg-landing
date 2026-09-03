import Image from "next/image";
import Link from "next/link";
import { ArrowButton, Kicker, PageFrame } from "@/components/site";
import { SectionHead } from "@/components/section-head";
import { episodeFullTitle } from "@/lib/education";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("/about", {
  description:
    "머더미스터리 작품과 영어 미스터리 수업팩을 만드는 단서공방(ProjectDullG)을 소개합니다.",
});

const beliefs = [
  {
    num: "01",
    title: "설정보다 행동이 먼저 보여야 합니다",
    body: "인물의 설명을 길게 늘어놓지 않습니다. 플레이어가 선택하고 질문하는 과정에서 성격과 관계를 알 수 있게 만듭니다.",
  },
  {
    num: "02",
    title: "단서에는 쓰임이 있어야 합니다",
    body: "분위기만 만드는 정보는 줄입니다. 각 단서가 질문, 추론 또는 최종 판단으로 이어지는지 확인합니다.",
  },
  {
    num: "03",
    title: "완성 상태를 분명하게 밝힙니다",
    body: "출시한 작품, 진행 중인 펀딩과 검토 중인 수업팩을 구분합니다. 계획을 이미 완성한 결과처럼 소개하지 않습니다.",
  },
];

const projectTracks = [
  {
    status: "01",
    title: "머더미스터리 작품",
    body: "인물마다 다른 정보와 목적을 가진 이야기를 실물 게임과 디지털 작품으로 만듭니다.",
  },
  {
    status: "02",
    title: "영어 미스터리 수업팩",
    body: "영어 단서를 읽고 질문한 뒤 근거를 글로 정리하는 4차시 수업 자료를 준비하고 있습니다.",
  },
  {
    status: "03",
    title: "교육·지역 콘텐츠 확장",
    body: "지역의 이야기와 교육 주제를 게임 기획 활동으로 연결하는 수업을 진행합니다.",
  },
];

export default function AboutPage() {
  return (
    <PageFrame>
      {/* ── HERO — split with decorative manifesto ── */}
      <section className="about-hero shell">
        <SectionHead
          as="h1"
          className="about-hero-copy"
          kicker="단서공방 소개"
          title={
            <>
              플레이 뒤에도
              <br />
              <em>기억에 남는 이야기를 만듭니다.</em>
            </>
          }
          lead="단서공방(ProjectDullG)은 머더미스터리 작품을 만들고 있습니다. 현재는 이 제작 방식을 활용한 영어 미스터리 수업팩도 준비하고 있습니다."
        />
      </section>

      <section className="about-brand shell" aria-labelledby="about-brand-title">
        <figure>
          <Image
            src="/assets/brand/project-dullg-banner-top.webp"
            width={1701}
            height={2835}
            alt="단서공방의 이전 프로젝트 덜지 소개 배너 상단"
            sizes="(max-width: 760px) 82vw, 32vw"
            priority
          />
          <figcaption>단서공방 소개 배너 · 제공 자료</figcaption>
        </figure>
        <div>
          <Kicker>ProjectDullG에서 단서공방으로</Kicker>
          <h2 id="about-brand-title">
            플레이 뒤에도 기억에 남는
            <br />
            이야기를 만듭니다.
          </h2>
          <p>
            ProjectDullG라는 이름으로 시작해 머더미스터리 콘텐츠를 기획하고 제작해 왔습니다. 지금은
            한글 이름인 단서공방을 함께 사용하며 작품과 교육 콘텐츠를 소개합니다.
          </p>
          <dl>
            <div>
              <dt>하는 일</dt>
              <dd>머더미스터리 콘텐츠 기획·제작</dd>
            </div>
            <div>
              <dt>교육</dt>
              <dd>프로젝트 수업용 실물 교육 키트</dd>
            </div>
            <div>
              <dt>공식 명칭</dt>
              <dd>단서공방(ProjectDullG)</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="about-scope shell">
        <SectionHead
          className="about-scope-head"
          kicker="하는 일"
          title={
            <>
              이야기의 쓰임에 따라
              <br />
              <em>형태를 다르게 만듭니다.</em>
            </>
          }
          lead="직접 플레이하는 작품, 교실에서 사용하는 수업팩과 지역 소재를 활용한 교육 프로그램을 각각의 목적에 맞춰 제작합니다."
        />
        <div className="about-scope-grid">
          {projectTracks.map((track) => (
            <article key={track.title}>
              <span>{track.status}</span>
              <h3>{track.title}</h3>
              <p>{track.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── BELIEFS — ghost number cards ── */}
      <section className="about-beliefs shell">
        <SectionHead
          className="about-beliefs-head"
          kicker="제작 원칙"
          title={
            <>
              공개하는 모든 작업의
              <br />
              <em>세 가지 기준</em>
            </>
          }
        />
        <div className="belief-list">
          {beliefs.map((item) => (
            <div className="belief-item" key={item.num}>
              <span className="belief-ghost" aria-hidden="true">
                {item.num}
              </span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── NOW — dark section ── */}
      <section className="about-now-dark">
        <div className="shell about-now-inner">
          <div className="about-now-copy">
            <Kicker>현재 단계</Kicker>
            <h2>
              첫 수업용 시제품과
              <br />
              파일럿을 준비하고 있습니다.
            </h2>
            <p>
              현재 중심은 첫 번째 에피소드 <em>{episodeFullTitle}</em>를 초6 수준에서 검토할 수 있는
              영어학원용 4차시 수업 시제품으로 다듬는 일입니다.
            </p>
            <p>
              아직 정식 출시 전 단계입니다. 검토용 샘플을 먼저 공개하고, 파일럿에서는 운영 가능성과
              학생 결과물을 확인할 예정입니다.
            </p>
            <div className="about-now-actions">
              <ArrowButton light>무료 검토팩 요청</ArrowButton>
              <Link className="text-link-light" href="/activity">
                활동 기록 보기 →
              </Link>
            </div>
          </div>
          <div className="about-now-badge" aria-hidden="true">
            <span>PILOT</span>
            <b>2026</b>
            <span>OPEN</span>
          </div>
        </div>
      </section>
    </PageFrame>
  );
}
