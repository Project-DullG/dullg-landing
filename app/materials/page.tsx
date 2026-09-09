import Link from "next/link";
import { PageFrame } from "@/components/site";
import { PageIntro } from "@/components/page-intro";
import { courseMaterials } from "@/lib/education";
import { pageMetadata } from "@/lib/metadata";
import { BRAND, emailHref } from "@/lib/site-config";

export const metadata = pageMetadata("/materials");

export default function MaterialsPage() {
  return (
    <PageFrame>
      <div className="materials-page">
        <PageIntro
          title="수강생 자료실"
          description="참여한 수업의 발표자료와 실습 자료를 확인하세요."
        />

        <section className="course-archive shell" aria-label="교육 과정별 자료">
          {courseMaterials.map((course) => {
            const content = (
              <>
                <span>
                  <strong>{course.title}</strong>
                  <small>{course.meta}</small>
                  <small>{course.description}</small>
                </span>
                <b>
                  자료 보기 <i aria-hidden="true">→</i>
                </b>
              </>
            );
            return course.href.startsWith("/") ? (
              <Link className="course-row" href={course.href} key={course.title}>
                {content}
              </Link>
            ) : (
              <a className="course-row" href={course.href} key={course.title}>
                {content}
              </a>
            );
          })}
        </section>

        <section className="materials-help shell">
          <h2>찾는 자료가 없다면</h2>
          <p>수업명과 필요한 자료를 이메일로 알려주세요.</p>
          <a href={emailHref}>{BRAND.email}</a>
        </section>
      </div>
    </PageFrame>
  );
}
