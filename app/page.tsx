import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import Image from "next/image";
import { ClueProcess } from "@/components/clue-process";
import { Footer, Header, Kicker } from "@/components/site";
import { SectionHead } from "@/components/section-head";
import { educationFacts } from "@/lib/education";
import { pageMetadata } from "@/lib/metadata";
import { getWorkStatus, homeFeaturedWorks } from "@/lib/works";
import { activityRecords, formatActivityDate } from "@/lib/activities";
import activityStyles from "@/components/home-activities.module.css";
import { DashboardPreview } from "@/components/dashboard-preview";
import toolsStyles from "./home-tools.module.css";
import { HomeMiniProjects } from "@/components/mini-games/home-projects";

export const metadata = pageMetadata("/", {
  absoluteTitle: "단서공방 | 머더미스터리 제작과 게임·AI 교육",
});

export const revalidate = 3600;

export default function Home() {
  return (
    <>
      <Header />

      <main className="brand-home" id="main-content">
        <section className="brand-hero shell" aria-labelledby="home-title">
          <SectionHead
            as="h1"
            id="home-title"
            kicker="단서공방 · ProjectDullG"
            title={
              <>
                이야기를 만들고,
                <br />
                <em>단서를 엮습니다.</em>
              </>
            }
            lead="단서공방은 머더미스터리 작품을 만들고, 게임과 AI를 활용한 콘텐츠 제작 수업을 진행합니다."
          />
          <div className="brand-hero-actions">
            <Link className="button button-dark" href="/works">
              작품 보기 <ArrowRight size={17} weight="bold" aria-hidden="true" />
            </Link>
            <Link href="/about">
              단서공방 소개 <ArrowRight size={17} weight="bold" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="brand-works shell" aria-labelledby="brand-works-title">
          <div className="brand-section-head">
            <div>
              <Kicker>작품</Kicker>
              <h2 id="brand-works-title">공개한 머더미스터리</h2>
            </div>
            <Link href="/works">
              모든 작품과 펀딩 기록 <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="brand-work-grid">
            {homeFeaturedWorks.map((work) => (
              <Link href={`/works/${work.slug}`} key={work.slug}>
                <Image
                  src={work.image}
                  width={1000}
                  height={1000}
                  alt={work.alt}
                  sizes="(max-width: 760px) 100vw, 33vw"
                />
                <span>
                  {getWorkStatus(work)} · {work.players} · {work.duration}
                </span>
                <h3>{work.title}</h3>
              </Link>
            ))}
          </div>
        </section>

        <HomeMiniProjects />

        <section className={`shell ${activityStyles.section}`} aria-labelledby="home-activity-title">
          <div className="brand-section-head">
            <div>
              <Kicker>활동 기록</Kicker>
              <h2 id="home-activity-title">최근 교육 현장</h2>
            </div>
            <Link href="/activity">
              제작·활동 기록 전체 보기 <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <div className={activityStyles.grid}>
            {activityRecords.filter((record) => record.type === "교육" && record.image).slice(0, 2).map((record) => (
              <Link className={activityStyles.item} href={record.href} key={record.href}>
                <Image
                  src={record.image!.src}
                  alt={record.image!.alt}
                  width={1448}
                  height={1086}
                  sizes="(max-width: 760px) 100vw, 50vw"
                />
                <time dateTime={record.date}>{formatActivityDate(record)} · {record.type}</time>
                <h3>{record.title}</h3>
                <span>수업 내용과 현장 사진 <ArrowRight size={17} aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="brand-method shell" aria-labelledby="brand-method-title">
          <SectionHead
            className="brand-method-head"
            id="brand-method-title"
            kicker="만드는 방식"
            title={
              <>
                이야기와 단서가
                <br />
                함께 작동하게 만듭니다.
              </>
            }
            lead="사건의 설정만 만드는 데서 멈추지 않습니다. 플레이어가 읽고, 의심하고, 판단하는 순서까지 설계합니다."
          />
          <ClueProcess />
        </section>

        <section className="brand-education" aria-labelledby="brand-education-title">
          <div className="shell brand-education-grid">
            <figure className="brand-education-cards">
              <Image
                src="/assets/dullg/card-cover-1.png"
                width={408}
                height={650}
                alt="윤지원 소지품 카드 앞면"
                sizes="(max-width: 760px) 45vw, 22vw"
              />
              <Image
                src="/assets/dullg/card-body-1.png"
                width={408}
                height={650}
                alt="윤지원 소지품 카드 뒷면의 영어 단서"
                sizes="(max-width: 760px) 45vw, 22vw"
              />
            </figure>
            <div>
              <Kicker>준비 중 · 영어 미스터리 수업팩</Kicker>
              <h2 id="brand-education-title">
                영어 단서를 읽고
                <br />
                사건을 해결하는 수업
              </h2>
              <p>
                학생마다 다른 단서를 읽고 서로 질문합니다. 마지막에는 선택한 근거와 판단을 영어
                사건보고서로 정리합니다.
              </p>
              <dl>
                {educationFacts.map(([value, label]) => (
                  <div key={value}>
                    <dt>{value}</dt>
                    <dd>{label}</dd>
                  </div>
                ))}
              </dl>
              <p className="brand-education-tools">
                학원생·반·성적을 정리하는 <Link href="/academy#tools">운영 도구</Link>가 함께
                제공됩니다.
              </p>
              <Link href="/academy">
                수업팩 자세히 보기 <ArrowRight size={17} weight="bold" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className={`shell ${toolsStyles.section}`} aria-labelledby="home-tools-title">
          <div className={toolsStyles.copy}>
            <Kicker>학원 관리 체험</Kicker>
            <h2 id="home-tools-title">반별 조회부터<br />점수 입력까지</h2>
            <p>가상 학생 데이터로 관리 화면을 살펴보세요. 반을 선택하고 점수를 바꾸면 평균에 바로 반영됩니다.</p>
            <Link className="button button-dark" href="/demo">
              로그인 없이 체험하기 <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <span>예시 데이터만 사용하며 변경 내용은 저장되지 않습니다.</span>
            <Link className={toolsStyles.login} href="/login">이미 계정이 있다면 로그인 →</Link>
          </div>
          <DashboardPreview />
        </section>

        <section className="brand-contact" id="apply" aria-labelledby="brand-contact-title">
          <div className="shell brand-contact-inner">
            <div>
              <Kicker>작품·교육·협업 문의</Kicker>
              <h2 id="brand-contact-title">
                함께 만들고 싶은
                <br />
                프로젝트가 있나요?
              </h2>
            </div>
            <div>
              <p>
                작품 제작과 교육 협업에 관해 문의해 주세요. 영어 미스터리 수업팩이 궁금하다면
                무료 검토팩을 먼저 확인할 수 있습니다.
              </p>
              <div className="brand-hero-actions">
                <Link className="button button-dark" href="/contact">
                  프로젝트 문의 <ArrowRight size={17} weight="bold" aria-hidden="true" />
                </Link>
                <Link href="/academy/pilot">
                  수업팩 검토 요청 <ArrowRight size={17} weight="bold" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
