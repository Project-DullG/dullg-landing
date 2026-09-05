import Link from "next/link";
import { PageFrame } from "@/components/site";
import { PresentationViewer } from "@/components/presentation-viewer";
import { pageMetadata } from "@/lib/metadata";
import { ulleungPresentation as presentation } from "@/lib/presentations";
import styles from "./page.module.css";

export const metadata = pageMetadata("/materials/ulleung-high-living-lab");

export default function PresentationPage() {
  return (
    <PageFrame>
      <article className={`shell ${styles.page}`}>
        <Link className={styles.back} href="/materials">
          ← 수강생 자료실
        </Link>
        <header className={styles.header}>
          <div>
            <p>
              {presentation.date} · {presentation.slides.length}쪽
            </p>
            <h1>{presentation.title} 발표자료</h1>
          </div>
          <a href={presentation.pdf} download>
            PDF 다운로드 ↓
          </a>
        </header>
        <PresentationViewer slides={presentation.slides} />
        <Link className={styles.activityLink} href="/activity/ulleung-high-living-lab">
          수업 내용과 현장 사진 보기 →
        </Link>
        <p className={styles.note}>
          {presentation.updatedAt} 보강 자료입니다. 울릉군 생태관광 AI 교육과 별개의 수업 자료이며,
          발표자료에 담긴 모집 일정과 조건은 공식 공고를 확인해 주세요.
        </p>
      </article>
    </PageFrame>
  );
}
