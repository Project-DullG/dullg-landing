import {
  ArrowRight,
  ArrowUpRight,
  BookOpenText,
  ChartBar,
  FileText,
  FolderOpen,
  Printer,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { DashboardPreview } from "@/components/dashboard-preview";
import { Kicker, PageFrame } from "@/components/site";
import { SectionHead } from "@/components/section-head";
import { educationFacts as facts, episodeFullTitle, episodeTitle } from "@/lib/education";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("/academy", { title: "영어 미스터리 수업팩" });

const tools = [
  { title: "학원생 등록과 반 편성", body: "이름·학년·연락처를 등록하고 반에 배정합니다." },
  { title: "차시별 점수와 참여도", body: "4차시마다 점수와 참여도(상·중·하), 메모를 남깁니다." },
  {
    title: "일반 시험 성적과 리포트",
    body: "과목별 시험 점수까지 한곳에서 보고 반별·기간별로 비교합니다.",
  },
  { title: "학생 본인 조회", body: "학생은 학원 코드로 계정을 연결해 자기 성적만 확인합니다." },
];

const pathways = [
  {
    number: "01",
    title: "4차시 수업 흐름",
    body: "단서를 읽는 첫 시간부터 팀 사건보고서를 쓰는 마지막 시간까지 확인합니다.",
    href: "/academy/curriculum",
    cta: "커리큘럼",
    icon: BookOpenText,
  },
  {
    number: "02",
    title: "수업 자료 구성",
    body: "학생용 카드, 워크북, 교사용 진행안과 결과물 예시를 살펴봅니다.",
    href: "/academy/sample",
    cta: "자료 미리보기",
    icon: FolderOpen,
  },
  {
    number: "03",
    title: "수업용 에피소드",
    body: "첫 수업에 사용하는 사건의 배경과 등장인물을 스포일러 없이 소개합니다.",
    href: "/episode",
    cta: "에피소드",
    icon: FileText,
  },
  {
    number: "04",
    title: "파일럿 운영",
    body: "문의부터 일정 조율, 수업 운영과 피드백까지의 절차를 안내합니다.",
    href: "/academy/pilot",
    cta: "운영 안내",
    icon: Printer,
  },
  {
    number: "05",
    title: "학원 운영 도구",
    body: "학원생·반·성적을 정리하는 대시보드를 소개합니다.",
    href: "#tools",
    cta: "운영 도구",
    icon: ChartBar,
  },
];

export default function AcademyPage() {
  return (
    <PageFrame>
      <section className="academy-overview-hero shell">
        <div>
          <SectionHead
            as="h1"
            kicker="영어 미스터리 수업팩"
            title={
              <>
                영어 단서를 읽고,
                <br />
                <em>근거를 말하고 씁니다.</em>
              </>
            }
            lead="학생마다 다른 단서를 읽고 서로 질문합니다. 마지막에는 선택한 근거와 판단을 영어 사건보고서로 정리합니다."
          />
          <div className="academy-overview-actions">
            <Link className="button button-dark" href="/academy/sample">
              자료 미리보기 <ArrowRight size={17} weight="bold" aria-hidden="true" />
            </Link>
            <Link href="/contact">
              교육 문의 <ArrowRight size={17} weight="bold" aria-hidden="true" />
            </Link>
          </div>
        </div>
        <figure className="academy-overview-cover">
          <Image
            src="/assets/dullg/rulebook-cover.png"
            width={944}
            height={1330}
            alt={`${episodeFullTitle} 규칙서 표지`}
            sizes="(max-width: 760px) 82vw, 38vw"
            priority
          />
          <figcaption>CASE FILE 01 · {episodeTitle}</figcaption>
        </figure>
      </section>

      <section className="academy-overview-facts shell" aria-label="수업팩 운영 조건">
        {facts.map(([value, label]) => (
          <div key={value}>
            <b>{value}</b>
            <span>{label}</span>
          </div>
        ))}
      </section>

      <section className="academy-overview-map">
        <div className="shell">
          <SectionHead
            className="academy-overview-map-head"
            kicker="구성 안내"
            title={
              <>
                필요한 내용을
                <br />
                <em>항목별로 확인하세요.</em>
              </>
            }
            lead="각 페이지는 수업 흐름, 자료, 에피소드와 운영 절차 중 한 가지 내용만 설명합니다."
          />
          <div className="academy-overview-pathways">
            {pathways.map(({ icon: Icon, ...item }) => (
              <Link href={item.href} key={item.number}>
                <span className="academy-overview-path-number">{item.number}</span>
                <span className="academy-overview-path-icon" aria-hidden="true">
                  <Icon size={28} weight="duotone" />
                </span>
                <span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </span>
                <strong>
                  {item.cta}
                  <ArrowUpRight size={17} weight="bold" aria-hidden="true" />
                </strong>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="academy-tools" id="tools" aria-labelledby="academy-tools-title">
        <div className="shell academy-tools-grid">
          <div>
            <Kicker>운영 도구</Kicker>
            <h2 id="academy-tools-title">
              수업만 드리지 않습니다.
              <br />
              <em>학원 운영까지 함께 정리합니다.</em>
            </h2>
            <p>
              수업팩과 함께 웹 대시보드를 제공합니다. 학원생과 반을 등록하고 차시별 점수를 남기면,
              리포트와 학생 본인 조회 화면이 자동으로 만들어집니다.
            </p>
            <ul className="academy-tools-list">
              {tools.map((t) => (
                <li key={t.title}>
                  <b>{t.title}</b>
                  <span>{t.body}</span>
                </li>
              ))}
            </ul>
            <div className="academy-overview-actions">
              <Link className="button button-dark" href="/academy/pilot">
                무료 검토팩 요청 <ArrowRight size={17} weight="bold" aria-hidden="true" />
              </Link>
              <Link href="/login">
                학원 관리 로그인 <ArrowRight size={17} weight="bold" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <DashboardPreview />
        </div>
      </section>

      <section className="academy-overview-pilot">
        <div className="shell academy-overview-pilot-grid">
          <div>
            <Kicker>현재 상태</Kicker>
            <h2>
              정식 출시 전<br />
              <em>파일럿 준비 단계입니다.</em>
            </h2>
          </div>
          <div>
            <p>
              현재 공개한 자료는 수업용 시제품입니다. 실제 운영 가능성과 학생 결과물은 파일럿에서
              확인한 뒤 안내하겠습니다.
            </p>
            <Link className="button button-light" href="/academy/pilot">
              파일럿 안내 보기 <ArrowRight size={17} weight="bold" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </PageFrame>
  );
}
