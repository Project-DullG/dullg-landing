# 공개 사이트 품질 개선 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 공개 사이트의 내용 결함(AI 이미지, 막힌 CTA), 기술 결함(태블릿 내비, SEO 메타, 404), 접근성 대비, CSS/데이터 구조를 정리하고 학원 운영 도구 소개 섹션을 추가한다.

**Architecture:** 먼저 Playwright 기준선 스크린샷과 죽은 CSS 검출 스크립트를 만든 뒤, `globals.css`를 시각 변화 없이 모듈로 분리·정리한다(각 단계마다 스크린샷 diff = 0 확인). 그 위에 `lib/` 데이터 단일화(경로·메타·펀딩 상태 계산), 페이지별 메타 헬퍼, 헤더·홈 구조 수정, 실제 자산으로 이미지 교체, CTA 통일, 대시보드 프리뷰 컴포넌트와 운영 도구 섹션을 얹는다. 마지막에 after 스크린샷 diff, tsc/lint/build/test로 검증한다.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, `next/font`, `next/og` (`ImageResponse`), Playwright(스크립트 전용, 캐시된 chromium 사용), `pixelmatch` + `pngjs`(diff), Node `node:test`.

**Spec:** `docs/superpowers/specs/2026-09-03-public-site-quality-design.md`

## Global Constraints

- 살아 있는 스타일의 값은 **대비 개선(§3.4)과 내비 브레이크포인트(§3.1)** 외에 바꾸지 않는다. 각 CSS 작업 후 스크린샷 diff로 증명한다.
- 수업팩 제목: 정식 `8시까지 두 열쇠`, 부제 `보충반의 사라진 열쇠`. 첫 언급 `8시까지 두 열쇠 — 보충반의 사라진 열쇠`, 이후 `8시까지 두 열쇠`. 상수는 `lib/education.ts`의 `episodeTitle`, `episodeSubtitle`, `episodeFullTitle`만 사용.
- 브랜드 표기: 메타·본문에서 `DullG` 단독 표기 금지 → `단서공방`. `ProjectDullG`는 `/about` 이력 설명과 `BRAND.englishName`에만.
- 제목 템플릿: `%s | 단서공방`. 루트 기본 제목 `단서공방 | 영어 미스터리 수업과 추리 콘텐츠`.
- 모바일 내비 브레이크포인트 **900px** 하나. 전체 브레이크포인트는 `560 / 760 / 900 / 1080` 4개, 표기는 `@media (max-width: Npx)`.
- 토큰 기준값: `--ink:#111412; --cream:#fff; --surface:#f6f7f5; --text-muted:#626762; --orange:#c96645; --header-h:64px`. `:root`는 `styles/tokens.css`에 한 번만.
- `!important`는 reduced-motion 블록 외 0건. CSS 줄 길이 ≤100, 선언 1줄 1개.
- 모든 import는 `@/` 별칭. JSX 한 줄 압축 금지(Prettier 기본 폭 100).
- 커밋 메시지 끝에 항상:
  ```
  Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01AHhhjDWjytSQ2NGTLs1j3w
  ```
- 개발 서버는 이미 `http://localhost:3000`에서 돌고 있을 수 있다(`lsof -iTCP:3000 -sTCP:LISTEN`). 스크린샷 스크립트는 3000번을 사용하되, 없으면 `npm run dev`를 백그라운드로 띄운다.
- 기존 테스트 `npm test`는 `next build` 후 `.next/server/app/*.html`을 읽는다. 빌드 산출물이 필요한 테스트는 Task 12에서 한 번에 돌린다. 중간 태스크에서는 `node --test tests/<file>.test.mjs`로 빌드 불필요한 테스트만 실행한다.

## File Structure

새로 만드는 파일:
- `scripts/screenshot-public.mjs` — 공개 경로 × 3폭 스크린샷 → `.design-audit/public-refactor/<label>/`
- `scripts/screenshot-diff.mjs` — before/after 픽셀 diff 요약 + diff PNG
- `scripts/css-dead-classes.mjs` — CSS 클래스 중 `.tsx`에 없는 것 목록 (테스트에서도 사용)
- `scripts/split-globals.mjs` — 일회용: 섹션 줄 범위로 `globals.css`를 `styles/*.css`로 쪼갬
- `styles/tokens.css`, `styles/base.css`, `styles/site.css`, `styles/pages/{home,works,academy,about,activity,materials,misc}.css`, `styles/dashboard.css`
- `lib/routes.ts` — 공개 경로 단일 출처 (`publicRoutes`, `routeMeta`)
- `lib/metadata.ts` — `pageMetadata()` 헬퍼
- `components/section-head.tsx` — Kicker→h2→p 블록
- `components/dashboard-preview.tsx` — CSS로 그린 축소 대시보드
- `app/not-found.tsx`, `app/error.tsx`, `app/opengraph-image.tsx`, `app/icon.svg`
- `tests/lib.test.mjs` — 빌드 불필요한 순수 함수 테스트
- `tests/css-hygiene.test.mjs` — 죽은 클래스 0건, `!important` 0건, `:root` 1회

수정하는 파일: `app/globals.css`(import 목록만 남김), `app/layout.tsx`, `app/page.tsx`, `app/academy/page.tsx`, `app/academy/sample/page.tsx`, `app/academy/curriculum/page.tsx`, `app/academy/pilot/page.tsx`, `app/episode/page.tsx`, `app/about/page.tsx`, `app/contact/page.tsx`, `app/privacy/page.tsx`, `app/works/page.tsx`, `app/works/[slug]/page.tsx`, `app/activity/page.tsx`, `app/activity/ulleung-high-living-lab/page.tsx`, `app/materials/page.tsx`, `app/materials/ulleung-high-living-lab/page.tsx`, `app/sitemap/page.tsx`, `app/sitemap.ts`, `components/header.tsx`, `components/site.tsx`, `components/form-section.tsx`, `components/presentation-viewer.tsx`, `lib/education.ts`, `lib/funding.ts`, `lib/activities.ts`, `lib/works.ts`, `lib/navigation.ts`, `tests/rendered-html.test.mjs`, `.gitignore`, `package.json`(devDependencies).

삭제: `components/curriculum-explorer.tsx`, `app/activity.css`, `app/work-detail.css`, `app/responsive.css`, `public/og.webp`, `public/og.png`, `public/favicon.svg`(→ `app/icon.svg`로 대체), §2.2 목록의 미참조 이미지.

---

### Task 1: 스크린샷·diff·죽은 CSS 도구와 기준선

**Files:**
- Create: `scripts/screenshot-public.mjs`, `scripts/screenshot-diff.mjs`, `scripts/css-dead-classes.mjs`
- Modify: `.gitignore`, `package.json`
- Test: 수동 실행 결과 확인

**Interfaces:**
- Produces: `node scripts/screenshot-public.mjs <label>` → `.design-audit/public-refactor/<label>/<route>-<width>.png`
- Produces: `node scripts/screenshot-diff.mjs <beforeLabel> <afterLabel>` → 표준출력에 경로별 변경 픽셀 비율, `.design-audit/public-refactor/diff-<after>/` 에 diff PNG
- Produces: `scripts/css-dead-classes.mjs`가 `export function findDeadClasses(cssFiles: string[], tsxRoots: string[]): string[]` 를 export하고, 직접 실행 시 목록을 출력

- [ ] **Step 1: 의존성 설치 (devDependencies)**

```bash
npm install -D playwright@1.49.1 pixelmatch@6.0.0 pngjs@7.0.0
```
Playwright는 `~/Library/Caches/ms-playwright/chromium-*`가 이미 있으므로 브라우저 재다운로드가 없어야 한다. 만약 `browserType.launch: Executable doesn't exist` 오류가 나면 `npx playwright install chromium`을 한 번 실행한다.

- [ ] **Step 2: `.gitignore` 갱신**

`.gitignore` 끝에 추가:
```
# audits & build artifacts
.design-audit/
tsconfig.tsbuildinfo
*-audit.png
design-qa.md
*-audit-*.md
tmp/
```
그리고 추적 해제(디스크 파일은 유지):
```bash
git rm -r --cached .design-audit tsconfig.tsbuildinfo 2>/dev/null
git rm --cached academy-audit.png academy-assets-audit.png sample-audit.png sample-assets-audit.png design-qa.md design-audit-2026-07-27.md typography-audit-2026-07-27.md 2>/dev/null
git status --short | head
```

- [ ] **Step 3: 스크린샷 스크립트 작성**

`scripts/screenshot-public.mjs`:
```js
// Usage: node scripts/screenshot-public.mjs <label>
// Captures every public route at 1440/834/390 widths into .design-audit/public-refactor/<label>/
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { spawn } from "node:child_process";

const label = process.argv[2];
if (!label) { console.error("Usage: node scripts/screenshot-public.mjs <label>"); process.exit(1); }

export const PUBLIC_ROUTES = [
  "/", "/works", "/works/snake-carnival", "/academy", "/academy/curriculum", "/academy/sample",
  "/academy/pilot", "/episode", "/materials", "/materials/ulleung-high-living-lab", "/about",
  "/activity", "/activity/ulleung-high-living-lab", "/contact", "/privacy", "/sitemap",
];
export const WIDTHS = [1440, 834, 390];
const BASE = process.env.BASE_URL ?? "http://localhost:3000";

async function serverUp() {
  try { const r = await fetch(BASE, { redirect: "manual" }); return r.status < 500; } catch { return false; }
}

let devServer = null;
if (!(await serverUp())) {
  devServer = spawn("npm", ["run", "dev"], { stdio: "ignore", detached: true });
  for (let i = 0; i < 40 && !(await serverUp()); i++) await new Promise((r) => setTimeout(r, 1500));
}

const outDir = `.design-audit/public-refactor/${label}`;
mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
for (const width of WIDTHS) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of PUBLIC_ROUTES) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    // settle fonts/images
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    const name = route === "/" ? "home" : route.slice(1).replaceAll("/", "__");
    await page.screenshot({ path: `${outDir}/${name}-${width}.png`, fullPage: true });
    console.log(`✓ ${name}-${width}`);
  }
  await page.close();
}
await browser.close();
if (devServer) process.kill(-devServer.pid);
```

- [ ] **Step 4: diff 스크립트 작성**

`scripts/screenshot-diff.mjs`:
```js
// Usage: node scripts/screenshot-diff.mjs <beforeLabel> <afterLabel>
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const [before, after] = process.argv.slice(2);
if (!before || !after) { console.error("Usage: node scripts/screenshot-diff.mjs <before> <after>"); process.exit(1); }
const root = ".design-audit/public-refactor";
const diffDir = `${root}/diff-${after}`;
mkdirSync(diffDir, { recursive: true });

const rows = [];
for (const file of readdirSync(`${root}/${before}`).filter((f) => f.endsWith(".png")).sort()) {
  const a = PNG.sync.read(readFileSync(`${root}/${before}/${file}`));
  const bPath = `${root}/${after}/${file}`;
  if (!existsSync(bPath)) { rows.push([file, "MISSING", ""]); continue; }
  const b = PNG.sync.read(readFileSync(bPath));
  const width = Math.max(a.width, b.width), height = Math.max(a.height, b.height);
  const pad = (img) => { const out = new PNG({ width, height }); PNG.bitblt(img, out, 0, 0, img.width, img.height, 0, 0); return out; };
  const pa = pad(a), pb = pad(b), diff = new PNG({ width, height });
  const changed = pixelmatch(pa.data, pb.data, diff.data, width, height, { threshold: 0.1 });
  const pct = ((changed / (width * height)) * 100).toFixed(2);
  if (changed > 0) writeFileSync(`${diffDir}/${file}`, PNG.sync.write(diff));
  rows.push([file, pct + "%", a.height === b.height ? "" : `height ${a.height}→${b.height}`]);
}
for (const [f, p, note] of rows) console.log(`${p.padStart(8)}  ${f}  ${note}`);
```

- [ ] **Step 5: 죽은 클래스 검출 스크립트 작성**

