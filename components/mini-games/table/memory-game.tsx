"use client";
import { useText } from "@/lib/i18n/use-text";
import { useEffect, useState } from "react";
import {
  createMemory,
  flipMemory,
  closeMemory,
  MEMORY_SYMBOLS,
  MEMORY_NAMES,
} from "@/lib/games/memory";
import { TableShell } from "./table-shell";
import styles from "./table.module.css";
export function MemoryGame() {
  const t = useText();
  const [game, setGame] = useState(() => ({ state: createMemory(), seed: 42 }));
  const s = game.state;
  useEffect(() => {
    if (s.flipped.length !== 2) return;
    const seed = game.seed;
    const timer = setTimeout(
      () => setGame((old) => (old.seed === seed ? { ...old, state: closeMemory(old.state) } : old)),
      850,
    );
    return () => clearTimeout(timer);
  }, [s.flipped, game.seed]);
  return (
    <TableShell
      title={t("카드 짝 맞추기")}
      tone="violet"
      stats={[
        { label: "찾은 짝", value: `${s.matched.length / 2} / 6` },
        { label: "시도", value: s.attempts },
      ]}
      won={s.won}
      onReset={() => setGame((old) => ({ seed: old.seed + 1, state: createMemory(old.seed + 1) }))}
      message={
        s.won
          ? `${s.attempts}번 만에 여섯 쌍을 모두 찾았습니다.`
          : s.flipped.length === 2
            ? "서로 다른 그림입니다. 위치를 기억하세요."
            : "두 장을 골라 같은 그림을 찾으세요."
      }
    >
      <div className={styles.memory} role="group" aria-label={t("짝 맞추기 카드 열두 장")}>
        {t(
          s.cards.map((value, i) => {
            const face = s.flipped.includes(i) || s.matched.includes(i),
              matched = s.matched.includes(i);
            return (
              <button
                type="button"
                key={i}
                className={`${styles.memoryCard} ${face ? styles.faceUp : ""} ${matched ? styles.matched : ""}`}
                disabled={matched || s.won || s.flipped.length === 2}
                aria-label={t(
                  `${i + 1}번 카드, ${face ? MEMORY_NAMES[value] : "뒤집힌 카드"}${matched ? ", 짝을 찾음" : ""}`,
                )}
                onClick={() => setGame((old) => ({ ...old, state: flipMemory(old.state, i) }))}
              >
                <span aria-hidden="true">{t(face ? MEMORY_SYMBOLS[value] : "◇")}</span>
              </button>
            );
          }),
        )}
      </div>
    </TableShell>
  );
}
