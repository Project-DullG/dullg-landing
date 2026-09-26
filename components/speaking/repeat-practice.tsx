"use client";
import { useState, useRef, useEffect } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookmarkSimpleIcon,
  CheckIcon,
  RepeatIcon,
  SpeakerHighIcon,
  StopIcon,
} from "@phosphor-icons/react";
import type { StudySnapshot } from "@/lib/speaking/catalog/view";
import type { RepeatAction } from "@/lib/speaking/catalog/speaking/repeat";
import type { StudyAudio } from "./use-study-audio";
import { FishArt } from "./fish-collection";
import { LessonBook } from "./lesson-book";
import styles from "./speaking.module.css";

type Props = {
  data: StudySnapshot;
  audio: StudyAudio;
  busy: boolean;
  onAction: (input: RepeatAction) => void;
};
export function RepeatPractice({ data, audio, busy, onAction }: Props) {
  const progress = data.repeat,
    run = progress.active;
  const activeRun = run?.run;
  const previousRun = useRef(activeRun);
  const list = useRef<HTMLElement>(null);
  useEffect(() => {
    if (previousRun.current !== undefined && activeRun === undefined) list.current?.focus();
    previousRun.current = activeRun;
  }, [activeRun]);
  const total = Object.values(progress.rounds).reduce((sum, n) => sum + n, 0);
  if (run) {
    const item = data.repeatItems.find(
      (i) => i.question.id === run.ids[run.step % run.ids.length],
    )!;
    return (
      <RepeatRound key={`${run.run}:${run.step}`} {...{ data, audio, busy, onAction, item }} />
    );
  }
  const decks = [
    ...data.repeatDecks,
    {
      id: "saved",
      title: "담아 둔 문항 다시 연습",
      description: "어려웠던 문항을 최대 3개씩 다시 꺼내요.",
      ids: progress.bookmarks,
    },
  ];
  return (
    <section ref={list} tabIndex={-1} aria-label="반복 연습 목록" className={styles.repeatHome}>
      <div className={styles.repeatIntro}>
        <div>
          <p>먼저 듣고 따라 읽은 뒤, 같은 문항을 한글 없이 다시 말해요.</p>
        </div>
        <div className={styles.repeatCount}>
          <RepeatIcon size={22} />
          <strong>{total}</strong>
          <span>묶음 연습</span>
        </div>
      </div>
      <p className={styles.repeatBonus}>
        {data.collection.growth.repeatClaimed
          ? "오늘의 반복 보상 완료 · 물고기 1마리 · 20 XP"
          : "3문항 두 번 완료 · 물고기 +1 · 20 XP"}
        <small>한국 시각 하루 한 번 · 코스 진도와 별개</small>
      </p>
      <div className={styles.repeatGrid}>
        {decks.map((deck, i) => (
          <article className={styles.repeatDeck} key={deck.id}>
            <span className={styles.deckNumber}>
              {i === 6 ? <BookmarkSimpleIcon size={21} /> : String(i + 1).padStart(2, "0")}
            </span>
            <h3>{deck.title}</h3>
            <p>{deck.description}</p>
            <div className={styles.deckMeta}>
              <span>{Math.min(3, deck.ids.length)}문항 · 두 번 말하기</span>
              <span>{progress.rounds[deck.id] || 0}회 완료</span>
            </div>
            <button
              className={styles.secondary}
              disabled={busy || !deck.ids.length}
              onClick={() =>
                onAction({ action: "begin", deck: deck.id, expectedRun: progress.nextRun })
              }
            >
              {deck.ids.length ? "연습 시작" : "유형별 문항에서 담아 주세요"}{" "}
              <ArrowRightIcon size={17} />
            </button>
          </article>
        ))}
      </div>
      <p className={styles.small}>
        담아 둔 문항이 1~2개라면 연습 횟수만 기록하고, 물고기는 서로 다른 3문항 묶음에서 받습니다.
      </p>
    </section>
  );
}
function RepeatRound({
  data,
  audio,
  busy,
  onAction,
  item,
}: Props & { item: StudySnapshot["repeatItems"][number] }) {
  const [said, setSaid] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    title.current?.focus();
  }, []);
  const run = data.repeat.active!,
    q = item.question;
  const recall = run.step >= run.ids.length;
  const saved = data.repeat.bookmarks.includes(q.id);
  const companion =
    run.feeding && data.collection.records.find((c) => c.id === run.feeding!.catchId);
  const deckName = companion
    ? `${data.fish[companion.fish].name}에게 말하며 먹이 주기`
    : data.repeatDecks.find((d) => d.id === run.deck)?.title || "담아 둔 문항 다시 연습";
  const book = (
    <LessonBook
      sentences={item.sentences}
      audio={audio}
      busy={busy}
      clip={item.audio.full}
      initiallyVisible={!recall}
      onReveal={() => {}}
    />
  );
  return (
    <section
      className={`${styles.repeatRound} ${companion ? styles.feedingRound : ""}`}
      aria-busy={busy}
    >
      <div className={styles.repeatToolbar}>
        <button
          className={styles.textButton}
          disabled={busy}
          onClick={() => onAction({ action: "abandon", run: run.run })}
        >
          <ArrowLeftIcon size={16} />
          현재 묶음 종료
        </button>
        <button
          className={styles.textButton}
          disabled={busy}
          aria-pressed={saved}
          onClick={() => onAction({ action: "bookmark", question: q.id, saved: !saved })}
        >
          <BookmarkSimpleIcon weight={saved ? "fill" : "regular"} size={18} />
          {saved ? "담은 문항" : "문항 담기"}
        </button>
      </div>
      {companion && (
        <div className={styles.feedingCompanion}>
          <FishArt id={companion.fish} name={data.fish[companion.fish].name} record={companion} />
          <div>
            <strong>
              {data.fish[companion.fish].name} · {companion.length}cm
            </strong>
            <p>3문항 · 두 번 말하고 먹이 주기</p>
          </div>
        </div>
      )}
      <div className={styles.repeatStage}>
        <span>{companion ? (recall ? "두 번째 연습" : "첫 번째 연습") : deckName}</span>
        <b>
          {run.step + 1} / {run.ids.length * 2}
        </b>
      </div>
      <progress value={run.step} max={run.ids.length * 2} aria-label="반복 연습 완료 단계" />
      <h2 ref={title} tabIndex={-1}>
        {recall
          ? "한글 없이 다시 말해요."
          : companion
            ? "듣고 따라 말해요."
            : "듣고, 소리 내어 따라 읽어요."}
      </h2>
      {!companion && (
        <p className={styles.instruction}>
          {recall
            ? "막히면 예문을 확인한 뒤, 다시 가리고 말하세요."
            : "영어 음성을 듣고 한글 안내를 참고해 한 번 따라 읽으세요."}
        </p>
      )}
      {!companion && <h3>{q.title}</h3>}
      {item.schedule && (
        <div className={styles.schedule} role="region" aria-label="반복 연습 일정표" tabIndex={0}>
          <table>
            <caption>
              {item.schedule.title} · {item.schedule.date}
            </caption>
            <thead>
              <tr>
                {["Time", "Session", "Speaker", "Location"].map((c) => (
                  <th key={c} scope="col">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {item.schedule.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((c, j) => (
                    <td key={j}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {q.photo && (
        <figure className={styles.practicePhoto}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={q.photo} alt="반복해서 묘사할 연습 장면" width={1448} height={1086} />
          <figcaption>AI 생성 사진</figcaption>
        </figure>
      )}
      {q.type !== "read" &&
        (companion && !recall ? (
          <details className={styles.feedQuestion}>
            <summary>이 문장의 질문 보기</summary>
            <p className={styles.english} lang="en">
              {q.prompt}
            </p>
            <button
              className={styles.secondary}
              disabled={busy}
              aria-pressed={audio.playing === q.prompt}
              onClick={() =>
                audio.playing === q.prompt
                  ? audio.stop()
                  : audio.play(q.prompt, item.audio.question, q.position === 10 ? 2 : 1)
              }
            >
              {audio.playing === q.prompt ? <StopIcon size={18} /> : <SpeakerHighIcon size={18} />}{" "}
              {audio.playing === q.prompt ? "질문 중지" : "질문 듣기"}
            </button>
          </details>
        ) : (
          <>
            <p className={styles.english} lang="en">
              {q.prompt}
            </p>
            <button
              className={styles.secondary}
              disabled={busy}
              aria-pressed={audio.playing === q.prompt}
              onClick={() =>
                audio.playing === q.prompt
                  ? audio.stop()
                  : audio.play(q.prompt, item.audio.question, q.position === 10 ? 2 : 1)
              }
            >
              {audio.playing === q.prompt ? <StopIcon size={18} /> : <SpeakerHighIcon size={18} />}{" "}
              {audio.playing === q.prompt ? "질문 중지" : "질문 듣기"}
            </button>
          </>
        ))}
      {recall && q.type !== "read" ? (
        <details className={styles.answerGuide}>
          <summary>막힌 부분의 예문 확인</summary>
          {book}
        </details>
      ) : (
        book
      )}
      <label className={styles.repeatConfirm}>
        <input
          type="checkbox"
          checked={said}
          disabled={busy}
          onChange={(e) => setSaid(e.target.checked)}
        />
        <span>소리 내어 연습했어요</span>
      </label>
      <button
        className={styles.primary}
        disabled={busy || !said}
        onClick={() =>
          onAction({ action: "advance", run: run.run, step: run.step, selfReport: true })
        }
      >
        {busy
          ? "저장 중…"
          : run.step + 1 === run.ids.length * 2
            ? companion
              ? "말하고 먹이 주기 완료"
              : "반복 연습 마치기"
            : "다음 문항"}
        {run.step + 1 === run.ids.length * 2 ? (
          <CheckIcon size={19} />
        ) : (
          <ArrowRightIcon size={19} />
        )}
      </button>
    </section>
  );
}
