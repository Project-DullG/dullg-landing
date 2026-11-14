"use client";

import Image from "next/image";
import { useRef } from "react";
import { useText } from "@/lib/i18n/use-text";
import styles from "./hero-stack.module.css";

/**
 * The academy hero object: the rulebook with two clue cards fanned out behind it.
 * The stack fans open once on load and leans a few degrees toward the pointer.
 */
export function HeroStack({ coverAlt, caption }: { coverAlt: string; caption: string }) {
  const t = useText();
  const ref = useRef<HTMLDivElement>(null);
  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || event.pointerType !== "mouse") return;
    const box = el.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    el.style.setProperty("--ry", `${(x * 10).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
  };
  const leave = () => {
    ref.current?.style.setProperty("--ry", "0deg");
    ref.current?.style.setProperty("--rx", "0deg");
  };
  return (
    <figure className={styles.figure}>
      <div className={styles.stage} ref={ref} onPointerMove={move} onPointerLeave={leave}>
        <div className={styles.stack}>
          <Image
            className={`${styles.sheet} ${styles.back}`}
            src="/assets/academy-remake/card-back.webp"
            alt=""
            width={408}
            height={650}
            sizes="160px"
          />
          <Image
            className={`${styles.sheet} ${styles.clue}`}
            src="/assets/academy-remake/card-front.webp"
            alt={t("영어책 사이에서 발견된 쪽지 · 영어 단서")}
            width={408}
            height={650}
            sizes="170px"
          />
          <Image
            className={`${styles.sheet} ${styles.cover}`}
            src="/assets/academy-remake/cover.webp"
            width={944}
            height={1330}
            alt={coverAlt}
            sizes="(max-width: 760px) 220px, 280px"
            priority
          />
        </div>
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
