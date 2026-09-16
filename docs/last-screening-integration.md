# 마지막 상영 사이트 통합

- 사용자가 제공한 0.10.0 HTML 두 파일은 SHA-256이 같았다. 원본 식별값은 `public/assets/last-screening/provenance.json`에 기록했다.
- `node scripts/import-last-screening.mjs <HTML 경로>`로 원본을 실행하지 않고 이미지·음악과 스크립트를 분리한다. 스크립트 순서는 원본 그대로 유지한다.
- WebP, MP3, OGG 54개는 원본 바이트를 보존했다. 소개용 표지만 1440px WebP로 따로 만들었다.
- `site.css`는 사이트 복귀 링크, 모바일 안내 화면 정렬, 하단 메뉴와 터치 영역만 담당한다. 다시 가져와도 이 파일은 덮어쓰지 않는다.
- 게임 문구, 사건의 정답, 분기와 저장 키는 수정하지 않았다. 플레이 시간은 실측하지 않아 소개에 기입하지 않았다.
- `/games/last-screening`에 소개를, `/assets/last-screening/index.html`에 실행 화면을 배치했다. 실행 화면은 검색 색인을 막고 소개 페이지로 연결한다.
- 5개 화면 크기에서 시작, 사건 안내, 대화, 설정 저장과 새로고침 복원을 점검한다. 이 검사는 사건 전체의 정답 경로와 모든 결말을 검증하는 테스트가 아니다.

## 검증 명령

`node --test tests/last-screening.test.mjs`

`node scripts/test-last-screening.mjs http://localhost:3000`
