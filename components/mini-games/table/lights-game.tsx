"use client";
import { useText } from "@/lib/i18n/use-text";
import { useState } from "react";
import { createLights, toggleLights } from "@/lib/games/lights";
import { useTurnGame } from "./use-turn-game";
import { TableShell } from "./table-shell";
import styles from "./extra-games.module.css";
export function LightsGame() {
  const t = useText();
  const game = useTurnGame(createLights),
    s = game.state;
  const [hint, setHint] = useState<number | null>(null);
  return (
    <TableShell
      title={t("불 끄기")}
      tone="sand"
      stats={[
        { label: "이동", value: s.moves },
        { label: "켜진 불", value: s.cells.filter(Boolean).length },
      ]}
      onReset={() => {
        game.reset();
        setHint(null);
      }}
      onUndo={() => {
        game.undo();
        setHint(null);
      }}
      canUndo={game.canUndo}
      won={s.won}
      actions={
        <button type="button" disabled={s.won} onClick={() => setHint(s.solution[0] ?? null)}>
          {t("힌트")}
        </button>
      }
      message={s.won ? "불을 모두 껐습니다." : "한 칸을 누르면 그 칸과 상하좌우의 불이 바뀝니다."}
    >
      <div className={styles.lightsBoard} role="group" aria-label={t("불 끄기 게임판")}>
        {t(
          s.cells.map((lit, i) => (
            <button
              type="button"
              key={i}
              disabled={s.won}
              aria-pressed={lit}
              data-hint={hint === i}
              aria-label={t(
                `${Math.floor(i / 5) + 1}행 ${(i % 5) + 1}열, ${lit ? "켜짐" : "꺼짐"}`,
              )}
              onClick={() => {
                game.act((state) => toggleLights(state, i));
                setHint(null);
              }}
            >
              {t(lit ? "●" : "○")}
            </button>
          )),
        )}
      </div>
    </TableShell>
  );
}
