export type Dodge = {
  lane: number;
  x: number;
  distance: number;
  obstacles: { lane: number; y: number }[];
  elapsed: number;
  spawn: number;
  seed: number;
  score: number;
  over: boolean;
};
export function createDodge(seed = 42): Dodge {
  return {
    lane: 1,
    x: 180,
    distance: 0,
    obstacles: [],
    elapsed: 0,
    spawn: 1.2,
    seed,
    score: 0,
    over: false,
  };
}
export function moveDodge(state: Dodge, delta: number) {
  if (!state.over) state.lane = Math.max(0, Math.min(2, state.lane + delta));
}
export function stepDodge(state: Dodge, dt: number) {
  if (state.over) return;
  state.elapsed += dt;
  state.spawn -= dt;
  const speed = Math.min(290, 125 + state.elapsed * 3);
  state.distance += speed * dt;
  const target = 80 + state.lane * 100;
  state.x += Math.sign(target - state.x) * Math.min(Math.abs(target - state.x), 1000 * dt);
  if (state.spawn <= 0) {
    state.seed = (state.seed * 1664525 + 1013904223) >>> 0;
    state.obstacles.push({ lane: Math.floor((state.seed / 4294967296) * 3), y: -65 });
    state.spawn += Math.max(0.6, 1.05 - state.elapsed * 0.007);
  }
  for (const obstacle of state.obstacles) {
    obstacle.y += speed * dt;
    if (
      Math.abs(80 + obstacle.lane * 100 - state.x) < 32 &&
      obstacle.y + 55 >= 428 &&
      obstacle.y + 5 <= 482
    )
      state.over = true;
  }
  const passed = state.obstacles.filter((item) => item.y > 530);
  state.score += passed.length * 10;
  state.obstacles = state.obstacles.filter((item) => item.y <= 530);
}
