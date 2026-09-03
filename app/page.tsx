import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import Image from "next/image";
import { ClueProcess } from "@/components/clue-process";
import { Footer, Header, Kicker } from "@/components/site";
import { SectionHead } from "@/components/section-head";
import { educationFacts } from "@/lib/education";
import { pageMetadata } from "@/lib/metadata";
import { getWorkStatus, homeFeaturedWorks } from "@/lib/works";

export const metadata = pageMetadata("/", {
  absoluteTitle: "단서공방 | 영어 미스터리 수업과 추리 콘텐츠",
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
            lead="단서공방은 머더미스터리 작품을 만들고, 영어로 읽고 토론하는 미스터리 수업팩을 준비합니다."
          />
          <div className="brand-hero-actions">
            <Link className="button button-dark" href="/works">
              작품 보기 <ArrowRight size={17} weight="bold" aria-hidden="true" />
            </Link>
            <Link href="/academy">
              교육 수업팩 보기 <ArrowRight size={17} weight="bold" aria-hidden="true" />
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
              <Kicker>교육 · 영어 미스터리 수업팩</Kicker>
              <h2 id="brand-education-title">
                영어 단서를 읽고
                <br />
                함께 사건을 해결합니다.
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

        <section className="brand-contact" id="apply" aria-labelledby="brand-contact-title">
          <div className="shell brand-contact-inner">
            <div>
              <Kicker>검토팩 요청</Kicker>
              <h2 id="brand-contact-title">
                자료를 먼저 보고
                <br />
                판단하세요.
              </h2>
            </div>
            <div>
              <p>
                무료 검토팩을 보내드립니다. 구매나 파일럿 참여 의무는 없습니다. 작품과 협업 문의는
                이메일로 받습니다.
              </p>
              <div className="brand-hero-actions">
                <Link className="button button-dark" href="/academy/pilot">
                  무료 검토팩 요청 <ArrowRight size={17} weight="bold" aria-hidden="true" />
                </Link>
                <Link href="/contact">
                  일반 문의 <ArrowRight size={17} weight="bold" aria-hidden="true" />
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
