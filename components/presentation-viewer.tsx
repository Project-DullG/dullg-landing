"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import styles from "./presentation-viewer.module.css";

type Slide = { title: string; summary: string; image: string };

export function PresentationViewer({ slides }: { slides: Slide[] }) {
  const sections = useRef<Array<HTMLElement | null>>([]);
  const [failedImages, setFailedImages] = useState<string[]>([]);

  return <div className={styles.viewer}>
    <nav className={styles.toolbar} aria-label="발표자료 목차">
      <label className={styles.jump}>
        <span>목차</span>
        <select aria-label="원하는 쪽으로 이동" defaultValue="" onChange={(event) => {
          const section = sections.current[Number(event.target.value)];
          section?.scrollIntoView({ behavior: "instant", block: "start" });
          section?.focus({ preventScroll: true });
          event.target.value = "";
        }}>
          <option value="" disabled>원하는 쪽으로 이동</option>
          {slides.map((item, page) => <option value={page} key={item.image}>{page + 1}쪽 · {item.title}</option>)}
        </select>
      </label>
      <span className={styles.total}>총 {slides.length}쪽</span>
    </nav>
    <p className={styles.hint}>아래로 스크롤하며 읽으세요. 작은 글씨는 ‘크게 보기’로 확인할 수 있습니다.</p>
    {slides.map((slide, index) => <section
      className={styles.slide}
      key={slide.image}
      id={`slide-${index + 1}`}
      tabIndex={-1}
      aria-labelledby={`slide-title-${index + 1}`}
      ref={(element) => { sections.current[index] = element; }}
    >
      <div className={styles.slideHeading}>
        <h2 id={`slide-title-${index + 1}`}><span>{index + 1} / {slides.length}</span>{slide.title}</h2>
        <a href={slide.image} target="_blank" rel="noopener noreferrer" aria-label={`${index + 1}쪽 크게 보기 (새 창)`}>크게 보기 ↗</a>
      </div>
      <div className={styles.canvas}>
        <Image src={slide.image} alt={`${index + 1}쪽 · ${slide.title}`} width={1920} height={1080} sizes="(max-width: 760px) 100vw, 1120px" priority={index === 0} unoptimized onError={() => setFailedImages((current) => current.includes(slide.image) ? current : [...current, slide.image])} />
        {failedImages.includes(slide.image) && <p role="alert">이미지를 불러오지 못했습니다. 위의 ‘크게 보기’를 이용하거나 페이지를 새로고침해 주세요.</p>}
      </div>
      <p className={styles.summary}>{slide.summary}</p>
    </section>)}
  </div>;
}
