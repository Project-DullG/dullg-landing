"use client";
import { useCallback, useEffect, useRef } from "react";

export type SoundEffect = "paper" | "evidence" | "door" | "confirm" | "knock" | "mechanism";
const effectKinds = new Set<SoundEffect>([
  "paper",
  "evidence",
  "door",
  "confirm",
  "knock",
  "mechanism",
]);
const paperActions = new Set([
  "inspect:departure",
  "inspect:log",
  "inspect:chart",
  "inspect:safety",
  "inspect:samples",
  "inspect:old-notes",
  "inspect:relic-notes",
]);
const doorActions = new Set(["move:pier", "move:records", "move:observatory", "enter", "return"]);
const confirmActions = new Set(["clara-ready", "mara-ready", "jonah-ready"]);

// Device and signal actions have their own timing; this mapping never doubles them.
export function soundForAction(actionId: string, accepted: boolean): SoundEffect | null {
  if (!accepted) return null;
  if (actionId === "open-rescue" || actionId === "close-rescue") return "mechanism";
  if (paperActions.has(actionId)) return "paper";
  if (actionId === "inspect:rope" || actionId === "inspect:salt") return "evidence";
  if (doorActions.has(actionId)) return "door";
  if (confirmActions.has(actionId) || /^map:(0|90|180|270):(sea|arch|stairs)$/.test(actionId))
    return "confirm";
  return null;
}

