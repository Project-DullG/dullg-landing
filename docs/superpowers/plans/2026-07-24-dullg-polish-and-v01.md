# DullG Site Polish + Landing v0.1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor globals.css for readability, fix navigation links and copy, then streamline the landing page to v0.1 structure (simplified hero, 6-item materials grid, lean form).

**Architecture:** Two phases — Phase 1 tackles code quality and polish (CSS reformat, dedup, nav, copy); Phase 2 implements v0.1 content changes (section removal, hero, flow, materials, form). Both phases modify the same core files sequentially. Phase 1 must fully commit before Phase 2 begins.

**Tech Stack:** Next.js (App Router), CSS (globals.css), TypeScript/TSX, vinext/Cloudflare deployment

---

## Specs
- `docs/superpowers/specs/2026-07-24-dullg-site-polish-design.md`
- `docs/superpowers/specs/2026-07-24-dullg-landing-v01-design.md`

## Files Touched

| File | Phase | Action |
|------|-------|--------|
| `app/globals.css` | 1 + 2 | Reformat → deduplicate → fix !important → add sections; later remove orphaned classes |
| `components/header.tsx` | 1 | **Create** — client component with `usePathname` + conditional nav links |
| `components/site.tsx` | 1 | Remove `Header` function, re-export from `./header` |
| `app/page.tsx` | 1 + 2 | Copy edits (kicker, flow-arrow); then section removal, hero, flow note, materials, form |
| `app/academy/sample/page.tsx` | 1 | Fix ArrowButton href |
| `app/academy/pilot/page.tsx` | 1 | Fix form disclaimer text |

---

## PHASE 1: Code Quality, Navigation, Copy

### Task 1: Format globals.css with Prettier

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Capture before state**

Run `npm run dev`, open http://localhost:3000 and note the visual state of: hero section, materials grid, curriculum page (`/academy/curriculum`), sample page (`/academy/sample`). This is the baseline.

- [ ] **Step 2: Install Prettier if needed and format**

```bash
npx prettier --version 2>/dev/null || npm install --save-dev prettier
npx prettier --write app/globals.css
```

- [ ] **Step 3: Verify build passes**

```bash
npm run build && npm test
```

Expected: build succeeds, test passes.
> Note: `npm test` checks the skeleton preview HTML (`app/_sites-preview/`), not landing page content. It is a build sanity check only — visual verification is the real regression gate.

- [ ] **Step 4: Visual verify**

Run `npm run dev`, compare all pages against baseline. Must look identical.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css package.json package-lock.json
git commit -m "style: format globals.css with prettier"
```

---

### Task 2: Add named section comments and sort media queries

**Files:**
- Modify: `app/globals.css`

After formatting the file is readable. Now divide it into 10 named sections. Each section's `@media` blocks move to the end of that section.

- [ ] **Step 1: Insert section header comments**

Add these comments at the correct locations (search for the first rule of each group):

```css
/* ============================================================
   1. TOKENS & BASE
   ============================================================ */
