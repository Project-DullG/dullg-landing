"use client";
import { useText } from "@/lib/i18n/use-text";
import { useRef } from "react";
import { createSliding, slideTile } from "@/lib/games/sliding";
import { useTurnGame } from "./use-turn-game";
import { TableShell } from "./table-shell";
import styles from "./table.module.css";
export function SlidingGame() {
  const t = useText();
  const board = useRef<HTMLDivElement>(null);
  const game = useTurnGame(createSliding),
    s = game.state;
  return (
    <TableShell
      title={t("슬라이딩 퍼즐")}
      tone="blue"
      stats={[
        { label: "이동", value: s.moves },
        {
          label: "제자리 숫자",
          value: `${s.cells.filter((v, i) => v !== 0 && v === i + 1).length} / 15`,
        },
      ]}
      onReset={game.reset}
      onUndo={game.undo}
      canUndo={game.canUndo}
      won={s.won}
      message={
        s.won
          ? `${s.moves}번 이동해 퍼즐을 완성했습니다.`
          : "빈칸 옆의 숫자를 눌러 1부터 15까지 정렬하세요."
      }
    >
      <div
        ref={board}
        tabIndex={0}
        className={`${styles.numberBoard} ${styles.sliding}`}
        role="group"
        aria-label={t("4행 4열 슬라이딩 퍼즐")}
        onKeyDown={(event) => {
          const delta = (
            { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -4, ArrowDown: 4 } as Record<string, number>
          )[event.key];
          if (delta) {
            event.preventDefault();
            board.current?.focus({ preventScroll: true });
            game.act((state) => slideTile(state, state.cells.indexOf(0) + delta));
          }
        }}
      >
        {t(
          s.cells.map((v, i) =>
            v ? (
              <button
                type="button"
                key={i}
                className={styles.numberTile}
                data-correct={v === i + 1}
                disabled={s.won}
                onClick={() => {
                  board.current?.focus({ preventScroll: true });
                  game.act((state) => slideTile(state, i));
                }}
                aria-label={t(`${v}, ${Math.floor(i / 4) + 1}행 ${(i % 4) + 1}열`)}
              >
                {t(v)}
              </button>
            ) : (
              <div key={i} className={styles.emptyTile} aria-label={t("빈칸")} />
            ),
          ),
        )}
      </div>
    </TableShell>
  );
}
