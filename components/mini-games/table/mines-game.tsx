"use client";
import { useText } from "@/lib/i18n/use-text";
import { useState } from "react";
import { createMines, flagMine, revealMine, mineCount } from "@/lib/games/mines";
import { useTurnGame } from "./use-turn-game";
import { TableShell } from "./table-shell";
import styles from "./table.module.css";
export function MinesGame() {
  const t = useText();
  const game = useTurnGame(createMines),
    s = game.state;
  const [flagMode, setFlagMode] = useState(false);
  return (
    <TableShell
      title={t("지뢰찾기")}
      tone="mint"
      stats={[
        { label: "남은 깃발", value: s.count - s.flags.length },
        { label: "연 칸", value: `${s.open.length} / ${s.size ** 2 - s.count}` },
      ]}
      onReset={() => {
        game.reset();
        setFlagMode(false);
      }}
      won={s.status === "won"}
      message={
        s.status === "won"
          ? "지뢰가 없는 칸을 모두 찾았습니다."
          : s.status === "lost"
            ? "지뢰를 밟았습니다. 새 게임으로 다시 도전하세요."
            : "숫자는 주변 8칸에 있는 지뢰의 개수입니다."
      }
      actions={
        <button type="button" aria-pressed={flagMode} onClick={() => setFlagMode((v) => !v)}>
          {t(flagMode ? "⚑ 깃발 놓기" : "깃발 모드")}
        </button>
      }
    >
      <div className={styles.mines} role="group" aria-label={t("6행 6열 지뢰찾기")}>
        {t(
          Array.from({ length: s.size ** 2 }, (_, i) => {
            const open = s.open.includes(i),
              flag = s.flags.includes(i),
              mine = s.status === "lost" && s.mines.includes(i),
              count = open ? mineCount(s, i) : 0;
            const label = `${Math.floor(i / s.size) + 1}행 ${(i % s.size) + 1}열, ${mine ? "지뢰" : flag ? "깃발" : open ? (count ? `주변 지뢰 ${count}개` : "빈칸") : "닫힌 칸"}`;
            return (
              <button
                type="button"
                key={i}
                className={`${styles.mineCell} ${open ? styles.open : ""} ${s.hit === i ? styles.exploded : ""}`}
                data-count={count}
                aria-label={t(label)}
                disabled={s.status !== "playing"}
                onClick={() =>
                  game.act((state) => (flagMode ? flagMine(state, i) : revealMine(state, i)))
                }
                onContextMenu={(event) => {
                  event.preventDefault();
                  game.act((state) => flagMine(state, i));
                }}
              >
                {t(mine ? "✹" : flag ? "⚑" : count || "")}
              </button>
            );
          }),
        )}
      </div>
    </TableShell>
  );
}
