import Image from "next/image";
import Link from "next/link";
import { Kicker, PageFrame } from "@/components/site";
import { SectionHead } from "@/components/section-head";
import { ClueProcess } from "@/components/clue-process";
import { PageIntro } from "@/components/page-intro";
import { pageMetadata } from "@/lib/metadata";
import { didimterResidency, riseAward } from "@/lib/recognition";
import styles from "./recognition.module.css";

export const metadata = pageMetadata("/about");

export default function AboutPage() {
  return (
    <PageFrame>
      <PageIntro
        title="공방 소개"
        description="단서공방(ProjectDullG)은 머더미스터리를 제작하고 게임·AI 활용 수업을 진행하는 팀입니다."
      />

      <section id="team-history" className="about-brand shell" aria-labelledby="about-brand-title">
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
          <h2 id="about-brand-title">덜지니어스에서 시작한 제작팀</h2>
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

      <section id="process" className="brand-method shell" aria-labelledby="brand-method-title">
        <SectionHead
          className="brand-method-head"
          id="brand-method-title"
          kicker="제작 과정"
          title={<>사건 설계부터 플레이테스트까지</>}
          lead="인물별 정보와 사건의 결말을 정하고, 플레이하면서 단서가 드러나는 순서를 확인합니다."
        />
        <ClueProcess />
      </section>

      <section className={`shell ${styles.related}`} aria-label="작품과 교육 더 보기">
        <div>
          <h2>작품과 교육 살펴보기</h2>
          <p>영어 미스터리 수업팩은 정식 출시 전입니다.</p>
        </div>
        <div>
          <Link href="/works">작품 보기 →</Link>
          <Link href="/activity">활동 기록 보기 →</Link>
          <Link href="/academy">영어 미스터리 수업팩 →</Link>
        </div>
      </section>
    </PageFrame>
  );
}
