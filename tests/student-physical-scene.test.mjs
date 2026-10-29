import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { computeSceneView, wrapInkLines } from '../public/student-games/physical-scene.mjs';

const gamesRoot = fileURLToPath(new URL('../public/student-games/', import.meta.url));
const slugs = ['island-snap', 'island-market', 'missing-log'];
const sourceHash = (html, piece, zone = false) => createHash('sha256')
  .update(JSON.stringify([html, piece.width, piece.height, piece.type, zone])).digest('hex');
const finitePositive = value => Number.isFinite(value) && value > 0;

for (const slug of slugs) {
  const { default: kit } = await import(`../public/student-games/${slug}/physical-kit.mjs`);
  const atlasPath = join(gamesRoot, slug, 'assets/tabletop3d/atlas.json');
  const atlas = JSON.parse(readFileSync(atlasPath, 'utf8'));
  const faces = new Map();
  for (const piece of kit.pieces) {
    faces.set(`${piece.id}:front`, { piece, html: piece.front, zone: false });
    if (piece.back) faces.set(`${piece.id}:back`, { piece, html: piece.back, zone: false });
  }
  for (const [index, zone] of (kit.zones || []).entries()) {
    faces.set(`zone:${zone.id || index}:front`, {
      piece: zone, html: zone.html || `<span>${zone.label || ''}</span>`, zone: true,
    });
  }

  test(slug + ': 3D의 모든 면은 현재 실물 구성품 원문과 대응하고 비밀 자료도 공통 뒷면을 보존한다', () => {
    assert.equal(atlas.kitId, kit.id);
    assert.deepEqual(Object.keys(atlas.entries).sort(), [...faces.keys()].sort());
    for (const [key, { piece, html, zone }] of faces) {
      const entry = atlas.entries[key];
      assert.equal(entry.hash, sourceHash(html, piece, zone), key + ': 인쇄 원문과 다른 아틀라스');
      assert.equal(entry.worldWidth, piece.width, key + ': 실물 가로');
      assert.equal(entry.worldHeight, piece.height, key + ': 실물 세로');
      assert.ok(finitePositive(entry.scale), key + ': 축척');
      assert.ok(Math.abs(entry.width - piece.width * entry.scale) <= 1.001, key + ': 가로 축척');
      assert.ok(Math.abs(entry.height - piece.height * entry.scale) <= 1.001, key + ': 세로 축척');
      assert.ok(Number.isFinite(entry.radius) && entry.radius >= 0, key + ': 모서리');
      const sourceNotes = [...html.matchAll(/\bdata-note\s*=\s*["']([^"']+)["']/g)].map(match => match[1]).sort();
      assert.deepEqual(entry.notes.map(note => note.key).sort(), sourceNotes, key + ': 실제 필기 칸');
    }
    const concealed = kit.pieces.filter(piece => piece.faceDown && piece.back);
    assert.ok(concealed.length > 0, '뒤집어 놓은 실제 구성품이 있어야 한다');
    for (const piece of concealed) {
      const back = atlas.entries[`${piece.id}:back`];
      assert.equal(back.hash, sourceHash(piece.back, piece));
      assert.notEqual(back.hash, atlas.entries[`${piece.id}:front`].hash, piece.id + ': 앞뒤 혼동');
    }
  });

  test(slug + ': 실제 텍스처 크기 안에 면과 필기 칸이 들어가고 서로 다른 면이 겹치지 않는다', async () => {
    const images = new Map();
    for (const image of atlas.images) {
      assert.equal(typeof image.file, 'string');
      assert.ok(!image.file.includes('/') && !image.file.includes('\\'), '아틀라스는 같은 폴더의 파일이어야 한다');
      assert.ok(!images.has(image.file), '중복 아틀라스 파일');
      const actual = await sharp(join(dirname(atlasPath), image.file)).metadata();
      assert.equal(actual.format, image.file.endsWith('.png') ? 'png' : 'webp');
      if (image.file.startsWith('zone-')) assert.equal(actual.hasAlpha, true, '천 라벨은 투명 배경을 보존합니다.');
      assert.equal(actual.width, image.width, image.file + ': 가로');
      assert.equal(actual.height, image.height, image.file + ': 세로');
      images.set(image.file, image);
    }
    const byHash = new Map(), regions = new Map();
    for (const [key, entry] of Object.entries(atlas.entries)) {
      const image = images.get(entry.image);
      assert.ok(image, key + ': 그림 파일 누락');
      assert.ok([entry.x, entry.y, entry.width, entry.height].every(Number.isInteger), key + ': 픽셀 영역');
      assert.ok(entry.x >= 1 && entry.y >= 1 && finitePositive(entry.width) && finitePositive(entry.height));
      assert.ok(entry.x + entry.width < image.width && entry.y + entry.height < image.height, key + ': 그림 밖 면');
      const region = [entry.image, entry.x, entry.y, entry.width, entry.height];
      if (byHash.has(entry.hash)) assert.deepEqual(region, byHash.get(entry.hash), key + ': 같은 인쇄면의 중복 업로드');
      else byHash.set(entry.hash, region);
      const regionKey = JSON.stringify(region);
      if (regions.has(regionKey)) assert.equal(regions.get(regionKey).hash, entry.hash, key + ': 다른 면이 같은 영역 사용');
      else regions.set(regionKey, entry);
      for (const note of entry.notes) {
        assert.ok([note.x, note.y, note.width, note.height].every(Number.isFinite), key + ': 필기 좌표');
        assert.ok(note.x >= -1 && note.y >= -1 && finitePositive(note.width) && finitePositive(note.height));
        assert.ok(note.x + note.width <= entry.width + 1 && note.y + note.height <= entry.height + 1, key + ': 필기 칸이 면 밖');
        assert.ok(finitePositive(note.fontSize) && finitePositive(note.lineHeight), key + ': 필기 글자 크기');
        assert.ok(typeof note.defaultValue === 'string');
      }
    }
    const unique = [...regions.values()];
    for (let index = 0; index < unique.length; index++) for (const other of unique.slice(index + 1)) {
      const entry = unique[index];
      if (entry.image !== other.image) continue;
      const separated = entry.x + entry.width + 1 <= other.x || other.x + other.width + 1 <= entry.x ||
        entry.y + entry.height + 1 <= other.y || other.y + other.height + 1 <= entry.y;
      assert.ok(separated, '서로 다른 인쇄면 사이에 여백이 없다: ' + entry.hash + '/' + other.hash);
    }
    assert.deepEqual([...new Set(unique.map(entry => entry.image))].sort(), [...images.keys()].sort());
  });
}

