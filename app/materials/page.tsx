import type { Metadata } from "next";
import Link from "next/link";
import { Kicker, PageFrame } from "@/components/site";

export const metadata: Metadata = {
  title: "수강생 자료실 · 단서공방",
  description: "단서공방 수업 참여자를 위한 안내와 공개 자료를 확인하세요.",
};

const resources = [
  { state: "공개", title: "수업 자료 미리보기", body: "학생용 단서 카드와 워크북, 교사용 진행안의 구성을 볼 수 있습니다.", href: "/academy/sample" },
  { state: "안내", title: "4차시 수업 흐름", body: "사건을 읽는 첫 시간부터 사건보고서를 쓰는 마지막 시간까지 정리했습니다.", href: "/academy/curriculum" },
  { state: "준비 중", title: "수강생용 보충 자료", body: "파일럿 수업을 진행한 뒤 실제로 필요한 자료를 확인해 추가할 예정입니다.", href: null },
];

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
          <h1>필요한 수업 자료를<br />바로 찾아보세요.</h1>
          <p>영어 미스터리 수업팩과 지난 교육에서 사용한 자료를 공개합니다. 별도의 로그인은 필요하지 않습니다.</p>
          <nav className="materials-jump" aria-label="자료실 바로가기">
            <a href="#mystery-pack">미스터리 수업팩</a>
            <a href="#ulleung-class">지난 교육 자료</a>
          </nav>
        </section>

        <section className="materials-current shell" id="mystery-pack" aria-labelledby="current-material-title">
          <div>
            <Kicker>영어 미스터리 수업팩</Kicker>
            <h2 id="current-material-title">수업을 검토할 때<br />먼저 볼 자료</h2>
          </div>
          <div className="materials-current-list">
            {resources.map((item) => (
              <article key={item.title} className={!item.href ? "is-pending" : undefined}>
                <small>{item.state}</small>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                {item.href ? <Link href={item.href}>자료 보기 <span aria-hidden="true">→</span></Link> : <span className="directory-note">공개 준비 중</span>}
              </article>
            ))}
          </div>
        </section>

        <section className="past-class" id="ulleung-class" aria-labelledby="past-class-title">
          <div className="shell">
            <div className="past-class-head">
              <div><Kicker>지난 교육 자료 · 2026</Kicker><h2 id="past-class-title">울릉군 생태관광<br />AI 교육</h2></div>
              <div className="past-class-intro">
                <p>울릉군의 관광 자원을 글과 이미지로 정리하고 웹페이지와 보드게임 기획안으로 만드는 실습 자료입니다.</p>
                <dl><div><dt>대상</dt><dd>울릉군민</dd></div><div><dt>장소</dt><dd>울릉고등학교 전산실</dd></div><div><dt>일자</dt><dd>2026년 4월 18일</dd></div></dl>
              </div>
            </div>
            <div className="past-class-links">
              {pastClassLinks.map((item, index) => (
                <a key={item.title} href={item.href} target="_blank" rel="noreferrer">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><h3>{item.title}</h3><p>{item.body}</p></div>
                  <b aria-hidden="true">↗</b>
                </a>
              ))}
            </div>
            <p className="past-class-note">각 자료는 새 창에서 열립니다. 수강생에게 필요한 공개 자료만 연결했습니다.</p>
          </div>
        </section>

        <section className="plain-note shell">
          <h2>찾는 자료가 없다면</h2>
          <p>수업명과 필요한 자료를 이메일에 적어 보내주세요. 공개할 수 있는 자료인지 확인한 뒤 답변드리겠습니다.</p>
          <a href="mailto:cluedullg@gmail.com">cluedullg@gmail.com</a>
        </section>
      </div>
    </PageFrame>
  );
}
