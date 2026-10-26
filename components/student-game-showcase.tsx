import { useLocale } from "next-intl";
import Image from "next/image";
import { studentGames } from "@/lib/student-games";
import styles from "./student-game-showcase.module.css";

export function StudentGameShowcase() {
  const en = useLocale() === "en";
  return (
    <section className={`shell ${styles.section}`} aria-labelledby="student-games-title">
      <div className={styles.heading}>
        <div>
          <p>{en ? "Student-created board games" : "학생 창작 보드게임"}</p>
          <h2 id="student-games-title">
            {en ? "Three ways to play on the island" : "울릉도에서 시작된 세 가지 놀이"}
          </h2>
        </div>
        <a href="/student-games/index.html">
          {en ? "Visit the showcase (Korean) →" : "전시 페이지 둘러보기 →"}
        </a>
      </div>
      <div className={styles.grid}>
        {studentGames.map((game) => (
          <article key={game.slug}>
            <a href={`/student-games/${game.slug}/index.html`} className={styles.imageLink}>
              <Image
                src={`/student-games/${game.slug}/assets/hero.webp`}
                alt={en ? game.titleEn : game.title}
                width={1536}
                height={1024}
                sizes="(max-width: 760px) 100vw, 33vw"
              />
            </a>
            <div className={styles.body}>
              <p className={styles.genre}>{en ? game.genreEn : game.genre}</p>
              <h3>{en ? game.titleEn : game.title}</h3>
              <p className={styles.author}>
                {en ? `Game concept by ${game.authorsEn}` : `기획 ${game.authors}`}
              </p>
              <p>{en ? game.descriptionEn : game.description}</p>
              <p className={styles.facts}>
                <span>{en ? game.playersEn : game.players}</span>
                <span>{en ? game.durationEn : game.duration}</span>
              </p>
              <div className={styles.links}>
                <a href={`/student-games/${game.slug}/index.html`}>
                  {en ? "About the game" : "작품 소개"}
                </a>
                <a href={`/student-games/${game.slug}/table.html`}>
                  {en ? "Open the table →" : "테이블 펼치기 →"}
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
      {en && <p className={styles.language}>The game pages and playable tables are in Korean.</p>}
    </section>
  );
}
