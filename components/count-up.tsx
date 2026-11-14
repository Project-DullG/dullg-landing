"use client";

import { useEffect, useRef, useState } from "react";
import { useText } from "@/lib/i18n/use-text";

/**
 * A figure that counts up once when it scrolls into view. The server renders the
 * final value, so the number is correct without JavaScript or with reduced motion.
 */
export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const t = useText();
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const el = ref.current;
    if (
      !el ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window) ||
      el.getBoundingClientRect().top < window.innerHeight
    )
      return;
    setShown(0);
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const duration = 900;
        const step = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          setShown(Math.round(value * eased));
          if (progress < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);
  return (
    <span ref={ref} className="count-up">
      {t(`${shown.toLocaleString("ko-KR")}${suffix}`)}
    </span>
  );
}
