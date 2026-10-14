"use client";
import { useEffect, useRef, useState } from "react";
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
} from "@/lib/english/progress";
import {
  englishLevels,
  englishSkills,
  type EnglishEpisode,
  type EnglishLevel,
  type EnglishProgress,
} from "@/lib/english/types";
import styles from "./player.module.css";

const icons = { reading: BookOpen, listening: Headphones, writing: PenLine, speaking: Mic };
type Feedback = { correct: boolean; feedback: string; consequence: string };
export function EnglishPlayer({
  episode,
  initialProgress,
  accountKey,
  loadError = false,
  startingLevel,
  replay = false,
}: {
  episode: EnglishEpisode;
  initialProgress: EnglishProgress | null;
  accountKey: string | null;
  loadError?: boolean;
  startingLevel?: EnglishLevel;
  replay?: boolean;
}) {
  const locale = useLocale();
  const [progress, setProgress] = useState(initialProgress || emptyEnglishProgress());
  const [level, setLevel] = useState<EnglishLevel>(
    startingLevel ||
      initialProgress?.episodes[episode.id]?.level ||
      initialProgress?.preferredLevel ||
      "standard",
  );
  const first = episode.tasks.findIndex(
    (t) => !initialProgress?.episodes[episode.id]?.completedTasks.includes(t.id),
  );
  const [index, setIndex] = useState(replay ? 0 : first < 0 ? episode.tasks.length : first);
  const [answer, setAnswer] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [hint, setHint] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(
    loadError ? "학습 기록을 불러오지 못했습니다. 연결을 다시 확인해 주세요." : "",
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
  const recordingUrlRef = useRef("");
  const recordingGeneration = useRef(0);
  const task = episode.tasks[index],
    version = task?.versions[level];
  const growth = getEnglishGrowth(progress),
    total = episode.tasks.length,
    finished = index >= total;
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
      setAudioError("음성을 지원하지 않는 브라우저입니다. 대본을 펼쳐 연습해 주세요.");
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
          setAudioError("음성을 재생하지 못했습니다. 대본을 확인하거나 다시 눌러 주세요.");
      }
    };
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }
  async function startRecording() {
    setRecordingError("");
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setRecordingError("녹음을 지원하지 않습니다. 직접 소리 내어 연습해 주세요.");
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
      setRecordingError("마이크 권한을 확인해 주세요. 녹음 없이 직접 말하며 연습할 수도 있습니다.");
    }
  }
  async function reloadProgress() {
    setBusy(true);
    try {
      const response = await fetch("/api/english/progress", { cache: "no-store" }),
        data = await response.json();
      if (!response.ok || data.accountKey !== accountKey)
        throw new Error(
          "계정 또는 저장 연결을 확인해 주세요. 페이지를 새로 열어 다시 로그인할 수 있습니다.",
        );
      setProgress(data.progress);
      setStorageReady(true);
      setError("");
      const done = data.progress.episodes[episode.id]?.completedTasks || [],
        next = episode.tasks.findIndex((t) => !done.includes(t.id));
      resetTask();
      setIndex(next < 0 ? total : next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "기록을 불러오지 못했습니다.");
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
        if (!response.ok) throw new Error(data.error || "저장하지 못했습니다. 다시 시도해 주세요.");
        setProgress(data.progress);
        setFeedback(data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }
  const Icon = task ? icons[task.skill] : Check;
  return localizeEnglishTree(
    <div className={styles.player}>
      <div className={styles.topbar}>
        <Link href="/english">
          <ArrowLeft size={16} /> 학습 서재
        </Link>
        <span>FIRST PAGES / {episode.genreLabel}</span>
        <span>
          Lv.{growth.level} · {growth.title}
        </span>
      </div>
      {!accountKey && (
        <div className={styles.guest}>
          지금은 체험 중입니다.{" "}
          <Link href={`/login?next=${encodeURIComponent(`/english/play/${episode.id}`)}`}>
            로그인하고 진도·표현·레벨 이어가기 →
          </Link>
        </div>
      )}
      <div className={styles.layout}>
        <aside className={styles.scene}>
          <Image
            src={episode.image}
            alt={episode.imageAlt}
            width={1672}
            height={941}
            priority
            sizes="(max-width: 800px) 100vw, 58vw"
          />
          <div className={styles.shade} />
          <div className={styles.sceneTop}>
            <span>SEASON 01 · 첫 번째 페이지</span>
            <span>{episode.minutes}분의 이야기</span>
          </div>
          <div className={styles.sceneCopy}>
            <p>{episode.englishTitle}</p>
            <h1>{episode.title}</h1>
            <div>
              {finished
                ? episode.ending
                : feedback?.correct
                  ? feedback.consequence
                  : index === 0
                    ? episode.intro
                    : task.context}
            </div>
          </div>
          <div className={styles.steps} aria-label="이야기 진행">
            {episode.tasks.map((t, i) => {
              const Skill = icons[t.skill],
                done = progress.episodes[episode.id]?.completedTasks.includes(t.id);
              return (
                <span
                  key={t.id}
                  className={`${done ? styles.done : ""} ${i === index ? styles.current : ""}`}
                  aria-current={i === index ? "step" : undefined}
                  title={`${i + 1}. ${t.title}`}
                >
                  {done ? <Check size={16} /> : <Skill size={16} />}
                  <small>{i + 1}</small>
                </span>
              );
            })}
          </div>
        </aside>
        <section className={styles.workspace} aria-label="영어 학습 장면">
          {finished ? (
            <div className={styles.ending}>
              <span className={styles.stamp}>
                <Check size={25} />
              </span>
              <p className={styles.eyebrow}>이야기 한 편을 마쳤어요</p>
              <h2>
                오늘의 영어가
                <br />한 페이지 쌓였습니다.
              </h2>
              <p>{episode.takeaway}</p>
              <div className={styles.growth}>
                <strong>{accountKey ? "내 학습 기록" : "체험 기록"}</strong>
                <span>
                  {total}개 장면 · {episode.expressions.length}개 표현
                </span>
                <b>
                  Lv.{growth.level} · {progress.xp} XP
                </b>
              </div>
              <h3>다음에 다시 꺼내 쓸 표현</h3>
              {episode.expressions.map((e) => (
                <div className={styles.expression} key={e.id}>
                  <p lang="en">{e.en}</p>
                  <span>{e.ko}</span>
                </div>
              ))}
              <p className={styles.note}>
                {accountKey
                  ? "표현은 복습 수첩에 담겼습니다. 다음 복습 때 보기를 가리고 다시 떠올려 보세요."
                  : "체험 기록은 이 화면에서만 유지됩니다. 로그인하면 다음 방문과 다른 기기에서도 이어갈 수 있습니다."}
              </p>
              <div className={styles.endActions}>
                <Link href="/english" className={styles.primary}>
                  다음 이야기 고르기 <ArrowRight size={17} />
                </Link>
                {accountKey && (
                  <Link href="/english/review" className={styles.secondary}>
                    내 복습 수첩
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    resetTask();
                    setIndex(0);
                  }}
                  className={styles.textButton}
                >
                  <RotateCcw size={14} /> 같은 이야기 다시 연습
                </button>
              </div>
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
                <h2>{task.title}</h2>
                <p className={styles.context}>{task.context}</p>
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
                        {speaking ? "듣기 멈추기" : `${task.speaker || "장면"}의 이야기 듣기`}
                      </button>
                      <p className={styles.note}>
                        기기의 영어 음성으로 재생합니다. 반복해서 들을 수 있어요.
                      </p>
                      <details>
                        <summary>대본 펼치기</summary>
                        <p className={styles.passage} lang="en">
                          {version.passage}
                        </p>
                      </details>
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
                          <Volume2 size={14} /> 문장 듣기
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
                <p className={styles.prompt}>{version.prompt}</p>
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
                      상대에게 보낼 영어 메시지
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
                      필요한 정보가 담겼는지 확인합니다. 문법 전체를 자동 평가하지는 않습니다.
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
                          : "녹음하며 말해보기"}
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
                      녹음은 이 기기에서만 재생하며 업로드하지 않습니다. 마이크 없이 직접 말해도
                      됩니다.
                    </p>
                    <label className={styles.confirm}>
                      <input
                        type="checkbox"
                        checked={confirmed}
                        disabled={recording || busy || !!feedback?.correct}
                        onChange={(e) => setConfirmed(e.target.checked)}
                      />
                      필요한 정보를 소리 내어 말해보았어요.
                    </label>
                    <p className={styles.note}>
                      직접 확인하는 연습입니다. 발음 점수를 매기지 않습니다.
                    </p>
                  </div>
                )}
                <div className={styles.helpRow}>
                  <button
                    type="button"
                    className={styles.textButton}
                    onClick={() => setHint(!hint)}
                  >
                    {hint ? "도움 접기" : "뜻·예문 도움 보기"}
                  </button>
                  <span>힌트를 써도 괜찮아요.</span>
                </div>
                {hint && !version.options && (
                  <div className={styles.model}>
                    <span>표현 예시 · 다른 표현도 가능합니다</span>
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
                {feedback && (
                  <div
                    className={`${styles.feedback} ${feedback.correct ? styles.correct : ""}`}
                    role="status"
                  >
                    <strong>
                      {feedback.correct
                        ? task.skill === "speaking"
                          ? "말하기 연습을 기록했어요."
                          : "필요한 정보를 전달했어요."
                        : "단서를 한 번 더 살펴볼까요?"}
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
                    {feedback.correct && <p>{feedback.consequence}</p>}
                  </div>
                )}
                {error && (
                  <div className={styles.error} role="alert">
                    <p>{error}</p>
                    {accountKey && (
                      <button type="button" onClick={reloadProgress} disabled={busy}>
                        기록 다시 불러오기
                      </button>
                    )}
                    <Link href={`/login?next=${encodeURIComponent(`/english/play/${episode.id}`)}`}>
                      로그인 확인
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
                        setIndex(index + 1);
                      }}
                    >
                      {index + 1 === total ? "이야기의 끝으로" : "다음 장면으로"}
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
                          ? "말하기 연습 완료"
                          : "이 행동으로 이어가기"}
                      <ArrowRight size={17} />
                    </button>
                  )}
                  <span>{accountKey ? "계정에 기록 저장" : "로그인 없이 체험"}</span>
                </div>
              </>
            )
          )}
        </section>
      </div>
    </div>,
    locale,
  );
}
