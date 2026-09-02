# 단서공방 화면 구현 QA

## 비교 대상

- source visual truth path: `/var/folders/q9/sgyjbs1d50q4sm7qp5y_yx5h0000gn/T/TemporaryItems/NSIRD_screencaptureui_58LCwz/스크린샷 2026-09-02 오후 11.03.50.png`
- implementation screenshot path: `/Users/kimkanghoon/web_page/.design-audit/29-method-1440-final.png`
- combined comparison path: `/Users/kimkanghoon/web_page/.design-audit/30-method-comparison-final.png`
- viewport: 1440 x 1000 CSS px, device scale factor 1
- source pixels: 2512 x 424 (비교용 1440 x 243 정규화)
- implementation region: 1120 x 782
- state: 홈의 ‘만드는 방식’ 구간이 화면 안에 들어온 뒤 2.2초가 지난 애니메이션 상태

## Findings

현재 수정 범위에 남아 있는 P0, P1, P2 문제는 없습니다.

### Required fidelity surfaces

- Fonts and typography: 한글 산세리프, 중간 굵기, 짧은 제목을 사용했습니다. 작품명은 `word-break: keep-all`과 중간 화면 전용 레이아웃으로 낱글자 밀림을 방지했습니다.
- Spacing and layout rhythm: 참고 화면의 넓은 상단 설명, 3열 도식, 번호-제목-본문 순서를 유지했습니다. 1050px 이하에서는 작품 머리말을 한 열로 바꿔 비정상적인 빈 공간을 제거했습니다.
- Colors and visual tokens: 참고 화면의 회색-초록-주황-적색 상태 구분을 가져오되 단서공방의 채도가 낮은 색상으로 조정했습니다.
- Image quality and asset fidelity: 배너는 사용자가 제공한 PDF의 상단만 보이도록 배치해 이전 연락처가 노출되지 않습니다. 작품 이미지는 기존 원본 자산을 유지했습니다.
- Copy and content: 참고 사이트의 문구는 복사하지 않았습니다. 단서공방의 실제 제작 과정인 사건 구성, 정보 배분, 플레이 검토의 세 단계로 다시 작성했습니다.

## Full-view comparison evidence

참고 도식과 구현 구간을 하나의 이미지에 나란히 배치한 `/Users/kimkanghoon/web_page/.design-audit/30-method-comparison-final.png`에서 3열 비례, 단계별 색상 증가, 번호와 본문의 위계를 확인했습니다.

## Focused-region evidence

- 동적 격자: 18열 x 6행, 세 카드 합계 324개 셀이 데이터에서 생성됩니다.
- 화면 진입 상태: `IntersectionObserver`가 구간 노출 여부를 감지하고, 보이는 동안에만 10초 주기 애니메이션을 실행합니다.
- 수강생 자료실: `/Users/kimkanghoon/web_page/.design-audit/31-materials-mobile-pdf-open.png`에서 390px 화면의 펼침 상태, PDF 다운로드 링크, 가로 넘침 없음이 확인됐습니다.
- 별도의 확대 비교가 필요하지 않았습니다. 도식 셀과 본문을 구현 캡처 원본에서 읽을 수 있고, 브라우저 계산값으로 전체 셀 수와 색상 상태도 확인했습니다.

## Comparison history

### Iteration 1

- [P1] 기존 구현은 세 개의 정적인 CSS 배경이어서 참고 화면의 레이어 진행과 화면 가시성 동작을 재현하지 못했습니다.
- Fix: `ClueProcess` 컴포넌트에서 단계 데이터를 정의하고 셀을 생성하며, 화면 진입 상태에 따라 애니메이션을 시작·중단하도록 교체했습니다.
- Post-fix evidence: 324개 셀이 렌더링됐고 캡처 시점에 166개가 활성 색상으로 표시됐습니다. 콘솔 오류는 없었습니다.

### Iteration 2

- [P2] 중간 화면에서 작품 페이지 머리말과 긴 작품명이 좁은 두 열에 들어가 어색하게 줄바꿈됐습니다.
- Fix: 761-1050px 구간에서 머리말을 한 열로 전환하고, 작품 상세 열 간격과 제목 크기를 줄였습니다. 한글 단어 단위 줄바꿈을 명시했습니다.
- Post-fix evidence: 1078px 및 390px 캡처에서 가로 넘침이 없고 작품명이 음절 단위로 밀리지 않습니다.

## Interaction and technical checks

- 홈 동적 격자: 화면 진입/이탈에 따른 재생 상태 확인
- 수강생 자료실: 과정 펼침, PDF 링크 및 다운로드 속성 확인
- 반응형: 390px, 1078px, 1440px에서 문장 줄바꿈과 가로 넘침 확인
- 브라우저 콘솔: 오류 없음
- 프로덕션 빌드와 렌더링 테스트: 통과

## Follow-up polish

- [P3] 작품 대표 이미지 중 일부는 느린 연결에서 늦게 표시될 수 있어, 추후 주요 이미지의 우선순위 로딩을 조정할 수 있습니다.

final result: passed
