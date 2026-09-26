import { useText } from "@/lib/i18n/use-text";
import styles from "./remake-guide.module.css";

const guides = [
  {
    id: "synopsis",
    title: "시놉시스",
    note: "게임 시작 전 · 3분 55초",
    body: "사건의 배경, 네 학생과 열쇠가 사라진 장소를 확인합니다.",
  },
  {
    id: "rulebook",
    title: "룰 설명",
    note: "진행 방법 · 약 4분",
    body: "카드 공개, 중복 지목, 토론과 최종 투표를 그림과 음성으로 설명합니다.",
  },
];
const contents = [
  ["인물 시트", "4명 × 8쪽", "각자 맡은 인물의 정보와 목표를 읽습니다."],
  ["한영 단서 카드", "언어별 16장", "소지품 12장과 공통 단서·투표 안내 4장입니다."],
  ["룰북", "표지 포함 8쪽", "진행 규칙, 학원 지도와 안내 QR을 담았습니다."],
];
export function RemakeGuide() {
  const t = useText();
  return (
    <section className={`shell ${styles.section}`} aria-labelledby="remake-guide-title">
      <div className={styles.heading}>
        <p className={styles.label}>{t("리메이크 구성")}</p>
        <h2 id="remake-guide-title">{t("자료를 확인하고, 진행 방법을 먼저 들어보세요.")}</h2>
        <p>
          {t(
            "게임은 4명이 한 팀으로 약 40~50분 이상 진행합니다. 영어 수업에서는 읽기·토론·보고서 작성을 4차시로 나누어 운영할 계획입니다.",
          )}
        </p>
      </div>
      <div className={styles.contents}>
        {contents.map(([title, count, body]) => (
          <article key={title}>
            <h3>{t(title)}</h3>
            <strong>{t(count)}</strong>
            <p>{t(body)}</p>
          </article>
        ))}
      </div>
      <div className={styles.videos}>
        {guides.map((guide) => (
          <article key={guide.id}>
            <video
              controls
              playsInline
              preload="none"
              width={1920}
              height={1080}
              poster={`/assets/academy-remake/${guide.id}-poster.webp`}
              aria-label={t(guide.title)}
            >
              <source src={`/assets/academy-remake/${guide.id}.mp4`} type="video/mp4" />
              <a href={`/assets/academy-remake/${guide.id}.mp4`}>{t("영상 파일 열기")}</a>
            </video>
            <div className={styles.caption}>
              <h3>{t(guide.title)}</h3>
              <span>{t(guide.note)}</span>
            </div>
            <p>{t(guide.body)}</p>
            <a
              className={styles.link}
              href={`https://project-dullg.github.io/two-key-ending/${guide.id}.html`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("슬라이드와 전체 대본 보기 ↗")}
            </a>
          </article>
        ))}
      </div>
      <p className={styles.language}>
        {t(
          "안내 영상과 대본은 한국어입니다. 영어 단서 카드 미리보기는 자료 페이지에서 확인할 수 있습니다.",
        )}
      </p>
    </section>
  );
}
