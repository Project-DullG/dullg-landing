# 미니 프로젝트와 작품 예고편

## 소개 기준

- 사용자 요청에 따라 미니 프로젝트 시리즈는 2026년 2월 시작으로 소개한다.
- 두 달에 한 편을 만드는 것을 목표로 적는다. 개별 작품의 제작일·출시일이나 월별 이력은 임의로 소급하지 않는다.
- 홈은 ‘미니 프로젝트 / 단서공방이 만든 웹게임’으로 소개한다. 시작 시점과 제작 주기는 전체 목록에만 적고, 홈·개별 게임·검색 설명에는 반복하지 않는다.
- 웹게임은 `/mini-projects` 아래에서 소개한다. 머더미스터리 작품과 수강생 자료에 섞지 않는다.
- 2026-09-08 보완: 세 게임에 그래픽·효과음·브라우저 최고 기록·전체 화면을 적용했다. 블록 보관, 핀볼 적중 보너스, 자동차 이동 중 충돌 판정을 추가했다.
- 2026-09-08 추가: 지뢰찾기, 솔리테어, 스도쿠, 숫자 합치기, 카드 짝 맞추기, 슬라이딩 퍼즐을 더해 총 9종으로 확장했다. 홈에서는 대표 3종만 소개한다. 시리즈 시작일과 개별 작품의 제작일은 구분한다.

## 추가 게임의 구현 범위

| 게임 | 규칙·구현 | 입력 |
| --- | --- | --- |
| 지뢰찾기 | 6×6, 지뢰 6개, 첫 칸 주변 보호, 빈 영역 자동 열기, 깃발, 주변 칸 함께 열기 | 칸 클릭, 오른쪽 클릭, 깃발 모드 |
| 솔리테어 | 클론다이크 한 장 뽑기, 7열, 무제한 스톡 재순환, 카드 묶음 이동, 자동 뒤집기, 힌트, 되돌리기 | 카드 선택 후 목적지 클릭 |
| 스도쿠 | 해답이 하나인 문제의 숫자·행·열 변형, 후보 메모, 검사, 힌트, 되돌리기 | 칸 선택과 숫자 버튼·키보드 |
| 숫자 합치기 | 2048 규칙, 한 이동당 한 번 병합, 점수, 되돌리기, 2048 이후 계속하기 | 방향키·버튼·밀기 |
| 카드 짝 맞추기 | 12장·6쌍, 시도 횟수, 불일치 시 뒤집기, 재시작 타이머 취소 | 두 장 클릭 |
| 슬라이딩 퍼즐 | 4×4, 합법적인 이동으로 섞기, 이동 횟수·제자리 표시, 되돌리기 | 인접한 숫자 클릭·방향키 |

추가 게임의 카드·숫자·격자는 HTML/CSS/SVG로 표시한 게임 UI이며 외부 일러스트를 사용하지 않았다. 효과음은 기존 Kenney Interface Sounds(CC0)를 재사용한다. 추가 6종에는 브라우저 최고 기록 저장이나 전체 화면 기능을 표시하지 않는다. 솔리테어는 무작위 배분이며 모든 판이 해결 가능하다고 안내하지 않는다.

