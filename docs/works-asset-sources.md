# 작품 이미지 출처 기록

2026-09-03 갱신. 대표 이미지와 함께 사용자가 재사용을 요청한 공식 텀블벅 작품 소개 이미지를 사용한다.

## 작품 상세 소개

- `docs/work-landing-sources.json`에 공식 원본 주소와 적용 범위를 기록했다.
- 6개 작품을 각각 분리하고, 본문은 `lib/work-landings.json`에서 관리한다.
- 긴 이미지는 1240px 너비의 WebP로 최대 2000px씩 연속 분할해 지연 로딩한다. 이미지 사이에는 여백을 넣지 않는다.
- 3종 펀딩의 테스터 후기와 모든 후원자 댓글, 펀딩 보상표는 가져오지 않았다.
- 2종과 3종 프로젝트의 생성형 AI 이미지 고지는 상세 페이지에 유지한다.
- 뱀이 죽은 축제는 소개와 등장인물 이미지 2장만 적용했다.
- 교수님, 편히 쉬세요의 인원은 현재 공식 소개 이미지에 맞춰 5인으로 수정했다.

| 로컬 파일 | 작품/용도 | 원본 출처 | 처리 |
| --- | --- | --- | --- |
| `public/assets/works/snake-carnival-cover.webp` | 《뱀이 죽은 축제》 대표 이미지 | https://tumblbug.com/projectdg0 의 `og:image` | 1000×1000 원본 PNG를 WebP 품질 82로 변환 |
| `public/assets/works/murder-mystery-three-cover.webp` | 《레드가 죽은 연구소》, 《미식의 대가》, 《의사가 너무 많아!》 3종 대표 이미지 | https://tumblbug.com/projectdg1 의 `og:image` | 1000×1000 원본 PNG를 WebP 품질 82로 변환 |
| `public/assets/works/slime-soda-cover.webp` | 《슬라임은 소다맛이 난다》 개별 이미지 | https://murdermysterylog.com/detail/589 에 등록된 공개 이미지 | 최대 1000px, WebP 품질 82로 최적화 |
| `public/assets/works/professor-rest-cover.webp` | 《교수님, 편히 쉬세요》 개별 이미지 | https://murdermysterylog.com/detail/590 에 등록된 공개 이미지 | 최대 1000px, WebP 품질 82로 최적화 |
| `public/assets/works/red-lab-cover.webp` | 《레드가 죽은 연구소》 개별 이미지 | 머미로그 공개 작품 이미지 `km_229.webp` | 최대 1000px, WebP 품질 82로 최적화 |
| `public/assets/works/gourmet-cover.webp` | 《미식의 대가》 개별 이미지 | 머미로그 공개 작품 이미지 `km_230.webp` | 최대 1000px, WebP 품질 82로 최적화 |
| `public/assets/works/doctor-cover.webp` | 《의사가 너무 많아!》 개별 이미지 | 머미로그 공개 작품 이미지 `km_228.webp` | 최대 1000px, WebP 품질 82로 최적화 |
| `public/assets/works/gray-girl-memory-cover.webp` | 《잿빛 소녀가 죽은 추억(醜憶)》 작품 이미지 | 공식 UZU 작품 페이지의 공개 대표 이미지 | 1200px WebP 품질 82로 최적화 |
