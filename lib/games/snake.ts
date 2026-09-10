import { rng } from "./random.ts";
export type SnakeDirection = "up" | "down" | "left" | "right";
export type SnakeState = {
  body: number[];
  direction: SnakeDirection;
  queue: SnakeDirection[];
  food: number;
  seed: number;
  score: number;
  over: boolean;
  won: boolean;
};
const opposite: Record<SnakeDirection, SnakeDirection> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};
function foodFor(body: number[], seed: number) {
  const empty = Array.from({ length: 256 }, (_, i) => i).filter((i) => !body.includes(i));
  return empty.length ? empty[Math.floor(rng(seed)() * empty.length)] : -1;
}
export function createSnake(seed = 42): SnakeState {
  const body = [135, 134, 133];
  return {
    body,
    direction: "right",
    queue: [],
    food: foodFor(body, seed),
    seed,
    score: 0,
    over: false,
    won: false,
  };
}
export function turnSnake(state: SnakeState, direction: SnakeDirection): SnakeState {
  const previous = state.queue.at(-1) ?? state.direction;
  if (
    state.over ||
    state.queue.length >= 2 ||
    previous === direction ||
    opposite[previous] === direction
  )
    return state;
  return { ...state, queue: [...state.queue, direction] };
}
export function stepSnake(state: SnakeState): SnakeState {
  if (state.over) return state;
  const direction = state.queue[0] ?? state.direction;
  const head = state.body[0],
    x = head % 16,
    y = Math.floor(head / 16);
  const nx = x + (direction === "left" ? -1 : direction === "right" ? 1 : 0);
  const ny = y + (direction === "up" ? -1 : direction === "down" ? 1 : 0);
  const next = ny * 16 + nx,
    eating = next === state.food;
  if (
    nx < 0 ||
    nx >= 16 ||
    ny < 0 ||
    ny >= 16 ||
    (eating ? state.body : state.body.slice(0, -1)).includes(next)
  )
    return { ...state, over: true, queue: [] };
  const body = [next, ...state.body];
  if (!eating) body.pop();
  const seed = eating ? state.seed + 1 : state.seed;
  const won = body.length === 256;
  return {
    body,
    direction,
    queue: state.queue.slice(1),
    seed,
    food: eating ? foodFor(body, seed) : state.food,
    score: state.score + (eating ? 10 : 0),
    over: won,
    won,
  };
}
