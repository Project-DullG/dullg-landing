import { useText } from "@/lib/i18n/use-text";
import { localizeMetadata } from "@/lib/i18n/server";
import Link from "@/components/i18n/link";
import { PageFrame } from "@/components/site";
import { PresentationViewer } from "@/components/presentation-viewer";
import { pageMetadata } from "@/lib/metadata";
import { ulleungPresentation as presentation } from "@/lib/presentations";
import styles from "./page.module.css";
import { SourceLanguageNote } from "@/components/i18n/source-language-note";
export async function generateMetadata() {
  return localizeMetadata(pageMetadata("/materials/ulleung-high-living-lab"));
}
export default function PresentationPage() {
  const t = useText();
  return (
    <PageFrame>
      <article className={`shell ${styles.page}`}>
        <Link className={styles.back} href="/materials">
          {t("← 수강생 자료실")}
        </Link>
        <header className={styles.header}>
          <div>
            <p>
              {t(presentation.date)} · {t(presentation.slides.length)}
              {t("쪽")}
            </p>
            <h1>
              {t(presentation.title)}
              {t("발표자료")}
            </h1>
          </div>
          <a href={presentation.pdf} download>
            {t("PDF 다운로드 ↓")}
          </a>
        </header>
        <SourceLanguageNote />
        <PresentationViewer slides={presentation.slides} />
        <Link className={styles.activityLink} href="/activity/ulleung-high-living-lab">
          {t("수업 내용과 현장 사진 보기 →")}
        </Link>
        <p className={styles.note}>
          {t(presentation.updatedAt)}
          {t(
            "보강 자료입니다. 울릉군 생태관광 AI 교육과 별개의 수업 자료이며, 발표자료에 담긴 모집 일정과 조건은 공식 공고를 확인해 주세요.",
          )}
        </p>
      </article>
    </PageFrame>
  );
}
