import { useText } from "@/lib/i18n/use-text";
import styles from "./brand-film.module.css";

export function BrandFilm() {
  const t = useText();
  return (
    <section className={`shell ${styles.section}`} id="brand-film" aria-labelledby="brand-film-title">
      <div className={styles.intro}>
        <span className={styles.eyebrow}>{t("소개 영상 · 42초")}</span>
        <h2 id="brand-film-title">{t("단서공방 소개 영상")}</h2>
        <p id="brand-film-description">
          {t("머더미스터리 제작과 게임·AI 수업을 소개합니다.")}
        </p>
      </div>
      <div className={styles.content}>
        <figure className={styles.figure}>
          <video
            className={styles.video}
            controls
            playsInline
            preload="none"
            width={1920}
            height={1080}
            poster="/assets/videos/project-dullg-brand-film-poster.webp"
            aria-label={t("단서공방 소개 영상, 42초, 한국어 자막 포함")}
            aria-describedby="brand-film-description"
          >
            <source src="/assets/videos/project-dullg-brand-film-v1.mp4" type="video/mp4" />
            <a href="/assets/videos/project-dullg-brand-film-v1.mp4">{t("단서공방 소개 영상 열기")}</a>
          </video>
          <figcaption>{t("한국어 자막 포함 · 전체 화면으로 볼 수 있습니다.")}</figcaption>
        </figure>
        <details className={styles.transcript}>
          <summary>{t("영상 대본")}</summary>
          <div>
            <p>{t("한 장의 단서는 사람을 어디까지 움직일까요?")}</p>
            <p>{t("누군가는 질문을 시작하고, 누군가는 다른 사람의 이야기에 귀를 기울입니다. 그리고 누군가는 자신이 믿었던 답을 바꿉니다. 단서공방은 그 순간을 설계합니다.")}</p>
            <p>{t("이야기 속 인물이 되어 직접 추리하는 머더미스터리. 단서를 읽고, 서로 질문하고, 자신의 생각을 표현하는 수업. AI를 활용해 머릿속 아이디어를 직접 만들어 보는 경험.")}</p>
            <p>{t("하나의 질문이 대화가 되고, 함께 찾은 답이 나만의 이야기가 되도록. 당신의 호기심이 다음 이야기를 시작합니다.")}</p>
            <p>{t("이야기를 만들고, 단서를 엮습니다. 단서공방.")}</p>
          </div>
        </details>
      </div>
    </section>
  );
}
