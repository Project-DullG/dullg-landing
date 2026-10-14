import { getEnglishEpisode } from "./catalog.ts";
import { getCourseHref } from "./courses.ts";
import { getEnglishEpisodeStatus } from "./progress.ts";
import type { EnglishEpisode, EnglishLevel, EnglishProgress } from "./types.ts";

export type EnglishSessionState = "loading" | "guest" | "ready" | "error";
export const ENGLISH_SESSION_TIMEOUT_MS = 10_000;

/** Guest and failed reads still allow local choices; pending reads and writes do not. */
export function canChooseEnglishLevel(status: EnglishSessionState, saving = false): boolean {
  return status !== "loading" && !saving;
}

/** Keep one deadline across response headers and JSON, so a stalled body cannot trap loading. */
export async function readEnglishSession({
  fetcher = fetch,
  timeoutMs = ENGLISH_SESSION_TIMEOUT_MS,
  signal,
}: {
  fetcher?: typeof fetch;
  timeoutMs?: number;
  signal?: AbortSignal;
} = {}): Promise<{ progress: EnglishProgress; accountKey: string } | null> {
  if (signal?.aborted) throw signal.reason;
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let cancel: (() => void) | undefined;
  const deadline = new Promise<never>((_, reject) => {
    cancel = () => {
      reject(signal!.reason);
      controller.abort(signal!.reason);
    };
    signal?.addEventListener("abort", cancel, { once: true });
    timer = setTimeout(() => {
      const error = new Error("English progress request timed out");
      reject(error);
      controller.abort(error);
    }, timeoutMs);
  });
  const request = (async () => {
    const response = await fetcher("/api/english/progress", {
      cache: "no-store",
      credentials: "same-origin",
      signal: controller.signal,
    });
    if (response.status === 401) return null;
    if (!response.ok) throw new Error("English progress unavailable");
    return (await response.json()) as { progress: EnglishProgress; accountKey: string };
  })();
  try {
    return await Promise.race([request, deadline]);
  } finally {
    clearTimeout(timer);
    if (cancel) signal?.removeEventListener("abort", cancel);
  }
}

/** Resume at the saved level; completed content is a replay at the newly selected level. */
export function getEnglishSessionHref(
  contentId: string,
  selectedLevel: EnglishLevel,
  progress: EnglishProgress | null | undefined,
): string | null {
  const content = getEnglishEpisode(contentId);
  if (!content) return null;
  const status = progress ? getEnglishEpisodeStatus(progress, content) : null;
  const saved = progress?.episodes[content.id];
  return getCourseHref(
    content.id,
    status?.completedCount && !status.finished ? saved?.level || selectedLevel : selectedLevel,
    { replay: status?.finished, courseId: saved?.courseId },
  );
}

/** A replay refresh changes saved records, not the learner's position in that replay. */
export function getEnglishReloadIndex(
  progress: EnglishProgress,
  content: EnglishEpisode,
  replaying: boolean,
  currentIndex: number,
): number {
  if (!replaying) return getEnglishEpisodeStatus(progress, content).firstMissingIndex;
  const index = Number.isFinite(currentIndex) ? Math.trunc(currentIndex) : 0;
  return Math.max(0, Math.min(content.tasks.length, index));
}
