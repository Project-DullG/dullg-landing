import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const { parse } = require('next/dist/compiled/node-html-parser');
const origin = 'https://dullg-landing-one.vercel.app';
const slugs = ['island-snap', 'missing-log', 'island-market'];
const pages = ['index.html', ...slugs.flatMap(slug => ['index.html', 'table.html', 'print.html'].map(page => `${slug}/${page}`))];
const read = path => readFileSync(new URL(`../public/student-games/${path}`, import.meta.url), 'utf8');
const documents = new Map(pages.map(path => [path, parse(read(path))]));
const attr = (element, name) => element.getAttribute(name)?.replaceAll('&amp;', '&');

test('작품 모음부터 소개·실물 테이블·인쇄까지 중복 ID와 끊어진 내부 링크가 없다', () => {
  for (const [path, doc] of documents) {
    const ids = doc.querySelectorAll('[id]').map(node => node.id);
    assert.equal(new Set(ids).size, ids.length, `${path}: 중복 ID`);
    for (const node of doc.querySelectorAll('[aria-controls], [aria-labelledby], [aria-describedby]')) {
      for (const name of ['aria-controls', 'aria-labelledby', 'aria-describedby']) {
        for (const id of (attr(node, name) || '').split(/\s+/).filter(Boolean)) {
          assert.ok(ids.includes(id), `${path}: ${name}가 가리키는 ${id} 누락`);
        }
      }
    }
    for (const link of doc.querySelectorAll('a[href]')) {
      const url = new URL(attr(link, 'href'), `${origin}/student-games/${path}`);
      if (url.origin !== origin || !url.hash || !url.pathname.startsWith('/student-games/')) continue;
      const targetPath = url.pathname.slice('/student-games/'.length);
      const target = documents.get(targetPath);
      // Download links and external application routes have separate asset/route tests.
      if (!target) continue;
      const id = decodeURIComponent(url.hash.slice(1));
      assert.ok(target.querySelectorAll('[id]').some(node => node.id === id), `${path}: ${url.pathname}#${id} 누락`);
    }
  }
});

for (const slug of slugs) {
  test(`${slug}: 소개의 투표 링크는 현재 작품을 선택한 작품 모음으로 복귀한다`, () => {
    for (const page of ['index.html']) {
      const links = documents.get(`${slug}/${page}`).querySelectorAll('a[href]').map(node => new URL(attr(node, 'href'), `${origin}/student-games/${slug}/${page}`))
        .filter(url => url.pathname === '/student-games/index.html' && url.hash === '#vote');
      assert.ok(links.length, `${page}: 투표 복귀 링크`);
      for (const url of links) {
        assert.equal(url.searchParams.get('participate'), '1');
        assert.equal(url.searchParams.get('pick'), slug);
      }
    }
  });

  test(`${slug}: 공유 메타데이터는 현재 소개 URL과 실제 공개 이미지를 가리킨다`, () => {
    const doc = documents.get(`${slug}/index.html`);
    const expected = `${origin}/student-games/${slug}/index.html`;
    assert.equal(attr(doc.querySelector('link[rel="canonical"]'), 'href'), expected);
    assert.equal(attr(doc.querySelector('meta[property="og:url"]'), 'content'), expected);
    assert.equal(attr(doc.querySelector('meta[name="twitter:card"]'), 'content'), 'summary_large_image');
    for (const selector of ['meta[property="og:image"]', 'meta[name="twitter:image"]']) {
      const image = new URL(attr(doc.querySelector(selector), 'content'));
      assert.equal(image.origin, origin);
      const bytes = readFileSync(new URL(`../public${image.pathname}`, import.meta.url));
      assert.ok(bytes.length > 1024, `${selector}: 실제 이미지`);
    }
    assert.ok(attr(doc.querySelector('meta[property="og:image:alt"]'), 'content')?.trim());
    assert.ok(attr(doc.querySelector('meta[name="description"]'), 'content')?.trim());
  });

  test(`${slug}: 접힌 전시물의 직접 링크와 해시 변경은 대상 조상만 펼친다`, () => {
    const doc = parse(read(`${slug}/index.html`));
    const nodes = doc.querySelectorAll('*');
    const details = nodes.filter(node => node.tagName === 'DETAILS');
    assert.ok(details.length);
    const closestDetails = node => {
      for (let current = node; current; current = current.parentNode) {
        if (current.tagName === 'DETAILS') return current;
      }
      return null;
    };
    for (const node of nodes) {
      node.closest = selector => { assert.equal(selector, 'details'); return closestDetails(node); };
      Object.defineProperty(node, 'parentElement', { get: () => node.parentNode });
      if (node.tagName === 'DETAILS') node.open = false;
      node.scrollIntoView = options => { node.scrolled = options; };
    }
    const targets = nodes.filter(node => node.id && closestDetails(node));
    assert.ok(targets.length, '접힌 전시물의 실제 ID');
    const listeners = new Map(), frames = [];
    const location = { hash: `#${encodeURIComponent(targets[0].id)}` };
    const context = {
      document: { getElementById: id => nodes.find(node => node.id === id) || null }, location,
      window: { addEventListener: (name, listener) => listeners.set(name, listener) },
      requestAnimationFrame: callback => frames.push(callback),
    };
    vm.runInNewContext(read(`${slug}/premium.mjs`), context);
    function verify(target) {
      const expected = new Set();
      for (let node = target; node; node = node.parentNode) if (node.tagName === 'DETAILS') expected.add(node);
      for (const detail of details) assert.equal(detail.open, expected.has(detail), `${target.id}: 관련된 details만 열기`);
      frames.splice(0).forEach(callback => callback());
      assert.equal(target.scrolled?.block, 'start');
    }
    verify(targets[0]);
    for (const target of targets.slice(1)) {
      details.forEach(detail => { detail.open = false; });
      location.hash = `#${encodeURIComponent(target.id)}`;
      listeners.get('hashchange')();
      verify(target);
    }
    details.forEach(detail => { detail.open = false; });
    for (const hash of ['#unknown-exhibit', '#%E0%A4%A']) {
      location.hash = hash;
      assert.doesNotThrow(() => listeners.get('hashchange')());
      assert.ok(details.every(detail => !detail.open));
      assert.equal(frames.length, 0);
    }
  });
}
