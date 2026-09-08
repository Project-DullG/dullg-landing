"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { GameAudio } from "../feedback";
import styles from "./table.module.css";
export function TableShell({
  title,
  stats,
  children,
  actions,
  message,
  won = false,
  onReset,
  onUndo,
  canUndo = false,
  tone = "blue",
}: {
  title: string;
  stats: { label: string; value: string | number }[];
  children: ReactNode;
  actions?: ReactNode;
  message: string;
  won?: boolean;
  onReset: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
  tone?: string;
}) {
  const sound = useRef(new GameAudio());
  const [muted, setMuted] = useState(true);
  useEffect(() => {
    const audio = sound.current;
    return () => audio.dispose();
  }, []);
  useEffect(() => {
    if (won) sound.current.play("score");
  }, [won]);
  return (
    <section
      className={`${styles.shell} ${styles[tone] ?? ""}`}
      aria-label={`${title} 플레이`}
      onClickCapture={() => sound.current.play("move")}
    >
      <div className={styles.toolbar}>
        <h2>{title}</h2>
        <button
          type="button"
          aria-pressed={!muted}
          onClick={() => {
            const value = !muted;
            setMuted(value);
            sound.current.muted = value;
            if (!value) sound.current.unlock();
          }}
        >
          {muted ? "소리 끔" : "소리 켬"}
        </button>
      </div>
      <div className={styles.stats}>
        {stats.map((stat) => (
          <div key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </div>
      <div className={styles.actions}>
        <button type="button" onClick={onReset}>
          새 게임
        </button>
        {onUndo && (
          <button type="button" onClick={onUndo} disabled={!canUndo}>
            ↶ 되돌리기
          </button>
        )}
        {actions}
      </div>
      <div className={styles.body}>{children}</div>
      <p className={`${styles.message} ${won ? styles.success : ""}`} role="status">
        {message}
      </p>
    </section>
  );
}