`scripts/css-dead-classes.mjs`:
```js
// Usage: node scripts/css-dead-classes.mjs [css files...]  (default: app/globals.css styles/**/*.css)
// Lists CSS class names never referenced in app/ or components/ .tsx files.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const DYNAMIC_OK = [/^is-(green|amber|red)$/, /^detail-art-\d$/];

function walk(dir, ext) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p, ext));
    else if (p.endsWith(ext)) out.push(p);
  }
  return out;
}

export function findDeadClasses(cssFiles, tsxRoots) {
  const css = cssFiles.map((f) => readFileSync(f, "utf8")).join("\n").replace(/\/\*[\s\S]*?\*\//g, "");
  const classes = new Set([...css.matchAll(/\.([a-zA-Z_][\w-]*)/g)].map((m) => m[1]));
  const tsx = tsxRoots.flatMap((r) => walk(r, ".tsx")).map((f) => readFileSync(f, "utf8")).join("\n");
  return [...classes].filter((c) => !DYNAMIC_OK.some((re) => re.test(c)) && !tsx.includes(c)).sort();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const cssFiles = args.length ? args : ["app/globals.css", ...(statSync("styles", { throwIfNoEntry: false }) ? walk("styles", ".css") : [])];
  const dead = findDeadClasses(cssFiles, ["app", "components"]);
  console.log(dead.join("\n"));
  console.error(`${dead.length} dead classes`);
}
```
주의: `tsx.includes(c)`는 부분 문자열 매치라 `nav`처럼 짧은 이름은 오탐(살아있다고 판단)될 수 있다. 보수적(삭제 쪽으로 틀리지 않음)이므로 허용.

- [ ] **Step 6: 실행해 기준선 확보**

```bash
node scripts/css-dead-classes.mjs 2>&1 | tail -1     # 예상: 약 200개
node scripts/screenshot-public.mjs before             # 48장
ls .design-audit/public-refactor/before | wc -l       # 예상: 48
```

- [ ] **Step 7: package.json 스크립트 추가 후 커밋**

`package.json` `scripts`에 추가:
```json
"shots": "node scripts/screenshot-public.mjs",
"shots:diff": "node scripts/screenshot-diff.mjs",
"css:dead": "node scripts/css-dead-classes.mjs"
```
```bash
git add .gitignore package.json package-lock.json scripts/screenshot-public.mjs scripts/screenshot-diff.mjs scripts/css-dead-classes.mjs
git commit -m "chore: add screenshot regression and dead-CSS tooling, untrack audit artifacts"
```

---

### Task 2: globals.css를 시각 변화 없이 모듈로 분리

**Files:**
- Create: `scripts/split-globals.mjs`, `styles/tokens.css`, `styles/base.css`, `styles/site.css`, `styles/pages/*.css`, `styles/dashboard.css`
- Modify: `app/globals.css` (import 목록만), `app/layout.tsx` (개별 css import 제거)
- Delete: `app/activity.css`, `app/work-detail.css`, `app/responsive.css` (내용은 styles로 흡수)

**Interfaces:**
- Produces: `app/globals.css`는 `@import "../styles/...";` 줄만 갖는다. 캐스케이드 순서 = 원본 파일 순서를 유지해야 하므로 **분리 직후 순서는 원본 섹션 순서 그대로**이고, 정리(Task 3~5)에서 재배치한다.

- [ ] **Step 1: 섹션 경계 확인**

```bash
grep -nE "^/\* =+" app/globals.css | wc -l   # 섹션 시작 줄 수
grep -nE "^   [0-9]+\.|^   [A-Z]" app/globals.css
```
현재 섹션(시작 줄): 1.TOKENS(4) · 12.PRODUCT(15) · 18.UX(357) · 19.EDITORIAL(721) · 16.MANUAL(2648) · 15.ACTIVITY(2815) · 2.LAYOUT(3197) · 3.HOME HERO(3322) · 4.FEATURE(3415) · 5.CTA/FOOTER(3450) · 6.ACADEMY(3529) · 8.SAMPLE(4212) · 9.CURRICULUM(4281) · 7.LANDING(4507) · LANDING NEW(5296) · LANDING ADD(5530) · ANTI-AI(5721) · ABOUT(5828) · EPISODE(6056) · CONTACT(6382) · 14.TYPO(6600) · 21.QUIET(6987) · 22.REMODEL(7044) · LOGIN(7180) · DASHBOARD LAYOUT(7233) · DASHBOARD PAGES(7360).

- [ ] **Step 2: 분리 스크립트 작성 (원본 순서 보존)**

`scripts/split-globals.mjs`:
```js
// One-off: split app/globals.css into styles/ modules by section header, preserving order.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const src = readFileSync("app/globals.css", "utf8").split("\n");
const headerRe = /^\/\* =+$/;
// [startLine(1-based), targetFile]
const sections = [];
for (let i = 0; i < src.length; i++) {
  if (headerRe.test(src[i]) && src[i + 1]) sections.push({ start: i, title: src[i + 1].trim() });
}
const target = (title) => {
  if (/TOKENS/.test(title)) return "styles/legacy/00-tokens.css";
  if (/DASHBOARD|LOGIN/.test(title)) return "styles/dashboard.css";
  return `styles/legacy/${String(sections.findIndex((s) => s.title === title)).padStart(2, "0")}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}.css`;
};
mkdirSync("styles/legacy", { recursive: true });
const files = new Map();
sections.forEach((s, idx) => {
  const end = idx + 1 < sections.length ? sections[idx + 1].start : src.length;
  const chunk = src.slice(s.start, end).join("\n");
  const file = target(s.title);
  files.set(file, (files.get(file) ?? "") + chunk + "\n");
});
// lines before the first header (should be only the @import/font comment lines) go to tokens
const preamble = src.slice(0, sections[0].start).join("\n");
files.set("styles/legacy/00-tokens.css", preamble + "\n" + files.get("styles/legacy/00-tokens.css"));
for (const [file, content] of files) writeFileSync(file, content);
const imports = [...files.keys()].map((f) => `@import "../${f}";`).join("\n") + "\n";
writeFileSync("app/globals.css", imports);
console.log([...files.keys()].join("\n"));
```
설계상 최종 파일명(`site.css`, `pages/*.css`)은 Task 5에서 규칙을 **의미별로 재배치**할 때 확정한다. 이 단계는 `styles/legacy/NN-*.css`로 순서만 보존한 기계적 분리다.

- [ ] **Step 3: 실행하고 나머지 css 파일도 흡수**

```bash
node scripts/split-globals.mjs
cat app/activity.css >> styles/legacy/zz-activity-extra.css
cat app/work-detail.css >> styles/legacy/zz-work-detail.css
cat app/responsive.css >> styles/legacy/zz-responsive.css
printf '@import "../styles/legacy/zz-activity-extra.css";\n@import "../styles/legacy/zz-work-detail.css";\n@import "../styles/legacy/zz-responsive.css";\n' >> app/globals.css
git rm -q app/activity.css app/work-detail.css app/responsive.css
```
`app/layout.tsx` 10–13행의 4개 import를 `import "./globals.css";` 하나로 교체(원래 순서: globals → activity → work-detail → responsive 이므로 위 append 순서와 동일).

- [ ] **Step 4: 개발 서버 재시작 후 스크린샷 diff = 0 확인**

```bash
pkill -f "next dev" ; (npm run dev > /dev/null 2>&1 &) ; sleep 8
node scripts/screenshot-public.mjs split
node scripts/screenshot-diff.mjs before split
```
Expected: 모든 행 `0.00%`. 0이 아닌 행이 있으면 해당 페이지의 규칙 순서가 바뀐 것이다 — `@import` 순서를 원본 섹션 순서와 대조해 고친다. (Next.js는 `@import`를 순서대로 인라인하므로 캐스케이드가 보존된다.)

- [ ] **Step 5: 커밋**

```bash
git add -A app/globals.css app/layout.tsx styles scripts/split-globals.mjs
git commit -m "refactor(css): split globals.css into ordered style modules (no visual change)"
```

---

### Task 3: 죽은 CSS 규칙 삭제

**Files:**
- Modify: `styles/legacy/*.css`
- Delete: `components/curriculum-explorer.tsx`
- Modify: `tests/rendered-html.test.mjs` (curriculum-explorer 참조 제거)
- Create: `tests/css-hygiene.test.mjs`

**Interfaces:**
- Consumes: `findDeadClasses` from `scripts/css-dead-classes.mjs`

- [ ] **Step 1: 실패하는 위생 테스트 작성**

`tests/css-hygiene.test.mjs`:
```js
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { findDeadClasses } from "../scripts/css-dead-classes.mjs";

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".css") ? [p] : [];
  });
}
const cssFiles = walk("styles");
const css = cssFiles.map((f) => readFileSync(f, "utf8")).join("\n");

test("no dead CSS classes", () => {
  const dead = findDeadClasses(cssFiles, ["app", "components"]);
  assert.deepEqual(dead, [], `dead classes:\n${dead.join("\n")}`);
});

test("no !important outside reduced-motion", () => {
  const stripped = css.replace(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\n\}/g, "");
  assert.equal((stripped.match(/!important/g) || []).length, 0);
});

test(":root is declared exactly once", () => {
  assert.equal((css.match(/^:root\s*\{/gm) || []).length, 1);
});

test("no line longer than 100 chars", () => {
  const long = css.split("\n").filter((l) => l.length > 100);
  assert.equal(long.length, 0, long.slice(0, 5).join("\n"));
});
```
실행: `node --test tests/css-hygiene.test.mjs` → Expected: 4개 모두 FAIL.

- [ ] **Step 2: 미사용 컴포넌트 삭제와 테스트 갱신**

```bash
git rm -q components/curriculum-explorer.tsx
```
`tests/rendered-html.test.mjs` 63–84행의 "keeps core navigation and interactions accessible" 테스트에서 `explorer` 읽기와 `explorer` 관련 5개 assert(76–80행)를 삭제한다. `header`, `layout`, `css` 검사는 유지하되 `css`는 `styles/` 전체를 합쳐 읽도록 바꾼다:
```js
const cssFiles = (await readdir(new URL("../styles/", import.meta.url), { recursive: true }))
  .filter((f) => f.endsWith(".css"));
const css = (await Promise.all(cssFiles.map((f) => readFile(new URL(`../styles/${f}`, import.meta.url), "utf8")))).join("\n");
```
(`readdir`를 import에 추가.)

- [ ] **Step 3: 죽은 클래스만 쓰는 규칙 블록 삭제**

`node scripts/css-dead-classes.mjs > /tmp/dead.txt` 로 목록을 얻은 뒤, 각 `styles/legacy/*.css`에서 **선택자 전체가 죽은 클래스로만 구성된 규칙 블록**을 삭제한다. 미디어 쿼리 안의 블록도 동일. 삭제 후 빈 `@media {}` 블록과 빈 섹션 헤더 주석은 제거한다.

자동화 보조 스크립트(일회용, 커밋하지 않음) `tmp/prune-css.mjs`:
```js
import { readFileSync, writeFileSync } from "node:fs";
const dead = new Set(readFileSync("/tmp/dead.txt", "utf8").split("\n").filter(Boolean));
for (const file of process.argv.slice(2)) {
  let css = readFileSync(file, "utf8");
  // remove rule blocks whose every selector contains at least one dead class
  css = css.replace(/(^|\n)([^{}@\n][^{}]*?)\{[^{}]*\}/g, (m, lead, sel) => {
    const selectors = sel.split(",").map((s) => s.trim());
    const allDead = selectors.every((s) => [...s.matchAll(/\.([\w-]+)/g)].some((x) => dead.has(x[1])));
    return allDead ? lead : m;
  });
  // drop now-empty media blocks
  css = css.replace(/@media[^{]*\{\s*\}/g, "");
  writeFileSync(file, css);
}
```
```bash
node tmp/prune-css.mjs styles/legacy/*.css styles/dashboard.css
node scripts/css-dead-classes.mjs 2>&1 | tail -1     # 남은 죽은 클래스 수
```
남은 것은 살아 있는 선택자와 섞인 복합 선택자(`.live .dead`)들이다. 이들은 수동으로 죽은 부분만 제거하거나 규칙을 삭제한다. 목표: 0개.

