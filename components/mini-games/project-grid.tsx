import { useText } from "@/lib/i18n/use-text";
import Link from "@/components/i18n/link";
import { miniProjects } from "@/lib/mini-projects";
import { GameCover } from "./game-cover";
import styles from "./games.module.css";
export function MiniProjectGrid({ projects = miniProjects }: { projects?: typeof miniProjects }) {
  const t = useText();
  return (
    <div className={styles.grid}>
      {t(
        projects.map((project) => (
          <Link
            className={styles.project}
            key={project.slug}
            href={`/mini-projects/${project.slug}`}
          >
            <GameCover kind={project.slug} title={t(project.title)} />
            <span className={styles.meta}>{t(project.genre)}</span>
            <h3>
              {t(project.title)}
              <span aria-hidden="true">↗</span>
            </h3>
            <p>{t(project.description)}</p>
          </Link>
        )),
      )}
    </div>
  );
}
