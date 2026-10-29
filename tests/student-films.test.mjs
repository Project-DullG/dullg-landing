import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const { parse } = require('next/dist/compiled/node-html-parser');
const filmSource = readFileSync(new URL('../public/student-games/film.mjs', import.meta.url), 'utf8');
const sampleManifest = () => ({ duration: 40, chapters: [
  { time: 0, title: '준비', thumbnail: 'intro-scenes/01.webp' },
  { time: 10, title: '직접 옮기기', thumbnail: 'intro-scenes/02.webp' },
] });

// A small media/DOM double executes the production module. No browser, account,
// network service or real video playback is involved in these state checks.
class Element {
  constructor(tag, doc, attrs = {}) {
    this.tagName = tag.toUpperCase(); this.ownerDocument = doc; this.attributes = new Map(Object.entries(attrs));
    this.children = []; this.parentNode = null; this.listeners = new Map(); this._text = '';
    this.style = { values: new Map(), setProperty(name, value) { this.values.set(name, value); }, getPropertyValue(name) { return this.values.get(name) || ''; } };
    this.classList = {
      contains: value => this.className.split(/\s+/).includes(value),
      add: (...values) => { this.className = [...new Set([...this.className.split(/\s+/).filter(Boolean), ...values])].join(' '); },
      remove: (...values) => { this.className = this.className.split(/\s+/).filter(value => !values.includes(value)).join(' '); },
    };
  }
  get className() { return this.getAttribute('class') || ''; }
  set className(value) { this.setAttribute('class', value); }
  get hidden() { return this.attributes.has('hidden'); }
  set hidden(value) { if (value) this.setAttribute('hidden', ''); else this.removeAttribute('hidden'); }
  get src() { return new URL(this.getAttribute('src') || '', this.ownerDocument.baseURI).href; }
  set src(value) { this.setAttribute('src', value); }
  get textContent() { return this._text + this.children.map(child => child.textContent).join(''); }
  set textContent(value) { this._text = String(value); this.children.forEach(child => { child.parentNode = null; }); this.children = []; }
  get controls() { return this.attributes.has('controls'); }
  setAttribute(key, value) { this.attributes.set(key, String(value)); }
  getAttribute(key) { return this.attributes.get(key) ?? null; }
  removeAttribute(key) { this.attributes.delete(key); }
  append(...nodes) {
    for (const node of nodes) { node.remove(); node.parentNode = this; this.children.push(node); }
  }
  before(node) {
    node.remove(); const at = this.parentNode.children.indexOf(this); node.parentNode = this.parentNode;
    this.parentNode.children.splice(at, 0, node);
  }
  remove() {
    if (this.parentNode) this.parentNode.children = this.parentNode.children.filter(child => child !== this);
    this.parentNode = null;
  }
  replaceChildren(...nodes) { this.children.forEach(child => { child.parentNode = null; }); this.children = []; this._text = ''; this.append(...nodes); }
  addEventListener(type, handler, options) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push({ handler, once: options?.once });
  }
  emit(type) {
    for (const item of [...(this.listeners.get(type) || [])]) {
      item.handler({ type, target: this, currentTarget: this });
      if (item.once) this.listeners.set(type, this.listeners.get(type).filter(candidate => candidate !== item));
    }
  }
  focus(options) { this.ownerDocument.activeElement = this; this.focusOptions = options; }
  matches(selector) {
    const match = selector.match(/^([a-z][\w-]*)?(?:\[([^=\]]+)(?:=["']?([^\]"']+)["']?)?\])?$/i);
    if (selector.startsWith('.')) return this.classList.contains(selector.slice(1));
    if (selector.startsWith('#')) return this.getAttribute('id') === selector.slice(1);
    return Boolean(match && (!match[1] || this.tagName.toLowerCase() === match[1].toLowerCase()) &&
      (!match[2] || this.attributes.has(match[2]) && (match[3] === undefined || this.getAttribute(match[2]) === match[3])));
  }
  querySelectorAll(selector) {
    const found = [];
    const visit = node => { for (const child of node.children) { if (child.matches(selector)) found.push(child); visit(child); } };
    visit(this); return found;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
}

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

