/* Procedural audio; preferences and screen mode are supplied by the game. */
(function (root) {
  "use strict";
  root.createDischargeAudio = function ({ getPrefs, getMode }) {
  return {
    ctx: null,
    master: null,
    ambient: null,
    noise: null,
    filter: null,
    osc: [],
    musicTimer: null,
    visible: true,
    kind: "inside",
    init() {
      if (this.ctx) return;
      try {
        const C = window.AudioContext || window.webkitAudioContext;
        if (!C) return;
        this.ctx = new C();
        const c = this.ctx;
        this.master = c.createGain();
        this.master.gain.value = 0;
        this.master.connect(c.destination);
        this.ambient = c.createGain();
        this.ambient.gain.value = 0.16;
        this.ambient.connect(this.master);
        const buff = c.createBuffer(1, c.sampleRate * 4, c.sampleRate),
          arr = buff.getChannelData(0);
        let last = 0;
        for (let i = 0; i < arr.length; i++) {
          last = (last + (Math.random() * 2 - 1) * 0.015) / 1.017;
          arr[i] = last * 3.5;
        }
        this.noise = c.createBufferSource();
        this.noise.buffer = buff;
        this.noise.loop = true;
        this.filter = c.createBiquadFilter();
        this.filter.type = "lowpass";
        this.filter.frequency.value = 320;
        this.noise.connect(this.filter);
        this.filter.connect(this.ambient);
        this.noise.start();
        for (const f of [55, 82.41]) {
          const o = c.createOscillator(),
            g = c.createGain();
          o.type = "sine";
          o.frequency.value = f;
          g.gain.value = 0.055;
          o.connect(g);
          g.connect(this.ambient);
          o.start();
          this.osc.push(o);
        }
        this.musicTimer = setInterval(() => {
          if (!getPrefs().sound || document.hidden || getMode() === "title") return;
          const k = [0, 2, 4, 7, 9][Math.floor(Math.random() * 5)];
          this.tone(146.83 * Math.pow(2, k / 12), 3.4, 0.045, "sine");
        }, 7600);
        this.sync();
      } catch (e) {
        this.ctx = null;
      }
    },
    sync() {
      if (!this.ctx) return;
      this.ctx.resume().catch(() => {});
      const c = this.ctx;
      this.master.gain.setTargetAtTime(
        getPrefs().sound && this.visible ? getPrefs().volume : 0,
        c.currentTime,
        0.35,
      );
    },
    scene(asset) {
      this.kind = ["outside", "road", "workshop"].includes(asset)
        ? "outside"
        : asset === "radio"
          ? "radio"
          : "inside";
      if (this.ctx)
        this.filter.frequency.setTargetAtTime(
          this.kind === "outside" ? 960 : this.kind === "radio" ? 580 : 290,
          this.ctx.currentTime,
          1,
        );
    },
    tone(f, d = 0.12, v = 0.06, w = "sine") {
      if (!this.ctx || !getPrefs().sound) return;
      const c = this.ctx,
        o = c.createOscillator(),
        g = c.createGain();
      o.type = w;
      o.frequency.value = f;
      g.gain.setValueAtTime(0, c.currentTime);
      g.gain.linearRampToValueAtTime(v, c.currentTime + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + d);
      o.connect(g);
      g.connect(this.master);
      o.start();
      o.stop(c.currentTime + d + 0.02);
    },
    noiseHit(d = 0.3, v = 0.07, f = 700) {
      if (!this.ctx || !getPrefs().sound) return;
      const c = this.ctx,
        b = c.createBuffer(1, Math.ceil(c.sampleRate * d), c.sampleRate),
        a = b.getChannelData(0);
      for (let i = 0; i < a.length; i++)
        a[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / a.length, 1.8);
      const s = c.createBufferSource(),
        g = c.createGain(),
        fil = c.createBiquadFilter();
      s.buffer = b;
      fil.type = "lowpass";
      fil.frequency.value = f;
      g.gain.value = v;
      s.connect(fil);
      fil.connect(g);
      g.connect(this.master);
      s.start();
    },
    click() {
      this.tone(550, 0.06, 0.045);
    },
    paper() {
      this.noiseHit(0.19, 0.12, 1800);
    },
    door() {
      this.noiseHit(1.2, 0.19, 430);
      this.tone(65, 0.8, 0.06);
    },
    good() {
      this.tone(440, 0.18, 0.055);
      setTimeout(() => this.tone(659.25, 0.38, 0.045), 120);
    },
    bad() {
      this.tone(170, 0.13, 0.045);
    },
  };
  };
})(globalThis);
