"use client";

import Image from "next/image";
import { useState, type KeyboardEvent } from "react";
import styles from "./presentation-viewer.module.css";

type Slide = { title: string; summary: string; image: string };

export function PresentationViewer({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const slide = slides[index];
  const move = (next: number) => {
    setIndex(Math.max(0, Math.min(slides.length - 1, next)));
    setFailed(false);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const next = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: slides.length - 1 }[event.key];
    if (next !== undefined) { event.preventDefault(); move(next); }
  };

  return <div className={styles.viewer}>
    <div className={styles.toolbar}>
      <button type="button" onClick={() => move(index - 1)} disabled={index === 0}>← 이전</button>
      <label className={styles.jump}>쪽 선택
        <select value={index} onChange={(event) => move(Number(event.target.value))}>
          {slides.map((item, page) => <option value={page} key={item.image}>{page + 1} / {slides.length} · {item.title}</option>)}
        </select>
      </label>
      <button type="button" onClick={() => move(index + 1)} disabled={index === slides.length - 1}>다음 →</button>
    </div>
    <div className={styles.canvas} tabIndex={0} onKeyDown={onKeyDown} role="region" aria-label="발표자료. 왼쪽과 오른쪽 방향키로 페이지를 넘길 수 있습니다.">
      <Image key={slide.image} src={slide.image} alt={`${index + 1}쪽 · ${slide.title}`} width={1920} height={1080} sizes="(max-width: 760px) 100vw, 1120px" priority unoptimized onError={() => setFailed(true)} />
      {failed && <p role="alert">이미지를 불러오지 못했습니다. 아래 ‘원본 크기로 보기’를 이용하거나 페이지를 새로고침해 주세요.</p>}
    </div>
    <div className={styles.caption}>
      <div aria-live="polite" aria-atomic="true"><h2>{index + 1}. {slide.title}</h2><p>{slide.summary}</p></div>
      <a href={slide.image} target="_blank" rel="noopener noreferrer">원본 크기로 보기 ↗</a>
    </div>
  </div>;
}
