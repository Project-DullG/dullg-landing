import { useText } from "@/lib/i18n/use-text";
import { localizeMetadata } from "@/lib/i18n/server";
import { PageFrame } from "@/components/site";
import { PageIntro } from "@/components/page-intro";
import { MiniProjectGrid } from "@/components/mini-games/project-grid";
import { pageMetadata } from "@/lib/metadata";
import styles from "@/components/mini-games/games.module.css";
import { miniProjects, isArcadeGame } from "@/lib/mini-projects";
export async function generateMetadata() {
  return localizeMetadata(pageMetadata("/mini-projects"));
}
export default function MiniProjectsPage() {
  const t = useText();
  const groups = [
    {
      id: "puzzle-games",
      title: "퍼즐·카드 게임",
      projects: miniProjects.filter((p) => !isArcadeGame(p.slug) && p.category !== "arcade"),
    },
    {
      id: "arcade-games",
      title: "아케이드 게임",
      projects: miniProjects.filter((p) => isArcadeGame(p.slug) || p.category === "arcade"),
    },
  ];
  return (
    <PageFrame>
      <PageIntro
        title={t("미니 프로젝트")}
        description="단서공방이 만든 퍼즐·카드·아케이드 게임입니다."
      >
        <span className={styles.seriesMeta}>
          <span>{t("2026년 2월 시작")}</span>
          <span>{t("두 달에 한 편 제작 목표")}</span>
        </span>
      </PageIntro>
      <div className={`shell ${styles.collection}`}>
        {t(
          groups.map((group) => (
            <section className={styles.group} aria-labelledby={group.id} key={group.id}>
              <div className={styles.groupHead}>
                <h2 id={group.id}>{t(group.title)}</h2>
                <span>
                  {t(group.projects.length)}
                  {t("종")}
                </span>
              </div>
              <MiniProjectGrid projects={group.projects} />
            </section>
          )),
        )}
      </div>
    </PageFrame>
  );
}
