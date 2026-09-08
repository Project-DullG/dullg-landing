export const BUMPERS = [
  { x: 105, y: 175, r: 25 },
  { x: 255, y: 175, r: 25 },
  { x: 180, y: 270, r: 29 },
];
export type Pinball = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  lives: number;
  score: number;
  ready: boolean;
  over: boolean;
  left: boolean;
  right: boolean;
  leftAngle: number;
  rightAngle: number;
  flash: number[];
  hits: boolean[];
  bonus: number;
};
export function createPinball(): Pinball {
  return {
    x: 300,
    y: 320,
    vx: 0,
    vy: 0,
    lives: 3,
    score: 0,
    ready: true,
    over: false,
    left: false,
    right: false,
    leftAngle: 0,
    rightAngle: 0,
    flash: [0, 0, 0],
    hits: [false, false, false],
    bonus: 0,
  };
}
export function launchBall(state: Pinball) {
  if (!state.ready || state.over) return;
  state.ready = false;
  state.x = 300;
  state.y = 320;
  state.vx = -300;
  state.vy = -510;
}
export function flipper(left: boolean, amount: number) {
  return left
    ? { ax: 72, ay: 440, bx: 161, by: 465 - 58 * amount }
    : { ax: 288, ay: 440, bx: 199, by: 465 - 58 * amount };
}
export function reflectSegment(
  s: Pinball,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  kick = 0,
) {
  const dx = bx - ax,
    dy = by - ay;
  const t = Math.max(0, Math.min(1, ((s.x - ax) * dx + (s.y - ay) * dy) / (dx * dx + dy * dy)));
  const px = ax + dx * t,
    py = ay + dy * t;
  const distance = Math.hypot(s.x - px, s.y - py);
  if (distance >= 15) return;
  const nx = distance > 0.001 ? (s.x - px) / distance : 0;
  const ny = distance > 0.001 ? (s.y - py) / distance : -1;
  s.x = px + nx * 15;
  s.y = py + ny * 15;
  const toward = s.vx * nx + s.vy * ny;
  if (toward < 0) {
    s.vx -= 1.85 * toward * nx;
    s.vy -= 1.85 * toward * ny;
  }
  if (kick && ny < 0) {
    s.vy = -430;
    s.vx += (180 - s.x) * 2.1;
  }
}
export function stepPinball(s: Pinball, dt: number) {
  if (s.over) return;
  s.flash = s.flash.map((value) => Math.max(0, value - dt));
  s.bonus = Math.max(0, s.bonus - dt);
  if (s.ready) return;
  // Small steps keep the ball from passing through a bumper at high speed.
  const count = Math.ceil(dt / (1 / 240));
  const h = dt / count;
  for (let k = 0; k < count; k++) {
    s.vy += 340 * h;
    s.x += s.vx * h;
    s.y += s.vy * h;
    if (s.x < 22) {
      s.x = 22;
      s.vx = Math.abs(s.vx) * 0.92;
    }
    if (s.x > 338) {
      s.x = 338;
      s.vx = -Math.abs(s.vx) * 0.92;
    }
    if (s.y < 22) {
      s.y = 22;
      s.vy = Math.abs(s.vy) * 0.92;
    }
    BUMPERS.forEach((b, i) => {
      const dx = s.x - b.x,
        dy = s.y - b.y;
      const distance = Math.hypot(dx, dy),
        radius = b.r + 9;
      if (distance >= radius) return;
      const nx = distance > 0.001 ? dx / distance : 0,
        ny = distance > 0.001 ? dy / distance : -1;
      s.x = b.x + nx * radius;
      s.y = b.y + ny * radius;
      const toward = s.vx * nx + s.vy * ny;
      if (toward < 0) {
        s.vx -= 2 * toward * nx;
        s.vy -= 2 * toward * ny;
        s.vx += nx * 80;
        s.vy += ny * 80;
        if (s.flash[i] === 0) {
          s.score += 100;
          s.hits[i] = true;
          if (s.hits.every(Boolean)) {
            s.score += 500;
            s.hits.fill(false);
            s.bonus = 1.5;
          }
        }
        s.flash[i] = 0.12;
      }
    });
    reflectSegment(s, 20, 350, 72, 420);
    reflectSegment(s, 340, 350, 288, 420);
    for (const left of [true, false]) {
      const active = left ? s.left : s.right;
      const previous = left ? s.leftAngle : s.rightAngle;
      const amount = active ? Math.min(1, previous + h * 14) : Math.max(0, previous - h * 8);
      if (left) s.leftAngle = amount;
      else s.rightAngle = amount;
      const f = flipper(left, amount);
      reflectSegment(s, f.ax, f.ay, f.bx, f.by, amount > previous ? 1 : 0);
    }
    const speed = Math.hypot(s.vx, s.vy);
    if (speed > 680) {
      s.vx *= 680 / speed;
      s.vy *= 680 / speed;
    }
    if (s.y > 545) {
      s.lives--;
      s.over = s.lives === 0;
      s.ready = true;
      s.x = 300;
      s.y = 320;
      s.vx = 0;
      s.vy = 0;
      break;
    }
  }
}
