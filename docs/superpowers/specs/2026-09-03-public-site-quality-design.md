# 공개 사이트 품질 개선 — 설계

- 날짜: 2026-09-03
- 범위: 공개 사이트 (`/`, `/works/*`, `/academy/*`, `/materials/*`, `/about`, `/activity/*`, `/episode`, `/contact`, `/privacy`, `/sitemap`)
- 제외: `/dashboard/*`, `/login`, `/logout` (2·3단계 별도 스펙)
- 근거: 2026-09-03 공개 사이트 감사 (에이전트 감사 결과, 본 문서 §8 요약)

## 1. 목표

1. 신뢰를 깎는 내용 결함 제거 — AI 생성 제품 이미지를 실제 제작물로 교체, 전환 버튼이 폼에 도달하게 수정.
2. 학원생 관리 기능(대시보드)을 공개 사이트에서 셀링 포인트로 노출.
3. 기술 결함 수정 — 태블릿 내비게이션, SEO 메타 상속, 404/오류 페이지, 접근성 대비.
4. CSS와 데이터 구조 정리 — 죽은 코드 삭제, 토큰 통합, 파일 분리, 중복 데이터 단일화. **살아 있는 스타일의 값은 대비 개선 외에 바꾸지 않는다.**

## 2. 내용 결정

### 2.1 수업팩 제목
- 정식 제목: **8시까지 두 열쇠** (규칙서 표지 실물과 일치)
- 부제: **보충반의 사라진 열쇠**
- 표기 규칙: 첫 언급은 `8시까지 두 열쇠 — 보충반의 사라진 열쇠`, 이후 `8시까지 두 열쇠`. `lib/education.ts`에 `episodeTitle`, `episodeSubtitle` 상수를 두고 모든 페이지가 참조한다. 하드코딩 문자열 금지.

### 2.2 이미지 교체 (AI 생성 → 실제 자산)

| 위치 | 현재 (삭제) | 교체 |
|---|---|---|
| `app/page.tsx` 교육 섹션 | `mat-game-cards.webp` (다른 게임 AI 렌더, 오타 포함) | `card-cover-1.png` + `card-body-1.png` 2장 구성 (소지품 카드 앞·뒤) |
| `app/academy/sample/page.tsx` 사건 자료 | `mat-story-book.webp` (다른 사건 AI 렌더) | `case-intro.png` (사건 도입) + `timeline-yoon.png` (타임라인) |
| `app/academy/sample/page.tsx` 규칙서 | `mat-rulebook.webp` (단일 회차 50분 AI 렌더, 4차시와 모순) | `rulebook-flow.png` (진행 흐름) + `rulebook-map-detailed.png` (3층 평면도) |
| `app/academy/sample/page.tsx` 교사용 (신규 항목) | 없음 | `pre-survey.png` (게임 전 설문지) |
| `app/academy/page.tsx`, `app/episode/page.tsx` 히어로 | `rulebook-cover.png` (유지) | 유지. 문구를 §2.1에 맞춤 |

- 삭제할 파일: `mat-game-cards.{png,webp}`, `mat-story-book.{png,webp}`, `mat-rulebook.{png,webp}`, `mat-teacher-guide.{png,webp}`, `mat-report.{png,webp}`, `mat-workbook.png`, `students-investigation.png`, `classroom-case.png`, `og.png`, `assets/works/murder-mystery-three-cover.webp` (모두 미참조 또는 AI 렌더).
- `project-dullg-banner.png`(1701×5103, 406KB)는 실제 표시 영역(상단 3:5)으로 잘라 WebP로 저장하고 원본은 삭제.
- 샘플 페이지의 "연출 이미지 대신 현재 제작된 시제품을 그대로 보여드립니다" 문구는 교체 후 사실이 되므로 유지.
- 각 `next/image`의 `width`/`height`는 실제 픽셀 크기와 일치시킨다(`academy/page.tsx:39`의 877×1241 오류 수정 → 944×1330).

