"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { localizeEnglishTree } from "@/lib/i18n/english-tree";
import Link from "@/components/i18n/link";
import { ArrowLeft, ArrowRight, BookOpen, Check, PenLine } from "lucide-react";
import { allEnglishContent } from "@/lib/english/catalog";
import type { EnglishProgress } from "@/lib/english/types";
import { englishDay } from "@/lib/english/progress";
import {
  finishEnglishReviewItem,
  getEnglishReviewQueue,
  reconcileEnglishReviewSession,
} from "@/lib/english/review-queue";
import styles from "./review.module.css";

const expressions = allEnglishContent.flatMap((episode) =>
  episode.expressions.map((expression) => ({ ...expression, episodeTitle: episode.title })),
);
export function EnglishReview({
  initialProgress,
  accountKey,
  serverNow,
  loadError = false,
}: {
  initialProgress: EnglishProgress | null;
  accountKey: string | null;
  serverNow: string;
  loadError?: boolean;
}) {
  const locale = useLocale();
  const [progress, setProgress] = useState(initialProgress);
  const [activeAccountKey, setActiveAccountKey] = useState(accountKey);
  const [session, setSession] = useState(() => ({
    plan: getEnglishReviewQueue(initialProgress, expressions, new Date(serverNow)),
    index: 0,
    answer: "",
    feedback: null as { correct: boolean; feedback: string } | null,
  }));
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [storageReady, setStorageReady] = useState(!loadError);
  const [error, setError] = useState(
    loadError ? "학습 기록을 불러오지 못했어요. 잠시 후 다시 확인해 주세요." : "",
  );
  const [reviewConflict, setReviewConflict] = useState(false);
  const keyRef = useRef(accountKey);
  const requestNumber = useRef(0);
  const busyRef = useRef(false);
  const refreshingRef = useRef(false);
  const pendingRefresh = useRef(false);
  const limitedDay = useRef<string | null>(null);
  const { plan, index, answer, feedback } = session;
  const queue = plan.items;
  const current = queue[index];
  const learned = expressions.filter((expression) =>
    progress?.learnedExpressionIds.includes(expression.id),
  );

  const refresh = useCallback(async () => {
    if (busyRef.current) {
      pendingRefresh.current = true;
      return;
    }
    const request = ++requestNumber.current;
    refreshingRef.current = true;
    setRefreshing(true);
    try {
      const response = await fetch("/api/english/progress", {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (request !== requestNumber.current) return;
      if (response.status === 401) {
        keyRef.current = null;
        limitedDay.current = null;
        setActiveAccountKey(null);
        setProgress(null);
        setSession({
          plan: getEnglishReviewQueue(null, expressions),
          index: 0,
          answer: "",
          feedback: null,
        });
        setStorageReady(false);
        setError("");
        return;
      }
      if (!response.ok)
        throw new Error("학습 기록을 불러오지 못했어요. 잠시 후 다시 확인해 주세요.");
      const data = (await response.json()) as { progress: EnglishProgress; accountKey: string };
      if (request !== requestNumber.current) return;
      const changedAccount = keyRef.current !== data.accountKey;
      if (changedAccount) limitedDay.current = null;
      keyRef.current = data.accountKey;
      setActiveAccountKey(data.accountKey);
      const nextPlan = getEnglishReviewQueue(
        data.progress,
        expressions,
        new Date(),
        limitedDay.current,
      );
      setProgress(data.progress);
      setSession((previous) => reconcileEnglishReviewSession(previous, nextPlan, changedAccount));
      setStorageReady(true);
      setError("");
      setReviewConflict(false);
    } catch (reason) {
      if (request !== requestNumber.current) return;
      setStorageReady(false);
      setError(
        reason instanceof Error
          ? reason.message
          : "학습 기록을 불러오지 못했어요. 잠시 후 다시 확인해 주세요.",
      );
    } finally {
      if (request === requestNumber.current) {
        refreshingRef.current = false;
        setRefreshing(false);
      }
    }
  }, []);

  const invalidateRequest = useCallback(() => {
    requestNumber.current++;
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void refresh(), 0);
    const visible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    window.addEventListener("focus", visible);
    document.addEventListener("visibilitychange", visible);
    return () => {
      window.clearTimeout(initialLoad);
      invalidateRequest();
      window.removeEventListener("focus", visible);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [accountKey, refresh, invalidateRequest]);

  useEffect(() => {
    const wait = Math.max(0, Date.parse(plan.resetAt) - Date.now());
    const midnight = window.setTimeout(() => void refresh(), wait);
    return () => window.clearTimeout(midnight);
  }, [plan.resetAt, refresh]);

  async function submit() {
    const key = keyRef.current;
    if (
      !current ||
      !answer.trim() ||
      busyRef.current ||
      refreshingRef.current ||
      !storageReady ||
      !key
    )
      return;
    if (plan.day !== englishDay()) {
      await refresh();
      return;
    }
    const request = ++requestNumber.current;
    busyRef.current = true;
    setBusy(true);
    setError("");
    setReviewConflict(false);
    try {
      const response = await fetch("/api/english/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          action: "review",
          accountKey: key,
          expressionId: current.id,
          answer,
        }),
      });
      const data = await response.json();
      if (request !== requestNumber.current || keyRef.current !== key) return;
      if (response.status === 429) {
        limitedDay.current = englishDay();
        setSession({
          plan: getEnglishReviewQueue(progress, expressions, new Date(), limitedDay.current),
          index: 0,
          answer: "",
          feedback: null,
        });
        pendingRefresh.current = true;
        return;
      }
      if (response.status === 401 || response.status === 409) {
        setStorageReady(false);
        setReviewConflict(true);
        pendingRefresh.current = true;
        throw new Error(data.error || "로그인 상태와 학습 기록을 다시 확인해 주세요.");
      }
      if (!response.ok) throw new Error(data.error || "기록을 저장하지 못했습니다.");
      setProgress(data.progress);
      const nextPlan = getEnglishReviewQueue(
        data.progress,
        expressions,
        new Date(),
        limitedDay.current,
      );
      setSession((previous) => finishEnglishReviewItem(previous, nextPlan, data));
    } catch (reason) {
      if (request === requestNumber.current)
        setError(reason instanceof Error ? reason.message : "다시 시도해 주세요.");
    } finally {
      busyRef.current = false;
      setBusy(false);
      if (request === requestNumber.current && pendingRefresh.current) {
        pendingRefresh.current = false;
        await refresh();
      }
    }
  }
  return localizeEnglishTree(
    <div className={styles.page}>
      <Link href="/english" className={styles.back}>
        <ArrowLeft size={15} /> 학습 서재로
      </Link>
      <div className={styles.heading}>
        <span>MY FIELD NOTES</span>
        <h1>내 복습 수첩</h1>
        <p>배운 표현을 이번에는 보기 없이 떠올려 보세요.</p>
      </div>
      {!activeAccountKey ? (
        <div className={styles.empty}>
          <BookOpen size={30} />
          <h2>나의 표현을 모아두는 곳</h2>
          <p>
            로그인해 연습하면 배운 표현이 여기에 쌓여요.
            <br />
            복습할 시간이 된 표현부터 다시 만날 수 있어요.
          </p>
          <Link href="/login?next=%2Fenglish%2Freview" className={styles.primary}>
            로그인하고 시작하기 <ArrowRight size={16} />
          </Link>
        </div>
      ) : error && !progress ? (
        <div className={styles.empty} role="alert">
          <p>{error}</p>
          <button type="button" className={styles.primary} onClick={() => void refresh()}>
            다시 불러오기
          </button>
        </div>
      ) : (
        <>
          <div className={styles.summary}>
            <div>
              <strong>{learned.length}</strong>
              <span>쌓인 표현</span>
            </div>
            <div>
              <strong>{queue.length}</strong>
              <span>이번 복습 표현</span>
            </div>
            <div>
              <strong>{progress?.xp || 0}</strong>
              <span>학습 XP</span>
            </div>
          </div>
          <div className={styles.dailyNote} role="status">
            <p>복습은 하루에 최대 20개까지 기록할 수 있어요.</p>
            {plan.deferredCount > 0 && (
              <p>
                <strong>{plan.deferredCount}</strong>개의 표현이 기다리고 있어요.
                <br />
                남은 표현은 다음 학습일에 이어서 복습할 수 있어요.
              </p>
            )}
            {plan.limitReached && <p>한국시간 자정이 지나면 오늘의 복습 한도가 새로 시작돼요.</p>}
          </div>
          {error && !current && (
            <div className={styles.error} role="alert">
              <p>{error}</p>
              <button
                type="button"
                className={styles.primary}
                onClick={() => void refresh()}
                disabled={busy || refreshing}
              >
                기록 다시 확인
              </button>
            </div>
          )}
          {current ? (
            <section className={styles.card} aria-label="보기 없이 표현 떠올리기">
              <div className={styles.cardTop}>
                <span>
                  <PenLine size={15} /> RECALL · 보기 없이 쓰기
                </span>
                <span>
                  {index + 1} / {queue.length}
                </span>
              </div>
              <span className={styles.from}>{current.episodeTitle}에서 만난 표현</span>
              <h2>{current.recall}</h2>
              <label htmlFor="review-answer">이 뜻을 영어로 어떻게 전할까요?</label>
              <textarea
                id="review-answer"
                lang="en"
                value={answer}
                maxLength={1200}
                rows={3}
                placeholder="Try to remember the expression…"
                disabled={busy || refreshing || !storageReady || !!feedback}
                onChange={(e) =>
                  setSession((previous) => ({ ...previous, answer: e.target.value }))
                }
              />
              <p className={styles.note}>
                이 복습은 수록된 표현을 떠올리는 연습입니다. 가능한 영어 표현 전체를 채점하지
                않습니다.
              </p>
              {feedback && (
                <div className={styles.feedback} role="status">
                  <strong>
                    {feedback.correct
                      ? "보기 없이 떠올렸어요. +5 XP"
                      : "예문과 비교하며 다시 기억해 봐요."}
                  </strong>
                  <p lang="en">{current.en}</p>
                  <span>{current.ko}</span>
                  <p>{feedback.feedback}</p>
                </div>
              )}
              {error && (
                <div className={styles.error} role="alert">
                  <p>{error}</p>
                  <button
                    type="button"
                    className={styles.primary}
                    onClick={() => void refresh()}
                    disabled={busy || refreshing}
                  >
                    기록 다시 확인
                  </button>
                  {reviewConflict && (
                    <Link href="/login?next=%2Fenglish%2Freview">로그인 상태 확인</Link>
                  )}
                </div>
              )}
              <div className={styles.cardBottom}>
                {feedback ? (
                  <button
                    type="button"
                    className={styles.primary}
                    onClick={() => {
                      setSession((previous) => ({
                        ...previous,
                        index: previous.index + 1,
                        answer: "",
                        feedback: null,
                      }));
                      setError("");
                      setReviewConflict(false);
                    }}
                  >
                    {index + 1 === queue.length ? "이번 복습 마치기" : "다음 표현"}
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.primary}
                    disabled={busy || refreshing || !storageReady || !answer.trim()}
                    onClick={submit}
                  >
                    {busy ? "기록하는 중…" : "표현 확인하기"}
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </section>
          ) : (
            <div className={styles.empty}>
              <Check size={30} />
              <h2>
                {queue.length || plan.limitReached
                  ? "오늘의 복습을 마쳤어요."
                  : learned.length
                    ? "지금 복습할 표현은 없어요."
                    : "첫 연습을 시작해 볼까요?"}
              </h2>
              {queue.length > 0 && (
                <p className={styles.completedCount}>
                  {queue.length} / {queue.length} 표현 복습 완료
                </p>
              )}
              <p>
                {learned.length
                  ? "다음 복습 때 다시 떠올려 보세요. 아래 수첩은 언제든 펼쳐볼 수 있어요."
                  : "이야기와 집중 연습에서 배운 표현이 내 수첩에 담겨요."}
              </p>
              <Link href="/english" className={styles.primary}>
                다음 연습 고르기 <ArrowRight size={16} />
              </Link>
            </div>
          )}
          {learned.length > 0 && (
            <section className={styles.collection}>
              <h2>
                배운 표현 <span>{learned.length}</span>
              </h2>
              <div>
                {learned.map((e) => (
                  <details key={e.id}>
                    <summary>
                      <span>{e.ko}</span>
                      <small>{e.episodeTitle}</small>
                    </summary>
                    <p lang="en">{e.en}</p>
                    <span>
                      다음 복습 ·{" "}
                      {new Date(progress!.reviews[e.id].dueAt).toLocaleDateString(
                        locale === "en" ? "en-US" : "ko-KR",
                        {
                          timeZone: "Asia/Seoul",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </span>
                  </details>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>,
    locale,
  );
}
