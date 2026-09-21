import { useLocale } from "next-intl";
import Link from "@/components/i18n/link";
import { PageFrame } from "@/components/site";
import { PresentationViewer } from "@/components/presentation-viewer";
import { SourceLanguageNote } from "@/components/i18n/source-language-note";
import { localizeMetadata } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/metadata";
import { lesson2, lesson2Slides } from "@/lib/lesson2";
import styles from "../ulleung-high-living-lab/page.module.css";

export async function generateMetadata() {
  return localizeMetadata(pageMetadata(lesson2.href));
}

export default function LessonTwoPage() {
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
              <time dateTime={lesson2.date}>2026.09.19</time> · {lesson2.titles.length}{en ? " pages" : "쪽"}
            </p>
            <h1>{en ? "Ulleung High School Living Lab · Session 3" : "울릉고 리빙랩 3차시"}</h1>
          </div>
          <a href={lesson2.pdf} download>
            {en ? "Download PDF ↓" : "PDF 다운로드 ↓"}
          </a>
        </header>
        <p className={styles.note}>
          {en
            ? "September 19 class materials for the student company project. Review business cases and production costs, write business notes, practice AI task requests, and assign team roles and research tasks."
            : "9월 19일 학생창업회사 프로젝트 수업자료입니다. 실제 창업 사례와 제작 비용을 살펴보고, 사업 메모 작성과 AI 업무 요청을 연습합니다. 팀별 역할과 다음에 조사할 내용도 정리합니다."}
        </p>
        <SourceLanguageNote />
        <PresentationViewer slides={lesson2Slides(en)} />
        <Link className={styles.activityLink} href="/materials/ulleung-high-living-lab">
          {en ? "View September 5 class materials →" : "9월 5일 수업자료 보기 →"}
        </Link>
      </article>
    </PageFrame>
  );
}
