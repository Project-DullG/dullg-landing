"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
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
import Link from "@/components/i18n/link";
import { localizeEnglishTree } from "@/lib/i18n/english-tree";
import {
  advanceEnglishProgress,
  emptyEnglishProgress,
  getEnglishEpisodeStatus,
  getEnglishGrowth,
  reconcileEnglishProgress,
} from "@/lib/english/progress";
import { practiceSentence, practiceTokenPool } from "@/lib/english/practice-ui";
import {
  englishLevels,
  englishSkills,
  type EnglishLevel,
  type EnglishProgress,
} from "@/lib/english/types";
import type { EnglishPracticePack } from "@/lib/english/practice";
import styles from "./practice-player.module.css";

const icons = { reading: BookOpen, listening: Headphones, writing: PenLine, speaking: Mic };
type Feedback = { correct: boolean; feedback: string; consequence: string };
export function PracticePlayer({
  pack,
  initialProgress,
  accountKey,
  loadError = false,
  startingLevel,
  replay = false,
}: {
  pack: EnglishPracticePack;
  initialProgress: EnglishProgress | null;
  accountKey: string | null;
  loadError?: boolean;
  startingLevel?: EnglishLevel;
  replay?: boolean;
}) {
  const locale = useLocale();
  const [progress, setProgress] = useState(() =>
    initialProgress ? reconcileEnglishProgress(initialProgress, [pack]) : emptyEnglishProgress(),
  );
  const [level, setLevel] = useState<EnglishLevel>(
    startingLevel ||
      initialProgress?.episodes[pack.id]?.level ||
      initialProgress?.preferredLevel ||
      "standard",
  );
  const [index, setIndex] = useState(
    replay
      ? 0
      : getEnglishEpisodeStatus(initialProgress || emptyEnglishProgress(), pack).firstMissingIndex,
  );
  const [replaying, setReplaying] = useState(replay);
  const [answer, setAnswer] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
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
  const mounted = useRef(true);
  const speechGeneration = useRef(0);
  const workspace = useRef<HTMLElement>(null);
  const task = pack.tasks[index];
  const version = task?.versions[level];
  const tokens = version?.tokens || [];
  const assembled = practiceSentence(tokens, selected);
  const finished = index >= pack.tasks.length;
  const growth = getEnglishGrowth(progress);
  const Icon = task ? icons[task.skill] : Check;
  const locked = busy || !!feedback?.correct;
  const invalidateSpeech = useCallback(() => {
    speechGeneration.current++;
  }, []);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      invalidateSpeech();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [invalidateSpeech]);
  function stopSpeech() {
    speechGeneration.current++;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }
  function reset() {
    stopSpeech();
    setAnswer("");
    setSelected([]);
    setConfirmed(false);
    setHint(false);
    setFeedback(null);
    setAudioError("");
  }
  function focusWorkspace() {
    window.requestAnimationFrame(() => {
      workspace.current?.scrollIntoView({ block: "start", behavior: "auto" });
      workspace.current?.focus({ preventScroll: true });
    });
  }
  function listen(text: string) {
    setAudioError("");
    if (!("speechSynthesis" in window)) {
      setAudioError("소리를 재생할 수 없어요. 대본을 보고 연습해 주세요.");
      return;
    }
    if (speaking) {
      stopSpeech();
      return;
    }
    stopSpeech();
    const generation = ++speechGeneration.current;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = level === "starter" ? 0.82 : 0.94;
    const voice =
      window.speechSynthesis.getVoices().find((candidate) => candidate.lang === "en-US") ||
      window.speechSynthesis.getVoices().find((candidate) => candidate.lang.startsWith("en"));
    if (voice) utterance.voice = voice;
    utterance.onend = () => {
      if (mounted.current && generation === speechGeneration.current) setSpeaking(false);
    };
    utterance.onerror = (event) => {
      if (mounted.current && generation === speechGeneration.current) {
        setSpeaking(false);
        if (!["canceled", "interrupted"].includes(event.error))
          setAudioError("소리가 재생되지 않았어요. 다시 눌러 보거나 대본을 확인해 주세요.");
      }
    };
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }
  async function reload() {
    setBusy(true);
    try {
      const response = await fetch("/api/english/progress", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || data.accountKey !== accountKey)
        throw new Error(
          "로그인한 계정을 확인해 주세요. 계정이 바뀌었다면 페이지를 새로 열어 주세요.",
        );
      const restored = reconcileEnglishProgress(data.progress, [pack]);
      setProgress(restored);
      setStorageReady(true);
      setError("");
      reset();
      setIndex(getEnglishEpisodeStatus(restored, pack).firstMissingIndex);
      focusWorkspace();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "기록을 불러오지 못했어요.");
    } finally {
      setBusy(false);
    }
  }
  async function submit() {
    if (!task || busy || !storageReady) return;
    setBusy(true);
    setError("");
    const attempt = {
      episodeId: pack.id,
      taskId: task.id,
      level,
      answer: tokens.length ? assembled : answer,
      selfConfirmed: confirmed,
    };
    try {
      if (!accountKey) {
        const result = advanceEnglishProgress(progress, attempt, pack);
        setProgress(result.progress);
        setFeedback(result);
      } else {
        const response = await fetch("/api/english/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "attempt", accountKey, ...attempt }),
        });
        const data = await response.json();
        if (!response.ok) {
          if (response.status === 401 || response.status === 409) setStorageReady(false);
          throw new Error(data.error || "기록을 저장하지 못했어요. 다시 시도해 주세요.");
        }
        setProgress(data.progress);
        setFeedback(data);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "기록을 저장하지 못했어요.");
    } finally {
      setBusy(false);
    }
  }
  function next() {
    const done = new Set(progress.episodes[pack.id]?.completedTasks || []);
    const nextMissing = pack.tasks.findIndex(
      (candidate, position) => position > index && !done.has(candidate.id),
    );
    reset();
    setIndex(replaying ? index + 1 : nextMissing < 0 ? pack.tasks.length : nextMissing);
    focusWorkspace();
  }
  return localizeEnglishTree(
    <div className={styles.player}>
      <div className={styles.topbar}>
        <Link href="/english#practice">
          <ArrowLeft size={16} aria-hidden="true" /> 연습 목록
        </Link>
        <span>THE PRACTICE JOURNAL</span>
        <span>
          Lv.{growth.level} · {progress.xp} XP
        </span>
      </div>
      {!accountKey && (
        <p className={styles.guest}>
          로그인 없이 연습하고 있어요. 기록은 이 화면에만 남아요.{" "}
          <Link href={`/login?next=${encodeURIComponent(`/english/practice/${pack.id}`)}`}>
            로그인하고 기록 남기기
          </Link>
        </p>
      )}
      <div className={styles.layout}>
        <aside className={styles.outline}>
          <p className={styles.eyebrow}>
            {pack.practiceFormat === "conversation"
              ? "실전 회화"
              : pack.practiceFormat === "sentence"
                ? "문장 조립"
                : "하루 한 장 리딩"}
          </p>
          <h1>{pack.title}</h1>
          <p>{pack.synopsis}</p>
          <ol aria-label="연습 진행 단계">
            {pack.tasks.map((candidate, position) => {
              const Skill = icons[candidate.skill];
              const done = progress.episodes[pack.id]?.completedTasks.includes(candidate.id);
              return (
                <li key={candidate.id} aria-current={position === index ? "step" : undefined}>
                  <span>{done ? <Check size={16} aria-hidden="true" /> : position + 1}</span>
                  <div>
                    <strong>{candidate.title}</strong>
                    <small>
                      <Skill size={12} aria-hidden="true" />
                      {englishSkills[candidate.skill].label}
                    </small>
                  </div>
                </li>
              );
            })}
          </ol>
          <p className={styles.note}>
            예상 {pack.minutes}분 · 4단계
            <br />
            짧게 연습하고, 다음에 또 써 보세요.
          </p>
        </aside>
        <section
          className={styles.workspace}
          ref={workspace}
          tabIndex={-1}
          aria-label="집중 영어 연습"
        >
          {finished ? (
            <div className={styles.finished}>
              <span className={styles.stamp}>
                <Check size={27} aria-hidden="true" />
              </span>
              <p className={styles.eyebrow}>PRACTICE COMPLETE</p>
              <h2>
                오늘 연습한 표현,
                <br />
                다음엔 직접 써 보세요.
              </h2>
              <p>{pack.takeaway}</p>
              <div className={styles.result}>
                <strong>{accountKey ? "내 연습 기록" : "이번 연습 기록"}</strong>
                <span>
                  {pack.tasks.length}단계 · {pack.expressions.length}개 표현
                </span>
                <b>
                  {progress.xp} XP · {growth.completedPractices}개 연습 완료
                </b>
              </div>
              <h3>다시 써 볼 표현</h3>
              {pack.expressions.map((expression) => (
                <div className={styles.expression} key={expression.id}>
                  <p lang="en">{expression.en}</p>
                  {locale === "ko" && <span>{expression.ko}</span>}
                  <button
                    type="button"
                    className={styles.textButton}
                    onClick={() => listen(expression.en)}
                  >
                    <Volume2 size={14} aria-hidden="true" />
                    예문 듣기
                  </button>
                </div>
              ))}
              <p className={styles.note}>
                {accountKey
                  ? "배운 표현은 복습 시간이 되면 다시 연습할 수 있어요."
                  : "이번 기록은 이 화면에만 남아요. 로그인하고 공부하면 다음에도 이어할 수 있어요."}
              </p>
              <div className={styles.endActions}>
                <Link className={styles.primary} href="/english#practice">
                  다른 연습 고르기
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                {accountKey && (
                  <Link className={styles.secondary} href="/english/review">
                    표현 복습
                  </Link>
                )}
                <button
                  type="button"
                  className={styles.textButton}
                  onClick={() => {
                    reset();
                    setReplaying(true);
                    setIndex(0);
                    focusWorkspace();
                  }}
                >
                  <RotateCcw size={14} aria-hidden="true" />한 번 더 연습하기
                </button>
              </div>
            </div>
          ) : (
            task &&
            version && (
              <>
                <div className={styles.taskMeta}>
                  <span>
                    <Icon size={16} aria-hidden="true" />
                    {englishSkills[task.skill].en} · {englishSkills[task.skill].label}
                  </span>
                  <span>
                    {index + 1} / {pack.tasks.length}
                  </span>
                </div>
                <h2>{task.title}</h2>
                <p className={styles.context}>{task.context}</p>
                <fieldset className={styles.difficulty}>
                  <legend>나에게 맞는 난이도</legend>
                  {englishLevels.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      aria-pressed={level === item.id}
                      disabled={locked}
                      onClick={() => {
                        setLevel(item.id);
                        reset();
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </fieldset>
                <div className={styles.material}>
                  <span>{task.document || task.speaker || "PRACTICE NOTE"}</span>
                  {task.skill === "listening" ? (
                    <>
                      <button
                        type="button"
                        className={styles.audioButton}
                        onClick={() => listen(version.passage)}
                      >
                        <Volume2 size={18} aria-hidden="true" />
                        {speaking ? "듣기 멈추기" : "먼저 들어 보세요"}
                      </button>
                      <p className={styles.note}>
                        기기 음성으로 재생해요. 원하는 만큼 다시 들어 보세요.
                      </p>
                      <details>
                        <summary>대본 보기</summary>
                        <p lang="en" className={styles.passage}>
                          {version.passage}
                        </p>
                      </details>
                    </>
                  ) : (
                    <>
                      <p lang="en" className={styles.passage}>
                        {version.passage}
                      </p>
                      {task.skill === "reading" && (
                        <button
                          type="button"
                          className={styles.textButton}
                          onClick={() => listen(version.passage)}
                        >
                          <Volume2 size={14} aria-hidden="true" />
                          본문 듣기
                        </button>
                      )}
                    </>
                  )}
                  {locale === "ko" && (
                    <details>
                      <summary>뜻 보기</summary>
                      <p className={styles.translation}>{version.translation}</p>
                    </details>
                  )}
                  {!!version.structure?.length &&
                    (task.skill !== "listening" || feedback?.correct) && (
                      <details key={`${task.id}-${level}`} className={styles.structure}>
                        <summary>문장 구조 살펴보기</summary>
                        <ol className={styles.structureParts} aria-label="문장 구조">
                          {version.structure.map((part, position) => (
                            <li key={`${part.role}-${position}`}>
                              <span className={`${styles.structureShape} ${styles[part.role]}`}>
                                <span lang="en">{part.text}</span>
                              </span>
                              <strong>{part.label}</strong>
                            </li>
                          ))}
                        </ol>
                      </details>
                    )}
                </div>
                {audioError && (
                  <p className={styles.note} role="status">
                    {audioError}
                  </p>
                )}
                <p className={styles.prompt}>{version.prompt}</p>
                {tokens.length > 0 ? (
                  <div className={styles.sentenceArea}>
                    <p>조각을 눌러 문장을 만드세요. 다시 누르면 빠져요.</p>
                    <div className={styles.sentence}>
                      <output aria-live="polite">
                        {assembled || "조각을 골라 문장을 만들어 보세요."}
                      </output>
                      <div>
                        {selected.map((id) => (
                          <button
                            type="button"
                            key={id}
                            disabled={locked}
                            aria-label={`${tokens[id]} · 조각 빼기`}
                            onClick={() => {
                              setSelected((previous) => previous.filter((value) => value !== id));
                              setFeedback(null);
                            }}
                          >
                            {tokens[id]}
                            <span aria-hidden="true">×</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.tokenPool} aria-label="사용할 문장 조각">
                      {practiceTokenPool(tokens).map((token) => (
                        <button
                          key={token.id}
                          type="button"
                          disabled={locked || selected.includes(token.id)}
                          aria-label={`${token.text} · 조각 넣기`}
                          onClick={() => {
                            setSelected((previous) =>
                              previous.includes(token.id) ? previous : [...previous, token.id],
                            );
                            setFeedback(null);
                          }}
                        >
                          {token.text}
                        </button>
                      ))}
                    </div>
                    <div className={styles.tokenActions}>
                      <button
                        type="button"
                        disabled={locked || !selected.length}
                        onClick={() => {
                          setSelected((previous) => previous.slice(0, -1));
                          setFeedback(null);
                        }}
                      >
                        하나 되돌리기
                      </button>
                      <button
                        type="button"
                        disabled={locked || !selected.length}
                        onClick={() => {
                          setSelected([]);
                          setFeedback(null);
                        }}
                      >
                        처음부터
                      </button>
                    </div>
                  </div>
                ) : version.options ? (
                  <div className={styles.options}>
                    {version.options.map((option, position) => (
                      <button
                        type="button"
                        key={option.id}
                        disabled={locked}
                        aria-pressed={answer === option.id}
                        onClick={() => {
                          setAnswer(option.id);
                          setFeedback(null);
                        }}
                      >
                        <span>{String.fromCharCode(65 + position)}</span>
                        <span lang="en">{option.text}</span>
                        {answer === option.id && <Check size={15} aria-hidden="true" />}
                      </button>
                    ))}
                  </div>
                ) : task.skill === "speaking" ? (
                  <div className={styles.speakArea}>
                    <p>이제 내 차례예요. 영어로 소리 내어 말해 보세요.</p>
                    <details>
                      <summary>막히면 예문 보기</summary>
                      <p lang="en" className={styles.passage}>
                        {version.model}
                      </p>
                      <button
                        type="button"
                        className={styles.textButton}
                        onClick={() => listen(version.model)}
                      >
                        <Volume2 size={14} aria-hidden="true" />
                        예문 듣기
                      </button>
                    </details>
                    <label>
                      <input
                        type="checkbox"
                        checked={confirmed}
                        disabled={locked}
                        onChange={(event) => setConfirmed(event.target.checked)}
                      />
                      직접 소리 내어 말해 봤어요.
                    </label>
                    <p className={styles.note}>
                      말한 뒤 직접 체크해 주세요. 음성은 보내지 않고, 발음은 채점하지 않아요.
                    </p>
                  </div>
                ) : (
                  <>
                    <label className={styles.inputLabel} htmlFor="practice-response">
                      내 영어 답변
                    </label>
                    <textarea
                      id="practice-response"
                      className={styles.textarea}
                      lang="en"
                      rows={4}
                      maxLength={1200}
                      value={answer}
                      disabled={locked}
                      onChange={(event) => {
                        setAnswer(event.target.value);
                        setFeedback(null);
                      }}
                      placeholder={version.starter || "Write your answer here…"}
                      data-english-user-content
                    />
                    <p className={styles.note}>
                      꼭 필요한 내용이 들어갔는지 확인해요. 문법을 모두 채점하지는 않아요.
                    </p>
                  </>
                )}
                {task.skill !== "speaking" && !version.options && (
                  <div className={styles.help}>
                    <button
                      type="button"
                      className={styles.textButton}
                      onClick={() => setHint(!hint)}
                    >
                      {hint ? "예문 접기" : "예문 보기"}
                    </button>
                    {hint && (
                      <p lang="en" className={styles.passage}>
                        {version.model}
                      </p>
                    )}
                  </div>
                )}
                {feedback && (
                  <div
                    className={`${styles.feedback} ${feedback.correct ? styles.correct : ""}`}
                    role="status"
                  >
                    <strong>
                      {feedback.correct ? "한 단계 마쳤어요." : "다시 확인해 볼까요?"}
                    </strong>
                    <p>{feedback.feedback}</p>
                    {feedback.correct && (
                      <>
                        <p lang="en" className={styles.passage}>
                          {version.model}
                        </p>
                        <p>{feedback.consequence}</p>
                      </>
                    )}
                  </div>
                )}
                <div className={styles.bottom}>
                  {feedback?.correct ? (
                    <button type="button" className={styles.primary} onClick={next}>
                      {index + 1 === pack.tasks.length ? "연습 마치기" : "계속하기"}
                      <ArrowRight size={16} aria-hidden="true" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={styles.primary}
                      onClick={() => void submit()}
                      disabled={
                        busy ||
                        !storageReady ||
                        (task.skill === "speaking"
                          ? !confirmed
                          : tokens.length
                            ? selected.length !== tokens.length
                            : !answer.trim())
                      }
                    >
                      {busy
                        ? "기록하는 중…"
                        : task.skill === "speaking"
                          ? "말하기 마치기"
                          : "확인하기"}
                      <ArrowRight size={16} aria-hidden="true" />
                    </button>
                  )}
                  <span>{accountKey ? "학습 기록 저장" : "체험 중"}</span>
                </div>
              </>
            )
          )}
          {error && (
            <div className={styles.error} role="alert">
              <p>{error}</p>
              {accountKey && (
                <button type="button" disabled={busy} onClick={() => void reload()}>
                  다시 불러오기
                </button>
              )}
              <Link href={`/login?next=${encodeURIComponent(`/english/practice/${pack.id}`)}`}>
                로그인 상태 확인
              </Link>
            </div>
          )}
          {finished && audioError && (
            <p className={styles.note} role="status">
              {audioError}
            </p>
          )}
        </section>
      </div>
    </div>,
    locale,
  );
}
