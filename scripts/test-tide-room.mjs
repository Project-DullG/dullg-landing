import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { renderToString } from 'react-dom/server';
const root = process.cwd(),
  require = createRequire(import.meta.url),
  cache = new Map();
function load(file) {
  if (file.endsWith('.css')) return {};
  if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(file, 'utf8'));
  if (cache.has(file)) return cache.get(file).exports;
  const mod = { exports: {} };
  cache.set(file, mod);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    fileName: file,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const resolve = (ref) => {
    if (!ref.startsWith('.') && !ref.startsWith('@/')) return require(ref);
    const base = ref.startsWith('@/')
      ? path.join(root, ref.slice(2))
      : path.resolve(path.dirname(file), ref);
    const target = ['', '.ts', '.tsx', '.js', '.json']
      .map((ext) => base + ext)
      .find((p) => fs.existsSync(p) && fs.statSync(p).isFile());
    if (!target) throw new Error(base);
    return load(target);
  };
  vm.runInNewContext(
    code,
    {
      module: mod,
      exports: mod.exports,
      require: resolve,
      console,
      crypto: globalThis.crypto,
      process,
      setTimeout,
      clearTimeout,
      URL,
      Buffer,
    },
    { filename: file },
  );
  return mod.exports;
}
const e = load(path.join(root, 'components/tide-room/engine.ts'));
const c = load(path.join(root, 'components/tide-room/content.ts'));
let count = 0;
const test = (name, fn) => {
  fn();
  console.log('PASS ' + name);
  count++;
};
const route = [
  'move:pier',
  'inspect:rope',
  'inspect:departure',
  'jonah-brother',
  'move:records',
  'inspect:log',
  'inspect:chart',
  'inspect:safety',
  'inspect:samples',
  'inspect:relic-notes',
  'map:270:arch',
  'move:observatory',
  'inspect:old-notes',
  'inspect:salt',
  'present:mara:rope+log',
  'aim:arch',
  'listen',
  'signal-input:2:3',
  'signal-input:3:2',
  'question-response',
  'move:pier',
  'jonah-invite',
  'move:observatory',
  'jonah-confess',
  'mara-ready',
  'jonah-ready',
  'move:records',
  'clara-ready',
  'move:observatory',
  'open-rescue',
  'enter',
  'return',
  'close-rescue',
  'after:elliot',
];
function play(ids) {
  let state = e.initialState();
  const transcript = [];
  for (const id of ids) {
    const result = e.act(state, id);
    assert.ok(result.accepted, `${id}: ${result.text}`);
    state = result.state;
    transcript.push({ id, text: result.text });
  }
  return { state, transcript };
}
test('all evidence and actions have unique IDs and valid prerequisites', () => {
  assert.equal(new Set(c.evidence.map((x) => x.id)).size, c.evidence.length);
  assert.equal(new Set(e.actions.map((x) => x.id)).size, e.actions.length);
  const flags = new Set([
    ...e.actions.flatMap((x) => x.mark || []),
    'map-aligned',
    'mara-evidence-shown',
  ]);
  for (const a of e.actions) {
    for (const id of [...(a.gain || []), ...(a.needs || [])])
      assert.ok(c.clueById[id], `${a.id} / ${id}`);
    for (const f of a.flags || []) assert.ok(flags.has(f));
  }
});
test('both rescue endings are reachable and retain all discovered records', () => {
  for (const end of ['dismantle', 'seal']) {
    const { state } = play([...route, `end:${end}`]);
    assert.equal(state.ending, end);
    assert.equal(state.width, 0);
    assert.ok(e.has(state, 'rescue'));
    assert.ok(e.has(state, 'elliot-account'));
    assert.equal(state.found.length, c.evidence.length);
  }
});
test('withdrawal before rescue stays unresolved and leaks no rescue fact', () => {
  const { state } = play(['end:withdraw']);
  assert.equal(state.ending, 'withdraw');
  assert.equal(state.found.join(','), 'letter');
  assert.equal(e.act(state, 'move:records').accepted, false);
});
test('rescue, late testimony, and endings cannot be selected early', () => {
  for (const id of [
    'open-rescue',
    'enter',
    'return',
    'close-rescue',
    'after:elliot',
    'end:seal',
    'end:dismantle',
    'question-response',
    'signal-input:2:3',
    'jonah-confess',
    'mara-ready',
  ]) {
    const s = e.initialState(),
      r = e.act(s, id);
    assert.equal(r.accepted, false, id);
    assert.equal(r.state, s);
  }
});
test('one matching signal never grants a current responder', () => {
  const prefix = route.slice(0, route.indexOf('signal-input:3:2'));
  const { state } = play(prefix);
  assert.ok(!e.has(state, 'response'));
  const reply = e.act(state, 'question-response');
  assert.ok(reply.accepted);
  assert.ok(e.flag(reply.state, 'question-heard'));
  assert.ok(!e.has(reply.state, 'response'));
  const repeat = e.act(reply.state, 'signal-input:2:3');
  assert.equal(repeat.accepted, false);
  assert.ok(!e.has(repeat.state, 'response'));
  assert.equal(e.act(repeat.state, 'question-response').accepted, false);
});
test('signal order can be reversed and wrong aim can be corrected without loss', () => {
  const p = route.slice(0, route.indexOf('signal-input:2:3'));
  const { state } = play([...p, 'aim:stairs', 'signal-input:2:3'].slice(0, -1));
  assert.equal(e.act(state, 'signal-input:2:3').accepted, false);
  const r = play([
    ...p,
    'aim:stairs',
    'aim:arch',
    'signal-input:3:2',
    'signal-input:2:3',
    'question-response',
  ]);
  assert.ok(e.has(r.state, 'response'));
});
test('NPCs move only after receiving the relevant information', () => {
  let s = play(route.slice(0, route.indexOf('jonah-invite'))).state;
  assert.equal(e.npcPlace(s, 'jonah'), 'pier');
  s = e.act(s, 'jonah-invite').state;
  assert.equal(e.npcPlace(s, 'jonah'), 'observatory');
  assert.equal(e.npcPlace(s, 'clara'), 'records');
  assert.equal(e.npcPlace(e.initialState(), 'elliot'), null);
});
test('each distinct rescue preparation is necessary', () => {
  for (const missing of ['mara-ready', 'jonah-ready', 'clara-ready']) {
    const prefix = route
      .slice(0, route.indexOf('open-rescue'))
      .filter((id) => id !== missing);
    assert.equal(
      e.act(play(prefix).state, 'open-rescue').accepted,
      false,
      missing,
    );
  }
});
test('movement and closing cannot skip a person or rope in the passage', () => {
  for (const index of ['open-rescue', 'enter', 'return']) {
    const s = play(route.slice(0, route.indexOf(index) + 1)).state;
    assert.equal(e.act(s, 'move:pier').accepted, false);
    assert.equal(e.act(s, 'end:withdraw').accepted, false);
    if (index !== 'return')
      assert.equal(e.act(s, 'close-rescue').accepted, false);
    else assert.equal(e.act(s, 'close-rescue').accepted, true);
  }
});
test('Elliot confession is earned by asking after rescue', () => {
  const s = play(route.slice(0, route.indexOf('after:elliot'))).state;
  assert.ok(e.has(s, 'rescue'));
  assert.ok(!e.has(s, 'elliot-account'));
  assert.ok(e.has(e.act(s, 'after:elliot').state, 'elliot-account'));
});
test('different investigation orders remain playable', () => {
  for (const prefix of [
    [
      'move:records',
      'inspect:safety',
      'inspect:samples',
      'inspect:chart',
      'map:270:arch',
      'inspect:log',
    ],
    ['move:observatory', 'inspect:old-notes', 'inspect:salt'],
    ['move:pier', 'jonah-brother', 'inspect:departure'],
  ]) {
    const done = new Set(
      prefix.filter((id) => e.actionById[id]?.once || id.startsWith('map:')),
    );
    const { state } = play([
      ...prefix,
      ...route.filter((id) => !done.has(id)),
      'end:seal',
    ]);
    assert.equal(state.ending, 'seal');
  }
});
test('save replay reconstructs every checkpoint without impossible shortcuts', () => {
  for (let i = 0; i <= route.length; i++) {
    const ids = route.slice(0, i);
    const restored = e.replay(JSON.stringify({ version: 2, events: ids }));
    assert.equal(
      JSON.stringify(restored.state),
      JSON.stringify(play(ids).state),
    );
  }
  for (const raw of [
    '{}',
    'null',
    '{"version":1,"events":[]}',
    '{"version":2,"events":["enter"]}',
    '{"version":2,"events":["move:toString"]}',
    '{"version":2,"events":["__proto__"]}',
    '{"version":2,"events":[4]}',
  ])
    assert.throws(() => e.replay(raw));
});
test('initial render exposes investigation and accessible journal without the solution', () => {
  const { default: Game } = load(path.join(root, 'components/tide-room/game.tsx'));
  const html = renderToString(React.createElement(Game));
  assert.ok(html.includes('유리 너머의 목소리'));
  assert.ok(html.includes('aria-label="설정"'));
  assert.ok(html.includes('시작하면 음악과 효과음이 재생됩니다.'));
  assert.ok(html.includes('aria-label="소리 끄기"'));
  assert.ok(html.includes('/assets/tide-room/pier.webp'));
  assert.ok(!html.includes('내가 제한핀을 뽑았습니다'));
  assert.ok(!html.includes('엘리엇이 숨긴 설명'));
});

