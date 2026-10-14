"use client";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { ArrowRight, BookOpen, Volume2 } from "lucide-react";
import Link from "@/components/i18n/link";
import { localizeEnglishTree } from "@/lib/i18n/english-tree";
import { getCourseHref } from "@/lib/english/courses";
import { englishDay, getEnglishGrowth, REVIEW_DAILY_LIMIT } from "@/lib/english/progress";
import {
  filterEnglishExpressionNotes,
  getEnglishContinuation,
  getEnglishExpressionNotes,
  getEnglishLearningRecords,
  getEnglishWeek,
} from "@/lib/english/journal";
import { englishSkills } from "@/lib/english/types";
import { StudyNavigation } from "./study-navigation";
import { useStudyProgress, type StudyProgressProps } from "./use-study-progress";
import styles from "./study.module.css";

export function EnglishJournal(props: StudyProgressProps) {
  const locale = useLocale();
  const { progress, status, now, refresh } = useStudyProgress(props);
  const [query, setQuery] = useState(""),
    [source, setSource] = useState("");
  const [dueOnly, setDueOnly] = useState(false);
  const [listening, setListening] = useState(""),
    [audioError, setAudioError] = useState("");
  const generation = useRef(0);
  useEffect(
    () => () => {
      generation.current++;
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    },
    [],
  );
  function listen(id: string, text: string) {
    setAudioError("");
    if (!("speechSynthesis" in window)) {
      setAudioError("이 기기에서는 음성을 재생할 수 없어요. 예문을 읽고 직접 말해 보세요.");
      return;
    }
    const token = ++generation.current;
    window.speechSynthesis.cancel();
    if (listening === id) {
      setListening("");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    const voice = window.speechSynthesis
      .getVoices()
      .find((item) => item.lang.toLowerCase() === "en-us");
    if (voice) utterance.voice = voice;
    utterance.onend = () => {
      if (token === generation.current) setListening("");
    };
    utterance.onerror = () => {
      if (token === generation.current) {
        setListening("");
        setAudioError("음성 재생이 멈췄어요. 예문을 읽으며 연습해도 좋습니다.");
      }
    };
    setListening(id);
    window.speechSynthesis.speak(utterance);
  }
  const notes = progress ? getEnglishExpressionNotes(progress, new Date(now)) : [];
  const sources = [...new Map(notes.map((note) => [note.source.id, note.source])).values()];
  const activeSource = sources.some((item) => item.id === source) ? source : "";
  const filtered = filterEnglishExpressionNotes(notes, { query, source: activeSource, dueOnly });
  const records = progress ? getEnglishLearningRecords(progress) : [];
  const continuation = progress ? getEnglishContinuation(progress) : undefined;
  const week = progress ? getEnglishWeek(progress, new Date(now)) : [];
  const growth = progress ? getEnglishGrowth(progress, new Date(now)) : null;
  const weekMax = Math.max(1, ...week.map((day) => Math.max(day.tasks, day.reviews)));
  const reviewRemaining = Math.max(
    0,
    REVIEW_DAILY_LIMIT - (progress?.dailyActivity[englishDay(new Date(now))]?.reviews || 0),
  );
  const dueCount = notes.filter((note) => note.due).length;
  const completedStories = records.filter(
    (item) => item.finished && item.content.format !== "practice",
  ).length;
  const completedPractices = records.filter(
    (item) => item.finished && item.content.format === "practice",
  ).length;
  const date = (stamp: number, withTime = false) =>
    new Intl.DateTimeFormat(locale === "en" ? "en-US" : "ko-KR", {
      timeZone: "Asia/Seoul",
      month: "numeric",
      day: "numeric",
      ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
    }).format(stamp);
  return localizeEnglishTree(
    <div className={styles.page}>
      <div className={styles.shell}>
        <StudyNavigation />
        <header className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>MY ENGLISH JOURNAL</p>
            <h1>내가 쌓아 온 영어</h1>
            <p>이어 할 학습, 지난 일주일의 기록, 다시 꺼내 쓸 표현을 한곳에 모았어요.</p>
          </div>
          <Link className={styles.secondary} href="/english/courses">
            학습 코스 고르기 <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </header>
        {status !== "ready" || !progress || !growth ? (
          <div className={styles.status}>
            {status === "error" ? (
              <>
                <p role="alert">
                  학습 기록을 불러오지 못했어요. 기록을 다시 확인하거나 콘텐츠를 체험할 수 있습니다.
                </p>
                <button className={styles.secondary} onClick={() => void refresh(true)}>
                  기록 다시 확인
                </button>
              </>
            ) : status === "loading" ? (
              <p role="status">학습 기록을 확인하고 있어요.</p>
            ) : (
              <>
                <p>
                  로그인해 공부하면 진도와 배운 표현이 이곳에 쌓입니다. 쉬었다 돌아와도 하던 곳부터
                  이어서 배울 수 있어요.
                </p>
                <div className={styles.actions}>
                  <Link className={styles.primary} href="/login?next=%2Fenglish%2Fjournal">
                    로그인하고 학습 기록 남기기
                  </Link>
                  <Link className={styles.secondary} href="/english/courses">
                    먼저 코스 둘러보기
                  </Link>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              <section className={styles.panel} aria-labelledby="next-study-title">
                <p className={styles.eyebrow}>PICK UP WHERE YOU LEFT OFF</p>
                <h2 id="next-study-title">오늘은 여기서 이어가요</h2>
                {continuation ? (
                  <>
                    <p className={styles.note}>
                      {continuation.content.format === "practice"
                        ? "하던 집중 연습"
                        : "읽던 이야기"}
                    </p>
                    <h3>{continuation.content.title}</h3>
                    <p className={styles.note}>
                      {continuation.completedCount}/{continuation.total}개 활동 완료 ·{" "}
                      {continuation.level === "starter"
                        ? "입문"
                        : continuation.level === "challenge"
                          ? "도전"
                          : "기본"}
                    </p>
                    <Link
                      className={styles.primary}
                      href={
                        getCourseHref(continuation.content.id, continuation.level, {
                          courseId: continuation.courseId,
                        })!
                      }
                    >
                      이어서 배우기 <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </>
                ) : (
                  <>
                    <p className={styles.note}>
                      이어 할 활동이 없어요. 목적에 맞는 코스를 골라 새로운 학습을 시작해 보세요.
                    </p>
                    <Link className={styles.primary} href="/english/courses">
                      다음 학습 고르기 <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </>
                )}
                <div className={styles.actions}>
                  {dueCount && reviewRemaining ? (
                    <Link className={styles.secondary} href="/english/review">
                      오늘 복습 <strong>{Math.min(dueCount, reviewRemaining)}</strong>개{" "}
                      <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                  ) : (
                    <span className={styles.note}>
                      {dueCount
                        ? "오늘 복습할 분량을 마쳤어요. 다음 학습일에 이어가요."
                        : "복습할 시간이 되면 배운 표현을 다시 안내할게요."}
                    </span>
                  )}
                </div>
                <p className={styles.note}>
                  {growth.todayActivities >= 3
                    ? "오늘의 작은 목표를 마쳤어요. 다음 학습은 내 속도로 이어가세요."
                    : "연습과 표현 복습을 합쳐 하루 3개의 작은 활동부터."}
                </p>
                <div className={styles.summary}>
                  <div>
                    <strong>{completedStories}</strong>
                    <span>마친 이야기</span>
                  </div>
                  <div>
                    <strong>{completedPractices}</strong>
                    <span>마친 집중 연습</span>
                  </div>
                  <div>
                    <strong>{notes.length}</strong>
                    <span>배운 표현</span>
                  </div>
                  <div>
                    <strong>Lv.{growth.level}</strong>
                    <span>{growth.xp} XP · 연습 기록</span>
                  </div>
                </div>
              </section>
              <section className={styles.panel} aria-labelledby="week-title">
                <p className={styles.eyebrow}>YOUR LAST SEVEN DAYS</p>
                <h2 id="week-title">최근 7일의 학습</h2>
                <p className={styles.note}>
                  기록된 연습과 복습 횟수입니다. 한국 시간 기준으로 표시해요.
                </p>
                <div className={styles.week}>
                  {week.map((day) => (
                    <div key={day.day} className={styles.day}>
                      <div className={styles.barTrack} aria-hidden="true">
                        <span
                          className={styles.bar}
                          style={{ height: (day.tasks / weekMax) * 70 }}
                        />
                        <span
                          className={styles.bar + " " + styles.reviewBar}
                          style={{ height: (day.reviews / weekMax) * 70 }}
                        />
                      </div>
                      <time dateTime={day.day}>{date(Date.parse(day.day + "T12:00:00Z"))}</time>
                      <small>
                        <span>연습 </span>
                        {day.tasks}
                      </small>
                      <small>
                        <span>복습 </span>
                        {day.reviews}
                      </small>
                      {day.active && !day.total && <small>학습일 기록</small>}
                    </div>
                  ))}
                </div>
                <div className={styles.legend}>
                  <span>
                    <i aria-hidden="true" />
                    연습
                  </span>
                  <span>
                    <i aria-hidden="true" />
                    복습
                  </span>
                </div>
                <div className={styles.summary}>
                  <div>
                    <strong>{week.reduce((sum, day) => sum + day.tasks, 0)}</strong>
                    <span>주간 연습</span>
                  </div>
                  <div>
                    <strong>{week.reduce((sum, day) => sum + day.reviews, 0)}</strong>
                    <span>주간 복습</span>
                  </div>
                </div>
                <p className={styles.note}>
                  학습 시간이나 영어 실력 점수로 환산하지 않습니다. 같은 활동을 다른 날 다시
                  연습하면 그날의 활동에 포함됩니다.
                </p>
              </section>
            </div>
            <section className={styles.panel} aria-labelledby="recent-study-title">
              <h2 id="recent-study-title">최근에 공부한 콘텐츠</h2>
              {records.length ? (
                records.slice(0, 5).map((record) => (
                  <div key={record.content.id} className={styles.continue}>
                    <div>
                      <strong>{record.content.title}</strong>
                      <small>
                        {record.finished ? "완료" : "진행 중"} · {record.completedCount}/
                        {record.total}개 활동 ·{" "}
                        {record.updatedAt ? date(record.updatedAt) : "이전 학습 기록"}
                      </small>
                    </div>
                    <Link
                      className={styles.secondary}
                      href={
                        getCourseHref(record.content.id, record.level, {
                          replay: record.finished,
                          courseId: record.courseId,
                        })!
                      }
                    >
                      {record.finished ? "다시 연습" : "이어하기"}
                      <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                  </div>
                ))
              ) : (
                <p className={styles.note}>
                  아직 완료한 활동이 없어요. 첫 활동을 마치면 이곳에 기록됩니다.
                </p>
              )}
              <div className={styles.summary}>
                {Object.entries(englishSkills).map(([id, skill]) => (
                  <div key={id}>
                    <strong>{progress.skills[id as keyof typeof englishSkills]}</strong>
                    <span>{skill.label} 연습</span>
                  </div>
                ))}
              </div>
              <p className={styles.note}>영역별 숫자는 처음 완료한 활동 횟수입니다.</p>
            </section>
          </>
        )}
        <section id="expressions" aria-labelledby="expression-notes-title">
          <header className={styles.sectionHead}>
            <div>
              <p className={styles.eyebrow}>WORDS YOU CAN USE AGAIN</p>
              <h2 id="expression-notes-title">배운 표현 노트</h2>
              <p>필요한 표현을 찾고, 예문을 듣고, 처음 배운 콘텐츠로 돌아가 보세요.</p>
            </div>
            <Link className={styles.secondary} href="/english/review">
              보기 없이 떠올리는 복습 <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </header>
          {status === "ready" && progress ? (
            <>
              {notes.length ? (
                <>
                  <div className={styles.filters}>
                    <label>
                      표현 검색
                      <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="영어·한국어·콘텐츠 이름으로 찾기"
                      />
                    </label>
                    <label>
                      배운 곳
                      <select
                        value={activeSource}
                        onChange={(event) => setSource(event.target.value)}
                      >
                        <option value="">모든 콘텐츠</option>
                        {sources.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.title}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={dueOnly}
                        onChange={(event) => setDueOnly(event.target.checked)}
                      />
                      복습할 시간이 된 표현만
                    </label>
                  </div>
                  <p className={styles.note} aria-live="polite">
                    {filtered.length} / {notes.length}개 표현
                  </p>
                  {audioError && (
                    <p className={styles.note} role="status">
                      {audioError}
                    </p>
                  )}
                  <div className={styles.expressions}>
                    {filtered.map((note) => (
                      <article className={styles.expression} key={note.expression.id}>
                        <span className={styles.meta}>{note.source.title}</span>
                        <p lang="en">{note.expression.en}</p>
                        {locale === "ko" && <p className={styles.meaning}>{note.expression.ko}</p>}
                        <button
                          className={styles.textButton}
                          onClick={() => listen(note.expression.id, note.expression.en)}
                        >
                          <Volume2 size={15} aria-hidden="true" />
                          {listening === note.expression.id ? "듣기 멈추기" : "예문 듣기"}
                        </button>
                        <footer>
                          <span>
                            {note.due ? (
                              "복습할 시간이에요"
                            ) : note.dueAt ? (
                              <>다음 복습 · {date(note.dueAt, true)}</>
                            ) : (
                              "복습 일정 확인 중"
                            )}
                          </span>
                          <Link
                            href={
                              getCourseHref(
                                note.source.id,
                                progress.episodes[note.source.id]?.level || progress.preferredLevel,
                              )!
                            }
                          >
                            배운 곳으로 <ArrowRight size={13} aria-hidden="true" />
                          </Link>
                        </footer>
                      </article>
                    ))}
                  </div>
                  {!filtered.length && (
                    <div className={styles.empty}>
                      <p>조건에 맞는 표현이 없어요.</p>
                      <button
                        className={styles.secondary}
                        onClick={() => {
                          setQuery("");
                          setSource("");
                          setDueOnly(false);
                        }}
                      >
                        모든 배운 표현 보기
                      </button>
                    </div>
                  )}
                  <p className={styles.note}>
                    노트는 언제든 볼 수 있어요. 예문 열기와 듣기에는 복습 XP가 붙지 않습니다.
                  </p>
                </>
              ) : (
                <div className={styles.empty}>
                  <BookOpen size={25} aria-hidden="true" />
                  <p>아직 배운 표현이 없어요. 표현이 연결된 활동을 마치면 이곳에 모입니다.</p>
                  <Link className={styles.secondary} href="/english/courses">
                    첫 학습 시작하기
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className={styles.empty}>
              <BookOpen size={25} aria-hidden="true" />
              <p>로그인해 연습하면 내가 배운 표현만 이곳에 모입니다.</p>
            </div>
          )}
        </section>
      </div>
    </div>,
    locale,
  );
}
