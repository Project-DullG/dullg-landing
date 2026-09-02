import { ArrowRight, ArrowUpRight, BookOpenText, FileText, FolderOpen, Printer } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { Kicker, PageFrame } from "@/components/site";

export const metadata: Metadata = {
  title: "영어 미스터리 수업팩 · 단서공방",
  description: "영어 단서를 읽고 질문하며 사건보고서를 완성하는 4차시 미스터리 수업팩의 구성과 현재 준비 상태를 확인하세요.",
};

const facts = [
  ["4차시", "읽기부터 사건보고서까지"],
  ["초6~중1", "첫 파일럿 검토 기준"],
  ["4~16명", "권장 수업 인원"],
  ["30분 이내", "첫 수업 준비 목표"],
];

const pathways = [
  { number: "01", title: "4차시 수업 흐름", body: "단서를 읽는 첫 시간부터 팀 사건보고서를 쓰는 마지막 시간까지 확인합니다.", href: "/academy/curriculum", cta: "커리큘럼", icon: BookOpenText },
  { number: "02", title: "수업 자료 구성", body: "학생용 카드, 워크북, 교사용 진행안과 결과물 예시를 살펴봅니다.", href: "/academy/sample", cta: "자료 미리보기", icon: FolderOpen },
  { number: "03", title: "수업용 에피소드", body: "첫 수업에 사용하는 사건의 배경과 등장인물을 스포일러 없이 소개합니다.", href: "/episode", cta: "에피소드", icon: FileText },
  { number: "04", title: "파일럿 운영", body: "문의부터 일정 조율, 수업 운영과 피드백까지의 절차를 안내합니다.", href: "/academy/pilot", cta: "운영 안내", icon: Printer },
];

export default function AcademyPage() {
  return <PageFrame>
    <section className="academy-overview-hero shell">
      <div>
        <Kicker>영어 미스터리 수업팩</Kicker>
        <h1>영어 단서를 읽고,<br /><em>근거를 말하고 씁니다.</em></h1>
        <p>학생마다 다른 단서를 읽고 서로 질문합니다. 마지막에는 선택한 근거와 판단을 영어 사건보고서로 정리합니다.</p>
        <div className="academy-overview-actions">
          <a className="button button-dark" href="/academy/sample">자료 미리보기 <ArrowRight size={17} weight="bold" aria-hidden="true" /></a>
          <a href="/contact">교육 문의 <ArrowRight size={17} weight="bold" aria-hidden="true" /></a>
        </div>
      </div>
      <figure className="academy-overview-cover">
        <img src="/assets/dullg/rulebook-cover.png" alt="영어 미스터리 수업팩 첫 번째 에피소드 표지" />
        <figcaption>CASE FILE 01 · 수업용 시제품</figcaption>
      </figure>
    </section>

    <section className="academy-overview-facts shell" aria-label="수업팩 운영 조건">
      {facts.map(([value,label]) => <div key={value}><b>{value}</b><span>{label}</span></div>)}
    </section>

    <section className="academy-overview-map">
      <div className="shell">
        <div className="academy-overview-map-head">
          <Kicker>구성 안내</Kicker>
          <h2>필요한 내용을<br /><em>항목별로 확인하세요.</em></h2>
          <p>각 페이지는 수업 흐름, 자료, 에피소드와 운영 절차 중 한 가지 내용만 설명합니다.</p>
        </div>
        <div className="academy-overview-pathways">
          {pathways.map(({ icon: Icon, ...item }) => <a href={item.href} key={item.number}>
            <span className="academy-overview-path-number">{item.number}</span>
            <span className="academy-overview-path-icon" aria-hidden="true"><Icon size={28} weight="duotone" /></span>
            <span><h3>{item.title}</h3><p>{item.body}</p></span>
            <strong>{item.cta}<ArrowUpRight size={17} weight="bold" aria-hidden="true" /></strong>
          </a>)}
        </div>
      </div>
    </section>

    <section className="academy-overview-pilot">
      <div className="shell academy-overview-pilot-grid">
        <div><Kicker>현재 상태</Kicker><h2>정식 출시 전<br /><em>파일럿 준비 단계입니다.</em></h2></div>
        <div><p>현재 공개한 자료는 수업용 시제품입니다. 실제 운영 가능성과 학생 결과물은 파일럿에서 확인한 뒤 안내하겠습니다.</p><a className="button button-light" href="/academy/pilot">파일럿 안내 보기 <ArrowRight size={17} weight="bold" aria-hidden="true" /></a></div>
      </div>
    </section>
  </PageFrame>;
}
