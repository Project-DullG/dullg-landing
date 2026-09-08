# 미니 프로젝트와 작품 예고편

## 소개 기준

- 사용자 요청에 따라 미니 프로젝트 시리즈는 2026년 2월 시작으로 소개한다.
- 두 달에 한 편을 만드는 것을 목표로 적는다. 개별 작품의 제작일·출시일이나 월별 이력은 임의로 소급하지 않는다.
- 웹게임은 `/mini-projects` 아래에서 소개한다. 머더미스터리 작품과 수강생 자료에 섞지 않는다.
- 2026-09-08 보완: 세 게임에 그래픽·효과음·브라우저 최고 기록·전체 화면을 적용했다. 블록 보관, 핀볼 적중 보너스, 자동차 이동 중 충돌 판정을 추가했다.

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

## 코드 구분

- `lib/mini-projects.ts`: 작품 소개 데이터.
- `lib/games`: DOM을 사용하지 않는 게임 규칙·충돌·점수 계산. 기록 저장만 별도 모듈로 둔다.
- `components/mini-games/render.ts`: Canvas 화면 표시.
- `assets.ts`, `feedback.ts`: 에셋 로드·효과음·파티클.
- `game-player.tsx`: 키보드·터치 입력, 일시정지, 재시작과 게임 루프.
- `tests/mini-games.test.mjs`: 결정적 시뮬레이션과 경계값 검사.
