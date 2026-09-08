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
          <Kicker>2026.02 시작 · 미니 게임 시리즈</Kicker>
          <h2 id="home-mini-title">미니 프로젝트</h2>
        </div>
        <Link href="/mini-projects">미니 프로젝트 전체 보기 →</Link>
      </div>
      <MiniProjectGrid
        projects={["minesweeper", "solitaire", "block-stack"].flatMap((slug) =>
          miniProjects.filter((project) => project.slug === slug),
        )}
      />
    </section>
  );
}
