"use client";
import { useState } from "react";
import { applyTurn, undoTurn, resetTurn } from "@/lib/games/history";
export function useTurnGame<T>(create: (seed: number) => T) {
  const [history, setHistory] = useState(() => ({ state: create(42), past: [] as T[], seed: 42 }));
  return {
    state: history.state,
    seed: history.seed,
    canUndo: history.past.length > 0,
    act: (update: (state: T) => T) => setHistory((old) => applyTurn(old, update)),
    undo: () => setHistory((old) => undoTurn(old)),
    reset: () => setHistory((old) => resetTurn(old, create)),
  };
}