- [ ] **Step 4: diff = 0 확인**

```bash
node scripts/screenshot-public.mjs pruned && node scripts/screenshot-diff.mjs before pruned
```
Expected: 전부 `0.00%`. 아니면 삭제된 규칙 중 살아 있는 요소에 영향을 준 것이 있다 — `git diff styles/` 에서 해당 페이지 섹션의 삭제를 되돌린다.

- [ ] **Step 5: 위생 테스트 재실행**

`node --test tests/css-hygiene.test.mjs` → "no dead CSS classes" PASS. 나머지 3개는 Task 4/5에서.

- [ ] **Step 6: 커밋**

```bash
git add -A styles tests components
git commit -m "refactor(css): remove unused rules and the dead CurriculumExplorer component"
```

---

### Task 4: 토큰 통합, 중복 선택자 정리, !important 제거

**Files:**
- Create: `styles/tokens.css`
- Modify: `styles/legacy/*.css`

- [ ] **Step 1: 단일 tokens.css 작성**

`styles/tokens.css` (현재 적용 값 = 6990행 블록 기준):
```css
:root {
  --ink: #111412;
  --cream: #fff;
  --surface: #f6f7f5;
  --text-muted: #626762;
  --orange: #c96645;
  --page: var(--cream);
  --radius-sm: 8px;
  --radius-md: 14px;
  --header-h: 64px;
  --font-mono: var(--font-mono);
}
```
`--font-*`는 `next/font`가 `html` 클래스로 주입하므로 여기서는 선언하지 않는다(위 `--font-mono` 줄은 삭제). 기존 두 `:root` 블록(`00-tokens.css`의 8–13행, `18-ux`의 361–366행 상당, `21-quiet`의 6990행 상당)을 모두 삭제하고 `app/globals.css` 첫 줄에 `@import "../styles/tokens.css";`를 추가한다. 존재하던 다른 커스텀 프로퍼티(`--surface-soft` 등)는 사용처가 없으면 삭제, 있으면 tokens.css로 이동.

- [ ] **Step 2: 하드코딩 색상을 토큰으로 치환**

