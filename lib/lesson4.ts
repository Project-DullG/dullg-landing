export const lesson4 = {
  href: "/materials/ulleung-high-lesson-4",
  version: "history-tourism-60min-v2",
  title: "울릉고 리빙랩 4차시",
  meta: "울릉고등학교 · 4차시 · 16:00–17:00",
  description: "AI 활용 역사·관광 콘텐츠 기획안·설계안 작성 · 60분 · 발표자료 24쪽",
  pdf: "/assets/materials/ulleung-high-lesson-4.pdf",
  pptx: "/assets/materials/ulleung-high-lesson-4.pptx",
  murderMysteryPrompt:
    "/assets/materials/ulleung-high-lesson-4/murder-mystery-co-creation-v1-1.md",
  boardAndMysteryGamePrompt:
    "/assets/materials/ulleung-high-lesson-4/board-and-mystery-game-creation-prompt.md",
  detailedPlanningPrompt:
    "/assets/materials/ulleung-high-lesson-4/board-game-detailed-planning-prompt.md",
  titles: [
    [
      "AI 활용 지역 관광 보드게임 및 체험형 교구 디자인",
      "AI-assisted tourism board games and hands-on learning kits",
    ],
    ["16시부터 17시까지, 60분", "Our 60 minutes, from 16:00 to 17:00"],
    ["학생 아이디어에서 출발", "Starting with student ideas"],
    ["오늘 남길 기획안과 설계안", "The concept plan and design plan"],
    ["기획이 온라인 체험으로 이어지면", "From a plan to an online experience"],
    ["역사·관광자료를 고르는 기준", "Choosing historical and tourism sources"],
    ["소재를 놀이와 활동으로 바꾸기", "Turning local materials into play and activities"],
    ["AI에 건네는 첫 요청", "Our first prompt to AI"],
    ["보드게임과 체험형 교구 제안", "A board game or a hands-on learning kit"],
    ["고른 안을 구체적으로 수정하기", "Making a specific revision request"],
    ["기획안의 네 항목", "Four parts of the concept plan"],
    ["지역 관광 기획안 예시", "A regional tourism concept plan example"],
    ["우리 팀 기획안 작성", "Writing our team’s concept plan"],
    ["설계안에 필요한 정보", "What the design plan needs"],
    ["한 차례와 한 활동의 흐름", "The flow of a turn or an activity"],
    ["구성품과 이용자 행동", "Components and user actions"],
    ["자료 카드의 앞면과 뒷면", "The front and back of a source card"],
    ["AI에 설계안 초안 요청하기", "Asking AI for a design draft"],
    ["체험형 교구 설계안 예시", "A hands-on learning kit design example"],
    ["우리 팀 설계안 작성", "Writing our team’s design plan"],
    ["사실과 진행 방식 점검", "Checking facts and how the activity works"],
    ["다른 팀에 설명하기", "Explaining the idea to another team"],
    ["받은 의견으로 수정하기", "Revising with feedback"],
    ["기획안과 설계안 정리", "Saving our concept and design plans"],
  ],
};

export function lesson4Slides(english: boolean) {
  return lesson4.titles.map((titles, index) => ({
    title: titles[english ? 1 : 0],
    summary: "",
    image: `/assets/materials/ulleung-high-lesson-4/${lesson4.version}/slide-${String(index + 1).padStart(2, "0")}.webp`,
  }));
}
