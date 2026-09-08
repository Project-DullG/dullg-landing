"use client";
import { useEffect, useRef, useState } from "react";
import type { ArcadeGameId } from "@/lib/mini-projects";
import {
  createBlocks,
  hardDrop,
  holdBlocks,
  fits,
  moveBlocks,
  rotateBlocks,
  stepBlocks,
} from "@/lib/games/blocks";
import { createPinball, launchBall, stepPinball } from "@/lib/games/pinball";
import { createDodge, moveDodge, stepDodge } from "@/lib/games/dodge";
import { drawBlocks, drawDodge, drawPinball } from "./render";
import { loadSprites, type Sprites } from "./assets";
import { GameAudio, createVisuals, burst, stepVisuals, type Visuals } from "./feedback";
import { readBest, saveBest } from "@/lib/games/records";
import styles from "./games.module.css";

type Status = "ready" | "running" | "paused" | "over";
type Action = "left" | "right" | "rotate" | "down" | "drop" | "launch" | "hold";
const labels: Record<Status, string> = {
  ready: "시작 전",
  running: "플레이 중",
  paused: "일시정지",
  over: "게임 종료",
};
function engines(seed = 42) {
  return { blocks: createBlocks(seed), pinball: createPinball(), dodge: createDodge(seed) };
}
function render(
  ctx: CanvasRenderingContext2D,
  kind: ArcadeGameId,
  s: ReturnType<typeof engines>,
  art: Sprites,
  v: Visuals,
) {
  ctx.setTransform(2, 0, 0, 2, 0, 0);
  if (kind === "block-stack") drawBlocks(ctx, s.blocks, art, v);
  else if (kind === "bumper-room") drawPinball(ctx, s.pinball, art, v);
  else drawDodge(ctx, s.dodge, art, v);
}
function events(
  s: ReturnType<typeof engines>,
  kind: ArcadeGameId,
  v: Visuals,
  audio: GameAudio,
  previous: { score: number; lines: number; lives: number },
) {
  const game = kind === "block-stack" ? s.blocks : kind === "bumper-room" ? s.pinball : s.dodge;
  if (kind === "block-stack" && s.blocks.lines > previous.lines) {
    burst(v, 140, 390, "#60c9ed", `${s.blocks.lines - previous.lines}줄 삭제`);
    audio.play("score");
  } else if (kind === "bumper-room" && game.score > previous.score) {
    burst(
      v,
      s.pinball.x,
      s.pinball.y,
      "#ffdb87",
      s.pinball.bonus > 0 ? "세 범퍼 적중 · 보너스 +500" : "+100",
    );
    audio.play("score");
  } else if (kind === "lane-shift" && game.score > previous.score) {
    burst(v, s.dodge.x, 450, "#83c9f3", "+10");
    audio.play("score");
  }
  if (kind === "bumper-room" && s.pinball.lives < previous.lives && !game.over) {
    burst(v, 180, 425, "#fff", `남은 공 ${s.pinball.lives}개 · 다시 발사하세요`);
    audio.play("over");
  }
  previous.score = game.score;
  previous.lines = s.blocks.lines;
  previous.lives = s.pinball.lives;
}

