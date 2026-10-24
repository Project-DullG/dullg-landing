import { useLocale } from "next-intl";
import Link from "@/components/i18n/link";
import { PageFrame } from "@/components/site";
import { PresentationViewer } from "@/components/presentation-viewer";
import { SourceLanguageNote } from "@/components/i18n/source-language-note";
import { ContentDesignForm } from "@/components/content-design-form";
import { localizeMetadata } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/metadata";
import { lesson4, lesson4Slides } from "@/lib/lesson4";
import { contentDesignWizard } from "@/lib/content-design-wizard";
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
            <a href={lesson4.murderMysteryPrompt} download>
              {en
                ? "Download murder mystery co-creation prompt (MD, Korean) ↓"
                : "머더미스터리 함께 만들기 프롬프트 (MD) ↓"}
            </a>
            <a href={lesson4.boardAndMysteryGamePrompt} download>
              {en
                ? "Download board and mystery game creation prompt (MD, Korean) ↓"
                : "보드게임·추리게임 통합 제작 프롬프트 (MD) ↓"}
            </a>
            <a href={lesson4.detailedPlanningPrompt} download>
              {en
                ? "Download detailed board game and murder mystery plan prompt (MD, Korean) ↓"
                : "보드게임·머더미스터리 기획서 상세형 (MD) ↓"}
            </a>
          </div>
        </header>
        <p className={styles.note}>
          {en
            ? "A 60-minute class on designing regional tourism board games or hands-on learning kits with AI. Use historical and tourism sources, compare proposals, and develop one direction into a concept plan and a design plan. The 24 slides include prompting practice, component and activity examples, and peer review."
            : "16:00~17:00, 60분 동안 AI와 함께 지역 관광 보드게임 또는 체험형 교구를 기획합니다. 역사·관광자료를 바탕으로 제안을 비교하고 한 방향을 골라, 기획안과 설계안을 작성합니다. 프롬프팅 실습, 구성품·활동 설계 예시, 팀 간 공유와 보완을 24장에 담았습니다."}
        </p>
        <SourceLanguageNote />
        <section id="design-wizard" className={lessonStyles.wizard}>
          <h2>{en ? "Create a content design with AI" : "AI와 함께 콘텐츠 설계서 만들기"}</h2>
          <p>
            {en
              ? "Fill in the fields below, then copy your answers and the prompt into a new AI conversation. Choose whether to develop the design through conversation or receive a complete first draft."
              : "아래 칸에 우리 팀의 생각을 적고, 입력한 내용과 프롬프트를 함께 복사하세요. AI와 대화하며 정하거나 기획안·설계서 초안을 한 번에 받을 수 있습니다."}
          </p>
          <ContentDesignForm en={en} />
          <a href={contentDesignWizard.href} download>
            {en
              ? "Download the blank wizard prompt (TXT) ↓"
              : "빈 입력 양식과 기본 프롬프트 받기 (TXT) ↓"}
          </a>
          <p>
            {en
              ? "Use the Korean prompt’s short commands to ask for a recommendation, continue, write immediately, go back or edit a detail. The write-now command skips further questions and drafts both documents using the current information."
              : "짧게 답해도 됩니다: ‘추천’ · ‘계속’ · ‘바로 작성’ · ‘뒤로’ · ‘변경: …’. ‘바로 작성’을 입력하면 추가 질문을 멈추고 현재 내용으로 기획안과 설계서를 작성합니다."}
          </p>
          <details>
            <summary>{en ? "Read the Korean prompt" : "프롬프트 전문 보기"}</summary>
            {en ? (
              <a href={contentDesignWizard.href} target="_blank" rel="noopener noreferrer">
                Open the Korean prompt in a new tab ↗
              </a>
            ) : (
              <pre className={lessonStyles.promptText} lang="ko">
                {contentDesignWizard.prompt}
              </pre>
            )}
          </details>
          <p className={lessonStyles.sourceNote}>
            {en ? "Prompt structure reference: " : "프롬프트 구성 참고: "}
            <a
              href="https://learn.chatgpt.com/docs/prompting"
              target="_blank"
              rel="noopener noreferrer"
            >
              OpenAI Docs
            </a>
          </p>
        </section>
        <PresentationViewer slides={lesson4Slides(en)} />
        <Link className={styles.activityLink} href="/materials/ulleung-high-lesson-2">
          {en ? "View session 3 materials →" : "3차시 수업자료 보기 →"}
        </Link>
      </article>
    </PageFrame>
  );
}