### 2.3 전환 흐름
- "무료 검토팩 요청" CTA 5곳(`about:148`, `sample:131`, `episode:164`, `privacy:116`, `curriculum:61`) 모두 `/academy/pilot`으로 통일.
- `app/page.tsx`의 `#apply` 섹션은 제목·한 문단·`/academy/pilot` 버튼 + `/contact` 보조 링크로 정리. 앵커는 유지(외부 링크 호환).
- `/contact`는 메일 안내 + `/academy/pilot` 버튼 + `BRAND.responseTime` 표시.
- `/privacy` 수집 항목을 실제 폼(`components/form-section.tsx`)과 일치시킨다: 필수 = 기관명, 연락처(전화 또는 이메일), 관심 유형, 동의. 선택 항목 문구 삭제.
- `form-section.tsx`: 제출 후 "다시 문의하기" 버튼 추가, 허니팟 필드(`_honey`) 추가. 이메일 주소는 `lib/site-config.ts`의 `BRAND.email`에서 참조(이미 공개된 주소이므로 클라이언트 노출은 허용).

### 2.4 학원 운영 도구 섹션 (신규)
- 위치: `app/academy/page.tsx`, "구성 안내" 섹션 다음, "현재 상태" 섹션 앞.
- 구성:
  - Kicker `운영 도구`, h2 `수업만 드리지 않습니다.<br/><em>학원 운영까지 함께 정리합니다.</em>`
  - 설명 1문단: 수업팩과 함께 제공되는 웹 대시보드로 학원생·반·성적을 한곳에서 관리한다는 요지.
  - 기능 4개 카드: ① 학원생 등록과 반 편성 ② 차시별 점수·참여도 입력 ③ 일반 시험 성적과 리포트 ④ 학생 본인 성적 조회 화면.
  - 시각 요소: `components/dashboard-preview.tsx` — CSS로 그린 축소 대시보드(사이드바 + 통계 카드 3개 + 미니 표). 서버 컴포넌트, 이미지 없음, `aria-hidden`. 3단계 완료 후 실제 스크린샷으로 교체 가능하도록 `<figure>`로 감싼다.
  - CTA: `학원 관리 로그인 →` (`/login`) 보조 링크. 주 CTA는 검토팩 요청.
- 홈 `app/page.tsx` 교육 섹션: 사실 목록 아래에 `학원생·반·성적을 정리하는 운영 도구가 함께 제공됩니다.` 1문장 + `/academy#tools` 링크. 섹션 id `tools`.
- 헤더: `components/header.tsx` 우측 CTA 왼쪽에 작은 텍스트 링크 `학원 관리` → `/login`. 모바일 메뉴 하단에도 동일 링크. 푸터 "문의" 열에 `학원 관리 로그인` 추가.

### 2.5 시간 의존 내용
- `lib/funding.ts`: 각 캠페인에 `endsOn: "YYYY-MM-DD"`를 두고, `status`는 저장하지 않고 `getFundingStatus(campaign, today)`로 계산(`진행 중` | `종료`). `lib/works.ts`의 `펀딩 중` 배지도 같은 함수로 계산. 렌더는 서버 컴포넌트에서 `new Date()` 사용(요청 시점 기준, 하이드레이션 무관).
- `lib/activities.ts`: 항목에 `date: "YYYY-MM-DD"`(ISO)를 두고, `date > today`이면 `예정` 라벨과 별도 스타일로 렌더. `"현재"` 문자열 제거, `<time dateTime>` 정확히 부여.
- `lib/works.ts`의 펀딩 수치 문자열 3곳은 `lib/funding.ts`에서 파생(`formatFundingSummary(campaign)`).

## 3. 기술 결함 수정

### 3.1 내비게이션·레이아웃
- 모바일 내비 브레이크포인트를 **900px** 하나로 통일. `.mobile-navigation.is-open` 규칙을 900px 블록으로 이동.
- 모바일 메뉴: 열릴 때 `body` 스크롤 잠금, 경로 변경 시 자동 닫힘(`usePathname` effect), 배경색을 헤더와 같은 토큰으로.
- `html { scroll-padding-top }`를 실제 헤더 높이 토큰(`--header-h: 64px`)에 연결.
- `app/page.tsx`: `<Header/>`를 `<main>` 밖으로 이동. 홈도 `PageFrame`을 쓰거나 동일 구조를 따른다. 스킵 링크 대상 `#main-content`는 `<main>`에만.

