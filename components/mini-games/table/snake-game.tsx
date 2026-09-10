"use client";
import { useText } from "@/lib/i18n/use-text";
import { useEffect, useRef, useState } from "react";
import { createSnake, stepSnake, turnSnake, type SnakeDirection } from "@/lib/games/snake";
import { TableShell } from "./table-shell";
import styles from "./extra-games.module.css";
import table from "./table.module.css";
export function SnakeGame() {
  const t = useText();
  const [state, setState] = useState(() => createSnake());
  const [running, setRunning] = useState(false);
  const board = useRef<HTMLDivElement>(null);
  const pointer = useRef<{
    x: number;
    y: number;
  } | null>(null);
  const turn = (direction: SnakeDirection) => setState((s) => turnSnake(s, direction));
  useEffect(() => {
    if (!running || state.over) return;
    const timer = setInterval(() => setState(stepSnake), 180);
    return () => clearInterval(timer);
  }, [running, state.over]);
  useEffect(() => {
    const pause = () => setRunning(false);
    window.addEventListener("blur", pause);
    document.addEventListener("visibilitychange", pause);
    return () => {
      window.removeEventListener("blur", pause);
      document.removeEventListener("visibilitychange", pause);
    };
  }, []);
  return (
    <TableShell
      title={t("스네이크")}
      tone="mint"
      stats={[
        { label: "점수", value: state.score },
        { label: "길이", value: state.body.length },
      ]}
      onReset={() => {
        setState(createSnake(state.seed + 1));
        setRunning(false);
      }}
      won={state.won}
      actions={
        <button
          type="button"
          disabled={state.over}
          onClick={() => {
            setRunning(!running);
            board.current?.focus();
          }}
        >
          {t(running && !state.over ? "일시정지" : "시작·계속")}
        </button>
      }
      message={
        state.won
          ? "게임판을 모두 채웠습니다."
          : state.over
            ? "벽이나 몸에 닿았습니다. 새 게임을 시작하세요."
            : "먹이를 먹으면 길이가 늘어납니다. 벽과 몸을 피하세요."
      }
    >
      <div
        className={styles.snakeBoard}
        role="group"
        tabIndex={0}
        ref={board}
        aria-label={t("스네이크 게임판, 방향키로 이동")}
        onKeyDown={(e) => {
          const direction = (
            {
              ArrowUp: "up",
              ArrowDown: "down",
              ArrowLeft: "left",
              ArrowRight: "right",
              w: "up",
              s: "down",
              a: "left",
              d: "right",
            } as Record<string, SnakeDirection>
          )[e.key];
          if (direction) {
            e.preventDefault();
            turn(direction);
          }
          if (e.code === "Space" && !e.repeat && !state.over) {
            e.preventDefault();
            setRunning((r) => !r);
          }
        }}
        onPointerDown={(e) => {
          board.current?.focus();
          e.currentTarget.setPointerCapture(e.pointerId);
          pointer.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerCancel={() => {
          pointer.current = null;
        }}
        onPointerUp={(e) => {
          if (!pointer.current) return;
          const dx = e.clientX - pointer.current.x,
            dy = e.clientY - pointer.current.y;
          pointer.current = null;
          if (Math.max(Math.abs(dx), Math.abs(dy)) > 15)
            turn(
              Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up",
            );
        }}
      >
        {t(
          Array.from({ length: 256 }, (_, i) => (
            <span
              key={i}
              className={styles.snakeCell}
              aria-hidden="true"
              data-body={state.body.includes(i)}
              data-head={state.body[0] === i}
              data-food={state.food === i}
            />
          )),
        )}
        {t(
          (!running || state.over) && (
            <span className={styles.snakeOverlay}>
              {t(state.over ? "게임 종료" : "시작·계속 버튼을 누르세요")}
            </span>
          ),
        )}
      </div>
      <div className={table.directionPad}>
        {t(
          (
            [
              ["left", "←", "왼쪽"],
              ["up", "↑", "위"],
              ["down", "↓", "아래"],
              ["right", "→", "오른쪽"],
            ] as [SnakeDirection, string, string][]
          ).map(([d, arrow, label]) => (
            <button
              type="button"
              key={d}
              aria-label={t(label)}
              disabled={state.over}
              onClick={() => turn(d)}
            >
              {t(arrow)}
            </button>
          )),
        )}
      </div>
    </TableShell>
  );
}
