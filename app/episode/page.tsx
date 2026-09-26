import { useText } from "@/lib/i18n/use-text";
import { localizeMetadata } from "@/lib/i18n/server";
import Image from "next/image";
import Link from "@/components/i18n/link";
import { ArrowButton, Kicker, PageFrame } from "@/components/site";
import { SectionHead } from "@/components/section-head";
import { EpisodeTrailer } from "@/components/episode-trailer";
import trailerStyles from "@/components/episode-trailer.module.css";
import {
  curriculum,
  educationFacts,
  episodeFullTitle,
  episodeSubtitle,
  episodeTitle,
} from "@/lib/education";
import { pageMetadata } from "@/lib/metadata";
export async function generateMetadata() {
  return localizeMetadata(
    pageMetadata("/episode", {
      title: `에피소드 01 · ${episodeTitle}`,
      description: `${episodeFullTitle}. 학원 3층에서 두 개의 열쇠가 사라졌습니다. 네 학생이 단서를 모아 사건을 해결합니다.`,
    }),
  );
}
const cast = [
  {
    num: "01",
    name: "윤지원",
    image: "/assets/dullg/yoonjiwon.png",
  },
  {
    num: "02",
    name: "박세준",
    image: "/assets/dullg/parksejun.png",
  },
  {
    num: "03",
    name: "차하린",
    image: "/assets/dullg/chaharin.png",
  },
  {
    num: "04",
    name: "한도경",
    image: "/assets/dullg/handokyung.png",
  },
];
export default function EpisodePage() {
  const t = useText();
  return (
    <PageFrame>
      {/* ── HERO — split with case file cover ── */}
      <section className="ep-hero-split shell">
        <div className="ep-hero-copy">
          <SectionHead
            as="h1"
            kicker="첫 번째 사건 · 에피소드 01"
            title={t(
              <>
                {t(episodeTitle)}
                <br />
                <em>{t(episodeSubtitle)}</em>
              </>,
            )}
            lead="시험 자료와 휴대폰을 꺼낼 두 열쇠가 사라졌습니다. 여덟 시까지 찾아야 하는데, 아직 확인하지 못한 곳은 네 학생의 가방입니다."
          />
          <div className="ep-hero-chips">
            {t(educationFacts.slice(0, 3).map(([value]) => <span key={value}>{t(value)}</span>))}
          </div>
          <Link className={`button button-dark ${trailerStyles.jumpLink}`} href="#episode-trailer">
            {t("26초 예고편 보기")}
          </Link>
        </div>
        <div className="ep-hero-visual">
          <Image
            src="/assets/dullg/rulebook-cover.png"
            alt={t(`${episodeTitle} 규칙서 표지`)}
            width={944}
            height={1330}
            sizes="(max-width: 760px) 82vw, 38vw"
            priority
          />
          <span className="ep-case-stamp">OPEN CASE</span>
        </div>
      </section>

      <section
        className={`shell ${trailerStyles.section}`}
        aria-labelledby="episode-trailer-heading"
      >
        <h2 id="episode-trailer-heading">{t("사건의 시작을 영상으로")}</h2>
        <EpisodeTrailer id="episode-trailer" />
      </section>

      {/* ── SETTING — large floor map ── */}
      <section className="ep-setting">
        <div className="shell ep-setting-inner">
          <div className="ep-setting-copy">
            <Kicker>{t("사건이 시작된 장소")}</Kicker>
            <h2>
              {t("금요일 저녁 7시 10분,")}
              <br />
              <span>{t("학원 3층에서 시작됩니다.")}</span>
            </h2>
            <p>
              {t(
                "재시험을 치르러 온 네 학생. 시험 자료가 든 보관함과 휴대폰함을 열어야 하는데, 벽에 함께 걸려 있던 두 열쇠가 사라졌습니다.",
              )}
            </p>
            <p>
              {t(
                "원장실 주변과 자습실, 복도를 찾아봤지만 열쇠는 나오지 않았습니다. 남은 곳은 네 사람의 가방. 여덟 시까지 찾지 못하면 재시험 미처리와 부모님 연락으로 이어집니다.",
              )}
            </p>
          </div>
          <div className="ep-setting-map">
            <Image
              src="/assets/dullg/floor-map-3f.png"
              alt={t("3층 원장실과 자습실 평면도")}
              width={850}
              height={746}
              sizes="(max-width: 760px) 100vw, 50vw"
            />
            <div className="ep-map-label">
              <span>3F / FLOOR MAP</span>
              <span>INCIDENT LOCATION</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CAST — profile cards ── */}
      <section className="ep-cast shell">
        <SectionHead
          className="ep-cast-head"
          kicker="재시험을 치르러 온 네 학생"
          title={t(
            <>
              {t("열쇠를 찾아야 하는")}
              <br />
              <em>{t("네 사람입니다.")}</em>
            </>,
          )}
        />
        <div className="ep-cast-grid">
          {t(
            cast.map((c) => (
              <div className="ep-cast-card" key={c.name}>
                <div className="ep-cast-img">
                  <Image
                    src={c.image}
                    width={500}
                    height={500}
                    alt={t(`${c.name} 캐릭터`)}
                    sizes="(max-width: 760px) 50vw, 25vw"
                  />
                </div>
                <div className="ep-cast-info">
                  <span className="ep-cast-index">{t(c.num)} / 04</span>
                  <strong>{t(c.name)}</strong>
                </div>
              </div>
            )),
          )}
        </div>
      </section>

      {/* ── LESSON FLOW ── */}
      <section className="ep-flow shell">
        <SectionHead
          className="ep-flow-head"
          kicker="네 번의 수업으로 푸는 사건"
          title={t(
            <>
              {t("4차시 동안")}
              <br />
              <em>{t("사건이 풀립니다.")}</em>
            </>,
          )}
        />
        <div className="ep-steps">
          {t(
            curriculum.map((item) => (
              <div className="ep-step" key={item.session}>
                <div className="ep-step-head">
                  <b className="ep-step-num">{t(item.session)}</b>
                  <span className="ep-step-label">{t(item.label)}</span>
                </div>
                <h3>{t(item.title)}</h3>
                <p>{t(item.body)}</p>
                <span className="ep-output">
                  {t("결과물 \u00B7")}
                  {t(item.output)}
                </span>
              </div>
            )),
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="ep-cta shell">
        <div className="ep-cta-copy">
          <SectionHead
            kicker="실제 제작 자료 확인"
            title={t(
              <>
                {t("자료를 먼저")}
                <br />
                <span>{t("직접 확인하세요.")}</span>
              </>,
            )}
            lead="단서 카드, 교사용 진행안과 결과물 예시 시제품을 묶어 보내드립니다. 현재 검토용 샘플은 무료입니다."
          />
        </div>
        <div className="ep-cta-actions">
          <ArrowButton>{t("무료 검토팩 요청")}</ArrowButton>
          <Link className="text-link" href="/academy/sample">
            {t("자료 미리 보기 →")}
          </Link>
        </div>
      </section>
    </PageFrame>
  );
}