```bash
grep -rnoE "#15251e|#e8784f|#f2efe7|rgba\(21, ?37, ?30,[^)]*\)|#1e6662|#1e5c5c" styles | wc -l
```
치환 규칙(값이 바뀌지 않도록 **현재 렌더 색**을 기준으로 판단):
- `#15251e` → `var(--ink)` (이전 잉크; 현재 잉크는 #111412 — 차이가 1–2% 명도이므로 diff에서 미세하게 잡힐 수 있다. **이 치환은 Task 5(의도된 변경) 로 미룬다.**)
- `#e8784f` → `var(--orange)` (동일하게 Task 5로)
- `#f2efe7` → 배경으로 쓰인 경우 그대로 두고 Task 5에서 판단.
즉 이 단계에서는 **동일 값 치환만** 한다: `#111412`→`var(--ink)`, `#fff`/`#ffffff` 배경→`var(--cream)`, `#f6f7f5`→`var(--surface)`, `#626762`→`var(--text-muted)`, `#c96645`→`var(--orange)`.
`var(--teal)` (privacy hero em) → `var(--ink)`.

- [ ] **Step 3: 중복 정의 선택자 병합**

대상: `.shell`, `.button`, `.button-dark`, `.button-light`, `.section-kicker`, `.site-header`, `.site-footer-grid`, `.nav-links`, `.mobile-navigation`. 각 선택자에 대해 `grep -n "^\.shell\b\|^\.shell " styles/legacy/*.css` 로 모든 정의를 찾고, 캐스케이드상 **마지막으로 적용되는 값**을 계산해 하나의 규칙으로 합친 뒤 나머지를 삭제한다. `html body .x` 형태의 특이성 상승 선택자는 `.x`로 낮추되, 낮춘 뒤에도 마지막 정의가 되도록 파일 순서를 유지한다.

- [ ] **Step 4: `!important` 제거**

`styles/legacy/*` 에서 `.site-footer-sample { color: #fff !important }` → 해당 링크에 더 높은 특이성이 필요하면 `.site-footer-contact .site-footer-sample { color: var(--cream); }`로 교체. reduced-motion 블록의 4개는 유지.

- [ ] **Step 5: 줄 길이·포맷 정리**

```bash
npx prettier --write "styles/**/*.css" --print-width 100
```
(Prettier가 없으면 `npm i -D prettier@3`.) 

- [ ] **Step 6: diff = 0 확인, 테스트, 커밋**

```bash
node scripts/screenshot-public.mjs tokens && node scripts/screenshot-diff.mjs before tokens
node --test tests/css-hygiene.test.mjs
```
Expected: diff 전부 0.00%; 위생 테스트 4개 PASS.
```bash
git add -A styles app/globals.css
git commit -m "refactor(css): single token root, merge duplicate selectors, drop !important"
```

---

### Task 5: 의미별 파일 재배치 + 대비·브레이크포인트 수정 (의도된 시각 변경)

**Files:**
- Create: `styles/base.css`, `styles/site.css`, `styles/pages/{home,works,academy,about,activity,materials,misc}.css`
- Delete: `styles/legacy/`
- Modify: `app/globals.css`

- [ ] **Step 1: 규칙을 의미별 파일로 이동**

각 `styles/legacy/*.css`의 규칙을 아래 기준으로 옮긴다(잘라 붙이기; 같은 파일 안에서는 원래 순서 유지):
- `base.css`: `html`, `body`, `*`, 리셋, 타이포 기본(`h1..h6`, `p`, `a`), `.skip-link`, `:focus-visible`, `@media (prefers-reduced-motion)`
- `site.css`: `.site-header`, `.nav*`, `.brand*`, `.mobile-navigation*`, `.shell`, `.button*`, `.section-kicker`, `.site-footer*`, `.text-link*`, `.inner-hero`
- `pages/home.css`: `.brand-*`(home 섹션), `.clue-process*`
- `pages/works.css`: `.works-*`, `.live-*`, `.work-*`, `.portfolio-*`, `.funding-archive*`
- `pages/academy.css`: `.academy-*`, `.sample-*`, `.gallery-*`, `.curriculum-*`, `.detail-*`, `.output-pill`, `.mini-label`, `.note-section`, `.pilot-*`, `.apply-form*`, `.form-*`, `.ep-*`
- `pages/about.css`: `.about-*`, `.belief-*`
- `pages/activity.css`: `.activity-*`
- `pages/materials.css`: `.course-*`, `.presentation-*`, `.materials-*`
- `pages/misc.css`: `.contact-*`, `.privacy-*`, `.sitemap-*`, `.not-found*`
- `dashboard.css`: 그대로
`app/globals.css`:
```css
@import "../styles/tokens.css";
@import "../styles/base.css";
@import "../styles/site.css";
@import "../styles/pages/home.css";
@import "../styles/pages/works.css";
@import "../styles/pages/academy.css";
@import "../styles/pages/about.css";
@import "../styles/pages/activity.css";
@import "../styles/pages/materials.css";
@import "../styles/pages/misc.css";
@import "../styles/dashboard.css";
```
이동 중 같은 선택자가 서로 다른 legacy 파일에 남아 있었다면(Task 4에서 놓친 것) 이 시점에 병합한다.

- [ ] **Step 2: 이동만 한 상태에서 diff = 0 확인**

```bash
rm -rf styles/legacy
node scripts/screenshot-public.mjs moved && node scripts/screenshot-diff.mjs before moved
```
Expected: 전부 0.00%. 아니면 이동으로 캐스케이드 순서가 바뀐 것 — 해당 규칙을 원래 상대 순서로 되돌린다.

- [ ] **Step 3: 브레이크포인트 통일 (의도된 변경 1)**

```bash
grep -rhoE "@media ?\(max-width: ?[0-9]+px\)" styles | sort | uniq -c
```
- `820px` → `900px` (모바일 내비 `.mobile-navigation.is-open { display: block }` 포함 — 이것이 821–900px 버그의 수정)
- `1050px` → `1080px`
- 표기를 전부 `@media (max-width: Npx)`로.
`base.css`의 `html { scroll-padding-top: 88px }` → `scroll-padding-top: var(--header-h);`

- [ ] **Step 4: 대비 개선 (의도된 변경 2)**

`grep -rnE "#8a8f8b|#929793|#858a86|#777c78|rgba\(21, ?37, ?30, ?\.?0?\.48\)|#777" styles` 로 찾은 색을 모두 `var(--text-muted)`로. `.live-funding-stats p`(녹색 띠 위)는 `var(--ink)`에 `opacity: .72`로.
이전 팔레트 잔재도 이 단계에서 정리: `#15251e`→`var(--ink)`, `#e8784f`→`var(--orange)`, `#f2efe7` 배경→`var(--surface)`, `rgba(21,37,30,X)`→`rgba(17,20,18,X)`.

- [ ] **Step 5: diff 검토 (의도된 변경만)**

```bash
node scripts/screenshot-public.mjs contrast && node scripts/screenshot-diff.mjs before contrast
```
Expected: 모든 페이지에서 소폭(보통 <3%) 변화 — 보조 텍스트 색. 834px 폭 스크린샷에서 헤더는 변화 없음(메뉴는 닫힌 상태). diff PNG를 열어 텍스트 색 외의 레이아웃 이동이 없는지 눈으로 확인한다.

- [ ] **Step 6: 834px 메뉴 수동 확인**

```bash
node -e '
import("playwright").then(async ({chromium})=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:834,height:900}});
await p.goto("http://localhost:3000/about");await p.click(".nav-menu-button");
const visible=await p.isVisible("#mobile-navigation a[href=\"/works\"]");console.log("menu visible at 834:",visible);await b.close();})'
```
Expected: `menu visible at 834: true`

- [ ] **Step 7: 테스트·커밋**

```bash
node --test tests/css-hygiene.test.mjs
git add -A styles app/globals.css
git commit -m "refactor(css): reorganize by page, unify breakpoints, fix tablet nav and text contrast"
```

---

### Task 6: 데이터 단일화 — 제목 상수, 펀딩 상태 계산, 활동 날짜, 경로 목록

**Files:**
- Modify: `lib/education.ts`, `lib/funding.ts`, `lib/activities.ts`, `lib/works.ts`, `lib/navigation.ts`
- Create: `lib/routes.ts`, `tests/lib.test.mjs`
- Modify: `app/works/page.tsx`, `app/activity/page.tsx`, `app/sitemap.ts`, `app/sitemap/page.tsx`, `app/page.tsx`(status 표시)

**Interfaces:**
- Produces (`lib/education.ts`): `export const episodeTitle = "8시까지 두 열쇠"`, `episodeSubtitle = "보충반의 사라진 열쇠"`, `episodeFullTitle = "8시까지 두 열쇠 — 보충반의 사라진 열쇠"`
- Produces (`lib/funding.ts`): `FundingProject.endsOn: string` (ISO), `getFundingStatus(project, today = new Date()): "진행 중" | "종료"`, `formatFundingSummary(project): string`, `fundingSummaryPeriod(project): string`
- Produces (`lib/activities.ts`): `ActivityRecord.date: string` (ISO `YYYY-MM-DD` 또는 `YYYY-MM-DD/YYYY-MM-DD`), `isUpcoming(record, today): boolean`, `formatActivityDate(record): string`
- Produces (`lib/routes.ts`): `publicRoutes: { path: string; title: string; description: string; group: "studio"|"education"|"resources"; priority: number; changeFrequency: "weekly"|"monthly"|"yearly" }[]`, `getRoute(path)`
- Produces (`lib/works.ts`): `getWorkStatus(work, today): WorkStatus` — `펀딩 중`은 연결 캠페인이 진행 중일 때만

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/lib.test.mjs` (TS 파일을 직접 import할 수 없으므로 소스 텍스트와 **컴파일된 함수**를 함께 검사한다. 함수 검증은 `tsx` 없이 하기 위해 `node --experimental-strip-types`를 쓴다 — Node 24는 기본 지원):
```js
import assert from "node:assert/strict";
import test from "node:test";
import { getFundingStatus, fundingProjects, formatFundingSummary } from "../lib/funding.ts";
import { isUpcoming, activityRecords } from "../lib/activities.ts";
import { publicRoutes } from "../lib/routes.ts";
import { episodeFullTitle, episodeTitle, episodeSubtitle } from "../lib/education.ts";
import { getWorkStatus, works } from "../lib/works.ts";

test("funding status is derived from endsOn", () => {
  const dg2 = fundingProjects.find((p) => p.id === "projectdg2");
  assert.equal(getFundingStatus(dg2, new Date("2026-09-10")), "진행 중");
  assert.equal(getFundingStatus(dg2, new Date("2026-09-12")), "종료");
  assert.match(formatFundingSummary(fundingProjects[1]), /2026\.03\.16–04\.20 · 19,296,000원 · 193명 · 1,929%/);
});

test("works flagged 펀딩 중 only while the campaign runs", () => {
  const slime = works.find((w) => w.slug === "slime-soda");
  assert.equal(getWorkStatus(slime, new Date("2026-09-10")), "펀딩 중");
  assert.equal(getWorkStatus(slime, new Date("2026-09-12")), "출시");
});

test("activities distinguish upcoming records", () => {
  const ulleung = activityRecords.find((r) => r.title === "울릉고 리빙랩 특강");
  assert.equal(isUpcoming(ulleung, new Date("2026-09-03")), true);
  assert.equal(isUpcoming(ulleung, new Date("2026-09-06")), false);
  assert.ok(activityRecords.every((r) => /^\d{4}-\d{2}-\d{2}(\/\d{4}-\d{2}-\d{2})?$/.test(r.date)), "dates must be ISO");
});

test("public routes are unique and cover the app tree", () => {
  const paths = publicRoutes.map((r) => r.path);
  assert.equal(new Set(paths).size, paths.length);
  for (const p of ["/", "/academy", "/academy/curriculum", "/academy/sample", "/academy/pilot", "/episode", "/works", "/materials", "/materials/ulleung-high-living-lab", "/about", "/activity", "/activity/ulleung-high-living-lab", "/contact", "/privacy", "/sitemap"]) {
    assert.ok(paths.includes(p), `missing ${p}`);
  }
});

test("episode title constants", () => {
  assert.equal(episodeTitle, "8시까지 두 열쇠");
  assert.equal(episodeSubtitle, "보충반의 사라진 열쇠");
  assert.equal(episodeFullTitle, "8시까지 두 열쇠 — 보충반의 사라진 열쇠");
});
```
실행: `node --experimental-strip-types --test tests/lib.test.mjs` → Expected: import 실패로 FAIL.
`package.json`의 `test` 스크립트를 `"test": "npm run build && node --experimental-strip-types --test tests/*.test.mjs"`로 바꾼다. (`lib/*.ts`에 `enum`이나 데코레이터가 없어야 strip-types로 실행된다 — 현재 없음. `import ... from "./presentations"`처럼 확장자 없는 상대 import는 strip-types에서 실패하므로 `lib/*.ts` 내부 상대 import에 `.ts` 확장자를 붙인다: `import { ulleungPresentation } from "./presentations.ts";`. Next/TS는 `allowImportingTsExtensions`가 필요하므로 `tsconfig.json` `compilerOptions`에 `"allowImportingTsExtensions": true` 추가 — `noEmit`가 이미 true여야 한다. 확인: `grep noEmit tsconfig.json`.)

- [ ] **Step 2: `lib/education.ts` 상수 추가**

파일 상단(import 다음)에:
```ts
export const episodeTitle = "8시까지 두 열쇠";
export const episodeSubtitle = "보충반의 사라진 열쇠";
export const episodeFullTitle = `${episodeTitle} — ${episodeSubtitle}`;
```
`CourseMaterial` 타입 export는 유지하되 `MaterialLink`가 있으면 삭제(미사용).

- [ ] **Step 3: `lib/funding.ts` 재작성**

```ts
export type FundingProject = {
  id: "projectdg0" | "projectdg1" | "projectdg2";
  title: string;
  startsOn: string; // YYYY-MM-DD
  endsOn: string;   // YYYY-MM-DD (마지막 날, 포함)
  url: string;
  amount: string;
  backers: string;
  achievement: string;
  checkedAt?: string; // 진행 중 수치 확인일
};

export const fundingProjects: FundingProject[] = [
  { id: "projectdg0", title: "뱀이 죽은 축제", startsOn: "2025-09-09", endsOn: "2025-10-11", url: "https://tumblbug.com/projectdg0", amount: "9,001,000원", backers: "250명", achievement: "180%" },
  { id: "projectdg1", title: "머더미스터리 3종", startsOn: "2026-03-16", endsOn: "2026-04-20", url: "https://tumblbug.com/projectdg1", amount: "19,296,000원", backers: "193명", achievement: "1,929%" },
  { id: "projectdg2", title: "머더미스터리 2종", startsOn: "2026-08-14", endsOn: "2026-09-11", url: "https://tumblbug.com/projectdg2", amount: "10,940,000원", backers: "169명", achievement: "1,094%", checkedAt: "2026년 9월 2일" },
];

export type FundingStatus = "진행 중" | "종료";

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
/** KST 기준 YYYY-MM-DD */
export function toKstDateString(date: Date): string {
  return new Date(date.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

export function getFundingStatus(project: FundingProject, today: Date = new Date()): FundingStatus {
  return toKstDateString(today) <= project.endsOn ? "진행 중" : "종료";
}

const dots = (iso: string) => iso.replaceAll("-", ".");
/** "2026.03.16–04.20" (같은 해면 끝 날짜의 연도 생략) */
export function fundingSummaryPeriod(project: FundingProject): string {
  const start = dots(project.startsOn);
  const end = project.endsOn.startsWith(project.startsOn.slice(0, 4)) ? dots(project.endsOn.slice(5)) : dots(project.endsOn);
  return `${start}–${end}`;
}

export function formatFundingSummary(project: FundingProject): string {
  return `${fundingSummaryPeriod(project)} · ${project.amount} · ${project.backers} · ${project.achievement}`;
}

export function getFundingProject(id: FundingProject["id"]) {
  return fundingProjects.find((project) => project.id === id)!;
}
```
`projectdg2`의 `startsOn`은 텀블벅 페이지 기준으로 확인이 필요하다. 확인 전까지는 위 값(2026-08-14)을 두고 커밋 메시지에 "확인 필요"를 남긴다. `period` 필드를 쓰던 곳(`works/page.tsx`의 `currentFunding.period`, `activities.ts`)은 아래에서 교체.

- [ ] **Step 4: `lib/works.ts` — 상태 파생**

`Work.status` 필드는 유지하되 의미를 "기본 상태"로 두고, `펀딩 중` 항목에 `fundingId: "projectdg2"`를 추가한다. 파일 끝에:
```ts
import { getFundingProject, getFundingStatus, formatFundingSummary, type FundingProject } from "./funding.ts";

export function getWorkStatus(work: Work, today: Date = new Date()): WorkStatus {
  if (work.status === "펀딩 중" && work.fundingId) {
    return getFundingStatus(getFundingProject(work.fundingId), today) === "진행 중" ? "펀딩 중" : "출시";
  }
  return work.status;
}
export const currentWorks = (today = new Date()) => works.filter((w) => getWorkStatus(w, today) === "펀딩 중");
export const publishedWorks = (today = new Date()) => works.filter((w) => getWorkStatus(w, today) !== "펀딩 중");
```
`Work` 타입에 `fundingId?: FundingProject["id"]` 추가. `record.detail`의 하드코딩 문자열 4곳을 `formatFundingSummary(getFundingProject("projectdg0"))` 등으로 교체. `slime-soda`/`professor-rest`의 `record`는 `{ label: "펀딩", title: "머더미스터리 2종", detail: `${fundingSummaryPeriod(dg2)} · 텀블벅` }` 로. import는 파일 맨 위로 옮긴다(위 코드는 위치 설명용).
`currentWorks`/`publishedWorks`가 함수가 되었으므로 호출처 갱신: `app/works/page.tsx` 15–16행, `app/sitemap/page.tsx` 32행(`work.status` → `getWorkStatus(work)`), `app/page.tsx` 31행(`work.status` → `getWorkStatus(work)`), `app/works/[slug]/page.tsx`의 `work.status` 사용처.

- [ ] **Step 5: `lib/activities.ts` 재작성**

```ts
import { formatFundingSummary, fundingSummaryPeriod, getFundingProject } from "./funding.ts";

export type ActivityRecord = {
  /** ISO date or ISO range "YYYY-MM-DD/YYYY-MM-DD" */
  date: string;
  type: "펀딩" | "교육" | "제작";
  title: string;
  body: string;
  href: string;
  ongoing?: boolean;
};

const dg0 = getFundingProject("projectdg0");
const dg1 = getFundingProject("projectdg1");

export const activityRecords: ActivityRecord[] = [
  { date: `${dg0.startsOn}/${dg0.endsOn}`, type: "펀딩", title: dg0.title, body: "첫 실물 머더미스터리 프로젝트를 텀블벅에서 공개했습니다.", href: dg0.url },
  { date: `${dg1.startsOn}/${dg1.endsOn}`, type: "펀딩", title: dg1.title, body: "레드가 죽은 연구소, 미식의 대가, 의사가 너무 많아!를 한 프로젝트로 공개했습니다.", href: dg1.url },
  { date: "2026-09-05", type: "교육", title: "울릉고 리빙랩 특강", body: "울릉도 소재를 게임 기획 활동으로 바꾸는 특강과 공개 자료를 기록했습니다.", href: "/activity/ulleung-high-living-lab" },
  { date: "2026-07-01", type: "제작", title: "영어 미스터리 수업팩", body: "영어 단서를 읽고 근거를 쓰는 4차시 수업용 시제품과 파일럿을 준비하고 있습니다.", href: "/academy", ongoing: true },
];

const startOf = (r: ActivityRecord) => r.date.split("/")[0];
export function isUpcoming(record: ActivityRecord, today: Date = new Date()): boolean {
  const kst = new Date(today.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
  return startOf(record) > kst;
}
export function formatActivityDate(record: ActivityRecord): string {
  if (record.ongoing) return "진행 중";
  const [a, b] = record.date.split("/");
  const dots = (s: string) => s.replaceAll("-", ".");
  return b ? `${dots(a)}—${dots(b.slice(0, 4) === a.slice(0, 4) ? b.slice(5) : b)}` : dots(a);
}
```
(`formatFundingSummary`, `fundingSummaryPeriod` import는 미사용이면 제거.)
`app/activity/page.tsx` 23행의 `<time>{record.date}</time>` →
```tsx
const upcoming = isUpcoming(record);
const content = (
  <>
    <time dateTime={record.date.split("/")[0]}>{formatActivityDate(record)}</time>
    <span>{upcoming ? `${record.type} · 예정` : record.type}</span>
    <strong>{record.title}</strong>
    <p>{record.body}</p>
    <ArrowUpRight size={17} weight="bold" aria-hidden="true" />
  </>
);
```
그리고 링크 요소에 `className={upcoming ? "is-upcoming" : undefined}`. `styles/pages/activity.css`에:
```css
.activity-ledger-list .is-upcoming span {
  color: var(--orange);
}
```

- [ ] **Step 6: `lib/routes.ts` 작성, sitemap 두 곳 파생**

```ts
export type RouteGroup = "studio" | "education" | "resources";
export type PublicRoute = {
  path: string;
  title: string;
  description: string;
  group: RouteGroup;
  priority: number;
  changeFrequency: "weekly" | "monthly" | "yearly";
};

export const publicRoutes: PublicRoute[] = [
  { path: "/", title: "홈", description: "단서공방의 작품과 영어 미스터리 수업팩을 소개합니다.", group: "studio", priority: 1, changeFrequency: "weekly" },
  { path: "/works", title: "작품과 펀딩", description: "공개한 작품을 한 편씩 살펴보고 펀딩 기록을 확인합니다.", group: "studio", priority: 0.7, changeFrequency: "monthly" },
  { path: "/activity", title: "제작·활동 기록", description: "확인된 제작 결과와 예정된 활동을 구분해 기록합니다.", group: "studio", priority: 0.7, changeFrequency: "weekly" },
  { path: "/activity/ulleung-high-living-lab", title: "울릉고 리빙랩 특강", description: "2026년 9월 5일 교육 활동과 공개 자료를 확인합니다.", group: "studio", priority: 0.6, changeFrequency: "monthly" },
  { path: "/about", title: "단서공방 소개", description: "어떤 콘텐츠를 만들고 있는지 소개합니다.", group: "studio", priority: 0.6, changeFrequency: "monthly" },
  { path: "/academy", title: "교육 수업팩 소개", description: "대상, 구성과 사용 장면, 함께 제공되는 운영 도구를 한눈에 봅니다.", group: "education", priority: 0.9, changeFrequency: "weekly" },
  { path: "/academy/curriculum", title: "4차시 수업 흐름", description: "사건 읽기부터 팀 보고서까지 차시별 흐름을 확인합니다.", group: "education", priority: 0.8, changeFrequency: "monthly" },
  { path: "/academy/sample", title: "수업 자료 미리보기", description: "단서 카드, 사건 자료, 규칙서와 교사용 자료의 실물을 확인합니다.", group: "education", priority: 0.8, changeFrequency: "monthly" },
  { path: "/episode", title: "수업용 에피소드", description: "수업에 사용하는 첫 사건의 배경과 인물을 살펴봅니다.", group: "education", priority: 0.8, changeFrequency: "monthly" },
  { path: "/academy/pilot", title: "파일럿 운영 안내", description: "진행 절차, 확인 기준과 무료 검토팩 요청 양식을 안내합니다.", group: "education", priority: 0.7, changeFrequency: "monthly" },
  { path: "/materials", title: "수강생 자료실", description: "지난 교육에서 사용한 공개 자료를 과정별로 모았습니다.", group: "resources", priority: 0.7, changeFrequency: "monthly" },
  { path: "/materials/ulleung-high-living-lab", title: "울릉고 리빙랩 특강 발표자료", description: "발표자료 15쪽을 웹에서 바로 확인합니다.", group: "resources", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", title: "문의하기", description: "작품과 교육 운영에 관한 질문을 남길 수 있습니다.", group: "resources", priority: 0.6, changeFrequency: "monthly" },
  { path: "/privacy", title: "개인정보 처리 안내", description: "검토팩 요청 과정에서 수집하는 정보와 처리 방식을 확인합니다.", group: "resources", priority: 0.3, changeFrequency: "yearly" },
  { path: "/sitemap", title: "전체 페이지", description: "사이트의 모든 페이지를 목적별로 안내합니다.", group: "resources", priority: 0.4, changeFrequency: "monthly" },
];

export function getRoute(path: string): PublicRoute {
  const route = publicRoutes.find((r) => r.path === path);
  if (!route) throw new Error(`Unknown public route: ${path}`);
  return route;
}
```
`app/sitemap.ts`:
```ts
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { publicRoutes } from "@/lib/routes";
import { works } from "@/lib/works";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = publicRoutes.map((r) => ({ url: `${SITE_URL}${r.path === "/" ? "" : r.path}`, priority: r.priority, changeFrequency: r.changeFrequency }));
  const workPages = works.map((work) => ({ url: `${SITE_URL}/works/${work.slug}`, priority: 0.7, changeFrequency: "monthly" as const }));
  return [...pages, ...workPages];
}
```
`app/sitemap/page.tsx`의 `pageGroups`는 `publicRoutes`를 `group`으로 묶어 만들되 `links` 순서와 작품 삽입 위치를 유지한다:
```ts
const byGroup = (group: RouteGroup) => publicRoutes.filter((r) => r.group === group && r.path !== "/" && r.path !== "/sitemap").map((r) => ({ href: r.path, title: r.title, body: r.description }));
const pageGroups = [
  { number: "01", title: "작품과 단서공방", description: "…(기존 문구)", icon: Buildings,
    links: [byGroup("studio")[0], ...works.map((work) => ({ href: `/works/${work.slug}`, title: work.title, body: `${getWorkStatus(work)} · ${work.players} · ${work.duration} · ${work.platform}` })), ...byGroup("studio").slice(1)] },
  { number: "02", title: "교육 수업팩", description: "…", icon: BookOpenText, links: byGroup("education") },
  { number: "03", title: "자료와 문의", description: "…", icon: FolderOpen, links: byGroup("resources") },
];
```
`lib/navigation.ts`는 라벨 배열만 유지(변경 없음; `href`는 `publicRoutes`에 존재해야 한다는 테스트를 `tests/lib.test.mjs`에 추가):
```js
test("navigation hrefs exist in publicRoutes", async () => {
  const { primaryNavigation, studioNavigation } = await import("../lib/navigation.ts");
  const paths = publicRoutes.map((r) => r.path);
  for (const n of [...primaryNavigation, ...studioNavigation]) assert.ok(paths.includes(n.href), n.href);
});
```

- [ ] **Step 7: `app/works/page.tsx` 갱신**

- `currentFunding.period` → `fundingSummaryPeriod(currentFunding)` + `까지`는 문구에서: `<b>{currentFunding.endsOn.replaceAll("-", ".")}까지</b>`
- "현재 펀딩 중" 섹션 전체를 `getFundingStatus(currentFunding) === "진행 중"`일 때만 렌더. 종료 후에는 `fundingArchive`에 dg2를 포함시킨다:
```ts
const live = getFundingStatus(currentFunding) === "진행 중";
const fundingArchive = [getFundingProject("projectdg0"), getFundingProject("projectdg1"), ...(live ? [] : [currentFunding])];
```
- 아카이브 항목의 `<span>{project.period}</span>` → `{fundingSummaryPeriod(project)}`.

- [ ] **Step 8: 테스트 통과·타입·커밋**

```bash
node --experimental-strip-types --test tests/lib.test.mjs
npx tsc --noEmit
git add -A lib app tests tsconfig.json package.json
git commit -m "refactor(data): single-source routes, derive funding/work status by date, episode title constants"
```

---

### Task 7: 메타데이터 헬퍼, OG 이미지, 파비콘, 404·오류 페이지

**Files:**
- Create: `lib/metadata.ts`, `app/opengraph-image.tsx`, `app/icon.svg`, `app/not-found.tsx`, `app/error.tsx`
- Modify: `app/layout.tsx`, 모든 공개 페이지의 `metadata`, `app/works/[slug]/page.tsx`
- Delete: `public/og.webp`, `public/og.png`, `public/favicon.svg`
- Test: `tests/rendered-html.test.mjs`에 title/canonical 검사 추가 (Task 12에서 실행)

**Interfaces:**
- Produces: `pageMetadata(path: string, overrides?: { title?: string; description?: string; ogImage?: string }): Metadata` — `lib/routes.ts`의 `getRoute(path)`에서 title/description을 기본으로 가져온다.

- [ ] **Step 1: `lib/metadata.ts`**

```ts
import type { Metadata } from "next";
import { getRoute } from "./routes";

type Overrides = { title?: string; description?: string; ogImage?: string };

export function pageMetadata(path: string, overrides: Overrides = {}): Metadata {
  const route = getRoute(path);
  const title = overrides.title ?? route.title;
  const description = overrides.description ?? route.description;
  const images = overrides.ogImage ? [{ url: overrides.ogImage }] : undefined;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: "website", locale: "ko_KR", siteName: "단서공방", ...(images ? { images } : {}) },
    twitter: { card: "summary_large_image", title, description, ...(images ? { images } : {}) },
  };
}
```
`openGraph.images`를 생략하면 Next가 `app/opengraph-image.tsx`를 자동으로 붙인다.

- [ ] **Step 2: `app/layout.tsx` 메타 교체**

21–55행의 `metadata`를:
```ts
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "단서공방 | 영어 미스터리 수업과 추리 콘텐츠", template: "%s | 단서공방" },
  description: "단서공방이 만든 머더미스터리 작품과 제작 기록, 영어 미스터리 수업팩과 학원 운영 도구를 소개합니다.",
  keywords: ["단서공방", "ProjectDullG", "머더미스터리", "추리 콘텐츠", "영어 미스터리 수업팩", "학원 관리"],
  openGraph: { type: "website", locale: "ko_KR", siteName: "단서공방" },
  twitter: { card: "summary_large_image" },
};
```
`icons` 항목 삭제(`app/icon.svg`가 자동 처리). `import { SITE_URL } from "@/lib/site";`로 별칭 통일. 폰트: `DM_Sans` import와 `dmSans` 선언, `fontVars`에서 제거. `Noto_Sans_KR` weight를 `["400", "500", "700"]`로. (`--font-sans`를 쓰는 CSS 16곳은 `styles/`에서 `var(--font-noto-sans)`로 치환.)

- [ ] **Step 3: 홈 메타**

`app/page.tsx`에 `export const metadata = pageMetadata("/", { title: "단서공방 | 영어 미스터리 수업과 추리 콘텐츠" });` — 홈만 template를 피하려면 `title: { absolute: "단서공방 | 영어 미스터리 수업과 추리 콘텐츠" }` 형태로 `pageMetadata`가 `absoluteTitle?: string`을 받도록 확장:
```ts
type Overrides = { title?: string; absoluteTitle?: string; description?: string; ogImage?: string };
// title: overrides.absoluteTitle ? { absolute: overrides.absoluteTitle } : title,
```

- [ ] **Step 4: 각 페이지 메타를 헬퍼로 교체**

| 파일 | 호출 |
|---|---|
| `app/works/page.tsx` | `pageMetadata("/works", { title: "작품과 펀딩" })` |
| `app/activity/page.tsx` | `pageMetadata("/activity")` |
| `app/activity/ulleung-high-living-lab/page.tsx` | `pageMetadata("/activity/ulleung-high-living-lab", { description: "2026년 9월 5일 울릉고 리빙랩 특강과 공개 수업 자료를 안내합니다." })` |
| `app/about/page.tsx` | `pageMetadata("/about", { description: "머더미스터리 작품과 영어 미스터리 수업팩을 만드는 단서공방(ProjectDullG)을 소개합니다." })` |
| `app/academy/page.tsx` | `pageMetadata("/academy", { title: "영어 미스터리 수업팩" })` |
| `app/academy/curriculum/page.tsx` | `pageMetadata("/academy/curriculum")` (신규) |
| `app/academy/sample/page.tsx` | `pageMetadata("/academy/sample", { title: "수업 자료 미리보기" })` |
| `app/academy/pilot/page.tsx` | `pageMetadata("/academy/pilot", { title: "파일럿 안내와 검토팩 요청" })` |
| `app/episode/page.tsx` | `pageMetadata("/episode", { title: \`에피소드 01 · ${episodeTitle}\`, description: \`${episodeFullTitle}. 학원 3층에서 두 개의 열쇠가 사라졌습니다. 네 학생이 단서를 모아 사건을 해결합니다.\` })` |
| `app/materials/page.tsx` | `pageMetadata("/materials")` |
| `app/materials/ulleung-high-living-lab/page.tsx` | `pageMetadata("/materials/ulleung-high-living-lab")` |
| `app/contact/page.tsx` | `pageMetadata("/contact", { description: "단서공방에 궁금한 것이 있으면 편하게 연락주세요. 영업일 1~2일 내 답변합니다." })` |
| `app/privacy/page.tsx` | `pageMetadata("/privacy", { description: "단서공방 검토팩 요청 및 파일럿 문의 과정에서 처리하는 개인정보 안내입니다." })` |
| `app/sitemap/page.tsx` | `pageMetadata("/sitemap")` |
`app/works/[slug]/page.tsx`의 `generateMetadata`는 `title: work.title`(템플릿 적용), `openGraph.url: \`/works/${work.slug}\`` 추가.

- [ ] **Step 5: OG 이미지와 아이콘**

`app/icon.svg` (헤더 `.brand-mark`의 3선을 그대로):
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#111412"/>
  <rect x="16" y="18" width="32" height="5" rx="2.5" fill="#fff"/>
  <rect x="16" y="29.5" width="24" height="5" rx="2.5" fill="#fff"/>
  <rect x="16" y="41" width="32" height="5" rx="2.5" fill="#c96645"/>
</svg>
```
`app/opengraph-image.tsx`:
```tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "단서공방 — 머더미스터리 작품과 영어 미스터리 수업팩";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#111412", color: "#fff", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ width: 88, height: 12, background: "#fff", borderRadius: 6 }} />
          <div style={{ width: 66, height: 12, background: "#fff", borderRadius: 6 }} />
          <div style={{ width: 88, height: 12, background: "#c96645", borderRadius: 6 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: -2 }}>단서공방</div>
          <div style={{ fontSize: 34, color: "#cfd3cf" }}>머더미스터리 작품 · 영어 미스터리 수업팩 · 학원 운영 도구</div>
        </div>
      </div>
    ),
    size,
  );
}
```
한글 폰트가 edge 런타임 기본 폰트에 없으면 네모로 렌더된다. 확인: `curl -s -o /tmp/og.png http://localhost:3000/opengraph-image && open /tmp/og.png`. 네모가 보이면 `public/fonts/NotoSansKR-Bold.otf`(Google Fonts에서 받은 OFL 파일)를 추가하고 `fetch(new URL("../public/fonts/NotoSansKR-Bold.otf", import.meta.url)).then(r => r.arrayBuffer())`로 로드해 `fonts: [{ name: "Noto Sans KR", data, weight: 700 }]` 옵션을 넘긴다. `runtime = "edge"`는 Cloudflare/vinext 배포에서 문제가 되면 제거한다(nodejs 기본).
```bash
git rm -q public/og.webp public/og.png public/favicon.svg
```

