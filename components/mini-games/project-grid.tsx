import Link from "next/link";
import { miniProjects } from "@/lib/mini-projects";
import { GameCover } from "./game-cover";
import styles from "./games.module.css";

export function MiniProjectGrid({ projects = miniProjects }: { projects?: typeof miniProjects }) {
  return (
    <div className={styles.grid}>
      {projects.map((project) => (
        <Link className={styles.project} key={project.slug} href={`/mini-projects/${project.slug}`}>
          <GameCover kind={project.slug} title={project.title} />
          <span className={styles.meta}>{project.genre}</span>
          <h3>
            {project.title}
            <span aria-hidden="true">↗</span>
          </h3>
          <p>{project.description}</p>
        </Link>
      ))}
    </div>
  );
}