async function filmFixture({ slug = 'island-snap', manifest = sampleManifest(), fetchFails = false } = {}) {
  const doc = { baseURI: `https://film.invalid/student-games/${slug}/index.html`, activeElement: null };
  doc.createElement = tag => new Element(tag, doc);
  const original = parse(readFileSync(new URL(`../public/student-games/${slug}/index.html`, import.meta.url), 'utf8'));
  function convert(node) {
    const element = new Element(node.tagName || 'root', doc, node.attributes || {});
    for (const child of node.childNodes || []) {
      if (child.nodeType === 1) element.append(convert(child));
      else if (child.nodeType === 3) { const text = new Element('text', doc); text.textContent = child.textContent; element.append(text); }
    }
    return element;
  }
  const root = convert(original);
  doc.querySelector = selector => root.querySelector(selector);
  doc.querySelectorAll = selector => root.querySelectorAll(selector);
  const video = doc.querySelector('video[data-tabletop-film]'), tools = doc.querySelector('[data-film-tools]');
  assert.ok(video && tools);
  Object.assign(video, { readyState: 0, duration: NaN, currentTime: 0, error: null, paused: true, playRequests: [], loadCalls: 0 });
  video.play = () => { const request = deferred(); video.playRequests.push(request); return request.promise; };
  video.load = () => { video.loadCalls++; video.readyState = 0; };
  const timers = new Map(); let nextTimer = 1;
  const fetches = [];
  await vm.runInNewContext(`(async()=>{${filmSource}\n})()`, { document: doc, URL, Promise,
    fetch: async url => { fetches.push(String(url)); return { ok: !fetchFails, json: async () => manifest }; },
    setTimeout: callback => { const id = nextTimer++; timers.set(id, callback); return id; },
    clearTimeout: id => timers.delete(id),
  });
  const chapterButtons = () => doc.querySelector('.film-chapters')?.children || [];
  return { doc, root, video, tools, timers, fetches, chapterButtons,
    invitation: doc.querySelector('.film-invitation'), retry: doc.querySelector('.film-retry'), feedback: doc.querySelector('.film-feedback'),
    fireTimers() { const pending = [...timers.values()]; timers.clear(); pending.forEach(callback => callback()); } };
}
const flush = async () => { await Promise.resolve(); await Promise.resolve(); };

for (const slug of ['island-snap', 'missing-log', 'island-market']) {
  test(slug + ': 실제 소개에는 공통 재생 초대 하나와 native 영상 조작·자막·글 설명이 남는다', async () => {
    const f = await filmFixture({ slug });
    assert.equal(f.doc.querySelectorAll('.film-invitation').length, 1);
    assert.equal(f.doc.querySelectorAll('.ml-film-cover').length, 0, '공통 초대 위에 예전 재생 덮개를 겹치지 않는다');
    assert.equal(f.video.controls, true);
    assert.equal(f.video.parentNode.className, 'film-screen');
    assert.ok(f.video.querySelector('track[kind="captions"]'));
    assert.ok(f.doc.querySelector('.intro-transcript'));
    assert.ok(f.doc.querySelector('.intro-media-downloads'));
    assert.equal(f.video.playRequests.length, 0, '페이지 접속은 자동 재생하지 않는다');
  });
}

test('초대를 누르면 metadata 전에도 사용자 재생을 요청하고 초점은 사라지는 버튼에서 영상으로 옮긴다', async () => {
  const f = await filmFixture(); f.invitation.focus(); f.invitation.emit('click');
  assert.equal(f.invitation.hidden, true); assert.equal(f.doc.activeElement, f.video);
  assert.equal(f.video.focusOptions.preventScroll, true);
  assert.equal(f.video.playRequests.length, 1); assert.equal(f.video.loadCalls, 1);
  f.video.readyState = 1; f.video.duration = 40; f.video.emit('loadedmetadata');
  assert.equal(f.video.currentTime, 0); assert.equal(f.video.playRequests.length, 1);
  f.video.emit('playing'); f.video.playRequests[0].resolve(); await flush();
  assert.equal(f.timers.size, 0); assert.equal(f.feedback.textContent, '');
});

test('지연된 장면 이동 뒤 native pause는 로딩 안내를 취소하며 metadata가 도착해도 다시 재생하지 않는다', async () => {
  const f = await filmFixture(); f.chapterButtons()[1].emit('click');
  assert.equal(f.video.playRequests.length, 1);
  f.video.emit('pause'); assert.equal(f.timers.size, 0);
  f.video.readyState = 1; f.video.duration = 40; f.video.emit('loadedmetadata'); f.fireTimers();
  assert.equal(f.video.currentTime, 10); assert.equal(f.video.playRequests.length, 1);
  assert.equal(f.feedback.textContent, '');
});

