import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { illustration } from '../public/student-games/island-snap/art.mjs';
import { ingredientArt, dishArt } from '../public/student-games/island-market/art.mjs';
import { MATERIALS, RECIPES } from '../public/student-games/island-market/engine.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const publicRoot = join(root, 'public');
const gamesRoot = join(publicRoot, 'student-games');
const slugs = ['island-snap', 'missing-log', 'island-market'];
const read = file => readFileSync(file, 'utf8');
const resourceExtension = /\.(?:html|m?js|css|webp|png|jpe?g|svg|mp3|mp4|vtt|woff2?)(?:[?#]|$)/i;

function localFile(owner, reference) {
  if (/^(?:[a-z]+:|\/\/|#)/i.test(reference)) return null;
  const path = decodeURIComponent(reference.split(/[?#]/)[0]);
  if(path==='/icon.svg') return join(root, 'app/icon.svg');
  return path.startsWith('/') ? join(publicRoot, path.slice(1)) : resolve(dirname(owner), path);
}

function references(source) {
  return [
    ...source.matchAll(/\b(?:src|href|poster)\s*=\s*["']([^"']+)["']/g),
    ...source.matchAll(/\bfrom\s*["']([^"']+)["']/g),
    ...source.matchAll(/url\(\s*["']?([^\s)'";]+)/g),
  ].map(match => match[1]).filter(reference => !reference.includes('${') && resourceExtension.test(reference.split(/[?#]/)[0]));
}

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(file) : /\.(?:html|mjs|css)$/.test(entry.name) ? [file] : [];
  });
}

test('복귀 query와 해시의 파일명은 자산으로 보지 않고 실제 자산의 버전 query는 보존한다', () => {
  assert.deepEqual(references(`
    <a href="/logout?next=%2Fstudent-games%2Findex.html">로그아웃</a>
    <a href="/login?next=%2Fstudent-games%2Findex.html">로그인</a>
    <a href="#help.html">현재 문서 설명</a>
    <img src="assets/hero.webp?v=20261027">
    <link rel="stylesheet" href="style.css?v=quality-20261027">
    <a href="print.html#orders">인쇄 구성품</a>
  `), ['assets/hero.webp?v=20261027', 'style.css?v=quality-20261027', 'print.html#orders']);
});

test('세 게임의 소개·테이블·인쇄에서 사용하는 로컬 자산과 모듈이 존재한다', () => {
  const queue = [join(gamesRoot, 'index.html'), ...slugs.flatMap(slug => ['index.html', 'table.html', 'print.html'].map(page => join(gamesRoot, slug, page)))];
  const checked = new Set();
  while (queue.length) {
    const file = queue.pop();
    if (checked.has(file)) continue;
    checked.add(file);
    assert.ok(statSync(file).isFile(), `파일이어야 합니다: ${file}`);
    for (const reference of references(read(file))) {
      const target = localFile(file, reference);
      if (!target) continue;
      assert.ok(statSync(target, { throwIfNoEntry: false })?.isFile(), `${file}: ${reference} 누락`);
      if (['.mjs', '.js', '.css'].includes(extname(target))) queue.push(target);
    }
  }
});

test('학생 작품 모음은 Next에서 404가 나는 폴더 URL 대신 index.html로 연결한다', () => {
  const sources = [...sourceFiles(gamesRoot), join(root, 'components/student-game-showcase.tsx')];
  for (const file of sources) {
    assert.doesNotMatch(read(file), /\bhref\s*=\s*(?:\{\s*)?["']\/student-games\/?(?:[?#][^"']*)?["']/, `${file}: 작품 모음의 index.html을 명시하세요.`);
  }
});

test('세 소개 영상과 한국어 자막, 테이블 음악이 실제 파일에 연결된다', () => {
  for (const slug of slugs) {
    const directory = join(gamesRoot, slug);
    const intro = read(join(directory, 'index.html'));
    const table = read(join(directory, 'table.html'));
    assert.match(intro, /<video\b[^>]*>[\s\S]*?<source\b[^>]*src="assets\/intro\.mp4(?:\?[^"]*)?"/);
    assert.match(intro, /<track\b(?=[^>]*src="assets\/intro\.ko\.vtt(?:\?[^"]*)?")(?=[^>]*srclang="ko")[^>]*>/);
    assert.match(table, /<audio\b[^>]*src="assets\/music\.mp3"/);
    const video = readFileSync(join(directory, 'assets/intro.mp4'));
    assert.equal(video.subarray(4, 8).toString(), 'ftyp', `${slug}: MP4 컨테이너`);
    assert.match(read(join(directory, 'assets/intro.ko.vtt')), /^WEBVTT\s+[\s\S]*\d\d:\d\d:\d\d\.\d{3} --> /);
    assert.ok(statSync(join(directory, 'assets/music.mp3')).size > 1024, `${slug}: 음악 파일`);
  }
});

test('전체 작품 페이지와 학생 작품 모음에서 세 게임 소개와 테이블로 이어진다', () => {
  const works = read(join(root, 'app/works/page.tsx'));
  const showcase = read(join(root, 'components/student-game-showcase.tsx'));
  const collection = read(join(gamesRoot, 'index.html'));
  const catalog = read(join(root, 'lib/student-games.ts'));
  assert.match(works, /<StudentGameShowcase\s*\/>/);
  assert.match(showcase, /studentGames\.map\(/);
  assert.deepEqual([...catalog.matchAll(/\bslug:\s*["']([^"']+)["']/g)].map(match => match[1]), slugs);
  for (const page of ['index.html', 'table.html']) {
    assert.ok(showcase.includes(`/student-games/\${game.slug}/${page}`), `메인 작품 목록의 ${page} 연결`);
    for (const slug of slugs) {
      assert.ok(collection.includes(`href="${slug}/${page}"`), `작품 모음의 ${slug}/${page} 연결`);
      assert.ok(statSync(join(gamesRoot, slug, page)).isFile());
    }
  }
});


test('일곱 카드와 모든 장터 재료·요리가 실제 생성 일러스트 파일을 사용한다', () => {
  const rendered = [
    ...['squid', 'candy', 'leaves', 'dokdo', 'mountain', 'gull', 'boat'].map(illustration),
    ...MATERIALS.map(material => ingredientArt(material.id)),
    ...RECIPES.map(recipe => dishArt(recipe)),
  ];
  for (const markup of rendered) {
    const source = markup.match(/src="(\/student-games\/shared-art\/[^"$]+\.webp)"/)?.[1];
    assert.ok(source, '실제 카드용 일러스트를 연결해야 합니다');
    const bytes = readFileSync(join(publicRoot, source.slice(1)));
    assert.equal(bytes.subarray(0, 4).toString(), 'RIFF');
    assert.equal(bytes.subarray(8, 12).toString(), 'WEBP');
    assert.ok(bytes.length > 10_000, `${source}: 완성된 일러스트 파일`);
  }
});


test('테이블 시연 영상은 읽을 수 있는 장면 목록과 전체 배치 포스터를 갖춘다', () => {
  for(const slug of slugs){
    const dir=join(gamesRoot,slug);
    const html=read(join(dir,'index.html'));
    assert.match(html,/data-tabletop-film/);
    assert.match(html,/data-film-tools/);
    assert.match(html,/\/student-games\/film\.mjs/);
    const manifest=JSON.parse(read(join(dir,'assets/intro.chapters.json')));
    assert.ok(manifest.duration>=75&&manifest.duration<=110);
    assert.ok(manifest.width>=1280&&manifest.height>=720);
    assert.ok(manifest.chapters.length>=6);
    assert.equal(manifest.chapters[0].time,0);
    for(let i=0;i<manifest.chapters.length;i++){
      const chapter=manifest.chapters[i];
      assert.ok(chapter.title.trim().length>0);
      assert.ok(chapter.time>=0&&chapter.time<manifest.duration);
      if(i)assert.ok(chapter.time>manifest.chapters[i-1].time);
    }
    assert.ok(statSync(join(dir,'assets/tabletop-poster.webp')).size>10_000);
  }
});