- [ ] **Step 6: 404·오류 페이지**

`app/not-found.tsx`:
```tsx
import Link from "next/link";
import { Kicker, PageFrame } from "@/components/site";

export default function NotFound() {
  return (
    <PageFrame>
      <section className="inner-hero shell not-found">
        <Kicker>404</Kicker>
        <h1>
          찾는 페이지가
          <br />
          <em>여기에는 없습니다.</em>
        </h1>
        <p>주소가 바뀌었거나 잘못 입력되었을 수 있습니다. 아래에서 원하는 곳으로 이동하세요.</p>
        <div className="not-found-actions">
          <Link className="button button-dark" href="/">홈으로</Link>
          <Link href="/academy">교육 수업팩</Link>
          <Link href="/works">작품</Link>
          <Link href="/contact">문의하기</Link>
        </div>
      </section>
    </PageFrame>
  );
}
```
`app/error.tsx`:
```tsx
"use client";

import Link from "next/link";
import { Footer, Header, Kicker } from "@/components/site";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <>
      <Header />
      <main id="main-content">
        <section className="inner-hero shell not-found">
          <Kicker>오류</Kicker>
          <h1>
            페이지를 불러오지
            <br />
            <em>못했습니다.</em>
          </h1>
          <p>잠시 후 다시 시도해 주세요. 계속 반복되면 문의 페이지로 알려주시면 확인하겠습니다.</p>
          <div className="not-found-actions">
            <button className="button button-dark" type="button" onClick={reset}>다시 시도</button>
            <Link href="/">홈으로</Link>
            <Link href="/contact">문의하기</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
```
`styles/pages/misc.css`:
```css
.not-found-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  align-items: center;
  margin-top: 28px;
}
.not-found-actions a:not(.button) {
  color: var(--ink);
  text-decoration: underline;
  text-underline-offset: 4px;
}
```

