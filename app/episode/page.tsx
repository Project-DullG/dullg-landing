import { useText } from "@/lib/i18n/use-text";
import { localizeMetadata } from "@/lib/i18n/server";
import Image from "next/image";
import Link from "@/components/i18n/link";
import { ArrowButton, Kicker, PageFrame } from "@/components/site";
import { SectionHead } from "@/components/section-head";
import { curriculum, episodeFullTitle, episodeSubtitle, episodeTitle } from "@/lib/education";
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
    image: "/assets/academy-remake/yoonjiwon.webp",
  },
  {
    num: "02",
    name: "박세준",
    image: "/assets/academy-remake/parksejun.webp",
  },
  {
    num: "03",
    name: "차하린",
    image: "/assets/academy-remake/chaharin.webp",
  },
  {
    num: "04",
    name: "한도경",
    image: "/assets/academy-remake/handokyung.webp",
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
            lead="금요일 저녁, 재시험을 앞둔 학원에서 자료함 열쇠와 핸드폰함 열쇠가 사라졌습니다. 아직 확인하지 못한 곳은 네 학생의 가방입니다."
          />
          <div className="ep-hero-chips">
            {t(
              [["4인"], ["40~50분+"], ["한국어·영어 단서"]].map(([value]) => (
                <span key={value}>{t(value)}</span>
              )),
            )}
          </div>
        </div>
        <div className="ep-hero-visual">
          <Image
            src="/assets/academy-remake/cover.webp"
            alt={t(`${episodeTitle} 규칙서 표지`)}
            width={944}
            height={1330}
            sizes="(max-width: 760px) 82vw, 38vw"
            priority
          />
          <span className="ep-case-stamp">OPEN CASE</span>
        </div>
      </section>

      <div className="shell" style={{ marginBottom: 32 }}>
        <Link className="button button-dark" href="/academy#remake-guide-title">
          {t("시놉시스·룰 설명 영상 보기")}
        </Link>
      </div>
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
                "열쇠가 없다는 사실을 확인했습니다. 자료함 열쇠와 핸드폰함 열쇠는 원래 원장실 입구 쪽 공용 볼펜 선반 안쪽에 함께 걸려 있었습니다.",
              )}
            </p>
            <p>
              {t(
                "오늘 재시험을 치르지 못하면 토요일 오후 보충반에 다시 나와야 합니다. 아직 확인하지 못한 곳은 네 학생의 가방입니다. 공개되는 소지품을 비교하며 열쇠의 행방을 추리합니다.",
              )}
            </p>
          </div>
          <div className="ep-setting-map">
            <Image
              src="/assets/academy-remake/floor-map.svg"
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
          kicker="서로 다른 단서를 가진 네 학생"
          title={t(
            <>
              {t("각자 다른 단서를")}
              <br />
              <em>{t("가지고 있습니다.")}</em>
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
