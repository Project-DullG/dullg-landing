"use client";
import { useRef, useState } from "react";
import { createSudoku, fillSudoku, hintSudoku, sudokuConflicts } from "@/lib/games/sudoku";
import { useTurnGame } from "./use-turn-game";
import { TableShell } from "./table-shell";
import styles from "./table.module.css";
export function SudokuGame() {
  const game = useTurnGame(createSudoku),
    s = game.state,
    [selected, setSelected] = useState(() => s.givens.findIndex((value) => !value)),
    [pencil, setPencil] = useState(false),
    [checked, setChecked] = useState(false);
  const cells = useRef<(HTMLButtonElement | null)[]>([]);
  const conflicts = new Set(sudokuConflicts(s.cells));
  const wrong = checked ? s.cells.flatMap((v, i) => (v && v !== s.solution[i] ? [i] : [])) : [];
  const input = (n: number) => {
    game.act((state) => fillSudoku(state, selected, n, pencil));
    setChecked(false);
  };
  return (
    <TableShell
      title="스도쿠"
      tone="paper"
      stats={[
        { label: "채운 칸", value: `${s.cells.filter(Boolean).length} / 81` },
        { label: "사용한 힌트", value: s.hints },
      ]}
      won={s.won}
      canUndo={game.canUndo}
      onUndo={() => {
        game.undo();
        setChecked(false);
      }}
      onReset={() => {
        game.reset();
        setSelected(createSudoku(game.seed + 1).givens.findIndex((value) => !value));
        setChecked(false);
        setPencil(false);
      }}
      message={
        s.won
          ? "모든 행·열·구역을 완성했습니다."
          : checked
            ? wrong.length
              ? `다시 확인할 숫자가 ${wrong.length}개 있습니다.`
              : "입력한 숫자가 모두 맞습니다."
            : "행·열·3×3 구역마다 1~9를 한 번씩 넣으세요."
      }
      actions={
        <>
          <button type="button" onClick={() => setChecked(true)}>
            검사
          </button>
          <button
            type="button"
            disabled={s.won}
            onClick={() => {
              game.act((state) => hintSudoku(state, selected));
              setChecked(false);
            }}
          >
            힌트
          </button>
        </>
      }
    >
      <div
        className={styles.sudoku}
        role="group"
        aria-label="9행 9열 스도쿠"
        onKeyDown={(event) => {
          if (/^[1-9]$/.test(event.key)) {
            event.preventDefault();
            input(Number(event.key));
          } else if (["Backspace", "Delete", "0"].includes(event.key)) {
            event.preventDefault();
            input(0);
          } else {
            const d = (
              { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -9, ArrowDown: 9 } as Record<string, number>
            )[event.key];
            if (d) {
              event.preventDefault();
              const n = Math.max(0, Math.min(80, selected + d));
              setSelected(n);
              cells.current[n]?.focus();
            }
          }
        }}
      >
        {s.cells.map((value, i) => (
          <button
            type="button"
            key={i}
            ref={(el) => {
              cells.current[i] = el;
            }}
            tabIndex={i === selected ? 0 : -1}
            onClick={() => setSelected(i)}
            onFocus={() => setSelected(i)}
            aria-pressed={i === selected}
            aria-label={`${Math.floor(i / 9) + 1}행 ${(i % 9) + 1}열, ${value ? `${s.givens[i] ? "주어진 수" : "입력한 수"} ${value}` : "빈칸"}${conflicts.has(i) || wrong.includes(i) ? ", 확인 필요" : ""}`}
            className={`${styles.sudokuCell} ${s.givens[i] ? styles.given : ""} ${i === selected ? styles.activeCell : ""} ${conflicts.has(i) || wrong.includes(i) ? styles.wrong : ""}`}
            data-right={i % 9 === 2 || i % 9 === 5}
            data-bottom={Math.floor(i / 9) === 2 || Math.floor(i / 9) === 5}
          >
            {value || (
              <span className={styles.notes}>
                {Array.from({ length: 9 }, (_, n) => (
                  <small key={n}>{s.notes[i].includes(n + 1) ? n + 1 : ""}</small>
                ))}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className={styles.keypad}>
        {Array.from({ length: 9 }, (_, i) => (
          <button
            type="button"
            key={i}
            disabled={s.won || !!s.givens[selected]}
            onClick={() => input(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <div className={styles.actions}>
        <button type="button" aria-pressed={pencil} onClick={() => setPencil((v) => !v)}>
          {pencil ? "메모 켜짐" : "메모"}
        </button>
        <button type="button" disabled={s.won || !!s.givens[selected]} onClick={() => input(0)}>
          지우기
        </button>
      </div>
    </TableShell>
  );
}
