import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { Kicker, PageFrame } from "@/components/site";

export const metadata: Metadata = {
  title: "제작·활동 기록 · 단서공방",
  description: "단서공방이 공개한 작품, 펀딩과 교육 활동을 날짜순으로 기록합니다.",
};

const records = [
  { date: "2025.09.09—10.11", type: "펀딩", title: "뱀이 죽은 축제", body: "첫 실물 머더미스터리 프로젝트를 텀블벅에서 공개했습니다.", href: "https://tumblbug.com/projectdg0" },
  { date: "2026.03.16—04.20", type: "펀딩", title: "머더미스터리 3종", body: "레드가 죽은 연구소, 미식의 대가, 의사가 너무 많아!를 한 프로젝트로 공개했습니다.", href: "https://tumblbug.com/projectdg1" },
  { date: "2026.09.05", type: "교육", title: "울릉고 리빙랩 특강", body: "울릉도 소재를 게임 기획 활동으로 바꾸는 특강과 공개 자료를 기록했습니다.", href: "/activity/ulleung-high-living-lab" },
  { date: "현재", type: "제작", title: "영어 미스터리 수업팩", body: "영어 단서를 읽고 근거를 쓰는 4차시 수업용 시제품과 파일럿을 준비하고 있습니다.", href: "/academy" },
];

export default function ActivityPage() {
  return <PageFrame>
    <section className="activity-hero shell">
      <div><Kicker>제작·활동 기록</Kicker><h1>완성한 일과<br /><em>진행 중인 일을 기록합니다.</em></h1></div>
      <p>작품 공개, 펀딩과 교육 활동을 날짜순으로 정리합니다. 예정된 일은 완료된 결과와 구분해 표시합니다.</p>
    </section>

    <section className="activity-ledger shell" aria-labelledby="activity-ledger-title">
      <div><Kicker>기록</Kicker><h2 id="activity-ledger-title">단서공방의 작업</h2></div>
      <div className="activity-ledger-list">
        {records.map(record => <a href={record.href} key={`${record.date}-${record.title}`} target={record.href.startsWith("http") ? "_blank" : undefined} rel={record.href.startsWith("http") ? "noreferrer" : undefined}>
          <time>{record.date}</time><span>{record.type}</span><strong>{record.title}</strong><p>{record.body}</p><ArrowUpRight size={17} weight="bold" aria-hidden="true" />
        </a>)}
      </div>
    </section>

    <section className="activity-disclosure">
      <div className="shell">
        <Kicker>기록 기준</Kicker><h2>확인된 내용만 공개합니다.</h2>
        <p>출시한 작품과 종료된 펀딩은 공식 기록을 기준으로 작성합니다. 교육 수업팩과 예정된 활동은 현재 상태를 함께 표시합니다.</p>
      </div>
    </section>
  </PageFrame>;
}
