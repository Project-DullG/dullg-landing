import { Kicker, PageFrame } from "@/components/site";
import { MiniProjectGrid } from "@/components/mini-games/project-grid";
import { pageMetadata } from "@/lib/metadata";
import styles from "@/components/mini-games/games.module.css";

export const metadata = pageMetadata("/mini-projects");
export default function MiniProjectsPage() {
  return (
    <PageFrame>
      <section className={`shell ${styles.intro}`}>
        <Kicker>단서공방 · 웹게임 제작</Kicker>
        <h1>미니 프로젝트</h1>
        <p>두 달에 한 편을 목표로 작은 게임을 만듭니다.</p>
        <span className={styles.seriesMeta}>
          <span>2026.02 시작</span>
        </span>
      </section>
      <section className={`shell ${styles.collection}`} aria-label="미니 프로젝트 목록">
        <MiniProjectGrid />
      </section>
    </PageFrame>
  );
}
