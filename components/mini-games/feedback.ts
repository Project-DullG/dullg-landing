export type Sound = "move" | "start" | "drop" | "score" | "over";
const sounds: Record<Sound, string> = {
  move: "click_001",
  start: "confirmation_001",
  drop: "drop_001",
  score: "bong_001",
  over: "error_001",
};
// Audio is unlocked by a player action, never on page load.
export class GameAudio {
  private context: AudioContext | null = null;
  private buffers = new Map<Sound, AudioBuffer>();
  muted = true;
  unlock() {
    if (this.muted) return;
    try {
      if (!this.context) {
        this.context = new AudioContext();
        const context = this.context;
        for (const [name, file] of Object.entries(sounds)) {
          fetch(`/assets/games/audio/${file}.m4a`)
            .then((r) => r.arrayBuffer())
            .then((data) => context.decodeAudioData(data))
            .then((buffer) => this.buffers.set(name as Sound, buffer))
            .catch(() => {});
        }
      }
      void this.context.resume().catch(() => {});
    } catch {
      /* Silent play remains available when audio is unsupported. */
    }
  }
  play(name: Sound) {
    const buffer = this.buffers.get(name);
    if (this.muted || !this.context || !buffer) return;
    const source = this.context.createBufferSource(),
      gain = this.context.createGain();
    gain.gain.value = name === "move" ? 0.12 : 0.28;
    source.buffer = buffer;
    source.connect(gain).connect(this.context.destination);
    source.start();
  }
  dispose() {
    void this.context?.close().catch(() => {});
    this.context = null;
    this.buffers.clear();
  }
}
export type Visuals = {
  time: number;
  message: string;
  messageTime: number;
  particles: { x: number; y: number; vx: number; vy: number; life: number; color: string }[];
  trail: { x: number; y: number }[];
  reduced: boolean;
};
export function createVisuals(reduced = false): Visuals {
  return { time: 0, message: "", messageTime: 0, particles: [], trail: [], reduced };
}
export function burst(v: Visuals, x: number, y: number, color: string, message = "") {
  if (message) {
    v.message = message;
    v.messageTime = 1.3;
  }
  if (v.reduced) return;
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    v.particles.push({
      x,
      y,
      vx: Math.cos(angle) * 85,
      vy: Math.sin(angle) * 85,
      life: 0.55,
      color,
    });
  }
  v.particles = v.particles.slice(-72);
}
export function stepVisuals(v: Visuals, dt: number) {
  v.time += dt;
  v.messageTime = Math.max(0, v.messageTime - dt);
  for (const p of v.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 90 * dt;
    p.life -= dt;
  }
  v.particles = v.particles.filter((p) => p.life > 0);
}
