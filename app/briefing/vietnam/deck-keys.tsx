"use client";

import { useEffect } from "react";

/** Arrow keys, Page Up/Down and space move one slide at a time. */
export function DeckKeys() {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const next = ["ArrowRight", "ArrowDown", "PageDown", " "].includes(event.key);
      const prev = ["ArrowLeft", "ArrowUp", "PageUp"].includes(event.key);
      if (!next && !prev) return;
      const slides = [...document.querySelectorAll<HTMLElement>("main section")];
      const current = slides.findIndex((el) => el.getBoundingClientRect().top > -window.innerHeight / 2);
      const index = Math.min(slides.length - 1, Math.max(0, (current < 0 ? 0 : current) + (next ? 1 : -1)));
      event.preventDefault();
      slides[index].scrollIntoView({ behavior: "smooth", block: "center" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
