# DullG 사이트 개선 설계 문서

**날짜:** 2026-07-24
**상태:** 승인됨
**범위:** 코드 품질, UI/디자인, 콘텐츠·카피 개선 (구조 + polish, 방향 B)

---

## 1. 배경

DullG는 한국 영어학원 대상 미스터리 추리 기반 영어 프로젝트 수업 B2B 랜딩 사이트다. 현재 개발 중이며, 코드 가독성·유지보수성 문제, 페이지 구조 불명확, 일부 콘텐츠 어색함이 발견됐다.

---

## 2. 현재 파일 구조

```
app/
  page.tsx               # 메인 B2B 랜딩 (원장 대상)
  academy/
    page.tsx             # 아카데미 소개 허브
    sample/page.tsx      # 샘플 자료 페이지
    curriculum/page.tsx  # 커리큘럼 상세
    pilot/page.tsx       # 파일럿 문의
  layout.tsx
  globals.css
components/
  site.tsx               # Header, Footer, PageFrame, Kicker, ArrowButton, curriculum
```

---

## 3. 개선 파트

### 파트 1 — CSS 구조 복원

**문제**
- `globals.css`가 사실상 미니파이 상태 (30줄, 줄당 수천 자)
- 같은 클래스가 파일 여러 곳에 중복 정의됨 (e.g. `.material-image` 9회, `.section-kicker` 8회)
- `!important` 패치 2건: `.landing-hero-sub { margin-top: -20px }`, `.landing-assurance { font-size, color, margin }`
- 미디어 쿼리가 파일 전체에 분산됨

**작업**

1. **포매팅 복원**: 선택자는 별도 줄, 선언은 1줄 1개, 들여쓰기 2스페이스, 한 줄 최대 100자 이하. 시각적 출력 결과는 변경하지 않음.

2. **중복 클래스 통합**: 동일 클래스가 여러 번 정의된 경우, 파일 내 마지막 정의(실제 브라우저가 적용하는 값)를 기준으로 단일 블록으로 통합. 앞 정의에만 있는 속성은 마지막 블록에 추가.

3. **`!important` 제거**:
   - 원인: `.landing-hero-copy > p`에 기본 스타일이 설정되어 있고, `.landing-assurance`와 `.landing-hero-sub`가 같은 요소에 다른 값을 주기 위해 `!important`를 사용함
   - 해결: `.landing-hero-copy > p.landing-assurance`, `.landing-hero-copy > p.landing-hero-sub` 처럼 더 높은 특이성(specificity) 선택자를 사용하여 `!important` 없이 동일 결과 구현
   - 검증: 수정 전후 홈페이지 히어로 섹션 시각적 동일성 확인

4. **섹션 구조 정의**: CSS 파일을 아래 섹션으로 구분, 각 섹션 끝에 해당 섹션의 미디어 쿼리 배치
   ```
   /* 1. Tokens & Base */
   /* 2. Layout & Nav */
   /* 3. Hero (home) */
   /* 4. Statement / Feature / Quote */
   /* 5. Final CTA & Footer */
   /* 6. Academy pages (shared) */
   /* 7. Landing page (/) */
   /* 8. Sample page */
   /* 9. Curriculum page */
   /* 10. Gateway / Path */
   ```

---

### 파트 2 — 페이지 구조 및 내비게이션

**문제**
- `/`와 `/academy`가 내용·목적이 상당 부분 겹침
- 헤더 링크가 모든 페이지에서 `/#flow`, `/#materials` 등 홈 앵커를 가리킴
- `.flow-arrow` CSS 클래스가 정의됐지만 JSX 어디에도 렌더되지 않음
- `ArrowButton` 기본 `href="/academy/pilot"`인데, 라벨이 "샘플 자료 요청"인 버튼에도 사용됨 (의도 불일치)

**작업**

1. **페이지 역할 명확화**
   - `/`: 원장 대상 B2B 랜딩, 샘플 요청 CTA 중심 → 구조 유지
   - `/academy`: 제품 소개 허브, 하위 페이지들의 진입점 역할

