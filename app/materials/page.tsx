import type { Metadata } from "next";
import { Kicker, PageFrame } from "@/components/site";

export const metadata: Metadata = {
  title: "수강생 자료실 · 단서공방",
  description: "단서공방 수업 참여자를 위한 안내와 공개 자료를 확인하세요.",
};

const pastClassLinks = [
  { title: "교육 자료", body: "수업 일정, 실습 순서, 예시 프롬프트와 준비 사항", href: "https://kanghoon1204.github.io/ulleung-ecotourism-edu/" },
  { title: "수업 진행 페이지", body: "수업 시간에 따라 실습 내용을 확인하는 진행용 화면", href: "https://kanghoon1204.github.io/ulleung-ecotourism-edu/class.html" },
  { title: "프롬프트 가이드", body: "프롬프트 작성 원리와 단계별 실습 안내", href: "https://kanghoon1204.github.io/ulleung-ecotourism-edu/prompt-guide.html" },
  { title: "웹페이지 예시", body: "교육 중 제작한 울릉도 관광 웹페이지 예시", href: "https://kanghoon1204.github.io/ulleung-ecotourism-edu/example.html" },
  { title: "보드게임 기획 도구", body: "울릉군 생태관광 소재를 보드게임 기획안으로 정리하는 실습 도구", href: "https://kanghoon1204.github.io/ulleung-ecotourism-edu/boardgame.html" },
];

export default function MaterialsPage() {
  return (
    <PageFrame>
      <div className="materials-page">
        <section className="library-hero shell">
          <Kicker>수강생 자료실</Kicker>
          <h1>참여한 수업의 자료를<br />확인하세요.</h1>
          <p>현재 공개된 지난 교육 자료를 모았습니다. 과정 이름을 누르면 세부 자료를 확인할 수 있습니다.</p>
        </section>

        <section className="course-archive shell" aria-label="교육 과정별 자료">
          <details className="course-row course-row-expandable">
            <summary>
              <span><strong>울릉군 생태관광 AI 교육</strong><small>울릉군 · 2026년 4월 18일 · 울릉고등학교 전산실</small></span>
              <b>자료 5개 <i aria-hidden="true">＋</i></b>
            </summary>
            <div className="course-files">
              {pastClassLinks.map((item) => (
                <a key={item.title} href={item.href} target="_blank" rel="noreferrer"><span><strong>{item.title}</strong><small>{item.body}</small></span><b aria-hidden="true">↗</b></a>
              ))}
            </div>
          </details>
        </section>

        <section className="materials-help shell">
          <h2>찾는 자료가 없다면</h2>
          <p>수업명과 필요한 자료를 이메일에 적어 보내주세요. 공개할 수 있는 자료인지 확인한 뒤 답변드리겠습니다.</p>
          <a href="mailto:cluedullg@gmail.com">cluedullg@gmail.com</a>
        </section>
      </div>
    </PageFrame>
  );
}
