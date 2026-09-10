import { useText } from "@/lib/i18n/use-text";
import type { Work } from "@/lib/works";
import styles from "./official-work-introduction.module.css";
export function OfficialWorkIntroduction({ work }: { work: Work }) {
  const t = useText();
  const content = work.officialIntroduction;
  if (!content) return null;
  return (
    <section className={`shell ${styles.section}`} aria-label={t("UZU 공식 작품 소개")}>
      <header className={styles.header}>
        <h2>{t("이야기의 시작")}</h2>
        <a href={work.externalUrl} target="_blank" rel="noopener noreferrer">
          {t("UZU 공식 소개 ↗")}
        </a>
      </header>
      <p className={styles.source}>{t("UZU 공식 소개 요약 \u00B7 2026년 9월 3일 확인")}</p>
      <div className={styles.story}>
        {t(content.paragraphs.map((paragraph) => <p key={paragraph}>{t(paragraph)}</p>))}
      </div>
      <figure className={styles.quote}>
        <blockquote>“{t(content.quote)}”</blockquote>
        <figcaption>{t("소녀의 대사 \u00B7 공식 줄거리 원문 발췌")}</figcaption>
      </figure>
      <h2>{t("등장인물")}</h2>
      <dl className={styles.characters}>
        {t(
          content.characters.map((character) => (
            <div key={character.name}>
              <dt>{t(character.name)}</dt>
              <dd>{t(character.description)}</dd>
            </div>
          )),
        )}
      </dl>
      <aside className={styles.notes} aria-labelledby="play-notes">
        <h2 id="play-notes">{t("플레이 전 확인하세요")}</h2>
        {t(content.notes.map((note) => <p key={note}>{t(note)}</p>))}
      </aside>
    </section>
  );
}
