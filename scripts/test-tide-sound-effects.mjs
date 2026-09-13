import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const path = new URL('../components/tide-room/sound-effects.ts', import.meta.url);
let slots = [],
  cursor = 0;
const pending = [];
const react = {
  useRef(value) {
    const index = cursor++;
    return (slots[index] ||= { current: value });
  },
  useCallback(fn) {
    cursor++;
    return fn;
  },
  useEffect(fn, dependencies) {
    const index = cursor++,
      previous = slots[index];
    if (
      !previous ||
      dependencies.some(
        (value, i) => !Object.is(value, previous.dependencies[i]),
      )
    ) {
      pending.push(() => {
        previous?.cleanup?.();
        slots[index] = { dependencies, cleanup: fn() };
      });
    }
  },
};
const exports = {};
const js = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.CommonJS,
  },
}).outputText;
vm.runInThisContext('(function(exports, require) {' + js + '\n})')(
  exports,
  (name) => {
    assert.equal(name, 'react');
    return react;
  },
);
const { useSoundEffects: invokeSoundHook, soundForAction } = exports;
const listeners = new Set(),
  contexts = [];
let starts = 0,
  stops = 0;
const param = () => ({
  value: 0,
  setValueAtTime(value) {
    this.value = value;
  },
  linearRampToValueAtTime() {},
  exponentialRampToValueAtTime() {},
  setTargetAtTime(value) {
    this.value = value;
  },
});
const node = () => ({
  connect(next) {
    return next;
  },
  disconnect() {
    this.disconnected = true;
  },
});
const source = () => ({
  ...node(),
  onended: null,
  start() {
    starts++;
  },
  stop(at) {
    if (at === undefined) stops++;
  },
});
class FakeAudioContext {
  state = 'running';
  currentTime = 1;
  sampleRate = 1000;
  destination = node();
  gains = [];
  suspendCount = 0;
  resumeCount = 0;
  closeCount = 0;
  constructor() {
    contexts.push(this);
  }
  createGain() {
    const gain = { ...node(), gain: param() };
    this.gains.push(gain);
    return gain;
  }
  createBiquadFilter() {
    return { ...node(), frequency: param(), Q: param() };
  }
  createBuffer(channels, size) {
    return { getChannelData: () => new Float32Array(size) };
  }
  createBufferSource() {
    return source();
  }
  createOscillator() {
    return { ...source(), frequency: param() };
  }
  suspend() {
    this.suspendCount++;
    this.state = 'suspended';
    return Promise.resolve();
  }
  resume() {
    this.resumeCount++;
    this.state = 'running';
    return Promise.resolve();
  }
  close() {
    this.closeCount++;
    this.state = 'closed';
    return Promise.resolve();
  }
}
globalThis.window = { AudioContext: FakeAudioContext };
globalThis.document = {
  hidden: false,
  addEventListener(type, fn) {
    assert.equal(type, 'visibilitychange');
    listeners.add(fn);
  },
  removeEventListener(type, fn) {
    listeners.delete(fn);
  },
};
function renderHook(enabled, volume) {
  cursor = 0;
  const result = invokeSoundHook(enabled, volume);
  for (const effect of pending.splice(0)) effect();
  return result;
}
function unmount() {
  for (const slot of slots) slot?.cleanup?.();
  slots = [];
}
const tick = async () => {
  await Promise.resolve();
  await Promise.resolve();
};
let api = renderHook(false, 100);
api.play('paper');
assert.equal(
  contexts.length,
  0,
  '소리를 켜기 전에는 오디오 객체도 생성하지 않는다',
);
api = renderHook(true, 100);
assert.equal(contexts.length, 0, '소리를 켜기만 해서는 재생하지 않는다');
for (const kind of ['paper', 'evidence', 'door', 'confirm', 'knock']) {
  if (contexts[0]) contexts[0].currentTime += 0.5;
  api.play(kind);
}
assert.equal(starts, 12, '다섯 효과의 예정된 오디오 소스 수');
assert.equal(contexts[0].gains[0].gain.value, 0.12, '최대 효과음 볼륨');
const previousStarts = starts;
api.play('knock');
assert.equal(starts, previousStarts, '빠른 반복 클릭은 소리를 겹치지 않는다');
api = renderHook(true, 50);
assert.equal(contexts[0].gains[0].gain.value, 0.06, '개인 볼륨 50% 반영');
document.hidden = true;
for (const listener of listeners) listener();
assert.ok(stops > 0);
assert.equal(contexts[0].state, 'suspended');
api.play('door');
assert.equal(starts, previousStarts, '숨겨진 화면에서는 재생하지 않는다');
document.hidden = false;
for (const listener of listeners) listener();
assert.equal(
  contexts[0].state,
  'suspended',
  '다시 보이기만 해서는 자동 재생하지 않는다',
);
contexts[0].currentTime += 1;
api.play('door');
await tick();
assert.equal(starts, previousStarts + 2);
const stalePlay = api.play;
api = renderHook(false, 50);
const mutedStarts = starts,
  resumeCount = contexts[0].resumeCount;
api.play('paper');
stalePlay('paper');
await tick();
assert.equal(starts, mutedStarts);
assert.equal(
  contexts[0].resumeCount,
  resumeCount,
  '꺼진 뒤 이전 콜백도 오디오를 재개하지 않는다',
);
api = renderHook(true, 0);
api.play('paper');
assert.equal(starts, mutedStarts, '볼륨 0이면 아무 소스도 예약하지 않는다');
unmount();
assert.equal(contexts[0].state, 'closed');
assert.equal(listeners.size, 0);
assert.ok(contexts[0].gains[0].disconnected);

api = renderHook(true, 80);
api.play('evidence');
const pendingContext = contexts.at(-1);
pendingContext.state = 'suspended';
let releaseResume;
pendingContext.resume = () =>
  new Promise((resolve) => {
    releaseResume = () => {
      pendingContext.state = 'running';
      resolve();
    };
  });
pendingContext.currentTime += 1;
api.play('paper');
const beforeDisable = starts;
api = renderHook(false, 80);
releaseResume();
await tick();
assert.equal(
  starts,
  beforeDisable,
  '오디오 재개 대기 중 소리를 끄면 늦은 완료는 재생하지 않는다',
);
unmount();
window.AudioContext = class {
  constructor() {
    throw new Error('audio blocked');
  }
};
api = renderHook(true, 100);
assert.doesNotThrow(() => api.play('paper'));
unmount();
assert.equal(soundForAction('inspect:departure', true), 'paper');
assert.equal(soundForAction('inspect:rope', true), 'evidence');
assert.equal(soundForAction('open-rescue', true), 'mechanism');
assert.equal(soundForAction('close-rescue', true), 'mechanism');
assert.equal(soundForAction('open-rescue', false), null);
assert.equal(soundForAction('move:records', true), 'door');
assert.equal(soundForAction('map:270:arch', true), 'confirm');
for (const id of [
  'inspect:unknown',
  'move:unknown',
  'signal-input:1:2',
  'aperture:2',
  'listen',
  'question-response',
  'anything',
])
  assert.equal(soundForAction(id, true), null);
for (const id of [
  'inspect:departure',
  'inspect:rope',
  'move:records',
  'map:270:arch',
])
  assert.equal(soundForAction(id, false), null);
console.log(
  JSON.stringify({
    source: path,
    status: 'passed',
    scope:
      'TypeScript transpilation, pure mapping, mocked lifecycle; no browser or audio playback',
  }),
);
