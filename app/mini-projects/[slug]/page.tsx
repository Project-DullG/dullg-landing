import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Kicker, PageFrame } from "@/components/site";
import { GamePlayer } from "@/components/mini-games/game-player";
import { miniProjects, getMiniProject } from "@/lib/mini-projects";
import styles from "@/components/mini-games/games.module.css";

type Props = { params: Promise<{ slug: string }> };
export const generateStaticParams = () => miniProjects.map(({ slug }) => ({ slug }));
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getMiniProject((await params).slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `/mini-projects/${project.slug}` },
    openGraph: {
      title: `${project.title} · 단서공방`,
      description: project.description,
      url: `/mini-projects/${project.slug}`,
    },
  };
}
export default async function MiniProjectPage({ params }: Props) {
  const project = getMiniProject((await params).slug);
  if (!project) notFound();
  return (
    <PageFrame>
      <div className={`shell ${styles.detail}`}>
        <nav className={styles.breadcrumb} aria-label="현재 위치">
          <Link href="/">홈</Link>
          <span>/</span>
          <Link href="/mini-projects">미니 프로젝트</Link>
          <span>/</span>
          <span aria-current="page">{project.title}</span>
        </nav>
        <div className={styles.detailLayout}>
          <div className={styles.info}>
            <Kicker>{project.genre} · 1인 플레이</Kicker>
            <h1>{project.title}</h1>
            <p>{project.description}</p>
            <section>
              <h2>조작법</h2>
              <ul>
                {project.controls.map((control) => (
                  <li key={control}>{control}</li>
                ))}
              </ul>
              <p>모바일에서는 게임판 아래 버튼을 사용하세요.</p>
            </section>
            <section>
              <h2>게임 규칙</h2>
              <p>{project.rules}</p>
            </section>
            <section>
              <h2>제작 내용</h2>
              <p>{project.implementation}</p>
              <dl>
                <div>
                  <dt>제작</dt>
                  <dd>단서공방(ProjectDullG)</dd>
                </div>
                <div>
                  <dt>시리즈</dt>
                  <dd>2026년 2월 시작 · 두 달에 한 편 제작 목표</dd>
                </div>
                <div>
                  <dt>구현</dt>
                  <dd>TypeScript · Canvas</dd>
                </div>
              </dl>
            </section>
            <section>
              <h2>
                최근 보완 내용 <small className={styles.updateDate}>2026.09.08</small>
              </h2>
              <ul>
                {project.updates.map((update) => (
                  <li key={update}>{update}</li>
                ))}
              </ul>
              <p>효과음 켜기·끄기, 이 브라우저의 최고 기록 저장, 전체 화면을 지원합니다.</p>
            </section>
            <details className={styles.credits}>
              <summary>사용한 에셋과 라이선스</summary>
              <p>
                그래픽:{" "}
                <a
                  href={
                    project.slug === "lane-shift"
                      ? "https://kenney.nl/assets/racing-pack"
                      : "https://kenney.nl/assets/puzzle-pack-2"
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  Kenney · {project.slug === "lane-shift" ? "Racing Pack" : "Puzzle Pack 2"} ↗
                </a>
              </p>
              <p>
                효과음:{" "}
                <a
                  href="https://kenney.nl/assets/interface-sounds"
                  target="_blank"
                  rel="noreferrer"
                >
                  Kenney · Interface Sounds ↗
                </a>
              </p>
              <p>모두 CC0 에셋입니다. 게임 기획·프로그래밍과 에셋 제작자를 구분해 표기합니다.</p>
            </details>
          </div>
          <GamePlayer key={project.slug} kind={project.slug} title={project.title} />
        </div>
        <nav className={styles.other} aria-label="다른 미니 프로젝트">
          <span>다른 게임도 플레이해 보세요.</span>
          {miniProjects
            .filter((item) => item.slug !== project.slug)
            .map((item) => (
              <Link key={item.slug} href={`/mini-projects/${item.slug}`}>
                {item.title} →
              </Link>
            ))}
        </nav>
      </div>
    </PageFrame>
  );
}
