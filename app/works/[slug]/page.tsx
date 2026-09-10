import { getText, localizeMetadata } from "@/lib/i18n/server";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "@/components/i18n/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Kicker, PageFrame } from "@/components/site";
import { getWork, getWorkStatus, works } from "@/lib/works";
import { WorkLanding } from "@/components/work-landing";
import landings from "@/lib/work-landings.json";
import { OfficialWorkIntroduction } from "@/components/official-work-introduction";
import { WorkTrailer } from "@/components/work-trailer";
import { SourceLanguageNote } from "@/components/i18n/source-language-note";
type Props = {
  params: Promise<{
    slug: string;
  }>;
};
export const revalidate = 3600;
export function generateStaticParams() {
  return works.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const work = getWork((await params).slug);
  if (!work) return localizeMetadata({});
  return localizeMetadata({
    title: work.title,
    description: work.synopsis,
    alternates: { canonical: `/works/${work.slug}` },
    openGraph: {
      title: work.title,
      description: work.synopsis,
      url: `/works/${work.slug}`,
      images: [{ url: work.image, alt: work.alt }],
    },
  });
}
export default async function WorkDetailPage({ params }: Props) {
  const t = await getText();
  const work = getWork((await params).slug);
  if (!work) notFound();
  const index = works.findIndex(({ slug }) => slug === work.slug);
  const next = works[(index + 1) % works.length];
  return (
    <PageFrame>
      <article className="work-detail">
        <nav className="work-breadcrumb shell" aria-label={t("현재 위치")}>
          <Link href="/">{t("홈")}</Link>
          <span aria-hidden="true">/</span>
          <Link href="/works">{t("작품")}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{t(work.title)}</span>
        </nav>
        <header className="work-detail-hero shell">
          <div className="work-detail-copy">
            <Kicker>
              {t(getWorkStatus(work))}
              {t("\u00B7 머더미스터리")}
            </Kicker>
            <h1>{t(work.title)}</h1>
            <dl>
              <div>
                <dt>{t("인원")}</dt>
                <dd>{t(work.players)}</dd>
              </div>
              <div>
                <dt>{t("시간")}</dt>
                <dd>{t(work.duration)}</dd>
              </div>
              <div>
                <dt>{t("형태")}</dt>
                <dd>{t(work.platform)}</dd>
              </div>
            </dl>
            <div className="work-detail-actions">
              <a href={work.externalUrl} target="_blank" rel="noopener noreferrer">
                {t(work.externalLabel)}
                {t("보기")}
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
              <a href="#work-content">{t("작품 소개 읽기 ↓")}</a>
            </div>
          </div>
          <figure>
            <Image
              src={work.image}
              width={1000}
              height={1000}
              alt={t(work.alt)}
              sizes="(max-width: 760px) 100vw, 40vw"
              priority
            />
          </figure>
        </header>

        <div className="shell"><SourceLanguageNote kind="game" /></div>
        <WorkTrailer slug={work.slug} />

        <div id="work-content" className="work-content-anchor">
          {t(
            !work.officialIntroduction && (
              <section className="work-detail-story shell" aria-labelledby="work-story-title">
                <div>
                  <Kicker>{t("줄거리")}</Kicker>
                  <h2 id="work-story-title">{t("사건의 시작")}</h2>
                </div>
                <p>{t(work.synopsis)}</p>
              </section>
            ),
          )}

          {t(
            work.officialIntroduction ? (
              <OfficialWorkIntroduction work={work} />
            ) : work.slug in landings ? (
              <WorkLanding slug={work.slug} title={t(work.title)} />
            ) : (
              <section className="work-detail-points">
                <div className="shell">
                  <div>
                    <Kicker>{t("작품 정보")}</Kicker>
                    <h2>
                      {t("이 작품에서")}
                      <br />
                      {t("확인할 수 있는 것")}
                    </h2>
                  </div>
                  <ol>
                    {t(
                      work.characteristics.map((item, itemIndex) => (
                        <li key={item}>
                          <span>{t(String(itemIndex + 1).padStart(2, "0"))}</span>
                          <p>{t(item)}</p>
                        </li>
                      )),
                    )}
                  </ol>
                </div>
              </section>
            ),
          )}
        </div>

        <section className="work-detail-record shell" aria-labelledby="work-record-title">
          <div>
            <Kicker>{t(work.record.label)}</Kicker>
            <h2 id="work-record-title">{t(work.record.title)}</h2>
          </div>
          <div>
            <p>{t(work.record.detail)}</p>
            <a href={work.externalUrl} target="_blank" rel="noopener noreferrer">
              {t(work.externalLabel)}
              {t("보기")}
              <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
            </a>
          </div>
        </section>

        <nav className="work-detail-nav shell" aria-label={t("작품 이동")}>
          <Link href="/works">
            <ArrowLeft size={18} weight="bold" aria-hidden="true" />
            {t("전체 작품")}
          </Link>
          <Link href={`/works/${next.slug}`}>
            {t("다음 작품 \u00B7")}
            {t(next.title)} <ArrowRight size={18} weight="bold" aria-hidden="true" />
          </Link>
        </nav>
      </article>
    </PageFrame>
  );
}
