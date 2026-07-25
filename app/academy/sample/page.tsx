import type { Metadata } from "next";
import { ArrowButton, Kicker, PageFrame } from "@/components/site";

export const metadata: Metadata = {
  title: "Sample Materials · DullG",
  description: "보충반의 사라진 열쇠 — 실제 수업 자료 샘플. 단서 카드, 교사용 진행안, 학생 기록지를 미리 확인하세요.",
};

export default function SamplePage() {
  return <PageFrame><section className="inner-hero shell"><Kicker>SAMPLE MATERIALS · CASE FILE 01</Kicker><h1>열쇠가 사라진 순간,<br /><em>수업은 사건이 됩니다.</em></h1><p>재시험을 시작하려던 순간, 원장실 벽면의 열쇠가 사라졌습니다. 아래 자료는 학생들이 단서를 읽고 서로의 말을 비교하며, 하나의 결론을 만들어가는 미스터리 추리 콘텐츠의 실제 장면입니다.</p></section><section className="sample-grid shell"><article className="sample-card sample-clue"><img src="/assets/dullg/card-cover-1.png" alt="윤지원 단서 카드 표지" loading="lazy" /><div><span className="sample-label">ITEM CARD / 01</span><h2>윤지원의<br /><em>단서 카드</em></h2></div></article><article className="sample-card sample-workbook"><img src="/assets/dullg/card-body-1.png" alt="실제 단서 카드 내용" loading="lazy" /><div><span className="sample-label">EVIDENCE / READ</span><h2>읽고, 찾고,<br /><em>연결하기</em></h2></div></article><article className="sample-card sample-report"><img src="/assets/dullg/rulebook-flow.png" alt="룰북의 게임 흐름 안내 페이지" loading="lazy" /><div><span className="sample-label">GUIDE / PLAY FLOW</span><h2>역할·단서·라운드로<br /><em>수업을 진행합니다.</em></h2></div></article></section><section className="sample-gallery shell"><div><Kicker>REAL MATERIALS</Kicker><h2>사건을 이해하는<br /><span>교실과 자료.</span></h2><p>교실의 분위기와 실제 활동 자료가 한 장면 안에서 연결됩니다.</p></div><div className="gallery-images"><figure><img src="/assets/dullg/classroom-case.png" alt="잠긴 보관함과 단서 자료가 놓인 밝은 교실" loading="lazy" /><figcaption>사건이 시작되는 교실</figcaption></figure><figure><img src="/assets/dullg/students-investigation.png" alt="학생들이 단서와 평면도를 함께 살펴보는 장면" loading="lazy" /><figcaption>단서를 함께 읽는 시간</figcaption></figure></div></section><section className="sample-bottom shell"><div><Kicker>WHAT WE SHARE</Kicker><h2>검토팩에는<br /><span>필요한 만큼만.</span></h2></div><ul><li>원장 검토팩 1p</li><li>4차시 커리큘럼</li><li>1회차 학생용 단서 카드</li><li>교사용 진행안 샘플</li><li>10명 반 수익 계산표</li></ul><ArrowButton href="/#apply">샘플 자료 요청</ArrowButton></section></PageFrame>;
}