test('turning away from the dry chamber stops live contact but preserves evidence', () => {
  const s = play(route.slice(0, route.indexOf('jonah-confess'))).state;
  for (const aim of ['sea', 'stairs']) {
    const turned = e.act(s, 'aim:' + aim).state;
    assert.equal(e.npcPlace(turned, 'elliot'), null);
    assert.equal(e.act(turned, 'jonah-confess').accepted, false);
    assert.equal(e.act(turned, 'elliot-condition').accepted, false);
    assert.ok(!e.sceneText(turned).includes('이쪽 움직임'));
    assert.ok(e.has(turned, 'response'));
  }
});
test('closed cover and secured pin keep consistent descriptions', () => {
  const before = play(route.slice(0, route.indexOf('listen'))).state;
  assert.equal(before.width, 0);
  assert.ok(e.act(before, 'aim:arch').text.includes('덮개는 아직 닫혀'));
  const secured = play(route.slice(0, route.indexOf('mara-ready') + 1)).state;
  assert.ok(e.introduction(secured, 'mara').includes('고정한 제한핀'));
  assert.ok(!e.introduction(secured, 'mara').includes('주머니'));
});
test('withdrawal reports only the knowledge earned at that checkpoint', () => {
  const initial = e.act(e.initialState(), 'end:withdraw');
  assert.ok(initial.text.includes('어디 있는지 확인하지 못했다'));
  assert.ok(!initial.text.includes('반대편 응답자'));
  const known = play(route.slice(0, route.indexOf('jonah-invite'))).state;
  assert.ok(
    e.act(known, 'end:withdraw').text.includes('새 질문에 답하는 사람'),
  );
});
test('conclusions do not cite unseen records or repeat a pre-rescue request after return', () => {
  assert.ok(!c.clueById.salt.text.includes('안전줄과 같다'));
  assert.ok(!c.clueById.echo.text.includes('수첩에 적힌'));
  const before = play(
    route.slice(0, route.indexOf('present:mara:rope+log')),
  ).state;
  assert.ok(
    e.act(before, 'present:mara:rope+log').text.includes('발을 다쳤지만'),
  );
  const done = play(route).state;
  assert.equal(e.act(done, 'clara-letter').accepted, false);
});

