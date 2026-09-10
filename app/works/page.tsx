import { useText } from "@/lib/i18n/use-text";
import { localizeMetadata } from "@/lib/i18n/server";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import Link from "@/components/i18n/link";
import Image from "next/image";
import { Kicker, PageFrame } from "@/components/site";
import { SectionHead } from "@/components/section-head";
import { PageIntro } from "@/components/page-intro";
import { fundingSummaryPeriod, getFundingProject, getFundingStatus } from "@/lib/funding";
import { pageMetadata } from "@/lib/metadata";
import { currentWorks, getWorkStatus, publishedWorks } from "@/lib/works";
export async function generateMetadata() {
  return localizeMetadata(pageMetadata("/works", { title: "작품과 펀딩" }));
}
export const revalidate = 3600;
export default function WorksPage() {
  const t = useText();
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
        title={t("머더미스터리 작품")}
        description="작품별 줄거리와 인원·시간, 공식 공개 기록을 확인하세요."
      >
        <a href="#work-list-title">{t("작품 목록")}</a>
        <a href="#funding-archive-title">{t("펀딩 기록")}</a>
      </PageIntro>

      {t(
        live && (
          <section className="live-funding" aria-labelledby="live-funding-title">
            <div className="shell">
              <div className="live-funding-head">
                <div>
                  <Kicker>{t("현재 펀딩 중")}</Kicker>
                  <h2 id="live-funding-title">{t("새 작품 2편")}</h2>
                </div>
                <div>
                  <b>
                    {t(currentFunding.endsOn.replaceAll("-", "."))}
                    {t("까지")}
                  </b>
                  <a href={currentFunding.url} target="_blank" rel="noopener noreferrer">
                    {t("텀블벅 프로젝트 보기")}
                    <ArrowUpRight size={16} weight="bold" aria-hidden="true" />
                  </a>
                </div>
              </div>
              <div className="live-work-list">
                {t(
                  currentWorks().map((work) => (
                    <article key={work.slug}>
                      <Link href={`/works/${work.slug}`} aria-label={t(`${work.title} 상세 보기`)}>
                        <Image
                          src={work.image}
                          width={1000}
                          height={1000}
                          alt={t(work.alt)}
                          sizes="(max-width: 760px) 100vw, 34vw"
                        />
                      </Link>
                      <div>
                        <small>
                          {t(work.players)} · {t(work.duration)}
                        </small>
                        <h3>{t(work.title)}</h3>
                        <p>{t(work.synopsis)}</p>
                        <Link href={`/works/${work.slug}`}>
                          {t("작품 자세히 보기")}
                          <ArrowRight size={16} weight="bold" aria-hidden="true" />
                        </Link>
                      </div>
                    </article>
                  )),
                )}
              </div>
              <div className="live-funding-stats">
                <span>
                  <small>{t("확인한 모인 금액")}</small>
                  <strong>{t(currentFunding.amount)}</strong>
                </span>
                <span>
                  <small>{t("후원자")}</small>
                  <strong>{t(currentFunding.backers)}</strong>
                </span>
                <span>
                  <small>{t("달성률")}</small>
                  <strong>{t(currentFunding.achievement)}</strong>
                </span>
                <p>
                  {t(currentFunding.checkedAt)}
                  {" · "}
                  {t("텀블벅 공개 페이지 확인 기준입니다.")}
                </p>
              </div>
            </div>
          </section>
        ),
      )}

      <section className="work-ledger shell" aria-labelledby="work-list-title">
        <SectionHead className="work-ledger-head" id="work-list-title" title={t("작품 목록")} />
        <div className="portfolio-list">
          {t(
            publishedWorks().map((work) => (
              <article key={work.slug}>
                <figure>
                  <Link href={`/works/${work.slug}`} aria-label={t(`${work.title} 상세 보기`)}>
                    <Image
                      src={work.image}
                      width={1000}
                      height={1000}
                      alt={t(work.alt)}
                      sizes="(max-width: 600px) 100vw, 240px"
                    />
                  </Link>
                </figure>
                <div>
                  <span>{t(getWorkStatus(work))}</span>
                  <h3>{t(work.title)}</h3>
                  <b>
                    {t(work.players)} · {t(work.duration)} · {t(work.platform)}
                  </b>
                  <p>{t(work.synopsis)}</p>
                  <Link href={`/works/${work.slug}`}>
                    {t("작품 자세히 보기")}
                    <ArrowRight size={16} weight="bold" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            )),
          )}
        </div>
      </section>

      <section className="funding-archive shell" aria-labelledby="funding-archive-title">
        {/* keeps a grid-item box; see SectionHead */}
        <SectionHead
          className="funding-archive-head"
          id="funding-archive-title"
          title={t("펀딩 기록")}
        />
        <div className="funding-archive-list">
          {t(
            fundingArchive.map((project) => (
              <a href={project.url} target="_blank" rel="noopener noreferrer" key={project.id}>
                <span>{t(fundingSummaryPeriod(project))}</span>
                <strong>{t(project.title)}</strong>
                <b>
                  {t(project.amount)} · {t(project.backers)} · {t(project.achievement)}
                </b>
                <i>{t("보기 ↗")}</i>
              </a>
            )),
          )}
          <p>{t("금액과 후원자 수는 각 텀블벅 프로젝트의 종료 시점 기준입니다.")}</p>
        </div>
      </section>
    </PageFrame>
  );
}
