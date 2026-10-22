import { useLocale } from "next-intl";
import Link from "@/components/i18n/link";
import { PageFrame } from "@/components/site";
import { PresentationViewer } from "@/components/presentation-viewer";
import { SourceLanguageNote } from "@/components/i18n/source-language-note";
import { CopyResource } from "@/components/copy-resource";
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
              ? "Paste the full Korean prompt into a new AI conversation. Start with one sentence about your idea, or ask for a recommendation. AI will propose options, help you choose and revise, and organize the result into a concept plan and a design document."
              : "프롬프트 전체를 복사해 AI의 새 대화창에 붙여넣으세요. 아이디어 한 줄이나 ‘추천’으로 시작하면 됩니다. AI가 제안한 안을 선택·수정하며 기획안과 설계서를 작성합니다."}
          </p>
          <ol>
            <li>
              {en
                ? "Choose a direction from two or three proposals."
                : "서로 다른 2~3안에서 방향을 고릅니다."}
            </li>
            <li>
              {en
                ? "Refine the audience, material and experience."
                : "대상·소재·줄 경험을 다듬습니다."}
            </li>
            <li>
              {en
                ? "Design the components, flow and ending."
                : "구성 요소·진행 방식·마무리를 설계합니다."}
            </li>
            <li>
              {en
                ? "Choose a first test, then generate both documents."
                : "첫 시험을 정하면 두 문서가 완성됩니다."}
            </li>
          </ol>
          <p>
            {en
              ? "It adapts to board games, hands-on learning kits, mysteries, escape activities, stories, videos, magazines and exhibitions. The prompt is in Korean; blank input fields are optional."
              : "보드게임·체험형 교구·추리·방탈출·이야기·영상·매거진·전시 등 형태에 맞춰 설계합니다. 입력칸은 아는 부분만 채워도 됩니다."}
          </p>
          <CopyResource href={contentDesignWizard.href} en={en} />
          <a href={contentDesignWizard.href} download>
            {en ? "Download wizard prompt (TXT) ↓" : "설계서 위자드 프롬프트 다운로드 (TXT) ↓"}
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