### 3.2 메타데이터
- `lib/metadata.ts`에 `pageMetadata({ title, description, path, ogImage? })` 헬퍼. 반환: `title`, `description`, `alternates.canonical: path`, `openGraph { title, description, url: path, images }`, `twitter`.
- `app/layout.tsx`: `title: { default: "단서공방 | 영어 미스터리 수업과 추리 콘텐츠", template: "%s | 단서공방" }`, `metadataBase`, 루트 `alternates.canonical` 제거.
- 모든 공개 페이지가 헬퍼로 고유 title/description/canonical/OG를 선언. `/academy/curriculum` 메타 추가.
- 브랜드 표기: 메타·본문에서 "DullG" 단독 표기 제거 → "단서공방". "ProjectDullG"는 소개 페이지의 이력 설명에만 남긴다.
- OG 이미지: `app/opengraph-image.tsx`(Next `ImageResponse`)로 브랜드 마크 + "단서공방" + 한 줄 설명을 렌더. `og.webp` 삭제.
- 파비콘: `public/favicon.svg`를 헤더 `.brand-mark`(3선)와 같은 형태, `--ink` 색으로 교체. `app/icon.svg`로도 제공.

### 3.3 404·오류
- `app/not-found.tsx`: `PageFrame` 안에 제목, 안내, 홈·교육·문의 링크.
- `app/error.tsx`(클라이언트): 같은 프레임, 다시 시도 버튼.