type Voice = { source: AudioScheduledSourceNode; nodes: AudioNode[] };
type Runtime = {
  context: AudioContext;
  master: GainNode;
  voices: Set<Voice>;
  lastPlay: number;
};
function release(runtime: Runtime, voice: Voice, stop = false) {
  voice.source.onended = null;
  if (stop) {
    try {
      voice.source.stop();
    } catch {
      /* Already stopped or not started. */
    }
  }
  for (const node of voice.nodes) {
    try {
      node.disconnect();
    } catch {
      /* Audio failures must not interrupt play. */
    }
  }
  runtime.voices.delete(voice);
}
function stopAll(runtime: Runtime) {
  for (const voice of runtime.voices) release(runtime, voice, true);
}
function suspend(runtime: Runtime) {
  stopAll(runtime);
  try {
    void runtime.context.suspend().catch(() => {});
  } catch {
    /* Unsupported context. */
  }
}
function close(runtime: Runtime) {
  stopAll(runtime);
  try {
    runtime.master.disconnect();
  } catch {
    /* Context may already be closed. */
  }
  try {
    void runtime.context.close().catch(() => {});
  } catch {
    /* Unsupported context. */
  }
}
function createRuntime(level: number): Runtime | null {
  let context: AudioContext | undefined;
  try {
    const Audio =
      window.AudioContext ||
      (
        window as Window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;
    if (!Audio) return null;
    context = new Audio();
    const master = context.createGain();
    master.gain.value = level;
    master.connect(context.destination);
    return { context, master, voices: new Set(), lastPlay: -Infinity };
  } catch {
    try {
      void context?.close().catch(() => {});
    } catch {
      /* No usable audio context. */
    }
    return null;
  }
}
function emit(
  runtime: Runtime,
  noise: boolean,
  delay: number,
  duration: number,
  frequency: number,
  peak: number,
  endFrequency = frequency,
) {
  const { context, master } = runtime;
  const at = context.currentTime + delay;
  const nodes: AudioNode[] = [];
  let voice: Voice | undefined;
  try {
    let source: AudioBufferSourceNode | OscillatorNode;
    if (noise) {
      const buffer = context.createBuffer(
        1,
        Math.ceil(context.sampleRate * duration),
        context.sampleRate,
      );
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const rustle = context.createBufferSource();
      rustle.buffer = buffer;
      source = rustle;
    } else {
      const tone = context.createOscillator();
      tone.type = "sine";
      tone.frequency.setValueAtTime(frequency, at);
      tone.frequency.exponentialRampToValueAtTime(endFrequency, at + duration);
      source = tone;
    }
    nodes.push(source);
    const filter = context.createBiquadFilter();
    nodes.push(filter);
    filter.type = noise ? "bandpass" : "lowpass";
    filter.frequency.value = noise ? frequency : 1200;
    filter.Q.value = 0.65;
    const envelope = context.createGain();
    nodes.push(envelope);
    envelope.gain.setValueAtTime(0, at);
    envelope.gain.linearRampToValueAtTime(peak, at + Math.min(0.012, duration / 3));
    envelope.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    source.connect(filter).connect(envelope).connect(master);
    voice = { source, nodes };
    const active = voice;
    source.onended = () => release(runtime, active);
    runtime.voices.add(voice);
    source.start(at);
    source.stop(at + duration + 0.015);
  } catch {
    if (voice) release(runtime, voice, true);
    else
      for (const node of nodes) {
        try {
          node.disconnect();
        } catch {
          /* A partial graph can be discarded. */
        }
      }
  }
}
function synthesize(runtime: Runtime, kind: SoundEffect) {
  switch (kind) {
    case "mechanism":
      emit(runtime, true, 0, 0.42, 520, 0.16);
      emit(runtime, false, 0.04, 0.38, 190, 0.18, 85);
      emit(runtime, false, 0.34, 0.1, 260, 0.2, 100);
      break;
    case "paper":
      emit(runtime, true, 0, 0.22, 1500, 0.25);
      emit(runtime, true, 0.11, 0.16, 2100, 0.13);
      break;
    case "evidence":
      emit(runtime, false, 0, 0.12, 220, 0.3, 120);
      emit(runtime, true, 0, 0.045, 650, 0.12);
      break;
    case "door":
      emit(runtime, false, 0, 0.3, 145, 0.22, 95);
      emit(runtime, true, 0.025, 0.25, 380, 0.12);
      break;
    case "confirm":
      emit(runtime, false, 0, 0.075, 420, 0.16);
      emit(runtime, false, 0.075, 0.095, 530, 0.14);
      break;
    case "knock":
      for (const delay of [0, 0.15]) {
        emit(runtime, false, delay, 0.08, 170, 0.22, 105);
        emit(runtime, true, delay, 0.04, 500, 0.1);
      }
  }
}

export function useSoundEffects(
  enabled: boolean,
  volume: number,
): {
  play: (kind: SoundEffect) => void;
} {
  const level = (Number.isFinite(volume) ? Math.max(0, Math.min(100, volume)) / 100 : 0) * 0.12;
  const runtime = useRef<Runtime | null>(null);
  const alive = useRef(false);
  const ticket = useRef(0);
  const settings = useRef({ enabled, level });
  useEffect(() => {
    alive.current = true;
    const visibility = () => {
      if (!document.hidden) return;
      ticket.current++;
      if (runtime.current) suspend(runtime.current);
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      alive.current = false;
      document.removeEventListener("visibilitychange", visibility);
      if (runtime.current) close(runtime.current);
      runtime.current = null;
    };
  }, []);
  useEffect(() => {
    settings.current = { enabled, level };
    const active = runtime.current;
    if (!active) return;
    try {
      active.master.gain.setTargetAtTime(enabled ? level : 0, active.context.currentTime, 0.015);
    } catch {
      /* Closed context. */
    }
    if (!enabled || !level) {
      ticket.current++;
      suspend(active);
    }
  }, [enabled, level]);
  const play = useCallback(
    (kind: SoundEffect) => {
      if (
        !enabled ||
        !level ||
        !settings.current.enabled ||
        !settings.current.level ||
        !alive.current ||
        !effectKinds.has(kind) ||
        typeof window === "undefined" ||
        typeof document === "undefined" ||
        document.hidden
      )
        return;
      try {
        if (!runtime.current || runtime.current.context.state === "closed")
          runtime.current = createRuntime(level);
        const active = runtime.current;
        if (!active) return;
        const request = ++ticket.current;
        const start = () => {
          if (
            !alive.current ||
            !settings.current.enabled ||
            !settings.current.level ||
            ticket.current !== request ||
            runtime.current !== active ||
            document.hidden ||
            active.context.state !== "running"
          )
            return;
          // Rapid clicks neither stack sounds nor create a loud transient.
          if (active.context.currentTime - active.lastPlay < 0.08) return;
          active.lastPlay = active.context.currentTime;
          stopAll(active);
          synthesize(active, kind);
        };
        if (active.context.state === "running") start();
        else
          void active.context
            .resume()
            .then(start)
            .catch(() => {});
      } catch {
        /* Browsers may deny audio; the game still accepts the action. */
      }
    },
    [enabled, level],
  );
  return { play };
}
