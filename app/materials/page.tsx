import { useText } from "@/lib/i18n/use-text";
import { localizeMetadata } from "@/lib/i18n/server";
import Link from "@/components/i18n/link";
import { PageFrame } from "@/components/site";
import { PageIntro } from "@/components/page-intro";
import { courseMaterials } from "@/lib/education";
import { pageMetadata } from "@/lib/metadata";
import { BRAND, emailHref } from "@/lib/site-config";
export async function generateMetadata() {
  return localizeMetadata(pageMetadata("/materials"));
}
export default function MaterialsPage() {
  const t = useText();
  return (
    <PageFrame>
      <div className="materials-page">
        <PageIntro
          title={t("수강생 자료실")}
          description="참여한 수업의 발표자료와 실습 자료를 확인하세요."
        />

        <section className="course-archive shell" aria-label={t("교육 과정별 자료")}>
          {t(
            courseMaterials.map((course) => {
              const content = (
                <>
                  <span>
                    <strong>{t(course.title)}</strong>
                    <small>{t(course.meta)}</small>
                    <small>{t(course.description)}</small>
                  </span>
                  <b>
                    {t("자료 보기")}
                    <i aria-hidden="true">→</i>
                  </b>
                </>
              );
              return course.href.startsWith("/") ? (
                <Link className="course-row" href={course.href} key={course.title}>
                  {t(content)}
                </Link>
              ) : (
                <a className="course-row" href={course.href} key={course.title}>
                  {t(content)}
                </a>
              );
            }),
          )}
        </section>

        <section className="materials-help shell">
          <h2>{t("찾는 자료가 없다면")}</h2>
          <p>{t("수업명과 필요한 자료를 이메일로 알려주세요.")}</p>
          <a href={emailHref}>{t(BRAND.email)}</a>
        </section>
      </div>
    </PageFrame>
  );
}
