import { Kicker, PageFrame } from "@/components/site";
import { MiniProjectGrid } from "@/components/mini-games/project-grid";
import { pageMetadata } from "@/lib/metadata";
import styles from "@/components/mini-games/games.module.css";
import { miniProjects, isArcadeGame } from "@/lib/mini-projects";

export const metadata = pageMetadata("/mini-projects");
export default function MiniProjectsPage() {
  const groups = [
    {
      id: "puzzle-games",
      title: "퍼즐·카드 게임",
      projects: miniProjects.filter((p) => !isArcadeGame(p.slug)),
    },
    {
      id: "arcade-games",
      title: "아케이드 게임",
      projects: miniProjects.filter((p) => isArcadeGame(p.slug)),
    },
  ];
  return (
    <PageFrame>
      <section className={`shell ${styles.intro}`}>
        <Kicker>웹게임 제작</Kicker>
        <h1>미니 프로젝트</h1>
        <p>퍼즐·카드·아케이드 게임을 직접 만들고 공개합니다.</p>
        <span className={styles.seriesMeta}>
          <span>2026년 2월 시작</span>
          <span>두 달에 한 편 제작 목표</span>
        </span>
      </section>
      <div className={`shell ${styles.collection}`}>
        {groups.map((group) => (
          <section className={styles.group} aria-labelledby={group.id} key={group.id}>
            <div className={styles.groupHead}>
              <h2 id={group.id}>{group.title}</h2>
              <span>{group.projects.length}종</span>
            </div>
            <MiniProjectGrid projects={group.projects} />
          </section>
        ))}
      </div>
    </PageFrame>
  );
}