- [ ] **Step 7: 검증·커밋**

```bash
npx tsc --noEmit
curl -s http://localhost:3000/academy | grep -oE '<title>[^<]+</title>|rel="canonical" href="[^"]+"|property="og:url" content="[^"]+"'
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/works/does-not-exist   # 404
curl -s http://localhost:3000/works/does-not-exist | grep -c "찾는 페이지가"          # 1
```
Expected: `<title>영어 미스터리 수업팩 | 단서공방</title>`, canonical `/academy`, og:url `/academy`.
```bash
git add -A app lib public styles
git commit -m "feat(seo): per-page metadata helper, generated OG image, brand icon, 404 and error pages"
```

---

### Task 8: 헤더·푸터·홈 구조, 학원 관리 진입점, 모바일 메뉴 동작

**Files:**
- Modify: `components/header.tsx`, `components/site.tsx`, `app/page.tsx`, `styles/site.css`

- [ ] **Step 1: 헤더**

`components/header.tsx` 전체 교체:
```tsx
"use client";

import { ArrowUpRight, List, X } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { primaryNavigation } from "@/lib/navigation";
import { BRAND } from "@/lib/site-config";

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // 경로가 바뀌면 메뉴를 닫는다.
  useEffect(() => { setIsOpen(false); }, [pathname]);

  // 열려 있는 동안 배경 스크롤 잠금 + Esc로 닫기.
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", onKey); };
  }, [isOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="site-header">
      <nav className="nav shell" aria-label="주요 메뉴">
        <Link className="brand" href="/" aria-label="단서공방 홈">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span className="brand-name">{BRAND.name}<small>{BRAND.englishName}</small></span>
        </Link>

        <div className="nav-links">
          {primaryNavigation.map((link) => (
            <Link key={link.href} href={link.href} aria-current={isActive(link.href) ? "page" : undefined}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="nav-actions">
          <Link className="nav-login" href="/login">학원 관리</Link>
          <Link className="nav-cta" href="/contact">
            문의하기
            <ArrowUpRight size={17} weight="bold" aria-hidden="true" />
          </Link>
        </div>

        <button
          className="nav-menu-button"
          type="button"
          aria-label={isOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <X size={24} /> : <List size={24} />}
        </button>
      </nav>

      <div className={`mobile-navigation ${isOpen ? "is-open" : ""}`} id="mobile-navigation" aria-hidden={!isOpen}>
        <div className="shell">
          {primaryNavigation.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}>{link.label}</Link>
          ))}
          <Link className="mobile-navigation-cta" href="/contact" onClick={() => setIsOpen(false)}>
            문의하기
            <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
          </Link>
          <Link className="mobile-navigation-login" href="/login" onClick={() => setIsOpen(false)}>
            학원 관리 로그인 →
          </Link>
        </div>
      </div>
    </header>
  );
}
```
`styles/site.css`에 추가(기존 `.nav-cta` 규칙 옆):
```css
.nav-actions {
  display: flex;
  align-items: center;
  gap: 18px;
}
.nav-login {
  font-size: 14px;
  color: var(--text-muted);
  text-decoration: none;
}
.nav-login:hover,
.nav-login:focus-visible {
  color: var(--ink);
}
.mobile-navigation-login {
  display: block;
  margin-top: 16px;
  font-size: 14px;
  color: var(--text-muted);
}
@media (max-width: 900px) {
  .nav-actions .nav-login {
    display: none;
  }
}
```
`.mobile-navigation` 배경색이 `#f7f5ef`이면 `var(--cream)`으로 바꿔 헤더와 이음새를 없앤다.

- [ ] **Step 2: 푸터 링크**

`components/site.tsx` `Footer`의 "문의" 열 `site-footer-sample` 링크 아래에:
```tsx
<Link className="site-footer-login" href="/login">학원 관리 로그인</Link>
```
`styles/site.css`: `.site-footer-login { display: block; margin-top: 10px; font-size: 13px; color: rgba(255, 255, 255, 0.72); }` (푸터가 어두운 배경일 때; 밝으면 `var(--text-muted)`). `site.tsx` 9행 `export { curriculum };`와 68행 `export { Header } from "./header";` 재-export를 삭제하고, `Header`는 명시적으로 `export { Header }`를 유지(다른 파일이 `@/components/site`에서 `Header`를 import하므로 `import { Header } from "./header"; export { Header };` 형태로 하나만). `app/academy/curriculum/page.tsx`는 `curriculum`을 `@/lib/education`에서 import하도록 변경. 31행의 한 줄 압축 JSX를 여러 줄로 정리.

- [ ] **Step 3: 홈 랜드마크 구조**

`app/page.tsx`: 11–12행과 64–65행을 바꿔 `Header`/`Footer`를 `main` 밖으로:
```tsx
return (
  <>
    <Header />
    <main className="brand-home" id="main-content">
      …sections…
    </main>
    <Footer />
  </>
);
```
`.brand-home`에 걸린 스타일(`styles/pages/home.css`)이 header/footer를 포함하던 배경이라면 `body`나 `.brand-home` 배경 지정을 확인해 화면이 같도록 조정한다(스크린샷 diff로 확인).

- [ ] **Step 4: 확인·커밋**

```bash
node scripts/screenshot-public.mjs header && node scripts/screenshot-diff.mjs contrast header
```
Expected: 헤더 우측에 "학원 관리" 텍스트 링크가 생긴 1440px 스크린샷만 상단 소폭 변화, 홈은 구조 변경으로 변화 0에 가까움(0이 아니면 배경 이슈 확인).
```bash
npx tsc --noEmit && git add -A components app styles && git commit -m "feat(nav): academy-login entry points, mobile menu scroll lock and route close, fix home landmarks"
```

---

### Task 9: 이미지 교체, 자산 삭제, 제목 상수 적용

**Files:**
- Modify: `app/page.tsx`, `app/academy/page.tsx`, `app/academy/sample/page.tsx`, `app/episode/page.tsx`, `app/about/page.tsx`, `styles/pages/home.css`, `styles/pages/academy.css`
- Delete: §2.2 목록 자산
- Create: `public/assets/brand/project-dullg-banner-top.webp`

- [ ] **Step 1: 배너 크롭·변환**

macOS `sips`로 상단 3:5 영역(1701×2835)을 잘라 WebP로:
```bash
sips -c 2835 1701 public/assets/brand/project-dullg-banner.png --out /tmp/banner-top.png   # -c height width, 상단 기준
# webp 변환: cwebp가 없으면 `brew install webp`
cwebp -q 82 /tmp/banner-top.png -o public/assets/brand/project-dullg-banner-top.webp
sips -g pixelWidth -g pixelHeight public/assets/brand/project-dullg-banner-top.webp
```
`sips -c`는 중앙 기준 크롭이므로 상단이 필요하면 `--cropOffset 0 0`을 추가한다. 결과가 1701×2835인지 확인. `app/about/page.tsx` 68행 → `src="/assets/brand/project-dullg-banner-top.webp" width={1701} height={2835}`. 원본 PNG 삭제.

- [ ] **Step 2: 홈 교육 섹션 이미지**

`app/page.tsx` 46행의 `<figure>`를:
```tsx
<figure className="brand-education-cards">
  <Image src="/assets/dullg/card-cover-1.png" width={408} height={650} alt="윤지원 소지품 카드 앞면" sizes="(max-width: 760px) 45vw, 22vw" />
  <Image src="/assets/dullg/card-body-1.png" width={408} height={650} alt="윤지원 소지품 카드 뒷면의 영어 단서" sizes="(max-width: 760px) 45vw, 22vw" />
</figure>
```
`styles/pages/home.css`:
```css
.brand-education-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;
  margin: 0;
}
.brand-education-cards img {
  width: 100%;
  height: auto;
  border-radius: var(--radius-md);
  box-shadow: 0 10px 30px rgba(17, 20, 18, 0.12);
}
.brand-education-cards img:last-child {
  transform: translateY(24px);
}
```
기존 `.brand-education-grid figure img` 규칙이 있으면 새 클래스가 우선하도록 순서를 맞춘다.

- [ ] **Step 3: 샘플 페이지 갤러리 교체 + 교사용 항목**

