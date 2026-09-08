export type TurnHistory<T> = { state: T; past: T[]; seed: number };
export function applyTurn<T>(old: TurnHistory<T>, update: (state: T) => T): TurnHistory<T> {
  const next = update(old.state);
  return next === old.state
    ? old
    : { ...old, state: next, past: [...old.past, old.state].slice(-100) };
}
export function undoTurn<T>(old: TurnHistory<T>): TurnHistory<T> {
  return old.past.length ? { ...old, state: old.past.at(-1)!, past: old.past.slice(0, -1) } : old;
}
export function resetTurn<T>(old: TurnHistory<T>, create: (seed: number) => T): TurnHistory<T> {
  return { state: create(old.seed + 1), past: [], seed: old.seed + 1 };
}
