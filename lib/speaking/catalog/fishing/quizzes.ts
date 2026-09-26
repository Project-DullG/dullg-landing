export type Quiz = {
  prompt: string;
  choices: string[];
  correct: number;
  explanation: string;
};
const q = (prompt: string, choices: string[], correct: number, explanation: string): Quiz => ({
  prompt,
  choices,
  correct,
  explanation,
});
export const quizzes: Record<string, Quiz> = {
  R01: q(
    "안내문에서 표를 살 수 있는 곳은?",
    ["물품 보관함", "안내 데스크", "전시실 안"],
    1,
    "Tickets are available at the front desk. 표는 안내 데스크에서 살 수 있습니다.",
  ),
  R02: q(
    "버스 출발 시각은?",
    ["8시 20분", "8시 30분", "8시 40분"],
    1,
    "출발은 eight thirty입니다. ten minutes early는 도착 안내입니다.",
  ),
  R05: q(
    "첫 수업의 장소와 시작 시각은?",
    ["Room Three · 9:30", "등록 데스크 · 9:30", "Room Three · 10:30"],
    0,
    "The first session will start in Room Three at nine thirty. 장소와 시간을 함께 읽습니다.",
  ),
  PW01: q(
    "사진 묘사에서 근거로 사용할 수 있는 것은?",
    ["사진 속 사람의 직업 추측", "사진에 보이는 행동과 위치", "사진 속 사람의 기분 추측"],
    1,
    "보이는 행동과 위치를 설명합니다. 사진만으로 알 수 없는 직업·관계·감정을 덧붙이지 않습니다.",
  ),
  PW02: q(
    "사진을 보고 단정하기 어려운 정보는?",
    ["책상 옆에 사람이 있다", "사람이 책을 들고 있다", "사람이 시험 때문에 걱정한다"],
    2,
    "시험 때문이라는 이유나 걱정한다는 감정은 사진만으로 확인할 수 없습니다.",
  ),
  Q01: q(
    "방금 질문이 요구한 두 항목은?",
    ["점심 장소와 함께 먹는 사람", "점심 가격과 음식 종류", "식사 시각과 빈도"],
    0,
    "Where는 장소, who는 함께 먹는 사람을 묻습니다. 자신의 실제 내용으로 둘 다 답합니다.",
  ),
  Q02: q(
    "질문에서 묻는 항목은?",
    ["교통수단의 가격과 장점", "이용 빈도와 주로 가는 곳", "동행인과 출발 시각"],
    1,
    "How often은 빈도, where는 목적지를 묻습니다.",
  ),
  Q06: q(
    "장보기 질문에 필요한 정보는?",
    ["주로 사는 음식과 가격", "함께 가는 사람과 이유", "장을 보는 장소와 시점"],
    2,
    "Where와 when을 모두 답해야 합니다.",
  ),
  I01: q(
    "등록 시작 시각과 장소는?",
    ["9:00 a.m. · Main lobby", "9:30 a.m. · Room 201", "10:15 a.m. · Main lobby"],
    0,
    "Registration 행은 9:00–9:30 a.m., Main lobby입니다. 시작 시각은 9시입니다.",
  ),
  I02: q(
    "이력서 수업 담당자는?",
    ["Daniel Lee", "Lisa Park", "Sara Kim"],
    1,
    "Writing a Resume의 담당자는 Lisa Park입니다. Daniel Lee는 Interview Practice를 진행합니다.",
  ),
  I03: q(
    "휴식 후 첫 수업의 시간과 장소는?",
    ["9:30–10:15 · Room 201", "10:15–10:30 · Main lobby", "10:30–11:15 · Room 202"],
    2,
    "휴식 다음 행은 Interview Practice입니다. 실제 답변에는 그 다음 수업도 포함합니다.",
  ),
  I06: q(
    "휴식 후 첫 수업은 어디에서 열리나요?",
    ["Room 102", "Main lobby", "Room 101"],
    0,
    "Protecting Your Personal Information은 2:15–3:00 p.m., Room 102입니다. 실제 답변에는 두 수업의 시간과 장소를 포함합니다.",
  ),
  O01: q(
    "의견 답변에 필요한 구성은?",
    ["정해진 정답 입장", "온라인 수업의 단점만 나열", "자신의 선택과 그 선택을 뒷받침하는 설명"],
    2,
    "온라인·대면 중 어느 쪽도 가능합니다. 선택의 이유와 구체적인 예로 설명합니다.",
  ),
  O02: q(
    "아르바이트 의견 문제에서 정해져 있지 않은 것은?",
    ["반드시 찬성해야 한다는 입장", "자기 의견을 밝히는 일", "이유와 예로 의견을 설명하는 일"],
    0,
    "찬성·반대 모두 가능합니다. 예문과 의견이 다르다는 이유로 오답이 되지 않습니다.",
  ),
  XR01: q(
    "음식을 먹도록 안내한 장소는?",
    ["자리 옆", "아래층 라운지", "안내 데스크"],
    1,
    "Food should be eaten in the downstairs lounge. downstairs는 아래층을 뜻합니다.",
  ),
  XR02: q(
    "수업 예약 연락은 언제까지 해야 하나요?",
    ["토요일까지", "목요일까지", "정오까지"],
    1,
    "call our office by Thursday에서 by는 마감 시점을 나타냅니다.",
  ),
  XR03: q(
    "상담에 가져오도록 안내한 것은?",
    ["이력서 사본", "입장권", "수업 도구"],
    0,
    "bring a copy of your resume는 이력서 사본을 가져오라는 뜻입니다.",
  ),
  XR04: q(
    "직접 가져오도록 안내한 물건은?",
    ["장갑", "마실 물", "모자"],
    2,
    "장갑과 물은 제공됩니다. Please bring a hat에서 직접 가져올 물건을 확인합니다.",
  ),
  XQ01: q(
    "일요일 오후 질문이 요구한 것은?",
    ["활동 비용과 빈도", "보내는 장소와 함께하는 사람", "시작 시각과 이동 방법"],
    1,
    "Where와 who를 물었습니다. 자신의 상황에 맞는 장소와 사람을 답합니다.",
  ),
  XQ04: q(
    "운동 질문에 포함해야 할 두 항목은?",
    ["즐기는 운동과 하는 장소", "운동 시간과 비용", "운동 동료와 빈도"],
    0,
    "What kind of exercise와 where를 모두 답합니다.",
  ),
  XO01: q(
    "이 질문에서 비교하는 두 학습 방법은?",
    ["혼자 공부하기와 교재 읽기", "긴 강의와 짧은 강의", "짧은 영상과 대면 수업"],
    2,
    "watching short videos와 attending a class in person 중 선호를 밝히고 이유를 설명합니다.",
  ),
  XO03: q(
    "도서관 문제에서 요구하는 의견은?",
    ["주말에 더 늦게까지 여는 데 대한 찬반", "도서관을 새로 짓는 장소", "평일 개관 시각"],
    0,
    "stay open later on weekends에 찬성하거나 반대하고 이유와 예를 듭니다.",
  ),
  XI01: q(
    "등록을 시작하는 시각과 장소는?",
    ["9:15 a.m. · Room 201", "9:00 a.m. · Front desk", "10:00 a.m. · Lobby"],
    1,
    "Community Skills Day의 Registration 행을 보면 9:00 a.m., Front desk입니다.",
  ),
  XI03: q(
    "휴식 후 첫 수업의 장소는?",
    ["Room 201", "Lobby", "Room 202"],
    2,
    "Basic Home Repairs는 Room 202입니다. 실제 답변에는 Growing Herbs의 시간과 장소도 포함합니다.",
  ),
  XI04: q(
    "이력서 수업의 시작 시각과 담당자는?",
    ["1:20 p.m. · Maya Chen", "2:15 p.m. · Owen Brooks", "3:10 p.m. · Sofia Reed"],
    0,
    "Riverside Career Fair의 Writing a Resume 행에서 1:20 p.m.와 Maya Chen을 찾습니다.",
  ),
};
