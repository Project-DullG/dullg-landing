"use client";
import { useState } from "react";
import { useLocale } from "next-intl";
import { localizeEnglishTree } from "@/lib/i18n/english-tree";
import Link from "@/components/i18n/link";
import { ArrowLeft, ArrowRight, BookOpen, Check, PenLine } from "lucide-react";
import { englishEpisodes } from "@/lib/english/catalog";
import type { EnglishProgress } from "@/lib/english/types";
import styles from "./review.module.css";

const expressions = englishEpisodes.flatMap((episode) =>
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
  const [queue] = useState(
    expressions.filter((expression) => {
      const review = initialProgress?.reviews[expression.id];
      return review && Date.parse(review.dueAt) <= Date.parse(serverNow);
    }),
  );
  const [index, setIndex] = useState(0),
    [answer, setAnswer] = useState(""),
    [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; feedback: string } | null>(null);
  const [error, setError] = useState(
    loadError ? "학습 기록을 불러오지 못했습니다. 잠시 후 페이지를 다시 열어 주세요." : "",
  );
  const [reviewConflict, setReviewConflict] = useState(false);
  const current = queue[index],
    learned = expressions.filter((e) => progress?.learnedExpressionIds.includes(e.id));
  async function submit() {
    if (!current || !answer.trim() || busy || !accountKey) return;
    setBusy(true);
    setError("");
    setReviewConflict(false);
    try {
      const response = await fetch("/api/english/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "review", accountKey, expressionId: current.id, answer }),
      });
      const data = await response.json();
      if (!response.ok) {
        setReviewConflict(response.status === 409);
        throw new Error(data.error || "기록을 저장하지 못했습니다.");
      }
      setProgress(data.progress);
      setFeedback(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "다시 시도해 주세요.");
    } finally {
      setBusy(false);
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
        <p>이야기에서 만난 영어를, 이번에는 보기 없이 꺼내 봅니다.</p>
      </div>
      {!accountKey ? (
        <div className={styles.empty}>
          <BookOpen size={30} />
          <h2>나의 표현을 모아두는 곳</h2>
          <p>
            로그인하고 이야기를 마치면 배운 표현이 여기에 쌓입니다.
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
          <button type="button" className={styles.primary} onClick={() => window.location.reload()}>
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
                disabled={busy || !!feedback}
                onChange={(e) => setAnswer(e.target.value)}
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
                  {reviewConflict && <button type="button" className={styles.primary} onClick={() => window.location.reload()} disabled={busy}>페이지 다시 열기</button>}
                </div>
              )}
              <div className={styles.cardBottom}>
                {feedback ? (
                  <button
                    type="button"
                    className={styles.primary}
                    onClick={() => {
                      setIndex(index + 1);
                      setAnswer("");
                      setFeedback(null);
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
                    disabled={busy || !answer.trim()}
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
                {queue.length
                  ? "오늘의 복습을 마쳤어요."
                  : learned.length
                    ? "지금은 새 이야기를 만나도 좋아요."
                    : "첫 이야기를 펼쳐볼까요?"}
              </h2>
              <p>
                {learned.length
                  ? "복습할 시간이 된 표현은 다음 방문 때 여기에서 확인할 수 있습니다. 아래 수첩은 언제든 펼쳐볼 수 있어요."
                  : "이야기 속에서 읽고 듣고 표현한 문장이 내 수첩에 담깁니다."}
              </p>
              <Link href="/english" className={styles.primary}>
                이야기 고르기 <ArrowRight size={16} />
              </Link>
            </div>
          )}
          {learned.length > 0 && (
            <section className={styles.collection}>
              <h2>
                이야기에서 모은 표현 <span>{learned.length}</span>
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