export function GamePlayer({ kind, title }: { kind: ArcadeGameId; title: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const player = useRef<HTMLElement>(null);
  const state = useRef(engines());
  const running = useRef(false);
  const seed = useRef(41);
  const held = useRef(new Map<string, Action>());
  const sprites = useRef<Sprites>({});
  const visual = useRef(createVisuals());
  const audio = useRef(new GameAudio());
  const previous = useRef({ score: 0, lines: 0, lives: 3 });
  const warmup = useRef(0);
  const [countdown, setCountdown] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [best, setBest] = useState(0);
  const [muted, setMuted] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [screenMessage, setScreenMessage] = useState("");
  const [status, setStatus] = useState<Status>("ready");
  const [hud, setHud] = useState({ score: 0, lives: 3, lines: 0, ready: true });

  function paint() {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    render(ctx, kind, state.current, sprites.current, visual.current);
  }
  function sync() {
    const game =
      kind === "block-stack"
        ? state.current.blocks
        : kind === "bumper-room"
          ? state.current.pinball
          : state.current.dodge;
    setHud({
      score: game.score,
      lives: state.current.pinball.lives,
      lines: state.current.blocks.lines,
      ready: state.current.pinball.ready,
    });
    if (game.over) {
      running.current = false;
      setBest(saveBest(kind, game.score));
      audio.current.play("over");
      setStatus("over");
    }
  }
  function pause() {
    running.current = false;
    held.current.clear();
    state.current.pinball.left = false;
    state.current.pinball.right = false;
    setStatus("paused");
  }
  function start() {
    seed.current++;
    held.current.clear();
    state.current = engines(seed.current);
    visual.current = createVisuals(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    previous.current = { score: 0, lines: 0, lives: 3 };
    warmup.current = 3;
    setCountdown(3);
    audio.current.unlock();
    audio.current.play("start");
    if (kind === "bumper-room") launchBall(state.current.pinball);
    running.current = true;
    setStatus("running");
    sync();
    paint();
    stage.current?.focus();
  }
  function action(value: Action, pressed = true, source = "click") {
    if (!running.current || warmup.current > 0) return;
    const s = state.current;
    const before = JSON.stringify(
      kind === "block-stack"
        ? [s.blocks.x, s.blocks.y, s.blocks.piece, s.blocks.held]
        : kind === "lane-shift"
          ? s.dodge.lane
          : [s.pinball.ready, s.pinball.left, s.pinball.right],
    );
    if (kind === "bumper-room") {
      if (value === "left" || value === "right") {
        if (pressed) held.current.set(source, value);
        else held.current.delete(source);
        s.pinball.left = [...held.current.values()].includes("left");
        s.pinball.right = [...held.current.values()].includes("right");
      }
      if (value === "launch" && pressed) launchBall(s.pinball);
    } else if (pressed && kind === "block-stack") {
      if (value === "left") moveBlocks(s.blocks, -1);
      if (value === "right") moveBlocks(s.blocks, 1);
      if (value === "rotate") rotateBlocks(s.blocks);
      if (value === "down" && fits(s.blocks, s.blocks.piece, s.blocks.x, s.blocks.y + 1)) {
        s.blocks.y++;
        s.blocks.score++;
      }
      if (value === "drop") hardDrop(s.blocks);
      if (value === "hold") holdBlocks(s.blocks);
    } else if (pressed) {
      if (value === "left") moveDodge(s.dodge, -1);
      if (value === "right") moveDodge(s.dodge, 1);
    }
    const after = JSON.stringify(
      kind === "block-stack"
        ? [s.blocks.x, s.blocks.y, s.blocks.piece, s.blocks.held]
        : kind === "lane-shift"
          ? s.dodge.lane
          : [s.pinball.ready, s.pinball.left, s.pinball.right],
    );
    if (pressed && before !== after) audio.current.play(value === "drop" ? "drop" : "move");
    events(s, kind, visual.current, audio.current, previous.current);
    sync();
    paint();
  }

  useEffect(() => {
    let cancelled = false;
    const sound = audio.current;
    loadSprites().then((art) => {
      if (cancelled) return;
      sprites.current = art;
      setLoaded(true);
      setBest(readBest(kind));
      const ctx = canvas.current?.getContext("2d");
      if (ctx) render(ctx, kind, state.current, art, visual.current);
    });
    const c = canvas.current,
      ctx = c?.getContext("2d");
    if (ctx) {
      render(ctx, kind, state.current, sprites.current, visual.current);
    }
    const hide = () => {
      if (running.current) {
        running.current = false;
        held.current.clear();
        state.current.pinball.left = false;
        state.current.pinball.right = false;
        setStatus("paused");
      }
    };
    const visibility = () => {
      if (document.hidden) hide();
    };
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("blur", hide);
    return () => {
      cancelled = true;
      sound.dispose();
      running.current = false;
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("blur", hide);
    };
  }, [kind]);

  useEffect(() => {
    const change = () => setExpanded(document.fullscreenElement === player.current);
    document.addEventListener("fullscreenchange", change);
    return () => document.removeEventListener("fullscreenchange", change);
  }, []);

  useEffect(() => {
    if (status !== "running") return;
    let frame = 0,
      last = 0,
      sinceHud = 0,
      accumulator = 0;
    const loop = (now: number) => {
      if (!running.current) return;
      const dt = last ? Math.min((now - last) / 1000, 0.25) : 0;
      last = now;
      sinceHud += dt;
      if (warmup.current > 0) {
        warmup.current = Math.max(0, warmup.current - dt);
        setCountdown(Math.ceil(warmup.current));
        last = now;
        frame = requestAnimationFrame(loop);
        return;
      }
      accumulator += dt;
      const s = state.current;
      while (accumulator >= 1 / 120) {
        if (kind === "block-stack") stepBlocks(s.blocks, 1 / 120);
        else if (kind === "bumper-room") stepPinball(s.pinball, 1 / 120);
        else stepDodge(s.dodge, 1 / 120);
        accumulator -= 1 / 120;
      }
      events(s, kind, visual.current, audio.current, previous.current);
      stepVisuals(visual.current, dt);
      if (kind === "bumper-room" && !s.pinball.ready && !visual.current.reduced) {
        visual.current.trail.push({ x: s.pinball.x, y: s.pinball.y });
        visual.current.trail = visual.current.trail.slice(-9);
      }
      const ctx = canvas.current?.getContext("2d");
      if (ctx) {
        render(ctx, kind, s, sprites.current, visual.current);
      }
      const game = kind === "block-stack" ? s.blocks : kind === "bumper-room" ? s.pinball : s.dodge;
      if (sinceHud > 0.1 || game.over) {
        setHud({
          score: game.score,
          lives: s.pinball.lives,
          lines: s.blocks.lines,
          ready: s.pinball.ready,
        });
        sinceHud = 0;
      }
      if (game.over) {
        running.current = false;
        audio.current.play("over");
        setBest(saveBest(kind, game.score));
        setStatus("over");
        return;
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [status, kind]);

  const keyAction = (key: string): Action | undefined => {
    if (key === "ArrowLeft" || key.toLowerCase() === "a") return "left";
    if (key === "ArrowRight" || key.toLowerCase() === "d") return "right";
    if (kind === "block-stack" && key === "ArrowUp") return "rotate";
    if (kind === "block-stack" && key === "ArrowDown") return "down";
    if (kind === "block-stack" && key.toLowerCase() === "c") return "hold";
    if (key === " ")
      return kind === "block-stack" ? "drop" : kind === "bumper-room" ? "launch" : undefined;
  };
  function control(value: Action, label: string, hold = false) {
    return (
      <button
        type="button"
        disabled={status !== "running" || countdown > 0}
        className={styles.control}
        key={value}
        onClick={hold ? undefined : () => action(value)}
        onPointerDown={
          hold
            ? (event) => {
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                action(value, true, `pointer:${event.pointerId}`);
              }
            : undefined
        }
        onPointerUp={
          hold ? (event) => action(value, false, `pointer:${event.pointerId}`) : undefined
        }
        onPointerCancel={
          hold ? (event) => action(value, false, `pointer:${event.pointerId}`) : undefined
        }
        onLostPointerCapture={
          hold ? (event) => action(value, false, `pointer:${event.pointerId}`) : undefined
        }
        onKeyDown={
          hold
            ? (event) => {
                if (event.key === " " || event.key === "Enter") {
                  event.preventDefault();
                  action(value, true, `button:${value}:${event.key}`);
                }
              }
            : undefined
        }
        onKeyUp={
          hold
            ? (event) => {
                if (event.key === " " || event.key === "Enter")
                  action(value, false, `button:${value}:${event.key}`);
              }
            : undefined
        }
        onBlur={
          hold
            ? () => {
                action(value, false, `button:${value}: `);
                action(value, false, `button:${value}:Enter`);
              }
            : undefined
        }
      >
        {label}
      </button>
    );
  }
  return (
    <section
      ref={player}
      className={`${styles.player} ${styles[kind]}`}
      aria-label={`${title} 플레이`}
    >
      <div className={styles.playerToolbar}>
        <span>
          <i />
          {labels[status]}
        </span>
        <div>
          <button
            type="button"
            aria-pressed={!muted}
            onClick={() => {
              const next = !muted;
              setMuted(next);
              audio.current.muted = next;
              if (!next) {
                audio.current.unlock();
                audio.current.play("start");
              }
            }}
          >
            {muted ? "소리 끔" : "소리 켬"}
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                if (document.fullscreenElement) await document.exitFullscreen();
                else if (player.current?.requestFullscreen)
                  await player.current.requestFullscreen();
                else setScreenMessage("이 브라우저는 전체 화면을 지원하지 않습니다.");
              } catch {
                setScreenMessage("전체 화면을 열 수 없습니다. 현재 화면에서 플레이해 주세요.");
              }
            }}
          >
            {expanded ? "전체 화면 닫기" : "전체 화면"}
          </button>
        </div>
      </div>
      <div className={styles.hud}>
        <div>
          <span>점수</span>
          <strong>{hud.score.toLocaleString()}</strong>
        </div>
        <div>
          <span>이 브라우저 최고</span>
          <strong>{Math.max(best, hud.score).toLocaleString()}</strong>
        </div>
        <div>
          <span>
            {kind === "bumper-room"
              ? "남은 공"
              : kind === "block-stack"
                ? "지운 줄"
                : "통과한 차량"}
          </span>
          <strong>
            {kind === "bumper-room"
              ? `${hud.lives}`
              : kind === "block-stack"
                ? `${hud.lines}`
                : `${Math.floor(hud.score / 10)}`}
          </strong>
        </div>
      </div>
      <div
        ref={stage}
        tabIndex={0}
        className={styles.stage}
        aria-label={`${title} 게임판. 시작 후 방향키로 조작합니다. P 또는 Escape로 일시정지합니다.`}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (running.current && (event.key === "Escape" || event.key.toLowerCase() === "p")) {
            event.preventDefault();
            pause();
            return;
          }
          const value = keyAction(event.key);
          if (value && running.current) {
            event.preventDefault();
            if (
              !event.repeat ||
              (kind === "block-stack" && ["left", "right", "down"].includes(value))
            )
              action(value, true, `key:${event.key.toLowerCase()}`);
          }
        }}
        onKeyUp={(event) => {
          const value = keyAction(event.key);
          if (value) action(value, false, `key:${event.key.toLowerCase()}`);
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            held.current.clear();
            state.current.pinball.left = false;
            state.current.pinball.right = false;
          }
        }}
      >
        <canvas ref={canvas} width={720} height={1040} aria-label={`${title} 게임 화면`}>
          이 게임은 Canvas를 지원하는 브라우저에서 실행됩니다.
        </canvas>
        {status === "running" && countdown > 0 && (
          <div className={styles.countdown} aria-live="polite">
            <strong>{countdown}</strong>
            <span>잠시 후 시작합니다</span>
          </div>
        )}
        {status !== "running" && (
          <div className={styles.overlay}>
            <small>단서공방 · 미니 게임</small>
            <span>{status === "ready" ? title : labels[status]}</span>
            <p>
              {status === "over"
                ? `${hud.score.toLocaleString()}점${hud.score > 0 && hud.score >= best ? " · 최고 기록!" : ""}`
                : status === "paused"
                  ? "이어서 플레이할 수 있습니다."
                  : kind === "block-stack"
                    ? "블록을 돌리고 가로줄을 채우세요."
                    : kind === "bumper-room"
                      ? "세 범퍼를 모두 맞혀 보너스에 도전하세요."
                      : "차선을 바꿔 앞에서 오는 차를 피하세요."}
            </p>
            {status === "ready" && (
              <div className={styles.keyGuide}>
                <kbd>←</kbd>
                <kbd>→</kbd>
                {kind === "block-stack" && <kbd>↑</kbd>}
                <span>방향키 또는 화면 버튼</span>
              </div>
            )}
            <button
              type="button"
              disabled={!loaded}
              onClick={
                status === "paused"
                  ? () => {
                      running.current = true;
                      setStatus("running");
                      stage.current?.focus();
                    }
                  : start
              }
            >
              {!loaded
                ? "게임 준비 중…"
                : status === "paused"
                  ? "계속하기"
                  : status === "over"
                    ? "한 판 더 하기"
                    : "플레이 시작"}
            </button>
          </div>
        )}
      </div>
      <div className={styles.controls} aria-label="게임 조작 버튼">
        {control("left", kind === "bumper-room" ? "왼쪽 플리퍼" : "← 이동", kind === "bumper-room")}
        {kind === "block-stack" && control("rotate", "회전 ↻")}
        {control(
          "right",
          kind === "bumper-room" ? "오른쪽 플리퍼" : "이동 →",
          kind === "bumper-room",
        )}
        {kind === "block-stack" && control("drop", "바닥으로 ↓")}
        {kind === "block-stack" && control("hold", "블록 보관 · C")}
        {kind === "bumper-room" && control("launch", "공 발사 ↑")}
      </div>
      <div className={styles.session}>
        <button type="button" disabled={status !== "running"} onClick={pause}>
          일시정지
        </button>
        <button type="button" disabled={status === "ready" || status === "running"} onClick={start}>
          처음부터
        </button>
        <span role="status">
          {status === "running" && kind === "bumper-room" && hud.ready
            ? "발사 버튼을 눌러 주세요."
            : labels[status]}
        </span>
      </div>
      <p className={styles.note}>
        최고 기록은 이 브라우저에만 저장됩니다. P 키로 일시정지할 수 있습니다.
      </p>
      {screenMessage && (
        <p role="status" className={styles.note}>
          {screenMessage}
        </p>
      )}
    </section>
  );
}
