import { type Question } from "./content.ts";
export const plans = {
  60: [
    {
      minutes: 10,
      title: "이전 문장 다시 말하기",
      description: "이전에 연습한 문장을 한글 단서 없이 말합니다.",
    },
    {
      minutes: 15,
      title: "오늘의 문항 첫 답변",
      description: "질문을 확인하고 먼저 답한 뒤 학습 도움을 봅니다.",
    },
    {
      minutes: 10,
      title: "막힌 소리·구절 듣고 따라 하기",
      description: "발음 카드 하나로 입 동작을 확인하고 짧은 구절을 반복합니다.",
    },
    {
      minutes: 15,
      title: "단서 없이 같은 문제 → 다른 문제",
      description: "같은 답을 다시 말한 뒤 조건이 다른 문항에 적용합니다.",
    },
    {
      minutes: 10,
      title: "짧은 답변 정리",
      description: "다시 쓸 표현을 고르고 다음 학습일에 확인합니다.",
    },
  ],
  90: [
    {
      minutes: 10,
      title: "이전 문장 다시 말하기",
      description: "전에 쓴 표현을 보지 않고 말해 봅니다.",
    },
    {
      minutes: 25,
      title: "문항 한 문제 추가",
      description: "질문에 맞는 답을 먼저 말하고 필요한 정보부터 보완합니다.",
    },
    {
      minutes: 15,
      title: "소리와 구절 반복",
      description: "어려웠던 단어 하나를 구절과 답변 안에서 연습합니다.",
    },
    {
      minutes: 25,
      title: "새 자료로 답하기",
      description: "다른 문항에 맞게 표현을 바꾸고 시간을 맞춰 답합니다.",
    },
    {
      minutes: 15,
      title: "답변 정리와 복습 선택",
      description: "오늘의 핵심 답변을 다시 말하고 다음 복습 문항을 고릅니다.",
    },
  ],
  120: [
    {
      minutes: 15,
      title: "이전 내용 재확인",
      description: "한글 단서를 가리고 이전 질문에 다시 답합니다.",
    },
    {
      minutes: 30,
      title: "서로 다른 두 유형",
      description: "읽기와 질문 응답처럼 두 종류의 과제를 연습합니다.",
    },
    {
      minutes: 15,
      title: "소리와 의미 단위 반복",
      description: "발음 카드 하나와 필요한 구절을 듣고 따라 합니다.",
    },
    {
      minutes: 40,
      title: "새 질문과 시험 시간 연습",
      description: "다른 내용의 문제를 선택하고 실제 준비·답변 시간을 사용합니다.",
    },
    {
      minutes: 20,
      title: "내용 점검과 다음 학습 준비",
      description: "답변을 다시 정리하고 다음 학습일에 복습할 문항을 고릅니다.",
    },
  ],
};
export const sessions = [
  {
    day: 1,
    title: "읽기 · 의미 단위",
    type: "read",
    ids: ["R01", "R04"],
    goal: "짧은 안내문의 시간과 장소를 전달합니다.",
  },
  {
    day: 2,
    title: "질문 · 필요한 정보",
    type: "respond",
    ids: ["Q01", "Q06"],
    goal: "장소와 시점처럼 질문이 요구한 항목을 채웁니다.",
  },
  {
    day: 3,
    title: "사진 · 행동과 위치",
    type: "photo",
    ids: ["PW01", "PW02"],
    goal: "보이는 대상·행동부터 짧게 설명합니다.",
  },
  {
    day: 4,
    title: "표 · 시간과 장소",
    type: "info",
    ids: ["I01", "I04"],
    goal: "표에서 요청한 정보를 찾아 전달합니다.",
  },
  {
    day: 5,
    title: "의견 · 입장과 이유",
    type: "opinion",
    ids: ["O01", "O03"],
    goal: "선택과 이유를 먼저 연결합니다.",
  },
  {
    day: 6,
    title: "읽기 · 자음과 강세",
    type: "read",
    ids: ["R02", "R05"],
    goal: "막힌 구절을 고친 뒤 지문 전체를 읽습니다.",
  },
  {
    day: 7,
    title: "질문 · 빈도와 이유",
    type: "respond",
    ids: ["Q02", "Q04"],
    goal: "핵심 답을 먼저 말하고 필요한 설명을 더합니다.",
  },
  {
    day: 8,
    title: "표 · 잘못된 정보 정정",
    type: "info",
    ids: ["I02", "I05"],
    goal: "질문의 전제를 바로잡고 맞는 정보를 말합니다.",
  },
  {
    day: 9,
    title: "사진 · 세부 묘사",
    type: "photo",
    ids: ["PW02", "PW01"],
    goal: "주요 행동에 주변 정보를 추가합니다. 이미 본 사진은 복습입니다.",
  },
  {
    day: 10,
    title: "표 · 두 프로그램 안내",
    type: "info",
    ids: ["I03", "I06"],
    goal: "관련된 두 행의 프로그램·시간·장소를 연결합니다.",
  },
  {
    day: 11,
    title: "의견 · 구체적인 설명",
    type: "opinion",
    ids: ["O02", "O03"],
    goal: "입장만 반복하지 않고 이유를 풀어 설명합니다.",
  },
  {
    day: 12,
    title: "질문 · 3문항 묶음",
    type: "respond",
    ids: ["Q06", "Q07", "Q08"],
    goal: "식료품 구매 주제의 질문에 하나씩 답합니다.",
  },
  {
    day: 13,
    title: "어려웠던 유형 복습",
    type: "read",
    ids: ["R01", "I03", "O01"],
    goal: "막힌 부분을 골라 학습 도움 없이 다시 답합니다.",
  },
  {
    day: 14,
    title: "5유형 다시 확인",
    type: "opinion",
    ids: ["R05", "PW02", "Q08", "I06", "O03"],
    goal: "기존 자료의 재연습입니다. 처음 보는 자료의 성과와 구분합니다.",
  },
];
export const answerExamples: Record<string, string> = {
  Q01: "I usually have lunch at home with my family.",
  Q02: "I use public transportation three times a week. I usually go to the library.",
  Q03: "I usually take a short walk after dinner.",
  Q04: "A quiet environment is most important to me. I can focus on my work without loud conversations around me.",
  Q06: "I usually buy groceries at a supermarket near my home. I go there on Saturday mornings.",
  Q07: "I buy groceries once a week, and I usually walk to the store.",
  Q08: "The location is most important to me because I want to save travel time. A nearby store makes it easier to buy a few things after work.",
  O01: "I prefer online classes because I can save travel time. For example, if a class starts at nine, I can study at home before it begins. I can also review my notes immediately after class.",
  O02: "I agree that university students should have a part-time job if they have enough time. A job can help them practice working with other people. For example, working in a store requires clear communication with customers. However, they should choose hours that do not interfere with their classes.",
  O03: "I prefer to exercise with a group because other people help me keep a regular schedule. If we agree to meet on Saturday morning, I am more likely to go. We can also encourage each other during the exercise.",
};
export type Pattern = {
  frame: string;
  meaning: string;
  example: string;
  variation: string;
  instruction: string;
};
export function patternFor(q: Question): Pattern {
  if (q.type === "read")
    return {
      frame:
        q.id === "R01"
          ? "Our new exhibition is open from ten in the morning until six in the evening."
          : q.passage!.split(". ")[1] + ".",
      meaning: "시간·장소처럼 하나로 묶이는 정보를 구절로 읽습니다.",
      example:
        q.id === "R01"
          ? "Tickets are available / at the front desk."
          : q.passage!.split(". ")[1] + ".",
      variation: "아래의 다른 지문으로 이동해 같은 방식으로 읽어 보세요.",
      instruction:
        "읽기 문항에서는 원문을 바꾸지 않습니다. 의미 단위로 들은 뒤 표시 없는 지문을 읽으세요.",
    };
  if (q.type === "photo")
    return {
      frame: "A person is [행동-ing] / [장소·위치].",
      meaning: "누가 무엇을 하고 있는지 먼저 설명합니다.",
      example: q.sample!,
      variation: "다른 사진에서 대상과 행동을 바꿔 말합니다.",
      instruction: "보이는 사실에 맞춰 바꿉니다. 사진에 없는 행동·관계는 추가하지 않습니다.",
    };
  if (q.id === "YI01" || q.id === "YI04")
    return {
      frame:
        q.id === "YI01"
          ? "[프로그램] begins at [시작 시각]. It lasts [진행 시간] minutes."
          : "The break begins at [시작 시각]. It lasts [휴식 시간] minutes.",
      meaning: "시작 시각과 소요 시간을 구분해 전달합니다.",
      example: q.sample!,
      variation: "다른 표에서도 시작 시각과 종료 시각으로 소요 시간을 확인합니다.",
      instruction: "시작 시각을 말한 뒤 몇 분 동안 진행되는지 답합니다.",
    };
  if (q.id === "YI02")
    return {
      frame: "No, [프로그램] is in [맞는 장소].",
      meaning: "질문에 나온 장소를 표에 있는 장소로 바로잡습니다.",
      example: q.sample!,
      variation: "다른 표에서도 해당 프로그램의 장소를 확인합니다.",
      instruction: "잘못된 장소 대신 실제 장소를 답합니다.",
    };
  if (q.id === "YI03")
    return {
      frame: "[진행자] will lead [프로그램] at [시작 시각] in [장소].",
      meaning: "같은 진행자의 두 강의를 찾아 시작 시각과 장소를 전달합니다.",
      example: q.sample!,
      variation: "다른 표에서도 질문에 나온 진행자가 맡은 강의를 모두 찾습니다.",
      instruction: "두 강의의 이름·시작 시각·장소를 각각 답합니다.",
    };
  if (q.id === "YI05")
    return {
      frame: "Actually, [프로그램] starts at [맞는 시작 시각].",
      meaning: "질문에 나온 시작 시각을 표의 시각으로 바로잡습니다.",
      example: q.sample!,
      variation: "다른 표에서도 해당 프로그램의 시작 시각을 확인합니다.",
      instruction: "맞는 시작 시각을 먼저 답합니다. 장소는 필요하면 덧붙입니다.",
    };
  if (q.id === "XI04")
    return {
      frame: "[프로그램] begins at [시각], and [진행자] will lead it.",
      meaning: "시작 시각과 진행자를 전달합니다.",
      example: q.sample!,
      variation: "다른 표의 질문에서도 필요한 항목을 다시 찾습니다.",
      instruction: "장소를 물었다고 가정하지 말고 질문에서 요구한 시각과 진행자를 답합니다.",
    };
  if (q.id === "XI05")
    return {
      frame: "No, [프로그램] is in [맞는 장소].",
      meaning: "질문에 나온 잘못된 장소를 바로잡습니다.",
      example: q.sample!,
      variation: "다른 질문의 전제가 틀렸는지 자료로 확인합니다.",
      instruction: "무엇이 틀렸는지 먼저 파악하세요. 진행자가 아니라 장소를 바로잡는 질문입니다.",
    };
  if (q.id === "XI06")
    return {
      frame: "[프로그램] runs from [시작] to [종료] with [진행자].",
      meaning: "두 강의의 시각과 진행자를 연결합니다.",
      example: q.sample!,
      variation: "새 표에서도 요청한 항목을 확인합니다.",
      instruction: "이 질문은 장소 대신 진행자를 묻습니다.",
    };
  if (q.type === "info" && q.position === 9)
    return {
      frame: "No, [맞는 진행자] will lead [프로그램].",
      meaning: "잘못된 정보를 바로잡고 실제 정보를 말합니다.",
      example: q.sample!,
      variation: "다른 표에서 프로그램과 진행자를 다시 찾습니다.",
      instruction: "사람 이름만 외우지 말고 표의 프로그램과 진행자를 다시 확인합니다.",
    };
  if (q.type === "info" && q.position === 10)
    return {
      frame: "[프로그램] is from [시작] to [종료] in [장소].",
      meaning: "조건에 맞는 프로그램마다 시간과 장소를 연결합니다.",
      example: q.sample!,
      variation: "표가 바뀌면 프로그램·시각·장소도 모두 바꿉니다.",
      instruction: "같은 표현을 쓰더라도 두 행의 정보를 각각 확인합니다.",
    };
  if (q.type === "info")
    return {
      frame: "Registration begins at [시각] in [장소].",
      meaning: "등록 시작 시각과 장소를 안내합니다.",
      example: q.sample!,
      variation: "다른 표에서 시작 시각과 장소를 다시 찾습니다.",
      instruction: "먼저 표에서 값을 찾고 문장에 넣습니다. 예시의 시각을 그대로 반복하지 않습니다.",
    };
  if (q.type === "opinion")
    return {
      frame: /agree or disagree|should/i.test(q.prompt)
        ? "I agree / disagree that [입장] because [이유]. / For example, [설명]."
        : "I prefer [선택] because [이유]. / For example, [구체적인 설명].",
      meaning: "선택을 말하고, 그 이유를 조건과 결과로 풀어 설명합니다.",
      example: q.sample || answerExamples[q.id] || "",
      variation: "선택을 바꾼 뒤 그 선택에 맞는 이유도 바꿔 말합니다.",
      instruction:
        "예시는 가상 답변입니다. 자신의 선택을 사용하고, 겪지 않은 일을 실제 경험처럼 말하지 않습니다.",
    };
  return {
    frame:
      q.answer === 30
        ? "I think [기준] is important because [이유]."
        : "I usually [행동] / [장소·시간·빈도].",
    meaning:
      q.answer === 30
        ? "중요한 기준을 정하고 이유를 설명합니다."
        : "질문에서 물은 정보부터 넣습니다.",
    example: q.sample || answerExamples[q.id] || "",
    variation: "질문이 바뀌면 필요한 정보도 다시 확인합니다.",
    instruction:
      "예시는 가상 답변입니다. 자신의 생활에 맞는 내용으로 바꾸세요. 모든 질문에 같은 문장을 쓰지는 않습니다.",
  };
}