규칙 확인에 참고한 출처: [Bicycle Klondike](https://bicyclecards.com/how-to-play/klondike), [GNOME Mines](https://help.gnome.org/gnome-mines/rules.html), [Nikoli Sudoku](https://www.nikoli.co.jp/en/puzzles/sudoku/), [2048 원작](https://github.com/gabrielecirulli/2048), [Fifteen 규칙](https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/fifteen.html). 외부 게임 소스 코드를 복사하지 않고 규칙을 구현했다.

`lib/games/history.ts`가 되돌리기 기록을 최대 100개로 제한한다. 게임별 규칙은 개별 순수 함수 모듈에 두고, React 입력 화면은 `components/mini-games/table`에 분리했다. `tests/classic-games.test.mjs`에서 첫 클릭 보호, 카드 수·재순환 순서, 병합, 스도쿠 유일해, 슬라이딩 퍼즐 해결 가능성, 입력 잠금과 되돌리기를 검사한다.

## 그래픽·효과음 출처

2026-09-08 공식 사이트와 각 ZIP의 `License.txt`를 확인했다. 모두 CC0이며 상업적 사용과 재배포를 허용한다. 사용한 파일만 `public/assets/games`에 저장했다. 그래픽을 단서공방의 원화로 표기하지 않는다.

| 패키지 | 공식 페이지 | ZIP | 적용 파일 |
| --- | --- | --- | --- |
| Kenney Puzzle Pack 2 | https://kenney.nl/assets/puzzle-pack-2 | https://kenney.nl/media/pages/assets/puzzle-pack-2/2b69820372-1677667476/kenney_puzzle-pack-2.zip | Tiles 각 색상 `_01` → tiles/*.png; tileYellow_11 → bumper.png; paddle_01 → paddle.png; ballGrey_01 → ball.png |
| Kenney Racing Pack | https://kenney.nl/assets/racing-pack | https://kenney.nl/media/pages/assets/racing-pack/c4cd68480a-1677662443/kenney_racing-pack.zip | car_blue_1 → racing/player.png; car_red_1 → racing/traffic.png; tree_small → racing/tree.png |
| Kenney Interface Sounds | https://kenney.nl/assets/interface-sounds | https://kenney.nl/media/pages/assets/interface-sounds/fa43c1dd4d-1677589452/kenney_interface-sounds.zip | click_001, confirmation_001, drop_001, bong_001, error_001 |

원본 라이선스는 `public/assets/games/licenses`에 보존한다. 원본 PNG를 수정하지 않고 Canvas에서 표시 크기를 지정했다. OGG 효과음은 브라우저 호환성을 위해 AAC/M4A 96kbps로 변환했다. 효과음은 기본으로 꺼져 있으며 사용자 조작 후에만 재생한다. 최고 기록은 브라우저 localStorage에만 저장한다.

## 작품 예고편

사용자가 사이트 반영을 요청한 원본 파일:

- `Downloads/교수님_편히쉬세요_작품예고편_v4.mp4`: 47초, 1920×1080. 재압축 없이 MP4 메타데이터를 앞으로 옮겼다.
- `Downloads/슬라임은소다맛이난다_작품예고편_v4.mp4`: 42초, 1920×1080. H.264 CRF 23, AAC 128kbps로 웹용 사본을 만들었다.

각각 `/works/professor-rest`, `/works/slime-soda`의 작품 소개 앞에 배치했다. 원본은 보존하며 웹용 파일은 `public/assets/work-trailers`에 둔다. 8초 지점의 960px 폭 JPEG를 재생 전 포스터로 사용한다. 자동 재생 없이 `controls`, `playsInline`, `preload="none"`을 적용한다.

## 두 열쇠 예고편 — 2026-09-09

사용자가 승인한 v8 수정본을 홈의 영어 미스터리 수업팩 영역과 `/episode#episode-trailer`에 배치했다. 홈의 카드 앞·뒷면 이미지 자리를 영상으로 바꾸고, 에피소드 페이지는 표지 소개 뒤에 넓게 배치했다. 기존 브랜드 영상과 작품 예고편은 그대로 둔다.

- 원본: `/Users/kimkanghoon/heygen/projects/promo/two-keys/delivery/8시까지_두열쇠_장면재편집_v8.mp4`
- 웹용 파일: `public/assets/videos/two-keys-trailer-v8.mp4`, 25.76초, 1920×1080. 재압축 없이 복사했다.
- 포스터: 원본 v8 썸네일을 WebP로 변환했다.
- `components/episode-trailer.tsx`에서 두 페이지가 같은 영상과 대본을 사용한다. 자동 재생 없이 `controls`, `playsInline`, `preload="none"`을 적용한다. 영상에 자막이 이미 있으므로 별도 한국어 VTT는 기본으로 켜지 않는다.
- `/episode`의 옛 시각·열쇠 용도·확인되지 않은 인물별 단서를 원문 분석에 맞춰 정정했다. 기준은 금요일 19:10, 20:00 기한, 시험 자료함·휴대폰함, 아직 확인하지 못한 네 학생의 가방이다.
- 사이트 빌드, 관련 페이지 검사, 영상 Range 요청, 자막 파일 응답을 확인했다. 브라우저 화면의 재생·모바일 실기기 검토는 별도로 수행하지 않았다.
- 2026-09-09 사용자 배포 요청 후 기존 Vercel 프로젝트에 게시했다. 공개 주소는 `https://dullg-landing-one.vercel.app`이다. 홈·에피소드의 새 영상 참조, MP4의 206 구간 응답, 한국어 VTT 응답을 확인했다. Sites의 옛 연결은 `project_not_found` 상태여서 사용하지 않았다.
- 이번 배포는 기존 공개본과 영상 관련 14개 파일로 구성했다. 별도로 작업 중인 스피킹 기능·비공개 학습 자료는 배포 묶음에 포함하지 않았다. 배포 기록은 HeyGen 프로젝트의 `work/site-release-v8-manifest.json`, 검사 결과는 `review/site-v8-deployment-qa.json`에 있다.

## 코드 구분

- `lib/mini-projects.ts`: 작품 소개 데이터.
- `lib/games`: DOM을 사용하지 않는 게임 규칙·충돌·점수 계산. 기록 저장만 별도 모듈로 둔다.
- `components/mini-games/render.ts`: Canvas 화면 표시.
- `assets.ts`, `feedback.ts`: 에셋 로드·효과음·파티클.
- `game-player.tsx`: 키보드·터치 입력, 일시정지, 재시작과 게임 루프.
- `tests/mini-games.test.mjs`: 결정적 시뮬레이션과 경계값 검사.
