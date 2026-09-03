import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import Image from "next/image";
import { ClueProcess } from "@/components/clue-process";
import { Footer, Header, Kicker } from "@/components/site";
import { educationFacts } from "@/lib/education";
import { pageMetadata } from "@/lib/metadata";
import { getWorkStatus, homeFeaturedWorks } from "@/lib/works";

export const metadata = pageMetadata("/", { absoluteTitle: "단서공방 | 영어 미스터리 수업과 추리 콘텐츠" });

export const revalidate = 3600;

export default function Home() {
  return (
    <>
      <Header />

      <main className="brand-home" id="main-content">
        <section className="brand-hero shell" aria-labelledby="home-title">
          <Kicker>단서공방 · ProjectDullG</Kicker>
          <h1 id="home-title">이야기를 만들고,<br /><em>단서를 엮습니다.</em></h1>
          <p>단서공방은 머더미스터리 작품을 만들고, 영어로 읽고 토론하는 미스터리 수업팩을 준비합니다.</p>
          <div className="brand-hero-actions">
            <Link className="button button-dark" href="/works">작품 보기 <ArrowRight size={17} weight="bold" aria-hidden="true" /></Link>
            <Link href="/academy">교육 수업팩 보기 <ArrowRight size={17} weight="bold" aria-hidden="true" /></Link>
          </div>
        </section>

        <section className="brand-works shell" aria-labelledby="brand-works-title">
          <div className="brand-section-head">
            <div><Kicker>작품</Kicker><h2 id="brand-works-title">공개한 머더미스터리</h2></div>
            <Link href="/works">모든 작품과 펀딩 기록 <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </div>
          <div className="brand-work-grid">{homeFeaturedWorks.map(work => <Link href={`/works/${work.slug}`} key={work.slug}>
            <Image src={work.image} width={1000} height={1000} alt={work.alt} sizes="(max-width: 760px) 100vw, 33vw" />
            <span>{getWorkStatus(work)} · {work.players} · {work.duration}</span><h3>{work.title}</h3>
          </Link>)}</div>
        </section>

        <section className="brand-method shell" aria-labelledby="brand-method-title">
          <div className="brand-method-head">
            <Kicker>만드는 방식</Kicker>
            <h2 id="brand-method-title">이야기와 단서가<br />함께 작동하게 만듭니다.</h2>
            <p>사건의 설정만 만드는 데서 멈추지 않습니다. 플레이어가 읽고, 의심하고, 판단하는 순서까지 설계합니다.</p>
          </div>
          <ClueProcess />
        </section>

        <section className="brand-education" aria-labelledby="brand-education-title">
          <div className="shell brand-education-grid">
            <figure className="brand-education-cards">
              <Image src="/assets/dullg/card-cover-1.png" width={408} height={650} alt="윤지원 소지품 카드 앞면" sizes="(max-width: 760px) 45vw, 22vw" />
              <Image src="/assets/dullg/card-body-1.png" width={408} height={650} alt="윤지원 소지품 카드 뒷면의 영어 단서" sizes="(max-width: 760px) 45vw, 22vw" />
            </figure>
            <div>
              <Kicker>교육 · 영어 미스터리 수업팩</Kicker>
              <h2 id="brand-education-title">영어 단서를 읽고<br />함께 사건을 해결합니다.</h2>
              <p>학생마다 다른 단서를 읽고 서로 질문합니다. 마지막에는 선택한 근거와 판단을 영어 사건보고서로 정리합니다.</p>
              <dl>{educationFacts.map(([value,label])=><div key={value}><dt>{value}</dt><dd>{label}</dd></div>)}</dl>
              <Link href="/academy">수업팩 자세히 보기 <ArrowRight size={17} weight="bold" aria-hidden="true" /></Link>
            </div>
          </div>
        </section>

        <section className="brand-contact" id="apply">
          <div className="shell brand-contact-inner">
            <div><Kicker>문의</Kicker><h2>작품과 교육에 관한<br />이야기를 기다립니다.</h2></div>
            <div><p>협업, 작품과 수업 자료에 관한 문의를 공식 이메일로 보내주세요.</p><Link className="button button-dark" href="/contact">문의하기 <ArrowRight size={17} weight="bold" aria-hidden="true" /></Link></div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
