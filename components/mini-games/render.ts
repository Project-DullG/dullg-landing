import { COLS, ROWS, SHAPES, fits, type Blocks } from "@/lib/games/blocks";
import { BUMPERS, flipper, type Pinball } from "@/lib/games/pinball";
import type { Dodge } from "@/lib/games/dodge";
import type { Sprites } from "./assets";
import type { Visuals } from "./feedback";
const PALETTE = ["", "#24b4df", "#ffd044", "#ed86bd", "#9cc932", "#ea5358", "#a3b3cd", "#ef952d"];
function text(
  ctx: CanvasRenderingContext2D,
  label: string,
  x: number,
  y: number,
  size = 12,
  color = "#a6b9d1",
  align: CanvasTextAlign = "left",
) {
  ctx.fillStyle = color;
  ctx.font = `600 ${size}px system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.fillText(label, x, y);
  ctx.textAlign = "left";
}
function line(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  color: string,
  width: number,
) {
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.stroke();
}
function image(
  ctx: CanvasRenderingContext2D,
  art: Sprites,
  key: string,
  x: number,
  y: number,
  w: number,
  h: number,
  fallback = "#e4af52",
) {
  if (art[key]) ctx.drawImage(art[key], x, y, w, h);
  else {
    ctx.fillStyle = fallback;
    ctx.fillRect(x, y, w, h);
  }
}
function circle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}
function base(ctx: CanvasRenderingContext2D, color: string) {
  ctx.clearRect(0, 0, 360, 520);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 360, 520);
}
function effects(ctx: CanvasRenderingContext2D, v: Visuals) {
  for (const p of v.particles) {
    ctx.globalAlpha = Math.max(0, p.life / 0.55);
    circle(ctx, p.x, p.y, 2.5, p.color);
  }
  ctx.globalAlpha = 1;
  if (v.messageTime > 0) {
    ctx.fillStyle = "#10182bea";
    ctx.beginPath();
    ctx.roundRect(55, 82, 250, 38, 19);
    ctx.fill();
    text(ctx, v.message, 180, 106, 15, "#fff", "center");
  }
}
export function drawBlocks(
  ctx: CanvasRenderingContext2D,
  s: Blocks,
  art: Sprites = {},
  v?: Visuals,
) {
  base(ctx, "#101a30");
  const size = 26,
    ox = 14,
    oy = 52;
  text(ctx, "블록 정리", 14, 29, 15, "#eef6ff");
  text(ctx, `레벨 ${1 + Math.floor(s.lines / 5)}`, 342, 29, 12, "#92b6ee", "right");
  ctx.fillStyle = "#081121";
  ctx.beginPath();
  ctx.roundRect(10, 48, 268, 424, 6);
  ctx.fill();
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++) {
      const cell = s.board[y][x],
        px = ox + x * size,
        py = oy + y * size;
      if (cell) image(ctx, art, `tile${cell}`, px, py, 25, 25, PALETTE[cell]);
      else {
        ctx.strokeStyle = "#1d2a41";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(px, py, 25, 25);
      }
    }
  let ghost = s.y;
  while (fits(s, s.piece, s.x, ghost + 1)) ghost++;
  s.piece.forEach((row, dy) =>
    row.forEach((cell, dx) => {
      if (!cell) return;
      ctx.globalAlpha = 0.22;
      image(
        ctx,
        art,
        `tile${cell}`,
        ox + (s.x + dx) * size,
        oy + (ghost + dy) * size,
        25,
        25,
        PALETTE[cell],
      );
      ctx.globalAlpha = 1;
      image(
        ctx,
        art,
        `tile${cell}`,
        ox + (s.x + dx) * size,
        oy + (s.y + dy) * size,
        25,
        25,
        PALETTE[cell],
      );
    }),
  );
  const miniature = (index: number | null, y: number) => {
    ctx.fillStyle = "#19253d";
    ctx.beginPath();
    ctx.roundRect(286, y, 65, 68, 5);
    ctx.fill();
    if (index === null) {
      text(ctx, "—", 318, y + 39, 16, "#536882", "center");
      return;
    }
    const shape = SHAPES[index];
    shape.forEach((row, dy) =>
      row.forEach((cell, dx) => {
        if (cell)
          image(
            ctx,
            art,
            `tile${cell}`,
            318 - shape[0].length * 7 + dx * 14,
            y + 25 + dy * 14,
            13,
            13,
            PALETTE[cell],
          );
      }),
    );
  };
  text(ctx, "다음", 288, 63, 11);
  miniature(s.next, 75);
  text(ctx, "보관 · C", 288, 178, 11, s.canHold ? "#a6b9d1" : "#63718a");
  miniature(s.held, 190);
  text(ctx, "지운 줄", 288, 299, 11);
  text(ctx, String(s.lines).padStart(2, "0"), 288, 330, 27, "#fff");
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i < s.lines % 5 ? "#49b4e6" : "#2b3850";
    ctx.fillRect(288 + i * 12, 348, 9, 5);
  }
  text(ctx, `${5 - (s.lines % 5)}줄 뒤 속도 증가`, 180, 498, 12, "#a6b9d1", "center");
  if (v) effects(ctx, v);
}
export function drawPinball(
  ctx: CanvasRenderingContext2D,
  s: Pinball,
  art: Sprites = {},
  v?: Visuals,
) {
  base(ctx, "#113632");
  ctx.fillStyle = "#194942";
  ctx.beginPath();
  ctx.roundRect(12, 12, 336, 496, 28);
  ctx.fill();
  line(ctx, 22, 350, 22, 35, "#f0cf85", 6);
  line(ctx, 338, 350, 338, 35, "#f0cf85", 6);
  line(ctx, 35, 22, 325, 22, "#f0cf85", 6);
  text(ctx, "범퍼 룸", 180, 65, 24, "#fae7af", "center");
  text(ctx, "세 범퍼를 모두 맞히면 +500", 180, 88, 11, "#a8c9b9", "center");
  for (let i = 0; i < 3; i++) circle(ctx, 162 + i * 18, 110, 4, s.hits[i] ? "#ffe58e" : "#38695b");
  ctx.strokeStyle = "#32665a";
  ctx.lineWidth = 1;
  for (const r of [80, 125, 165]) {
    ctx.beginPath();
    ctx.arc(180, 228, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  BUMPERS.forEach((b, i) => {
    circle(ctx, b.x + 2, b.y + 5, b.r + 8, "#102f2c");
    circle(ctx, b.x, b.y, b.r + 7, s.flash[i] > 0 ? "#fff1b3" : "#47786a");
    image(ctx, art, "bumper", b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
    text(ctx, "100", b.x, b.y + 4, 12, "#664c15", "center");
    if (s.flash[i] > 0) {
      ctx.strokeStyle = "#ffe48b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r + 12 + (0.12 - s.flash[i]) * 100, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
  line(ctx, 20, 350, 72, 420, "#df846c", 13);
  line(ctx, 340, 350, 288, 420, "#df846c", 13);
  line(ctx, 20, 350, 72, 420, "#f2baa0", 3);
  line(ctx, 340, 350, 288, 420, "#f2baa0", 3);
  for (const left of [true, false]) {
    const f = flipper(left, left ? s.leftAngle : s.rightAngle);
    ctx.save();
    ctx.translate(f.ax, f.ay);
    ctx.rotate(Math.atan2(f.by - f.ay, f.bx - f.ax));
    image(ctx, art, "paddle", -7, -7, Math.hypot(f.bx - f.ax, f.by - f.ay) + 14, 14);
    ctx.restore();
    circle(ctx, f.ax, f.ay, 4, "#fff1cc");
  }
  if (v && !v.reduced)
    v.trail.forEach((p, i) => {
      ctx.globalAlpha = (i / v.trail.length) * 0.25;
      circle(ctx, p.x, p.y, 5, "#fffbd8");
    });
  ctx.globalAlpha = 1;
  circle(ctx, s.x + 2, s.y + 3, 10, "#0b2828");
  image(ctx, art, "ball", s.x - 9, s.y - 9, 18, 18, "#f9f4df");
  circle(ctx, s.x - 3, s.y - 3, 2, "#fff");
  text(
    ctx,
    s.ready ? "공 발사 버튼을 눌러 주세요" : "← 왼쪽 플리퍼      오른쪽 플리퍼 →",
    180,
    493,
    11,
    "#c5daca",
    "center",
  );
  if (v) effects(ctx, v);
}
export function drawDodge(ctx: CanvasRenderingContext2D, s: Dodge, art: Sprites = {}, v?: Visuals) {
  base(ctx, "#536e4b");
  const offset = s.distance % 80;
  for (let i = -1; i < 8; i++) {
    const y = i * 80 + offset;
    image(ctx, art, "tree", -22, y, 40, 40, "#39543a");
    image(ctx, art, "tree", 342, y + 35, 40, 40, "#39543a");
    ctx.fillStyle = i % 2 ? "#eee4ca" : "#d17158";
    ctx.fillRect(22, y, 8, 80);
    ctx.fillRect(330, y, 8, 80);
  }
  ctx.fillStyle = "#343c46";
  ctx.fillRect(30, 0, 300, 520);
  ctx.fillStyle = "#ffffff03";
  ctx.fillRect(132, 0, 96, 520);
  for (const x of [130, 230])
    for (let y = -80 + offset; y < 520; y += 80) {
      ctx.fillStyle = "#b4b9b7";
      ctx.fillRect(x - 1, y, 2, 34);
    }
  for (const item of s.obstacles) {
    const x = 80 + item.lane * 100;
    ctx.save();
    ctx.translate(x, item.y + 30);
    ctx.rotate(Math.PI);
    image(ctx, art, "traffic", -20, -30, 40, 60, "#df775a");
    ctx.restore();
  }
  const tilt = Math.max(-0.12, Math.min(0.12, (80 + s.lane * 100 - s.x) / 450));
  ctx.save();
  ctx.translate(s.x, 454);
  ctx.rotate(tilt);
  ctx.fillStyle = "#09182840";
  ctx.beginPath();
  ctx.ellipse(3, 3, 22, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  image(ctx, art, "player", -18, -29, 36, 58, "#49b4e6");
  ctx.restore();
  ctx.fillStyle = "#172130df";
  ctx.fillRect(30, 0, 300, 37);
  text(ctx, "세 칸 피하기", 44, 24, 13, "#eff5ff");
  text(ctx, `${Math.floor(s.elapsed)}초`, 314, 24, 13, "#d6e5f0", "right");
  if (v) effects(ctx, v);
}
