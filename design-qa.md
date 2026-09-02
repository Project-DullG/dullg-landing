# 단서공방 사이트 구조·UI QA

## 비교 기준

- source visual truth: 사용자가 제공한 Ai.injae 화면과 `https://www.aiinjae.com/`
- implementation screenshots: `/Users/kimkanghoon/web_page/.design-audit/architecture-final/`
- viewports: 390 x 844, 1440 x 1000 CSS px
- 검토 페이지: 홈, 작품, 교육, 제작·활동 기록, 수강생 자료실, 공방 소개, 문의

## 이번 구조의 원칙

- 홈은 브랜드와 대표 작업의 요약만 제공하고 상세 페이지로 연결합니다.
- 작품은 공개된 작품의 이미지, 시놉시스, 인원·시간·상태를 개별 포트폴리오로 보여줍니다.
- 교육은 영어 미스터리 수업팩의 대상, 구성, 진행 상태만 설명합니다.
- 수강생 자료실은 수업에 참여한 사람이 날짜와 과정명으로 자료를 찾는 게시글 목록으로 구성합니다.
- 제작·활동 기록은 다른 페이지의 소개를 반복하지 않고 확인된 작업을 시간순으로 기록합니다.
- 공방 소개는 팀의 작업 범위와 사업자 정보를, 문의는 연락 방법과 필요한 정보만 제공합니다.

## Comparison history

### Iteration 1

- [P1] 교육 페이지에서 수업 목적, 체험 방식, 자료 구성이 여러 섹션에 반복됐습니다.
- Fix: 하나의 소개와 네 개의 상세 경로, 현재 진행 상태로 압축했습니다.
- Post-fix evidence: `/Users/kimkanghoon/web_page/.design-audit/architecture-final/academy-desktop.png`

### Iteration 2

- [P1] 제작·활동 기록이 작품·교육 페이지의 내용을 카드 형태로 다시 노출해 페이지 역할이 모호했습니다.
- Fix: 날짜, 유형, 작업명, 한 줄 결과로 구성된 연대기형 기록으로 교체했습니다.
- Post-fix evidence: `/Users/kimkanghoon/web_page/.design-audit/architecture-final/activity-desktop.png`

### Iteration 3

- [P2] 작품 페이지 하단의 교육 안내와 문의 페이지의 교육 FAQ가 다른 페이지의 설명을 반복했습니다.
- Fix: 작품 페이지는 포트폴리오와 펀딩 기록에서 끝내고, 문의 페이지는 작품·협업·교육·자료 문의를 모두 받는 범용 구조로 정리했습니다.
- Post-fix evidence: `/Users/kimkanghoon/web_page/.design-audit/architecture-final/works-desktop.png`, `/Users/kimkanghoon/web_page/.design-audit/architecture-final/contact-desktop.png`

### Iteration 4

- [P2] 모바일의 브랜드, 이메일, 푸터 링크 일부가 44px보다 작은 터치 영역을 가졌습니다.
- Fix: 760px 이하에서 주요 링크의 최소 높이를 44px로 통일했습니다.
- Post-fix evidence: 390px 화면에서 가로 넘침 0, 44px 미만의 표시 링크 0개.

## 시각·콘텐츠 점검

- Fonts: 한글 산세리프 중심, 제목 굵기와 크기를 줄여 편집형 위계를 유지했습니다.
- Spacing: 페이지마다 머리말, 본문, 마지막 안내의 간격 체계를 통일했습니다.
- Colors: 흰색과 옅은 회색을 기본으로 하고 초록·주황은 상태와 강조에만 사용했습니다.
- Components: 반복 3열 카드 대신 대표 이미지, 행 목록, 연대기, 얇은 구분선을 사용했습니다.
- Copy: 추상적인 선언과 중복 CTA를 줄이고 대상, 제공 내용, 상태, 날짜를 직접 표현했습니다.
- Content safety: 지정된 미공개 콘텐츠는 화면, 메타데이터, 구조화 데이터, 사이트맵과 소스에서 검색되지 않습니다.

