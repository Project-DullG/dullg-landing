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
              <time dateTime={lesson2.date}>2026.09.19</time> · {en ? "54 pages" : "54쪽"}
            </p>
            <h1>{en ? "Ulleung High School Living Lab · Lesson 2" : "울릉고 리빙랩 2차시"}</h1>
          </div>
          <a href={lesson2.pdf} download>
            {en ? "Download PDF ↓" : "PDF 다운로드 ↓"}
          </a>
        </header>
        <p className={styles.note}>
          {en
            ? "September 19 class materials: identify customers, write business notes, assign roles, and plan the next research tasks. The outcomes are business notes, a role chart, and research questions with owners and deadlines."
            : "9월 19일 수업자료입니다. 고객을 찾고 사업 메모를 작성한 뒤, 조직과 역할을 나누고 다음 조사를 계획합니다. 사업 메모, 조직·역할표, 담당자와 마감이 있는 조사 질문을 정리하는 수업입니다."}
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
