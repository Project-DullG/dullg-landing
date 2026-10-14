"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useLocale } from "next-intl";
import { localizeEnglishTree } from "@/lib/i18n/english-tree";
import Image from "next/image";
import Link from "@/components/i18n/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Headphones,
  Mic,
  PenLine,
  RotateCcw,
  Volume2,
} from "lucide-react";
import {
  advanceEnglishProgress,
  emptyEnglishProgress,
  getEnglishGrowth,
  getEnglishEpisodeStatus,
  reconcileEnglishProgress,
} from "@/lib/english/progress";
import {
  englishLevels,
  englishSkills,
  type EnglishEpisode,
  type EnglishLevel,
  type EnglishProgress,
} from "@/lib/english/types";
import styles from "./player.module.css";
import { getEnglishCourse, getCourseFollowUp, getCourseHref } from "@/lib/english/courses";
import { getEnglishReloadIndex } from "@/lib/english/session-ui";

const icons = { reading: BookOpen, listening: Headphones, writing: PenLine, speaking: Mic };
type Feedback = { correct: boolean; feedback: string; consequence: string };
// Paragraph breaks change presentation only; the authored words stay intact.
function storyParagraphs(text: string): string[] {
  return text
    .split(/\n+/)
    .filter(Boolean)
    .flatMap((paragraph) => {
      if (paragraph.length <= 400) return [paragraph];
      const sentences = paragraph.split(/(?<=[.!?])\s+(?=[가-힣A-Z"'“])/u);
      const groups: string[] = [];
      let current = "";
      for (const sentence of sentences) {
        if (current && current.length + sentence.length > 350) {
          groups.push(current);
          current = sentence;
        } else current = current ? `${current} ${sentence}` : sentence;
      }
      if (current) groups.push(current);
      return groups;
    });
}
export function EnglishPlayer({
  episode,
  initialProgress,
  accountKey,
  loadError = false,
  startingLevel,
  replay = false,
  nextEpisode,
  courseId,
}: {
  episode: EnglishEpisode;
  initialProgress: EnglishProgress | null;
  accountKey: string | null;
  loadError?: boolean;
  startingLevel?: EnglishLevel;
  replay?: boolean;
  nextEpisode?: { id: string; title: string };
  courseId?: string;
}) {
  const locale = useLocale();
  const [progress, setProgress] = useState(() =>
    initialProgress ? reconcileEnglishProgress(initialProgress, [episode]) : emptyEnglishProgress(),
  );
  const [level, setLevel] = useState<EnglishLevel>(
    startingLevel ||
      initialProgress?.episodes[episode.id]?.level ||
      initialProgress?.preferredLevel ||
      "standard",
  );
  const initialStatus = getEnglishEpisodeStatus(initialProgress || emptyEnglishProgress(), episode);
  const course = getEnglishCourse(courseId || "");
  const followUp = course
    ? getCourseFollowUp(course, progress, episode.id, !!accountKey)
    : undefined;
  const loginReturn = getCourseHref(episode.id, level, { courseId, replay })!;
  const [index, setIndex] = useState(replay ? 0 : initialStatus.firstMissingIndex);
  const [replaying, setReplaying] = useState(replay);
  const [introducedChapters, setIntroducedChapters] = useState<string[]>([]);
  const [viewedChapterId, setViewedChapterId] = useState<string | null>(null);
  const [transferAnswer, setTransferAnswer] = useState("");
  const [answer, setAnswer] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [hint, setHint] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(
    loadError ? "학습 기록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요." : "",
  );
  const [storageReady, setStorageReady] = useState(!loadError);
  const [speaking, setSpeaking] = useState(false);
  const [audioError, setAudioError] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState("");
  const [recordingError, setRecordingError] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);
  const workspace = useRef<HTMLElement>(null);
  const recordingUrlRef = useRef("");
  const recordingGeneration = useRef(0);
  const task = episode.tasks[index],
    version = task?.versions[level];
  const growth = getEnglishGrowth(progress),
    total = episode.tasks.length,
    finished = index >= total;
  const chapters = episode.chapters || [];
  const currentChapter = finished
    ? chapters[chapters.length - 1]
    : chapters.find((chapter) => chapter.id === task?.chapterId);
  const storyChapter = chapters.find((chapter) => chapter.id === viewedChapterId) || currentChapter;
  const chapterOpening =
    !!storyChapter &&
    (!!viewedChapterId || (!finished && !introducedChapters.includes(storyChapter.id)));
  const currentChapterIndex = currentChapter
    ? chapters.findIndex((chapter) => chapter.id === currentChapter.id)
    : -1;
  const completed = new Set(progress.episodes[episode.id]?.completedTasks || []);
  const completedTasks = episode.tasks.filter((candidate) => completed.has(candidate.id));
  const paceCount = replaying
    ? Math.min(index + (feedback?.correct ? 1 : 0), total)
    : completedTasks.length;
  const collectedExpressions = episode.expressions.filter((expression) =>
    completedTasks.some((candidate) => candidate.expressionIds.includes(expression.id)),
  );
  const chapterComplete = (id: string) => {
    const tasks = episode.tasks.filter((candidate) => candidate.chapterId === id);
    return tasks.length > 0 && tasks.every((candidate) => completed.has(candidate.id));
  };
  const sceneImage = storyChapter?.image || episode.image;
  const sceneAlt = storyChapter?.imageAlt || episode.imageAlt;
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (timer.current) clearTimeout(timer.current);
      if (recorder.current?.state === "recording") recorder.current.stop();
      stream.current?.getTracks().forEach((t) => t.stop());
      if (recordingUrlRef.current) URL.revokeObjectURL(recordingUrlRef.current);
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);
  function focusWorkspace() {
    window.requestAnimationFrame(() => {
      workspace.current?.scrollIntoView({ block: "start", behavior: "auto" });
      workspace.current?.focus({ preventScroll: true });
    });
  }
  function resetTask() {
    recordingGeneration.current++;
    if (recorder.current?.state === "recording") recorder.current.stop();
    stream.current?.getTracks().forEach((t) => t.stop());
    if (timer.current) clearTimeout(timer.current);
    if (recordingUrlRef.current) URL.revokeObjectURL(recordingUrlRef.current);
    recordingUrlRef.current = "";
    setRecordingUrl("");
    setRecording(false);
    setRecordingError("");
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setAnswer("");
    setConfirmed(false);
    setHint(false);
    setFeedback(null);
    setSpeaking(false);
    setAudioError("");
  }
  function listen(text: string) {
    setAudioError("");
    if (!("speechSynthesis" in window)) {
      setAudioError("소리를 재생할 수 없어요. 대본을 보고 연습해 주세요.");
      return;
    }
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = level === "starter" ? 0.82 : 0.94;
    const voices = window.speechSynthesis.getVoices();
    const voice =
      voices.find((v) => v.lang === "en-US" && /Samantha|Google|Natural/.test(v.name)) ||
      voices.find((v) => v.lang === "en-US") ||
      voices.find((v) => v.lang.startsWith("en"));
    if (voice) utterance.voice = voice;
    utterance.onend = () => mounted.current && setSpeaking(false);
    utterance.onerror = (e) => {
      if (mounted.current) {
        setSpeaking(false);
        if (!["canceled", "interrupted"].includes(e.error))
          setAudioError("소리가 재생되지 않았어요. 다시 눌러 보거나 대본을 확인해 주세요.");
      }
    };
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }
  async function startRecording() {
    setRecordingError("");
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setRecordingError("녹음을 사용할 수 없어요. 소리 내어 연습만 해도 괜찮아요.");
      return;
    }
    if (recording) {
      recorder.current?.stop();
      return;
    }
    const generation = ++recordingGeneration.current;
    try {
      const input = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mounted.current || generation !== recordingGeneration.current) {
        input.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = input;
      const device = new MediaRecorder(input);
      recorder.current = device;
      const chunks: BlobPart[] = [];
      device.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      device.onstop = () => {
        input.getTracks().forEach((t) => t.stop());
        if (!mounted.current || generation !== recordingGeneration.current) return;
        if (timer.current) clearTimeout(timer.current);
        if (recordingUrlRef.current) URL.revokeObjectURL(recordingUrlRef.current);
        const url = URL.createObjectURL(new Blob(chunks, { type: device.mimeType }));
        recordingUrlRef.current = url;
        setRecordingUrl(url);
        setRecording(false);
      };
      device.start();
      setRecording(true);
      timer.current = setTimeout(() => {
        if (device.state === "recording") device.stop();
      }, 60_000);
    } catch {
      if (generation === recordingGeneration.current)
        stream.current?.getTracks().forEach((track) => track.stop());
      setRecordingError("마이크 사용이 허용됐는지 확인해 주세요. 녹음 없이 말해도 괜찮아요.");
    }
  }
  async function reloadProgress() {
    setBusy(true);
    try {
      const response = await fetch("/api/english/progress", { cache: "no-store" }),
        data = await response.json();
      if (!response.ok || data.accountKey !== accountKey)
        throw new Error(
          "로그인한 계정을 확인해 주세요. 계정이 바뀌었다면 페이지를 새로 열어 주세요.",
        );
      const restored = reconcileEnglishProgress(data.progress, [episode]);
      setProgress(restored);
      setStorageReady(true);
      setError("");
      const next = getEnglishReloadIndex(restored, episode, replaying, index);
      resetTask();
      setViewedChapterId(null);
      setIndex(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "기록을 불러오지 못했어요.");
    } finally {
      setBusy(false);
    }
  }
  async function submit() {
    if (!task || busy || !storageReady) return;
    setBusy(true);
    setError("");
    const attempt = {
      episodeId: episode.id,
      taskId: task.id,
      level,
      ...(courseId ? { courseId } : {}),
      answer,
      selfConfirmed: confirmed,
    };
    try {
      if (!accountKey) {
        const result = advanceEnglishProgress(progress, attempt, episode);
        setProgress(result.progress);
        setFeedback(result);
      } else {
        const response = await fetch("/api/english/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "attempt", accountKey, ...attempt }),
          }),
          data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "기록을 저장하지 못했어요. 다시 시도해 주세요.");
        setProgress(data.progress);
        setFeedback(data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "기록을 저장하지 못했어요.");
    } finally {
      setBusy(false);
    }
  }
  const Icon = task ? icons[task.skill] : Check;
  const actionCue =
    task?.skill === "speaking"
      ? "소리 내어 말한 뒤 아래 확인을 체크해요."
      : task?.skill === "listening"
        ? "먼저 듣고 알맞은 답을 골라요."
        : version?.options?.length
          ? "자료를 살펴보고 알맞은 답을 골라요."
          : "전하고 싶은 내용을 짧게 영어로 써 봐요.";
  const upcomingIndex = replaying
    ? index + 1
    : episode.tasks.findIndex(
        (candidate, position) => position > index && !completed.has(candidate.id),
      );
  const upcomingTask = episode.tasks[upcomingIndex];
  return localizeEnglishTree(
    <div className={styles.player} style={{ "--episode-accent": episode.accent } as CSSProperties}>
      <div className={styles.topbar}>
        <Link
          href={course ? "/english/courses?course=" + course.id + "&level=" + level : "/english"}
        >
          <ArrowLeft size={16} /> {course ? "코스 목차" : "학습 목록"}
        </Link>
        <span>FIRST PAGES / {episode.genreLabel}</span>
        <span>
          Lv.{growth.level} · {growth.title}
        </span>
      </div>
      {!accountKey && (
        <div className={styles.guest}>
          로그인 없이 플레이하고 있어요. 기록은 이 화면에만 남아요.{" "}
          <Link href={`/login?next=${encodeURIComponent(loginReturn)}`}>
            로그인하고 기록 남기기 →
          </Link>
        </div>
      )}
      {accountKey && initialStatus.completionRewarded && !initialStatus.finished && !finished && (
        <p className={styles.updateNote}>
          새 장면이 추가됐어요. 지난 학습 기록은 그대로 남아 있습니다. 아직 만나지 못한 장면부터
          이어서 즐겨보세요.
        </p>
      )}
      <div className={styles.layout}>
        <aside className={styles.scene}>
          <Image
            src={sceneImage}
            alt={sceneAlt}
            width={1672}
            height={941}
            priority
            sizes="(max-width: 900px) 100vw, 340px"
          />
          <div className={styles.shade} />
          <div className={styles.sceneTop}>
            <span>SEASON 01 · 첫 번째 페이지</span>
            <span>약 {episode.minutes}분</span>
          </div>
          <div className={styles.sceneCopy}>
            <p>{episode.englishTitle}</p>
            <h1>{episode.title}</h1>
            <div>
              {storyChapter ? (
                <>
                  <span className={styles.location}>{storyChapter.location}</span>
                  <details className={styles.sceneGoal}>
                    <summary>이 장면의 목표</summary>
                    <p>{storyChapter.objective}</p>
                  </details>
                </>
              ) : finished ? (
                episode.takeaway
              ) : (
                episode.synopsis
              )}
            </div>
          </div>
          <div className={styles.pace}>
            <div>
              <strong>{replaying ? "이번 다시 연습" : "이야기 진도"}</strong>
              <span>
                {paceCount} / {total}
              </span>
            </div>
            <progress
              value={paceCount}
              max={total}
              aria-label={replaying ? "이번 다시 연습" : "이야기 진도"}
            />
          </div>
          {chapters.length ? (
            <details className={styles.chapterMenu}>
              <summary>
                장면 목차{" "}
                <span>
                  {Math.max(1, currentChapterIndex + 1)} / {chapters.length}
                </span>
              </summary>
              <nav className={styles.chapterSteps} aria-label="이야기 진행">
                {chapters.map((chapter, chapterIndex) => {
                  const done = chapterComplete(chapter.id);
                  const available = chapterIndex <= currentChapterIndex || done;
                  return (
                    <button
                      key={chapter.id}
                      type="button"
                      disabled={!available || busy || recording}
                      aria-current={storyChapter?.id === chapter.id ? "step" : undefined}
                      className={done ? styles.chapterDone : ""}
                      onClick={() => {
                        resetTask();
                        setViewedChapterId(chapter.id);
                        focusWorkspace();
                      }}
                    >
                      <span>
                        {done ? <Check size={15} /> : chapterIndex + 1}
                        <small>{done ? "완료" : available ? "진행 중" : "다음 장"}</small>
                      </span>
                      <strong>{chapter.title}</strong>
                    </button>
                  );
                })}
              </nav>
            </details>
          ) : (
            <div className={styles.simpleProgress}>
              {Math.min(index + 1, total)} / {total}
            </div>
          )}
        </aside>
        <section
          className={styles.workspace}
          ref={workspace}
          tabIndex={-1}
          aria-label="영어 학습 장면"
        >
          <ol className={styles.flow} aria-label="이 장면의 학습 흐름">
            <li aria-current={chapterOpening ? "step" : undefined}>이야기</li>
            <li>자료</li>
            <li
              aria-current={!chapterOpening && !finished && !feedback?.correct ? "step" : undefined}
            >
              내 반응
            </li>
            <li
              aria-current={!chapterOpening && (feedback?.correct || finished) ? "step" : undefined}
            >
              결과
            </li>
          </ol>
          <div className={styles.storyUtilities}>
            <details className={styles.notebook}>
              <summary>
                <BookOpen size={14} /> 단서 수첩 <span>{completedTasks.length}</span>
              </summary>
              <div className={styles.notebookBody}>
                <h3>지금까지 알아낸 것</h3>
                {completedTasks.length ? (
                  completedTasks.map((candidate) => (
                    <article key={candidate.id}>
                      <h4>{candidate.document || candidate.title}</h4>
                      <p>{candidate.feedback}</p>
                      <p lang="en" className={styles.evidenceModel}>
                        {candidate.versions[level].model}
                      </p>
                      <small>{candidate.consequence}</small>
                    </article>
                  ))
                ) : (
                  <p>알아낸 단서는 여기에 모아 둘게요.</p>
                )}
                {!!collectedExpressions.length && (
                  <>
                    <h3>배운 표현</h3>
                    {collectedExpressions.map((expression) => (
                      <div key={expression.id}>
                        <p lang="en" className={styles.evidenceModel}>
                          {expression.en}
                        </p>
                        {locale === "ko" && <small>{expression.ko}</small>}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </details>
            {!!episode.cast?.length && (
              <details className={styles.cast}>
                <summary>등장인물</summary>
                {episode.cast.map((person) => (
                  <div key={person.name}>
                    <strong>
                      {person.name}
                      <span>{person.role}</span>
                    </strong>
                    <p>{person.motivation}</p>
                  </div>
                ))}
              </details>
            )}
          </div>
          {chapterOpening && error && (
            <div className={styles.error} role="alert">
              <p>{error}</p>
              {accountKey && (
                <button type="button" onClick={reloadProgress} disabled={busy}>
                  다시 불러오기
                </button>
              )}
              <Link href={`/login?next=${encodeURIComponent(loginReturn)}`}>로그인 상태 확인</Link>
            </div>
          )}
          {chapterOpening && storyChapter ? (
            <div className={styles.chapterOpening}>
              <p className={styles.eyebrow}>
                STORY CHAPTER ·{" "}
                {chapters.findIndex((chapter) => chapter.id === storyChapter.id) + 1} /{" "}
                {chapters.length}
              </p>
              <p className={styles.sectionLabel}>먼저, 이야기 속으로</p>
              <h2>{storyChapter.title}</h2>
              <div className={styles.storyProse}>
                {storyParagraphs(locale === "en" ? storyChapter.storyEn : storyChapter.story).map(
                  (paragraph, paragraphIndex) => (
                    <p key={paragraphIndex}>{paragraph}</p>
                  ),
                )}
              </div>
              <div className={styles.storyDialogue}>
                {storyChapter.dialogue.map((line, lineIndex) => (
                  <article key={`${line.speaker}-${lineIndex}`}>
                    <div>
                      <strong>{line.speaker}</strong>
                      <button
                        type="button"
                        className={styles.textButton}
                        onClick={() => listen(line.en)}
                      >
                        <Volume2 size={14} />
                        {speaking ? "듣기 멈추기" : "대화 듣기"}
                      </button>
                    </div>
                    <p lang="en">{line.en}</p>
                    {locale === "ko" && (
                      <details>
                        <summary>뜻 보기</summary>
                        <p>{line.ko}</p>
                      </details>
                    )}
                  </article>
                ))}
              </div>
              {audioError && (
                <p className={styles.note} role="status">
                  {audioError}
                </p>
              )}
              <button
                type="button"
                className={styles.primary}
                onClick={() => {
                  if (!introducedChapters.includes(storyChapter.id))
                    setIntroducedChapters([...introducedChapters, storyChapter.id]);
                  setViewedChapterId(null);
                  resetTask();
                  focusWorkspace();
                }}
              >
                {viewedChapterId ? "진행하던 곳으로" : "이 장면에서 해 볼 일"}
                <ArrowRight size={17} />
              </button>
              <p className={styles.note}>
                이야기는 천천히 읽어도 괜찮아요. 연습을 마치면 진도와 XP가 쌓여요.
              </p>
            </div>
          ) : finished ? (
            <div className={styles.ending}>
              <span className={styles.stamp}>
                <Check size={25} />
              </span>
              <p className={styles.eyebrow}>STORY COMPLETE</p>
              <h2>
                이야기를 마쳤어요.
                <br />
                배운 표현을 다시 써 볼까요?
              </h2>
              <div className={styles.storyResolution}>
                <h3>이야기의 끝</h3>
                <p>{episode.ending}</p>
              </div>
              <p>{episode.takeaway}</p>
              <div className={styles.growth}>
                <strong>{accountKey ? "내 학습 기록" : "체험 기록"}</strong>
                <span>
                  {total}개 활동 · {episode.expressions.length}개 표현
                </span>
                <b>
                  Lv.{growth.level} · {progress.xp} XP
                </b>
              </div>
              <div className={styles.endActions}>
                <Link
                  href={
                    followUp
                      ? getCourseHref(
                          followUp.contentId,
                          followUp.inProgress
                            ? progress.episodes[followUp.contentId]?.level || level
                            : level,
                          { courseId: course?.id },
                        )!
                      : course
                        ? "/english/courses?course=" + course.id + "&level=" + level
                        : nextEpisode
                          ? `/english/play/${nextEpisode.id}?level=${level}`
                          : "/english"
                  }
                  className={styles.primary}
                >
                  {followUp
                    ? "코스의 다음 학습으로"
                    : course
                      ? "코스 목차 보기"
                      : nextEpisode
                        ? "다음 이야기 시작하기"
                        : "다음 이야기 고르기"}{" "}
                  <ArrowRight size={17} />
                </Link>
                {course ? (
                  <p className={styles.note}>{course.title.ko}</p>
                ) : (
                  nextEpisode && <p className={styles.note}>{nextEpisode.title}</p>
                )}
                {accountKey && (
                  <Link href="/english/review" className={styles.secondary}>
                    내 복습 수첩
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    resetTask();
                    setViewedChapterId(null);
                    setIntroducedChapters([]);
                    setReplaying(true);
                    setIndex(0);
                    focusWorkspace();
                  }}
                  className={styles.textButton}
                >
                  <RotateCcw size={14} /> 처음부터 다시 하기
                </button>
              </div>
              <h3>다시 써 볼 표현</h3>
              {episode.expressions.map((e) => (
                <div className={styles.expression} key={e.id}>
                  <p lang="en">{e.en}</p>
                  {locale === "ko" && <span>{e.ko}</span>}
                </div>
              ))}
              <p className={styles.note}>
                {accountKey
                  ? "배운 표현은 복습 목록에 담겼어요. 복습 시간이 되면 다시 꺼내 보세요."
                  : "이번 기록은 이 화면에만 남아요. 로그인하고 공부하면 다음에도 이어할 수 있어요."}
              </p>
              {episode.debrief && (
                <details className={styles.transfer}>
                  <summary>다른 상황에서도 한 번 더 · 선택</summary>
                  <section className={styles.debrief} aria-labelledby="transfer-title">
                    <p className={styles.eyebrow}>ONE MORE TRY</p>
                    <h3 id="transfer-title">다른 상황에서도 써 볼까요?</h3>
                    <p>{episode.debrief.question}</p>
                    <label htmlFor="english-transfer">내 영어 답변</label>
                    <textarea
                      id="english-transfer"
                      value={transferAnswer}
                      onChange={(event) => setTransferAnswer(event.target.value)}
                      lang="en"
                      rows={4}
                      maxLength={1200}
                      className={styles.textarea}
                      placeholder="Try your own response…"
                      data-english-user-content
                    />
                    <details>
                      <summary>예문 보기</summary>
                      <p lang="en">{episode.debrief.model}</p>
                      {locale === "ko" && <p>{episode.debrief.modelKo}</p>}
                    </details>
                    <p className={styles.note}>
                      자유롭게 써 보세요. 이 답변은 저장하거나 채점하지 않아요.
                    </p>
                  </section>
                </details>
              )}
            </div>
          ) : (
            task &&
            version && (
              <>
                <div className={styles.taskHeader}>
                  <span>
                    <Icon size={15} /> {englishSkills[task.skill].en} ·{" "}
                    {englishSkills[task.skill].label}
                  </span>
                  <span>
                    {index + 1} / {total}
                  </span>
                </div>
                <p className={styles.sectionLabel}>지금 할 일</p>
                <h2>{task.title}</h2>
                <p className={styles.context}>{task.context}</p>
                <p className={styles.actionCue}>{actionCue}</p>
                <details className={styles.settings}>
                  <summary>
                    난이도 <strong>{englishLevels.find((item) => item.id === level)?.label}</strong>
                  </summary>
                  <fieldset className={styles.difficulty}>
                    <legend>나에게 맞는 난이도</legend>
                    {englishLevels.map((l) => (
                      <button
                        type="button"
                        key={l.id}
                        disabled={busy || !!feedback?.correct || recording}
                        aria-pressed={level === l.id}
                        className={level === l.id ? styles.selected : ""}
                        onClick={() => {
                          setLevel(l.id);
                          resetTask();
                        }}
                      >
                        {l.label}
                      </button>
                    ))}
                  </fieldset>
                  <p className={styles.note}>
                    {englishLevels.find((item) => item.id === level)?.description}
                  </p>
                </details>
                <p className={styles.sectionLabel}>읽고 들을 자료</p>
                <div className={styles.document}>
                  <span className={styles.documentLabel}>
                    {task.document || task.speaker || "STORY NOTE"}
                  </span>
                  {task.skill === "listening" ? (
                    <>
                      <button
                        type="button"
                        className={styles.audioButton}
                        onClick={() => listen(version.passage)}
                      >
                        <Volume2 size={19} />
                        {speaking ? "듣기 멈추기" : "음성 듣기"}
                      </button>
                      <p className={styles.note}>
                        기기 음성으로 재생해요. 원하는 만큼 다시 들어 보세요.
                      </p>
                      <details>
                        <summary>대본 보기</summary>
                        <p className={styles.passage} lang="en">
                          {version.passage}
                        </p>
                      </details>
                      <p className={styles.note}>소리를 듣기 어렵다면 대본을 펼쳐도 괜찮아요.</p>
                    </>
                  ) : (
                    <>
                      <p className={styles.passage} lang="en">
                        {version.passage}
                      </p>
                      {task.skill === "reading" && (
                        <button
                          type="button"
                          className={styles.textButton}
                          onClick={() => listen(version.passage)}
                        >
                          <Volume2 size={14} /> 본문 듣기
                        </button>
                      )}
                    </>
                  )}
                  {hint && <p className={styles.translation}>{version.translation}</p>}
                </div>
                {audioError && (
                  <p className={styles.note} role="status">
                    {audioError}
                  </p>
                )}
                <section className={styles.responseSection} aria-labelledby="english-task-prompt">
                  <p className={styles.sectionLabel}>이제, 내 반응</p>
                  <h3 id="english-task-prompt" className={styles.prompt}>
                    {version.prompt}
                  </h3>
                  {version.options ? (
                    <div className={styles.options}>
                      {version.options.map((o, i) => (
                        <button
                          type="button"
                          key={o.id}
                          disabled={busy || !!feedback?.correct}
                          aria-pressed={answer === o.id}
                          className={answer === o.id ? styles.selected : ""}
                          onClick={() => {
                            setAnswer(o.id);
                            setFeedback(null);
                          }}
                        >
                          <span>{String.fromCharCode(65 + i)}</span>
                          <span lang="en">{o.text}</span>
                          {answer === o.id && <Check size={16} />}
                        </button>
                      ))}
                    </div>
                  ) : task.skill === "writing" ? (
                    <>
                      <label className={styles.inputLabel} htmlFor="english-response">
                        내 영어 답변
                      </label>
                      <textarea
                        id="english-response"
                        lang="en"
                        value={answer}
                        maxLength={1200}
                        disabled={busy || !!feedback?.correct}
                        placeholder={version.starter || "Write your message here…"}
                        onChange={(e) => {
                          setAnswer(e.target.value);
                          setFeedback(null);
                        }}
                        className={styles.textarea}
                        rows={4}
                      />
                      <p className={styles.note}>
                        꼭 필요한 내용이 들어갔는지 확인해요. 문법을 모두 채점하지는 않아요.
                      </p>
                    </>
                  ) : (
                    <div className={styles.speakArea}>
                      <button
                        type="button"
                        className={styles.secondary}
                        onClick={startRecording}
                        disabled={busy || !!feedback?.correct}
                      >
                        <Mic size={16} />
                        {recording
                          ? "녹음 마치기"
                          : recordingUrl
                            ? "다시 녹음하기"
                            : "녹음하며 말하기"}
                      </button>
                      {recording && <p role="status">녹음 중 · 최대 60초</p>}
                      {recordingUrl && (
                        <audio controls src={recordingUrl} aria-label="내 영어 녹음 다시 듣기" />
                      )}
                      {recordingError && (
                        <p className={styles.note} role="status">
                          {recordingError}
                        </p>
                      )}
                      <p className={styles.note}>
                        녹음 없이 말해도 돼요. 녹음 파일은 서버에 보내지 않아요.
                      </p>
                      <label className={styles.confirm}>
                        <input
                          type="checkbox"
                          checked={confirmed}
                          disabled={recording || busy || !!feedback?.correct}
                          onChange={(e) => setConfirmed(e.target.checked)}
                        />
                        직접 소리 내어 말해 봤어요.
                      </label>
                      <p className={styles.note}>
                        말한 뒤 직접 체크해 주세요. 발음 점수는 매기지 않아요.
                      </p>
                    </div>
                  )}
                  <div className={styles.helpRow}>
                    <button
                      type="button"
                      className={styles.textButton}
                      onClick={() => setHint(!hint)}
                    >
                      {hint ? "도움 접기" : "뜻과 예문 보기"}
                    </button>
                    <span>힌트를 써도 괜찮아요.</span>
                  </div>
                  {hint && !version.options && (
                    <div className={styles.model}>
                      <span>이렇게 말할 수도 있어요</span>
                      <p lang="en">{version.model}</p>
                      <button
                        type="button"
                        className={styles.textButton}
                        onClick={() => listen(version.model)}
                      >
                        <Volume2 size={14} /> 예문 듣기
                      </button>
                    </div>
                  )}
                </section>
                {feedback && (
                  <div
                    className={`${styles.feedback} ${feedback.correct ? styles.correct : ""}`}
                    role="status"
                  >
                    <p className={styles.sectionLabel}>
                      {feedback.correct ? "반응이 만든 변화" : "다시 해 볼 수 있어요"}
                    </p>
                    <strong>
                      {feedback.correct
                        ? task.skill === "speaking"
                          ? "말하기를 마쳤어요."
                          : task.skill === "writing"
                            ? "잘 전달했어요."
                            : "잘 이해했어요."
                        : "다시 살펴볼까요?"}
                    </strong>
                    <p>{feedback.feedback}</p>
                    {feedback.correct &&
                      task.expressionIds.map((id) => {
                        const expression = episode.expressions.find((item) => item.id === id);
                        return expression ? (
                          <p key={id} lang="en" className={styles.feedbackExpression}>
                            {expression.en}
                          </p>
                        ) : null;
                      })}
                    {feedback.correct && (
                      <div className={styles.consequence}>
                        <strong>그다음, 이야기에서는</strong>
                        <p>{feedback.consequence}</p>
                      </div>
                    )}
                  </div>
                )}
                {error && (
                  <div className={styles.error} role="alert">
                    <p>{error}</p>
                    {accountKey && (
                      <button type="button" onClick={reloadProgress} disabled={busy}>
                        다시 불러오기
                      </button>
                    )}
                    <Link href={`/login?next=${encodeURIComponent(loginReturn)}`}>
                      로그인 상태 확인
                    </Link>
                  </div>
                )}
                <div className={styles.bottom}>
                  {feedback?.correct ? (
                    <button
                      type="button"
                      className={styles.primary}
                      onClick={() => {
                        resetTask();
                        setViewedChapterId(null);
                        const nextMissing = episode.tasks.findIndex(
                          (candidate, candidateIndex) =>
                            candidateIndex > index && !completed.has(candidate.id),
                        );
                        setIndex(replaying ? index + 1 : nextMissing < 0 ? total : nextMissing);
                        focusWorkspace();
                      }}
                    >
                      {upcomingTask ? "다음 활동으로" : "결말 보기"}
                      <ArrowRight size={17} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={styles.primary}
                      onClick={submit}
                      disabled={
                        busy ||
                        !storageReady ||
                        recording ||
                        (task.skill === "speaking" ? !confirmed : !answer.trim())
                      }
                    >
                      {busy
                        ? "기록하는 중…"
                        : task.skill === "speaking"
                          ? "말하기 마치기"
                          : "확인하기"}
                      <ArrowRight size={17} />
                    </button>
                  )}
                  <span>{accountKey ? "학습 기록 저장" : "체험 중"}</span>
                </div>
                {feedback?.correct && upcomingTask && (
                  <p className={styles.nextCue}>
                    <span>다음 활동</span> {upcomingTask.title}
                  </p>
                )}
              </>
            )
          )}
        </section>
      </div>
    </div>,
    locale,
  );
}
