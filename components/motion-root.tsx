"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Pages with their own full-screen game or study shell keep their layout still.
const STILL_ROUTES =
  /^\/(?:en\/)?(?:games|speaking|dashboard|demo|certificates|login|english\/play|english\/practice|mini-projects\/[^/]+)/;

/**
 * Adds one short fade-and-rise to sections that start below the first screen,
 * and a hairline shadow to the header once the page scrolls. Content is visible
 * without JavaScript, and nothing moves when the reader prefers reduced motion.
 */
export function MotionRoot() {
  const pathname = usePathname();
  useEffect(() => {
    const header = document.querySelector(".site-header");
    const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const cleanup = () => window.removeEventListener("scroll", onScroll);

    if (
      STILL_ROUTES.test(pathname) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    )
      return cleanup;

    const fold = window.innerHeight * 0.9;
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("main section:not(section section), main [data-reveal]"),
    ).filter(
      (el) =>
        !el.classList.contains("reveal") &&
        !el.closest("[data-still]") &&
        el.getBoundingClientRect().top > fold,
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
    );
    for (const el of targets) {
      el.querySelectorAll<HTMLElement>("[data-stagger]").forEach((group) =>
        Array.from(group.children)
          .slice(0, 8)
          .forEach((child, index) => (child as HTMLElement).style.setProperty("--stagger", String(index))),
      );
      el.classList.add("reveal");
      observer.observe(el);
    }
    // Printing or jumping far down should never leave a section hidden.
    const revealAll = () => targets.forEach((el) => el.classList.add("is-revealed"));
    window.addEventListener("beforeprint", revealAll);
    return () => {
      cleanup();
      observer.disconnect();
      window.removeEventListener("beforeprint", revealAll);
    };
  }, [pathname]);
  return null;
}
