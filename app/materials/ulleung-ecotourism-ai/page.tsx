import { useText } from "@/lib/i18n/use-text";
import { SourceLanguageNote } from "@/components/i18n/source-language-note";
import { localizeMetadata } from "@/lib/i18n/server";
import Link from "@/components/i18n/link";
import { PageFrame } from "@/components/site";
import { pageMetadata } from "@/lib/metadata";
import styles from "../ulleung-high-living-lab/page.module.css";
export async function generateMetadata() {
  return localizeMetadata(pageMetadata("/materials/ulleung-ecotourism-ai"));
}
const resourceUrl = "https://kanghoon1204.github.io/ulleung-ecotourism-edu/";
export default function EcotourismMaterialPage() {
  const t = useText();
  return (
    <PageFrame>
      <article className={`shell ${styles.page}`}>
        <Link className={styles.back} href="/materials">
          {t("← 수강생 자료실")}
        </Link>
        <header className={styles.header}>
          <div>
            <p>{t("2026년 7월 4일 \u00B7 울릉고등학교 전산실")}</p>
            <h1>{t("울릉군 생태관광 AI 교육")}</h1>
          </div>
          <a href={resourceUrl}>{t("수업 자료 열기 ↗")}</a>
        </header>
        <SourceLanguageNote />
        <section className={styles.intro} aria-labelledby="course-summary-title">
          <h2 id="course-summary-title">{t("AI로 관광 홍보 콘텐츠 만들기")}</h2>
          <p>
            {t(
              "울릉군 관광 자원을 정리하고 생성형 AI를 활용해 소개 문구와 웹페이지를 완성한 하루 과정입니다. 강의와 실습 자료는 한 페이지에서 순서대로 확인할 수 있습니다.",
            )}
          </p>
        </section>
        <Link className={styles.activityLink} href="/activity/ulleung-ecotourism-ai">
          {t("수업 내용과 현장 사진 보기 →")}
        </Link>
      </article>
    </PageFrame>
  );
}
