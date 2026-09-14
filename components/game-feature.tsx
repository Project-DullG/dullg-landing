import { Fragment } from "react";
import Image from "next/image";
import Link from "@/components/i18n/link";
import { useText } from "@/lib/i18n/use-text";
import { featuredGames, type FeaturedGameId } from "@/lib/featured-games";
import styles from "./game-feature.module.css";
export function GameFeature({ id, play = false }: { id: FeaturedGameId; play?: boolean }) {
  const t = useText();
  const game = featuredGames[id];
  const href = play ? game.play.href : game.href;
  const label = t(play ? game.play.label : "게임 살펴보기");
  return (
    <article className={styles.card}>
      <Image
        className={styles.art}
        {...game.image}
        alt={t(game.image.alt)}
        sizes="(max-width:700px) 100vw, 55vw"
      />
      <div className={styles.body}>
        <span className={styles.tag}>{t(game.tag)}</span>
        <h2>{t(game.title)}</h2>
        {game.paragraphs.map((lines, index) => (
          <p key={index}>
            {lines.map((line, lineIndex) => (
              <Fragment key={line}>
                {lineIndex > 0 && <br />}
                {t(line)}
              </Fragment>
            ))}
          </p>
        ))}
        {play && game.play.kind === "document" ? (
          <a className={styles.link} href={href}>
            {label} →
          </a>
        ) : (
          <Link className={styles.link} href={href}>
            {label} →
          </Link>
        )}
      </div>
    </article>
  );
}
