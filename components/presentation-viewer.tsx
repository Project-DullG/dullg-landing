"use client";
import { useText } from "@/lib/i18n/use-text";
import Image from "next/image";
import { useRef, useState } from "react";
import styles from "./presentation-viewer.module.css";
type Slide = {
  title: string;
  summary: string;
  image: string;
};
export function PresentationViewer({ slides }: { slides: Slide[] }) {
  const t = useText();
  const sections = useRef<Array<HTMLElement | null>>([]);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  return (
    <div className={styles.viewer}>
      <nav className={styles.toolbar} aria-label={t("발표자료 목차")}>
        <label className={styles.jump}>
          <span>{t("목차")}</span>
          <select
            aria-label={t("원하는 쪽으로 이동")}
            defaultValue=""
            onChange={(event) => {
              const section = sections.current[Number(event.target.value)];
              section?.scrollIntoView({ behavior: "instant", block: "start" });
              section?.focus({ preventScroll: true });
              event.target.value = "";
            }}
          >
            <option value="" disabled>
              {t("원하는 쪽으로 이동")}
            </option>
            {t(
              slides.map((item, page) => (
                <option value={page} key={item.image}>
                  {t(page + 1)}
                  {t("쪽 \u00B7")}
                  {t(item.title)}
                </option>
              )),
            )}
          </select>
        </label>
        <span className={styles.total}>
          {t("총")}
          {t(slides.length)}
          {t("쪽")}
        </span>
      </nav>
      <p className={styles.hint}>
        {t("아래로 스크롤하며 읽으세요. 작은 글씨는 ‘크게 보기’로 확인할 수 있습니다.")}
      </p>
      {t(
        slides.map((slide, index) => (
          <section
            className={styles.slide}
            key={slide.image}
            id={`slide-${index + 1}`}
            tabIndex={-1}
            aria-labelledby={`slide-title-${index + 1}`}
            ref={(element) => {
              sections.current[index] = element;
            }}
          >
            <div className={styles.slideHeading}>
              <h2 id={`slide-title-${index + 1}`}>
                <span>
                  {t(index + 1)} / {t(slides.length)}
                </span>
                {t(slide.title)}
              </h2>
              <a
                href={slide.image}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t(`${index + 1}쪽 크게 보기 (새 창)`)}
              >
                {t("크게 보기 ↗")}
              </a>
            </div>
            <div className={styles.canvas}>
              <Image
                src={slide.image}
                alt={t(`${index + 1}쪽 · ${slide.title}`)}
                width={1920}
                height={1080}
                sizes="(max-width: 760px) 100vw, 1120px"
                priority={index === 0}
                loading={index === 0 ? undefined : "lazy"}
                onError={() =>
                  setFailedImages((current) =>
                    current.includes(slide.image) ? current : [...current, slide.image],
                  )
                }
              />
              {t(
                failedImages.includes(slide.image) && (
                  <p role="alert">
                    {t(
                      "이미지를 불러오지 못했습니다. 위의 ‘크게 보기’를 이용하거나 페이지를 새로고침해 주세요.",
                    )}
                  </p>
                ),
              )}
            </div>
            <p className={styles.summary}>{t(slide.summary)}</p>
          </section>
        )),
      )}
    </div>
  );
}