2. **헤더 내비게이션 링크 분기**

   `Header` 컴포넌트에 Next.js `usePathname()` 훅 추가 (`"use client"` 지시어 필요):

   | 현재 경로 | "수업 방식" | "제공 자료" | "파일럿 안내" | "샘플 요청" |
   |-----------|------------|------------|--------------|------------|
   | `/` | `/#flow` | `/#materials` | `/#pilot` | `/#apply` |
   | `/academy` 이하 | `/academy/curriculum` | `/academy/sample` | `/academy/pilot` | `/#apply` |

   - "샘플 요청"은 홈 랜딩의 `#apply` 폼으로 연결. 해당 앵커(`id="apply"`)는 `app/page.tsx` `landing-apply` 섹션에 존재 확인됨.
   - "파일럿 안내"는 `/academy/pilot` 폼으로 연결 (다른 목적지).

   `"use client"` 전환 범위: `Header` 컴포넌트(`components/site.tsx`)만 해당. 현재 순수 서버 컴포넌트이며 props 없이 정적 마크업만 반환. 서버에서 fetch하는 데이터 없음 → 클라이언트 전환 시 SSR 영향 없음.

3. **`.flow-arrow` 처리**: 홈 랜딩 flow section의 `.flow-item`에서 `.flow-thumb` 이후 `<span className="flow-arrow">→</span>` 요소 추가. 모바일에서는 숨김(`display:none`).

4. **`ArrowButton` href 불일치 수정**
   - `sample/page.tsx`의 `<ArrowButton>샘플 자료 요청</ArrowButton>` → `href="/#apply"` 명시
   - `curriculum/page.tsx`의 `<ArrowButton>운영 자료 요청</ArrowButton>` → `href="/academy/pilot"` 유지 (의도 맞음)

---

### 파트 3 — 콘텐츠·카피

| 위치 | 현재 | 수정 후 |
|------|------|---------|
| `pilot/page.tsx` 폼 disclaimer | "제출하면 기본 메일 앱이 열립니다. 실제 온라인 접수 기능은 파일럿 운영 방식 확정 후 연결합니다." | "이메일로 바로 연결됩니다. 확인 후 1~2일 내 답변드립니다." |
| 랜딩 FAQ kicker | `QUESTIONS BEFORE REVIEW` | `FREQUENTLY ASKED` |
| 랜딩 trust bar | `초기 파일럿 2~3개 학원 모집`이 스펙 항목들과 나란히 나열됨 | `.landing-trust span:last-child { color: var(--orange); font-weight: 600; }` 추가 |
| 모바일 curriculum-row | output label 컬럼 처리 불명확 | `@media(max-width:760px)` 안 `.curriculum-row > strong { grid-column: 2; }` 명시 (CSS 통합 시 누락 방지) |

---

## 4. 범위 외 항목 (이번 작업에서 제외)

- 폼 백엔드 연동 (mailto 대체 솔루션)
- 전면 페이지 재설계
- 이미지·에셋 교체
- 새 페이지 추가

---

## 5. 성공 기준

**파트 1 (CSS)**
- `globals.css`의 모든 줄이 100자 이하, 선언 1개당 1줄
- CSS 중복 정의 클래스 0건
- `!important` 사용 0건 (특이성 선택자로 대체)
- 브라우저 출력 결과가 수정 전과 시각적으로 동일

**파트 2 (구조·내비게이션)**
- `/academy` 이하 페이지에서 헤더 링크 클릭 시 의미 있는 목적지로 이동
- `ArrowButton` 라벨과 href 목적지가 의미상 일치
- 홈 랜딩 flow section에 → 화살표 아이콘이 표시됨

**파트 3 (카피)**
- pilot 폼 disclaimer 텍스트가 "이메일로 바로 연결됩니다. 확인 후 1~2일 내 답변드립니다."로 변경됨
- FAQ kicker가 `FREQUENTLY ASKED`로 변경됨
- trust bar의 마지막 항목이 오렌지 색상으로 강조됨
- 모바일에서 curriculum-row output label이 콘텐츠 아래 정렬됨