`app/academy/sample/page.tsx` 91–112행 `gallery-images`를 4장 그리드로:
```tsx
<div className="gallery-images">
  <figure>
    <Image src="/assets/dullg/case-intro.png" alt={`${episodeTitle} 규칙서의 사건 도입 페이지`} width={944} height={1330} sizes="(max-width: 760px) 100vw, 25vw" />
    <figcaption>규칙서 · 사건 도입</figcaption>
  </figure>
  <figure>
    <Image src="/assets/dullg/timeline-yoon.png" alt="윤지원의 영어 타임라인과 공개 정보 페이지" width={944} height={1330} sizes="(max-width: 760px) 100vw, 25vw" />
    <figcaption>규칙서 · 인물 타임라인</figcaption>
  </figure>
  <figure>
    <Image src="/assets/dullg/rulebook-flow.png" alt="한 라운드의 진행 흐름 다섯 단계" width={944} height={1330} sizes="(max-width: 760px) 100vw, 25vw" />
    <figcaption>규칙서 · 진행 흐름</figcaption>
  </figure>
  <figure>
    <Image src="/assets/dullg/rulebook-map-detailed.png" alt="학원 3층 평면도와 범례" width={944} height={1330} sizes="(max-width: 760px) 100vw, 25vw" />
    <figcaption>규칙서 · 3층 평면도</figcaption>
  </figure>
</div>
```
헤딩 문구 `사건 자료와 규칙서.` 유지, 문단은 `연출 이미지 대신 현재 제작된 시제품을 그대로 보여드립니다.` 유지. 62–78행의 세 번째 `sample-card`(현재 `rulebook-flow.png`)는 갤러리와 중복되므로 `pre-survey.png`로 교체:
```tsx
<Image src="/assets/dullg/pre-survey.png" alt="게임 전 설문지 — 학생 배포용 A4 한 장" width={720} height={1018} sizes="(max-width: 760px) 100vw, 33vw" />
<div>
  <span className="sample-label">TEACHER / PRE-SURVEY</span>
  <h2>수업 전에 나눠 주는<br /><em>게임 전 설문지</em></h2>
</div>
```
(`pre-survey.png` 실제 크기 확인: `sips -g pixelWidth -g pixelHeight public/assets/dullg/pre-survey.png` — 위 720×1018을 실제 값으로 바꾼다.)
`styles/pages/academy.css`의 `.gallery-images`를 4열(모바일 2열)로:
```css
.gallery-images {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
@media (max-width: 760px) {
  .gallery-images {
    grid-template-columns: repeat(2, 1fr);
  }
}
```
Kicker `수업용 시제품 · CASE FILE 01` → `수업용 시제품 · ${episodeTitle}`.

- [ ] **Step 4: 제목 상수 적용**

- `app/academy/page.tsx` 39–40행: `width={944} height={1330}`, alt `\`${episodeFullTitle} 규칙서 표지\``, figcaption `\`CASE FILE 01 · ${episodeTitle}\``.
- `app/episode/page.tsx`: h1을 `<h1>{episodeTitle}<br /><em>{episodeSubtitle}</em></h1>`, 이미지 alt `\`${episodeTitle} 규칙서 표지\``. 43–45행 chips 3개를 `educationFacts.slice(0, 3).map(([v]) => <span key={v}>{v}</span>)`로. `steps` 배열 삭제 → `curriculum` import 사용(필드명 `session`, `label`, `title`, `body`, `output`).
- `app/about/page.tsx` 139행 `<em>보충반의 사라진 열쇠</em>` → `<em>{episodeFullTitle}</em>`.
- `grep -rn "보충반의 사라진 열쇠" app components lib | grep -v education.ts` → 0건이어야 한다.

- [ ] **Step 5: 미참조 자산 삭제**

```bash
for f in mat-game-cards.png mat-game-cards.webp mat-story-book.png mat-story-book.webp mat-rulebook.png mat-rulebook.webp mat-teacher-guide.png mat-teacher-guide.webp mat-report.png mat-report.webp mat-workbook.png students-investigation.png classroom-case.png; do
  grep -rq "$f" app components lib && echo "STILL REFERENCED: $f" || git rm -q "public/assets/dullg/$f"
done
git rm -q public/assets/works/murder-mystery-three-cover.webp public/assets/brand/project-dullg-banner.png
du -sh public
```
Expected: `STILL REFERENCED` 0건, `public` ≈ 5MB.

- [ ] **Step 6: 테스트 갱신·확인·커밋**

`tests/rendered-html.test.mjs` 19행 `mat-game-cards.webp` → `card-cover-1.png`. 
```bash
node scripts/screenshot-public.mjs images && node scripts/screenshot-diff.mjs header images
```
Expected: 홈(교육 섹션), `/academy/sample`, `/about`(배너), `/episode`(제목)만 변화.
```bash
npx tsc --noEmit && git add -A && git commit -m "content: replace AI mockups with real prototype assets, unify episode title, drop 21MB unused images"
```

---

### Task 10: CTA 통일, 문의·개인정보 정리, 폼 개선

**Files:**
- Modify: `app/page.tsx`, `app/about/page.tsx`, `app/academy/sample/page.tsx`, `app/episode/page.tsx`, `app/privacy/page.tsx`, `app/academy/curriculum/page.tsx`, `app/contact/page.tsx`, `app/sitemap/page.tsx`, `components/form-section.tsx`

- [ ] **Step 1: CTA 목적지**

`ArrowButton href="/#apply"` 3곳(`about:148`, `sample:131`, `episode:164`)에서 `href` 제거(기본값 `/academy/pilot`). `privacy:116` → `href="/academy/pilot"`, 문구 `검토팩 요청으로 돌아가기`. `sitemap/page.tsx` 153행 CTA → `href="/academy/pilot"`, 문구 `검토팩 요청`.

- [ ] **Step 2: 홈 `#apply` 섹션**

`app/page.tsx` 57–62행:
```tsx
<section className="brand-contact" id="apply" aria-labelledby="brand-contact-title">
  <div className="shell brand-contact-inner">
    <div>
      <Kicker>검토팩 요청</Kicker>
      <h2 id="brand-contact-title">자료를 먼저 보고<br />판단하세요.</h2>
    </div>
    <div>
      <p>무료 검토팩을 보내드립니다. 구매나 파일럿 참여 의무는 없습니다. 작품과 협업 문의는 이메일로 받습니다.</p>
      <div className="brand-hero-actions">
        <Link className="button button-dark" href="/academy/pilot">무료 검토팩 요청 <ArrowRight size={17} weight="bold" aria-hidden="true" /></Link>
        <Link href="/contact">일반 문의 <ArrowRight size={17} weight="bold" aria-hidden="true" /></Link>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: `/contact`**

`contact-email-block` 아래에 응답 시간과 검토팩 버튼:
```tsx
<p className="contact-response">{BRAND.responseTime}</p>
<Link className="button button-dark" href="/academy/pilot">
  무료 검토팩 요청 <ArrowRight size={17} weight="bold" aria-hidden="true" />
</Link>
```
(`ArrowRight` import, `Link` import 추가.) `styles/pages/misc.css`: `.contact-response { margin: 8px 0 20px; font-size: 14px; color: var(--text-muted); }`.

- [ ] **Step 4: `/privacy` 항목 일치**

22–23행:
```tsx
<li>필수: 기관명, 연락처(휴대전화 또는 이메일), 관심 유형, 개인정보 수집·이용 동의</li>
```
선택 항목 줄 삭제. 본문 "DullG" 6곳 → "단서공방". Kicker `PRIVACY · DULLG PILOT` → `개인정보 처리 안내`. 3행 import를 `@/components/site`로. 시행일 아래에 `<strong>최근 수정</strong><span>2026년 9월 3일</span>` 추가.

- [ ] **Step 5: 폼 개선**

`components/form-section.tsx`:
- `handleSubmit` 앞에 허니팟 체크: `if (data.get("_honey")) { setState("success"); return; }`
- 폼 안 첫 줄에 `<input type="text" name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: -9999, opacity: 0 }} />`
- 성공 패널에 버튼 추가: `<button type="button" className="button button-light" onClick={() => setState("idle")}>다른 요청 보내기</button>`
- JSON body에 `_honey: data.get("_honey") ?? ""` 는 넣지 않는다(FormSubmit의 `_honey`는 필드 이름 자체로 동작).

- [ ] **Step 6: 확인·커밋**

```bash
grep -rn '"/#apply"' app components | wc -l     # 0
grep -rn "DullG" app --include=*.tsx | grep -v englishName | grep -v ProjectDullG   # 0건
npx tsc --noEmit
git add -A && git commit -m "content: route every review-pack CTA to the pilot form, align privacy notice with the form, add honeypot and resend"
```

---

### Task 11: 대시보드 프리뷰 컴포넌트와 운영 도구 섹션, 홈 언급

**Files:**
- Create: `components/dashboard-preview.tsx`
- Modify: `app/academy/page.tsx`, `app/page.tsx`, `styles/pages/academy.css`, `styles/pages/home.css`, `tests/rendered-html.test.mjs`

- [ ] **Step 1: 실패하는 렌더 테스트 추가**

`tests/rendered-html.test.mjs`의 "renders detailed product routes" 테스트에 추가:
```js
assert.match(academy, /id="tools"/);
assert.match(academy, /학원 운영까지 함께 정리합니다/);
assert.match(academy, /class="dash-preview"/);
assert.match(academy, /href="\/login"/);
```
홈 테스트에: `assert.match(html, /href="\/academy#tools"/);`
(빌드가 필요하므로 Task 12에서 실행. 여기서는 `curl`로 확인.)

- [ ] **Step 2: 프리뷰 컴포넌트**

`components/dashboard-preview.tsx` (서버 컴포넌트, 이미지 없음):
```tsx
const stats = [
  ["학원생", "24명"],
  ["반", "4개"],
  ["이번 달 성적 기록", "96건"],
];
const rows = [
  ["김서연", "중1 A반", "3차시", "88점", "상"],
  ["이도윤", "중1 A반", "3차시", "76점", "중"],
  ["박하린", "초6 B반", "2차시", "92점", "상"],
];

export function DashboardPreview() {
  return (
    <figure className="dash-preview" aria-hidden="true">
      <div className="dash-preview-window">
        <aside className="dash-preview-side">
          <b>단서영어학원</b>
          <span className="is-active">대시보드</span>
          <span>학원생</span>
          <span>반 관리</span>
          <span>성적 입력</span>
          <span>성적 리포트</span>
        </aside>
        <div className="dash-preview-main">
          <div className="dash-preview-stats">
            {stats.map(([label, value]) => (
              <div key={label}><small>{label}</small><strong>{value}</strong></div>
            ))}
          </div>
          <div className="dash-preview-table">
            <div className="dash-preview-row is-head"><span>학생</span><span>반</span><span>차시</span><span>점수</span><span>참여</span></div>
            {rows.map((r) => (
              <div className="dash-preview-row" key={r[0]}>{r.map((c, i) => <span key={i}>{c}</span>)}</div>
            ))}
          </div>
          <div className="dash-preview-bars">
            {[64, 82, 71, 90].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}
          </div>
        </div>
      </div>
      <figcaption>학원 관리 화면 예시 · 실제 데이터가 아닙니다</figcaption>
    </figure>
  );
}
```
`styles/pages/academy.css`:
```css
.dash-preview {
  margin: 0;
}
.dash-preview-window {
  display: grid;
  grid-template-columns: 132px 1fr;
  min-height: 300px;
  overflow: hidden;
  border: 1px solid rgba(17, 20, 18, 0.12);
  border-radius: var(--radius-md);
  background: var(--cream);
  box-shadow: 0 18px 40px rgba(17, 20, 18, 0.12);
  font-size: 11px;
}
.dash-preview-side {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 12px;
  background: var(--ink);
  color: rgba(255, 255, 255, 0.7);
}
.dash-preview-side b {
  margin-bottom: 8px;
  color: #fff;
  font-size: 12px;
}
.dash-preview-side .is-active {
  padding: 5px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}
