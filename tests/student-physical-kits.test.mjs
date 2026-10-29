import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';
import { validateKit, createPhysicalTableState } from '../public/student-games/physical-state.mjs';
import * as snapRules from '../public/student-games/island-snap/engine.mjs';
import * as marketRules from '../public/student-games/island-market/engine.mjs';
import { LOCATIONS, SOLUTION, LOCATION_BY_ID } from '../public/student-games/missing-log/content.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const publicRoot = join(root, 'public');
const gamesRoot = join(publicRoot, 'student-games');
const slugs = ['island-snap', 'missing-log', 'island-market'];
const load = (slug, suffix) => import(pathToFileURL(join(gamesRoot, slug, 'physical-kit.mjs')).href + '?kit-contract=' + suffix);
const modules = Object.fromEntries(await Promise.all(slugs.map(async slug => [slug, await load(slug, 'first')])));
const kits = Object.fromEntries(slugs.map(slug => [slug, modules[slug].default]));
const read = file => readFileSync(file, 'utf8');
const text = html => String(html).replace(/<[^>]*>/g, '')
  .replace(/&(?:amp|lt|gt|quot|nbsp);|&#39;|&#x27;/gi, value => ({
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&nbsp;': ' ', '&#39;': "'", '&#x27;': "'",
  })[value.toLowerCase()]).replace(/\s+/gu, '');
const includesText = (html, expected, label) => assert.ok(text(html).includes(text(expected)), label || expected);
const countClass = (html, name) => [...html.matchAll(/(?:^|\s)class\s*=\s*["']([^"']*)["']/g)]
  .filter(match => match[1].split(/\s+/).includes(name)).length;
const byId = kit => new Map(kit.pieces.map(piece => [piece.id, piece]));