### 3.4 접근성
- 보조 텍스트 색을 토큰 `--text-muted`(#626762, 흰 배경 5.4:1)로 통일. `#8a8f8b`, `#929793`, `#858a86`, `#777c78`, `rgba(21,37,30,.48)` 제거.
- `about/page.tsx` 신념 3개를 `<h3>`로. 데이터의 `\n` 분할 제거.
- `works/page.tsx` 모바일 4줄 클램프에 "더 보기" 대신 클램프 제거(짧은 시놉시스 유지).
- `presentation-viewer.tsx`: `unoptimized` 제거, 첫 장만 `priority`, 나머지 `loading="lazy"`.

## 4. CSS 구조

### 4.1 파일 분리
```
app/globals.css          # @import 목록만 (Next는 globals.css에서 @import 허용)
styles/tokens.css        # :root 1개 — 색·폰트·간격·radius·--header-h
styles/base.css          # reset, html/body, 타이포 기본, 스킵링크, reduced-motion
styles/site.css          # 헤더, 모바일 내비, 푸터, .shell, .button, Kicker, SectionHead
styles/pages/home.css
styles/pages/works.css
styles/pages/academy.css # academy, curriculum, sample, pilot, episode
styles/pages/about.css
styles/pages/activity.css  (기존 app/activity.css 이동)
styles/pages/materials.css
styles/pages/misc.css    # contact, privacy, sitemap, not-found
styles/dashboard.css     # 기존 DASHBOARD LAYOUT + PAGES 그대로 이동 (3단계에서 손봄)
```
- 기존 `app/activity.css`, `app/responsive.css`, `app/work-detail.css`는 해당 페이지 파일로 흡수.

### 4.2 정리 규칙
- 클래스명이 `app/`·`components/`의 어떤 `.tsx`에도 없는 규칙은 삭제. 템플릿 리터럴로 생성되는 클래스(`is-green|is-amber|is-red`, `detail-art-N`)는 유지.
- 같은 선택자가 여러 번 정의된 경우 **마지막(현재 적용) 값**만 남긴다. `html body` 접두 특이성 상승은 제거하고 정상 선택자로.
- `!important`는 reduced-motion 블록 외 0건.
- `:root` 하나. 현재 적용 값(`--ink:#111412; --cream:#fff; --surface:#f6f7f5; --text-muted:#626762; --orange:#c96645`)을 기준으로 하고, 이전 값 하드코딩(`#15251e`, `#e8784f`, `#f2efe7`, `rgba(21,37,30,…)`)은 토큰으로 치환. 미정의 `--teal`은 `--ink`로 대체.
- 브레이크포인트 토큰화는 CSS 변수로 불가하므로 **560 / 760 / 900 / 1080** 4개로 정리하고 표기를 `@media (max-width: Npx)`로 통일.
- 줄 길이 100자 이하, 선언 1줄 1개.

### 4.3 회귀 방지
- 작업 전: `scripts/screenshot-public.mjs`(Playwright, 캐시된 chromium 사용)로 공개 페이지 15개 × 3폭(1440/834/390) 스크린샷을 `.design-audit/public-refactor/before/`에 저장.
- 작업 후 같은 스크립트로 `after/`에 저장하고 `pixelmatch`로 diff 이미지 생성. 의도한 변화(이미지 교체, 신규 섹션, 대비, 내비 수정)만 diff에 나타나야 한다.
- `.design-audit/`는 git 추적 제외(§6).

## 5. 코드 구조

- `components/section-head.tsx`: `<SectionHead kicker title lead? align?>` — Kicker→h2→p 블록 22곳 치환.
- `components/curriculum-explorer.tsx` 삭제(미사용).
- `lib/education.ts`가 `educationFacts`, `curriculum`, `episodeTitle/Subtitle`의 유일한 출처. `academy/page.tsx`의 복제 배열과 `episode/page.tsx`의 `steps` 삭제.
- `lib/routes.ts`: 공개 경로 목록 단일 출처. `app/sitemap.ts`와 `app/sitemap/page.tsx`가 여기서 파생. `lib/navigation.ts`는 라벨만 갖고 경로는 `routes`에서.
- 모든 import는 `@/` 별칭. 페이지 파일 포맷 통일(한 줄 JSX 금지, Prettier 기본).
- 미사용 export(`WorkStatus`, `MaterialLink`, `CourseMaterial`, `site.tsx`의 재-export) 제거.

## 6. 저장소 정리
- `.gitignore`에 `.design-audit/`, `tsconfig.tsbuildinfo`, `*-audit.png`, `design-qa.md`, `*-audit-*.md` 추가 후 `git rm --cached`(파일은 디스크에 유지).
- `public/` 미참조 자산 삭제(§2.2 목록). 삭제 전 참조 검색으로 재확인.
- `app/layout.tsx` 폰트: DM Sans 제거(기본 서체가 Noto Sans KR). Noto Sans KR 가중치 400/500/700 3종으로 축소. 나머지 유지.

## 7. 검증 기준
- `npx tsc --noEmit`, `npx eslint .`, `npx next build` 통과.
- 스크린샷 diff 검토 완료(§4.3).
- 수동 확인: 834px 폭에서 햄버거 → 메뉴 열림. `/works/없는-slug` → 브랜드 404. 각 페이지 `<title>`이 "페이지명 | 단서공방". `/academy` OG가 홈과 다름.
- CSS 총 줄수 ≤ 4,300 (현재 7,509). `!important` 0건(reduced-motion 제외). 죽은 클래스 0건(스크립트로 검증).

## 8. 감사 요약 (참조)
- 내용: AI 이미지 4장이 실제 제작물과 불일치, CTA 5곳 중 4곳 폼 없음, 개인정보 고지와 폼 불일치, 펀딩 상태 하드코딩, 미래 활동을 완료로 표기.
- 기술: 821–900px 내비 미표시, canonical/OG 홈으로 상속(10페이지), curriculum 메타 없음, 404/오류 페이지 없음, `--teal` 미정의, 대비 2.9–4.2:1, `!important` 1건.
- 구조: CSS 7,232줄 중 약 3,400줄 미사용, `:root` 2회 정의, `.shell`/`.button` 4겹 정의, 브레이크포인트 6종, 교육 조건 2회·커리큘럼 3회·펀딩 수치 2회·경로 3회 중복, 미사용 컴포넌트 1개.
- 성능: `public/` 26MB 중 21MB 미참조, 폰트 5가족 14파일, 프레젠테이션 15장 `unoptimized`.
