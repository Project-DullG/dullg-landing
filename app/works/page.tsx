import type { Metadata } from "next";
import Link from "next/link";
import { Kicker, PageFrame } from "@/components/site";

export const metadata: Metadata = { title: "작품과 펀딩 · 단서공방", description: "단서공방(ProjectDullG)이 공개한 머더미스터리, 인터랙티브 콘텐츠와 텀블벅 펀딩 기록을 소개합니다." };

const works = [
  { status: "출시", title: "뱀이 죽은 축제", meta: "4인 · 120분 · 실물 보드게임", body: "비밀 사교회의 잠긴 예배실에서 벌어진 살인 사건을 다룬 머더미스터리.", href: "https://tumblbug.com/projectdg0" },
  { status: "앱 공개", title: "잿빛 소녀가 죽은 추억(醜憶)", meta: "4인 · 150분 · UZU", body: "세계관의 고유한 규칙과 작은 단서를 연결해 진실을 찾는 고난도 판타지 미스터리.", href: "https://www.uzu-app.com/ko/scenario/15536" },
  { status: "펀딩 공개", title: "레드가 죽은 연구소", meta: "4인 머더미스터리", body: "비밀 연구소와 다섯 영웅을 중심으로 전개되는 사건입니다.", href: "https://tumblbug.com/projectdg1" },
  { status: "펀딩 공개", title: "의사가 너무 많아!", meta: "6인 머더미스터리", body: "왕을 치료하기 위해 모인 여섯 의사와 한 시간 뒤 벌어진 죽음을 다룬 작품입니다.", href: "https://tumblbug.com/projectdg1" },
  { status: "펀딩 공개", title: "미식의 대가", meta: "4인 머더미스터리", body: "왕실 요리사 선발 대회에서 벌어진 죽음과 요리에 남은 단서를 파헤치는 이야기입니다.", href: "https://tumblbug.com/projectdg1" },
];

export default function WorksPage() {
  return <PageFrame>
    <section className="works-hero shell"><div><Kicker>작품과 기록</Kicker><h1>단서에서 시작해,<br />하나의 경험으로.</h1></div><p>단서공방은 머더미스터리와 서사 기반 콘텐츠를 만듭니다. 서로 다른 정보가 대화가 되고, 함께 맞춘 근거가 하나의 결론으로 이어지는 경험을 설계합니다.</p></section>

    <section className="work-showcase shell" aria-label="대표 작품">
      <a href="https://tumblbug.com/projectdg0" target="_blank" rel="noreferrer"><img src="/assets/works/snake-carnival-cover.webp" width="1000" height="1000" alt="검은색 실물 패키지로 제작된 뱀이 죽은 축제" /><span>첫 번째 텀블벅 프로젝트</span><strong>뱀이 죽은 축제</strong><small>작품과 펀딩 기록 보기 ↗</small></a>
      <a href="https://tumblbug.com/projectdg1" target="_blank" rel="noreferrer"><img src="/assets/works/murder-mystery-three-cover.webp" width="1000" height="1000" alt="레드가 죽은 연구소, 미식의 대가, 의사가 너무 많아 실물 패키지 3종" /><span>두 번째 텀블벅 프로젝트</span><strong>머더미스터리 3종</strong><small>작품과 펀딩 기록 보기 ↗</small></a>
    </section>

    <section className="work-ledger shell" aria-labelledby="work-list-title">
      <div className="work-ledger-head"><Kicker>포트폴리오</Kicker><h2 id="work-list-title">공개된 작품과 다음 이야기</h2><p>2026년 9월 기준 공식 홈페이지와 플랫폼에서 확인되는 기록입니다.</p></div>
      <div className="work-ledger-list">{works.map((work,index)=><a href={work.href} target="_blank" rel="noreferrer" key={work.title}><span>{String(index+1).padStart(2,"0")}</span><div><small>{work.status}</small><h3>{work.title}</h3><b>{work.meta}</b><p>{work.body}</p></div><i aria-hidden="true">↗</i></a>)}</div>
    </section>

    <section className="funding-proof"><div className="shell">
      <div className="funding-proof-head"><Kicker>텀블벅 펀딩</Kicker><h2>두 번의 펀딩으로<br />작품을 실물화했습니다.</h2></div>
      <div className="funding-projects">
        <a href="https://tumblbug.com/projectdg0" target="_blank" rel="noreferrer"><small>2025.09.09—10.11 · 프로젝트 성공</small><h3>4인용 머더미스터리<br />〈뱀이 죽은 축제〉</h3><dl><div><dt>모인 금액</dt><dd>9,001,000원</dd></div><div><dt>후원자</dt><dd>250명</dd></div><div><dt>달성률</dt><dd>180%</dd></div></dl><span>텀블벅에서 보기 ↗</span></a>
        <a href="https://tumblbug.com/projectdg1" target="_blank" rel="noreferrer"><small>2026.03.16—04.20 · 프로젝트 성공</small><h3>깊은 서사와 맑은 추리.<br />머더미스터리 3종</h3><dl><div><dt>모인 금액</dt><dd>19,296,000원</dd></div><div><dt>후원자</dt><dd>193명</dd></div><div><dt>달성률</dt><dd>1,929%</dd></div></dl><span>텀블벅에서 보기 ↗</span></a>
      </div><p className="funding-source">금액·인원·기간은 각 텀블벅 프로젝트 공개 페이지 기준입니다.</p>
    </div></section>

    <section className="education-bridge shell"><div><Kicker>교육 콘텐츠</Kicker><h2>창작 경험을 수업으로 확장합니다.</h2></div><p>현재는 이야기와 단서를 읽고 근거를 설명하는 영어 미스터리 수업팩을 시제품으로 다듬고 있습니다. 기존 작품과 달리 교육 현장에서의 운영 가능성은 파일럿을 통해 별도로 검증합니다.</p><Link href="/academy">수업팩 살펴보기 →</Link></section>
  </PageFrame>;
}