```

| Section | Insert before | Search anchor |
|---------|--------------|---------------|
| `1. TOKENS & BASE` | `:root {` | `:root {` |
| `2. LAYOUT & NAV` | `.nav {` | `.nav {` |
| `3. HOME HERO` | `.hero {` | `.hero {` |
| `4. STATEMENT / FEATURE / QUOTE` | `.statement {` | `.statement {` |
| `5. FINAL CTA & FOOTER` | `.final-cta {` | `.final-cta {` |
| `6. ACADEMY PAGES (SHARED)` | `.academy-hero {` | Replace existing `/* Academy pages */` comment |
| `7. LANDING PAGE (/)` | `.academy-landing {` | `.academy-landing {` |
| `8. SAMPLE PAGE` | `.sample-card {` (the one with `min-height: 500px`) | Look for `min-height: 500px` near `.sample-card` |
| `9. CURRICULUM PAGE` | `.detail-row {` (the updated version with `grid-template-columns: 78px`) | Look for `78px` in `.detail-row` |
| `10. GATEWAY / PATH` | `.gateway-hero {` (first occurrence) | `.gateway-hero {` |

- [ ] **Step 2: Move media queries to end of their section**

For each section, find `@media (max-width: 760px) { ... }` blocks that contain rules belonging to that section. Cut them and paste immediately after the last non-media rule of their section.

Order within a section: regular rules first, then `@media` block.

- [ ] **Step 3: Build and visual verify**

```bash
npm run build && npm test
npm run dev
```

All pages must look identical to baseline.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "style: add named sections and sort media queries in globals.css"
```

---

### Task 3: Consolidate duplicate class definitions

**Files:**
- Modify: `app/globals.css`

In CSS, when the same class appears multiple times at the same specificity, the **last definition wins per property**. Safe consolidation strategy: find all definitions of a class, take the last one as the base, then add any properties that only appeared in earlier definitions.

- [ ] **Step 1: Verify all duplicates are in the same file, same specificity**

```bash
grep -n "^\.sample-card {" app/globals.css
grep -n "^\.detail-row {" app/globals.css
grep -n "^\.gateway-hero {" app/globals.css
grep -n "^\.detail-art {" app/globals.css
```

Confirm all results are in `app/globals.css` (not injected elsewhere).

- [ ] **Step 2: Consolidate `.sample-card`**

There are 3+ `.sample-card` definitions. The final one contains:
```css
.sample-card {
  min-height: 500px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
```

Check earlier definitions for any properties absent from this block (e.g. `box-shadow`, `position: relative`, `overflow: hidden`). Add missing properties to the final block. Delete all earlier `.sample-card` blocks.

- [ ] **Step 3: Consolidate `.detail-row`**

Final definition contains `grid-template-columns: 78px 1fr 280px; gap: 42px; padding: 50px 0`. Earlier definition has `grid-template-columns: 100px 1fr 340px; gap: 50px; padding: 65px 0` — the later values override these, so no properties to rescue. Delete the earlier block. Keep the final.

- [ ] **Step 4: Consolidate `.gateway-hero`**

Two full definitions. Later one has `min-height: 650px; padding: 74px 0 92px; display: grid; grid-template-columns: 46% 54%; gap: 7%; align-items: center`. Earlier one has `padding: 145px 0 125px` and a different structure. The later definition is the intended final. Check for unique properties in earlier block. Delete earlier. Keep final.

- [ ] **Step 5: Consolidate `.detail-art`**

Basic definition (with `height: 205px; display: grid; place-items: center`) and later update (with `height: 176px; padding: 18px; display: flex; align-items: flex-end`). Keep later. Verify `before` pseudo-element styles are preserved.

- [ ] **Step 6: Build and visual verify**

```bash
npm run build && npm test
npm run dev
```

Check `/academy`, `/academy/curriculum`, `/academy/sample`, `/` visually against baseline.

- [ ] **Step 7: Commit**

```bash
git add app/globals.css
git commit -m "style: consolidate duplicate CSS class definitions"
```

---

### Task 4: Fix !important — replace with specificity selectors

**Files:**
- Modify: `app/globals.css`

Four `!important` declarations exist across two rules in the landing page section:

- `.landing-hero-sub { margin-top: -20px !important; }` — 1 declaration
- `.landing-assurance { font-size: 13px !important; color: rgba(21,37,30,.58) !important; margin: 20px 0 0 !important; }` — 3 declarations

Both override `.landing-hero-copy > p` which sets default paragraph styles.

Fix: use higher-specificity compound selectors.

- [ ] **Step 1: Find base rule**

Search for `.landing-hero-copy > p` in globals.css. Note its `margin`, `font-size`, `color` values.

- [ ] **Step 2: Replace !important rules**

Find and replace:

```css
/* BEFORE */
.landing-hero-sub {
  margin-top: -20px !important;
}
.landing-assurance {
  font-size: 13px !important;
  color: rgba(21, 37, 30, 0.58) !important;
  margin: 20px 0 0 !important;
}
```

```css
/* AFTER */
.landing-hero-copy > p.landing-hero-sub {
  margin-top: -20px;
}
.landing-hero-copy > p.landing-assurance {
  font-size: 13px;
  color: rgba(21, 37, 30, 0.58);
  margin: 20px 0 0;
}
```

- [ ] **Step 3: Confirm 0 !important remaining**

```bash
grep -c "!important" app/globals.css
```

Expected output: `0`

- [ ] **Step 4: Visual verify hero section**

Run `npm run dev`, check http://localhost:3000 hero area. The assurance text and sub-text below the CTA must look identical to baseline.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css
git commit -m "style: replace !important with specificity selectors in hero"
```

---

### Task 5: Conditional header nav links by page path

**Files:**
- Modify: `components/site.tsx`

`Header` is a server component using static markup. Adding `usePathname` requires converting to a client component.

- [ ] **Step 1: Extract `Header` into its own client component file**

> `"use client"` at the top of `site.tsx` would mark ALL exports (`Footer`, `PageFrame`, `Kicker`, `ArrowButton`, `curriculum`) as client-side. To avoid this, extract `Header` alone into a dedicated file.

Create `components/header.tsx`:

```tsx
"use client";

import { usePathname } from "next/navigation";

export function Header() {
  // ... (full implementation in Step 2)
}
```

In `components/site.tsx`: remove the `Header` function entirely. Add a re-export at the bottom:

```tsx
export { Header } from "./header";
```

All existing import sites (`app/page.tsx` already uses `Header` from `@/components/site`) continue to work unchanged.

- [ ] **Step 2: Implement `Header` in `components/header.tsx`**

```tsx
export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const navLinks = isHome
    ? [
        { href: "/#flow", label: "수업 방식" },
        { href: "/#materials", label: "제공 자료" },
        { href: "/#apply", label: "파일럿 안내" },
        { href: "/#apply", label: "샘플 요청" },
      ]
    : [
        { href: "/academy/curriculum", label: "수업 방식" },
        { href: "/academy/sample", label: "제공 자료" },
        { href: "/academy/pilot", label: "파일럿 안내" },
        { href: "/#apply", label: "샘플 요청" },
      ];

  return (
    <nav className="nav shell" aria-label="주요 메뉴">
      <a className="brand" href="/" aria-label="DullG 홈">
        <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
        <span>DullG</span>
      </a>
      <div className="nav-links">
        {navLinks.map((link) => (
          <a key={link.label} href={link.href}>{link.label}</a>
        ))}
      </div>
      <a className="nav-cta" href="/#apply">샘플·파일럿 문의 <span>↗</span></a>
    </nav>
  );
}
```

Note: home nav uses `/#apply` for both "파일럿 안내" and "샘플 요청" because `#pilot` is removed in Phase 2 (Task 8). Between Task 5 commit and Task 8 commit, clicking "파일럿 안내" on the home page will go to `#apply` instead of `#pilot` — this is a known temporary regression. Do not deploy Phase 1 independently if the site is live between phases.

- [ ] **Step 3: Build and verify**

```bash
npm run build && npm test
```

- [ ] **Step 4: Manual nav verify**

Run `npm run dev`.
- On `/`: click "수업 방식" → should scroll to `#flow`
- On `/academy`: click "수업 방식" → should navigate to `/academy/curriculum`
- On `/academy/sample`: click "제공 자료" → should navigate to `/academy/sample`

- [ ] **Step 5: Commit**

```bash
git add components/site.tsx
git commit -m "feat: conditional header nav links by page path (usePathname)"
```

---

### Task 6: Fix ArrowButton href on sample page + add flow-arrow

**Files:**
- Modify: `app/academy/sample/page.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Fix ArrowButton href on sample page**

In `app/academy/sample/page.tsx`, find:
```tsx
<ArrowButton>샘플 자료 요청</ArrowButton>
```

Replace with:
```tsx
<ArrowButton href="/#apply">샘플 자료 요청</ArrowButton>
```

- [ ] **Step 2: Add flow-arrow span in landing flow**

In `app/page.tsx`, find the `lessonFlow.map(...)` block. Each `flow-item` article currently ends with `<div className="flow-thumb">`. Add a span after it:

```tsx
<article className="flow-item" key={item.number}>
  <div className="flow-number">{item.number}</div>
  <div>
    <Kicker>{item.label}</Kicker>
    <h3>{item.title}</h3>
    <p>{item.body}</p>
  </div>
  <div className="flow-thumb">
    <img src={item.image} alt="" />
  </div>
  <span className="flow-arrow" aria-hidden="true">→</span>
</article>
```

- [ ] **Step 3: Hide flow-arrow on mobile**

In `app/globals.css`, landing page section's `@media (max-width: 760px)` block, add:
```css
.flow-arrow {
  display: none;
}
```

- [ ] **Step 4: Confirm post-consolidation flow-item grid and add arrow column**

After Tasks 2–3 the `.flow-item` rule will be the consolidated last-definition. Verify the current effective column count:

```bash
grep -A3 "\.flow-item{" app/globals.css | grep "grid-template-columns"
```

Expected (from the last definition in the original file): `grid-template-columns: 62px 1fr 96px`.

If the output matches, add a 4th column:
```css
.flow-item {
  grid-template-columns: 62px 1fr 96px 24px;
}
```

If the consolidation produced a different value (e.g. `70px 1fr 24px` from an earlier definition), adjust the 4th column value accordingly — it should be `24px` for the arrow icon.

- [ ] **Step 5: Build and verify**

```bash
npm run build && npm test
```

On `/`: flow section shows arrow `→` on desktop, hidden on mobile.
On `/academy/sample`: "샘플 자료 요청" button navigates to `/#apply`.

- [ ] **Step 6: Commit**

```bash
git add app/academy/sample/page.tsx app/page.tsx app/globals.css
git commit -m "fix: ArrowButton href on sample page, add flow-arrow to landing"
```

---

### Task 7: Copy edits — kicker, pilot disclaimer, trust bar

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/academy/pilot/page.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Update FAQ kicker**

In `app/page.tsx`, find:
```tsx
<Kicker>QUESTIONS BEFORE REVIEW</Kicker>
```

Replace with:
```tsx
<Kicker>FREQUENTLY ASKED</Kicker>
```

- [ ] **Step 2: Update pilot form disclaimer**

In `app/academy/pilot/page.tsx`, find:
```tsx
<small>제출하면 기본 메일 앱이 열립니다. 실제 온라인 접수 기능은 파일럿 운영 방식 확정 후 연결합니다.</small>
```

Replace with:
```tsx
<small>이메일로 바로 연결됩니다. 확인 후 1~2일 내 답변드립니다.</small>
```

- [ ] **Step 3: Style trust bar urgency item**

In `app/globals.css`, landing page section (section 7), add inside the `.landing-trust` block or as a new rule:

```css
.landing-trust span:last-child {
  color: var(--orange);
  font-weight: 600;
}
```

- [ ] **Step 4: Build and verify**

```bash
npm run build && npm test
```

- `/`: FAQ kicker reads "FREQUENTLY ASKED", trust bar last item is orange + bold
- `/academy/pilot`: disclaimer reads "이메일로 바로 연결됩니다. 확인 후 1~2일 내 답변드립니다."

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx app/academy/pilot/page.tsx app/globals.css
git commit -m "fix: update copy - FAQ kicker, pilot disclaimer, trust bar emphasis"
```

---

## PHASE 2: Landing v0.1 Content

### Task 8: Remove benefits, FAQ, and fit sections

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Remove landing-benefits section**

In `app/page.tsx`, delete the entire JSX block:
```tsx
<section className="landing-benefits shell">...</section>
```

- [ ] **Step 2: Remove landing-faq section**

Delete the entire JSX block:
```tsx
<section className="landing-faq shell">...</section>
```

- [ ] **Step 3: Remove landing-fit section**

Delete the entire JSX block:
```tsx
<section className="landing-fit" id="pilot">...</section>
```

Note: this section had `id="pilot"`. The nav already points to `/#apply` for "파일럿 안내" (set in Task 5), so no broken links.

- [ ] **Step 4: Confirm sections are gone**

```bash
grep -n "landing-benefits\|landing-faq\|landing-fit" app/page.tsx
```

Expected: 0 matches.

- [ ] **Step 5: Build and verify**

```bash
npm run build && npm test
```

Run `npm run dev`. The page should flow: trust bar → problem → flow → materials → results → apply. No dark-background section, no FAQ accordion, no benefit cards.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx
git commit -m "feat(v0.1): remove benefits, FAQ, and fit sections from landing"
```

---

### Task 9: Simplify hero — h1 and single CTA

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Update h1**

Find:
```tsx
<h1>내신이 끝난 뒤,<br /><em>학생들이 영어로<br />사건을 해결합니다.</em></h1>
```

Replace with:
```tsx
<h1>추리 게임으로 영어 읽기와<br /><em>근거 말하기를 연습하는</em><br />4차시 수업 키트</h1>
```

- [ ] **Step 2: Update subtitle paragraph**

Find the `<p>` that starts "영어 단서를 읽고 질문하고":
```tsx
<p>영어 단서를 읽고 질문하고, 추측하고, 반박하며 팀별 사건보고서를 완성하는 초6~중1 대상 영어 프로젝트 수업입니다.</p>
```

Replace with:
```tsx
<p>초등 6학년~중학교 1학년 대상. 영어 단서를 읽고, 팀원과 의견을 비교하며, 사건 보고서를 완성합니다.</p>
```

- [ ] **Step 3: Single CTA button**

Find `landing-actions` div:
```tsx
<div className="landing-actions">
  <a className="button button-dark" href="#apply">1회차 샘플 받아보기 <span>↗</span></a>
  <a className="text-link" href="#pilot">파일럿 운영 상담하기 <span>↗</span></a>
</div>
```

Replace with:
```tsx
<div className="landing-actions">
  <a className="button button-dark" href="#apply">샘플 자료 요청 <span>↗</span></a>
</div>
```

- [ ] **Step 4: Remove landing-hero-sub and landing-assurance paragraphs**

Delete these two `<p>` tags:
```tsx
<p className="landing-hero-sub">교사용 진행안부터 학생 자료와 학부모 안내자료까지 함께 제공합니다.</p>
<p className="landing-assurance">커리큘럼 · 학생용 단서 카드 · 교사용 진행안 샘플 제공</p>
```

- [ ] **Step 5: Build and verify**

```bash
npm run build && npm test
```

Visit http://localhost:3000. Hero h1 reads "추리 게임으로 영어 읽기와 근거 말하기를 연습하는 4차시 수업 키트". One button visible: "샘플 자료 요청 ↗".

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx
git commit -m "feat(v0.1): simplify hero h1 and reduce to single CTA"
```

---

### Task 10: Add "예시 구성" note to flow section

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Add note paragraph after flow section h2**

In `app/page.tsx`, in `landing-flow` → `landing-section-head`, find the existing `<p>` tag (the one starting "각자 가진 단서를"). Add a new `<p>` after it:

```tsx
<p className="landing-flow-note">(예시 구성 · 변경될 수 있습니다)</p>
```

- [ ] **Step 2: Add CSS for new class**

In `app/globals.css`, landing page section (section 7), add:

```css
.landing-flow-note {
  font-size: 11px;
  color: rgba(21, 37, 30, 0.45);
  margin: 8px 0 0;
  font-style: italic;
}
```

- [ ] **Step 3: Build and verify**

```bash
npm run build && npm test
```

On `/`, flow section: note "(예시 구성 · 변경될 수 있습니다)" appears below the description.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx app/globals.css
git commit -m "feat(v0.1): add 예시 구성 disclaimer to class flow section"
```

---

### Task 11: Update materials — 6 items, 3-column grid

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Replace materials data array**

In `app/page.tsx`, replace the `materials` constant:

```tsx
const materials: [string, string, string, string][] = [
  ["01", "게임 카드", "학생마다 다른 영어 단서가 담긴 역할별 카드입니다.", "/assets/dullg/card-body-1.png"],
  ["02", "스토리 책자", "사건 배경과 인물 관계를 담은 이야기 자료입니다.", "/assets/dullg/rulebook-cover.png"],
  ["03", "워크북", "단서 기록, 추론 과정, 최종 근거를 차시별로 씁니다.", "/assets/dullg/timeline-yoon.png"],
  ["04", "규칙서", "수업 진행 순서와 역할 규칙을 담은 안내 자료입니다.", "/assets/dullg/rulebook-flow.png"],
  ["05", "교사용 진행안", "차시별 진행 순서, 대본, 힌트와 정답을 포함합니다.", "/assets/dullg/rulebook-flow-detailed.png"],
  ["06", "수업 결과 리포트 샘플", "학생 활동 기록을 정리한 학부모 전달용 예시 자료입니다.", "/assets/dullg/rulebook-map-detailed.png"],
];
```

- [ ] **Step 2: Update materials JSX render**

The current `.map()` destructures 5 values including `className`. Replace:

```tsx
{materials.map(([number, title, body, image]) => (
  <article className="material-item" key={number}>
    <div className="material-image">
      <img src={image} alt="" />
    </div>
    <div className="material-copy">
      <span>{number}</span>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  </article>
))}
```

- [ ] **Step 3: Update materials grid CSS to 3 columns**

In `app/globals.css`, section 7, find the `.materials-grid` rule and update:

```css
.materials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 52px;
  align-items: stretch;
}
```

Also find and delete the later `.material-item` rule block that overrides to a horizontal grid layout. This block appears near the end of the file and starts with:

```css
.materials-grid { align-items: stretch; }
.material-item { display: grid; grid-template-columns: 38% 62%; min-height: 260px; }
```

Delete the `.material-item { display: grid; ... }` rule specifically. Do NOT delete the surrounding `.materials-grid { align-items: stretch }` rule or `.material-image` rules in that same block — they remain valid.

After deletion, `.material-item` should only have the original definition:
```css
.material-item {
  background: #f7f5ef;
  display: flex;
  flex-direction: column;
  box-shadow: 7px 9px 0 rgba(21, 37, 30, 0.08);
  border: 1px solid rgba(21, 37, 30, 0.08);
}
```

- [ ] **Step 4: Mobile grid — 2 columns**

In `@media (max-width: 760px)` for section 7, ensure:
```css
.materials-grid {
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 45px;
}
```

- [ ] **Step 5: Build and verify**

```bash
npm run build && npm test
```

On `/`, materials section: 6 cards in 3-column grid (desktop), 2-column grid (mobile).

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx app/globals.css
git commit -m "feat(v0.1): update materials to 6 items in 3-column grid"
```

---

### Task 12: Simplify inquiry form

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Update apply-intro copy**

Find the `<p>` in `apply-intro`:
```tsx
<p>4차시 커리큘럼과 1회차 학생용 단서 카드, 교사용 진행안 샘플을 보내드립니다.</p>
```

Replace with:
```tsx
<p>관심 유형에 따라 적합한 자료나 일정을 안내드립니다.</p>
```

- [ ] **Step 2: Replace form with simplified version**

Replace the entire `<form className="apply-form" ...>` element with:

```tsx
<form className="apply-form" action="mailto:hello@dullg.com" method="post" encType="text/plain">
  <h3>문의하기</h3>
  <label>기관명 <span>필수</span>
    <input name="academy" placeholder="학원 또는 공부방 이름" required />
  </label>
  <label>담당자 이름 <span>필수</span>
    <input name="name" placeholder="원장님 또는 선생님" required />
  </label>
  <label>연락처 또는 이메일 <span>필수</span>
    <input name="contact" placeholder="휴대전화 또는 이메일" required />
  </label>
  <label>관심 유형 <span>필수</span>
    <select name="interest" defaultValue="" required>
      <option value="" disabled>선택해주세요</option>
      <option value="material">제품 자료 요청</option>
      <option value="demo">데모 신청</option>
      <option value="pilot">파일럿 수업 문의</option>
      <option value="purchase">구매 문의</option>
    </select>
  </label>
  <label className="consent">
    <input type="checkbox" name="consent" required /> 연락과 자료 발송을 위한 개인정보 수집에 동의합니다.
  </label>
  <button className="button button-dark" type="submit">문의 보내기 <span>↗</span></button>
  <small>이메일로 바로 연결됩니다. 확인 후 1~2일 내 답변드립니다.</small>
</form>
```

- [ ] **Step 3: Verify field count**

```bash
grep -c 'name=' app/page.tsx
```

In the new form: `academy`, `name`, `contact`, `interest`, `consent` = 5 fields. Confirm with DevTools: 3 `<input>` + 1 `<select>` + 1 checkbox = 5.

- [ ] **Step 4: Build and verify**

```bash
npm run build && npm test
```

Visit http://localhost:3000 → apply section. Form shows: 기관명, 담당자 이름, 연락처 또는 이메일, 관심 유형(dropdown), 동의 checkbox. Button reads "문의 보내기 ↗".

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx
git commit -m "feat(v0.1): simplify inquiry form to 5 fields"
```

---

### Task 13: Remove orphaned CSS classes

**Files:**
- Modify: `app/globals.css`

After Phase 2, many CSS classes are no longer used anywhere in the codebase.

- [ ] **Step 1: Confirm classes are orphaned**

```bash
grep -rn "landing-benefits\|benefit-image\|benefit-copy\|benefit-list\|landing-faq\|faq-list\|landing-fit\|fit-grid\|fit-facts\|pilot-callout\|landing-hero-sub\|landing-assurance\|button-outline\|material-large\|material-wide" app/ components/
```

Expected: 0 matches (the CSS file itself will match, but no `.tsx` files should).

If any `.tsx` file matches, do not delete that class — investigate first.

- [ ] **Step 2: Delete orphaned rule blocks from globals.css**

Delete these CSS blocks and their `@media` overrides:
- `.landing-benefits { ... }` and children: `.benefit-image`, `.benefit-copy`, `.benefit-list`, `.benefit-list article`, `.benefit-list b`, `.benefit-list h3`, `.benefit-list p`
- `.landing-faq { ... }` and children: `.faq-list`, `.faq-list details`, `.faq-list summary`, `.faq-list details[open] summary span`, `.faq-list p`
- `.landing-fit { ... }` and children: `.fit-grid`, `.fit-facts`, `.fit-facts div`, `.fit-facts b`, `.fit-facts span`, `.pilot-callout`, `.pilot-callout h3`, `.pilot-callout p`
- `.landing-hero-sub` and `.landing-hero-copy > p.landing-hero-sub` (element removed in Task 9)
- `.landing-assurance` and `.landing-hero-copy > p.landing-assurance` (element removed in Task 9)
- `.button-outline` (was only used in landing-fit)
- `.material-large`, `.material-wide` (removed in Task 11)
- `.landing-fit h2 em` inside the grouped `em` selector (line contains multiple comma-separated selectors including `.landing-fit h2 em` — delete only this selector fragment, not the entire rule)

  Find the rule:
  ```css
  .landing-hero h1 em, .landing-problem h2 em, ... .landing-fit h2 em, .apply-intro h2 em { ... }
  ```
  Remove `.landing-fit h2 em,` from the selector list. Keep all other selectors in the group.

- [ ] **Step 3: Build and full test**

```bash
npm run build && npm test
```

- [ ] **Step 4: Final visual sweep**

Run `npm run dev`. Check all 5 pages:
- `/` — hero (1 button), trust bar, problem, flow (with note + arrows), materials (6 items), results, apply (5 fields)
- `/academy` — all sections visible, nav links work
- `/academy/curriculum` — curriculum rows, ArrowButton navigates correctly
- `/academy/sample` — sample cards, "샘플 자료 요청" button → `/#apply`
- `/academy/pilot` — pilot form, disclaimer updated

- [ ] **Step 5: Final commit**

```bash
git add app/globals.css
git commit -m "style: remove orphaned CSS classes after v0.1 section cleanup"
```
