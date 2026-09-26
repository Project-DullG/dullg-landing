import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

// Exercise the actual hook with controlled media and network callbacks.
const source = readFileSync(
  new URL("../components/speaking/use-study-audio.ts", import.meta.url),
  "utf8",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function harness() {
  let cursor = 0;
  const slots = [],
    players = [],
    requests = [],
    timers = new Map();
  const hooks = {
    useState(initial) {
      const i = cursor++;
      if (!(i in slots)) slots[i] = initial;
      return [
        slots[i],
        (value) => {
          slots[i] = typeof value === "function" ? value(slots[i]) : value;
        },
      ];
    },
    useRef(initial) {
      const i = cursor++;
      if (!(i in slots)) slots[i] = { current: initial };
      return slots[i];
    },
    useCallback(fn) {
      return fn;
    },
    useEffect() {},
  };
  class Media {
    constructor(src) {
      this.src = src;
      players.push(this);
    }
    play() {
      return Promise.resolve();
    }
    pause() {
      this.paused = true;
    }
    removeAttribute() {}
    load() {}
  }
  const mod = { exports: {} };
  new Function(
    "require",
    "module",
    "exports",
    "window",
    "document",
    "Audio",
    "fetch",
    "setTimeout",
    "clearTimeout",
    "AbortController",
    compiled,
  )(
    (id) => (id === "react" ? hooks : { speechText: (text) => text }),
    mod,
    mod.exports,
    { speechSynthesis: { cancel() {} } },
    {},
    Media,
    (url, options) =>
      new Promise((resolve, reject) => requests.push({ url, options, resolve, reject })),
    (fn) => {
      const key = {};
      timers.set(key, fn);
      return key;
    },
    (key) => timers.delete(key),
    AbortController,
  );
  return {
    players,
    requests,
    render() {
      cursor = 0;
      return mod.exports.useStudyAudio();
    },
  };
}
const clip = {
  text: "Please arrive early.",
  src: "/speaking/assets/audio/test-annie.mp3",
  kind: "ai",
};
const settle = () => new Promise((resolve) => setImmediate(resolve));

test("음성 원고 불일치는 제작 음성이나 기기 음성으로 재생하지 않는다", () => {
  const h = harness();
  h.render().play("A different sentence.", clip);
  assert.equal(h.players.length, 0);
  assert.equal(h.requests.length, 0);
  assert.match(h.render().error, /원고가 일치하지/);
});
test("제작 음성 오류 후 401을 확인하면 재입장 경로를 제공한다", async () => {
  const h = harness();
  h.render().play(clip.text, clip);
  h.players[0].onerror();
  assert.equal(h.requests.length, 1);
  assert.equal(h.requests[0].options.method, "HEAD");
  h.requests[0].resolve({ status: 401 });
  await settle();
  assert.equal(h.render().playing, "");
  assert.equal(h.render().reentryRequired, true);
  assert.match(h.render().error, /접속 시간이 만료/);
  h.render().stop();
});
test("연결 실패와 404를 세션 만료로 오인하지 않는다", async () => {
  for (const status of [404, "offline"]) {
    const h = harness();
    h.render().play(clip.text, clip);
    h.players[0].onerror();
    if (status === "offline") h.requests[0].reject(new Error("offline"));
    else h.requests[0].resolve({ status });
    await settle();
    assert.equal(h.render().reentryRequired, false);
    assert.match(h.render().error, /인터넷 연결/);
    h.render().stop();
  }
});
test("다시 재생한 뒤 도착한 이전 401은 현재 재생과 화면을 바꾸지 않는다", async () => {
  const h = harness();
  h.render().play(clip.text, clip);
  h.players[0].onerror();
  const pending = h.requests[0];
  h.render().play(clip.text, clip);
  assert.equal(pending.options.signal.aborted, true);
  pending.resolve({ status: 401 });
  await settle();
  assert.equal(h.render().playing, clip.text);
  assert.equal(h.render().reentryRequired, false);
  assert.equal(h.render().error, "");
  h.render().stop();
});
