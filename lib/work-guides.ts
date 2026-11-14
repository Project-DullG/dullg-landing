/**
 * Per-work fields for the "first time playing a murder mystery" guide.
 * Every value comes from the work's own synopsis or official introduction.
 * Leave a field out rather than guessing; the guide hides empty fields.
 */
export type WorkGuide = {
  /** Who each player becomes, in one plain phrase. */
  role: string;
  /** What the group is trying to find out. */
  goal: string;
  /** Content warnings copied from the official introduction. */
  caution?: string;
};

export const workGuides: Record<string, WorkGuide> = {
  "slime-soda": {
    role: "포포롱 마을 작은 구조대의 대원 한 명",
    goal: "냉동고 안에서 얼어붙은 슬라임에게 무슨 일이 있었는지",
  },
  "professor-rest": {
    role: "청람대학교 연구실 구성원 한 명",
    goal: "호숫가 계단 아래에서 발견된 박정호 교수의 죽음에 얽힌 진실",
  },
  "snake-carnival": {
    role: "지하 예배실에 있던, 가면을 쓴 네 사람 중 한 명",
    goal: "제단 위에서 교주를 죽인 진짜 범인",
    caution:
      "살인, 폭력, 고어, 오컬트, 종교적 상징, 사회적 위선, 강한 심리 압박 같은 요소가 들어 있습니다.",
  },
  "red-lab": {
    role: "비밀 연구소에 남은 네 레인저 중 한 명",
    goal: "잠긴 방에서 숨진 레드에게 그날 밤 일어난 일",
  },
  "gourmet-master": {
    role: "왕실 요리사 선발 대회 현장에 있던 네 요리사 중 한 명",
    goal: "비공개 심사 직후 쓰러진 왕실 요리장 사건의 범인",
  },
  "too-many-doctors": {
    role: "국왕을 치료한 여섯 의사 중 한 명",
    goal: "치료 한 시간 뒤 숨을 거둔 왕의 사인과 진짜 범인",
  },
};
