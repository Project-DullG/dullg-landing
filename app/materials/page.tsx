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
      <section className="library-hero shell">
        <Kicker>수강생 자료실</Kicker>
        <h1>수업 자료와 지난 교육 기록을<br />한곳에 모았습니다.</h1>
        <p>영어 미스터리 수업팩 자료와 실제 교육에서 사용한 페이지를 확인할 수 있습니다. 별도 로그인이 필요한 자료실은 아직 운영하지 않습니다.</p>
      </section>

      <section className="past-class shell" aria-labelledby="past-class-title">
        <div className="past-class-head">
          <div>
            <Kicker>지난 교육 자료 · 2026</Kicker>
            <h2 id="past-class-title">울릉군 생태관광 AI 교육</h2>
          </div>
          <p>지역의 관광 자원을 글과 이미지로 정리하고, 웹페이지와 보드게임 기획안으로 만드는 실습에 사용한 자료입니다. 당시 수업용 페이지를 원래 형태로 공개합니다.</p>
        </div>
        <div className="past-class-meta" aria-label="교육 정보">
          <span><b>대상</b> 울릉군민</span>
          <span><b>장소</b> 울릉고등학교 전산실</span>
          <span><b>일자</b> 2026년 4월 18일</span>
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
        <p className="past-class-note">외부 페이지가 새 창에서 열립니다. 교육계획서와 내부 운영 문서는 공개 목록에서 제외했습니다.</p>
      </section>

      <section className="editorial-directory shell" aria-label="자료 목록">
        {resources.map((item, index) => (
          <article key={item.title}>
            <span className="directory-index">{String(index + 1).padStart(2, "0")}</span>
            <div><small>{item.state}</small><h2>{item.title}</h2><p>{item.body}</p></div>
            {item.href ? <Link href={item.href}>자료 보기 →</Link> : <span className="directory-note">공개 준비 중</span>}
          </article>
        ))}
      </section>

      <section className="plain-note shell">
        <h2>찾는 자료가 없다면</h2>
        <p>수업명과 필요한 자료를 이메일에 적어 보내주세요. 공개할 수 있는 자료인지 확인한 뒤 답변드리겠습니다.</p>
        <a href="mailto:cluedullg@gmail.com">cluedullg@gmail.com</a>
      </section>
    </PageFrame>
  );
}
