import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Kicker, PageFrame } from "@/components/site";
import { getFundingProject } from "@/lib/funding";
import { currentWorks, publishedWorks } from "@/lib/works";

export const metadata: Metadata = {
  title: "작품과 펀딩 · 단서공방",
  description: "단서공방(ProjectDullG)이 공개한 머더미스터리 작품과 텀블벅 펀딩 기록을 소개합니다.",
};

export default function WorksPage() {
  const currentFunding = getFundingProject("projectdg2");
  const fundingArchive = [getFundingProject("projectdg0"), getFundingProject("projectdg1")];
  return <PageFrame>
    <section className="works-hero shell">
      <div><Kicker>작품과 기록</Kicker><h1>단서공방이 만든<br />머더미스터리</h1></div>
      <p>공개된 작품의 줄거리와 플레이 정보를 한 편씩 소개합니다. 작품을 선택하면 상세 정보와 공식 기록을 확인할 수 있습니다.</p>
    </section>

    <section className="live-funding" aria-labelledby="live-funding-title"><div className="shell">
      <div className="live-funding-head">
        <div><Kicker>현재 펀딩 중</Kicker><h2 id="live-funding-title">새로 공개한<br />두 편의 이야기</h2></div>
        <div><b>{currentFunding.period}</b><p>{currentFunding.checkedAt} 확인 · 펀딩 중 수치는 변동될 수 있습니다.</p><a href={currentFunding.url} target="_blank" rel="noreferrer">텀블벅 프로젝트 보기 <ArrowUpRight size={16} weight="bold" aria-hidden="true" /></a></div>
      </div>
      <div className="live-work-list">
        {currentWorks.map(work => <article key={work.slug}>
          <Link href={`/works/${work.slug}`} aria-label={`${work.title} 상세 보기`}><Image src={work.image} width={1000} height={1000} alt={work.alt} sizes="(max-width: 760px) 100vw, 34vw" /></Link>
          <div><small>{work.players} · {work.duration}</small><h3>{work.title}</h3><p>{work.synopsis}</p><Link href={`/works/${work.slug}`}>작품 자세히 보기 <ArrowRight size={16} weight="bold" aria-hidden="true" /></Link></div>
        </article>)}
      </div>
      <div className="live-funding-stats"><span><small>확인한 모인 금액</small><strong>{currentFunding.amount}</strong></span><span><small>후원자</small><strong>{currentFunding.backers}</strong></span><span><small>달성률</small><strong>{currentFunding.achievement}</strong></span><p>{currentFunding.checkedAt} 텀블벅 공개 페이지 확인 기준입니다.</p></div>
    </div></section>

    <section className="work-ledger shell" aria-labelledby="work-list-title">
      <div className="work-ledger-head"><Kicker>포트폴리오</Kicker><h2 id="work-list-title">작품마다 다른 세계와 사건</h2><p>이미지를 선택하면 작품별 상세 페이지로 이동합니다.</p></div>
      <div className="portfolio-list">{publishedWorks.map((work,index)=><article key={work.slug}>
        <figure><Link href={`/works/${work.slug}`} aria-label={`${work.title} 상세 보기`}><Image src={work.image} width={1000} height={1000} alt={work.alt} sizes="(max-width: 760px) 100vw, 42vw" /></Link></figure>
        <div><span>{String(index+1).padStart(2,"0")} · {work.status}</span><h3>{work.title}</h3><b>{work.players} · {work.duration} · {work.platform}</b><p>{work.synopsis}</p><Link href={`/works/${work.slug}`}>작품 자세히 보기 <ArrowRight size={16} weight="bold" aria-hidden="true" /></Link></div>
      </article>)}</div>
    </section>

    <section className="funding-archive shell" aria-labelledby="funding-archive-title">
      <div><Kicker>지난 펀딩</Kicker><h2 id="funding-archive-title">프로젝트 기록</h2></div>
      <div className="funding-archive-list">
        {fundingArchive.map(project => <a href={project.url} target="_blank" rel="noreferrer" key={project.id}><span>{project.period}</span><strong>{project.title}</strong><b>{project.amount} · {project.backers} · {project.achievement}</b><i>보기 ↗</i></a>)}
        <p>금액과 후원자 수는 각 텀블벅 프로젝트의 종료 시점 기준입니다.</p>
      </div>
    </section>
  </PageFrame>;
}
