"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BookOpenIcon,
  FishIcon,
  HeadphonesIcon,
  CheckIcon,
  ArrowRightIcon,
  SpeakerHighIcon,
  StopIcon,
  SignOutIcon,
  ArrowLeftIcon,
  CalendarDotsIcon,
  StarIcon,
  ArrowsHorizontalIcon,
} from "@phosphor-icons/react";
import type { StudySnapshot, Selection } from "@/lib/speaking/catalog/view";
import { RepeatPractice } from "./repeat-practice";
import { FishCollection, FishArt as Fish, FishingLevel } from "./fish-collection";
import type { FishRecord } from "@/lib/speaking/catalog/fishing/collection";
import { LessonBook } from "./lesson-book";
import { StudyTimer } from "./study-timer";
import { useStudyAudio, type StudyAudio } from "./use-study-audio";
import styles from "./speaking.module.css";

type View = "today" | "practice" | "repeat" | "collection" | "feeding" | "guide";
type Result = { snapshot: StudySnapshot; correct?: boolean; explanation?: string; error?: string };
function resolvedView(view: View, snapshot: StudySnapshot): View {
  if (view === "feeding" && !snapshot.repeat.active?.feeding)
    return snapshot.repeat.active ? "repeat" : "collection";
  if (view === "repeat" && snapshot.repeat.active?.feeding) return "feeding";
  return view;
}
export function SpeakingStudy({
  initial,
  name,
  sessionKey,
}: {
  initial: StudySnapshot;
  name: string;
  sessionKey: string;
}) {
  const [data, setData] = useState(initial),
    [view, setView] = useState<View>("today"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [notice, setNotice] = useState(""),
    [reward, setReward] = useState<FishRecord | null>(null);
  const playback = useStudyAudio();
  const needsDeviceVoice =
    !data.audio.full ||
    (data.question.type !== "read" && !data.audio.question) ||
    data.soundCards.some((card) => !card.audio);
  const generation = useRef(0),
    locked = useRef(false),
    controller = useRef<AbortController | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const pageHeading = useRef<HTMLHeadingElement>(null);
  const activePractice = useRef<HTMLElement>(null);
  const stopAudio = playback.stop;
  const audio: StudyAudio = {
    ...playback,
    play: (...args) => {
      if (!busy) playback.play(...args);
    },
  };
  const liveSelection = useRef(data.selection);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    pageHeading.current?.focus({ preventScroll: true });
  }, [view]);
  useEffect(() => {
    liveSelection.current = data.selection;
  }, [data.selection]);
  const load = useCallback(
    async (selection: Selection, nextView?: View) => {
      if (locked.current) return;
      controller.current?.abort();
      const abort = new AbortController();
      controller.current = abort;
      const version = ++generation.current;
      setBusy(true);
      setError("");
      try {
        const query = new URLSearchParams({
          course: selection.course,
          day: String(selection.day),
          minutes: String(selection.minutes),
          ...(selection.question ? { question: selection.question } : {}),
        });
        const response = await fetch(`/speaking/api/study?${query}`, {
          cache: "no-store",
          headers: { "X-Speaking-Session": sessionKey },
          signal: abort.signal,
        });
        if (response.status === 401) {
          window.location.replace("/speaking");
          return;
        }
        const result: Result = await response.json();
        if (!response.ok) throw new Error(result.error);
        if (version === generation.current) {
          stopAudio();
          setData(result.snapshot);
          setView((current) => resolvedView(nextView ?? current, result.snapshot));
        }
      } catch (e) {
        if (version === generation.current && !abort.signal.aborted)
          setError(e instanceof Error ? e.message : "다시 불러와 주세요.");
      } finally {
        if (version === generation.current) setBusy(false);
      }
    },
    [sessionKey, stopAudio],
  );
  useEffect(() => {
    const generationRef = generation;
    const visible = () => {
      if (!document.hidden) void load(liveSelection.current);
    };
    const pageShow = (event: PageTransitionEvent) => {
      if (event.persisted) window.location.reload();
    };
    const channel =
      typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("speaking-access") : null;
    if (channel) channel.onmessage = () => window.location.replace("/speaking");
    document.addEventListener("visibilitychange", visible);
    window.addEventListener("pageshow", pageShow);
    return () => {
      generationRef.current++;
      controller.current?.abort();
      channel?.close();
      document.removeEventListener("visibilitychange", visible);
      window.removeEventListener("pageshow", pageShow);
    };
  }, [load]);
  function choose(selection: Selection, nextView: View = view) {
    audio.stop();
    setNotice("");
    setReward(null);
    void load(selection, nextView);
  }
  async function submit(input: object, nextView?: View) {
    if (locked.current || busy) return;
    locked.current = true;
    setBusy(true);
    setError("");
    audio.stop();
    controller.current?.abort();
    const version = ++generation.current;
    try {
      const response = await fetch("/speaking/api/study", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Speaking-Session": sessionKey },
        body: JSON.stringify({ ...input, selection: data.selection }),
      });
      if (response.status === 401) {
        window.location.replace("/speaking");
        return;
      }
      const result: Result = await response.json();
      if (!response.ok) throw new Error(result.error);
      if (version !== generation.current) return;
      audio.stop();
      if (result.snapshot.totalFish > data.totalFish) {
        const caught = result.snapshot.collection.records.find(
          (c) => !data.collection.records.some((old) => old.id === c.id),
        );
        setReward(caught ?? null);
      } else setReward(null);
      setData(result.snapshot);
      setView((current) => resolvedView(nextView ?? current, result.snapshot));
      const repeatCount = Object.values(result.snapshot.repeat.rounds).reduce((a, b) => a + b, 0);
      const oldRepeatCount = Object.values(data.repeat.rounds).reduce((a, b) => a + b, 0);
      setNotice(
        repeatCount > oldRepeatCount
          ? `${data.repeat.active?.feeding ? "문장을 말하고 먹이 주기를 마쳤어요." : "반복 연습 한 묶음을 마쳤어요."} 지금까지 ${repeatCount}묶음을 연습했습니다.`
          : result.snapshot.collection.growth.level > data.collection.growth.level
            ? `낚시 Lv.${result.snapshot.collection.growth.level}! 일반 포획의 오로라 확률이 ${result.snapshot.collection.growth.aurora}%가 됐어요.`
            : result.explanation || "",
      );
      if (result.correct !== false)
        requestAnimationFrame(() => heading.current?.focus({ preventScroll: false }));
    } catch (e) {
      if (version === generation.current)
        setError(e instanceof Error ? e.message : "저장하지 못했습니다.");
    } finally {
      locked.current = false;
      if (version === generation.current) setBusy(false);
    }
  }
  async function logout() {
    if (busy) return;
    setBusy(true);
    audio.stop();
    try {
      const response = await fetch("/speaking/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "logout" }),
      });
      if (!response.ok) throw new Error();
      const channel =
        typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("speaking-access") : null;
      channel?.postMessage("logout");
      channel?.close();
      window.location.replace("/speaking");
    } catch {
      setError("로그아웃하지 못했습니다. 다시 눌러 주세요.");
      setBusy(false);
    }
  }
  const selectedCourse = data.courses.find((c) => c.id === data.selection.course)!;
  const rewardDetail =
    reward &&
    (data.collection.records.filter((c) => c.fish === reward.fish).length === 1
      ? "새 어종을 발견했어요!"
      : data.collection.records
            .filter((c) => c.fish === reward.fish && c.id !== reward.id)
            .every((c) => c.length < reward.length)
        ? "이 어종의 최고 크기 기록을 세웠어요!"
        : "");
  const activeRun = data.repeat.active;
  function resumePractice() {
    audio.stop();
    setNotice("");
    setView(activeRun?.feeding ? "feeding" : "repeat");
  }
  function feed(catchId: string) {
    if (busy) return;
    if (activeRun) {
      if (activeRun.feeding?.catchId === catchId) resumePractice();
      else {
        setNotice("진행 중인 연습을 마치거나 종료하면 먹이 주기를 시작할 수 있어요.");
        activePractice.current?.focus();
      }
      return;
    }
    void submit(
      {
        kind: "repeat",
        repeat: {
          action: "begin",
          deck: "feed",
          catchId,
          expectedRun: data.repeat.nextRun,
        },
      },
      "feeding",
    );
  }
  const featured = data.fish.find((f) => f.featured && f.count) || data.fish.find((f) => f.count);
  const tabs = [
    { id: "today", title: "오늘 공부", icon: CalendarDotsIcon },
    { id: "practice", title: "자유 연습", icon: BookOpenIcon },
    { id: "collection", title: "내 수조", icon: FishIcon },
    { id: "guide", title: "발음 안내", icon: HeadphonesIcon },
  ] as const;
  return (
    <div className={styles.studyPage}>
      <header className={styles.studyHeader}>
        <Link href="/" className={`brand ${styles.studyBrand}`} aria-label="단서공방 홈">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="brand-name">단서공방</span>
        </Link>
        <strong>스피킹 공부</strong>
        <details className={styles.account}>
          <summary>
            {name.slice(0, 1)}
            <span className={styles.accountLabel}> 내 계정</span>
          </summary>
          <div>
            <strong>{name}</strong>
            <p>
              완료 {data.clearedDays}일 · 물고기 {data.totalFish}마리
            </p>
            <button className={styles.textButton} onClick={logout} disabled={busy}>
              <SignOutIcon size={17} />
              로그아웃
            </button>
          </div>
        </details>
      </header>
      <main id="main-content" className={styles.studyShell}>
        <div className={styles.studyHeading}>
          <div>
            <h1 ref={pageHeading} tabIndex={-1}>
              {view === "collection"
                ? "내 수조"
                : view === "feeding"
                  ? "먹이 주기"
                  : view === "guide"
                    ? "발음 안내"
                    : view === "repeat"
                      ? "자유 연습"
                      : view === "practice"
                        ? "자유 연습"
                        : `${data.selection.day + 1}일차 공부`}
            </h1>
          </div>
        </div>
        {view === "today" && (
          <details className={styles.coursePlan}>
            <summary>
              <span>
                {selectedCourse.label} 코스 · 하루 {data.selection.minutes}분
              </span>
              <span>계획 변경</span>
            </summary>
            <div className={styles.courseControls} role="group" aria-label="학습 계획 선택">
              <div className={styles.courseChoices}>
                {data.courses.map((course) => (
                  <button
                    key={course.id}
                    disabled={busy}
                    aria-pressed={course.id === data.selection.course}
                    onClick={() =>
                      choose({
                        ...data.selection,
                        course: course.id,
                        day: Math.min(data.selection.day, course.length - 1),
                      })
                    }
                  >
                    {course.label}
                  </button>
                ))}
              </div>
              <label>
                학습일
                <select
                  value={data.selection.day}
                  disabled={busy}
                  onChange={(e) =>
                    choose(
                      { ...data.selection, day: Number(e.target.value), question: undefined },
                      "today",
                    )
                  }
                >
                  {data.days.map((day, i) => (
                    <option key={i} value={i}>
                      {i + 1}일차 · {day.title}
                      {day.done ? " ✓" : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                하루 분량
                <select
                  value={data.selection.minutes}
                  disabled={busy || data.started}
                  onChange={(e) =>
                    choose({
                      ...data.selection,
                      minutes: Number(e.target.value) as Selection["minutes"],
                    })
                  }
                >
                  <option value={60}>60분</option>
                  <option value={90}>90분</option>
                  <option value={120}>120분</option>
                </select>
              </label>
            </div>
          </details>
        )}
        {error && (
          <div className={styles.error} role="alert">
            {error}{" "}
            <button
              className={styles.textButton}
              disabled={busy}
              onClick={() => void load(data.selection)}
            >
              기록 다시 불러오기
            </button>
          </div>
        )}
        {notice && (
          <p className={styles.notice} role="status">
            {notice}
          </p>
        )}
        {reward !== null && (
          <div className={styles.reward} role="status">
            <Fish id={reward.fish} name={data.fish[reward.fish].name} record={reward} hidden />
            <div>
              <strong>
                {data.fish[reward.fish].name} · {reward.length}cm
              </strong>
              <p>
                {reward.gradeName} 크기 · {reward.patternName} 무늬
                {reward.star ? " · 오늘의 별물고기" : ""} · +20 XP
              </p>
              {rewardDetail && <p>{rewardDetail}</p>}
            </div>
            <button
              className={styles.textButton}
              onClick={() => {
                audio.stop();
                setView("collection");
                setReward(null);
              }}
            >
              {view === "collection" ? (
                "확인"
              ) : (
                <>
                  수조 보기 <ArrowRightIcon size={16} />
                </>
              )}
            </button>
          </div>
        )}
        {(view === "practice" || view === "repeat") && (
          <div className={styles.practiceModes} role="group" aria-label="자유 연습 방식">
            <button
              disabled={busy}
              aria-pressed={view === "repeat"}
              onClick={() => {
                audio.stop();
                resumePractice();
              }}
            >
              반복 연습
            </button>
            <button
              disabled={busy}
              aria-pressed={view === "practice"}
              onClick={() => choose({ ...data.selection, question: data.question.id }, "practice")}
            >
              유형별 문항
            </button>
          </div>
        )}
        {view === "repeat" && (
          <RepeatPractice
            data={data}
            audio={audio}
            busy={busy}
            onAction={(repeat) => void submit({ kind: "repeat", repeat })}
          />
        )}
        {(view === "today" || view === "practice") && (
          <div className={styles.studyColumns}>
            <section className={styles.lessonCard} aria-busy={busy}>
              {view === "practice" ? (
                <div className={styles.practicePicker}>
                  <label className={styles.field}>
                    연습 유형
                    <select
                      disabled={busy}
                      value={data.question.type}
                      onChange={(e) => {
                        const first = data.questionList.find((q) => q.type === e.target.value);
                        if (first) choose({ ...data.selection, question: first.id });
                      }}
                    >
                      {data.taskTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.title} ·{" "}
                          {data.questionList.filter((q) => q.type === type.id).length}문항
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={styles.field}>
                    연습할 문항
                    <select
                      disabled={busy}
                      value={data.question.id}
                      onChange={(e) => choose({ ...data.selection, question: e.target.value })}
                    >
                      {data.questionList
                        .filter((q) => q.type === data.question.type)
                        .map((q) => (
                          <option key={q.id} value={q.id}>
                            {q.title}
                          </option>
                        ))}
                    </select>
                  </label>
                </div>
              ) : (
                <div className={styles.lessonProgress}>
                  <span>
                    {Math.min(data.completed + 1, data.total)} / {data.total} 단계
                  </span>
                  <progress value={data.completed} max={data.total} aria-label="오늘 완료한 단계" />
                </div>
              )}
              <h2 ref={heading} tabIndex={-1}>
                {view === "practice"
                  ? data.question.title
                  : data.finished
                    ? "오늘 공부를 마쳤어요."
                    : data.step.title}
              </h2>
              {view === "practice" && (
                <button
                  className={styles.textButton}
                  disabled={busy}
                  aria-pressed={data.repeat.bookmarks.includes(data.question.id)}
                  onClick={() =>
                    void submit({
                      kind: "repeat",
                      repeat: {
                        action: "bookmark",
                        question: data.question.id,
                        saved: !data.repeat.bookmarks.includes(data.question.id),
                      },
                    })
                  }
                >
                  {data.repeat.bookmarks.includes(data.question.id) ? "담은 문항 ✓" : "문항 담기"}
                </button>
              )}
              {view === "today" && (
                <p className={styles.instruction}>
                  {data.finished
                    ? `오늘 코스에서 물고기 5마리를 모았습니다.`
                    : data.step.instruction}
                </p>
              )}
              {view === "today" && data.finished ? (
                <div className={styles.dayComplete}>
                  <StarIcon size={38} weight="fill" />
                  <strong>{data.selection.day + 1}일차 완료</strong>
                  {data.selection.day < 29 ? (
                    <button
                      className={styles.primary}
                      onClick={() =>
                        choose(
                          {
                            ...data.selection,
                            day: data.selection.day + 1,
                            course:
                              data.selection.day + 1 >= selectedCourse.length
                                ? data.selection.day + 1 < 14
                                  ? "fortnight"
                                  : "month"
                                : data.selection.course,
                            question: undefined,
                          },
                          "today",
                        )
                      }
                    >
                      다음 학습일 보기 <ArrowRightIcon size={18} />
                    </button>
                  ) : (
                    <button
                      className={styles.primary}
                      onClick={() =>
                        choose({ ...data.selection, question: data.question.id }, "practice")
                      }
                    >
                      유형별 연습 이어가기
                    </button>
                  )}
                </div>
              ) : (
                <LessonTask
                  key={`${view}-${data.selection.day}-${data.completed}-${data.question.id}`}
                  data={data}
                  practice={view === "practice"}
                  busy={busy}
                  audio={audio}
                  onComplete={(completion) => void submit({ kind: "complete", completion })}
                />
              )}
            </section>
            <aside className={styles.studyAside}>
              <details className={`${styles.plan} ${styles.studyCollectionSummary}`}>
                <summary>
                  내 수조 <span>{data.totalFish}마리</span>
                </summary>
                <div className={styles.miniTank}>
                  {featured ? (
                    <Fish id={featured.id} name={featured.name} record={data.collection.featured} />
                  ) : (
                    <FishIcon size={42} weight="duotone" />
                  )}
                  <div>
                    <strong>{featured ? featured.name : "아직 모은 물고기가 없어요"}</strong>
                    <p>
                      {data.totalFish
                        ? `${data.totalFish}마리 · ${data.fish.filter((f) => f.count).length}종 수집`
                        : "공부 한 묶음을 마치면 한 마리를 얻어요."}
                    </p>
                  </div>
                </div>
                <FishingLevel data={data} />
                <button
                  className={styles.textButton}
                  onClick={() => {
                    audio.stop();
                    setView("collection");
                  }}
                >
                  수조 열기 <ArrowRightIcon size={16} />
                </button>
              </details>
              {view === "today" && (
                <details className={styles.plan}>
                  <summary>
                    오늘의 공부 순서 <span>{data.selection.minutes}분</span>
                  </summary>
                  <ol>
                    {data.plan.map((part, index) => (
                      <li
                        key={part.title}
                        data-done={data.rooms[index]?.done}
                        aria-current={data.rooms[index]?.active ? "step" : undefined}
                      >
                        <strong>
                          {data.rooms[index]?.done && <CheckIcon size={14} />} {part.title} ·{" "}
                          {part.minutes}분
                        </strong>
                        <p>{part.description}</p>
                      </li>
                    ))}
                  </ol>
                </details>
              )}
              <details className={styles.plan}>
                <summary>음성과 속도 설정</summary>
                <label className={styles.field}>
                  듣기 속도
                  <select
                    value={audio.rate}
                    onChange={(e) => {
                      audio.stop();
                      audio.setRate(Number(e.target.value));
                    }}
                  >
                    <option value={1}>보통 · 1.0×</option>
                    <option value={0.85}>천천히 · 0.85×</option>
                  </select>
                </label>
                {needsDeviceVoice && (
                  <label className={styles.field}>
                    기기 음성
                    <select
                      value={audio.voiceName}
                      onChange={(e) => {
                        audio.stop();
                        audio.setVoiceName(e.target.value);
                      }}
                    >
                      {audio.voices.length ? (
                        audio.voices.map((v) => (
                          <option key={v.voiceURI} value={v.name}>
                            {v.name} · {v.lang}
                          </option>
                        ))
                      ) : (
                        <option value="">영어 음성 없음</option>
                      )}
                    </select>
                  </label>
                )}
                <p className={styles.small}>
                  {needsDeviceVoice
                    ? "제작 음성이 없는 문장에만 기기 음성을 사용합니다. 기기 음성은 휴대전화와 브라우저에 따라 다릅니다."
                    : "Annie · AI 제작 음성"}
                </p>
              </details>
            </aside>
          </div>
        )}
        {view === "feeding" && (
          <section>
            <button
              className={styles.textButton}
              onClick={() => {
                audio.stop();
                setView("collection");
              }}
            >
              <ArrowLeftIcon size={17} /> 수조로
            </button>
            <RepeatPractice
              data={data}
              audio={audio}
              busy={busy}
              onAction={(action) => void submit({ kind: "repeat", repeat: action })}
            />
          </section>
        )}
        {(view === "repeat" || view === "feeding") && (
          <details className={styles.plan}>
            <summary>듣기 속도</summary>
            <label className={styles.field}>
              재생 속도
              <select
                value={audio.rate}
                onChange={(e) => {
                  audio.stop();
                  audio.setRate(Number(e.target.value));
                }}
              >
                <option value={1}>보통 · 1.0×</option>
                <option value={0.85}>천천히 · 0.85×</option>
              </select>
            </label>
          </details>
        )}
        {view === "collection" && (
          <>
            {activeRun && (
              <section
                className={styles.resumePractice}
                ref={activePractice}
                tabIndex={-1}
                aria-label="진행 중인 연습"
              >
                <strong>
                  {activeRun.feeding
                    ? `${data.fish[activeRun.feeding.fish].name} 먹이 주기`
                    : data.repeatDecks.find((deck) => deck.id === activeRun.deck)?.title ||
                      "담은 문항 연습"}
                </strong>
                <p>
                  {activeRun.step} / {activeRun.ids.length * 2}단계 완료
                </p>
                <div className={styles.resumeActions}>
                  <button className={styles.secondary} disabled={busy} onClick={resumePractice}>
                    이어서 연습 <ArrowRightIcon size={17} />
                  </button>
                  <button
                    className={styles.textButton}
                    disabled={busy}
                    onClick={() =>
                      void submit({
                        kind: "repeat",
                        repeat: { action: "abandon", run: activeRun.run },
                      })
                    }
                  >
                    현재 묶음 종료
                  </button>
                </div>
              </section>
            )}
            <FishCollection
              onFeed={feed}
              onTheme={(theme) => void submit({ kind: "aquarium", theme })}
              onPractice={() => {
                audio.stop();
                resumePractice();
              }}
              data={data}
              busy={busy}
              onFeature={(fish, catchId) => void submit({ kind: "feature", fish, catchId })}
            />
          </>
        )}
        {view === "guide" && (
          <section className={styles.guideGrid}>
            <div className={styles.lessonCard}>
              <h2>듣고 따라 읽기</h2>
              <p>
                영어 음성을 먼저 듣고, 아래 한글을 보며 따라 읽으세요. 익숙해지면 한글을 가리고 다시
                말합니다. 한글만으로 옮기기 어려운 소리는 입과 혀의 위치를 함께 확인하세요.
              </p>
              <div className={styles.soundCards}>
                {data.soundCards.map((card) => (
                  <details key={card.id}>
                    <summary>
                      <b>{card.ipa}</b> {card.title}
                    </summary>
                    <p>{card.action}</p>
                    <p lang="en">
                      <strong>{card.word}</strong> {card.wordIpa}
                    </p>
                    <p>{card.check}</p>
                    <a href={card.source} target="_blank" rel="noreferrer">
                      사전 발음 듣기 ↗
                    </a>
                    <p lang="en">{card.phrase}</p>
                    <button
                      className={styles.textButton}
                      disabled={busy}
                      aria-pressed={audio.playing === card.phrase}
                      onClick={() =>
                        audio.playing === card.phrase
                          ? audio.stop()
                          : audio.play(card.phrase, card.audio)
                      }
                    >
                      {audio.playing === card.phrase ? (
                        <StopIcon size={18} />
                      ) : (
                        <SpeakerHighIcon size={18} />
                      )}
                      {audio.playing === card.phrase ? "예문 중지" : "예문 듣기"}
                    </button>
                  </details>
                ))}
              </div>
            </div>
            <div className={styles.lessonCard}>
              <h2>참고 자료</h2>
              <div className={styles.sources}>
                {data.sources.map((source) => (
                  <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                    <span>{source.tag}</span>
                    <strong>{source.title} ↗</strong>
                    <small>{source.note}</small>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      {audio.error && (
        <div className={`${styles.error} ${styles.audioError}`} role="alert">
          <p>{audio.error}</p>
          {audio.reentryRequired && (
            <Link className={styles.secondary} href="/speaking">
              다시 입장하기
            </Link>
          )}
          <button className={styles.textButton} onClick={audio.stop}>
            안내 닫기
          </button>
        </div>
      )}
      <nav className={styles.studyNav} aria-label="학습 화면">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            disabled={busy}
            aria-current={
              view === tab.id ||
              (tab.id === "practice" && view === "repeat") ||
              (tab.id === "collection" && view === "feeding")
                ? "page"
                : undefined
            }
            onClick={() => {
              audio.stop();
              setNotice("");
              setReward(null);
              if (tab.id === "today") choose({ ...data.selection, question: undefined }, "today");
              else if (tab.id === "practice")
                choose({ ...data.selection, question: data.question.id }, "repeat");
              else setView(tab.id);
            }}
          >
            <tab.icon
              size={22}
              weight={
                view === tab.id ||
                (tab.id === "practice" && view === "repeat") ||
                (tab.id === "collection" && view === "feeding")
                  ? "fill"
                  : "regular"
              }
            />
            <span>{tab.title}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function LessonTask({
  data,
  practice,
  busy,
  audio,
  onComplete,
}: {
  data: StudySnapshot;
  practice: boolean;
  busy: boolean;
  audio: StudyAudio;
  onComplete: (value: object) => void;
}) {
  const [said, setSaid] = useState(false),
    [answer, setAnswer] = useState<number | null>(null),
    [review, setReview] = useState(data.reviewOptions[0]?.id || ""),
    [hint, setHint] = useState(false);
  const q = data.question;
  const isQuiz = !practice && data.step.mode === "quiz";
  const showGuide = practice || data.step.mode === "coach";
  const initialHint =
    showGuide ||
    data.step.id.startsWith("first-") ||
    (data.selection.day === 0 && data.step.id === "review");
  const lockedDay = data.selection.day > data.activeDay;
  const book = (
    <LessonBook
      sentences={data.sentences}
      audio={audio}
      clip={data.audio.full}
      initiallyVisible={initialHint}
      busy={busy}
      onReveal={() => setHint(true)}
    />
  );
  return (
    <>
      {isQuiz ? (
        <fieldset className={styles.quiz}>
          <legend>{data.quiz.question}</legend>
          {data.quiz.options.map((option, i) => (
            <label key={option} data-selected={answer === i}>
              <input
                type="radio"
                name="quiz-answer"
                value={i}
                checked={answer === i}
                disabled={busy}
                onChange={() => setAnswer(i)}
              />
              <span>{option}</span>
            </label>
          ))}
        </fieldset>
      ) : (
        <>
          {data.schedule && (
            <div className={styles.scheduleRegion}>
              <p className={styles.scheduleHint}>
                <ArrowsHorizontalIcon size={16} aria-hidden="true" />
                표를 좌우로 밀어 확인하세요
              </p>
              <div className={styles.schedule} tabIndex={0} role="region" aria-label="일정표">
                <table>
                  <caption>
                    {data.schedule.title}
                    <small>{data.schedule.date}</small>
                  </caption>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Session</th>
                      <th>Speaker</th>
                      <th>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.schedule.rows.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {q.photo && (
            <figure className={styles.practicePhoto}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={q.photo} alt="영어로 묘사할 연습 장면" width={1448} height={1086} />
              <figcaption>AI 생성 사진</figcaption>
            </figure>
          )}
          {q.topic && (
            <p className={styles.instruction} lang="en">
              {q.topic}
            </p>
          )}
          {q.type === "read" ? (
            book
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
                    : audio.play(q.prompt, data.audio.question, q.position === 10 ? 2 : 1)
                }
              >
                {audio.playing === q.prompt ? (
                  <StopIcon size={18} />
                ) : (
                  <SpeakerHighIcon size={18} />
                )}
                {audio.playing === q.prompt
                  ? "질문 중지"
                  : q.position === 10
                    ? "질문 두 번 듣기"
                    : "질문 듣기"}
              </button>
              <details
                className={styles.answerGuide}
                open={showGuide || undefined}
                onToggle={(e) => {
                  if (e.currentTarget.open) setHint(true);
                }}
              >
                <summary>답변 예문과 한글 발음</summary>
                {q.meaning && <p className={styles.instruction}>{q.meaning}</p>}
                {book}
              </details>
            </>
          )}
          {(showGuide || q.type !== "read") && (
            <details className={styles.plan} open={(!practice && showGuide) || undefined}>
              <summary>답변 점검하기</summary>
              <p>{q.coaching}</p>
              <ul>
                {q.checks.map((check) => (
                  <li key={check}>{check}</li>
                ))}
              </ul>
            </details>
          )}
          <StudyTimer prep={q.prep} answer={q.answer} onStart={audio.stop} />
        </>
      )}
      {!practice && (
        <div className={styles.completeAction}>
          {data.step.mode === "summary" && (
            <label className={styles.field}>
              다음 학습일에 다시 연습할 문항
              <select value={review} disabled={busy} onChange={(e) => setReview(e.target.value)}>
                {data.reviewOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.title}
                  </option>
                ))}
              </select>
            </label>
          )}
          {!isQuiz && (
            <label className={styles.oralCheck}>
              <input
                type="checkbox"
                checked={said}
                disabled={busy || lockedDay}
                onChange={(e) => setSaid(e.target.checked)}
              />
              <span>소리 내어 연습했어요</span>
            </label>
          )}
          {lockedDay && (
            <p className={styles.notice}>
              앞선 학습일을 마치면 이 날의 기록과 보상을 남길 수 있습니다. 지문은 먼저 연습해 볼 수
              있어요.
            </p>
          )}
          <button
            className={styles.primary}
            disabled={busy || lockedDay || (isQuiz ? answer === null : !said)}
            onClick={() =>
              onComplete({
                day: data.selection.day,
                step: data.completed,
                minutes: data.selection.minutes,
                answer: answer ?? undefined,
                selfReport: said,
                hintOpened: hint || initialHint,
                review: data.step.mode === "summary" ? review : undefined,
              })
            }
          >
            {busy ? "저장 중…" : isQuiz ? "정답 확인" : "다음 단계"}
            <ArrowRightIcon size={18} />
          </button>
        </div>
      )}
    </>
  );
}
