import Image from "next/image";
import Link from "next/link";
import { ArrowButton, Kicker, PageFrame } from "@/components/site";
import { SectionHead } from "@/components/section-head";
import { episodeFullTitle } from "@/lib/education";
import { pageMetadata } from "@/lib/metadata";
import { didimterResidency, riseAward } from "@/lib/recognition";
import styles from "./recognition.module.css";

export const metadata = pageMetadata("/about", {
  description:
    "머더미스터리 작품과 영어 미스터리 수업팩을 만드는 단서공방(ProjectDullG)을 소개합니다.",
});

const beliefs = [
  {
    num: "01",
    title: "머더미스터리 제작과 펀딩",
    body: "뱀이 죽은 축제를 시작으로 레드가 죽은 연구소, 미식의 대가, 의사가 너무 많아!를 텀블벅 프로젝트로 공개했습니다.",
    href: "/works",
    label: "작품과 펀딩 기록 보기",
  },
  {
    num: "02",
    title: "울릉군 생태관광 AI 교육",
    body: "2026년 7월 4일, 지역 관광 소재를 소개하는 문구와 웹페이지를 만드는 AI 실습 수업을 진행했습니다.",
    href: "/activity/ulleung-ecotourism-ai",
    label: "7월 수업 기록 보기",
  },
  {
    num: "03",
    title: "울릉고 리빙랩 특강",
    body: "2026년 9월 5일, 게임 체험과 AI 실습을 통해 울릉도 소재로 콘텐츠를 기획하는 수업을 진행했습니다.",
    href: "/activity/ulleung-high-living-lab",
    label: "9월 수업 기록 보기",
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
              머더미스터리를 만들고,
              <br />
              <em>콘텐츠 제작 수업을 진행합니다.</em>
            </>
          }
          lead="단서공방(ProjectDullG)은 추리 게임을 기획·제작하고, 게임과 AI를 활용한 교육을 진행하는 콘텐츠 제작팀입니다."
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
          <figcaption>ProjectDullG 소개 배너</figcaption>
        </figure>
        <div>
          <Kicker>ProjectDullG에서 단서공방으로</Kicker>
          <h2 id="about-brand-title">단서공방을 소개합니다.</h2>
          <p>
            한동대학교 보드게임 동아리 덜지니어스에서 시작한 팀입니다. ProjectDullG라는 이름으로
            머더미스터리 콘텐츠를 기획하고 제작해 왔으며, 지금은 단서공방이라는 이름으로 작품과 교육
            콘텐츠를 소개합니다.
          </p>
          <a
            className="about-record-link"
            href="https://www.handong.edu/kor/camplife/stu-organ/club/physical/"
            target="_blank"
            rel="noopener noreferrer"
          >
            한동대학교 덜지니어스 소개 ↗
          </a>
          <dl>
            <div>
              <dt>하는 일</dt>
              <dd>머더미스터리 콘텐츠 기획·제작</dd>
            </div>
            <div>
              <dt>교육</dt>
              <dd>게임·AI 활용 수업 · 영어 미스터리 수업팩 준비</dd>
            </div>
            <div>
              <dt>공식 명칭</dt>
              <dd>단서공방(ProjectDullG)</dd>
            </div>
            <div>
              <dt>입주 이력</dt>
              <dd>
                {didimterResidency.title}
                <br />
                <a
                  className="about-record-link"
                  href={didimterResidency.source}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  공식 입주기업 소개 ↗
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className={`shell ${styles.section}`} aria-labelledby="recognition-title">
        <div>
          <Kicker>수상 이력</Kicker>
          <h2 id="recognition-title">{riseAward.title}</h2>
          <p>{riseAward.description}</p>
        </div>
        <div>
          <dl>
            <div>
              <dt>수상일</dt>
              <dd>2025년 10월 30일</dd>
            </div>
            <div>
              <dt>참가팀</dt>
              <dd>{riseAward.team}</dd>
            </div>
            <div>
              <dt>대회 주관</dt>
              <dd>{riseAward.organizers}</dd>
            </div>
          </dl>
          <a href={riseAward.source} target="_blank" rel="noopener noreferrer">
            {riseAward.sourceLabel}에서 확인 ↗
          </a>
        </div>
      </section>

      <section className="about-scope shell">
        <SectionHead
          className="about-scope-head"
          kicker="하는 일"
          title={<>작품 제작과 교육</>}
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
          kicker="제작·교육 이력"
          title={<>작품과 수업으로 소개합니다.</>}
        />
        <div className="belief-list">
          {beliefs.map((item) => (
            <div className="belief-item" key={item.num}>
              <span className="belief-ghost" aria-hidden="true">
                {item.num}
              </span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <Link className="about-record-link" href={item.href}>
                {item.label} →
              </Link>
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
            <span>수업팩</span>
            <b>2026</b>
            <span>준비 중</span>
          </div>
        </div>
      </section>
    </PageFrame>
  );
}