## Interaction and technical checks

- 모든 주요 페이지의 내부 링크와 메뉴 경로 렌더링 확인
- 390px 및 1440px 전 페이지 가로 넘침 없음
- 모바일 표시 링크의 최소 터치 높이 44px 확인
- 브라우저 콘솔 오류 없음
- 프로덕션 빌드, 렌더링 테스트, 변경 파일 공백 검사 통과

## 작품·활동 상세 페이지 보강

- source visual truth: 사용자가 제공한 Ai.injae 편집형 화면과 기존 단서공방 페이지의 확정된 시각 체계
- implementation screenshots: `/Users/kimkanghoon/web_page/.design-audit/detail-pages/`
- viewports: 390 x 844, 1440 x 1000 CSS px

### Iteration 5

- [P1] 작품 목록이 모든 정보를 한 페이지에 담아 작품별 정보 구조와 공유 가능한 주소가 없었습니다.
- Fix: 공개 작품 7편을 공용 데이터로 통합하고 `/works/[slug]` 상세 페이지를 만들었습니다. 목록과 홈은 같은 데이터를 사용합니다.
- Post-fix evidence: `/Users/kimkanghoon/web_page/.design-audit/detail-pages/work-desktop.png`, `/Users/kimkanghoon/web_page/.design-audit/detail-pages/work-mobile.png`

### Iteration 6

- [P1] 울릉고 9월 5일 수업 자료가 자료실에만 있어 교육 활동의 맥락을 확인하기 어려웠습니다.
- Fix: `/activity/ulleung-high-living-lab` 사례 페이지를 추가하고, 울릉군 생태관광 AI 교육과 별개의 수업임을 명시했습니다.
- Post-fix evidence: `/Users/kimkanghoon/web_page/.design-audit/detail-pages/activity-desktop.png`, `/Users/kimkanghoon/web_page/.design-audit/detail-pages/activity-mobile.png`

- 새 상세 페이지의 390px 가로 넘침 없음
- 모바일에서 표시되는 모든 링크와 버튼의 터치 높이 44px 이상
- 브라우저 콘솔 경고·오류 없음
- 작품 이미지 비율과 한글 단어 단위 줄바꿈 확인

## 코드 구조화 및 성능 정리

### Iteration 7

- [P1] 브랜드 연락처, 펀딩 수치, 교육 자료와 메뉴가 여러 페이지에 중복되어 변경 시 값이 달라질 위험이 있었습니다.
- Fix: `lib/site-config.ts`, `lib/navigation.ts`, `lib/funding.ts`, `lib/education.ts`, `lib/activities.ts`, `lib/works.ts`로 공개 데이터를 역할별 중앙화했습니다. 페이지는 이 데이터를 가져와 표시만 합니다.

### Iteration 8

- [P2] 홈·작품·교육·소개·에피소드 페이지의 일반 이미지 태그가 반응형 이미지 최적화를 사용하지 않았습니다.
- Fix: 로컬 콘텐츠 이미지를 Next.js Image로 전환하고 실제 원본 크기, 화면별 `sizes`, 첫 화면 우선 로딩을 지정했습니다.

### Iteration 9

- [P2] 공통 모바일 터치 영역 규칙이 활동 페이지 스타일 파일에 포함되어 책임 경계가 어색했습니다.
- Fix: 공통 규칙을 `app/responsive.css`로 옮기고 페이지별 CSS는 해당 화면만 담당하게 했습니다.

- ESLint 오류 및 경고 0개
- 390px 주요 8개 경로에서 가로 넘침, 깨진 이미지, 44px 미만 터치 대상 0개
- 구조 변경 이후 브라우저 콘솔 경고·오류 없음
- 유지보수 경계와 콘텐츠 추가 절차를 `docs/site-architecture.md`에 기록

현재 수정 범위에 남은 P0, P1, P2 문제는 없습니다.

final result: passed
