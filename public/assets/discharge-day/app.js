/* 퇴원일 / Visual Edition. Native DOM, Web Audio, local-only storage. */
(() => {
  "use strict";
  const D = window.GAME_DATA,
    L = window.DischargeLogic,
    A = window.GAME_ASSETS;
  const $ = (id) => document.getElementById(id),
    el = (tag, cls, text) => {
      const x = document.createElement(tag);
      if (cls) x.className = cls;
      if (text !== undefined) x.textContent = text;
      return x;
    };
  const clone = L.clone,
    FLAG = (f) => state.flags.includes(f);
  const ICONS = {
    book: '<path d="M3 4h7l2 2 2-2h7v16h-7l-2 1-2-1H3zM12 6v15M6 8h3M6 12h3M15 8h3M15 12h3"/>',
    map: '<path d="M3 5l6-2 6 2 6-2v16l-6 2-6-2-6 2zM9 3v16M15 5v16"/>',
    sound: '<path d="M3 9h4l5-4v14l-5-4H3zM16 8q5 4 0 8M19 5q8 7 0 14"/>',
    mute: '<path d="M3 9h4l5-4v14l-5-4H3zM16 9l5 6M21 9l-5 6"/>',
    settings:
      '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="#10232a"/><circle cx="16" cy="12" r="2" fill="#10232a"/><circle cx="7" cy="18" r="2" fill="#10232a"/>',
    expand: '<path d="M9 3H3v6M15 3h6v6M3 15v6h6M21 15v6h-6"/>',
    key: '<circle cx="8" cy="8" r="5"/><path d="M11.5 11.5L21 21M15 15l3-3M18 18l3-3"/>',
    lamp: '<path d="M8 4h8l-1 6v11H9V10zM6 1h12M9 12h6M11 14h2M9 7h6"/>',
    gear: '<path d="M8 3h8l3 4 2 7-4 2-2-4v9H9v-9l-2 4-4-2 2-7zM9 5h6v4H9zM12 10v9"/>',
    paper: '<path d="M6 2h9l4 4v16H6zM15 2v5h4M9 11h7M9 15h7M9 18h4"/>',
    water: '<path d="M12 2S5 11 5 15a7 7 0 0 0 14 0c0-4-7-13-7-13zM8 15q0 4 4 4"/>',
    radio:
      '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M7 7l9-5M7 11h7M7 14h7M7 17h7"/><circle cx="18" cy="12" r="1"/><circle cx="18" cy="17" r="1"/>',
    person: '<circle cx="12" cy="7" r="4"/><path d="M4 22v-4a8 8 0 0 1 16 0v4"/>',
    close: '<path d="M5 5l14 14M19 5L5 19"/>',
  };
  function icon(n) {
    const e = el("span", "icon");
    e.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[n] || ICONS.paper) + "</svg>";
    return e;
  }
  document.querySelectorAll("[data-icon]").forEach((n) => n.replaceChildren(icon(n.dataset.icon)));
  const PREFKEY = "discharge-visual-prefs-2",
    SAVEKEY = "discharge-visual-save-2",
    ENDKEY = "discharge-visual-endings-2";
  let storageOK = true,
    state = L.start(D),
    history = [],
    notes = "",
    transcript = [],
    unlocked = [],
    saved = null;
  let prefs = {
    sound: true,
    volume: 0.32,
    speed: 40,
    motion: !matchMedia("(prefers-reduced-motion: reduce)").matches,
    size: innerWidth < 761 ? 17 : 20,
    brightness: 1.14,
  };
  function readLocal(k) {
    try {
      return localStorage.getItem(k);
    } catch (e) {
      storageOK = false;
      return null;
    }
  }
  try {
    const v = JSON.parse(readLocal(PREFKEY) || "null");
    if (v) {
      for (const k of Object.keys(prefs)) if (typeof v[k] === typeof prefs[k]) prefs[k] = v[k];
    }
    unlocked = JSON.parse(readLocal(ENDKEY) || "[]").filter((x) => D.meta.ending_names[x]);
    saved = JSON.parse(readLocal(SAVEKEY) || "null");
    if (saved) L.validateSave(D, saved);
  } catch (e) {
    saved = null;
  }
  prefs.size = Math.min(25, Math.max(15, prefs.size));
  prefs.volume = Math.min(0.7, Math.max(0, prefs.volume));
  prefs.brightness = Math.min(1.5, Math.max(0.8, prefs.brightness));
  prefs.speed = [0, 25, 40, 65].includes(prefs.speed) ? prefs.speed : 40;
  let page = 0,
    pages = [],
    mode = "title",
    reading = true,
    typed = false,
    typeTimer = 0,
    toastTimer = 0,
    transitionTimer = 0,
    visualAsset = "",
    busy = false,
    showingTargets = false,
    started = false,
    lampOn = false,
    artTimer = 0,
    pendingRender = 0;
  const Audio = {
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
          if (!prefs.sound || document.hidden || mode === "title") return;
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
        prefs.sound && this.visible ? prefs.volume : 0,
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
      if (!this.ctx || !prefs.sound) return;
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
      if (!this.ctx || !prefs.sound) return;
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
  const SCENE = {
    START: ["memory", "story"],
    ROOM: ["ward", "explore"],
    BELONG: ["detail_key", "detail"],
    CALL: ["ward", "detail"],
    BEDSIDE: ["detail_terminal", "detail"],
    DOOR: ["ward", "puzzle"],
    FIRST_HALL: ["corridor", "story"],
    HALL: ["corridor", "explore"],
    POWER: ["detail_panel", "puzzle"],
    POWER_OK: ["corridor", "story"],
    PLANT: ["plant", "explore"],
    MAINT: ["plant", "detail"],
    FILTER: ["plant", "detail"],
    FILTER_OK: ["recovery", "story"],
    RECEPTION: ["reception", "explore"],
    MEDICAL: ["detail_terminal", "detail"],
    TRANSFER: ["detail_terminal", "detail"],
    INDEX: ["reception", "puzzle"],
    LETTER: ["detail_letter", "detail"],
    PERSONAL_NOTE: ["detail_letter", "detail"],
    OLDMAP: ["detail_map", "detail"],
    PATIENT: ["patient", "explore"],
    PATIENT_CHART: ["patient", "detail"],
    RECOVERY: ["detail_medical", "puzzle"],
    RECOVERY_START: ["recovery", "dialogue"],
    WAKE: ["recovery", "dialogue"],
    YOON: ["recovery", "dialogue"],
    GEAR: ["gear", "detail"],
    AIRLOCK: ["airlock", "puzzle"],
    OUTSIDE: ["outside", "explore"],
    SURVEY: ["outside", "detail"],
    ANTENNA: ["radio", "detail"],
    RETURN: ["ward", "dialogue"],
    RADIO: ["radio", "puzzle"],
    FIRST_CONTACT: ["radio", "dialogue"],
    CONTACT: ["radio", "dialogue"],
    WORLD_TALK: ["radio", "dialogue"],
    FAMILY_CALL: ["radio", "dialogue"],
    AFTER: ["recovery", "explore"],
    TELL: ["recovery", "dialogue"],
    TELL_FULL: ["reception", "dialogue"],
    TELL_HIDE: ["recovery", "dialogue"],
    CONFRONT: ["reception", "dialogue"],
    REPAIR_TRUST: ["reception", "dialogue"],
    JOINT_PLAN: ["recovery", "dialogue"],
    ROUTE: ["outside", "puzzle"],
    ROUTE_OK: ["outside", "dialogue"],
    HANDOFF_PLAN: ["radio", "dialogue"],
    HANDOFF_AGREED: ["radio", "dialogue"],
    HANDOFF_ARRIVE: ["airlock", "dialogue"],
    ARCHIVE_PATH: ["road", "dialogue"],
    ARCHIVE_BOX: ["archive", "detail"],
    ARCHIVE_LETTER: ["detail_letter", "detail"],
    ARCHIVE_LEAVE: ["archive", "detail"],
    DECISION: ["reception", "dialogue"],
    EARLY_EXIT: ["airlock", "dialogue"],
    E_DEPART: ["road", "ending"],
    E_TOGETHER: ["road", "ending"],
    E_ADDRESS: ["workshop", "ending"],
    E_SHIFT: ["recovery", "ending"],
    E_UNANSWERED: ["road", "ending"],
  };
  const SPOTS = {
    ROOM: {
      belong: [21.5, 57, "보관함"],
      call: [23, 38.5, "호출기"],
      screen: [38.5, 40, "침대 화면"],
      door: [65.3, 42, "출입문"],
      hall: [66, 66, "복도로"],
    },
    HALL: {
      power: [37, 43, "전력 배분함"],
      records: [50, 43, "접수실"],
      plant: [12, 46, "설비실"],
      patient: [65, 46, "C05"],
      exit: [84, 43, "비상출구"],
      radio: [81, 67, "통신실"],
      post: [54, 67, "남은 준비"],
      room: [32, 57, "C04로"],
    },
    PLANT: {
      history: [56, 42, "정비 내역"],
      filter: [74, 65, "예비 정화함"],
      back: [66, 38, "복도로"],
    },
    RECEPTION: {
      medical: [46, 51, "진료 기록"],
      transfer: [29, 69, "이송 기록"],
      index: [35, 39, "인계함"],
      map: [17, 39, "지도와 공지"],
      back: [65, 39, "복도로"],
    },
    PATIENT: {
      chart: [79, 40, "상태 화면"],
      prep: [66, 64, "회복 준비"],
      ongoing: [66, 64, "회복 확인"],
      talk: [45, 51, "윤재에게"],
      back: [22, 45, "복도로"],
    },
    OUTSIDE: {
      survey: [54, 53, "계단과 풍경"],
      antenna: [85, 42, "안테나 함"],
      return: [12, 48, "병원 안으로"],
    },
    AFTER: {
      people: [35, 48, "C05"],
      finish_recovery: [43, 69, "회복을 기다린다"],
      family: [72, 66, "가족 기록"],
      comms: [62, 42, "통신실"],
      route: [79, 55, "통행 경로"],
      filter: [45, 25, "정화 설비"],
      visit: [67, 48, "서안 기록분소"],
      delivery: [88, 57, "방문자 맞이"],
      decide: [85, 75, "출발 정하기"],
    },
  };
  const SINGLE_NOTE = {
    ROOM: "보관함, 호출기, 침대 화면과 문을 살펴볼 수 있다.",
    HALL: "갈림길의 표지를 따라 필요한 곳을 조사한다.",
    PLANT: "장치의 표찰과 정비 내역을 대조해볼 수 있다.",
    RECEPTION: "진료, 이송, 인계 기록은 서로 다른 항목이다.",
    PATIENT: "유리 너머의 사람과 문 옆 화면을 확인한다.",
    OUTSIDE: "지금 확인할 수 있는 것은 발밑의 길과 장비 상태다.",
    AFTER: "함께 갈 사람, 인계할 일, 내가 향할 곳을 정한다.",
  };
  const DETAIL = {
    K01: "key",
    K02: "terminal",
    K03: "terminal",
    K04: "panel",
    K05: "map",
    K06: "panel",
    K07: "terminal",
    K08: "panel",
    K09: "letter",
    K10: "medical",
    K11: "terminal",
    K12: "letter",
    K13: "letter",
    K14: "terminal",
    K15: "letter",
    K16: "map",
    K17: "medical",
    K18: "letter",
    K19: "medical",
    K20: "terminal",
    K21: "medical",
    K22: "panel",
    K23: "map",
    K24: "map",
    K25: "panel",
    K26: "terminal",
    K27: "letter",
    K28: "letter",
    K29: "map",
    K30: "letter",
    K31: "letter",
    K32: "photo",
    K33: "letter",
  };
  function assetFor(id) {
    if (id === "PATIENT" && FLAG("patient_awake")) return "patient_empty";
    return (SCENE[id] || ["ward"])[0];
  }
  function portrait() {
    return '<svg viewBox="0 0 260 460" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="shirt" x2="1" y2="1"><stop stop-color="#8faba0"/><stop offset="1" stop-color="#315b60"/></linearGradient><linearGradient id="skin" x2=".8" y2="1"><stop stop-color="#c0b99b"/><stop offset="1" stop-color="#829c8b"/></linearGradient></defs><path d="M24 460L38 283Q46 223 97 223L108 189H158L166 225Q217 232 228 292L246 460Z" fill="url(#shirt)" stroke="#557873" stroke-width="2"/><path d="M89 111Q82 183 118 207Q149 222 176 178L186 117Q172 73 126 77Z" fill="url(#skin)"/><path d="M89 150Q68 89 94 68Q126 31 164 61Q207 67 187 144L170 102L156 112L154 84Q143 113 110 113L104 140Z" fill="#1f3638"/><path d="M97 150L117 151M145 150L167 147" stroke="#445d53" stroke-width="4"/><path d="M126 155L122 175L134 176M116 191Q131 196 148 187" fill="none" stroke="#617264" stroke-width="2"/><path d="M98 224L128 261L166 225M128 261L137 459" fill="none" stroke="#b6c3aa" stroke-width="3"/><path d="M44 309L65 459M203 302L198 459" stroke="#537771" stroke-width="7"/><path d="M155 311H196V356H155Z" fill="#537974" stroke="#a5b69e"/><path d="M107 211L107 226Q130 248 160 225L156 203" fill="url(#skin)"/></svg>';
  }
  const stage = el("div", "", undefined);
  stage.id = "stage";
  $("app").prepend(stage);
  for (const id of ["world", "hit-plane", "lens"]) stage.append($(id));
  function layoutWorld() {
    const size = Math.min(stage.clientWidth, stage.clientHeight * 16 / 9);
    for (const id of ["scene-plane", "hit-plane"]) {
      $(id).style.width = size + "px";
      $(id).style.top = "50%";
    }
  }
  new ResizeObserver(layoutWorld).observe(stage);
  window.addEventListener("resize", layoutWorld);
  layoutWorld();
  for (let i = 0; i < 29; i++) {
    const t = el("i", "dust");
    t.style.left = 7 + Math.random() * 86 + "%";
    t.style.top = 15 + Math.random() * 65 + "%";
    t.style.animationDelay = -Math.random() * 18 + "s";
    t.style.animationDuration = 13 + Math.random() * 10 + "s";
    $("dust").append(t);
  }
  function applyPrefs() {
    document.body.classList.toggle("motion-off", !prefs.motion);
    document.documentElement.style.setProperty("--textsize", prefs.size + "px");
    document.documentElement.style.setProperty("--bright", prefs.brightness);
    $("sound-toggle").replaceChildren(icon(prefs.sound ? "sound" : "mute"), el("span", "tool-label", prefs.sound ? "소리 켜짐" : "음소거"));
    $("sound-toggle").setAttribute("aria-label", prefs.sound ? "소리 끄기" : "소리 켜기");
    Audio.sync();
    try {
      localStorage.setItem(PREFKEY, JSON.stringify(prefs));
    } catch (e) {
      storageOK = false;
    }
  }
  function pack() {
    return {
      id: D.meta.id,
      version: D.meta.version,
      visual_version: "2.0",
      state,
      history: history.slice(-90),
      notes,
      transcript,
      unlocked,
      visual: { page, reading },
    };
  }
  function persist() {
    if (!started) return;
    const p = pack();
    saved = clone(p);
    try {
      localStorage.setItem(SAVEKEY, JSON.stringify(p));
      localStorage.setItem(ENDKEY, JSON.stringify(unlocked));
    } catch (e) {
      storageOK = false;
    }
    $("save-indicator").replaceChildren(
      el("i"),
      document.createTextNode(storageOK ? "진행 보관됨" : "저장 파일로 보관"),
    );
    $("save-indicator").title = storageOK
      ? "장면과 진행이 이 브라우저에 저장되었습니다."
      : "이 환경에서는 자동 저장이 제한됩니다. 설정에서 저장 파일을 내보내세요.";
  }
  function toast(t) {
    clearTimeout(toastTimer);
    $("toast").textContent = t;
    $("toast").classList.add("show");
    toastTimer = setTimeout(() => $("toast").classList.remove("show"), 3300);
  }
  function setArt(name, immediate = false) {
    if (name === visualAsset) return;
    clearTimeout(artTimer);
    visualAsset = name;
    const src = A[name] || A.ward;
    $("world-wash").style.backgroundImage = `url("${src}")`;
    if (immediate || !prefs.motion) {
      $("backdrop").src = src;
      $("backdrop-next").classList.remove("show");
    } else {
      $("backdrop-next").src = src;
      $("backdrop-next").classList.add("show");
      artTimer = setTimeout(() => {
        $("backdrop").src = src;
        $("backdrop-next").classList.remove("show");
      }, 610);
    }
    Audio.scene(name);
  }
  function splitText(view) {
    const result = [];
    for (const b of view) {
      for (const p of b.split(/\n\s*\n/)) {
        const trimmed = p.trim();
        if (!trimmed) continue;
        if (trimmed.length <= 150) {
          result.push(trimmed);
          continue;
        }
        let parts = trimmed.match(/[^.!?。]+[.!?。]+[”’"']?|[^.!?。]+$/g) || [trimmed];
        let buf = "";
        for (let part of parts) {
          part = part.trim();
          if (!part) continue;
          if (buf.length + part.length > 150 && buf) {
            result.push(buf);
            buf = "";
          }
          if (part.length > 200) {
            if (buf) {
              result.push(buf);
              buf = "";
            }
            while (part.length > 160) {
              let cut = part.lastIndexOf(" ", 155);
              if (cut < 80) cut = 150;
              result.push(part.slice(0, cut).trim());
              part = part.slice(cut).trim();
            }
          }
          buf += (buf ? " " : "") + part;
        }
        if (buf) result.push(buf);
      }
    }
    const joined = [];
    for (let i = 0; i < result.length; i++) {
      if (result[i].length < 51 && result[i + 1] && result[i].length + result[i + 1].length < 145) {
        joined.push(result[i] + "\n\n" + result[i + 1]);
        i++;
      } else joined.push(result[i]);
    }
    return joined.length ? joined : [""];
  }
  function clearType() {
    clearInterval(typeTimer);
    typeTimer = 0;
  }
  function showPage(instant = false) {
    clearType();
    page = Math.min(Math.max(0, page), pages.length - 1);
    const t = pages[page] || "";
    typed = instant || !prefs.speed;
    if (typed) $("prose").textContent = t;
    else {
      let i = 0;
      $("prose").textContent = "";
      typeTimer = setInterval(() => {
        i += Math.max(1, Math.round(prefs.speed / 32));
        $("prose").textContent = t.slice(0, i);
        if (i >= t.length) {
          clearType();
          typed = true;
        }
      }, 31);
    }
    $("prose").scrollTop = 0;
    $("page-count").textContent =
      String(page + 1).padStart(2, "0") + " / " + String(pages.length).padStart(2, "0");
    $("page-dots").replaceChildren();
    for (let i = 0; i < Math.min(pages.length, 22); i++)
      $("page-dots").append(el("i", i === page ? "active" : ""));
    const last = page === pages.length - 1,
      sc = D.scenes[state.node],
      p = L.puzzle(D, state),
      ch = L.choices(D, state);
    let label = !last
      ? "계속"
      : sc.ending
        ? "결말 마치기"
        : p
          ? "장치 조작"
          : SCENE[state.node][1] === "explore"
            ? "둘러보기"
            : ch.length === 1
              ? "계속"
              : "선택하기";
    $("advance").replaceChildren(document.createTextNode(label), el("span", "", last ? "→" : "↵"));
    persist();
  }
  function finishReading() {
    clearType();
    typed = true;
    reading = false;
    showActions();
    persist();
  }
  function advance() {
    if (busy || mode === "title") return;
    if (!typed && reading) {
      showPage(true);
      return;
    }
    Audio.click();
    if (page < pages.length - 1 && reading) {
      page++;
      showPage();
      return;
    }
    const sc = D.scenes[state.node];
    if (sc.ending) {
      reading = false;
      showEnding();
      persist();
      return;
    }
    const ch = L.choices(D, state);
    if (
      !L.puzzle(D, state) &&
      SCENE[state.node][1] !== "explore" &&
      ch.length === 1 &&
      ch[0].enabled
    ) {
      doChoice(ch[0].id);
      return;
    }
    finishReading();
  }
  function objective() {
    if (!FLAG("door_open")) return "직원과 연락할 방법을 찾는다.";
    if (!FLAG("power")) return "복도의 전력 배분함을 확인한다.";
    if (!FLAG("lamp")) return "C04에서 손전등을 챙긴다.";
    if (!FLAG("world")) return "내가 옮겨진 이유와 나가는 길을 찾는다.";
    if (FLAG("patient_started") && !FLAG("patient_awake"))
      return "회복을 기다리며 떠날 준비를 한다.";
    if (!FLAG("route_checked")) return "옛 지도가 아닌, 지금 통하는 길을 확인한다.";
    if (FLAG("handoff_planned") && !FLAG("handoff_done"))
      return "방문 약속을 실제 인계로 이어간다.";
    return "남겨둘 일과 내가 갈 곳을 정한다.";
  }
  function render(instant = false, savedPage = null, savedReading = true) {
    document.body.classList.add("game-active");
    window.scrollTo({top: 0, behavior: "instant"});
    const sc = D.scenes[state.node];
    mode = "game";
    $("title-screen").hidden = true;
    $("ending-overlay").hidden = true;
    for (const x of ["hud", "objective", "dock", "narrative"]) $(x).hidden = false;
    $("conversation-choices").hidden = true;
    $("hit-plane").replaceChildren();
    $("mode-hint").hidden = true;
    document.body.classList.remove("exploring");
    document.body.classList.toggle("world-awake", FLAG("filter"));
    $("chapter").textContent =
      (sc.chapter === 0
        ? "PROLOGUE"
        : sc.ending
          ? "EPILOGUE"
          : "CHAPTER " + String(sc.chapter).padStart(2, "0")) +
      " · " +
      D.meta.chapter_names[String(sc.chapter)];
    $("location").textContent = sc.location;
    $("scene-name").textContent = sc.title;
    $("speaker").textContent = "강서진";
    $("objective-text").textContent = objective();
    $("clue-count").textContent = state.clues.length;
    $("skip-prose").textContent = sc.ending ? "장면 마치기" : "둘러보기";
    $("skip-prose").hidden = false;
    $("undo").disabled = !history.length;
    const charScenes = [
      "YOON",
      "WAKE",
      "TELL",
      "TELL_FULL",
      "TELL_HIDE",
      "CONFRONT",
      "REPAIR_TRUST",
      "JOINT_PLAN",
    ];
    $("character").innerHTML =
      FLAG("patient_awake") && charScenes.includes(state.node) ? portrait() : "";
    $("scene-effects").replaceChildren();
    if (FLAG("patient_started") && !FLAG("patient_awake") && assetFor(state.node) === "recovery")
      $("scene-effects").append(el("div", "recovery-light"));
    setArt(assetFor(state.node), instant);
    pages = splitText(state.view);
    page = savedPage === null ? 0 : Math.min(savedPage, pages.length - 1);
    reading = savedReading;
    $("lens").hidden = !(FLAG("lamp") && lampOn);
    renderInventory();
    if (reading) showPage(instant);
    else showActions();
    persist();
  }
  function renderInventory() {
    const items = [
      ["lamp", "lamp", "손전등", "K01"],
      ["key", "key", "돌아온 집 열쇠", "K01"],
      ["family_lead", "paper", "서윤의 편지", "K15"],
      ["route_checked", "map", "확인한 경로", "K29"],
      ["gear", "gear", "보호 장비", "K21"],
      ["radio", "radio", "지역 교신 기록", "K26"],
    ];
    $("inventory").replaceChildren();
    for (const [f, n, t, k] of items) {
      const b = el("button", "inventory-slot" + (FLAG(f) ? "" : " empty"));
      b.disabled = !FLAG(f);
      b.setAttribute("aria-label", FLAG(f) ? t : "빈 소지품 칸");
      if (FLAG(f)) {
        b.append(icon(n), el("small", "", t));
        b.onclick = () => {
          if (f === "lamp") {
            lampOn = !lampOn;
            $("lens").hidden = !lampOn;
            renderInventory();
            Audio.click();
            toast(lampOn ? "손전등을 켰다. 화면 위로 빛을 움직일 수 있다." : "손전등을 껐다.");
          } else openEvidence(k);
        };
        if (f === "lamp" && lampOn) b.classList.add("active");
      } else b.append(el("span", "", "·"));
      $("inventory").append(b);
    }
  }
  function showActions() {
    document.body.classList.add("exploring");
    $("conversation-choices").replaceChildren();
    $("hit-plane").replaceChildren();
    $("conversation-choices").hidden = true;
    $("mode-hint").hidden = true;
    $("skip-prose").hidden = true;
    const sc = D.scenes[state.node];
    if (sc.ending) {
      showEnding();
      return;
    }
    const ch = L.choices(D, state),
      p = L.puzzle(D, state),
      spots = SPOTS[state.node];
    $("prose").textContent = SINGLE_NOTE[state.node] || (p ? "장치를 조작하거나 기록장에서 단서를 확인할 수 있습니다." : "아래에서 다음 행동을 선택하세요. 읽은 내용은 ‘전체 글’에서 다시 볼 수 있습니다.");
    if (spots) {
      for (const c of ch) {
        const pos = spots[c.id];
        if (!pos) {
          addAction(c);
          continue;
        }
        const b = el(
          "button",
          "hotspot" + (!c.enabled ? " locked" : "") + (state.visited.includes(c.to) ? " done" : ""),
        );
        b.style.left = pos[0] + "%";
        b.style.top = pos[1] + "%";
        b.dataset.choice = c.id;
        b.setAttribute("aria-label", c.label);
        b.setAttribute("aria-disabled", String(!c.enabled));
        b.append(el("span", "reticle"), el("span", "hs-label", pos[2]));
        b.onclick = () =>
          c.enabled ? doChoice(c.id) : toast(c.disabled_reason || "아직 필요한 준비가 남아 있다.");
        $("hit-plane").append(b);
        addAction(c);
      }
      $("mode-hint").hidden = false;
    } else {
      if (p) {
        const b = el("button", "action-choice primary");
        b.id = "open-device";
        b.append(el("span", "choice-mark", "◇"), el("span", "", p.title + " · 조작한다"));
        b.onclick = () => openPuzzle();
        $("conversation-choices").append(b);
        $("conversation-choices").hidden = false;
      }
      ch.forEach(addAction);
    }
    if (!spots && !p && ch.length === 0) $("prose").textContent = "이 장면은 끝났다.";
    $("hit-plane").classList.toggle("targets-visible", showingTargets);
  }
  function addAction(c) {
    const b = el("button", "action-choice");
    b.dataset.choice = c.id;
    b.disabled = !c.enabled;
    b.append(el("span", "choice-mark", "↳"));
    const t = el("span", "", c.label);
    if (c.enabled && state.visited.includes(c.to)) {
      b.classList.add("visited-choice");
      t.append(el("small", "choice-status", "방문한 장소"));
    }
    if (!c.enabled) t.append(el("small", "", c.disabled_reason || "아직 필요한 준비가 남아 있다."));
    b.append(t);
    b.onclick = () => doChoice(c.id);
    $("conversation-choices").append(b);
    $("conversation-choices").hidden = false;
  }
  function ask(t, cb) {
    $("confirm-text").textContent = t;
    $("confirm-modal").showModal();
    const no = () => {
      $("confirm-modal").close();
    };
    $("confirm-no").onclick = no;
    $("confirm-yes").onclick = () => {
      $("confirm-modal").close();
      cb();
    };
  }
  function commit(next, label, kind = "move") {
    if (busy) return;
    clearType();
    history.push(clone(state));
    if (history.length > 90) history.shift();
    transcript.push({
      scene: state.node,
      title: D.scenes[state.node].title,
      text: state.view.join("\n\n"),
      action: label,
    });
    const old = state,
      from = state.node,
      newClues = next.clues.filter((k) => !old.clues.includes(k));
    state = next;
    const transition =
      from === "START"
        ? "awakening"
        : from === "AIRLOCK" && next.node === "OUTSIDE" && !old.flags.includes("outside_seen")
          ? "exit"
          : assetFor(from) !== assetFor(next.node)
            ? "fade"
            : null;
    if ($("modal").open) $("modal").close();
    if (kind === "solve") Audio.good();
    else if (assetFor(from) !== assetFor(next.node)) Audio.door();
    else Audio.paper();
    if (transition && prefs.motion) {
      busy = true;
      $("transition").className = transition;
      clearTimeout(transitionTimer);
      const dur = transition === "awakening" ? 2800 : transition === "exit" ? 2500 : 800;
      pendingRender = setTimeout(() => render(true), transition === "fade" ? 300 : 500);
      transitionTimer = setTimeout(() => {
        $("transition").className = "";
        busy = false;
        showPage();
      }, dur);
    } else {
      render(!prefs.motion);
      busy = false;
    }
    if (newClues.length)
      setTimeout(
        () =>
          toast(
            newClues.length === 1
              ? "기록장에 보관 · " + D.clues[newClues[0]].title
              : newClues.length + "개의 기록을 확인했다.",
          ),
        prefs.motion && transition ? 2900 : 150,
      );
    if (next.day > old.day)
      setTimeout(
        () => toast(next.day - old.day + "일이 지났다. 읽는 시간은 흐른 날짜에 포함되지 않는다."),
        prefs.motion && transition ? 3250 : 700,
      );
  }
  function doChoice(id) {
    if (busy) return;
    const c = L.choices(D, state).find((x) => x.id === id);
    if (!c || !c.enabled) {
      toast(c?.disabled_reason || "지금 할 수 없는 행동이다.");
      return;
    }
    const act = () => commit(L.choose(D, state, id, true), c.label);
    if (c.confirm) ask(c.confirm, act);
    else act();
  }
  function undo() {
    if (!history.length) return;
    ask("직전 행동 전으로 돌아갈까요? 현재 진행을 보관하려면 먼저 저장 파일을 내보내세요.", () => {
      state = history.pop();
      transcript.pop();
      if ($("modal").open) $("modal").close();
      render(true);
    });
  }
  function startNew() {
    const act = () => {
      Audio.init();
      started = true;
      state = L.start(D);
      history = [];
      transcript = [];
      notes = "";
      render(false);
      if (!storageOK) toast("자동 저장이 제한됩니다. 설정에서 진행 파일을 보관해주세요.");
    };
    if (saved)
      ask(
        "새로 시작하면 현재 자동 저장이 바뀝니다. 발견한 결말은 남습니다. 새 이야기를 시작할까요?",
        act,
      );
    else act();
  }
  function restore(p) {
    const valid = L.validateSave(D, p);
    state = valid.state;
    history = valid.history || [];
    notes = typeof valid.notes === "string" ? valid.notes : "";
    transcript = valid.transcript || [];
    unlocked = [...new Set(unlocked.concat(valid.unlocked || []))];
    started = true;
    render(
      true,
      Number.isInteger(valid.visual?.page) ? valid.visual.page : 0,
      typeof valid.visual?.reading === "boolean" ? valid.visual.reading : true,
    );
  }
  function menu() {
    clearType();
    clearTimeout(pendingRender);
    clearTimeout(transitionTimer);
    busy = false;
    $("transition").className = "";
    $("lens").hidden = true;
    if (started) persist();
    mode = "title";
    document.body.classList.remove("game-active");
    $("title-screen").hidden = false;
    $("ending-overlay").hidden = true;
    for (const x of ["hud", "objective", "dock", "narrative", "conversation-choices", "mode-hint"])
      $(x).hidden = true;
    $("hit-plane").replaceChildren();
    $("character").replaceChildren();
    document.body.classList.remove("exploring");
    setArt("ward", true);
    $("continue-game").disabled = !saved;
    $("continue-label").textContent = saved ? D.scenes[saved.state.node].title : "";
    if ($("modal").open) $("modal").close();
  }
  function setModal(title, kicker = "DISCHARGE DAY", cls = "") {
    const d = $("modal");
    d.className = cls;
    $("modal-title").textContent = title;
    $("modal-kicker").textContent = kicker;
    $("modal-body").replaceChildren();
    $("modal-body").scrollTop = 0;
    if (!d.open) d.showModal();
    return $("modal-body");
  }
  function openHelp() {
    const body = setModal("조작 안내", "퇴원일");
    for (const [title, text] of [
      ["읽고 조사하기", "‘계속’을 눌러 글을 읽은 뒤 조사 대상을 고릅니다. ‘둘러보기’를 누르면 바로 행동 목록을 엽니다. ‘전체 글’에서 놓친 내용을 다시 읽을 수 있습니다."],
      ["단서와 장치", "발견한 단서는 기록장에 보관됩니다. 장치가 풀리지 않으면 조작 창의 ‘관련 기록’과 단계별 힌트를 확인하세요."],
      ["이동과 되돌리기", "지도에서 이동할 수 있는 장소를 확인합니다. ‘되돌리기’는 직전 행동으로 돌아갑니다. ‘방문한 장소’ 표시는 이미 들렀다는 뜻이며, 모든 조사가 끝났다는 뜻은 아닙니다."],
      ["저장과 소리", "진행 상황은 현재 브라우저에 자동 저장됩니다. 다른 기기로 옮길 때는 설정에서 저장 파일을 내보내세요. 소리 버튼으로 음소거하고, 설정에서 글자 크기와 화면 움직임을 조절할 수 있습니다."],
    ]) {
      body.append(el("h3", "", title));
      para(body, text);
    }
  }
  function para(parent, text, cls = "") {
    const p = el("p", cls, text);
    parent.append(p);
    return p;
  }
  function download(name, text, type = "application/json") {
    const u = URL.createObjectURL(new Blob([text], { type: type + ";charset=utf-8" })),
      a = el("a");
    a.href = u;
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 1800);
  }
  function exportSave() {
    download("퇴원일_그래픽판_진행.json", JSON.stringify(pack(), null, 2));
    toast("진행 저장 파일을 보관했다.");
  }
  function openFull() {
    Audio.paper();
    const b = setModal(D.scenes[state.node].title, "지금까지 관찰한 장면");
    para(b, state.view.join("\n\n"), "full-prose");
  }
  function openEvidence(id) {
    if (!D.clues[id] || !state.clues.includes(id)) {
      toast("아직 읽지 않은 기록이다.");
      return;
    }
    Audio.paper();
    const k = D.clues[id],
      b = setModal(k.title, "조사 기록 · " + id),
      g = el("div", "evidence-detail"),
      aside = el("aside");
    const img = el("img");
    img.src = A["detail_" + (DETAIL[id] || "letter")];
    img.alt = k.carrier;
    aside.append(img, el("div", "evidence-meta", k.location + "\n" + k.carrier));
    const content = el("article", "evidence-paper", k.text);
    g.append(aside, content);
    b.append(g);
    const bar = el("div", "toolbar"),
      back = el("button", "soft", "기록 목록으로");
    back.onclick = () => journal("records");
    bar.append(back);
    b.append(bar);
  }
  function journal(tab = "records") {
    Audio.paper();
    const b = setModal("기록장", "관찰한 사실은 이곳에 남습니다"),
      tabs = el("div", "tabs");
    for (const [id, label] of [
      ["records", "조사 기록"],
      ["prep", "준비와 메모"],
      ["endings", "발견한 결말"],
      ["history", "내가 읽은 이야기"],
    ]) {
      const x = el("button", id === tab ? "active" : "", label);
      x.onclick = () => journal(id);
      tabs.append(x);
    }
    b.append(tabs);
    if (tab === "records") {
      if (!state.clues.length)
        para(b, "아직 조사한 기록이 없다. 장소의 물건과 화면을 살펴보면 이곳에 모인다.");
      const grid = el("div", "record-grid");
      for (const id of state.clues) {
        const k = D.clues[id],
          x = el("button", "record-card");
        x.dataset.clue = id;
        const im = el("img");
        im.src = A["detail_" + (DETAIL[id] || "letter")];
        im.alt = "";
        const txt = el("div");
        txt.append(
          el("small", "", id + " · " + k.location),
          el("strong", "", k.title),
          el("span", "carrier", k.carrier),
        );
        x.append(im, txt);
        x.onclick = () => openEvidence(id);
        grid.append(x);
      }
      b.append(grid);
    } else if (tab === "prep") {
      para(b, "실제로 확보한 물건과 끝낸 준비다. 방문 약속은 인계 완료와 다르다.", "small-note");
      const g = el("div", "preparation");
      for (const f of state.flags)
        if (D.flag_labels[f]) g.append(el("span", "", "✓ " + D.flag_labels[f]));
      b.append(g);
      const l = el("label", "", "나의 메모");
      l.htmlFor = "notes";
      const t = el("textarea", "notes");
      t.id = "notes";
      t.value = notes;
      t.placeholder = "관찰한 사실과 내 추측을 나눠 적어둔다.";
      t.oninput = () => {
        notes = t.value;
        persist();
      };
      b.append(l, t);
      para(b, "메모와 진행은 이 기기와 직접 내보낸 저장 파일에만 남습니다.", "small-note");
    } else if (tab === "endings") {
      const names = ["road", "road", "workshop", "recovery", "road"],
        g = el("div", "end-gallery");
      Object.entries(D.meta.ending_names).forEach(([id, n], i) => {
        const x = el("div");
        const yes = unlocked.includes(id);
        if (yes)
          x.style.backgroundImage = `linear-gradient(0deg,#05151af7,transparent),url("${A[names[i]]}")`;
        x.append(
          el("small", "", "ENDING " + String(i + 1).padStart(2, "0")),
          el("strong", "", yes ? n : "미발견"),
          el("p", "", yes ? "발견한 결말" : "다른 선택의 끝"),
        );
        g.append(x);
      });
      b.append(g);
      para(
        b,
        "결말은 선악 점수로 나뉘지 않습니다. 준비·설명·합의·인계가 서로 다른 결과를 만듭니다.",
        "small-note",
      );
    } else {
      const out = el("button", "soft", "내가 읽은 이야기 파일로 보관");
      out.onclick = () => {
        const list = transcript.concat([
          { title: D.scenes[state.node].title, text: state.view.join("\n\n"), action: "" },
        ]);
        download(
          "퇴원일_내가읽은이야기.txt",
          list
            .map(
              (x) => "【" + x.title + "】\n\n" + x.text + (x.action ? "\n\n선택: " + x.action : ""),
            )
            .join("\n\n──────────\n\n"),
          "text/plain",
        );
      };
      b.append(out);
      for (const x of transcript.slice(-30).reverse()) {
        const d = el("details");
        d.style.cssText = "padding:15px 0;border-bottom:1px solid var(--line)";
        d.append(el("summary", "", x.title + " · " + x.action), el("p", "full-prose", x.text));
        b.append(d);
      }
      if (!transcript.length) para(b, "아직 지나온 장면이 없습니다.");
    }
  }
  function settings() {
    const b = setModal("환경 설정", "소리 · 읽기 · 진행 보관");
    const row = (title, note) => {
      const r = el("div", "settings-row"),
        l = el("div", "", title);
      l.append(el("small", "", note));
      const c = el("div");
      r.append(l, c);
      b.append(r);
      return c;
    };
    const tog = (box, options, current, fn) => {
      const wrap = el("div", "toggle-set");
      for (const [val, lab] of options) {
        const x = el("button", val === current ? "active" : "", lab);
        x.onclick = () => {
          fn(val);
          applyPrefs();
          settings();
        };
        wrap.append(x);
      }
      box.append(wrap);
    };
    tog(
      row("소리", "기계음, 바람, 문과 종이 소리, 낮은 배경음"),
      [
        [true, "켜기"],
        [false, "끄기"],
      ],
      prefs.sound,
      (v) => {
        prefs.sound = v;
        Audio.init();
      },
    );
    let c = row("소리 크기", "첫 시작은 낮은 음량을 권장합니다."),
      r = el("input");
    r.type = "range";
    r.min = 0;
    r.max = 70;
    r.value = prefs.volume * 100;
    r.setAttribute("aria-label", "소리 크기");
    r.oninput = () => {
      prefs.volume = Number(r.value) / 100;
      applyPrefs();
    };
    c.append(r);
    tog(
      row("문장 표시", "언제든 계속 버튼을 눌러 한 번에 표시할 수 있습니다."),
      [
        [0, "즉시"],
        [25, "느리게"],
        [40, "보통"],
        [65, "빠르게"],
      ],
      prefs.speed,
      (v) => {
        prefs.speed = v;
      },
    );
    c = row("글자 크기", "기록과 현재 화면은 읽는 속도 때문에 불리해지지 않습니다.");
    r = el("input");
    r.type = "range";
    r.min = 15;
    r.max = 25;
    r.value = prefs.size;
    r.setAttribute("aria-label", "글자 크기");
    r.oninput = () => {
      prefs.size = Number(r.value);
      applyPrefs();
    };
    c.append(r);
    tog(
      row("화면 움직임", "장면 전환, 먼지와 조명의 움직임"),
      [
        [true, "사용"],
        [false, "줄이기"],
      ],
      prefs.motion,
      (v) => {
        prefs.motion = v;
      },
    );
    c = row("장면 밝기", "어두운 공간의 조사 위치를 보기 쉽게 조절합니다.");
    r = el("input");
    r.type = "range";
    r.min = 80;
    r.max = 150;
    r.value = prefs.brightness * 100;
    r.setAttribute("aria-label", "장면 밝기");
    r.oninput = () => {
      prefs.brightness = Number(r.value) / 100;
      applyPrefs();
    };
    c.append(r);
    const bar = el("div", "toolbar");
    for (const [name, fn, dis] of [
      ["진행 저장 파일 보관", exportSave, !started],
      ["저장 파일 불러오기", () => $("load-file").click(), false],
      ["조작 안내", instructions, false],
    ]) {
      const x = el("button", "soft", name);
      x.disabled = dis;
      x.onclick = fn;
      bar.append(x);
    }
    b.append(bar);
    para(
      b,
      "자동 저장: " +
        (storageOK ? "이 브라우저에서 사용 가능" : "현재 환경에서 제한됨") +
        ". 기기를 옮기거나 오래 보관할 때는 진행 저장 파일을 직접 보관하세요.",
      "small-note",
    );
  }
  function instructions() {
    const b = setModal("조작 안내", "처음부터 결말까지");
    for (const t of [
      "장면의 글은 계속 버튼, Space 또는 Enter로 넘깁니다. 글이 나오는 중에 누르면 즉시 모두 표시됩니다.",
      "글을 읽고 둘러보기에 들어가면 물건 위에 마름모 표시가 나타납니다. 마우스를 올리거나 Tab으로 이동하면 조사 대상의 이름을 확인할 수 있습니다. 휴대기기에서는 표시 버튼으로 이름을 함께 띄울 수 있습니다.",
      "다시 읽고 싶은 장면은 대화창의 전문, 발견한 단서는 상단 기록장에서 확인합니다. 물건 조사는 선택한 순서에 따라 이후의 대화와 준비를 바꿉니다.",
      "장치를 조작할 때는 화면의 손잡이·스위치·서랍·채널·지도 항목을 누르고 실행합니다. 틀린 조작은 적용되지 않으며, 3단계 힌트와 기록장을 쓸 수 있습니다.",
      "J: 기록장 / M: 지도 / F: 손전등 / Esc: 창 닫기 또는 설정. Space와 Enter는 글 진행입니다. 장치와 대화 선택은 직접 눌러야 합니다.",
      "저장과 되돌리기는 플레이 편의 기능입니다. 작품 안의 시간이 되돌아가는 설정이 아닙니다. 이전 텍스트판의 진행 파일도 불러올 수 있습니다.",
      "정해진 대기 행동만 날짜를 전진시킵니다. 화면을 오래 읽거나 퍼즐을 틀려도 시간이 줄어들지 않습니다.",
      D.meta.content_note,
    ])
      para(b, t);
  }
  function openMap() {
    const b = setModal("발견한 공간", "직접 확인한 장소만 표시합니다");
    const groups = [
        ["C04 회복실", "ward", ["ROOM"]],
        ["지하 복도", "corridor", ["HALL", "FIRST_HALL"]],
        ["접수실", "reception", ["RECEPTION"]],
        ["설비실", "plant", ["PLANT"]],
        ["C05 관찰실", "patient", ["PATIENT"]],
        ["장비실", "gear", ["GEAR"]],
        ["이중문", "airlock", ["AIRLOCK"]],
        ["바깥 계단", "outside", ["OUTSIDE"]],
        ["통신실", "radio", ["RADIO"]],
        ["공용 회복실", "recovery", ["AFTER", "RECOVERY_START", "YOON"]],
        ["서안 기록분소", "archive", ["ARCHIVE_PATH", "ARCHIVE_BOX"]],
      ],
      g = el("div", "map-grid");
    for (const [name, a, vs] of groups) {
      const known = vs.some((v) => state.visited.includes(v));
      if (!known) continue;
      const x = el("div", "map-node" + (assetFor(state.node) === a ? " current" : "")),
        im = el("img");
      im.src = A[a];
      im.alt = "";
      x.append(
        im,
        el("small", "", assetFor(state.node) === a ? "현재 주변" : "발견한 공간"),
        el("strong", "", name),
      );
      g.append(x);
    }
    b.append(g);
    para(
      b,
      "이 지도는 발견한 공간의 기록입니다. 이동은 현재 장면의 문과 표지를 눌러 진행합니다.",
      "small-note",
    );
    if (FLAG("route_checked"))
      para(b, "확인한 경로\n동쪽 계단 → 2번 배수문 → 마른 상단길", "saved-route");
  }
  function showEnding() {
    clearType();
    const e = D.scenes[state.node].ending;
    if (!e) return;
    if (!unlocked.includes(e)) {
      unlocked.push(e);
      Audio.good();
    }
    for (const n of ["narrative", "conversation-choices", "objective", "mode-hint"])
      $(n).hidden = true;
    $("hit-plane").replaceChildren();
    $("ending-overlay").hidden = false;
    $("end-number").textContent = "ENDING " + e.slice(1).padStart(2, "0") + " / 05";
    $("end-name").textContent = D.meta.ending_names[e];
    $("end-description").textContent = {
      E1: "인계는 끝났고, 나는 내 몫의 짐을 들었다.\n이제 다음 주소는 내가 정한다.",
      E2: "어디로 갈지, 얼마나 빨리 걸을지.\n이번에는 함께 결정했다.",
      E3: "누나는 내가 없던 시간에도 살아갔다.\n나는 그 생활이 남아 있는 곳으로 간다.",
      E4: "처음 내가 눌렀을 때는 아무도 대답하지 않았다.\n이번에는 문밖의 호출에 내가 응답했다.",
      E5: "모든 호출이 응답으로 이어지지는 않았다.\n확인하지 못한 일을 남기고, 나는 걸었다.",
    }[e];
    persist();
  }
  function credits() {
    const b = setModal("퇴원일", "VISUAL EDITION · 2.0");
    para(b, "닫힌 문 밖의 시간");
    para(b, "원안과 제작 방향 · 단서공방\n시나리오·일러스트·웹 실행판 · AI 협업 제작");
    para(
      b,
      "22장의 공간·소품 일러스트, 장면 전환과 환경 효과, 합성 배경음과 조작음, 61개 장면, 33개 기록, 7개 조작 퍼즐, 5개 대표 결말을 포함합니다. 모든 장면과 소리는 파일 안에서 동작합니다.",
      "small-note",
    );
    para(
      b,
      "외부 서버 접속, 계정, 결제, 원격 측정은 없습니다. 인물 음성 연기와 자유 이동 3D는 포함하지 않은 2D 포인트앤클릭 게임입니다.",
      "small-note",
    );
    para(
      b,
      "소리와 움직임은 설정에서 끌 수 있습니다. 오류를 발견하면 진행 저장 파일과 당시 선택을 함께 보관해주세요.",
      "small-note",
    );
  }
  let puzzleUI = null;
  function openPuzzle() {
    const p = L.puzzle(D, state);
    if (!p) {
      toast("이 장치의 조작을 이미 마쳤다.");
      return;
    }
    Audio.click();
    const b = setModal(p.title, "시설 조작 · " + p.id, "puzzle-dialog");
    para(b, p.prompt, "puzzle-intro");
    if (!p.enabled) para(b, p.disabled_reason, "feedback");
    const work = el("div", "puzzle-workbench");
    work.append(el("div", "instrument-label", "MANUAL INTERFACE / " + p.id));
    const answers = {},
      seq = [];
    let hints = 0;
    puzzleUI = { id: p.id, answers, seq };
    const feedback = el("div", "feedback");
    feedback.id = "puzzle-feedback";
    feedback.setAttribute("role", "status");
    const hintBox = el("div");
    hintBox.id = "puzzle-hints";
    const recordBox = el("div");
    recordBox.id = "puzzle-records";
    const chooseVal = (f, v) => {
      answers[f] = v;
      Audio.click();
    };
    const options = (field, container = work) => {
      const fld = el("div", "control-field");
      fld.append(el("label", "", field.label));
      const row = el("div", "option-row");
      for (const o of field.options) {
        const x = el("button", "option-button", o.label);
        x.type = "button";
        x.dataset.field = field.id;
        x.dataset.value = o.value;
        x.disabled = !p.enabled;
        x.onclick = () => {
          chooseVal(field.id, o.value);
          row.querySelectorAll("button").forEach((n) => n.classList.toggle("selected", n === x));
        };
        row.append(x);
      }
      fld.append(row);
      container.append(fld);
    };
    if (p.id === "P01") {
      const grid = el("div", "handle-grid");
      for (const o of p.fields[0].options) {
        const x = el("button", "handle-unit");
        x.dataset.field = "action";
        x.dataset.value = o.value;
        x.disabled = !p.enabled;
        x.append(
          el(
            "span",
            o.value === "handle" ? "lever" : o.value === "test" ? "seal" : "circle-control",
          ),
          el(
            "strong",
            "",
            o.value === "handle" ? "수동 손잡이" : o.value === "test" ? "경보 시험" : "호출 버튼",
          ),
          el(
            "small",
            "",
            o.value === "handle"
              ? "안쪽에서 당기는 장치"
              : o.value === "test"
                ? "봉인된 시험 스위치"
                : "중계기 연결 없음",
          ),
        );
        x.onclick = () => {
          chooseVal("action", o.value);
          grid.querySelectorAll("button").forEach((n) => n.classList.toggle("chosen", n === x));
        };
        grid.append(x);
      }
      work.append(grid);
    } else if (p.id === "P02") {
      Object.assign(answers, { records: "off", water: "off", lobby: "on" });
      const top = el("div", "meter-label"),
        read = el("span", "", "사용 3 / 4칸");
      top.append(el("span", "", "보조 전력"), read);
      work.append(top);
      const meter = el("div", "capacity-meter");
      for (let i = 0; i < 4; i++) meter.append(el("i"));
      work.append(meter);
      const row = el("div", "switch-row");
      const costs = { records: 2, water: 2, lobby: 3 };
      const update = () => {
        const used = Object.entries(answers).reduce(
          (n, [k, v]) => n + (v === "on" ? costs[k] : 0),
          0,
        );
        read.textContent = "사용 " + used + " / 4칸";
        meter.classList.toggle("over", used > 4);
        [...meter.children].forEach((n, i) => n.classList.toggle("on", i < used));
      };
      for (const f of p.fields) {
        const x = el("button", "switch-module" + (answers[f.id] === "on" ? " on" : ""));
        x.dataset.switch = f.id;
        x.setAttribute("role", "switch");
        x.setAttribute("aria-checked", String(answers[f.id] === "on"));
        x.setAttribute("aria-label", f.label);
        const slot = el("span", "switch-slot");
        slot.append(el("span", "switch-handle"));
        x.append(
          el("strong", "", f.label.split(" · ")[0]),
          slot,
          el("small", "", costs[f.id] + "칸"),
          el("i", "led"),
        );
        x.onclick = () => {
          answers[f.id] = answers[f.id] === "on" ? "off" : "on";
          x.classList.toggle("on", answers[f.id] === "on");
          x.setAttribute("aria-checked", String(answers[f.id] === "on"));
          Audio.noiseHit(0.08, 0.07, 900);
          update();
        };
        row.append(x);
      }
      work.append(row);
      update();
    } else if (p.id === "P03") {
      const stack = el("div", "drawer-stack");
      for (const o of p.fields[0].options) {
        const x = el("button", "drawer");
        x.dataset.field = "box";
        x.dataset.value = o.value;
        x.append(
          el("span", "drawer-label", o.value),
          el("span", "", o.label.split(" · ")[1]),
          el("span", "drawer-handle"),
        );
        x.onclick = () => {
          chooseVal("box", o.value);
          stack.querySelectorAll("button").forEach((n) => n.classList.toggle("selected", n === x));
          Audio.paper();
        };
        stack.append(x);
      }
      work.append(stack);
    } else if (p.id === "P05") {
      const diag = el("div", "airlock-diagram"),
        chamber = el("div", "airlock-chamber", "중간실");
      diag.append(el("div", "door-art"), chamber, el("div", "door-art"));
      work.append(diag);
      const slots = el("div", "sequence-slots");
      work.append(slots);
      const defs = [
          ["close", "안쪽 문 닫기"],
          ["purge", "중간실 정화"],
          ["equal", "압력 확인"],
          ["open", "바깥문 열기"],
        ],
        rows = el("div", "option-row");
      const update = () => {
        slots.replaceChildren();
        for (let i = 0; i < 4; i++) {
          const s = el("div", "sequence-slot" + (seq[i] ? " filled" : ""));
          s.append(
            el("small", "", String(i + 1).padStart(2, "0")),
            document.createTextNode(seq[i] ? defs.find((d) => d[0] === seq[i])[1] : "순서 선택"),
          );
          slots.append(s);
        }
        for (let i = 0; i < 4; i++) answers[p.fields[i].id] = seq[i] || "";
        chamber.classList.toggle("ready", seq.length === 4);
      };
      for (const [val, lab] of defs) {
        const x = el("button", "option-button", lab);
        x.dataset.step = val;
        x.disabled = !p.enabled;
        x.onclick = () => {
          if (seq.length >= 4) {
            toast("순서를 다시 정하려면 초기화를 누른다.");
            return;
          }
          seq.push(val);
          Audio.click();
          update();
        };
        rows.append(x);
      }
      work.append(rows);
      const reset = el("button", "soft", "순서 초기화");
      reset.style.marginTop = "13px";
      reset.id = "reset-sequence";
      reset.onclick = () => {
        seq.length = 0;
        update();
      };
      work.append(reset);
      update();
    } else if (p.id === "P04") {
      options(p.fields[0]);
      const display = el("div", "radio-display"),
        scale = el("div", "radio-scale"),
        needle = el("i", "radio-needle");
      scale.append(needle);
      const val = el("div", "radio-value"),
        channel = el("strong", "", "01"),
        desc = el("span", "", "장거리 구조망");
      val.append(channel, desc);
      display.append(scale, val);
      work.append(display);
      const row = el("div", "dial-row"),
        dial = el("button", "radio-dial"),
        range = el("input");
      dial.setAttribute("aria-label", "다음 채널");
      range.type = "range";
      range.min = 1;
      range.max = 9;
      range.step = 1;
      range.value = 1;
      range.id = "channel-dial";
      range.setAttribute("aria-label", "송신 채널");
      range.disabled = !p.enabled;
      dial.disabled = !p.enabled;
      answers.channel = "1";
      const update = () => {
        answers.channel = String(range.value);
        channel.textContent = String(range.value).padStart(2, "0");
        needle.style.left = ((+range.value - 1) / 8) * 100 + "%";
        dial.style.transform = "rotate(" + ((+range.value - 1) * 30 - 120) + "deg)";
        desc.textContent =
          { 1: "장거리 구조망", 7: "지역 순환망", 9: "병동 내부" }[range.value] || "교신 지정 없음";
        Audio.noiseHit(0.08, 0.035, 1800);
      };
      range.oninput = update;
      dial.onclick = () => {
        range.value = +range.value >= 9 ? 1 : +range.value + 1;
        update();
      };
      row.append(dial, range);
      work.append(row);
      update();
    } else if (p.id === "P06") {
      const req = [
        ["patient_wishes", "사전 의사 확인"],
        ["power", "보조 전원"],
        ["water", "급수"],
        ["filter", "청정 회복실"],
        ["supplies", "생활 물품"],
      ];
      const prep = el("div", "preparation");
      for (const [f, lab] of req)
        prep.append(el("span", FLAG(f) ? "" : "incomplete", (FLAG(f) ? "✓ " : "○ ") + lab));
      work.append(prep);
      const row = el("div", "kit-row");
      for (const o of p.fields[0].options) {
        const x = el("button", "kit");
        x.dataset.field = "kit";
        x.dataset.value = o.value;
        x.disabled = !p.enabled;
        x.append(el("b", "", o.label.split(" · ")[0]), el("span", "", o.label.split(" · ")[1]));
        x.onclick = () => {
          chooseVal("kit", o.value);
          row.querySelectorAll("button").forEach((n) => n.classList.toggle("selected", n === x));
        };
        row.append(x);
      }
      work.append(row);
    } else if (p.id === "P07") {
      const map = el("div", "route-drawing");
      map.innerHTML =
        '<svg viewBox="0 0 650 240" aria-label="옛 지도 위의 통로 선택"><defs><pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0H0V25" fill="none" stroke="#566f5925"/></pattern></defs><rect width="650" height="240" fill="url(#grid)"/><path d="M314 217L314 115L95 74M314 115L534 78M314 115L505 199" fill="none" stroke="#567961" stroke-width="7"/><path d="M429 0Q390 70 440 120T433 240" fill="none" stroke="#63979577" stroke-width="36"/><g fill="#284b3a" font-family="sans-serif" font-size="14"><text x="266" y="237">병원</text><text x="28" y="58">북쪽 고가</text><text x="478" y="61">동쪽 계단</text><text x="491" y="229">남쪽 암거</text></g><circle cx="314" cy="212" r="11" fill="#c7c399" stroke="#365842" stroke-width="3"/><circle cx="534" cy="78" r="9" fill="#c7c399" stroke="#365842" stroke-width="3"/><path d="M91 70l-6 8m15 0-7-8" stroke="#365842" stroke-width="3"/></svg>';
      work.append(map);
      p.fields.forEach((f) => options(f));
    } else p.fields.forEach((f) => options(f));
    b.append(work);
    const actions = el("div", "puzzle-actions"),
      hint = el("button", "soft", "힌트 1 / 3"),
      records = el("button", "soft", "관련 기록"),
      submit = el("button", "solid", "조작 실행");
    submit.id = "submit-puzzle";
    submit.disabled = !p.enabled;
    hint.id = "puzzle-hint";
    hint.onclick = () => {
      if (hints >= p.hints.length) return;
      hintBox.append(el("p", "hint-text", hints + 1 + ". " + p.hints[hints]));
      hints++;
      hint.textContent = hints === 3 ? "힌트 모두 펼침" : "힌트 " + (hints + 1) + " / 3";
      hint.disabled = hints === 3;
    };
    records.onclick = () => {
      const ids = D.scenes[state.node].clues;
      recordBox.replaceChildren();
      for (const id of ids)
        if (state.clues.includes(id)) {
          recordBox.append(el("h3", "", D.clues[id].title), el("p", "hint-text", D.clues[id].text));
        }
      if (p.id === "P04" && state.clues.includes("K25")) {
        recordBox.append(el("h3", "", D.clues.K25.title), el("p", "hint-text", D.clues.K25.text));
      }
      if (!recordBox.childElementCount) para(recordBox, "아직 이 장치와 관련된 기록을 찾지 못했습니다. 주변을 조사하거나 힌트를 확인하세요.");
    };
    submit.onclick = () => {
      const go = () => {
        let result;
        try {
          result = L.solve(D, state, answers, true);
        } catch (e) {
          feedback.textContent = e.message;
          return;
        }
        if (result.ok) {
          commit(result.state, p.title + " · 실행", "solve");
        } else {
          Audio.bad();
          feedback.textContent = result.feedback;
          feedback.scrollIntoView({ block: "nearest" });
        }
      };
      if (p.confirm) ask(p.confirm, go);
      else go();
    };
    actions.append(hint, records, submit);
    b.append(actions, feedback, hintBox, recordBox);
  }
  $("new-game").onclick = startNew;
  $("help-open").onclick = openHelp;
  $("continue-game").onclick = () => {
    if (!saved) return;
    Audio.init();
    restore(saved);
  };
  $("load-title").onclick = () => $("load-file").click();
  $("home").onclick = menu;
  $("title-settings").onclick = settings;
  $("credits").onclick = credits;
  $("journal-open").onclick = () => journal();
  $("map-open").onclick = openMap;
  $("settings-open").onclick = settings;
  $("sound-toggle").onclick = () => {
    prefs.sound = !prefs.sound;
    Audio.init();
    applyPrefs();
    toast(prefs.sound ? "소리를 켰다." : "소리를 껐다.");
  };
  $("advance").onclick = advance;
  $("prose").onclick = () => {
    if (reading) advance();
  };
  $("skip-prose").onclick = finishReading;
  $("read-full").onclick = openFull;
  $("show-targets").onclick = () => {
    $("conversation-choices").scrollIntoView({ block: "center", behavior: "auto" });
    $("conversation-choices").querySelector("button")?.focus({ preventScroll: true });
  };
  $("show-targets").textContent = "목록";
  $("undo").onclick = undo;
  $("modal-close").onclick = () => $("modal").close();
  $("end-story").onclick = openFull;
  $("end-back").onclick = () => {
    if (!history.length) return;
    state = history.pop();
    transcript.pop();
    render(true);
    finishReading();
  };
  $("end-menu").onclick = menu;
  $("fullscreen").onclick = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen)
        await document.documentElement.requestFullscreen();
      else toast("이 브라우저에서는 전체 화면 버튼을 지원하지 않습니다.");
    } catch (e) {
      toast("브라우저 메뉴의 전체 화면 기능을 사용해주세요.");
    }
  };
  $("load-file").onchange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      if (f.size > 12 * 1024 * 1024) throw Error("저장 파일이 너무 큽니다.");
      const p = L.validateSave(D, JSON.parse(await f.text()));
      ask("현재 진행을 이 저장 파일로 바꿀까요?", () => {
        Audio.init();
        if ($("modal").open) $("modal").close();
        restore(p);
        toast("진행 파일을 불러왔다.");
      });
    } catch (err) {
      toast("불러오기 실패 · " + err.message);
    } finally {
      e.target.value = "";
    }
  };
  window.addEventListener("keydown", (e) => {
    if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;
    if ($("confirm-modal").open) return;
    if (e.code === "Escape") {
      if ($("modal").open) return;
      e.preventDefault();
      settings();
      return;
    }
    if ($("modal").open) return;
    if (mode === "title") return;
    if (
      (e.code === "Space" || e.code === "Enter") &&
      document.activeElement?.tagName !== "BUTTON"
    ) {
      e.preventDefault();
      if (reading) advance();
    } else if (e.key.toLowerCase() === "f" && FLAG("lamp")) {
      e.preventDefault();
      lampOn = !lampOn;
      $("lens").hidden = !lampOn;
      renderInventory();
    } else if (e.key.toLowerCase() === "j") {
      e.preventDefault();
      journal();
    } else if (e.key.toLowerCase() === "m") {
      e.preventDefault();
      openMap();
    }
  });
  document.addEventListener("pointermove", (e) => {
    if (!lampOn) return;
    const bounds = stage.getBoundingClientRect();
    $("lens").style.setProperty("--torch-x", e.clientX - bounds.left + "px");
    $("lens").style.setProperty("--torch-y", e.clientY - bounds.top + "px");
  });
  document.addEventListener("visibilitychange", () => {
    Audio.visible = !document.hidden;
    Audio.sync();
    if (document.hidden) persist();
  });
  window.addEventListener("beforeunload", () => {
    persist();
  });
  // The readonly inspection and explicit save restore entry points support repeatable QA.
  window.DischargeGame = {
    getState: () => clone(state),
    getData: () => D,
    getMode: () => mode,
    getPage: () => ({ page, reading, pages: pages.length }),
    restoreSave: restore,
    finishReading,
    openPuzzle,
    setTestMode: () => {
      prefs.motion = false;
      prefs.speed = 0;
      prefs.sound = false;
      applyPrefs();
    },
    pack: () => clone(pack()),
  };
  applyPrefs();
  menu();
})();
