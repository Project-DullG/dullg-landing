import type { Metadata } from "next";
import Link from "next/link";
import { Kicker, PageFrame } from "@/components/site";
import { courseMaterials } from "@/lib/education";
import { BRAND, emailHref } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "수강생 자료실 · 단서공방",
  description: "단서공방 수업 참여자를 위한 안내와 공개 자료를 확인하세요.",
};

export default function MaterialsPage() {
  return (
    <PageFrame>
      <div className="materials-page">
        <section className="library-hero shell">
          <Kicker>수강생 자료실</Kicker>
          <h1>참여한 수업의 자료를<br />확인하세요.</h1>
          <p>수업 이름을 눌러 발표자료와 실습 자료를 확인하세요.</p>
        </section>

        <section className="course-archive shell" aria-label="교육 과정별 자료">
          {courseMaterials.map((course) => {
            const content = <><span><strong>{course.title}</strong><small>{course.meta}</small><small>{course.description}</small></span><b>바로 읽기 <i aria-hidden="true">→</i></b></>;
            return course.href.startsWith("/")
              ? <Link className="course-row" href={course.href} key={course.title}>{content}</Link>
              : <a className="course-row" href={course.href} key={course.title}>{content}</a>;
          })}
        </section>

        <section className="materials-help shell">
          <h2>찾는 자료가 없다면</h2>
          <p>수업명과 필요한 자료를 이메일에 적어 보내주세요. 공개할 수 있는 자료인지 확인한 뒤 답변드리겠습니다.</p>
          <a href={emailHref}>{BRAND.email}</a>
        </section>
      </div>
    </PageFrame>
  );
}
