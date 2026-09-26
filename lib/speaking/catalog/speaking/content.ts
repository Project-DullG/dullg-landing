import expansion from "./content-expansion.json" with { type: "json" };
import extra from "./extra-content.json" with { type: "json" };
export type TaskType = "read" | "photo" | "respond" | "info" | "opinion";
export const taskTypes: {
  id: TaskType;
  title: string;
  en: string;
  range: string;
  prep: string;
  answer: string;
  goal: string;
  criteria: string;
  improve: string;
}[] = [
  {
    id: "read",
    title: "지문 읽기",
    en: "READ A TEXT ALOUD",
    range: "1–2",
    prep: "45초",
    answer: "45초",
    goal: "주어진 문장을 빠뜨리지 않고 알아들을 수 있게 읽기",
    criteria: "발음, 억양·강세",
    improve: "끊긴 구간 하나를 골라 듣고 따라 읽은 뒤, 원래 지문 전체를 읽습니다.",
  },
  {
    id: "photo",
    title: "사진 묘사",
    en: "DESCRIBE A PICTURE",
    range: "3–4",
    prep: "45초",
    answer: "30초",
    goal: "사진에 보이는 대상·행동·위치를 설명하기",
    criteria: "발음, 억양·강세, 문법·어휘·문장 연결",
    improve:
      "주요 대상의 행동을 먼저 말하고 주변 정보를 더합니다. 관계나 감정은 지어내지 않습니다.",
  },
  {
    id: "respond",
    title: "질문에 답하기",
    en: "RESPOND TO QUESTIONS",
    range: "5–7",
    prep: "질문 후 3초",
    answer: "15·15·30초",
    goal: "질문에서 요구한 정보를 빠뜨리지 않고 답하기",
    criteria: "앞의 항목에 내용의 관련성·완성도 추가",
    improve:
      "장소와 빈도를 물었다면 둘 다 답합니다. 예시의 생활 습관을 자신의 경험처럼 외우지 않습니다.",
  },
  {
    id: "info",
    title: "정보를 보고 답하기",
    en: "USE INFORMATION PROVIDED",
    range: "8–10",
    prep: "표 45초 + 질문 후 3초",
    answer: "15·15·30초",
    goal: "질문의 조건에 맞는 표의 사실을 전달하기",
    criteria: "관련성·완성도, 자료와 맞는 정보, 전달의 명확성",
    improve: "맞는 행을 찾고 시간·장소를 확인합니다. 10번 질문은 두 번 듣습니다.",
  },
  {
    id: "opinion",
    title: "의견 말하기",
    en: "EXPRESS AN OPINION",
    range: "11",
    prep: "45초",
    answer: "60초",
    goal: "입장을 정하고 이유와 구체적인 설명으로 뒷받침하기",
    criteria: "내용의 관련성·완성도, 문장 연결과 이해 가능한 표현",
    improve:
      "이유가 왜 자신의 선택을 뒷받침하는지 설명합니다. 고정 문장 수는 공식 채점 기준이 아닙니다.",
  },
];
export type Schedule = {
  id: string;
  title: string;
  date: string;
  rows: string[][];
};
export const schedules: Record<string, Schedule> = {
  ...extra.schedules,
  ...expansion.schedules,
  career: {
    id: "career",
    title: "Community Career Workshop",
    date: "Saturday, October 10",
    rows: [
      ["9:00–9:30 a.m.", "Registration", "—", "Main lobby"],
      ["9:30–10:15 a.m.", "Writing a Resume", "Lisa Park", "Room 201"],
      ["10:15–10:30 a.m.", "Break", "—", "Main lobby"],
      ["10:30–11:15 a.m.", "Interview Practice", "Daniel Lee", "Room 202"],
      ["11:15 a.m.–12:00 p.m.", "Finding Your First Job", "Sara Kim", "Room 201"],
    ],
  },
  tech: {
    id: "tech",
    title: "Community Technology Workshop",
    date: "Saturday",
    rows: [
      ["1:00–1:20 p.m.", "Registration", "—", "Main lobby"],
      ["1:20–2:00 p.m.", "Using Online Services", "Mina Choi", "Room 101"],
      ["2:00–2:15 p.m.", "Break", "—", "Main lobby"],
      ["2:15–3:00 p.m.", "Protecting Your Personal Information", "David Kim", "Room 102"],
      ["3:00–3:40 p.m.", "Choosing a New Computer", "Alex Park", "Room 101"],
    ],
  },
};
export type Question = {
  id: string;
  type: TaskType;
  title: string;
  prep: number;
  answer: number;
  prompt: string;
  passage?: string;
  photo?: string;
  table?: string;
  position?: number;
  checks: string[];
  coaching: string;
  sample?: string;
  focus: string;
  transfer: string;
  topic?: string;
  meaning?: string;
  objective?: string;
  chunks?: string[];
  sampleNote?: string;
};
const coreQuestions: Question[] = [
  {
    id: "R01",
    type: "read",
    title: "미술관 안내문",
    prep: 45,
    answer: 45,
    prompt: "Read the text aloud.",
    passage:
      "Welcome to the Riverside Art Center. Our new exhibition is open from ten in the morning until six in the evening. Tickets are available at the front desk. Please leave large bags in the lockers before entering the exhibition hall.",
    checks: [
      "단어를 빼거나 바꾸지 않고 읽었는가",
      "운영 시간과 매표 장소가 들리는가",
      "의미가 이어지는 말을 묶어 읽었는가",
    ],
    coaching:
      "ten in the morning / until six in the evening처럼 시간 정보를 묶어 읽어 보세요. 실제로 막힌 구간 하나부터 고칩니다.",
    focus: "C1",
    transfer: "R04",
  },
  {
    id: "R02",
    type: "read",
    title: "투어 출발 안내문",
    prep: 45,
    answer: 45,
    prompt: "Read the text aloud.",
    passage:
      "Thank you for choosing Greenway Tours. The bus will leave from the main entrance at eight thirty. Please arrive ten minutes early and bring your ticket. If you need assistance, a staff member will be waiting beside the information board.",
    checks: [
      "출발 장소와 8시 30분이 들리는가",
      "ten minutes early를 빠뜨리지 않았는가",
      "끝까지 읽었는가",
    ],
    coaching:
      "leave from the main entrance / at eight thirty를 구절로 연습한 뒤 전체를 다시 읽습니다.",
    focus: "V1",
    transfer: "R05",
  },
  {
    id: "R04",
    type: "read",
    title: "방문자 센터 안내문",
    prep: 45,
    answer: 45,
    prompt: "Read the text aloud.",
    passage:
      "Welcome to the West Park Visitor Center. Guided tours begin at ten in the morning and two in the afternoon. Each tour lasts about forty minutes. Please meet your guide beside the ticket counter. Water is available near the main entrance.",
    checks: [
      "두 투어 시각을 모두 읽었는가",
      "forty minutes가 들리는가",
      "단어를 임의로 바꾸지 않았는가",
    ],
    coaching:
      "시각과 소요 시간을 구분해 전달합니다. forty가 실제로 들리지 않았을 때만 /f/를 따로 연습하세요.",
    focus: "F1",
    transfer: "R05",
  },
  {
    id: "R05",
    type: "read",
    title: "안전 교육 안내문",
    prep: 45,
    answer: 45,
    prompt: "Read the text aloud.",
    passage:
      "Thank you for attending our office safety workshop. The first session will start in Room Three at nine thirty. Please bring the folder you received at registration. After a short break, we will practice using the new equipment. Staff members will be available to answer your questions.",
    checks: [
      "장소·시각을 정확히 읽었는가",
      "긴 문장에서 단어가 빠지지 않았는가",
      "끝까지 알아들을 수 있게 읽었는가",
    ],
    coaching:
      "장소와 시간을 포함한 문장부터 비교해 보세요. 이해를 방해한 부분만 짧게 나누어 반복합니다.",
    focus: "T1",
    transfer: "R01",
  },
  {
    id: "PW01",
    type: "photo",
    title: "사진 연습 01",
    prep: 45,
    answer: 30,
    prompt: "Describe the picture in as much detail as you can.",
    photo: "cafe-generated.png",
    checks: [
      "주요 대상과 행동이 사진과 맞는가",
      "대상의 위치를 구분했는가",
      "사진에 없는 관계·감정을 지어내지 않았는가",
    ],
    coaching:
      "앉아 있는 두 사람, 쟁반을 든 사람, 테이블 주변처럼 관찰한 내용을 연결합니다. 정확한 장소명이나 사람들의 관계를 추정할 필요는 없습니다.",
    sample:
      "Two people are sitting at a table outside. A woman on the left is holding a tray. There are plants around the tables.",
    focus: "R1",
    transfer: "PW02",
  },
  {
    id: "PW02",
    type: "photo",
    title: "사진 연습 02",
    prep: 45,
    answer: 30,
    prompt: "Describe the picture in as much detail as you can.",
    photo: "library-generated.png",
    checks: [
      "앞쪽 인물의 행동을 설명했는가",
      "뒤쪽 인물이나 주변 대상을 설명했는가",
      "보이는 사실만 말했는가",
    ],
    coaching:
      "앞에서 책을 읽는 사람과 뒤에서 책장을 살피는 사람을 나누어 설명합니다. 사람의 직업이나 목적은 덧붙이지 않습니다.",
    sample:
      "A woman is reading a book at a table. Behind her, a man is looking at books on a shelf. There are several bookshelves in the room.",
    focus: "L1",
    transfer: "PW01",
  },
  {
    id: "Q01",
    type: "respond",
    title: "점심 장소와 동행",
    prep: 3,
    answer: 15,
    prompt: "Where do you usually have lunch, and who do you eat with?",
    checks: ["점심을 먹는 장소를 말했는가", "누구와 먹는지 답했는가"],
    coaching: "장소와 함께 먹는 사람을 둘 다 말합니다. 자신에게 맞는 사실을 사용하세요.",
    focus: "T2",
    transfer: "Q06",
  },
  {
    id: "Q02",
    type: "respond",
    title: "대중교통 이용",
    prep: 3,
    answer: 15,
    prompt: "How often do you use public transportation, and where do you usually go?",
    checks: ["얼마나 자주 이용하는지 답했는가", "주로 가는 곳을 말했는가"],
    coaching:
      "빈도와 목적지를 먼저 답합니다. 질문에 없는 이유를 길게 말하다 핵심을 놓치지 않습니다.",
    focus: "F1",
    transfer: "Q07",
  },
  {
    id: "Q03",
    type: "respond",
    title: "저녁 식사 후 활동",
    prep: 3,
    answer: 15,
    prompt: "What do you usually do after dinner?",
    checks: ["저녁 식사 후 하는 활동을 답했는가", "이해할 수 있는 짧은 문장으로 말했는가"],
    coaching:
      "자신이 실제로 하는 행동 하나를 먼저 말합니다. 아직 문장이 어려우면 주어와 동사부터 완성합니다.",
    focus: "R1",
    transfer: "Q01",
  },
  {
    id: "Q04",
    type: "respond",
    title: "공부 장소 선택",
    prep: 3,
    answer: 30,
    prompt:
      "What is the most important thing you consider when choosing a place to study? Explain why.",
    checks: ["선택 기준이 분명한가", "왜 그 기준이 중요한지 설명했는가"],
    coaching: "중요한 기준을 말한 뒤, 그 조건이 공부에 어떤 도움을 주는지 설명합니다.",
    focus: "T1",
    transfer: "Q08",
  },
  {
    id: "Q06",
    type: "respond",
    title: "식료품 구매 · 장소",
    topic: "Imagine that a survey company is asking you about grocery shopping.",
    prep: 3,
    answer: 15,
    prompt: "Where do you usually buy groceries, and when do you go there?",
    checks: ["사는 곳을 말했는가", "언제 가는지 답했는가"],
    coaching: "장소와 방문 시점을 모두 답합니다. 자신의 생활과 맞게 말하세요.",
    focus: "R1",
    transfer: "Q01",
  },
  {
    id: "Q07",
    type: "respond",
    title: "식료품 구매 · 빈도",
    topic: "Imagine that a survey company is asking you about grocery shopping.",
    prep: 3,
    answer: 15,
    prompt: "How often do you buy groceries, and how do you usually get to the store?",
    checks: ["구매 빈도를 말했는가", "이동수단을 답했는가"],
    coaching:
      "빈도와 교통수단이 모두 포함됐는지 확인합니다. 예시 빈도를 자신의 습관처럼 외우지 않습니다.",
    focus: "F1",
    transfer: "Q02",
  },
  {
    id: "Q08",
    type: "respond",
    title: "식료품 구매 · 선택",
    topic: "Imagine that a survey company is asking you about grocery shopping.",
    prep: 3,
    answer: 30,
    prompt:
      "What is most important to you when choosing a grocery store: the prices, the location, or the selection of products? Explain why.",
    checks: ["하나의 기준을 선택했는가", "그 기준과 연결된 이유를 설명했는가"],
    coaching: "기준과 이유를 연결하세요. 경험이 없으면 가정한 상황으로 설명할 수 있습니다.",
    focus: "L1",
    transfer: "Q04",
  },
  {
    id: "I01",
    type: "info",
    title: "진로 행사 · 등록",
    table: "career",
    position: 8,
    prep: 3,
    answer: 15,
    prompt: "What time does registration begin, and where will it take place?",
    checks: ["오전 9시를 전달했는가", "Main lobby를 전달했는가"],
    coaching: "표에서 Registration 행의 시작 시각과 장소를 확인합니다.",
    sample: "Registration begins at nine a.m. in the main lobby.",
    focus: "R1",
    transfer: "I04",
  },
  {
    id: "I02",
    type: "info",
    title: "진로 행사 · 정보 정정",
    table: "career",
    position: 9,
    prep: 3,
    answer: 15,
    prompt: "I heard that Daniel Lee will lead the resume session. Is that correct?",
    checks: ["질문의 잘못된 정보를 바로잡았는가", "진행자가 Lisa Park임을 말했는가"],
    coaching: "틀렸다는 말만 하고 멈추지 말고 실제 진행자를 알려 주세요.",
    sample: "No, Lisa Park will lead the resume session.",
    focus: "L1",
    transfer: "I05",
  },
  {
    id: "I03",
    type: "info",
    title: "진로 행사 · 두 세션",
    table: "career",
    position: 10,
    prep: 3,
    answer: 30,
    prompt: "What sessions can I attend after the break? Please include the times and locations.",
    checks: [
      "Interview Practice, 10:30–11:15, Room 202를 전달했는가",
      "Finding Your First Job, 11:15–12:00, Room 201을 전달했는가",
    ],
    coaching:
      "휴식 뒤 두 프로그램을 찾아 각각 이름·시간·장소를 말합니다. 표에 없는 비용은 추가하지 않습니다.",
    sample:
      "Interview Practice is from ten thirty to eleven fifteen in Room two oh two. Finding Your First Job is from eleven fifteen to noon in Room two oh one.",
    focus: "T1",
    transfer: "I06",
  },
  {
    id: "I04",
    type: "info",
    title: "기술 행사 · 등록",
    table: "tech",
    position: 8,
    prep: 3,
    answer: 15,
    prompt: "What time does registration begin, and where should I go?",
    checks: ["오후 1시를 전달했는가", "Main lobby를 전달했는가"],
    coaching: "Registration 행의 시작 시각과 장소를 확인합니다.",
    sample: "Registration begins at one p.m. Please go to the main lobby.",
    focus: "R1",
    transfer: "I01",
  },
  {
    id: "I05",
    type: "info",
    title: "기술 행사 · 정보 정정",
    table: "tech",
    position: 9,
    prep: 3,
    answer: 15,
    prompt:
      "I heard that David Kim will lead the session on using online services. Is that correct?",
    checks: ["틀린 전제를 바로잡았는가", "진행자가 Mina Choi임을 말했는가"],
    coaching: "온라인 서비스 세션은 Mina Choi가 진행합니다. David Kim의 프로그램과 구분합니다.",
    sample: "No, Mina Choi will lead the session on using online services.",
    focus: "V1",
    transfer: "I02",
  },
  {
    id: "I06",
    type: "info",
    title: "기술 행사 · 두 세션",
    table: "tech",
    position: 10,
    prep: 3,
    answer: 30,
    prompt:
      "What sessions are scheduled after the break? Please tell me their times and locations.",
    checks: [
      "개인정보 보호, 2:15–3:00, Room 102를 전달했는가",
      "컴퓨터 선택, 3:00–3:40, Room 101을 전달했는가",
    ],
    coaching: "휴식 다음 두 행을 찾습니다. 각 프로그램의 시간과 장소를 빠뜨리지 않습니다.",
    sample:
      "Protecting Your Personal Information is from two fifteen to three in Room one oh two. Choosing a New Computer is from three to three forty in Room one oh one.",
    focus: "T1",
    transfer: "I03",
  },
  {
    id: "O01",
    type: "opinion",
    title: "온라인 수업과 대면 수업",
    prep: 45,
    answer: 60,
    prompt:
      "Some students prefer online classes, while others prefer classes in person. Which do you prefer, and why? Give reasons and examples.",
    checks: [
      "선호하는 방식을 분명히 말했는가",
      "이유가 선택을 뒷받침하는가",
      "이유를 구체적으로 설명했는가",
    ],
    coaching:
      "편리하다는 말만 반복하지 말고 어떤 조건에서 어떤 도움이 되는지 설명합니다. 실제 경험이 없다면 가정한 상황으로 설명하세요.",
    focus: "T1",
    transfer: "O03",
  },
  {
    id: "O02",
    type: "opinion",
    title: "대학생의 아르바이트",
    prep: 45,
    answer: 60,
    prompt:
      "Do you agree or disagree that university students should have a part-time job? Give reasons and examples to support your opinion.",
    checks: ["찬반 입장이 분명한가", "입장과 이유가 맞는가", "구체적인 조건이나 예시로 설명했는가"],
    coaching:
      "입장과 이유를 먼저 연결하세요. 실제 경험이 없다면 가정한 상황임을 밝히고 설명해도 됩니다.",
    focus: "V1",
    transfer: "O03",
  },
  {
    id: "O03",
    type: "opinion",
    title: "혼자 운동과 함께 운동",
    prep: 45,
    answer: 60,
    prompt:
      "Some people prefer to exercise alone, while others prefer to exercise with a group. Which do you prefer? Give reasons and examples to support your opinion.",
    checks: [
      "선택을 분명히 말했는가",
      "그 선택의 이유가 이해되는가",
      "같은 말 대신 구체적인 설명을 더했는가",
    ],
    coaching:
      "운동을 함께하면 좋다는 말에서 멈추지 말고, 누가 무엇을 도와주는지 등 선택한 이유를 풀어 설명합니다.",
    focus: "R1",
    transfer: "O01",
  },
];

