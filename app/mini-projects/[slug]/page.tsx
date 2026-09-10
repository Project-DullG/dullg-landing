import { getText, localizeMetadata } from "@/lib/i18n/server";
import Link from "@/components/i18n/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Kicker, PageFrame } from "@/components/site";
import { GamePlayer } from "@/components/mini-games/game-player";
import { TableGamePlayer } from "@/components/mini-games/table-game-player";
import { miniProjects, getMiniProject, isArcadeGame } from "@/lib/mini-projects";
import styles from "@/components/mini-games/games.module.css";
type Props = {
  params: Promise<{
    slug: string;
  }>;
};
export const generateStaticParams = () => miniProjects.map(({ slug }) => ({ slug }));
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getMiniProject((await params).slug);
  if (!project) return localizeMetadata({});
  return localizeMetadata({
    title: project.title,
    description: project.description,
    alternates: { canonical: `/mini-projects/${project.slug}` },
    openGraph: {
      title: `${project.title} · 단서공방`,
      description: project.description,
      url: `/mini-projects/${project.slug}`,
    },
  });
}
export default async function MiniProjectPage({ params }: Props) {
  const t = await getText();
  const project = getMiniProject((await params).slug);
  if (!project) notFound();
  return (
    <PageFrame>
      <div className={`shell ${styles.detail}`}>
        <nav className={styles.breadcrumb} aria-label={t("현재 위치")}>
          <Link href="/">{t("홈")}</Link>
          <span>/</span>
          <Link href="/mini-projects">{t("미니 프로젝트")}</Link>
          <span>/</span>
          <span aria-current="page">{t(project.title)}</span>
        </nav>
        <div
          className={`${styles.detailLayout} ${!isArcadeGame(project.slug) ? styles.tableDetailLayout : ""}`}
        >
          <div className={styles.info}>
            <Kicker>
              {t(project.genre)}
              {t("\u00B7 1인 플레이")}
            </Kicker>
            <h1>{t(project.title)}</h1>
            <p>{t(project.description)}</p>
            <section>
              <h2>{t("조작법")}</h2>
              <ul>{t(project.controls.map((control) => <li key={control}>{t(control)}</li>))}</ul>
              {t(
                isArcadeGame(project.slug) && (
                  <p>{t("모바일에서는 게임판 아래 버튼을 사용하세요.")}</p>
                ),
              )}
            </section>
            <section>
              <h2>{t("게임 규칙")}</h2>
              <p>{t(project.rules)}</p>
            </section>
            <section>
              <h2>{t("제작 내용")}</h2>
              <p>{t(project.implementation)}</p>
              <dl>
                <div>
                  <dt>{t("제작")}</dt>
                  <dd>{t("단서공방(ProjectDullG)")}</dd>
                </div>
                <div>
                  <dt>{t("구현")}</dt>
                  <dd>TypeScript · {t(isArcadeGame(project.slug) ? "Canvas" : "React")}</dd>
                </div>
              </dl>
            </section>
            <section>
              <h2>
                {t("최근 보완 내용")}
                <small className={styles.updateDate}>{project.updatedOn ?? "2026.09.08"}</small>
              </h2>
              <ul>{t(project.updates.map((update) => <li key={update}>{t(update)}</li>))}</ul>
              {t(
                isArcadeGame(project.slug) && (
                  <p>
                    {t(
                      "효과음 켜기\u00B7끄기, 이 브라우저의 최고 기록 저장, 전체 화면을 지원합니다.",
                    )}
                  </p>
                ),
              )}
            </section>
            <details className={styles.credits}>
              <summary>{t("사용한 에셋과 라이선스")}</summary>
              {t(
                isArcadeGame(project.slug) ? (
                  <p>
                    {t("그래픽:")}
                    {t(" ")}
                    <a
                      href={
                        project.slug === "lane-shift"
                          ? "https://kenney.nl/assets/racing-pack"
                          : "https://kenney.nl/assets/puzzle-pack-2"
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      Kenney · {t(project.slug === "lane-shift" ? "Racing Pack" : "Puzzle Pack 2")}{" "}
                      ↗
                    </a>
                  </p>
                ) : (
                  <p>{t("고전 게임의 규칙을 바탕으로 게임판과 조작을 직접 구현했습니다.")}</p>
                ),
              )}
              <p>
                {t("효과음:")}
                {t(" ")}
                <a
                  href="https://kenney.nl/assets/interface-sounds"
                  target="_blank"
                  rel="noreferrer"
                >
                  Kenney · Interface Sounds ↗
                </a>
              </p>
              <p>{t("외부 그래픽과 효과음은 CC0 라이선스입니다.")}</p>
            </details>
          </div>
          {t(
            isArcadeGame(project.slug) ? (
              <GamePlayer key={project.slug} kind={project.slug} title={t(project.title)} />
            ) : (
              <TableGamePlayer key={project.slug} kind={project.slug} />
            ),
          )}
        </div>
        <nav className={styles.other} aria-label={t("다른 미니 프로젝트")}>
          <span>{t("다른 게임")}</span>
          {t(
            miniProjects
              .filter((item) => item.slug !== project.slug)
              .slice(0, 3)
              .map((item) => (
                <Link key={item.slug} href={`/mini-projects/${item.slug}`}>
                  {t(item.title)} →
                </Link>
              )),
          )}
          <Link href="/mini-projects">{t("전체 목록 →")}</Link>
        </nav>
      </div>
    </PageFrame>
  );
}
