"use client";
import { useText } from "@/lib/i18n/use-text";
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
  stats: {
    label: string;
    value: string | number;
  }[];
  children: ReactNode;
  actions?: ReactNode;
  message: string;
  won?: boolean;
  onReset: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
  tone?: string;
}) {
  const t = useText();
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
      aria-label={t(`${title} 플레이`)}
      onClickCapture={() => sound.current.play("move")}
    >
      <div className={styles.toolbar}>
        <h2>{t(title)}</h2>
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
          {t(muted ? "소리 끔" : "소리 켬")}
        </button>
      </div>
      <div className={styles.stats}>
        {t(
          stats.map((stat) => (
            <div key={stat.label}>
              <span>{t(stat.label)}</span>
              <strong>{t(stat.value)}</strong>
            </div>
          )),
        )}
      </div>
      <div className={styles.actions}>
        <button type="button" onClick={onReset}>
          {t("새 게임")}
        </button>
        {t(
          onUndo && (
            <button type="button" onClick={onUndo} disabled={!canUndo}>
              {t("↶ 되돌리기")}
            </button>
          ),
        )}
        {t(actions)}
      </div>
      <div className={styles.body}>{t(children)}</div>
      <p className={`${styles.message} ${won ? styles.success : ""}`} role="status">
        {t(message)}
      </p>
    </section>
  );
}
