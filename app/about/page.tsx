import { useText } from "@/lib/i18n/use-text";
import { localizeMetadata } from "@/lib/i18n/server";
import Image from "next/image";
import Link from "@/components/i18n/link";
import { Kicker, PageFrame } from "@/components/site";
import { SectionHead } from "@/components/section-head";
import { ClueProcess } from "@/components/clue-process";
import { PageIntro } from "@/components/page-intro";
import { pageMetadata } from "@/lib/metadata";
import { BRAND } from "@/lib/site-config";
import { didimterResidency, riseAward } from "@/lib/recognition";
import styles from "./recognition.module.css";
export async function generateMetadata() {
  return localizeMetadata(pageMetadata("/about"));
}
export default function AboutPage() {
  const t = useText();
  return (
    <PageFrame>
      <PageIntro
        title={t("브랜드 소개")}
        description={t(BRAND.description)}
      />

      <section id="team-history" className="about-brand shell" aria-labelledby="about-brand-title">
        <figure>
          <Image
            src="/assets/brand/project-dullg-banner-top.webp"
            width={1701}
            height={2835}
            alt={t("이전 브랜드 ProjectDullG 소개 배너")}
            sizes="(max-width: 760px) 82vw, 32vw"
            priority
          />
          <figcaption>{t("이전 브랜드 ProjectDullG로 활동할 때 사용한 배너입니다.")}</figcaption>
        </figure>
        <div>
          <Kicker>{BRAND.meaning}</Kicker>
          <h2 id="about-brand-title">{t("트위즈덤, 게임과 교육을 함께 만듭니다")}</h2>
          <p>
            {t("Twisdom은 반전을 뜻하는 Twist와 지혜를 뜻하는 Wisdom을 합친 이름입니다. 이야기의 반전을 통해 이해가 깊어진다는 의미를 담았습니다.")}
          </p>
          <p>
            {t(
              "보드게임 동아리 덜지니어스에서 시작해 ProjectDullG와 단서공방이라는 이름으로 작품을 제작하고 수업을 진행했습니다. 이제 트위즈덤이라는 이름으로 게임과 교육 콘텐츠를 선보입니다.",
            )}
          </p>
          <a
            className="about-record-link"
            href="https://www.handong.edu/kor/camplife/stu-organ/club/physical/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("덜지니어스 동아리 소개 ↗")}
          </a>
          <dl>
            <div>
              <dt>{t("하는 일")}</dt>
              <dd>{t("머더미스터리 콘텐츠 기획\u00B7제작")}</dd>
            </div>
            <div>
              <dt>{t("교육")}</dt>
              <dd>{t("게임\u00B7AI 활용 수업 \u00B7 영어 미스터리 수업팩 준비")}</dd>
            </div>
            <div>
              <dt>{t("브랜드명")}</dt>
              <dd>{t(BRAND.fullName)}</dd>
            </div>
            <div>
              <dt>{t("입주 이력")}</dt>
              <dd>
                {t(didimterResidency.title)}
                <br />
                <a
                  className="about-record-link"
                  href={didimterResidency.source}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("공식 입주기업 소개 ↗")}
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className={`shell ${styles.section}`} aria-labelledby="recognition-title">
        <div>
          <Kicker>{t("수상 이력")}</Kicker>
          <h2 id="recognition-title">{t(riseAward.title)}</h2>
          <p>{t(riseAward.description)}</p>
        </div>
        <div>
          <dl>
            <div>
              <dt>{t("수상일")}</dt>
              <dd>{t("2025년 10월 30일")}</dd>
            </div>
            <div>
              <dt>{t("참가팀")}</dt>
              <dd>{t(riseAward.team)}</dd>
            </div>
            <div>
              <dt>{t("대회 주관")}</dt>
              <dd>{t(riseAward.organizers)}</dd>
            </div>
          </dl>
          <a href={riseAward.source} target="_blank" rel="noopener noreferrer">
            {t(riseAward.sourceLabel)}
            {t("에서 확인 ↗")}
          </a>
        </div>
      </section>

      <section id="process" className="brand-method shell" aria-labelledby="brand-method-title">
        <SectionHead
          className="brand-method-head"
          id="brand-method-title"
          kicker="제작 과정"
          title={t(<>{t("사건 설계부터 플레이테스트까지")}</>)}
          lead="인물별 정보와 사건의 결말을 정하고, 플레이하면서 단서가 드러나는 순서를 확인합니다."
        />
        <ClueProcess />
      </section>

      <section className={`shell ${styles.related}`} aria-label={t("작품과 교육 더 보기")}>
        <div>
          <h2>{t("작품과 교육 살펴보기")}</h2>
          <p>{t("영어 미스터리 수업팩은 정식 출시 전입니다.")}</p>
        </div>
        <div>
          <Link href="/works">{t("작품 보기 →")}</Link>
          <Link href="/activity">{t("활동 기록 보기 →")}</Link>
          <Link href="/academy">{t("영어 미스터리 수업팩 →")}</Link>
        </div>
      </section>
    </PageFrame>
  );
}
