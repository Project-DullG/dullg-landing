"use client";
import { useText } from "@/lib/i18n/use-text";
import { useEffect, useRef, useState } from "react";
import { createMatch, swapMatch, matchHint, GEM_SYMBOLS } from "@/lib/games/match-three";
import { TableShell } from "./table-shell";
import styles from "./extra-games.module.css";
export function MatchGame() {
  const t = useText();
  const [state, setState] = useState(() => createMatch());
  const [selected, setSelected] = useState<number | null>(null);
  const [hint, setHint] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("옆 칸과 바꿔 같은 모양 3개를 이으세요.");
  const board = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!busy) return;
    const timer = setTimeout(() => setBusy(false), 200);
    return () => clearTimeout(timer);
  }, [busy]);
  const choose = (index: number) => {
    if (busy || !state.moves) return;
    setHint([]);
    if (selected === null) {
      setSelected(index);
      return;
    }
    if (selected === index) {
      setSelected(null);
      return;
    }
    const distance =
      Math.abs((selected % 6) - (index % 6)) +
      Math.abs(Math.floor(selected / 6) - Math.floor(index / 6));
    if (distance !== 1) {
      setSelected(index);
      return;
    }
    const next = swapMatch(state, selected, index);
    setSelected(null);
    if (next === state) {
      setNotice("3개 이상 이어지는 두 칸을 선택하세요. 횟수는 줄지 않습니다.");
      return;
    }
    setState(next);
    setBusy(true);
    setNotice(
      next.shuffled
        ? "움직일 수 있는 칸이 없어 새로 섞었습니다."
        : `${next.cleared}개 제거 · ${next.combo}연쇄`,
    );
  };
  return (
    <TableShell
      title={t("세 개 한 줄")}
      tone="violet"
      stats={[
        { label: "점수", value: state.score },
        { label: "남은 이동", value: state.moves },
      ]}
      onReset={() => {
        setState(createMatch(state.seed + 1));
        setSelected(null);
        setHint([]);
        setBusy(false);
        setNotice("옆 칸과 바꿔 같은 모양 3개를 이으세요.");
      }}
      actions={
        <button
          type="button"
          disabled={!state.moves || busy}
          onClick={() => setHint(matchHint(state.cells) ?? [])}
        >
          {t("힌트")}
        </button>
      }
      message={state.moves ? notice : "30번의 이동이 끝났습니다. 새 게임에서 다시 도전하세요."}
    >
      <div
        className={styles.matchBoard}
        ref={board}
        role="group"
        aria-label={t("매치3 게임판")}
        data-busy={busy}
        onKeyDown={(e) => {
          const index = Number((e.target as HTMLElement).dataset.index);
          const delta = (
            { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -6, ArrowDown: 6 } as Record<string, number>
          )[e.key];
          if (delta && Number.isFinite(index)) {
            e.preventDefault();
            const next = index + delta;
            if (
              next >= 0 &&
              next < 36 &&
              (Math.abs(delta) === 6 || Math.floor(index / 6) === Math.floor(next / 6))
            )
              board.current?.querySelector<HTMLButtonElement>(`[data-index="${next}"]`)?.focus();
          }
        }}
      >
        {t(
          state.cells.map((gem, i) => (
            <button
              key={i}
              type="button"
              data-index={i}
              data-gem={gem}
              data-selected={selected === i}
              data-hint={hint.includes(i)}
              aria-pressed={selected === i}
              aria-label={t(`${Math.floor(i / 6) + 1}행 ${(i % 6) + 1}열, ${GEM_SYMBOLS[gem]}`)}
              disabled={!state.moves || busy}
              onClick={() => choose(i)}
            >
              {t(GEM_SYMBOLS[gem])}
            </button>
          )),
        )}
      </div>
    </TableShell>
  );
}
