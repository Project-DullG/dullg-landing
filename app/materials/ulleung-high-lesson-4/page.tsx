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
              {en ? "Session 4" : "4차시"} · {lesson4.titles.length}
              {en ? " pages" : "쪽"}
            </p>
            <h1>{en ? "Ulleung High School Living Lab · Session 4" : lesson4.title}</h1>
          </div>
          <div className={lessonStyles.downloads}>
            <a href={lesson4.pdf} download>
              {en ? "Download PDF ↓" : "PDF 다운로드 ↓"}
            </a>
            <a href={lesson4.pptx} download>
              {en ? "Download editable PPT ↓" : "편집용 PPT 다운로드 ↓"}
            </a>
          </div>
        </header>
        <p className={styles.note}>
          {en
            ? "Develop a content idea through a conversation with AI. Compare proposals, make specific revision requests, and organize your team's decisions into a plan. The 32 slides include board game and media examples, prompting exercises, and a sample content plan."
            : "AI와 대화하며 콘텐츠 아이디어를 발전시키는 수업자료입니다. 서로 다른 제안을 비교하고, 구체적으로 수정 요청한 뒤, 팀에서 결정한 내용을 계획서로 정리합니다. 보드게임과 미디어 기획 예시, 프롬프팅 실습, 계획서 예시를 32장에 담았습니다."}
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