for (const slug of slugs) {
  test(slug + ': 실제 구성품의 번호·봉투·회전 외곽과 인쇄 면을 검증한다', () => {
    const kit = kits[slug];
    assert.equal(validateKit(kit), true);
    assert.equal(new Set(kit.pieces.map(piece => piece.id)).size, kit.pieces.length);
    const model = createPhysicalTableState(kit);
    const markupIds = [];
    for (const piece of kit.pieces) {
      assert.equal(typeof piece.id, 'string');
      assert.ok(piece.label && piece.front.trim(), piece.id + ': 이름과 앞면');
      for (const html of [piece.front, piece.back || '']) {
        markupIds.push(...[...html.matchAll(/(?:^|\s)id\s*=\s*["']([^"']+)["']/g)].map(match => match[1]));
        for (const match of html.matchAll(/\bsrc\s*=\s*["']([^"']+)["']/g)) {
          const value = match[1].split(/[?#]/)[0];
          if (/^(?:[a-z]+:|\/\/)/i.test(value)) continue;
          const target = value.startsWith('/') ? join(publicRoot, value.slice(1)) : resolve(gamesRoot, slug, value);
          assert.ok(existsSync(target), piece.id + ': 그림 누락 ' + value);
        }
      }
      if (piece.hidden) continue;
      const state = model.get(piece.id), members = model.members(piece.id);
      const offset = members.length > 1 ? Math.min(members.indexOf(piece.id), 7) * .65 : 0;
      const angle = state.angle * Math.PI / 180;
      const width = Math.abs(Math.cos(angle)) * piece.width + Math.abs(Math.sin(angle)) * piece.height;
      const height = Math.abs(Math.sin(angle)) * piece.width + Math.abs(Math.cos(angle)) * piece.height;
      const x = state.x + offset + piece.width / 2, y = state.y + offset + piece.height / 2;
      assert.ok(x - width / 2 >= -1e-6 && y - height / 2 >= -1e-6 &&
        x + width / 2 <= kit.size.width + 1e-6 && y + height / 2 <= kit.size.height + 1e-6,
      piece.id + ': 회전·더미 두께를 포함한 외곽이 탁자 밖입니다.');
    }
    assert.equal(new Set(markupIds).size, markupIds.length, slug + ': 구성품 면의 중복 HTML id');
    // Component overlap is intentional: piles, cards on mats, and pieces on maps.
  });

  test(slug + ': 다시 불러온 키트의 순서·면·좌표·고유 번호가 동일하다', async () => {
    const second = (await load(slug, 'second')).default;
    assert.deepEqual(second, kits[slug]);
    const model = createPhysicalTableState(kits[slug]);
    const piece = kits[slug].pieces.find(item => !item.hidden && !item.locked);
    model.move(piece.id, 10, 10);
    model.note('round-trip-contract', '직접 적은 기록');
    assert.deepEqual(createPhysicalTableState(second, model.snapshot()).snapshot(), model.snapshot());
  });
}

test('스냅의 실제 60장과 공통 뒷면, 다섯 외침과 두 특수 동작은 원안과 같다', () => {
  const kitModule = modules['island-snap'], kit = kits['island-snap'];
  const cards = kit.pieces.filter(piece => piece.type === 'card');
  const inventory = kitModule.makeCards();
  assert.equal(cards.length, 60);
  assert.equal(inventory.length, 60);
  assert.deepEqual(cards.map(piece => piece.id).sort(), inventory.map(card => card.id).sort());
  assert.deepEqual(kitModule.CHANT, snapRules.CHANT.map(kind => snapRules.CARD_TYPES[kind].name));
  assert.equal(new Set(cards.map(piece => piece.back)).size, 1);
  const actual = byId(kit);
  for (const [kind, original] of Object.entries(snapRules.CARD_TYPES)) {
    const copies = inventory.filter(card => card.kind === kind);
    assert.equal(copies.length, original.count);
    assert.equal(kitModule.CARD_TYPES[kind].name, original.name);
    assert.equal(Boolean(kitModule.CARD_TYPES[kind].special), Boolean(original.special));
    for (const card of copies) {
      const piece = actual.get(card.id);
      assert.ok(piece.faceDown && piece.back);
      assert.ok(Math.abs(piece.width / piece.height - 63 / 88) < 1e-9);
      includesText(piece.front, original.name);
      if (kind === 'gull') includesText(piece.front, '양팔 두 번');
      if (kind === 'boat') includesText(piece.front, '탁자 두 번');
      const exposedLabel = text(piece.backLabel || '뒤집어 놓은 카드');
      assert.ok(!exposedLabel.includes(original.name), card.id + ': 뒷면 이름으로 종류 노출');
    }
  }
});

test('장터의 원안 154장, 요리 비용·가격·분류·소식·목표와 실제 구성품이 일치한다', () => {
  const kitModule = modules['island-market'], kit = kits['island-market'], pieces = byId(kit);
  const inventory = kitModule.getCardInventory();
  assert.equal(inventory.length, 154);
  assert.equal(new Set(inventory.map(card => card.id)).size, 154);
  for (const [category, expected] of [['material', 120], ['order', 12], ['news', 12], ['goal', 6], ['reservation', 4]]) {
    assert.equal(inventory.filter(card => card.category === category).length, expected, category);
  }
  assert.deepEqual(kitModule.MATERIALS.map(({ id, cardId, name }) => ({ id, cardId, name })),
    marketRules.MATERIALS.map(({ id, cardId, name }) => ({ id, cardId, name })));
  for (const key of ['RECIPES', 'NEWS', 'GOALS']) assert.deepEqual(kitModule[key], marketRules[key], key);
  for (const card of inventory) {
    const piece = pieces.get(card.id);
    assert.ok(piece, card.id + ': 실제 탁자에서 누락');
    assert.equal(piece.front, card.front);
    assert.equal(piece.back, card.back);
    assert.ok(Math.abs(piece.width / piece.height - 58 / 88) < 1e-9);
  }
  for (const material of marketRules.MATERIALS) {
    assert.equal(inventory.filter(card => card.material === material.id).length, 20);
  }
  for (const recipe of marketRules.RECIPES) {
    const face = pieces.get('order-' + recipe.id).front;
    includesText(face, recipe.name);
    includesText(face, String(recipe.base) + '냥');
    for (const [id, number] of Object.entries(recipe.needs)) {
      includesText(face, kitModule.MATERIALS.find(material => material.id === id).name + String(number));
    }
  }
  for (const news of marketRules.NEWS) assert.equal(inventory.filter(card => card.news === news.id).length, 2);
  for (const [value, copies] of Object.entries(kitModule.COIN_COUNTS)) {
    assert.equal(kit.pieces.filter(piece => piece.id.startsWith('coin-' + value + '-')).length, copies);
  }
  for (const id of ['round-track', 'round-marker', 'first-player', 'turn-pawn', 'trade-opportunity',
    'round-cooked', 'bank-slip', 'unused-envelope', 'round-reference', 'trade-reference']) assert.ok(pieces.has(id), id);
  for (let player = 1; player <= 4; player++) {
    const ledger = pieces.get('ledger-' + player);
    for (const recipe of marketRules.RECIPES) includesText(ledger.front, recipe.id);
  }
});

test('항해일지의 12개 원문·질문·정답·힌트는 실제 봉투 구성품에 모두 보존한다', () => {
  const kit = kits['missing-log'], pieces = byId(kit);
  for (const location of LOCATIONS) {
    const envelope = pieces.get(location.id + '-envelope');
    assert.deepEqual(new Set(envelope.contains), new Set([
      ...location.documents.map(doc => doc.id), location.id + '-question', location.id + '-check',
    ]));
    for (const doc of location.documents) {
      const piece = pieces.get(doc.id);
      assert.ok(piece.hidden);
      includesText(piece.front, doc.title);
      includesText(piece.front, doc.body);
    }
    const question = pieces.get(location.id + '-question');
    includesText(question.front, location.question.prompt);
    for (const option of location.question.options) includesText(question.front, option.text);
    const check = pieces.get(location.id + '-check');
    const answer = location.question.options.find(option => option.id === location.question.answerId).text;
    assert.ok(check.hidden && check.faceDown && check.back);
    includesText(check.front, answer);
    includesText(check.front, location.question.explanation);
    assert.ok(!text(check.back).includes(text(answer)), location.id + ': 확인 카드 뒷면의 정답 누출');
    location.hints.forEach((hint, index) => {
      const piece = pieces.get(location.id + '-hint-' + (index + 1));
      includesText(piece.front, hint.title);
      includesText(piece.front, hint.text);
      assert.ok(piece.faceDown && piece.back);
      assert.ok(!text(piece.back).includes(text(hint.text)));
    });
  }
});

test('힌트 1단계가 더미 위에 있고 최종 정답은 장소 봉투와 분리해 가린다', () => {
  const kit = kits['missing-log'], pieces = byId(kit), model = createPhysicalTableState(kit);
  assert.equal(kit.pieces.filter(piece => /^hint-token-\d+$/.test(piece.id)).length, 6);
  for (const location of LOCATIONS) {
    const first = location.id + '-hint-1';
    assert.equal(model.members(first).length, 2);
    assert.equal(model.members(first).at(-1), first);
  }
  const ids = ['final-answer', 'final-exhibition', 'final-cause', 'final-evidence', 'final-correction'];
  assert.deepEqual(new Set(pieces.get('final-envelope').contains), new Set([...ids, 'epilogue', 'memory']));
  for (const id of [...ids, 'epilogue']) assert.ok(pieces.get(id).hidden && pieces.get(id).faceDown && pieces.get(id).back, id);
  const names = order => order.map(id => LOCATION_BY_ID[id].shortName).join(' → ');
  includesText(pieces.get('final-answer').front, names(SOLUTION.travelOrder));
  includesText(pieces.get('final-exhibition').front, names(SOLUTION.exhibitionOrder));
  includesText(pieces.get('final-cause').front, SOLUTION.explanation[2]);
  for (const id of ids) {
    assert.ok(!text(pieces.get(id).back).includes(text(names(SOLUTION.travelOrder))));
  }
  assert.deepEqual(Object.keys(modules['missing-log'].PRINT_SIZES).sort(), kit.pieces.map(piece => piece.id).sort());
  for (const piece of kit.pieces) {
    const [width, height] = modules['missing-log'].PRINT_SIZES[piece.id];
    assert.ok(Math.abs(width / height - piece.width / piece.height) < 1e-9, piece.id + ': 인쇄 실물 비율');
  }
});

function moduleReferences(source, owner) {
  const ast = ts.createSourceFile(owner, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  assert.equal(ast.parseDiagnostics.length, 0, owner + ': JavaScript 구문');
  const imports = [];
  function visit(node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) imports.push(node.moduleSpecifier.text);
    if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
      ts.isIdentifier(node.expression) && node.expression.text === 'require')) {
      assert.ok(node.arguments.length === 1 && ts.isStringLiteralLike(node.arguments[0]), owner + ': 계산된 모듈 경로');
      imports.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return imports;
}
function resolveModule(reference, owner) {
  assert.ok(reference.startsWith('.') || reference.startsWith('/'), owner + ': 외부 모듈 ' + reference);
  return reference.startsWith('/') ? join(publicRoot, reference.split(/[?#]/)[0].slice(1)) :
    fileURLToPath(new URL(reference.split(/[?#]/)[0], pathToFileURL(owner)));
}
function visitModules(initial) {
  const queue = [...initial], seen = new Set();
  while (queue.length) {
    const file = queue.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    assert.ok(existsSync(file), '모듈 누락: ' + file);
    assert.ok(!/\/engine\.mjs$/.test(file), '수동 테이블에 엔진이 연결됐습니다: ' + file);
    assert.ok(!/\/(?:island-snap\/table|island-market\/market|missing-log\/app)\.mjs$/.test(file),
      '수동 테이블에 자동 진행 컨트롤러가 연결됐습니다: ' + file);
    for (const reference of moduleReferences(read(file), file)) queue.push(resolveModule(reference, file));
  }
  return seen;
}
test('새 기본 테이블·키트·출력의 전체 모듈 경로에 게임 엔진이나 자동 컨트롤러가 없다', () => {
  for (const slug of slugs) {
    const owner = join(gamesRoot, slug, 'table.html'), html = read(owner), roots = [];
    const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(match => /\btype=["']module["']/.test(match[1]));
    assert.ok(scripts.length > 0, slug + ': 수동 테이블 모듈');
    for (const script of scripts) {
      const source = script[1].match(/\bsrc=["']([^"']+)["']/)?.[1];
      if (source) roots.push(resolveModule(source, owner));
      else for (const reference of moduleReferences(script[2], owner)) roots.push(resolveModule(reference, owner));
    }
    const entryGraph = visitModules(roots);
    assert.ok(entryGraph.has(join(gamesRoot, slug, 'physical-kit.mjs')));
    assert.ok(entryGraph.has(join(gamesRoot, 'physical-table.mjs')));
    visitModules([join(gamesRoot, slug, 'physical-kit.mjs'), join(gamesRoot, slug, 'print.mjs')]);
    assert.ok(existsSync(join(gamesRoot, slug, 'assisted.html')), slug + ': 기존 자동 진행판 보존 경로');
  }
});

// Execute only the print serializers against a tiny output sink, not a browser
// or game UI. This verifies the actual generated sheets rather than loop text.
const printedMarkup = new Map();
async function printMarkup(slug) {
  if (printedMarkup.has(slug)) return printedMarkup.get(slug);
  const previous = { document: globalThis.document, window: globalThis.window };
  const elements = new Map();
  const noop = () => {};
  const element = selector => {
    if (!elements.has(selector)) elements.set(selector, {
      innerHTML: '', dataset: {}, classList: { add: noop, remove: noop, toggle: noop },
      addEventListener: noop, scrollIntoView: noop,
    });
    return elements.get(selector);
  };
  globalThis.document = {
    querySelector: element, querySelectorAll: () => [],
    body: { dataset: {}, classList: { add: noop, remove: noop, toggle: noop } },
  };
  globalThis.window = { print: noop, addEventListener: noop, matchMedia: () => ({ matches: false }) };
  try {
    await import(pathToFileURL(join(gamesRoot, slug, 'print.mjs')).href + '?print-contract=actual-sheets');
    const html = element(slug === 'island-snap' ? '#print-sheets' : '#print-content').innerHTML;
    printedMarkup.set(slug, html);
    return html;
  } finally {
    if (previous.document === undefined) delete globalThis.document; else globalThis.document = previous.document;
    if (previous.window === undefined) delete globalThis.window; else globalThis.window = previous.window;
  }
}
function attributes(source) {
  return Object.fromEntries([...source.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)]
    .map(match => [match[1], match[2] ?? match[3]]));
}
function physicalPrintCuts(html) {
  return [...html.matchAll(/<div\b(?=[^>]*\bclass="[^"]*\bmk-print-cut\b)([^>]*)>\s*<div\b([^>]*)>/g)]
    .map(match => {
      const cut = attributes(match[1]), original = attributes(match[2]);
      return {
        id: cut['data-physical-id'], side: cut['data-side'],
        cropX: Number(cut['data-crop-x']),
        widthMm: Number(cut.style.match(/width:([\d.]+)mm/)[1]),
        worldWidth: Number(original['data-world-width']), worldHeight: Number(original['data-world-height']),
        scale: Number(original.style.match(/scale\(([\d.]+)\)/)[1]),
      };
    });
}
function htmlElements(html, tag) {
  const stack = [], elements = [];
  for (const match of html.matchAll(new RegExp('<\\/?' + tag + '\\b[^>]*>', 'gi'))) {
    if (match[0].startsWith('</')) {
      const open = stack.pop();
      assert.ok(open, tag + ': 닫는 태그에 대응하는 시작 태그');
      elements.push({ ...open, inner: html.slice(open.end, match.index) });
    } else {
      stack.push({
        start: match.index, end: match.index + match[0].length, depth: stack.length,
        attributes: attributes(match[0]),
      });
    }
  }
  assert.equal(stack.length, 0, tag + ': 시작 태그가 모두 닫혀야 합니다.');
  return elements.sort((a, b) => a.start - b.start);
}
const hasClass = (element, name) => (element.attributes.class || '').split(/\s+/).includes(name);
const printSheets = (html, name) => htmlElements(html, 'section').filter(element => hasClass(element, name));
function mirroredRows(values, columns) {
  const mirrored = [];
  for (let start = 0; start < values.length; start += columns) mirrored.push(...values.slice(start, start + columns).reverse());
  return mirrored;
}
test('실제 인쇄 결과에 앞뒤 카드와 단계별 비밀 자료, 동전과 장날 트랙이 누락되지 않는다', async () => {
  const snap = await printMarkup('island-snap');
  const sheets = [...snap.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/g)];
  const fronts = sheets.filter(match => /aria-label="카드 앞면 /.test(match[1]));
  const backs = sheets.filter(match => /aria-label="카드 뒷면 /.test(match[1]));
  assert.ok(fronts.length > 0);
  assert.equal(backs.length, fronts.length);
  assert.equal(fronts.reduce((sum, sheet) => sum + countClass(sheet[2], 'print-card'), 0), 60);
  assert.equal(backs.reduce((sum, sheet) => sum + countClass(sheet[2], 'print-card'), 0), 60);
  assert.equal(countClass(snap, 'snapkit-print-seat'), 6);
  assert.equal(countClass(snap, 'snapkit-print-token'), 6);
  const market = await printMarkup('island-market');
  const marketKit = kits['island-market'], cuts = physicalPrintCuts(market);
  const cardIds = marketKit.pieces.filter(piece => piece.type === 'card').map(piece => piece.id).sort();
  const coinIds = marketKit.pieces.filter(piece => piece.id.startsWith('coin-')).map(piece => piece.id).sort();
  assert.equal(cardIds.length, 160, '원안 카드 154장과 참고 카드 6장');
  const sections = [...market.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/g)];
  for (const face of ['front', 'back']) {
    const counts = sections.filter(match => match[1].includes('data-print-section="' + face + '"'))
      .map(match => countClass(match[2], 'mk-print-card'));
    assert.equal(counts.reduce((sum, count) => sum + count, 0), 160, face + ': 카드 출력 총수');
    const printedCards = cuts.filter(cut => cut.side === face && cardIds.includes(cut.id)).map(cut => cut.id);
    assert.equal(new Set(printedCards).size, 160, face + ': 카드마다 한 번');
    assert.deepEqual(printedCards.sort(), cardIds, face + ': 실제 카드의 고유 번호');
    const printedCoins = cuts.filter(cut => cut.side === face && coinIds.includes(cut.id)).map(cut => cut.id);
    assert.equal(new Set(printedCoins).size, coinIds.length, face + ': 동전마다 한 번');
    assert.deepEqual(printedCoins.sort(), coinIds, face + ': 실제 동전의 고유 번호');
  }
  const worldPerMm = modules['island-market'].CARD_WIDTH / 58;
  const printScale = (96 / 25.4) / worldPerMm;
  for (const piece of marketKit.pieces) {
    const printed = cuts.filter(cut => cut.id === piece.id ||
      piece.id === 'bank-slip' && cut.id.startsWith('printed-bank-slip-'));
    const expectedFronts = piece.id === 'bank-slip' ? 8 :
      piece.id.startsWith('mat-') || piece.id === 'round-track' ? 2 : 1;
    assert.equal(printed.filter(cut => cut.side === 'front').length, expectedFronts, piece.id + ': 앞면 출력');
    assert.equal(printed.filter(cut => cut.side === 'back').length, piece.back ? 1 : 0, piece.id + ': 뒷면 출력');
    for (const cut of printed) {
      assert.equal(cut.worldWidth, piece.width, piece.id + ': 원본 폭');
      assert.equal(cut.worldHeight, piece.height, piece.id + ': 원본 높이');
      assert.ok(Math.abs(cut.scale - printScale) < 1e-9, piece.id + ': 공통 실물 배율');
    }
  }
  for (const id of ['round-track', ...marketKit.pieces.filter(piece => piece.id.startsWith('mat-')).map(piece => piece.id)]) {
    const piece = marketKit.pieces.find(item => item.id === id);
    const tiles = cuts.filter(cut => cut.id === id && cut.side === 'front').sort((a, b) => a.cropX - b.cropX);
    assert.equal(tiles[0].cropX, 0, id + ': 원본 시작점');
    assert.ok(Math.abs(tiles[0].widthMm * worldPerMm - tiles[1].cropX) < 1e-7, id + ': 조각 사이 틈이나 중복');
    assert.ok(Math.abs(tiles[1].cropX + tiles[1].widthMm * worldPerMm - piece.width) < 1e-7, id + ': 원본 끝점');
  }
  const mystery = await printMarkup('missing-log');
  assert.equal(countClass(mystery, 'mlk-fold-pair'), 12, '각각 접어 가리는 단계 힌트 8개와 장소 확인 카드 4개');
  assert.equal(countClass(mystery, 'mlk-map-half'), 2);
  for (const location of LOCATIONS) for (const doc of location.documents) includesText(mystery, doc.body);
  assert.ok(!mystery.includes('<textarea'), '인쇄 필기는 빈 기록선으로 제공해야 합니다.');
});

test('스냅 양면 출력은 카드·규칙서의 짝을 지키고 단면 부속품 뒤에는 빈 면을 둔다', async () => {
  const sheets = printSheets(await printMarkup('island-snap'), 'print-sheet');
  assert.ok(sheets.length > 0 && sheets.length % 2 === 0, '양면 전체 출력은 앞뒤 짝이 있어야 합니다.');
  let cardPairs = 0, rulePairs = 0, accessoryPairs = 0;
  for (let index = 0; index < sheets.length; index += 2) {
    const front = sheets[index], back = sheets[index + 1];
    assert.ok(!hasClass(front, 'print-backs'), '짝의 첫 페이지가 뒷면이면 안 됩니다.');
    if (countClass(front.inner, 'print-card')) {
      assert.ok(hasClass(back, 'print-backs'));
      const slots = sheet => htmlElements(sheet.inner, 'div').filter(element =>
        element.depth === 0 && !hasClass(element, 'sheet-footer'));
      const frontSlots = slots(front), backSlots = slots(back);
      assert.equal(backSlots.length, frontSlots.length);
      assert.equal(frontSlots.length % 3, 0);
      assert.deepEqual(backSlots.map(slot => hasClass(slot, 'print-card')),
        mirroredRows(frontSlots.map(slot => hasClass(slot, 'print-card')), 3), '카드와 빈 칸의 좌우 대응');
      const frontPage = front.attributes['aria-label'].match(/카드 앞면 (\d+)/)?.[1];
      const backPage = back.attributes['aria-label'].match(/카드 뒷면 (\d+)/)?.[1];
      assert.ok(frontPage && frontPage === backPage, '같은 카드 쪽의 앞뒤여야 합니다.');
      cardPairs++;
    } else if (hasClass(front, 'snapkit-rule-sheet')) {
      assert.ok(hasClass(back, 'snapkit-rule-sheet'), '규칙서 앞면 뒤에 다른 구성품이 오면 안 됩니다.');
      includesText(front.inner, '함께 읽는 규칙서 1 / 2');
      includesText(back.inner, '함께 읽는 규칙서 2 / 2');
      rulePairs++;
    } else {
      assert.ok(hasClass(front, 'snapkit-accessory-sheet') || hasClass(front, 'snapkit-seat-sheet'),
        '알 수 없는 단면 구성품입니다.');
      assert.ok(hasClass(back, 'snapkit-blank-back') && hasClass(back, 'print-backs'),
        '단면 부속품 뒤에는 앞면 전용 출력에서 숨겨지는 빈 뒷면이 필요합니다.');
      assert.equal(text(back.inner), '', '빈 뒷면에 잘라 쓸 다른 구성품이 없어야 합니다.');
      accessoryPairs++;
    }
  }
  assert.ok(cardPairs > 0 && accessoryPairs > 0);
  assert.equal(rulePairs, 1);
});

test('장터 양면 출력은 빈 슬롯까지 좌우 대응하고 모든 단면 지원물의 뒷면을 비운다', async () => {
  const sheets = printSheets(await printMarkup('island-market'), 'mk-print-sheet');
  const pieces = byId(kits['island-market']);
  const original = id => pieces.get(id) || (id.startsWith('printed-bank-slip-') ? pieces.get('bank-slip') : null);
  const blank = page => hasClass(page, 'mk-blank-back');
  const assertBlank = page => {
    assert.ok(blank(page), '다른 지원물을 뒷면에 인쇄하면 재단할 때 구성품이 훼손됩니다.');
    assert.equal(physicalPrintCuts(page.inner).length, 0, '빈 뒷면에는 구성품이 없어야 합니다.');
    assert.equal(countClass(page.inner, 'mk-print-cell'), 0);
  };
  const cells = page => htmlElements(page.inner, 'div').filter(element => hasClass(element, 'mk-print-cell'))
    .map(cell => {
      const cuts = physicalPrintCuts(cell.inner);
      assert.ok(cuts.length <= 1, '한 재단 칸에 여러 구성품을 겹쳐 출력하지 않습니다.');
      return cuts[0] || null;
    });
  assert.ok(sheets.length > 0 && sheets.length % 2 === 0, '양면 전체 출력은 앞뒤 짝이 있어야 합니다.');
  let pairedObjects = 0, blankBacks = 0, imposedPairs = 0, emptySlots = 0;
  for (let index = 0; index < sheets.length; index += 2) {
    const front = sheets[index], back = sheets[index + 1];
    assert.ok(!blank(front), '빈 뒷면이 다음 물건의 앞면 자리를 차지하면 안 됩니다.');
    if (hasClass(front, 'mk-imposed-sheet')) {
      const frontCells = cells(front);
      const columns = Number(front.inner.match(/grid-template-columns:repeat\((\d+),/)?.[1]);
      assert.ok(columns > 0 && frontCells.length % columns === 0);
      assert.ok(frontCells.some(Boolean));
      frontCells.filter(Boolean).forEach(cut => assert.equal(cut.side, 'front'));
      const expected = mirroredRows(frontCells.map(cut => {
        if (!cut) return null;
        const piece = original(cut.id);
        assert.ok(piece, cut.id + ': 실제 구성품에 대응해야 합니다.');
        return piece.back ? cut.id : null;
      }), columns);
      emptySlots += frontCells.filter(cut => !cut).length;
      if (expected.every(id => id === null)) {
        assertBlank(back); blankBacks++;
      } else {
        assert.ok(hasClass(back, 'mk-imposed-sheet'), '같은 재단 판의 뒷면이어야 합니다.');
        const backCells = cells(back);
        assert.equal(backCells.length, frontCells.length);
        backCells.filter(Boolean).forEach(cut => assert.equal(cut.side, 'back'));
        assert.deepEqual(backCells.map(cut => cut?.id || null), expected,
          '행별 좌우 반전은 카드와 동전의 빈 슬롯까지 보존해야 합니다.');
        pairedObjects++;
      }
      imposedPairs++;
    } else {
      const frontCuts = physicalPrintCuts(front.inner);
      assert.ok(frontCuts.length > 0, '단면 지원물이나 양면 종이의 실제 원본이 필요합니다.');
      frontCuts.forEach(cut => assert.equal(cut.side, 'front'));
      if (blank(back)) {
        assertBlank(back);
        assert.ok(frontCuts.every(cut => !original(cut.id)?.back),
          '뒷면이 있는 원본을 빈 면으로 대체하면 안 됩니다.');
        blankBacks++;
      } else {
        const backCuts = physicalPrintCuts(back.inner);
        assert.equal(frontCuts.length, 1);
        assert.equal(backCuts.length, 1);
        assert.equal(backCuts[0].id, frontCuts[0].id, '양면 종이 앞뒤는 같은 물건이어야 합니다.');
        assert.equal(backCuts[0].side, 'back');
        assert.equal(backCuts[0].cropX, frontCuts[0].cropX);
        assert.equal(backCuts[0].widthMm, frontCuts[0].widthMm);
        pairedObjects++;
      }
    }
  }
  assert.ok(imposedPairs > 0 && pairedObjects > 0 && blankBacks > 0 && emptySlots > 0,
    '카드·빈 슬롯·양면 종이·단면 지원물의 실제 짝을 모두 검사해야 합니다.');
});
