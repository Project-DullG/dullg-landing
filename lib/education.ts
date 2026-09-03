import { ulleungPresentation } from "./presentations";

export const educationFacts = [
  ["4차시", "읽기부터 사건보고서까지"],
  ["초6~중1", "첫 파일럿 검토 기준"],
  ["4~16명", "권장 수업 인원"],
  ["30분 이내", "첫 수업 준비 목표"],
] as const;

export const curriculum = [
  { session: "01", title: "사건을 읽다", label: "READ THE CASE", body: "사건의 배경과 인물을 읽고, 직접 제시된 사실과 중요한 단서를 골라냅니다.", output: "단서 기록지" },
  { session: "02", title: "단서를 연결하다", label: "CONNECT THE CLUES", body: "질문하고 추측하며 시간·장소·인물 사이의 관계와 모순을 찾아갑니다.", output: "팀 추론 보드" },
  { session: "03", title: "근거를 비교하다", label: "TEST THE THEORY", body: "여러 가설을 비교하고 새로운 증거가 나왔을 때 자신의 판단을 수정합니다.", output: "주장·근거 정리" },
  { session: "04", title: "사건을 보고하다", label: "TELL THE STORY", body: "최종 판단과 두 가지 근거를 영어 문장으로 정리해 팀 사건 보고서를 완성합니다.", output: "팀 보고서 · 개인 영작" },
] as const;

export type MaterialLink = {
  title: string;
  body: string;
  href: string;
  download?: boolean;
};

export type CourseMaterial = {
  title: string;
  meta: string;
  files: MaterialLink[];
};

export const courseMaterials: CourseMaterial[] = [
  {
    title: "울릉고 리빙랩 특강",
    meta: "울릉고등학교 · 2026년 9월 5일",
    files: [
      { title: "특강 발표자료", body: `${ulleungPresentation.slides.length}쪽 · ${ulleungPresentation.updatedAt} 보강 · 바로 읽기`, href: ulleungPresentation.href },
    ],
  },
  {
    title: "울릉군 생태관광 AI 교육",
    meta: "울릉군 · 2026년 4월 18일 · 울릉고등학교 전산실",
    files: [
      { title: "교육 자료", body: "수업 일정, 실습 순서, 예시 프롬프트와 준비 사항", href: "https://kanghoon1204.github.io/ulleung-ecotourism-edu/" },
      { title: "수업 진행 페이지", body: "수업 시간에 따라 실습 내용을 확인하는 진행용 화면", href: "https://kanghoon1204.github.io/ulleung-ecotourism-edu/class.html" },
      { title: "프롬프트 가이드", body: "프롬프트 작성 원리와 단계별 실습 안내", href: "https://kanghoon1204.github.io/ulleung-ecotourism-edu/prompt-guide.html" },
      { title: "웹페이지 예시", body: "교육 중 제작한 울릉도 관광 웹페이지 예시", href: "https://kanghoon1204.github.io/ulleung-ecotourism-edu/example.html" },
      { title: "보드게임 기획 도구", body: "울릉군 생태관광 소재를 보드게임 기획안으로 정리하는 실습 도구", href: "https://kanghoon1204.github.io/ulleung-ecotourism-edu/boardgame.html" },
    ],
  },
];