const transferMap: Record<string, string> = {
  XR01: "XR02",
  XR02: "XR01",
  XR03: "XR04",
  XR04: "XR03",
  XQ01: "XQ04",
  XQ02: "XQ05",
  XQ03: "XQ06",
  XQ04: "XQ01",
  XQ05: "XQ02",
  XQ06: "XQ03",
  XO01: "XO02",
  XO02: "XO01",
  XO03: "XO04",
  XO04: "XO03",
  XI01: "I04",
  XI02: "I05",
  XI03: "XI06",
  XI04: "I01",
  XI05: "I02",
  XI06: "XI03",
};
const importedTypes: Record<string, TaskType> = {
  reading: "read",
  response: "respond",
  information: "info",
  opinion: "opinion",
};
const importedQuestions: Question[] = extra.questions.map((q) => {
  const type = importedTypes[q.type];
  if (!type) throw new Error(`Unknown question type: ${q.type}`);
  const position =
    q.position === undefined
      ? undefined
      : q.position + (type === "info" ? 7 : type === "respond" ? 4 : 0);
  return { ...q, type, position, transfer: transferMap[q.id] };
});
// Keep the original course pool stable when free-practice content is added.
export const courseQuestions: Question[] = [...coreQuestions, ...importedQuestions];
export const questions: Question[] = [...courseQuestions, ...(expansion.questions as Question[])];