.dash-preview-main {
  display: grid;
  gap: 12px;
  padding: 16px;
  background: var(--surface);
}
.dash-preview-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.dash-preview-stats div {
  display: grid;
  gap: 4px;
  padding: 10px;
  border-radius: 8px;
  background: var(--cream);
}
.dash-preview-stats small {
  color: var(--text-muted);
}
.dash-preview-stats strong {
  font-size: 16px;
}
.dash-preview-table {
  border-radius: 8px;
  background: var(--cream);
}
.dash-preview-row {
  display: grid;
  grid-template-columns: 1.2fr 1fr 0.7fr 0.7fr 0.6fr;
  padding: 7px 10px;
  border-top: 1px solid rgba(17, 20, 18, 0.08);
}
.dash-preview-row.is-head {
  border-top: 0;
  color: var(--text-muted);
}
.dash-preview-bars {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  height: 56px;
  padding: 0 10px;
}
.dash-preview-bars i {
  flex: 1;
  border-radius: 4px 4px 0 0;
  background: var(--orange);
}
.dash-preview figcaption {
  margin-top: 10px;
  font-size: 12px;
  color: var(--text-muted);
}
@media (max-width: 760px) {
  .dash-preview-window {
    grid-template-columns: 1fr;
  }
  .dash-preview-side {
    flex-direction: row;
    flex-wrap: wrap;
  }
}
```

- [ ] **Step 3: `/academy` 운영 도구 섹션**

`app/academy/page.tsx` "구성 안내" 섹션(64행 `</section>`) 다음에:
```tsx
<section className="academy-tools" id="tools" aria-labelledby="academy-tools-title">
  <div className="shell academy-tools-grid">
    <div>
      <Kicker>운영 도구</Kicker>
      <h2 id="academy-tools-title">수업만 드리지 않습니다.<br /><em>학원 운영까지 함께 정리합니다.</em></h2>
      <p>수업팩과 함께 웹 대시보드를 제공합니다. 학원생과 반을 등록하고 차시별 점수를 남기면, 리포트와 학생 본인 조회 화면이 자동으로 만들어집니다.</p>
      <ul className="academy-tools-list">
        {tools.map((t) => (
          <li key={t.title}><b>{t.title}</b><span>{t.body}</span></li>
        ))}
      </ul>
      <div className="academy-overview-actions">
        <Link className="button button-dark" href="/academy/pilot">무료 검토팩 요청 <ArrowRight size={17} weight="bold" aria-hidden="true" /></Link>
        <Link href="/login">학원 관리 로그인 <ArrowRight size={17} weight="bold" aria-hidden="true" /></Link>
      </div>
    </div>
    <DashboardPreview />
  </div>
</section>
```
파일 상단에:
```ts
const tools = [
  { title: "학원생 등록과 반 편성", body: "이름·학년·연락처를 등록하고 반에 배정합니다." },
  { title: "차시별 점수와 참여도", body: "4차시마다 점수와 참여도(상·중·하), 메모를 남깁니다." },
  { title: "일반 시험 성적과 리포트", body: "과목별 시험 점수까지 한곳에서 보고 반별·기간별로 비교합니다." },
  { title: "학생 본인 조회", body: "학생은 학원 코드로 계정을 연결해 자기 성적만 확인합니다." },
];
```
12–17행 `facts` 삭제 → `educationFacts` import. `pathways`에 5번째 항목 `{ number: "05", title: "학원 운영 도구", body: "학원생·반·성적을 정리하는 대시보드를 소개합니다.", href: "#tools", cta: "운영 도구", icon: ChartBar }` 추가(`ChartBar` import). `styles/pages/academy.css`:
```css
.academy-tools {
  padding: 96px 0;
  background: var(--surface);
}
.academy-tools-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 56px;
  align-items: center;
}
.academy-tools-list {
  display: grid;
  gap: 14px;
  margin: 28px 0 32px;
  padding: 0;
  list-style: none;
}
.academy-tools-list li {
  display: grid;
  gap: 4px;
  padding-left: 18px;
  border-left: 2px solid var(--orange);
}
.academy-tools-list span {
  color: var(--text-muted);
  font-size: 15px;
}
@media (max-width: 900px) {
  .academy-tools {
    padding: 64px 0;
  }
  .academy-tools-grid {
    grid-template-columns: 1fr;
    gap: 36px;
  }
}
```

- [ ] **Step 4: 홈 교육 섹션 한 줄**

`app/page.tsx` 교육 섹션의 `<dl>` 다음에:
```tsx
<p className="brand-education-tools">학원생·반·성적을 정리하는 <Link href="/academy#tools">운영 도구</Link>가 함께 제공됩니다.</p>
```
`styles/pages/home.css`: `.brand-education-tools { margin: 18px 0 8px; font-size: 15px; color: var(--text-muted); } .brand-education-tools a { color: var(--ink); text-decoration: underline; text-underline-offset: 4px; }`

- [ ] **Step 5: 확인·커밋**

```bash
curl -s http://localhost:3000/academy | grep -c 'id="tools"'      # 1
node scripts/screenshot-public.mjs tools && node scripts/screenshot-diff.mjs images tools
```
Expected: `/academy`와 홈 교육 섹션만 변화. 390px에서 프리뷰가 세로 배치로 접히는지 스크린샷으로 확인.
```bash
npx tsc --noEmit && git add -A && git commit -m "feat(academy): showcase the academy management dashboard with a CSS-drawn preview"
```

---

### Task 12: 컴포넌트 추출·데이터 중복 제거·포맷·접근성 마무리·최종 검증

**Files:**
- Create: `components/section-head.tsx`
- Modify: 페이지 22곳의 Kicker→h2→p 블록, `app/about/page.tsx`, `app/works/page.tsx`, `components/presentation-viewer.tsx`, `lib/education.ts`, `tests/rendered-html.test.mjs`

- [ ] **Step 1: `SectionHead`**

```tsx
import type { ReactNode } from "react";
import { Kicker } from "./site";

type Props = {
  kicker: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  id?: string;
  className?: string;
  as?: "h1" | "h2";
};

export function SectionHead({ kicker, title, lead, id, className, as: Heading = "h2" }: Props) {
  return (
    <div className={className ? `section-head ${className}` : "section-head"}>
      <Kicker>{kicker}</Kicker>
      <Heading id={id}>{title}</Heading>
      {lead ? <p>{lead}</p> : null}
    </div>
  );
}
```
기존 페이지의 head 블록(예: `academy/page.tsx` 50–54행 `academy-overview-map-head`)을 `<SectionHead className="academy-overview-map-head" kicker="구성 안내" title={<>필요한 내용을<br /><em>항목별로 확인하세요.</em></>} lead="각 페이지는 …" />` 로 치환. 기존 클래스명을 `className`으로 넘겨 CSS 선택자를 유지하므로 스타일 변화 없음. 대상: `page.tsx`(2), `academy/page.tsx`(2), `about/page.tsx`(3), `works/page.tsx`(3), `activity/page.tsx`(2), `episode/page.tsx`(4), `sitemap/page.tsx`(2), `academy/curriculum/page.tsx`(2), `academy/pilot/page.tsx`(2), `academy/sample/page.tsx`(3). 이미 `<div>` 래퍼가 없는 곳(부모 섹션에 바로 Kicker/h2가 있는 경우)은 새 `div.section-head`가 추가되므로 `styles/base.css`에 `.section-head { display: contents; }`를 두어 레이아웃에 영향이 없게 한다. 

- [ ] **Step 2: About 신념 h3, works 클램프**

`app/about/page.tsx` 121–125행 `<strong>…split("\n")…</strong>` → `<h3>{item.title}</h3>`, 데이터의 `\n` → `<br />` 대신 짧은 한 줄 제목으로 정리(`설정보다 행동이 먼저 보여야 합니다` 등). `styles/pages/about.css`의 `.belief-item strong` 선택자를 `.belief-item h3`로.
`styles/pages/works.css`의 `-webkit-line-clamp` 규칙 삭제.

- [ ] **Step 3: 프레젠테이션 뷰어 최적화**

`components/presentation-viewer.tsx` 43행: `unoptimized` 제거, `priority={index === 0}`, `loading={index === 0 ? undefined : "lazy"}`.

- [ ] **Step 4: 한 줄 JSX·import 정리**

```bash
npx prettier --write "app/**/*.tsx" "components/**/*.tsx" "lib/**/*.ts" --print-width 100
grep -rn 'from "\.\./\.\./' app components | wc -l   # 0
```
`lib/education.ts`의 `MaterialLink`, `lib/works.ts`의 `WorkStatus`가 외부에서 안 쓰이면 `export` 제거(타입은 파일 내부용으로 유지).

- [ ] **Step 5: 최종 스크린샷 diff**

```bash
node scripts/screenshot-public.mjs after && node scripts/screenshot-diff.mjs before after
```
diff PNG(`.design-audit/public-refactor/diff-after/`)를 페이지별로 열어 변화가 모두 의도된 것인지 확인한다. 의도된 변화 목록: 보조 텍스트 색, 헤더 "학원 관리", 홈 교육 이미지·한 줄, `/academy` 운영 도구 섹션·5번째 경로 카드, `/academy/sample` 갤러리, `/about` 배너·h3, `/episode` 제목·chips, `/works` 클램프 해제(390px), `/contact` 버튼, `/privacy` 문구, `/activity` 예정 라벨.

- [ ] **Step 6: 전체 검증**

```bash
npx tsc --noEmit
npm run lint
npm test          # build + 모든 node:test
wc -l styles/**/*.css styles/*.css | tail -1     # ≤ 4300
node scripts/css-dead-classes.mjs 2>&1 | tail -1 # 0 dead classes
```
`tests/rendered-html.test.mjs`에 추가할 메타 검사:
```js
test("every public page has a unique templated title and its own canonical", async () => {
  const routes = ["academy", "academy/curriculum", "academy/sample", "academy/pilot", "episode", "works", "about", "contact", "activity", "materials", "privacy", "sitemap"];
  const titles = new Set();
  for (const r of routes) {
    const html = await readFile(routeHtml(`${r}.html`), "utf8");
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    assert.ok(title?.endsWith(" | 단서공방"), `${r}: ${title}`);
    assert.ok(!titles.has(title), `duplicate title ${title}`);
    titles.add(title);
    assert.match(html, new RegExp(`rel="canonical" href="[^"]*/${r.replace("/", "\\/")}"`), `${r} canonical`);
    assert.doesNotMatch(html, /DullG(?! ?\))/, `${r} uses DullG standalone`);
  }
});
```
(`DullG` 정규식은 `ProjectDullG`와 `(ProjectDullG)`를 허용해야 하므로 실제로는 `/(?<!Project)DullG/` 를 사용.)

- [ ] **Step 7: 커밋과 문서**

`docs/superpowers/specs/2026-09-03-public-site-quality-design.md` §7 검증 기준 옆에 실제 수치(CSS 줄수, public 용량)를 적는다.
```bash
git add -A && git commit -m "refactor(site): SectionHead component, data dedupe, image lazy-loading, final verification"
```

---

## Self-Review

- **Spec coverage:** §2.1 제목 → Task 6/9. §2.2 이미지 → Task 9. §2.3 전환 → Task 10. §2.4 운영 도구 → Task 11 (+ 헤더/푸터 진입점 Task 8). §2.5 시간 의존 → Task 6. §3.1 내비/레이아웃 → Task 5(브레이크포인트, scroll-padding), Task 8(스크롤 잠금, 경로 닫힘, 홈 랜드마크). §3.2 메타 → Task 7. §3.3 404 → Task 7. §3.4 접근성 → Task 5(대비), Task 12(h3, 클램프, 뷰어). §4 CSS → Task 2–5. §5 구조 → Task 6(routes), Task 12(SectionHead, 중복, 미사용 export). §6 저장소 → Task 1(gitignore), Task 9(자산), Task 7(폰트). §7 검증 → Task 12.
- **Placeholder scan:** Task 6 Step 3의 `projectdg2.startsOn` 값은 확인 필요로 명시했고 기본값을 제공했다. Task 7 OG 한글 폰트는 조건부 절차를 적었다. Task 9 `pre-survey.png` 치수는 확인 명령을 적었다.
- **Type consistency:** `getWorkStatus(work, today)`, `currentWorks()`/`publishedWorks()` 함수화는 Task 6에서 정의하고 호출처(page/sitemap/works)도 같은 태스크에서 갱신. `pageMetadata(path, overrides)`의 `absoluteTitle`은 Step 3에서 확장한 시그니처를 Step 4 표가 따른다. `episodeTitle/Subtitle/FullTitle`은 Task 6 정의, Task 7/9에서 사용.
