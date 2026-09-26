import { useLocale } from "next-intl";
import Image from "next/image";
import Link from "@/components/i18n/link";
import { PageFrame } from "@/components/site";
import { CopyResource } from "@/components/copy-resource";
import { StartupTracks } from "@/components/startup-tracks";
import { StartupExamples } from "@/components/startup-examples";
import { StartupLessonReview } from "@/components/startup-lesson-review";
import { localizeMetadata } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/metadata";
import { startupGuide, guideSteps, manualTitles } from "@/lib/startup-guide";
import styles from "./page.module.css";

export async function generateMetadata() { return localizeMetadata(pageMetadata(startupGuide.href)); }

export default function StartupGuide() {
  const en = useLocale() === "en";
  const lang = en ? 1 : 0;
  return <PageFrame><article className={styles.page}>
    <Link href="/materials">{en ? "← Resource library" : "← 수강생 자료실"}</Link>
    <header>
      <p className={styles.note}>{en ? "September 16, 2026 · Online class for students on Ulleungdo" : "2026.09.16 · 울릉도 학생 대상 온라인 강의"}</p>
      <h1>{en ? "Modoo Startup: from an idea to an application" : startupGuide.title}</h1>
      <p>{en ? "Begin with a problem you have noticed. This guide helps you use AI to explore an idea, describe a customer and prepare an application draft. The Korean prompt and application manual are available below." : "모두의 창업, 아이디어 한 줄부터 시작해보세요. 창업을 어떻게 준비할지 막막하다면 평소 겪은 불편부터 적어도 됩니다. AI와 대화하며 고객과 해결 방법을 정리하고 신청서 초안까지 써보는 수업 안내입니다."}</p>
      <p className={styles.note}>{en ? "Check eligibility, application dates and requirements in the current official notice. This is a class guide, not a guarantee of eligibility or selection." : "신청 자격·모집 기간·필수 서류는 해당 회차의 공식 공고에서 확인하세요. 이 페이지는 수업용 안내이며, 누구나 신청하거나 선정될 수 있다는 뜻은 아닙니다."}</p>
      <nav aria-label={en ? "On this page" : "이 페이지 목차"}>
        <a href="#review">{en ? "Class review" : "수업 다시보기"}</a>
        <a href="#tracks">{en ? "Choose a track" : "분야 선택 안내"}</a>
        <a href="#examples">{en ? "Idea examples" : "아이디어 예시"}</a>
        <a href="#practice">{en ? "Follow the steps" : "따라 하기"}</a><a href="#files">{en ? "Prompt and files" : "프롬프트·파일"}</a><a href="#manual">{en ? "Application screens" : "신청 화면 보기"}</a><a href="#check">{en ? "Before submitting" : "제출 전 점검"}</a>
      </nav>
    </header>
    <StartupLessonReview en={en} />
    <StartupTracks en={en} />
    <StartupExamples en={en} />
    <section id="practice"><h2>{en ? "Use AI to develop your own thinking" : "AI와 대화하며 생각을 구체화하세요"}</h2>
      <p>{en ? "Start at the step that fits your situation. If you already have an idea, skip to the customer and alternatives. Replace the text in brackets with your own information." : "아이디어가 없다면 1단계부터, 이미 있다면 2단계부터 시작하세요. 아래 예시의 대괄호를 자신의 내용으로 바꿔 AI에게 질문하면 됩니다."}</p>
      {guideSteps.map((step, i) => <section className={styles.step} key={i}>
        <h3>{i + 1}. {step.title[lang]}</h3><p>{step.body[lang]}</p>
        <pre>{step.prompt[lang]}</pre><p className={styles.note}>{en ? "What to write down: " : "정리할 내용: "}{step.result[lang]}</p>
      </section>)}
    </section>
    <section id="files"><h2>{en ? "Prompt and downloadable files" : "프롬프트와 다운로드 파일"}</h2>
      <h3>{en ? "Master prompt v2.0 · current version" : "마스터 프롬프트 v2.0 · 현재 버전"}</h3>
      <p>{en ? "The updated prompt covers idea comparison, customer and revenue planning, source research, application drafting and review. It asks AI to distinguish evidence from assumptions and check the current application format. Search and fact-checking still depend on the AI service you use." : "아이디어 비교부터 고객·수익 구조 정리, 근거 조사, 신청서 작성과 검토까지 다루는 새 버전입니다. 확인한 사실과 가정을 구분하고 실제 신청 양식을 대조하도록 구성했습니다. 검색과 사실 확인 가능 여부는 사용하는 AI 서비스에 따라 다릅니다."}</p>
      <p>{en ? "Copy the full Korean prompt into a new AI conversation. Then describe your idea in one or two sentences, or say that you do not have an idea yet. Share the actual application questions before asking for an application draft." : "통합 프롬프트를 복사해 AI의 새 대화창에 붙여넣으세요. 이어서 자신의 아이디어를 한두 줄로 적거나 ‘아이디어 없음’이라고 입력합니다. 신청서까지 작성하려면 실제 신청 문항도 함께 제공하세요."}</p>
      <CopyResource href={startupGuide.prompt} en={en} />
      <div className={styles.downloads}>
        <a href={startupGuide.prompt} download>{en ? "Download master prompt v2.0 (MD)" : "마스터 프롬프트 v2.0 다운로드 (MD)"}</a>
        <a href={startupGuide.pdf} download>{en ? "Download application manual (PDF, 12 pages)" : "2차 신청접수 매뉴얼 다운로드 (PDF·12쪽)"}</a>
      </div>
      <details><summary>{en ? "Previous prompt version" : "이전 프롬프트 버전"}</summary><a href={startupGuide.previousPrompt} download>{en ? "Download prompt v1.2 (MD)" : "통합 프롬프트 v1.2 다운로드 (MD)"}</a></details>
      <p className={styles.note}>{en ? "Files are in Korean. Open the MD file in a text editor. The sample account email has been removed from the public PDF; instructions are otherwise unchanged. Do not paste passwords, ID numbers or contact details into AI chats." : "MD 파일은 메모장 등 텍스트 편집기로 열 수 있습니다. PDF 공개용 사본은 예시 계정의 이메일만 가렸으며 신청 안내 내용은 바꾸지 않았습니다. AI에는 비밀번호·주민등록번호·연락처를 입력하지 마세요."}</p>
    </section>
    <section id="manual"><h2>{en ? "Follow the application screens" : "신청 화면을 보며 따라 하세요"}</h2>
      <p>{en ? "Sign in → review consent → verify your identity → choose a track → enter your idea → select a mentoring institution → check and submit." : "로그인 → 동의 항목 확인 → 본인인증 → 분야 선택 → 아이디어 작성 → 멘토기관 선택 → 최종 확인·제출 순서입니다."}</p>
      <h3>{en ? "Institution selection for this class" : "이번 수업의 신청기관 안내"}</h3>
      <ul>
        <li>{en ? "General/technology track: select Ulsan Metropolitan City, then Innobuild Lab." : "일반·기술 분야: 울산광역시 → 이노빌드랩 선택"}</li>
        <li>{en ? "Local track: select Gyeongbuk Center for Creative Economy & Innovation." : "로컬 분야: 경북창조경제혁신센터 선택"}</li>
      </ul>
      <p className={styles.note}>{en ? "These are the instructor’s institution choices for this class, not a requirement for every applicant. Select the track that fits your idea, then check the institution name on the current application screen before proceeding. If it is not listed, ask the instructor rather than choosing a different institution." : "위 기관은 이번 수업에서 안내하는 선택 기준입니다. 모든 신청자에게 필수인 것은 아닙니다. 아이디어에 맞는 분야를 정한 뒤 실제 신청 화면에서 기관명을 확인하고 다음 단계로 넘어가세요. 목록에 없다면 다른 기관을 임의로 고르지 말고 강사에게 문의하세요."}</p>
      <div className={styles.downloads}><a href="https://www.modoo.or.kr/" target="_blank" rel="noopener noreferrer">{en ? "Official Modoo Startup website ↗" : "모두의 창업 공식 홈페이지 ↗"}</a><a href={startupGuide.pdf} target="_blank" rel="noopener noreferrer">{en ? "Open PDF in a new tab ↗" : "PDF 새 창에서 보기 ↗"}</a></div>
      <details><summary>{en ? "View all 12 pages on this page" : "신청 매뉴얼 12쪽 펼쳐 보기"}</summary>
        {manualTitles.map((title, i) => <figure key={i}>
          <Image src={`/assets/materials/modoo-startup/page-${String(i + 1).padStart(2, "0")}.webp`} width={1516} height={1072} alt={`${i + 1}. ${title[lang]}`} sizes="(max-width: 880px) 100vw, 832px" />
          <figcaption>{i + 1} / 12 · {title[lang]} · <a href={`/assets/materials/modoo-startup/page-${String(i + 1).padStart(2, "0")}.webp`} target="_blank" rel="noopener noreferrer">{en ? "View larger ↗" : "크게 보기 ↗"}</a></figcaption>
        </figure>)}
      </details>
    </section>
    <section id="check"><h2>{en ? "Before submitting" : "제출 전에 확인하세요"}</h2>
      <ul className={styles.checklist}>
        {(en ? ["I checked this round’s eligibility, dates and track requirements.", "The customer, product, price and schedule are consistent across answers.", "I separated completed work from plans and AI assumptions.", "I checked required fields, character limits and attachments against the actual form.", "I checked which optional answers will be publicly visible.", "I checked my contact details and confirmed the submission status."] : ["해당 회차의 신청 자격·기간·분야별 조건을 확인했나요?", "문항마다 고객·상품·가격·일정이 같나요?", "완료한 일과 계획, AI가 제안한 가정을 구분했나요?", "실제 신청 화면의 필수 항목·글자 제한·첨부 기준을 확인했나요?", "홈페이지에 공개되는 선택 문항의 내용을 확인했나요?", "연락처를 확인하고 제출 후 접수 상태까지 확인했나요?"]).map(item => <li key={item}>{item}</li>)}
      </ul>
      <Link href="/activity/ulleung-online-startup-2026">{en ? "Read the September 16 class record →" : "9월 16일 온라인 강의 기록 →"}</Link>
    </section>
  </article></PageFrame>;
}