test('runtime clue cards match the authored observations without author project data', () => {
 const p=load(path.join(root,'components/tide-room/clues.json'));
 assert.equal(p.clues.length,c.evidence.length);
 for(const clue of p.clues) assert.equal(c.clueById[clue.id].text,clue.observation);
 assert.deepEqual(Object.keys(p),['clues']);
});
const { transcript } = play([...route, 'end:seal']);
fs.writeFileSync(
  '/tmp/tide-room-test-transcript.md',
  transcript.map((x) => `## ${x.id}\n\n${x.text}`).join('\n\n'),
);
test('direct puzzle success actions cannot bypass a submitted evidence pair or map', () => {
  const before = play(
    route.slice(0, route.indexOf('present:mara:rope+log')),
  ).state;
  assert.equal(e.act(before, 'mara-confess').accepted, false);
  assert.equal(e.act(before, 'present:mara:rope+rope').accepted, false);
  assert.equal(e.act(before, 'present:mara:rope+salt').accepted, false);
  assert.equal(e.act(before, 'present:mara:log+rope').accepted, true);
  const map = play(['move:records', 'inspect:chart']).state;
  assert.equal(e.act(map, 'clara-map').accepted, false);
  for (const angle of [0, 90, 180])
    assert.equal(e.act(map, `map:${angle}:arch`).accepted, false);
  for (const aim of ['sea', 'stairs'])
    assert.equal(e.act(map, `map:270:${aim}`).accepted, false);
  assert.ok(e.has(e.act(map, 'map:270:arch').state, 'bearing'));
});
test('any two distinct valid lamp patterns work, repetitions and invalid numbers do not', () => {
  const prefix = route.slice(0, route.indexOf('signal-input:2:3'));
  const before = play(prefix).state;
  for (const id of [
    'signal-input:0:3',
    'signal-input:5:1',
    'signal-input:1:2:3',
  ])
    assert.equal(e.act(before, id).accepted, false);
  const first = e.act(before, 'signal-input:1:1').state;
  assert.equal(e.act(first, 'signal-input:1:1').accepted, false);
  assert.ok(!e.has(e.act(first, 'question-response').state, 'response'));
  const second = e.act(first, 'signal-input:4:4').state;
  assert.ok(e.has(e.act(second, 'question-response').state, 'response'));
});
test('dangerous width is blocked and opening can be cancelled only before crossing', () => {
  const prefix = route.slice(0, route.indexOf('enter'));
  const opened = play(prefix).state;
  assert.equal(e.act(opened, 'aperture:3').accepted, false);
  const cancelled = e.act(opened, 'aperture:0');
  assert.ok(cancelled.accepted);
  assert.equal(cancelled.state.rescue, 0);
  assert.equal(cancelled.state.width, 0);
  assert.ok(e.act(cancelled.state, 'move:pier').accepted);
  for (const step of ['enter', 'return']) {
    const s = play(route.slice(0, route.indexOf(step) + 1)).state;
    assert.equal(e.act(s, 'aperture:0').accepted, false);
    assert.equal(e.act(s, 'aperture:1').accepted, false);
  }
});
test('repeated harmless revisits cannot grow a save beyond its replay limit', () => {
  const repeated = [];
  for (let i = 0; i < 3500; i++) repeated.push('move:records', 'move:pier');
  const compact = e.compactEvents(repeated);
  assert.equal(compact.length, 0);
  const withRoute = e.compactEvents([...repeated, ...route]);
  assert.equal(
    JSON.stringify(
      e.replay(JSON.stringify({ version: 2, events: withRoute })).state,
    ),
    JSON.stringify(play(route).state),
  );
});
test('late responsibility is not added without asking and Jonah follows his actual location', () => {
  const done = play(route.slice(0, route.indexOf('after:elliot'))).state;
  const end = e.act(done, 'end:dismantle');
  assert.ok(!end.text.includes('도움 요청을 이틀 미뤘다는 진술'));
  assert.ok(!end.text.includes('그는 요나에게 죽은 동생을'));
  const asked = e.act(done, 'mara-delay').state;
  assert.ok(
    e.act(asked, 'end:seal').text.includes('도움 요청을 이틀 미뤘다는 진술'),
  );
  const invited = play(route.slice(0, route.indexOf('jonah-confess'))).state;
  assert.ok(e.introduction(invited, 'jonah').includes('관측실'));
  assert.ok(!e.introduction(invited, 'jonah').includes('배에 묶인'));
});
test('fresh question and both signals converge in every order and replay identically', () => {
  const prefix = route.slice(0, route.indexOf('signal-input:2:3'));
  const orders = [
    ['question-response', 'signal-input:2:3', 'signal-input:3:2'],
    ['signal-input:2:3', 'question-response', 'signal-input:3:2'],
    ['signal-input:3:2', 'signal-input:2:3', 'question-response'],
  ];
  for (const order of orders) {
    const events = [...prefix, ...order];
    for (let i = 1; i < order.length; i++) {
      const partial = play([...prefix, ...order.slice(0, i)]).state;
      assert.ok(!e.has(partial, 'response'));
      assert.equal(e.npcPlace(partial, 'elliot'), null);
      assert.equal(e.act(partial, 'open-rescue').accepted, false);
    }
    const done = play(events).state;
    assert.ok(e.has(done, 'response'));
    assert.equal(done.found.filter((id) => id === 'response').length, 1);
    const restored = e.replay(JSON.stringify({ version: 2, events }));
    assert.equal(JSON.stringify(restored.state), JSON.stringify(done));
    const continuation = route.slice(
      route.indexOf('move:pier', route.indexOf('question-response')),
    );
    assert.equal(
      play([...events, ...continuation, 'end:seal']).state.ending,
      'seal',
    );
  }
  const s = play(prefix).state;
  for (const alteration of [
    'aim:sea',
    'aim:stairs',
    'aperture:0',
    'move:records',
  ]) {
    const changed = e.act(s, alteration).state;
    assert.equal(e.act(changed, 'question-response').accepted, false);
  }
});
test('map comparison supplies the missing symbol correspondence', () => {
  assert.ok(!/사각형/.test(c.clueById.safety.text));
  assert.ok(!/사각형.{0,20}마른/.test(c.clueById.chart.text));
  const { MapPuzzle } = load(path.join(root, 'components/tide-room/puzzles.tsx'));
  const state = play(['move:records', 'inspect:chart']).state;
  const html = renderToString(
    React.createElement(MapPuzzle, {
      state,
      perform: () => {
        throw Error('SSR must not act');
      },
    }),
  );
  const [fixed, overlay] = html.split('<g ');
  assert.ok(fixed.includes('석실') && fixed.includes('잠긴 복도'));
  assert.ok(!fixed.includes('□') && overlay.includes('□'));
  assert.ok(c.clueById.bearing.text.includes('사각형'));
});
test('withdrawal after an early reply retains that testimony without claiming completed trials', () => {
  const prefix = route.slice(0, route.indexOf('signal-input:2:3'));
  const { state } = play([...prefix, 'question-response', 'move:pier']);
  const result = e.act(state, 'end:withdraw');
  assert.ok(result.accepted);
  assert.ok(result.text.includes('식량에 관해 답했다'));
  assert.ok(result.text.includes('두 등불 신호를 모두 대조하지 않았고'));
  assert.ok(!result.text.includes('직접 말을 걸거나'));
  assert.ok(!e.has(result.state, 'response') && !e.has(result.state, 'rescue'));
});
test('Mara can explain the safer alternative, but unrelated evidence cannot unlock rescue', () => {
  const prefix = route.slice(0, route.indexOf('aim:arch'));
  const s = play(prefix).state;
  const explained = e.act(s, 'present:mara:safety');
  assert.ok(explained.accepted);
  assert.ok(explained.text.includes('눈금 2'));
  assert.ok(!e.has(explained.state, 'pin-confession'));
  assert.equal(e.act(explained.state, 'open-rescue').accepted, false);
  assert.ok(e.act(e.initialState(), 'present:clara:letter').accepted === false);
  const atClara = e.act(e.initialState(), 'move:records').state;
  assert.ok(e.act(atClara, 'present:clara:letter').accepted);
});
const presentation = load(path.join(root, 'components/tide-room/presentation.ts'));
test('room artwork follows cover state and never shows the chamber through a closed cover', () => {
  const obs = { ...e.initialState(), place: 'observatory' };
  assert.equal(
    presentation.backdrop(obs),
    '/assets/tide-room/observatory-closed.webp',
  );
  assert.equal(
    presentation.backdrop({ ...obs, width: 1, aim: 'sea' }),
    '/assets/tide-room/observatory-water.webp',
  );
  assert.equal(
    presentation.backdrop({ ...obs, width: 1, aim: 'arch' }),
    '/assets/tide-room/observatory-listening.webp',
  );
  assert.equal(
    presentation.backdrop({ ...obs, width: 2, aim: 'arch', rescue: 1 }),
    '/assets/tide-room/observatory.webp',
  );
  assert.equal(
    presentation.backdrop({ ...obs, width: 2, aim: 'arch', rescue: 2 }),
    '/assets/tide-room/chamber.webp',
  );
  assert.equal(
    presentation.backdrop({ ...obs, width: 0, rescue: 3 }),
    '/assets/tide-room/observatory-closed.webp',
  );
  assert.equal(
    presentation.backdrop({ ...obs, place: 'records', width: 1 }),
    c.places.records.image,
  );
});
test('detail selection preserves a selected evidence pair and rejects undiscovered evidence', () => {
  const found = ['letter', 'rope', 'log'];
  const pair = presentation.toggleEvidence(['rope'], 'log', found);
  assert.equal(pair.join('+'), 'rope+log');
  assert.equal(
    presentation.ensureEvidence(pair, 'rope', found).join('+'),
    'rope+log',
  );
  assert.equal(
    presentation.ensureEvidence(pair, 'salt', found).join('+'),
    'rope+log',
  );
  assert.equal(
    presentation.toggleEvidence(pair, 'rope', found).join('+'),
    'log',
  );
  assert.equal(presentation.toggleEvidence(pair, 'letter', found).length, 2);
  assert.ok(!presentation.canCompare({ ...e.initialState(), found }));
  assert.ok(
    presentation.canCompare({ ...e.initialState(), found: [...found, 'salt'] }),
  );
});
test('lamp animation repeats each submitted group exactly and cannot grant new evidence', () => {
  for (let first = 1; first <= 4; first++)
    for (let second = 1; second <= 4; second++) {
      const frames = presentation.lampFrames(first, second);
      for (const side of ['sent', 'reply']) {
        const visible = frames.filter((f) => f.side === side);
        const groups = [[]];
        for (const f of visible) {
          if (!f.on && f.ms === 700) groups.push([]);
          if (f.on) groups[groups.length - 1].push(f);
          assert.ok(f.ms >= 260);
        }
        assert.equal(groups[0].length, first);
        assert.equal(groups[1].length, second);
      }
    }
  for (const pair of [
    [0, 1],
    [2, 5],
    [1.5, 2],
    [NaN, 1],
  ])
    assert.equal(presentation.lampFrames(...pair).length, 0);
});
test('close-up art exists and evidence text remains the shared authored observation', () => {
  const { EvidenceView } = load(
    path.join(root, 'components/tide-room/evidence-view.tsx'),
  );
  for (const id of ['rope', 'salt']) {
    const html = renderToString(React.createElement(EvidenceView, { id }));
    assert.ok(html.includes(c.clueById[id].title));
    assert.ok(html.includes(presentation.detailImages[id].src));
    assert.ok(!html.includes(c.clueById.response.text));
  }
  const files = [
    'rope-detail.webp',
    'groove-detail.webp',
    'observatory-closed.webp',
    'observatory-water.webp',
    'observatory-listening.webp',
  ];
  for (const file of files) {
    const bytes = fs.readFileSync(path.join(root, 'public/assets/tide-room', file));
    assert.equal(bytes.subarray(0, 4).toString(), 'RIFF');
    assert.equal(bytes.subarray(8, 12).toString(), 'WEBP');
    assert.ok(
      bytes.length < 500_000,
      file + ' exceeds the evidence/room transfer budget',
    );
  }
});
test('nearby scenes preload without downloading all artwork and thumbnails stay small', () => {
  const assets = load(path.join(root, 'components/tide-room/scene-assets.ts'));
  const initial = e.initialState();
  const next = assets.nextSceneImages(initial, true);
  assert.ok(next.includes('/assets/tide-room/records-small.webp'));
  assert.ok(!next.some((p) => /chamber|rope-detail|listening/.test(p)));
  const full = assets.nextSceneImages(initial, false);
  assert.ok(full.includes('/assets/tide-room/records.webp'));
  assert.equal(assets.portraitImage('elliot'), null);
  for (const id of ['clara', 'mara', 'jonah']) {
    const src = assets.portraitImage(id, true);
    assert.ok(src.endsWith('-thumb.webp'));
    assert.ok(fs.statSync(path.join(root, 'public', src)).size < 10_000);
    for (const small of [false, true]) {
      const portraitPath = assets.portraitImage(id, small);
      assert.ok(portraitPath.includes('-cutout'));
      const bytes = fs.readFileSync(path.join(root, 'public', portraitPath));
      assert.equal(bytes.subarray(12, 16).toString(), 'VP8X');
      assert.ok(bytes[20] & 0x10, `${id} must retain the WebP alpha feature`);
      assert.ok(bytes.length < 120_000, `${id} portrait exceeds transfer budget`);
    }
  }
  for (const id of ['rope', 'salt']) {
    const src = assets.detailThumb(id);
    assert.ok(src.endsWith('-thumb.webp'));
    assert.ok(fs.statSync(path.join(root, 'public', src)).size < 10_000);
  }
  const html = renderToString(
    React.createElement(
      load(path.join(root, 'components/tide-room/game.tsx')).default,
    ),
  );
  assert.ok(
    html.includes('pier-small.webp') && html.includes('fetchPriority="high"'),
  );
  assert.ok(!html.includes('/assets/tide-room/pier.png'));
});
test('visual novel pages preserve the full Korean passage and original speakers', () => {
  const reading = load(path.join(root, 'components/tide-room/vn-reading.ts'));
  const prose = JSON.parse(
    fs.readFileSync(path.join(root, 'components/tide-room/prose.json')),
  );
  for (const text of Object.values(prose.actionTexts)) {
    const pages = reading.paginateText(text);
    assert.equal(pages.join(''), text);
    assert.ok(pages.every((p) => p.trim()));
  }
  for (const scene of prose.openingScenes) {
    const beats = reading.openingBeats(scene);
    assert.equal(
      beats
        .filter((b) => b.kind === 'narration')
        .map((b) => b.text)
        .join(''),
      scene.action,
    );
    assert.equal(
      JSON.stringify(
        beats
          .filter((b) => b.kind === 'dialogue')
          .map(({ speaker, text }) => ({ speaker, text })),
      ),
      JSON.stringify(scene.dialogue),
    );
    const notes = beats.filter(b => b.kind === 'note');
    assert.equal(notes.map(b => b.text).join(''), scene.newInformation);
    assert.ok(beats.every(b => b.text.trim()), 'optional summary must not create an empty page');
    assert.ok(
      beats.filter((b) => b.kind !== 'dialogue').every((b) => b.speaker === ''),
    );
  }
  const line = '나는 묻는다. “어느 배였나요?” 그녀가 장부를 펼친다.';
  assert.equal(reading.paginateText(line, 12).join(''), line);
  assert.equal(
    reading.paginateText('하나의 긴 문장을 도중에 끊지 않는다.', 4).length,
    1,
  );
});
test('novel reader only renders the supplied passage and exposes navigation', () => {
  const Reader = load(
    path.join(root, 'components/tide-room/novel-reader.tsx'),
  ).NovelReader;
  const html = renderToString(
    React.createElement(Reader, {
      title: '부두',
      speaker: '클라라',
      text: '아버지를 찾아 주세요.',
      kind: 'dialogue',
      page: 0,
      total: 2,
      onNext() {},
      onLog() {},
      nextLabel: '다음',
    }),
  );
  assert.ok(
    html.includes('아버지를 찾아 주세요.') && html.includes('지난 대화'),
  );
  assert.ok(!html.includes('제한핀') && !html.includes('엘리엇의 고백'));
  assert.ok(html.includes('aria-live="polite"'));
});
test('case summary only reveals observations earned at that checkpoint', () => {
  const { caseNotes } = load(path.join(root, 'components/tide-room/case-brief.tsx'));
  const initial = JSON.stringify(caseNotes(e.initialState()));
  assert.ok(initial.includes('9월 13일'));
  assert.ok(!/기침|귀환 뒤|제한핀|등불 시험/.test(initial));
  const later = JSON.stringify(caseNotes(play(route).state));
  assert.ok(later.includes('귀환 뒤 확인') && later.includes('지금 응답'));
});
test('scene observer recovers a cached image without waiting for a load event', () => {
  const { watchSceneImage } = load(
    path.join(root, 'components/tide-room/image-load.ts'),
  );
  const states = [];
  const img = {
    complete: true,
    naturalWidth: 800,
    addEventListener() {},
    removeEventListener() {},
  };
  watchSceneImage(img, (value) => states.push(value));
  assert.deepEqual(states, ['ready']);
});
test('scene observer reports a broken cached image', () => {
  const { watchSceneImage } = load(
    path.join(root, 'components/tide-room/image-load.ts'),
  );
  const states = [];
  watchSceneImage(
    {
      complete: true,
      naturalWidth: 0,
      addEventListener() {},
      removeEventListener() {},
    },
    (value) => states.push(value),
  );
  assert.deepEqual(states, ['error']);
});
test('slow image remains recoverable and an abandoned image cannot change the scene', () => {
  const { watchSceneImage } = load(
    path.join(root, 'components/tide-room/image-load.ts'),
  );
  const states = [],
    events = new Map();
  let tick;
  let cleared = 0;
  const image = {
    complete: false,
    naturalWidth: 0,
    addEventListener(k, fn) {
      events.set(k, fn);
    },
    removeEventListener(k) {
      events.delete(k);
    },
  };
  const cleanup = watchSceneImage(image, (s) => states.push(s), {
    set(fn, ms) {
      assert.equal(ms, 8000);
      tick = fn;
      return 1;
    },
    clear() {
      cleared++;
    },
  });
  tick();
  assert.deepEqual(states, ['loading', 'slow']);
  image.naturalWidth = 800;
  image.complete = true;
  events.get('load')();
  assert.deepEqual(states, ['loading', 'slow', 'ready']);
  assert.equal(events.size, 0);
  cleanup();
  const old = [];
  image.complete = false;
  const cancel = watchSceneImage(image, (s) => old.push(s), {
    set(fn) {
      tick = fn;
      return 2;
    },
    clear() {
      cleared++;
    },
  });
  const late = events.get('load');
  cancel();
  late();
  tick();
  assert.deepEqual(old, ['loading']);
  assert.ok(cleared > 0);
});
test('previous location comes from recorded movement without undoing discoveries', () => {
  const { previousPlace } = load(
    path.join(root, 'components/tide-room/presentation.ts'),
  );
  const commands = [
    'inspect:rope',
    'move:records',
    'inspect:log',
    'move:observatory',
  ];
  const before = JSON.stringify(commands);
  assert.equal(previousPlace(commands, 'observatory'), 'records');
  assert.equal(JSON.stringify(commands), before);
  assert.equal(previousPlace([], 'pier'), null);
});
test('start screen keeps the case and controls separate from settings and spoilers', () => {
  const html = renderToString(
    React.createElement(
      load(path.join(root, 'components/tide-room/game.tsx')).default,
    ),
  );
  assert.ok(html.includes('게임 안내') && html.includes('엘리엇 베일'));
  assert.ok(
    !html.includes('Ink in the Files') && !html.includes('이 기기의 진행 기록'),
  );
  assert.ok(!html.includes('익사와 실종 소재') && !html.includes('제한핀'));
  const guide = renderToString(
    React.createElement(
      load(path.join(root, 'components/tide-room/game-guide.tsx')).GameGuide,
    ),
  );
  for (const label of ['단서함', '조사할 곳', '수첩', '힌트', '지난 대화'])
    assert.ok(guide.includes(label));
  assert.ok(!guide.includes('마라가 덮개') && !guide.includes('토머스'));
});
test('reader resumes only the matching save and rejects invalid pages and malformed payloads',()=>{
 const {parseReaderState}=load(path.join(root,'components/tide-room/reader-state.ts'));
 const v={events:[],intro:0,introPage:0,entry:null,page:0,person:null,readLog:[]};
 assert.equal(parseReaderState(JSON.stringify(v),[]).intro,0);
 assert.equal(parseReaderState(JSON.stringify(v),['move:records']),null);
 for(const patch of [{intro:99},{introPage:999},{page:-1},{person:'intruder'},{entry:{text:12,speaker:'a'}},{intro:null,entry:{text:'한 문장.',speaker:'탐정'},page:999}]) assert.equal(parseReaderState(JSON.stringify({...v,...patch}),[]),null);
 for(const raw of [null,'{','null','x'.repeat(500001)]) assert.equal(parseReaderState(raw,[]),null);
 assert.equal(parseReaderState(JSON.stringify({...v,readLog:[{text:'확인했다.',speaker:'탐정'},{text:5}]}),[]).readLog.length,1);
});
test('ending recap does not direct the player back into a completed investigation',()=>{
 const {CaseBrief}=load(path.join(root,'components/tide-room/case-brief.tsx'));
 const html=renderToString(React.createElement(CaseBrief,{state:play([...route,'end:seal']).state,recap:true}));
 assert.ok(!html.includes('지금 확인할 일'));
 assert.ok(!html.includes('할 수 있는 일'));
 assert.ok(html.includes('현장에서 직접 확인'));
});
test('persona: a third evidence choice never silently replaces the selected pair',()=>{
 const found=['letter','rope','log'];
 assert.equal(presentation.toggleEvidence(['rope','log'],'letter',found).join('+'),'rope+log');
 assert.equal(presentation.toggleEvidence(['rope','log'],'rope',found).join('+'),'log');
});
test('persona: end review removes only the final choice and preserves every clue',()=>{
 for(const ending of ['seal','dismantle']){
   const events=[...route,'end:'+ending];
   const saved=e.replay(presentation.beforeEnding(events));
   assert.equal(saved.state.ending,null);
   assert.equal(saved.state.found.join(','),play(events).state.found.join(','));
   const alternate=ending==='seal'?'dismantle':'seal';
   assert.equal(e.act(saved.state,'end:'+alternate).accepted,true);
 }
 const withdrawn=e.replay(presentation.beforeEnding(['end:withdraw']));
 assert.equal(withdrawn.state.found.join(','),'letter');
 assert.equal(withdrawn.state.ending,null);
 assert.equal(presentation.beforeEnding(route),null);
 assert.equal(presentation.beforeEnding(['bogus','end:seal']),null);
});
test('persona: preparation checklist appears only after live contact and follows individual roles',()=>{
 assert.equal(presentation.rescueReadiness(e.initialState()).length,0);
 const s={...e.initialState(),found:['letter','response'],flags:['clara-ready']};
 assert.equal(presentation.rescueReadiness(s).map(x=>x.done).join(','),'true,false,false');
 assert.equal(presentation.rescueReadiness({...s,found:[...s.found,'rescue']}).length,0);
 assert.equal(presentation.rescueReadiness({...s,ending:'withdraw'}).length,0);
});
test('persona: the final dialogue button names the next actual action',()=>{
 assert.equal(presentation.dialogueNextLabel(false,true,false),'다음');
 assert.equal(presentation.dialogueNextLabel(true,true,false),'질문 고르기');
 assert.equal(presentation.dialogueNextLabel(true,false,false),'현장으로 돌아가기');
 assert.equal(presentation.dialogueNextLabel(true,true,true),'구조 계속하기');
});
test('persona: reading a clue and selecting it call separate actions',()=>{
 const {EvidenceCard}=load(path.join(root,'components/tide-room/evidence-card.tsx'));
 let reads=0, selections=0;
 const card=EvidenceCard({id:'letter',selected:false,onRead:()=>reads++,onSelect:()=>selections++});
 const buttons=React.Children.toArray(card.props.children);
 buttons[0].props.onClick();assert.equal(reads,1);assert.equal(selections,0);
 buttons[1].props.onClick();assert.equal(reads,1);assert.equal(selections,1);
 const html=renderToString(React.createElement(EvidenceCard,{id:'letter',selected:true,onRead(){},onSelect(){}}));
 assert.ok(html.includes('aria-pressed="true"'));assert.ok(html.includes('선택 해제'));assert.ok(html.includes('열어 읽기'));
});
test('persona: the current task advances after preparation and through each rescue step',()=>{
 const s={...e.initialState(),found:['letter','response'],flags:['clara-ready','mara-ready','jonah-ready']};
 assert.ok(presentation.objective(s).includes('준비가 끝났다'));
 assert.ok(presentation.objective({...s,width:2,rescue:1}).includes('통로를 건너'));
 assert.ok(presentation.objective({...s,width:2,rescue:2}).includes('부상자를'));
 assert.ok(presentation.objective({...s,width:2,rescue:3}).includes('안전줄을 회수'));
 assert.ok(presentation.objective({...s,ending:'withdraw'}).includes('조사를 마쳤다'));
});
test('editorial: factual anchors in evidence survive the prose revision',()=>{
 assert.ok(c.clueById.log.text.includes('19:40') && c.clueById.log.text.includes('19:46') && c.clueById.log.text.includes('19:47'));
 assert.ok(c.clueById.letter.text.includes('9월 13일') && c.clueById.letter.text.includes('사흘치'));
 assert.ok(c.clueById.funeral.text.includes('1891년 11월 3일'));
 for(const n of ['눈금 1','눈금 2','눈금 3']) assert.ok(c.clueById.safety.text.includes(n));
 const prose=load(path.join(root,'components/tide-room/prose.json'));
 assert.ok(prose.actionTexts['mara-confess'].includes('여덟 시 십 분'));
 assert.ok(prose.actionTexts['elliot-condition'].includes('왼발'));
 const before=play(route.slice(0,route.indexOf('present:mara:rope+log'))).state;
 const text=e.act(before,'present:mara:letter').text;
 assert.ok(!text.includes('{person}') && !text.includes('{clues}'));
 assert.ok(!text.includes('편지을'));
});
test('dialogue staging preserves prose and separates quoted speech without changing speakers',()=>{
 const {passageRuns,NovelReader}=load(path.join(root,'components/tide-room/novel-reader.tsx'));
 const text='클라라가 편지를 펼친다. “아버지를 찾아 주세요.” 그녀가 날짜를 짚는다.';
 const runs=passageRuns(text,'narration');
 assert.equal(runs.map(x=>x.text).join(''),text);
 assert.equal(runs.filter(x=>x.speech).length,1);
 assert.equal(passageRuns('아버지를 찾아 주세요.','dialogue')[0].speech,true);
 const html=renderToString(React.createElement(NovelReader,{title:'돌아오지 않은 아버지',speaker:'클라라',speakerRole:'엘리엇의 딸 · 의뢰인',portrait:'/assets/tide-room/clara-cutout.webp',text:'아버지를 찾아 주세요.',kind:'dialogue',page:0,total:1,onNext(){},onLog(){},nextLabel:'다음'}));
 assert.ok(html.includes('vn-speaker-portrait') && html.includes('엘리엇의 딸'));
 assert.ok(html.includes('blockquote') && html.includes('아버지를 찾아 주세요.'));
});
test('control instructions use a dedicated tutorial, with working start and back actions',()=>{
 const {InvestigationTutorial}=load(path.join(root,'components/tide-room/investigation-tutorial.tsx'));
 let started=0,previous=0;
 const view=InvestigationTutorial({onStart:()=>started++,onPrevious:()=>previous++});
 const children=React.Children.toArray(view.props.children);
 const actions=children.find(x=>x.props?.className==='tutorial-actions');
 const buttons=React.Children.toArray(actions.props.children);
 buttons[0].props.onClick();buttons[1].props.onClick();assert.equal(started,1);assert.equal(previous,1);
 const html=renderToString(view);assert.ok(html.includes('조작 안내') && html.includes('조사 시작'));
 assert.ok(!html.includes('vn-speaker') && !html.includes('blockquote'));
 assert.ok(html.includes('자료 읽기') && html.includes('인물에게 보여 주기') && html.includes('다른 장소로 이동하기'));
});
console.log(
  `${count} solo investigation checks passed. Automated routes, not human playtests.`,
);
