"use client";

import { useEffect, useRef } from "react";

/**
 * A short silent clip that plays once each time it comes on screen and then rests on its last frame,
 * so there is no jump back to the start. The first frame is the poster, so readers who turn motion off
 * see the illustration.
 */
export function StepClip({ src, poster, label }: { src: string; poster: string; label?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.removeAttribute("autoplay");
      video.pause();
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (video.preload === "none") video.preload = "auto";
          if (video.ended) video.currentTime = 0;
          void video.play().catch(() => undefined);
        } else if (!video.ended) video.pause();
      },
      { threshold: 0.35 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      playsInline
      preload="none"
      aria-label={label}
      aria-hidden={label ? undefined : true}
      tabIndex={-1}
    />
  );
}
