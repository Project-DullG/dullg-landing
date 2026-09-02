import type { Metadata } from "next";
import Link from "next/link";
import { Kicker, PageFrame } from "@/components/site";

export const metadata: Metadata = {
  title: "수강생 자료실 · 단서공방",
  description: "단서공방 수업 참여자를 위한 안내와 공개 자료를 확인하세요.",
};

const resources = [
  { state: "공개", title: "수업 자료 미리보기", body: "스토리북, 단서 카드, 워크북과 교사용 진행안의 구성을 확인합니다.", href: "/academy/sample" },
  { state: "안내", title: "4차시 수업 흐름", body: "사건을 읽는 첫 시간부터 최종 보고서를 완성하는 과정까지 정리했습니다.", href: "/academy/curriculum" },
  { state: "준비 중", title: "수강생 전용 보충 자료", body: "파일럿 운영 뒤 공개 범위와 전달 방식을 확정합니다. 준비되지 않은 파일은 먼저 약속하지 않습니다.", href: null },
];

export default function MaterialsPage() {
  return (
    <PageFrame>
      <section className="library-hero shell">
        <Kicker>수강생 자료실</Kicker>
        <h1>수업 전후에 필요한 자료를<br />한곳에서 찾을 수 있게.</h1>
        <p>현재는 누구나 확인할 수 있는 시제품 자료와 수업 흐름을 먼저 공개합니다. 수강생 전용 자료는 실제 운영이 시작된 뒤 필요한 것부터 차례로 추가합니다.</p>
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
        <p>수업명과 필요한 자료를 적어 공식 이메일로 알려주세요. 확인 가능한 범위와 전달 방법을 안내드리겠습니다.</p>
        <a href="mailto:cluedullg@gmail.com">cluedullg@gmail.com</a>
      </section>
    </PageFrame>
  );
}
