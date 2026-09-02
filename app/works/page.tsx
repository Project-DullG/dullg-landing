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

    <section className="live-funding" aria-labelledby="live-funding-title"><div className="shell">
      <div className="live-funding-head"><div><Kicker>현재 펀딩 중</Kicker><h2 id="live-funding-title">판타지 그리고 일상.<br />머더미스터리 2종</h2></div><div><b>9월 11일까지</b><p>2026년 9월 2일 확인 · 목표 금액 달성</p><a href="https://tumblbug.com/projectdg2" target="_blank" rel="noreferrer">텀블벅에서 후원하기 ↗</a></div></div>
      <div className="live-work-list">
        <article><img src="/assets/works/slime-soda-cover.webp" width="1000" height="1000" alt="냉동고 안의 슬라임이 그려진 슬라임은 소다맛이 난다 패키지" /><div><small>4–5인 · 60분</small><h3>슬라임은 소다맛이 난다</h3><p>몬스터들이 모여 사는 포포롱 마을. 작은 구조대의 아침을 준비하던 슬라임이 냉동고 안에서 얼어붙은 채 발견됩니다. 한동안 슬라임만 바라보던 다섯 대원은 서로의 얼굴을 살피기 시작합니다.</p><a href="https://murdermysterylog.com/detail/589" target="_blank" rel="noreferrer">머미로그에서 상세 보기 ↗</a></div></article>
        <article><img src="/assets/works/professor-rest-cover.webp" width="1000" height="1000" alt="비어 있는 교수실 의자가 그려진 교수님 편히 쉬세요 패키지" /><div><small>6인 · 90분</small><h3>교수님, 편히 쉬세요</h3><p>청람대학교 연구실 구성원들은 프로젝트가 끝난 뒤 호숫가 연수원으로 향합니다. 모두가 함께 쉬기로 한 다음 날 아침, 박정호 교수는 호숫가 계단 아래에서 죽은 채 발견됩니다.</p><a href="https://murdermysterylog.com/detail/590" target="_blank" rel="noreferrer">머미로그에서 상세 보기 ↗</a></div></article>
      </div>
      <div className="live-funding-stats"><span><small>현재 모인 금액</small><strong>10,940,000원</strong></span><span><small>후원자</small><strong>169명</strong></span><span><small>달성률</small><strong>1,094%</strong></span><p>2026년 9월 2일 텀블벅 공개 페이지 확인 기준. 펀딩 중 수치는 변동될 수 있습니다.</p></div>
    </div></section>

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
