import Link from "next/link";
import { Kicker } from "@/components/site";
import { MiniProjectGrid } from "./project-grid";
import styles from "./games.module.css";
import { miniProjects } from "@/lib/mini-projects";

export function HomeMiniProjects() {
  return (
    <section className={`shell ${styles.home}`} aria-labelledby="home-mini-title">
      <div className="brand-section-head">
        <div>
          <Kicker>미니 프로젝트</Kicker>
          <h2 id="home-mini-title">단서공방이 만든 웹게임</h2>
        </div>
        <Link href="/mini-projects">게임 전체 보기 →</Link>
      </div>
      <MiniProjectGrid
        projects={["minesweeper", "solitaire", "block-stack"].flatMap((slug) =>
          miniProjects.filter((project) => project.slug === slug),
        )}
      />
    </section>
  );
}
