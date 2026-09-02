import type { Metadata } from "next";
import Link from "next/link";
import { Kicker, PageFrame } from "@/components/site";

export const metadata: Metadata = { title: "작품과 펀딩 · 단서공방", description: "단서공방(ProjectDullG)이 공개한 머더미스터리, 인터랙티브 콘텐츠와 텀블벅 펀딩 기록을 소개합니다." };

const works = [
  { status: "출시", title: "뱀이 죽은 축제", meta: "4인 · 120분 · 실물 보드게임", body: "달빛조차 닿지 않는 지하 예배실. 굳게 잠긴 문이 열린 뒤, 제단 위에서 교주가 숨진 채 발견됩니다. 가면을 쓴 네 사람은 각자의 비밀을 지키며 진짜 범인을 찾아야 합니다.", href: "https://tumblbug.com/projectdg0", image: "/assets/works/snake-carnival-cover.webp", alt: "검은색 실물 패키지로 제작된 뱀이 죽은 축제" },
  { status: "앱 공개", title: "잿빛 소녀가 죽은 추억(醜憶)", meta: "4인 · 150분 · UZU", body: "잿빛 머리 소녀가 만든 네 인형과 한 통의 초대장에서 시작되는 판타지 미스터리. 세계관에 숨은 규칙과 작은 단서를 세밀하게 연결해야 진실에 닿을 수 있습니다.", href: "https://www.uzu-app.com/ko/scenario/15536", image: "/assets/works/gray-girl-memory-cover.webp", alt: "잿빛 소녀가 죽은 추억 공식 작품 이미지" },
  { status: "출시", title: "레드가 죽은 연구소", meta: "4인 · 90분 · 실물 보드게임", body: "괴인과의 전투를 마친 다음 날, 레인저들의 구심점인 레드가 잠긴 방에서 숨진 채 발견됩니다. 남은 네 레인저는 비밀 연구소를 조사하며 그날 밤의 일을 되짚습니다.", href: "https://tumblbug.com/projectdg1", image: "/assets/works/red-lab-cover.webp", alt: "검은 패키지로 제작된 레드가 죽은 연구소" },
  { status: "출시", title: "미식의 대가", meta: "4인 · 90분 · 실물 보드게임", body: "왕실 요리사 선발 대회의 비공개 심사가 끝난 순간, 왕실 요리장이 쓰러집니다. 현장에 있던 네 요리사는 접시와 요리에 남은 단서로 범인을 찾아야 합니다.", href: "https://tumblbug.com/projectdg1", image: "/assets/works/gourmet-cover.webp", alt: "검은 패키지로 제작된 미식의 대가" },
  { status: "출시", title: "의사가 너무 많아!", meta: "6인 · 150분 · 실물 보드게임", body: "전국에서 모인 여섯 명의 의사가 국왕의 치료를 마치지만, 왕은 한 시간 뒤 숨을 거둡니다. 명예와 생존을 위해 의사들은 왕의 사인과 진짜 범인을 밝혀야 합니다.", href: "https://tumblbug.com/projectdg1", image: "/assets/works/doctor-cover.webp", alt: "검은 패키지로 제작된 의사가 너무 많아" },
];

export default function WorksPage() {
  return <PageFrame>
    <section className="works-hero shell"><div><Kicker>작품과 기록</Kicker><h1>단서에서 시작해,<br />하나의 경험으로.</h1></div><p>단서공방은 머더미스터리와 서사 기반 콘텐츠를 만듭니다. 서로 다른 정보가 대화가 되고, 함께 맞춘 근거가 하나의 결론으로 이어지는 경험을 설계합니다.</p></section>

    <section className="live-funding" aria-labelledby="live-funding-title"><div className="shell">
      <div className="live-funding-head"><div><Kicker>현재 펀딩 중</Kicker><h2 id="live-funding-title">판타지 그리고 일상.<br />머더미스터리 2종</h2></div><div><b>9월 11일까지</b><p>2026년 9월 2일 확인 · 목표 금액 달성</p><a href="https://tumblbug.com/projectdg2" target="_blank" rel="noreferrer">텀블벅에서 후원하기 ↗</a></div></div>
      <div className="live-work-list">
        <article><img src="/assets/works/slime-soda-cover.webp" width="1000" height="1000" alt="냉동고 안의 슬라임이 그려진 슬라임은 소다맛이 난다 패키지" /><div><small>4–5인 · 60분</small><h3>슬라임은 소다맛이 난다</h3><p>몬스터들이 모여 사는 포포롱 마을. 작은 구조대의 아침을 준비하던 슬라임이 냉동고 안에서 얼어붙은 채 발견됩니다. 한동안 슬라임만 바라보던 다섯 대원은 서로의 얼굴을 살피기 시작합니다.</p></div></article>
        <article><img src="/assets/works/professor-rest-cover.webp" width="1000" height="1000" alt="비어 있는 교수실 의자가 그려진 교수님 편히 쉬세요 패키지" /><div><small>6인 · 90분</small><h3>교수님, 편히 쉬세요</h3><p>청람대학교 연구실 구성원들은 프로젝트가 끝난 뒤 호숫가 연수원으로 향합니다. 모두가 함께 쉬기로 한 다음 날 아침, 박정호 교수는 호숫가 계단 아래에서 죽은 채 발견됩니다.</p></div></article>
      </div>
      <div className="live-funding-stats"><span><small>현재 모인 금액</small><strong>10,940,000원</strong></span><span><small>후원자</small><strong>169명</strong></span><span><small>달성률</small><strong>1,094%</strong></span><p>2026년 9월 2일 텀블벅 공개 페이지 확인 기준. 펀딩 중 수치는 변동될 수 있습니다.</p></div>
    </div></section>

    <section className="work-ledger shell" aria-labelledby="work-list-title">
      <div className="work-ledger-head"><Kicker>포트폴리오</Kicker><h2 id="work-list-title">작품마다 다른 세계와 사건</h2><p>공개된 작품을 이미지와 함께 한 편씩 소개합니다.</p></div>
      <div className="portfolio-list">{works.map((work,index)=><article key={work.title}><figure><img src={work.image} width="1000" height="1000" alt={work.alt} loading="lazy" /></figure><div><span>{String(index+1).padStart(2,"0")} · {work.status}</span><h3>{work.title}</h3><b>{work.meta}</b><p>{work.body}</p><a href={work.href} target="_blank" rel="noreferrer">공식 페이지에서 보기 ↗</a></div></article>)}</div>
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
