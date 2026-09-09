import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import Image from "next/image";
import { Kicker, PageFrame } from "@/components/site";
import { SectionHead } from "@/components/section-head";
import { PageIntro } from "@/components/page-intro";
import { fundingSummaryPeriod, getFundingProject, getFundingStatus } from "@/lib/funding";
import { pageMetadata } from "@/lib/metadata";
import { currentWorks, getWorkStatus, publishedWorks } from "@/lib/works";

export const metadata = pageMetadata("/works", { title: "작품과 펀딩" });

export const revalidate = 3600;

export default function WorksPage() {
  const currentFunding = getFundingProject("projectdg2");
  const live = getFundingStatus(currentFunding) === "진행 중";
  const fundingArchive = [
    getFundingProject("projectdg0"),
    getFundingProject("projectdg1"),
    ...(live ? [] : [currentFunding]),
  ];
  return (
    <PageFrame>
      <PageIntro
        title="머더미스터리 작품"
        description="작품별 줄거리와 인원·시간, 공식 공개 기록을 확인하세요."
      >
        <a href="#work-list-title">작품 목록</a>
        <a href="#funding-archive-title">펀딩 기록</a>
      </PageIntro>

      {live && (
        <section className="live-funding" aria-labelledby="live-funding-title">
          <div className="shell">
            <div className="live-funding-head">
              <div>
                <Kicker>현재 펀딩 중</Kicker>
                <h2 id="live-funding-title">새 작품 2편</h2>
              </div>
              <div>
                <b>{currentFunding.endsOn.replaceAll("-", ".")}까지</b>
                <a href={currentFunding.url} target="_blank" rel="noopener noreferrer">
                  텀블벅 프로젝트 보기 <ArrowUpRight size={16} weight="bold" aria-hidden="true" />
                </a>
              </div>
            </div>
            <div className="live-work-list">
              {currentWorks().map((work) => (
                <article key={work.slug}>
                  <Link href={`/works/${work.slug}`} aria-label={`${work.title} 상세 보기`}>
                    <Image
                      src={work.image}
                      width={1000}
                      height={1000}
                      alt={work.alt}
                      sizes="(max-width: 760px) 100vw, 34vw"
                    />
                  </Link>
                  <div>
                    <small>
                      {work.players} · {work.duration}
                    </small>
                    <h3>{work.title}</h3>
                    <p>{work.synopsis}</p>
                    <Link href={`/works/${work.slug}`}>
                      작품 자세히 보기 <ArrowRight size={16} weight="bold" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
            <div className="live-funding-stats">
              <span>
                <small>확인한 모인 금액</small>
                <strong>{currentFunding.amount}</strong>
              </span>
              <span>
                <small>후원자</small>
                <strong>{currentFunding.backers}</strong>
              </span>
              <span>
                <small>달성률</small>
                <strong>{currentFunding.achievement}</strong>
              </span>
              <p>{currentFunding.checkedAt} 텀블벅 공개 페이지 확인 기준입니다.</p>
            </div>
          </div>
        </section>
      )}

      <section className="work-ledger shell" aria-labelledby="work-list-title">
        <SectionHead className="work-ledger-head" id="work-list-title" title="작품 목록" />
        <div className="portfolio-list">
          {publishedWorks().map((work) => (
            <article key={work.slug}>
              <figure>
                <Link href={`/works/${work.slug}`} aria-label={`${work.title} 상세 보기`}>
                  <Image
                    src={work.image}
                    width={1000}
                    height={1000}
                    alt={work.alt}
                    sizes="(max-width: 600px) 100vw, 240px"
                  />
                </Link>
              </figure>
              <div>
                <span>{getWorkStatus(work)}</span>
                <h3>{work.title}</h3>
                <b>
                  {work.players} · {work.duration} · {work.platform}
                </b>
                <p>{work.synopsis}</p>
                <Link href={`/works/${work.slug}`}>
                  작품 자세히 보기 <ArrowRight size={16} weight="bold" aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="funding-archive shell" aria-labelledby="funding-archive-title">
        {/* keeps a grid-item box; see SectionHead */}
        <SectionHead
          className="funding-archive-head"
          id="funding-archive-title"
          title="펀딩 기록"
        />
        <div className="funding-archive-list">
          {fundingArchive.map((project) => (
            <a href={project.url} target="_blank" rel="noopener noreferrer" key={project.id}>
              <span>{fundingSummaryPeriod(project)}</span>
              <strong>{project.title}</strong>
              <b>
                {project.amount} · {project.backers} · {project.achievement}
              </b>
              <i>보기 ↗</i>
            </a>
          ))}
          <p>금액과 후원자 수는 각 텀블벅 프로젝트의 종료 시점 기준입니다.</p>
        </div>
      </section>
    </PageFrame>
  );
}
