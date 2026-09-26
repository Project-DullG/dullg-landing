"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./speaking.module.css";

export function StudyTimer({
  prep,
  answer,
  onStart,
}: {
  prep: number;
  answer: number;
  onStart: () => void;
}) {
  const [phase, setPhase] = useState<"prep" | "answer" | "done">(prep ? "prep" : "answer");
  const [left, setLeft] = useState(prep || answer);
  const [running, setRunning] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const deadline = useRef(0);
  useEffect(() => {
    if (!running) return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setLeft(remaining);
      if (!remaining) {
        if (phase === "prep") {
          setPhase("answer");
          setLeft(answer);
          deadline.current = Date.now() + answer * 1000;
          setAnnouncement(`준비 시간이 끝났습니다. ${answer}초 동안 답변해 주세요.`);
        } else {
          setPhase("done");
          setRunning(false);
          setAnnouncement("시간이 끝났습니다. 말하기를 마쳤다면 아래에서 완료해 주세요.");
        }
      }
    };
    const timer = setInterval(tick, 200);
    const hide = () => {
      if (document.hidden) {
        setLeft(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)));
        setRunning(false);
        setAnnouncement("타이머를 일시정지했습니다.");
      }
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", hide);
    };
  }, [running, phase, answer]);
  function reset() {
    setRunning(false);
    setPhase(prep ? "prep" : "answer");
    setLeft(prep || answer);
    setAnnouncement("타이머를 초기화했습니다.");
  }
  return (
    <div>
      <details className={styles.timer}>
        <summary>
          시간 맞춰 말하기{" "}
          <span>
            준비 {prep}초 · 답변 {answer}초
          </span>
        </summary>
        <div className={styles.timerBody}>
          <div>
            <span>{phase === "prep" ? "준비" : phase === "answer" ? "답변" : "종료"}</span>
            <output className={styles.timerNumber} aria-live="off">
              {String(Math.floor(left / 60)).padStart(2, "0")}:{String(left % 60).padStart(2, "0")}
            </output>
          </div>
          <button
            className={styles.secondary}
            disabled={phase === "done"}
            onClick={() => {
              if (running) {
                setRunning(false);
                setAnnouncement("타이머를 일시정지했습니다.");
              } else {
                onStart();
                deadline.current = Date.now() + left * 1000;
                setRunning(true);
                setAnnouncement(
                  `${phase === "prep" ? "준비" : "답변"} 시간을 시작합니다. ${left}초 남았습니다.`,
                );
              }
            }}
          >
            {running ? "일시정지" : "시작"}
          </button>
          <button className={styles.textButton} onClick={reset}>
            초기화
          </button>
        </div>
      </details>
      <p
        role="status"
        aria-atomic="true"
        className={phase === "done" ? styles.small : styles.visuallyHidden}
      >
        {announcement}
      </p>
    </div>
  );
}
