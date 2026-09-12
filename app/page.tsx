import { useText } from "@/lib/i18n/use-text";
import { localizeMetadata } from "@/lib/i18n/server";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "@/components/i18n/link";
import Image from "next/image";
import { Footer, Header, Kicker } from "@/components/site";
import { SectionHead } from "@/components/section-head";
import { educationFacts } from "@/lib/education";
import { pageMetadata } from "@/lib/metadata";
import { activityRecords, formatActivityDate } from "@/lib/activities";
import { FestivalHighlight } from "@/components/festival-highlight";
import activityStyles from "@/components/home-activities.module.css";
import { HomeMiniProjects } from "@/components/mini-games/home-projects";
import { HomeWorks } from "@/components/home-works";
export async function generateMetadata() {
  return localizeMetadata(
    pageMetadata("/", {
      absoluteTitle: "단서공방 | 머더미스터리 제작과 게임·AI 교육",
    }),
  );
}
export const revalidate = 3600;
export default function Home() {
  const t = useText();
  return (
    <>
      <Header />

      <main className="brand-home" id="main-content">
        <section className="brand-hero shell" aria-labelledby="home-title">
          <SectionHead
            as="h1"
            id="home-title"
            kicker="단서공방 · ProjectDullG"
            title={t(
              <>
                {t("이야기를 만들고,")}
                <br />
                <em>{t("단서를 엮습니다.")}</em>
              </>,
            )}
            lead="단서공방은 머더미스터리 작품을 만들고, 게임과 AI를 활용한 콘텐츠 제작 수업을 진행합니다."
          />
          <div className="brand-hero-actions">
            <Link className="button button-dark" href="/works">
              {t("작품 보기")}
              <ArrowRight size={17} weight="bold" aria-hidden="true" />
            </Link>
            <Link href="/about">
              {t("단서공방 소개")}
              <ArrowRight size={17} weight="bold" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <HomeWorks />

        <HomeMiniProjects />

        <section
          className={`shell ${activityStyles.section}`}
          aria-labelledby="home-activity-title"
        >
          <div className="brand-section-head">
            <div>
              <Kicker>{t("활동 기록")}</Kicker>
              <h2 id="home-activity-title">{t("최근 활동")}</h2>
            </div>
            <Link href="/activity">
              {t("제작\u00B7활동 기록 전체 보기")}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <FestivalHighlight />
          <div className={activityStyles.grid}>
            {t(
              activityRecords
                .filter((record) => record.type === "교육" && record.image)
                .slice(0, 2)
                .map((record) => (
                  <Link className={activityStyles.item} href={record.href} key={record.href}>
                    <Image
                      src={record.image!.src}
                      alt={t(record.image!.alt)}
                      width={1448}
                      height={1086}
                      sizes="(max-width: 760px) 100vw, 50vw"
                    />
                    <time dateTime={record.date}>
                      {t(formatActivityDate(record))} · {t(record.type)}
                    </time>
                    <h3>{t(record.title)}</h3>
                    <p>{t(record.body)}</p>
                    <span>
                      {t("수업 기록 보기")}
                      <ArrowRight size={17} aria-hidden="true" />
                    </span>
                  </Link>
                )),
            )}
          </div>
        </section>

        <section className="brand-education" aria-labelledby="brand-education-title">
          <div className="shell brand-education-grid">
            <figure className="brand-education-cards">
              <Image
                src="/assets/dullg/card-cover-1.png"
                width={408}
                height={650}
                alt={t("윤지원 소지품 카드 앞면")}
                sizes="(max-width: 760px) 45vw, 22vw"
              />
              <Image
                src="/assets/dullg/card-body-1.png"
                width={408}
                height={650}
                alt={t("윤지원 소지품 카드 뒷면의 영어 단서")}
                sizes="(max-width: 760px) 45vw, 22vw"
              />
            </figure>
            <div>
              <Kicker>{t("준비 중 \u00B7 영어 미스터리 수업팩")}</Kicker>
              <h2 id="brand-education-title">
                {t("영어 단서를 읽고")}
                <br />
                {t("사건을 해결하는 수업")}
              </h2>
              <p>
                {t(
                  "학생마다 다른 단서를 읽고 서로 질문합니다. 마지막에는 선택한 근거와 판단을 영어 사건보고서로 정리합니다.",
                )}
              </p>
              <dl>
                {t(
                  educationFacts.map(([value, label]) => (
                    <div key={value}>
                      <dt>{t(value)}</dt>
                      <dd>{t(label)}</dd>
                    </div>
                  )),
                )}
              </dl>
              <p className="brand-education-tools">
                {t("학원생\u00B7반\u00B7성적 관리 기능은")}
                <Link href="/demo">{t("학원 관리 체험")}</Link>
                {t("에서 가상 학생 데이터로 살펴볼 수 있습니다.")}
              </p>
              <Link href="/academy">
                {t("수업팩 자세히 보기")}
                <ArrowRight size={17} weight="bold" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className="brand-contact" id="apply" aria-labelledby="brand-contact-title">
          <div className="shell brand-contact-inner">
            <div>
              <Kicker>{t("작품\u00B7교육\u00B7협업 문의")}</Kicker>
              <h2 id="brand-contact-title">
                {t("함께 만들고 싶은")}
                <br />
                {t("프로젝트가 있나요?")}
              </h2>
            </div>
            <div>
              <p>
                {t(
                  "작품 제작과 교육 협업에 관해 문의해 주세요. 영어 미스터리 수업팩이 궁금하다면 무료 검토팩을 먼저 확인할 수 있습니다.",
                )}
              </p>
              <div className="brand-hero-actions">
                <Link className="button button-dark" href="/contact">
                  {t("프로젝트 문의")}
                  <ArrowRight size={17} weight="bold" aria-hidden="true" />
                </Link>
                <Link href="/academy/pilot">
                  {t("수업팩 검토 요청")}
                  <ArrowRight size={17} weight="bold" aria-hidden="true" />
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