export const mockIds = [
  "R04",
  "R05",
  "PW01",
  "PW02",
  "Q06",
  "Q07",
  "Q08",
  "I04",
  "I05",
  "I06",
  "O03",
];
export const getQuestion = (id: string) => questions.find((q) => q.id === id)!;
export type SoundCard = {
  id: string;
  ipa: string;
  title: string;
  action: string;
  word: string;
  wordIpa: string;
  hint: string;
  phrase: string;
  check: string;
  source: string;
};
export const soundCards: SoundCard[] = [
  {
    id: "F1",
    ipa: "/f/",
    title: "윗니·아랫입술 사이로 바람",
    action: "윗니를 아랫입술에 가볍게 대고 틈으로 바람을 이어 보냅니다. 목소리는 넣지 않습니다.",
    word: "fee",
    wordIpa: "/fiː/",
    hint: "[F]이 · 한 음절",
    phrase: "The fee is ten dollars.",
    check: "두 입술을 닫았다 터뜨리거나 ‘프’라는 음절을 추가하지 않습니다.",
    source: "https://dictionary.cambridge.org/pronunciation/english/fee",
  },
  {
    id: "V1",
    ipa: "/v/",
    title: "같은 입 위치에서 목소리",
    action: "/f/의 입 위치에서 공기를 보내며 목소리를 함께 냅니다. 두 입술을 붙여 막지 않습니다.",
    word: "leave",
    wordIpa: "/liːv/",
    hint: "끝소리 [V] · /v/ 뒤에 ‘으’ 없음",
    phrase: "The bus will leave at noon.",
    check: "leave 끝에 ‘브·으’를 붙이지 않습니다. 앞의 /l/은 따로 확인합니다.",
    source: "https://dictionary.cambridge.org/pronunciation/english/leave",
  },
  {
    id: "T1",
    ipa: "/θ/",
    title: "혀끝·앞니, 목소리 없이",
    action:
      "혀끝을 앞니 사이에 살짝 두고 공기를 완전히 막지 않은 채 바람을 보냅니다. 혀를 깨물지 않습니다.",
    word: "think",
    wordIpa: "/θɪŋk/",
    hint: "[TH-바람] · 단어 전체 한글 변환 없음",
    phrase: "I think the location is important.",
    check: "‘씽크’를 영어의 정확한 표기로 외우지 않습니다. /ɪ/와 끝자음은 음성으로 확인합니다.",
    source: "https://dictionary.cambridge.org/pronunciation/english/think",
  },
  {
    id: "T2",
    ipa: "/ð/",
    title: "혀끝·앞니, 목소리 함께",
    action:
      "/θ/를 연습한 혀 위치에서 공기를 보내며 목소리를 함께 냅니다. ‘ㄷ’처럼 완전히 막았다 터뜨리지 않습니다.",
    word: "this",
    wordIpa: "/ðɪs/",
    hint: "[TH-목소리] · ‘드’ 추가 없음",
    phrase: "This class starts at ten.",
    check: "th는 단어에 따라 소리가 다릅니다. think와 this의 첫소리를 구분합니다.",
    source: "https://dictionary.cambridge.org/pronunciation/english/this",
  },
  {
    id: "R1",
    ipa: "/ɹ/",
    title: "혀끝을 윗잇몸에서 떼기",
    action:
      "입술을 약간 모으고 혀끝을 윗잇몸에서 떼어 조금 뒤로 가져갑니다. 혀끝을 튕기지 않고 다음 모음으로 잇습니다.",
    word: "right",
    wordIpa: "/raɪt/",
    hint: "[R] · 혀끝을 튕기지 않기",
    phrase: "The entrance is on the right.",
    check: "미국 영어 /ɹ/을 내는 한 방법입니다. 혀를 반드시 심하게 말 필요는 없습니다.",
    source: "https://dictionary.cambridge.org/pronunciation/english/right",
  },
  {
    id: "L1",
    ipa: "/l/",
    title: "혀끝은 닿고 바람은 옆으로",
    action:
      "단어 첫소리에서 혀끝을 윗앞니 뒤 잇몸에 대고, 혀 옆으로 공기를 보내며 목소리를 냅니다. 다음 모음으로 가며 혀끝을 뗍니다.",
    word: "light",
    wordIpa: "/laɪt/",
    hint: "[L] · 혀끝 닿기",
    phrase: "Please turn on the light.",
    check: "단어 끝 /l/에 이 지시를 그대로 적용하지 않습니다.",
    source: "https://dictionary.cambridge.org/pronunciation/english/light",
  },
  {
    id: "C1",
    ipa: "/desk/",
    title: "자음 사이에 모음 넣지 않기",
    action:
      "desk는 모음을 한 번 냅니다. /s/에서 /k/로 이어 끝내고 사이와 끝에 ‘으’를 넣지 않습니다.",
    word: "desk",
    wordIpa: "/desk/",
    hint: "desk · 한 음절",
    phrase: "Please ask at the front desk.",
    check: "끝자음을 항상 크게 터뜨릴 필요는 없습니다. 다른 자음군은 그 단어 음성으로 확인합니다.",
    source: "https://dictionary.cambridge.org/pronunciation/english/desk",
  },
  {
    id: "S1",
    ipa: "apPOINTment",
    title: "강세와 의미 단위",
    action:
      "appointment의 둘째 음절을 주변보다 조금 길고 또렷하게 냅니다. 강세 때문에 다른 음절을 생략하지 않습니다.",
    word: "appointment",
    wordIpa: "/əˈpɔɪnt.mənt/",
    hint: "apPOINTment · 소리를 지르지 않기",
    phrase: "I have an appointment at five.",
    check: "강세가 언제나 높은 음을 뜻하지는 않습니다. 의미가 묶이는 말을 함께 말합니다.",
    source: "https://dictionary.cambridge.org/pronunciation/english/appointment",
  },
];
export const sources = [
  {
    tag: "시험 형식",
    title: "ETS · Speaking & Writing",
    url: "https://www.ets.org/toeic/about/speaking-writing.html",
    note: "현행 11문항과 준비·답변 시간.",
  },
  {
    tag: "평가 기준",
    title: "IIBC · Test Format and Content",
    url: "https://www.iibc-global.org/english/toeic/test/speaking/about/format.html",
    note: "유형별 평가 항목과 의사소통 과제.",
  },
  {
    tag: "문항 안내",
    title: "ETS · Examinee Handbook",
    url: "https://www.ets.org/content/dam/ets-org/pdfs/toeic/toeic-speaking-writing-examinee-handbook.pdf",
    note: "자료 제시 방식과 응답 수준의 차이.",
  },
  {
    tag: "한국 공식",
    title: "YBM · 시험 소개",
    url: "https://www.toeicswt.co.kr/common/template/viewContents.php?contentsCode=72",
    note: "한국에서 안내하는 현행 시험 구성.",
  },
  {
    tag: "CPA 원논문",
    title: "Compositional Phoneme Approximation · 2025",
    url: "https://aclanthology.org/2025.ijcnlp-short.35/",
    note: "한국어 화자 20명의 영어 단어 단기 발음 실험. 시험 점수·장기 효과는 평가하지 않음.",
  },
  {
    tag: "발음 지도",
    title: "Saito & Plonsky · 2019",
    url: "https://discovery.ucl.ac.uk/id/eprint/10068780/1/LL2019.pdf",
    note: "발음 지도 연구 77편 종합. 통제된 과제의 향상을 즉흥 답변 전체로 확대하지 않음.",
  },
  {
    tag: "분산 연습",
    title: "Kim & Webb · 2022",
    url: "https://doi.org/10.1111/lang.12479",
    note: "제2언어 분산 학습 연구 종합. 1·3·7일이 발음 학습의 최적 간격이라는 근거는 아님.",
  },
  {
    tag: "조음 참고",
    title: "Stanford · Phonetics",
    url: "https://web.stanford.edu/~jurafsky/slp3/old_oct19/27.pdf",
    note: "마찰음·유성·무성과 입술·혀의 조음 설명.",
  },
  {
    tag: "조음 참고",
    title: "MIT · Linguistic Phonetics",
    url: "https://ocw.mit.edu/courses/24-915-linguistic-phonetics-fall-2015/9132fcf389544afbd25e805ea355bbbe_MIT24_915F15_lec5.pdf",
    note: "미국 영어 /ɹ/의 서로 다른 정상 조음 방식.",
  },
  {
    tag: "조음 참고",
    title: "Newcastle · IPA",
    url: "https://teaching.ncl.ac.uk/ipa/diacritics.html",
    note: "/l/과 측면 기류 등 발음 카드의 참고 자료.",
  },
  {
    tag: "강세 참고",
    title: "Cambridge · Word Stress",
    url: "https://assets.cambridge.org/97811085/67916/excerpt/9781108567916_excerpt.pdf",
    note: "단어 강세와 음절 설명.",
  },
];
