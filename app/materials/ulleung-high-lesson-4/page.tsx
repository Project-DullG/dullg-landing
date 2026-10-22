import { useLocale } from "next-intl";
import Link from "@/components/i18n/link";
import { PageFrame } from "@/components/site";
import { PresentationViewer } from "@/components/presentation-viewer";
import { SourceLanguageNote } from "@/components/i18n/source-language-note";
import { localizeMetadata } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/metadata";
import { lesson4, lesson4Slides } from "@/lib/lesson4";
import styles from "../ulleung-high-living-lab/page.module.css";
import lessonStyles from "./page.module.css";

export async function generateMetadata() {
  return localizeMetadata(pageMetadata(lesson4.href));
}

export default function LessonFourPage() {
  const en = useLocale() === "en";
  return (
    <PageFrame>
      <article className={`shell ${styles.page}`}>
        <Link className={styles.back} href="/materials">
          {en ? "← Resource library" : "← 수강생 자료실"}
        </Link>
        <header className={styles.header}>
          <div>
            <p>
              {en ? "Session 4" : "4차시"} · 16:00–17:00 · 60{en ? " min" : "분"} ·{" "}
              {lesson4.titles.length}
              {en ? " pages" : "쪽"}
            </p>
            <h1>{en ? "Ulleung High School Living Lab · Session 4" : lesson4.title}</h1>
          </div>
          <div className={lessonStyles.downloads}>
            <a href={`${lesson4.pdf}?v=${lesson4.version}`} download>
              {en ? "Download PDF ↓" : "PDF 다운로드 ↓"}
            </a>
            <a href={`${lesson4.pptx}?v=${lesson4.version}`} download>
              {en ? "Download editable PPT ↓" : "편집용 PPT 다운로드 ↓"}
            </a>
          </div>
        </header>
        <p className={styles.note}>
          {en
            ? "A 60-minute class on designing regional tourism board games or hands-on learning kits with AI. Use historical and tourism sources, compare proposals, and develop one direction into a concept plan and a design plan. The 24 slides include prompting practice, component and activity examples, and peer review."
            : "16:00~17:00, 60분 동안 AI와 함께 지역 관광 보드게임 또는 체험형 교구를 기획합니다. 역사·관광자료를 바탕으로 제안을 비교하고 한 방향을 골라, 기획안과 설계안을 작성합니다. 프롬프팅 실습, 구성품·활동 설계 예시, 팀 간 공유와 보완을 24장에 담았습니다."}
        </p>
        <SourceLanguageNote />
        <PresentationViewer slides={lesson4Slides(en)} />
        <Link className={styles.activityLink} href="/materials/ulleung-high-lesson-2">
          {en ? "View session 3 materials →" : "3차시 수업자료 보기 →"}
        </Link>
      </article>
    </PageFrame>
  );
}
