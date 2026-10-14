"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { EnglishProgress } from "@/lib/english/types";

export type StudyProgressProps = {
  initialProgress: EnglishProgress | null;
  serverNow: string;
  loadError?: boolean;
};
export function useStudyProgress({
  initialProgress,
  serverNow,
  loadError = false,
}: StudyProgressProps) {
  const [progress, setProgress] = useState(initialProgress);
  const [status, setStatus] = useState<"guest" | "ready" | "loading" | "error">(
    loadError ? "error" : initialProgress ? "ready" : "guest",
  );
  const [now, setNow] = useState(Date.parse(serverNow));
  const request = useRef(0),
    controller = useRef<AbortController | null>(null);
  const refresh = useCallback(async (clear = false) => {
    const generation = ++request.current;
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    if (clear) {
      setProgress(null);
      setStatus("loading");
    }
    try {
      const response = await fetch("/api/english/progress", {
        cache: "no-store",
        credentials: "same-origin",
        signal: abort.signal,
      });
      if (generation !== request.current) return;
      if (response.status === 401) {
        setProgress(null);
        setStatus("guest");
        return;
      }
      if (!response.ok) throw new Error("progress unavailable");
      const data = (await response.json()) as { progress: EnglishProgress };
      if (generation !== request.current) return;
      setProgress(data.progress);
      setStatus("ready");
      setNow(Date.now());
    } catch {
      if (generation !== request.current || abort.signal.aborted) return;
      setProgress(null);
      setStatus("error");
    }
  }, []);
  const invalidate = useCallback(() => {
    request.current++;
    controller.current?.abort();
  }, []);
  useEffect(() => {
    const first = window.setTimeout(() => void refresh(), 0);
    const tick = window.setInterval(() => setNow(Date.now()), 60_000);
    const visible = () => {
      if (document.visibilityState === "visible") void refresh(true);
    };
    window.addEventListener("focus", visible);
    document.addEventListener("visibilitychange", visible);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(tick);
      invalidate();
      window.removeEventListener("focus", visible);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [refresh, invalidate]);
  return { progress, status, now, refresh };
}