const vector = (x, y, z) => ({ x, y, z });
const cross = (a, b) => vector(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
const unit = value => {
  const length = Math.hypot(value.x, value.y, value.z);
  return vector(value.x / length, value.y / length, value.z / length);
};
const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;

test('3D 전체보기는 세로·가로 화면과 회전한 시점에서도 탁자 네 모서리를 모두 담는다', () => {
  for (const [width, height] of [[1540, 1400], [3000, 2630], [2200, 1500]]) {
    for (const [viewportWidth, viewportHeight] of [[390, 844], [844, 390], [1440, 900]]) {
      const scale = Math.min((viewportWidth - 48) / width, (viewportHeight - 48) / height);
      const state = { x: (viewportWidth - width * scale) / 2, y: (viewportHeight - height * scale) / 2,
        scale, fitScale: scale, viewportWidth, viewportHeight };
      const before = structuredClone(state);
      const aspect = viewportWidth / viewportHeight;
      for (const tilt of [12, 29, 53]) for (const azimuth of [0, 45, 90, 180]) {
        const pose = computeSceneView(state, width, height, aspect, tilt * Math.PI / 180, azimuth * Math.PI / 180);
        const forward = unit(vector(pose.target.x - pose.position.x, pose.target.y - pose.position.y, pose.target.z - pose.position.z));
        const right = unit(cross(forward, vector(0, 1, 0))), up = cross(right, forward);
        for (const x of [0, width]) for (const z of [0, height]) {
          const delta = vector(x - pose.position.x, -pose.position.y, z - pose.position.z);
          const distance = dot(delta, forward), tangent = Math.tan(16 * Math.PI / 180);
          assert.ok(distance > 0);
          assert.ok(Math.abs(dot(delta, right) / (distance * tangent * aspect)) <= 1, '회전 후 가로 모서리 잘림');
          assert.ok(Math.abs(dot(delta, up) / (distance * tangent)) <= 1, '회전 후 세로 모서리 잘림');
        }
      }
      assert.deepEqual(state, before, '시점 계산이 물건 배치 상태를 변경하면 안 된다');
    }
  }
});

test('3D 필기는 한글·이모지와 빈 줄을 보존하며 인쇄 칸 너비로 줄바꿈한다', () => {
  const context = { measureText: value => ({ width: Array.from(value).length * 10 }) };
  const source = '울릉도 바다🌊\n\n기록 1';
  const lines = wrapInkLines(context, source, 30);
  assert.equal(lines.join(''), source.replace(/\n/g, ''));
  assert.ok(lines.includes(''), '의도한 빈 줄');
  assert.ok(lines.every(line => context.measureText(line).width <= 30));
});
