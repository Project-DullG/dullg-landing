"use client";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { ArrowRight, Check, BookOpen, MessageCircle, Puzzle } from "lucide-react";
import Link from "@/components/i18n/link";
import { localizeEnglishTree } from "@/lib/i18n/english-tree";
import { englishPracticePacks, practiceCollections } from "@/lib/english/practice";
import { englishDay, getEnglishEpisodeStatus } from "@/lib/english/progress";
import { practiceRecommendationId } from "@/lib/english/practice-ui";
import type { EnglishLevel, EnglishProgress } from "@/lib/english/types";
import styles from "./practice-library.module.css";

const formatIcons = { conversation: MessageCircle, sentence: Puzzle, reading: BookOpen };
type PracticeFormat = keyof typeof formatIcons;
export function PracticeLibrary({
  progress = null,
  level = "standard",
}: {
  progress?: EnglishProgress | null;
  level?: EnglishLevel;
}) {
  const locale = useLocale();
  const [format, setFormat] = useState<PracticeFormat>("conversation");
  const [day, setDay] = useState<string | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => setDay(englishDay()), 0);
    const refreshDay = () => {
      if (document.visibilityState === "visible") setDay(englishDay());
    };
    window.addEventListener("focus", refreshDay);
    document.addEventListener("visibilitychange", refreshDay);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", refreshDay);
      document.removeEventListener("visibilitychange", refreshDay);
    };
  }, []);
  const packs = englishPracticePacks.filter((pack) => pack.practiceFormat === format);
  const recommended = day
    ? practiceRecommendationId(
        packs.map((pack) => pack.id),
        day,
      )
    : undefined;
  return localizeEnglishTree(
    <section className={styles.library} aria-labelledby="practice-library-title" id="practice">
      <header className={styles.heading}>
        <div>
          <p>THE PRACTICE JOURNAL</p>
          <h2 id="practice-library-title">짧게 연습하는 영어</h2>
        </div>
        <p>
          회화, 문장 만들기, 짧은 글 읽기.
          <br />네 단계씩, 내 수준에 맞춰 연습해요.
        </p>
      </header>
      <div className={styles.formats} role="group" aria-label="집중 연습 유형">
        {practiceCollections.map((collection) => {
          const Icon = formatIcons[collection.id as PracticeFormat];
          return (
            <button
              type="button"
              key={collection.id}
              aria-pressed={format === collection.id}
              onClick={() => setFormat(collection.id as PracticeFormat)}
            >
              <Icon size={20} aria-hidden="true" />
              <strong>{collection.title}</strong>
              <span>{collection.description}</span>
            </button>
          );
        })}
      </div>
      <p className={styles.count} aria-live="polite">
        {packs.length}가지 연습
      </p>
      <div className={styles.grid}>
        {packs.map((pack, index) => {
          const status = progress ? getEnglishEpisodeStatus(progress, pack) : null;
          const Icon = formatIcons[pack.practiceFormat];
          return (
            <article key={pack.id} className={styles.card}>
              <div className={styles.cardTop}>
                <span>
                  {String(index + 1).padStart(2, "0")} <Icon size={16} aria-hidden="true" />
                </span>
                {recommended === pack.id && <small>오늘의 추천</small>}
              </div>
              <h3>{pack.title}</h3>
              <p>{pack.synopsis}</p>
              {pack.expressions[0] && (
                <p lang="en" className={styles.sample}>
                  {pack.expressions[0].en}
                </p>
              )}
              <span className={styles.meta}>
                예상 {pack.minutes}분 · {pack.tasks.length}단계
              </span>
              <Link
                href={`/english/practice/${pack.id}?level=${status?.completedCount && !status.finished ? progress?.episodes[pack.id]?.level || level : level}${status?.finished ? "&replay=1" : ""}`}
              >
                {status?.finished ? (
                  <>
                    <Check size={15} aria-hidden="true" /> 다시 연습
                  </>
                ) : status?.completedCount ? (
                  <>
                    이어하기 · {status.completedCount}/{status.total}
                  </>
                ) : (
                  "연습 시작"
                )}
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </article>
          );
        })}
      </div>
      <p className={styles.note}>로그인하면 연습 기록도 이야기 진도와 함께 저장돼요.</p>
    </section>,
    locale,
  );
}
