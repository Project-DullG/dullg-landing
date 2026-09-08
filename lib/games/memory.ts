import { shuffled } from "./random.ts";
export const MEMORY_SYMBOLS = ["♠", "♥", "◆", "●", "★", "☀"];
export const MEMORY_NAMES = ["스페이드", "하트", "마름모", "동그라미", "별", "해"];
export type Memory = {
  cards: number[];
  flipped: number[];
  matched: number[];
  attempts: number;
  won: boolean;
};
export function createMemory(seed = 42): Memory {
  return {
    cards: shuffled([...Array(6).keys(), ...Array(6).keys()], seed),
    flipped: [],
    matched: [],
    attempts: 0,
    won: false,
  };
}
export function flipMemory(s: Memory, index: number): Memory {
  if (
    s.won ||
    s.flipped.length === 2 ||
    s.flipped.includes(index) ||
    s.matched.includes(index) ||
    index < 0 ||
    index >= 12
  )
    return s;
  const next = { ...s, flipped: [...s.flipped, index] };
  if (next.flipped.length === 2) {
    next.attempts++;
    if (s.cards[next.flipped[0]] === s.cards[index]) {
      next.matched = [...s.matched, ...next.flipped];
      next.flipped = [];
      next.won = next.matched.length === 12;
    }
  }
  return next;
}
export const closeMemory = (s: Memory): Memory =>
  s.flipped.length === 2 ? { ...s, flipped: [] } : s;
