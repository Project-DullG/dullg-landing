"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { EnglishProgress } from "@/lib/english/types";
import { readEnglishSession } from "@/lib/english/session-ui";

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
      const data = await readEnglishSession({ signal: abort.signal });
      if (generation !== request.current || abort.signal.aborted) return;
      if (!data) {
        setProgress(null);
        setStatus("guest");
        return;
      }
      setProgress(data.progress);
      setStatus("ready");
      setNow(Date.now());
    } catch {
      if (generation !== request.current || abort.signal.aborted) return;
      setProgress(null);
      setStatus("error");
    } finally {
      if (controller.current === abort) controller.current = null;
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