test('연속 장면 선택에서 오래된 재생 거절이 최신 요청의 상태를 덮어쓰지 않는다', async () => {
  const f = await filmFixture(); f.video.readyState = 1; f.video.duration = 40;
  f.chapterButtons()[0].emit('click'); f.chapterButtons()[1].emit('click');
  assert.equal(f.video.currentTime, 10); assert.equal(f.timers.size, 1);
  f.video.playRequests[0].reject(Object.assign(new Error('old rejection'), { name: 'NotAllowedError' })); await flush();
  assert.equal(f.retry.hidden, true); assert.match(f.feedback.textContent, /불러오는 중/);
  f.video.emit('playing'); f.video.playRequests[1].resolve(); await flush();
  assert.equal(f.feedback.textContent, ''); assert.equal(f.timers.size, 0);
});

test('재생 거절과 미디어 오류는 재시도 경로를 남기고 원래 선택한 장면을 유지한다', async () => {
  const f = await filmFixture(); f.video.readyState = 1; f.video.duration = 40;
  f.chapterButtons()[1].emit('click');
  f.video.playRequests[0].reject(Object.assign(new Error('blocked'), { name: 'NotAllowedError' })); await flush();
  assert.equal(f.retry.hidden, false); assert.match(f.feedback.textContent, /재생을 한 번 더/);
  assert.equal(f.timers.size, 0);
  f.retry.emit('click'); assert.equal(f.video.currentTime, 10); assert.equal(f.video.playRequests.length, 2);
  f.video.error = { code: 2 }; f.video.emit('error');
  assert.equal(f.retry.hidden, false); assert.match(f.feedback.textContent, /불러오지 못/);
});

test('끝난 영상은 처음부터 다시 보기로 돌아가고 장면 진행률과 현재 표시는 실제 시간에 따른다', async () => {
  const f = await filmFixture(); f.video.readyState = 1; f.video.duration = 40; f.video.currentTime = 15;
  f.video.emit('timeupdate');
  assert.equal(f.chapterButtons()[0].getAttribute('aria-current'), null);
  assert.equal(f.chapterButtons()[1].getAttribute('aria-current'), 'step');
  assert.equal(f.chapterButtons()[0].style.getPropertyValue('--chapter-progress'), '100%');
  assert.ok(parseFloat(f.chapterButtons()[1].style.getPropertyValue('--chapter-progress')) > 0);
  f.video.currentTime = 40; f.video.emit('ended');
  assert.equal(f.invitation.hidden, false); assert.match(f.invitation.textContent, /처음부터 다시/);
  f.invitation.emit('click'); assert.equal(f.video.currentTime, 0); assert.equal(f.video.playRequests.length, 1);
});

test('장면 썸네일은 같은 출처만 쓰고 실패해도 제목·시간·재생 버튼을 남긴다', async () => {
  const manifest = sampleManifest(); manifest.chapters[1].thumbnail = 'https://elsewhere.invalid/02.webp';
  const f = await filmFixture({ manifest });
  assert.equal(f.chapterButtons()[0].querySelectorAll('img').length, 1);
  assert.equal(f.chapterButtons()[1].querySelectorAll('img').length, 0);
  const button = f.chapterButtons()[0], image = button.querySelector('img');
  assert.equal(image.alt, ''); assert.equal(image.loading, 'lazy');
  image.emit('error'); assert.equal(button.querySelector('img'), null);
  assert.equal(button.classList.contains('has-still'), false);
  assert.ok(button.getAttribute('aria-label').includes('00:00'));
  button.emit('click'); assert.equal(f.video.playRequests.length, 1);
});

test('장면 목록 실패는 영상 자체의 native 조작과 재생 초대를 없애지 않는다', async () => {
  const f = await filmFixture({ fetchFails: true });
  assert.equal(f.chapterButtons().length, 0); assert.equal(f.video.controls, true);
  assert.match(f.feedback.textContent, /장면 목록/);
  f.invitation.emit('click'); assert.equal(f.video.playRequests.length, 1);
  assert.ok(f.doc.querySelector('.intro-media-downloads'));
});

function mediaBoxes(bytes, start = 0, end = bytes.length) {
  const boxes = [];
  for (let offset = start; offset < end;) {
    assert.ok(offset + 8 <= end, 'MP4 atom header');
    let size = bytes.readUInt32BE(offset), header = 8;
    if (size === 1) { assert.ok(offset + 16 <= end); size = Number(bytes.readBigUInt64BE(offset + 8)); header = 16; }
    if (size === 0) size = end - offset;
    assert.ok(Number.isSafeInteger(size) && size >= header && offset + size <= end, 'MP4 atom bounds');
    boxes.push({ type: bytes.toString('ascii', offset + 4, offset + 8), offset, content: offset + header, end: offset + size });
    offset += size;
  }
  return boxes;
}

