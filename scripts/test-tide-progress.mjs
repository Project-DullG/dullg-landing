import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const sourcePath = new URL('../components/tide-room/progress.ts', import.meta.url);
const save = (events) => JSON.stringify({ version: 2, events });
const engine = {
  SAVE_KEY: 'current',
  LEGACY_SAVE_KEY: 'legacy',
  initialState: () => ({ step: 0 }),
  compactEvents: (events) => [...events],
  act: (state, id) =>
    id === 'ok'
      ? {
          state: { step: state.step + 1 },
          accepted: true,
          text: '완료',
          speaker: '탐정',
        }
      : { state, accepted: false, text: '실패', speaker: '탐정' },
  replay: (raw) => {
    const parsed = JSON.parse(raw);
    if (
      parsed.version !== 2 ||
      !Array.isArray(parsed.events) ||
      parsed.events.some((id) => id !== 'ok')
    )
      throw new Error('invalid save');
    return {
      state: { step: parsed.events.length },
      events: [...parsed.events],
    };
  },
};
let slots = [],
  cursor = 0,
  effects = [];
const react = {
  useState(initial) {
    const i = cursor++;
    if (!slots[i])
      slots[i] = { value: typeof initial === 'function' ? initial() : initial };
    return [
      slots[i].value,
      (value) => {
        slots[i].value =
          typeof value === 'function' ? value(slots[i].value) : value;
      },
    ];
  },
  useRef(value) {
    const i = cursor++;
    return (slots[i] ||= { current: value });
  },
  useEffect(callback, deps) {
    const i = cursor++;
    if (!slots[i]) {
      slots[i] = { deps };
      effects.push(() => {
        slots[i].cleanup = callback();
      });
    }
  },
};
const exports = {};
const compiled = ts.transpileModule(fs.readFileSync(sourcePath, 'utf8'), {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.CommonJS,
  },
});
vm.runInThisContext(
  '(function(exports, require) {' + compiled.outputText + '\n})',
)(exports, (name) => {
  if (name === 'react') return react;
  assert.equal(name, './engine');
  return engine;
});
function storage(initial = {}) {
  return {
    data: new Map(Object.entries(initial)),
    reads: 0,
    writes: 0,
    denyRead: false,
    denyWrite: false,
    getItem(key) {
      this.reads++;
      if (this.denyRead) throw new Error('read denied');
      return this.data.get(key) ?? null;
    },
    setItem(key, value) {
      this.writes++;
      if (this.denyWrite) throw new Error('write denied');
      this.data.set(key, value);
    },
  };
}
let api;
function render() {
  cursor = 0;
  api = exports.useProgress();
  for (const effect of effects.splice(0)) effect();
  return api;
}
function unmount() {
  for (const slot of slots) slot?.cleanup?.();
  slots = [];
  effects = [];
}
async function mount(fake) {
  unmount();
  globalThis.localStorage = fake;
  render();
  assert.equal(api.ready, false);
  await Promise.resolve();
  render();
  assert.equal(api.ready, true);
}
let cases = 0;
let fake = storage({ current: save(['ok']) });
await mount(fake);
assert.equal(api.state.step, 1);
assert.equal(api.saveError, null);
assert.equal(api.notice, '저장한 지점부터 이어 할 수 있다.');
cases++;

fake.denyWrite = true;
api.perform('ok');
render();
assert.ok(api.saveError?.includes('저장하지 못했다'));
assert.equal(api.events.length, 2);
assert.equal(fake.data.get('current'), save(['ok']));
fake.denyWrite = false;
api.perform('ok');
render();
assert.equal(api.saveError, null);
assert.equal(api.notice, '진행 상황을 저장했다.');
assert.equal(fake.data.get('current'), save(['ok', 'ok', 'ok']));
cases++;

fake.denyWrite = true;
api.reset();
render();
assert.equal(api.state.step, 0);
assert.deepEqual(api.events, []);
assert.ok(api.saveError?.includes('저장하지 못했다'));
assert.equal(fake.data.get('current'), save(['ok', 'ok', 'ok']));
fake.denyWrite = false;
api.reset();
render();
assert.equal(api.saveError, null);
assert.equal(fake.data.get('current'), save([]));
cases++;

fake.denyWrite = true;
api.restore(save(['ok', 'ok']));
render();
assert.equal(api.state.step, 2);
assert.ok(api.saveError?.includes('저장하지 못했다'));
assert.equal(fake.data.get('current'), save([]));
fake.denyWrite = false;
api.restore(save(['ok', 'ok']));
render();
assert.equal(api.saveError, null);
assert.equal(fake.data.get('current'), save(['ok', 'ok']));
cases++;

const beforeInvalid = {
  events: [...api.events],
  data: fake.data.get('current'),
  error: api.saveError,
};
assert.throws(() => api.restore('broken import'));
render();
assert.deepEqual(api.events, beforeInvalid.events);
assert.equal(api.saveError, beforeInvalid.error);
assert.equal(fake.data.get('current'), beforeInvalid.data);
cases++;

fake = storage({ current: '{broken original\n' });
await mount(fake);
assert.equal(api.broken, '{broken original\n');
assert.ok(api.saveError?.includes('읽지 못했다'));
api.perform('ok');
render();
assert.equal(fake.writes, 0, '손상 원본은 자동 저장으로 덮어쓰지 않는다');
assert.equal(fake.data.get('current'), api.broken);
assert.ok(api.saveError);
fake.denyWrite = true;
api.restore(save(['ok', 'ok']));
render();
assert.ok(api.saveError?.includes('저장하지 못했다'));
assert.equal(fake.data.get('current'), '{broken original\n');
fake.denyWrite = false;
api.restore(save(['ok']));
render();
assert.equal(api.saveError, null);
assert.equal(api.broken, null);
assert.equal(fake.data.get('current'), save(['ok']));
cases++;

fake = storage({ current: save(['ok', 'ok']) });
fake.denyRead = true;
await mount(fake);
assert.ok(api.saveError?.includes('확인하지 못했다'));
assert.equal(api.broken, null);
api.perform('ok');
render();
assert.equal(fake.writes, 0, '읽지 못한 기존 기록을 자동으로 덮어쓰지 않는다');
fake.denyRead = false;
api.restore(save(['ok', 'ok']));
render();
assert.equal(api.saveError, null);
assert.equal(api.state.step, 2);
cases++;

fake = storage({ legacy: 'legacy original' });
await mount(fake);
assert.equal(api.saveError, null);
assert.ok(api.notice.includes('이전 판의 기록은 남아 있다'));
api.perform('ok');
render();
assert.equal(fake.data.get('legacy'), 'legacy original');
cases++;

unmount();
fake = storage();
globalThis.localStorage = fake;
render();
unmount();
await Promise.resolve();
assert.equal(fake.reads, 0, '해제된 hook의 대기 중 읽기는 취소한다');
cases++;
console.log(
  JSON.stringify({
    sourcePath,
    cases,
    status: 'passed',
    scope: 'Mock React hooks and storage; no browser',
  }),
);
