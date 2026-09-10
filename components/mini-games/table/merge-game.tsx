"use client";
import { useText } from "@/lib/i18n/use-text";
import { useRef } from "react";
import { createMerge, moveMerge, type Direction } from "@/lib/games/merge";
import { useTurnGame } from "./use-turn-game";
import { TableShell } from "./table-shell";
import styles from "./table.module.css";
export function MergeGame() {
  const t = useText();
  const game = useTurnGame(createMerge),
    s = game.state,
    pointer = useRef<{
      x: number;
      y: number;
    } | null>(null);
  const move = (dir: Direction) => game.act((state) => moveMerge(state, dir));
  return (
    <TableShell
      title="2048"
      tone="sand"
      stats={[
        { label: "점수", value: s.score },
        { label: "가장 큰 수", value: Math.max(...s.cells) },
      ]}
      onReset={game.reset}
      onUndo={game.undo}
      canUndo={game.canUndo}
      won={s.won}
      message={
        s.over
          ? "더 합칠 수 없습니다. 되돌리거나 새 게임을 시작하세요."
          : s.won
            ? "2048을 만들었습니다. 더 큰 수에도 도전해 보세요."
            : "같은 숫자를 합쳐 2048을 만드세요."
      }
    >
      <div
        className={`${styles.numberBoard} ${styles.merge}`}
        role="group"
        tabIndex={0}
        aria-label={t("숫자 합치기 게임판, 방향키 또는 밀어서 이동")}
        onKeyDown={(event) => {
          const dir = (
            { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" } as Record<
              string,
              Direction
            >
          )[event.key];
          if (dir) {
            event.preventDefault();
            move(dir);
          }
        }}
        onPointerDown={(event) => {
          event.currentTarget.focus();
          event.currentTarget.setPointerCapture(event.pointerId);
          pointer.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerCancel={() => (pointer.current = null)}
        onPointerUp={(event) => {
          if (!pointer.current) return;
          const dx = event.clientX - pointer.current.x,
            dy = event.clientY - pointer.current.y;
          pointer.current = null;
          if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
          move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
        }}
      >
        {t(
          s.cells.map((v, i) => (
            <div
              key={i}
              className={styles.numberTile}
              data-value={v > 2048 ? 2048 : v}
              aria-label={t(v ? String(v) : "빈칸")}
            >
              {t(v || "")}
            </div>
          )),
        )}
      </div>
      <div className={styles.directionPad}>
        {t(
          (
            [
              ["left", "←"],
              ["up", "↑"],
              ["down", "↓"],
              ["right", "→"],
            ] as [Direction, string][]
          ).map(([dir, label]) => (
            <button
              type="button"
              key={dir}
              aria-label={t(
                {
                  left: "왼쪽으로 이동",
                  right: "오른쪽으로 이동",
                  up: "위로 이동",
                  down: "아래로 이동",
                }[dir],
              )}
              onClick={() => move(dir)}
              disabled={s.over}
            >
              {t(label)}
            </button>
          )),
        )}
      </div>
    </TableShell>
  );
}
