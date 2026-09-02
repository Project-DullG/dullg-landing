import { ArrowLeft, ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Kicker, PageFrame } from "@/components/site";
import { getWork, works } from "@/lib/works";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return works.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const work = getWork((await params).slug);
  if (!work) return {};
  return {
    title: `${work.title} · 단서공방`,
    description: work.synopsis,
    alternates: { canonical: `/works/${work.slug}` },
    openGraph: { title: `${work.title} · 단서공방`, description: work.synopsis, images: [{ url: work.image, alt: work.alt }] },
  };
}

export default async function WorkDetailPage({ params }: Props) {
  const work = getWork((await params).slug);
  if (!work) notFound();
  const index = works.findIndex(({ slug }) => slug === work.slug);
  const next = works[(index + 1) % works.length];

  return <PageFrame>
    <article className="work-detail">
      <header className="work-detail-hero shell">
        <div className="work-detail-copy">
          <Kicker>{work.status} · 머더미스터리</Kicker>
          <h1>{work.title}</h1>
          <dl>
            <div><dt>인원</dt><dd>{work.players}</dd></div>
            <div><dt>시간</dt><dd>{work.duration}</dd></div>
            <div><dt>형태</dt><dd>{work.platform}</dd></div>
          </dl>
        </div>
        <figure><Image src={work.image} width={1000} height={1000} alt={work.alt} sizes="(max-width: 760px) 100vw, 40vw" priority /></figure>
      </header>

      <section className="work-detail-story shell" aria-labelledby="work-story-title">
        <div><Kicker>줄거리</Kicker><h2 id="work-story-title">사건의 시작</h2></div>
        <p>{work.synopsis}</p>
      </section>

      <section className="work-detail-points">
        <div className="shell">
          <div><Kicker>작품 정보</Kicker><h2>이 작품에서<br />확인할 수 있는 것</h2></div>
          <ol>{work.characteristics.map((item, itemIndex) => <li key={item}><span>{String(itemIndex + 1).padStart(2, "0")}</span><p>{item}</p></li>)}</ol>
        </div>
      </section>

      <section className="work-detail-record shell" aria-labelledby="work-record-title">
        <div><Kicker>{work.record.label}</Kicker><h2 id="work-record-title">{work.record.title}</h2></div>
        <div><p>{work.record.detail}</p><a href={work.externalUrl} target="_blank" rel="noopener noreferrer">{work.externalLabel} 보기 <ArrowUpRight size={18} weight="bold" aria-hidden="true" /></a></div>
      </section>

      <nav className="work-detail-nav shell" aria-label="작품 이동">
        <Link href="/works"><ArrowLeft size={18} weight="bold" aria-hidden="true" /> 전체 작품</Link>
        <Link href={`/works/${next.slug}`}>다음 작품 · {next.title} <ArrowRight size={18} weight="bold" aria-hidden="true" /></Link>
      </nav>
    </article>
  </PageFrame>;
}
