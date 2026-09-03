import type { Work } from "@/lib/works";
import styles from "./official-work-introduction.module.css";

export function OfficialWorkIntroduction({ work }: { work: Work }) {
  const content = work.officialIntroduction;
  if (!content) return null;
  return (
    <section className={`shell ${styles.section}`} aria-label="UZU 공식 작품 소개">
      <header className={styles.header}>
        <h2>이야기의 시작</h2>
        <a href={work.externalUrl} target="_blank" rel="noopener noreferrer">
          UZU 공식 소개 ↗
        </a>
      </header>
      <p className={styles.source}>UZU 공식 소개 요약 · 2026년 9월 3일 확인</p>
      <div className={styles.story}>
        {content.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <figure className={styles.quote}>
        <blockquote>“{content.quote}”</blockquote>
        <figcaption>소녀의 대사 · 공식 줄거리 원문 발췌</figcaption>
      </figure>
      <h2>등장인물</h2>
      <dl className={styles.characters}>
        {content.characters.map((character) => (
          <div key={character.name}>
            <dt>{character.name}</dt>
            <dd>{character.description}</dd>
          </div>
        ))}
      </dl>
      <aside className={styles.notes} aria-labelledby="play-notes">
        <h2 id="play-notes">플레이 전 확인하세요</h2>
        {content.notes.map((note) => (
          <p key={note}>{note}</p>
        ))}
      </aside>
    </section>
  );
}