for (const slug of ['island-snap', 'missing-log', 'island-market']) {
  test(`${slug}: 공개 영상·장면 이미지·자막·검증 메타는 같은 완성본이다`, async () => {
    const base = new URL(`../public/student-games/${slug}/assets/`, import.meta.url);
    const readAsset = name => readFileSync(new URL(name, base));
    const manifest = JSON.parse(readAsset('intro.chapters.json'));
    const proof = JSON.parse(readAsset('video-proof.json'));
    assert.equal(proof.format.format.filename, 'intro.mp4', '공개 검증 자료는 로컬 작업 경로를 남기지 않는다');
    assert.doesNotMatch(JSON.stringify(proof), /(?:\/Users\/|\/private\/|\.design-audit\/)/);
    const digest = bytes => createHash('sha256').update(bytes).digest('hex');
    for (const [key, file] of [['video', 'intro.mp4'], ['poster', 'tabletop-poster.webp'], ['captions', 'intro.ko.vtt'], ['chapters', 'intro.chapters.json']]) {
      assert.equal(proof.hashes[key], digest(readAsset(file)), `${file}: 다른 버전의 검증 메타`);
    }
    const video = readAsset('intro.mp4'), boxes = mediaBoxes(video);
    assert.equal(boxes[0].type, 'ftyp');
    const movie = boxes.find(box => box.type === 'moov'), data = boxes.find(box => box.type === 'mdat');
    assert.ok(movie && data && movie.offset < data.offset, '전체 다운로드 전 영상 메타를 읽을 수 있어야 한다');
    const dimensions = mediaBoxes(video, movie.content, movie.end).filter(box => box.type === 'trak').flatMap(track => {
      const header = mediaBoxes(video, track.content, track.end).find(box => box.type === 'tkhd');
      return header ? [[video.readUInt32BE(header.end - 8) / 65536, video.readUInt32BE(header.end - 4) / 65536]] : [];
    }).filter(([width, height]) => width > 0 && height > 0);
    assert.deepEqual(dimensions, [[manifest.width, manifest.height]], '실제 MP4 트랙 크기와 장면 메타');
    assert.ok(manifest.width >= 1920 && manifest.height >= 1080, '원문을 읽는 full HD 영상');
    const seconds = value => value.split(':').reduce((sum, part) => sum * 60 + Number(part), 0);
    const cues = [...readAsset('intro.ko.vtt').toString().matchAll(/(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})\n([\s\S]*?)(?=\n\n|$)/g)]
      .map(match => ({ start: seconds(match[1]), end: seconds(match[2]), lines: match[3].trim().split('\n') }));
    assert.equal(cues.length, manifest.chapters.length);
    assert.ok(cues.length > 0);
    const thumbnailPaths = new Set();
    for (const [index, chapter] of manifest.chapters.entries()) {
      assert.equal(chapter.time, index ? manifest.chapters[index - 1].end : 0);
      assert.ok(chapter.end > chapter.time && chapter.end <= manifest.duration);
      assert.equal(chapter.end, index === manifest.chapters.length - 1 ? manifest.duration : manifest.chapters[index + 1].time);
      assert.equal(cues[index].start, chapter.time); assert.equal(cues[index].end, chapter.end);
      assert.equal(cues[index].lines[0], chapter.title);
      assert.equal(cues[index].lines.slice(1).join('\n'), chapter.caption);
      assert.match(chapter.thumbnail, /^intro-scenes\/[\w-]+\.webp$/);
      assert.ok(!thumbnailPaths.has(chapter.thumbnail), '각 장면의 독립 썸네일');
      thumbnailPaths.add(chapter.thumbnail);
      assert.equal(proof.hashes.thumbnails[chapter.thumbnail], digest(readAsset(chapter.thumbnail)), '썸네일도 같은 검증 완성본이어야 한다');
      assert.ok(chapter.thumbnailTime >= chapter.time && chapter.thumbnailTime < chapter.end);
      const thumbnail = await sharp(readAsset(chapter.thumbnail)).metadata();
      assert.equal(thumbnail.format, 'webp');
      assert.ok(thumbnail.width > 0 && thumbnail.width <= 480);
      assert.ok(Math.abs(thumbnail.width / thumbnail.height - manifest.width / manifest.height) < .01);
    }
    assert.deepEqual(Object.keys(proof.hashes.thumbnails).sort(), [...thumbnailPaths].sort());
  });
}
