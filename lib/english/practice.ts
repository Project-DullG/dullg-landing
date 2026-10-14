import type { EnglishEpisode, EnglishExpression, EnglishTask, TaskVersion } from "./types.ts";

export type PracticeFormat = "sentence" | "conversation" | "reading";
export type EnglishPracticePack = EnglishEpisode & { practiceFormat: PracticeFormat };
export const practiceEnglishDictionary: Record<string, string> = {};
type Pair = readonly [string, string];
const text = ([ko, en]: Pair) => {
  const previous = practiceEnglishDictionary[ko];
  if (previous && previous !== en) throw new Error(`Practice translation conflict: ${ko}`);
  practiceEnglishDictionary[ko] = en;
  return ko;
};
export const practiceCollections = [
  {
    id: "conversation" as const,
    title: text(["실전 회화", "Conversation practice"]),
    description: text([
      "상대의 말을 듣고, 내 차례에 말하고, 조건이 바뀌면 다시 전달해요.",
      "Listen, take your turn, and respond when the details change.",
    ]),
    minutes: 6,
  },
  {
    id: "sentence" as const,
    title: text(["문장 조립", "Sentence workshop"]),
    description: text([
      "문장에서 누가 무엇을 하는지 살펴보고, 표현 조각을 연결하거나 직접 써 봐요.",
      "Explore who does what in a sentence, then connect phrase chunks or write a reply.",
    ]),
    minutes: 4,
  },
  {
    id: "reading" as const,
    title: text(["하루 한 장 리딩", "A page a day"]),
    description: text([
      "짧은 글 한 편을 읽고 듣고, 중요한 뜻을 쓰고 내 생각을 말해요.",
      "Read and listen to a short page, write its key idea, and share a thought.",
    ]),
    minutes: 7,
  },
];
const levels = ["starter", "standard", "challenge"] as const;
function versions(build: (level: (typeof levels)[number], index: number) => TaskVersion) {
  return Object.fromEntries(
    levels.map((level, index) => [level, build(level, index)]),
  ) as EnglishTask["versions"];
}
function expression(id: string, en: string, ko: string): EnglishExpression {
  const meaning = text([ko, en]);
  return { id, en, ko: meaning, recall: meaning, accepted: [en] };
}
function base(
  id: string,
  title: Pair,
  format: PracticeFormat,
  tasks: EnglishTask[],
  expressions: EnglishExpression[],
): EnglishPracticePack {
  const collection = practiceCollections.find((item) => item.id === format)!;
  const titleKo = text(title);
  text([`${titleKo} · 영어 연습`, `${title[1]} · English practice`]);
  text([`${titleKo} · 영어 집중 연습`, `${title[1]} · Focused English practice`]);
  return {
    id,
    format: "practice",
    practiceFormat: format,
    title: titleKo,
    englishTitle: title[1],
    genre: "everyday",
    genreLabel: collection.title,
    synopsis: collection.description,
    intro: collection.description,
    ending: text([
      "짧은 연습을 마쳤어요. 오늘 쓴 표현을 다른 상황에서도 꺼내 보세요.",
      "Practice complete. Try using today's phrases in another situation.",
    ]),
    takeaway: collection.description,
    minutes: collection.minutes,
    image: "/assets/english/cafe.webp",
    imageAlt: text(["비 오는 날의 따뜻한 카페", "A warm cafe on a rainy day"]),
    accent: "#48735d",
    tasks,
    expressions,
  };
}
const assemblyInstructions = text([
  "표현 조각을 눌러 아래 뜻에 맞는 문장을 만들어 보세요.",
  "Connect the phrase chunks in an order that conveys this meaning.",
]);
const sentenceNotes: Record<string, Pair> = {
  requests: [
    "Could you…?에 부탁할 일을 붙이면 공손한 요청이 됩니다. help me 뒤에는 필요한 동작을 이어 말해 보세요.",
    "Could you…? makes a polite request. After help me, add the action you need.",
  ],
  directions: [
    "next to는 옆, instead of는 대신이라는 뜻입니다. 장소를 가리킬 때는 위치를, 길을 고를 때는 무엇 대신 갈지를 전해 보세요.",
    "Next to describes position; instead of describes an alternative. Use one to locate a place and the other to choose a route.",
  ],
  plans: [
    "시각 앞에는 at, 요일 앞에는 on을 씁니다. 대신할 시간을 제안할 때는 instead of로 바뀐 내용을 분명하게 말할 수 있어요.",
    "Use at for a time and on for a day. Instead of makes the change clear when you suggest a different time.",
  ],
  clarify: [
    "Do you mean…?은 내가 이해한 뜻이 맞는지 묻는 표현입니다. 잘 못 들었다면 Could you repeat…?로 다시 말해 달라고 부탁하세요.",
    "Do you mean…? checks your understanding. If you did not hear clearly, ask Could you repeat…?",
  ],
  preferences: [
    "I'd like…는 원하는 것을 공손하게 말할 때, I'd prefer…는 더 나은 선택을 고를 때 쓸 수 있습니다. without 뒤에는 빼고 싶은 것을 붙여요.",
    "I'd like… politely states what you want, while I'd prefer… expresses a preference. Add what you want omitted after without.",
  ],
  reasons: [
    "because 뒤에는 이유, so 뒤에는 그 결과가 이어집니다. 다른 방법을 제안할 때는 but으로 할 수 있는 일을 덧붙여 보세요.",
    "Because introduces a reason, and so introduces its result. Use but to add an alternative you can offer.",
  ],
};
type SentenceSet = { id: string; title: Pair; phrases: [string, string[]][] };
const sentenceSets: SentenceSet[] = [
  {
    id: "requests",
    title: ["도움을 요청하는 문장", "Asking for help"],
    phrases: [
      ["이 양식 작성 좀 도와주실 수 있나요?", ["Could you", "help me", "fill in", "this form?"]],
      [
        "이 상자를 창가로 옮기려는데 도와주세요.",
        ["Please", "help me", "move this box", "to the window."],
      ],
      ["의자 하나 빌려도 될까요?", ["Could I", "borrow", "a chair?"]],
    ],
  },
  {
    id: "directions",
    title: ["길을 안내하는 문장", "Giving directions"],
    phrases: [
      ["도서관은 카페 옆에 있습니다.", ["The library", "is", "next to", "the cafe."]],
      [
        "왼쪽으로 돌아 지붕 있는 통로를 따라가세요.",
        ["Turn left", "and follow", "the covered walkway."],
      ],
      ["계단 대신 경사로를 이용하세요.", ["Use", "the ramp", "instead of", "the stairs."]],
    ],
  },
  {
    id: "plans",
    title: ["약속을 정하는 문장", "Making plans"],
    phrases: [
      ["금요일 오후에 만날 수 있을까요?", ["Could we", "meet", "on Friday afternoon?"]],
      ["세 시 대신 네 시에 시작하겠습니다.", ["We'll start", "at four", "instead of", "three."]],
      ["늦을 것 같으면 알려 주세요.", ["Please", "let me know", "if you're going", "to be late."]],
    ],
  },
  {
    id: "clarify",
    title: ["다시 확인하는 문장", "Checking understanding"],
    phrases: [
      ["마지막 부분을 다시 말씀해 주실 수 있나요?", ["Could you", "repeat", "the last part?"]],
      ["남쪽 입구를 말씀하시는 건가요?", ["Do you mean", "the south entrance?"]],
      [
        "제가 정확히 이해했는지 확인하겠습니다.",
        ["Let me", "check", "that I understood", "correctly."],
      ],
    ],
  },
  {
    id: "preferences",
    title: ["원하는 것을 전하는 문장", "Expressing preferences"],
    phrases: [
      ["설탕 없이 차를 마시고 싶어요.", ["I'd like", "tea", "without sugar."]],
      ["조용한 테이블이 더 좋겠어요.", ["I'd prefer", "a quiet table."]],
      ["가능하다면 창가에 앉고 싶어요.", ["I'd like", "to sit", "by the window", "if possible."]],
    ],
  },
  {
    id: "reasons",
    title: ["이유와 대안을 전하는 문장", "Reasons and alternatives"],
    phrases: [
      ["비가 오므로 실내에서 만나요.", ["Let's meet", "indoors", "because", "it's raining."]],
      [
        "통로가 닫혀 있으니 다른 길로 가야 합니다.",
        ["The path", "is closed,", "so we need", "another route."],
      ],
      [
        "지금은 갈 수 없지만 나중에 도울 수 있어요.",
        ["I can't", "come now,", "but I can", "help later."],
      ],
    ],
  },
];
const sentencePacks = sentenceSets.map((set) => {
  const id = `sentence-${set.id}`;
  const expressions = set.phrases
    .slice(0, 2)
    .map(([ko, chunks], i) => expression(`${id}-expression-${i + 1}`, chunks.join(" "), ko));
  const tasks: EnglishTask[] = set.phrases.map(([ko, chunks], i) => {
    const en = chunks.join(" ");
    const meaning = text([ko, en]);
    return {
      id: `${id}-${i + 1}`,
      skill: "writing",
      title: meaning,
      context: assemblyInstructions,
      document: text(["표현 조각", "Phrase chunks"]),
      feedback: text(sentenceNotes[set.id]),
      consequence: text([
        "완성한 표현을 한 번 읽고 다음 문장으로 이어갑니다.",
        "Read the completed phrase once, then move on to the next sentence.",
      ]),
      expressionIds: i < 2 ? [expressions[i].id] : [],
      versions: versions((level) => ({
        passage: meaning,
        translation: meaning,
        prompt: assemblyInstructions,
        tokens: chunks,
        model: en,
        accepted: [en],
        ...(level === "starter" ? { starter: chunks[0] } : {}),
      })),
    };
  });
  const transfer = set.phrases[2][1].join(" ");
  const speakingCue = text([
    "마지막 문장의 뜻을 떠올려 예문 없이 말해 보세요.",
    "Recall the meaning of the last sentence and try saying it without the example.",
  ]);
  tasks.push({
    id: `${id}-say`,
    skill: "speaking",
    title: text(["조립한 문장을 내 목소리로", "Say it in your own voice"]),
    context: text([
      "마지막 문장이 필요한 상황을 떠올리고, 화면을 보지 않고 먼저 말해 보세요.",
      "Imagine a situation where you need the last sentence. Try saying it before looking at the example.",
    ]),
    feedback: text([
      "직접 말해 본 시도를 기록했습니다. 예문과 비교하고 다시 말해도 좋습니다.",
      "Your speaking attempt is recorded. Compare it with the example and try again if you wish.",
    ]),
    consequence: text([
      "단어의 순서를 넘어 직접 말하는 연습까지 마쳤습니다.",
      "You practised both putting the sentence together and saying it.",
    ]),
    expressionIds: [],
    versions: versions(() => ({
      passage: "Recall the meaning of the last sentence and try saying it without the example.",
      translation: speakingCue,
      prompt: text([
        "상황에 맞는 문장을 직접 말한 뒤 확인하세요.",
        "Say an appropriate sentence, then confirm that you practised.",
      ]),
      model: transfer,
    })),
  });
  return base(id, set.title, "sentence", tasks, expressions);
});

const relationshipExpressions = [
  expression(
    "sentence-relationships-expression-1",
    "I'd like you to check the address.",
    "주소를 확인해 주셨으면 해요.",
  ),
  expression(
    "sentence-relationships-expression-2",
    "Please ask Nia to check the address.",
    "니아에게 주소를 확인해 달라고 부탁해 주세요.",
  ),
];
const relationshipPack = base(
  "sentence-relationships",
  ["문장에서 누가 하는 일일까?", "Who does what?"],
  "sentence",
  [
    {
      id: "relationship-compare",
      skill: "reading",
      title: text(["원하는 사람과 행동할 사람", "Who wants it, and who will do it?"]),
      context: text([
        "라이리가 직접 지도를 확인하고 싶은 건지, 샘이 확인해 주길 원하는 건지 구별해 보세요.",
        "Does Riley want to check the map, or want Sam to check it? Look at the difference.",
      ]),
      document: text(["한 단어가 바꾸는 역할", "A word changes the roles"]),
      feedback: text([
        "첫 문장은 라이리가 지도를 확인하고 싶다는 뜻이에요. 두 번째 문장은 샘이 확인해 주길 바란다는 뜻입니다. wants 뒤에 Sam이 들어가면서 확인할 사람이 달라졌어요.",
        "In the first sentence, Riley wants to check the map. In the second, Riley wants Sam to check it. Adding Sam after wants changes who would check the map.",
      ]),
      consequence: text([
        "뜻을 구별했다면, 다음에는 물건을 받는 사람을 묻는 표현을 들어 보세요.",
        "Next, listen for the person who receives something.",
      ]),
      expressionIds: [],
      versions: versions((level, index) => ({
        passage: [
          '"Riley wants to check the map."\n"Riley wants Sam to check the map."',
          'Read both sentences: "Riley wants to check the map." Now compare: "Riley wants Sam to check the map."',
          'Riley and Sam have a map to check. Compare "Riley wants to check the map" with "Riley wants Sam to check the map." Which person would check it in the second sentence?',
        ][index],
        translation: text([
          "첫 문장: 라이리는 지도를 확인하고 싶어 합니다.\n두 번째 문장: 라이리는 샘이 지도를 확인해 주길 바랍니다.",
          "First: Riley wants to check the map.\nSecond: Riley wants Sam to check the map.",
        ]),
        prompt: text([
          "두 번째 문장에서 지도를 확인할 사람은 누구인가요?",
          "Who would check the map in the second sentence?",
        ]),
        options: [
          { id: "riley", text: "Riley." },
          { id: "sam", text: "Sam." },
          { id: "both", text: "Both Riley and Sam." },
        ],
        correctOption: "sam",
        model: "Sam.",
        ...(level === "starter" ? { starter: "Look at the name after wants." } : {}),
        structure: [
          {
            role: "subject",
            label: text(["원하는 사람", "The person who wants it"]),
            text: "Riley",
          },
          { role: "action", label: text(["원한다는 표현", "Expressing a wish"]), text: "wants" },
          {
            role: "person",
            label: text(["그 일을 할 사람", "The person who would do it"]),
            text: "Sam",
          },
          {
            role: "purpose",
            label: text(["원하는 일", "The desired action"]),
            text: "to check the map.",
          },
        ],
      })),
    },
    {
      id: "relationship-receiver",
      skill: "listening",
      title: text(["누구에게 보냈을까?", "Who received it?"]),
      context: text([
        "택배를 누구에게 보냈는지 듣고, 받는 사람을 묻는 질문을 골라 보세요.",
        "Listen to who received the parcel, then choose a question about the recipient.",
      ]),
      speaker: text(["택배를 보낸 사람", "The sender"]),
      feedback: text([
        "Who did you send the parcel to?는 누구에게 보냈는지 묻습니다. Who sent the parcel to you?는 누가 당신에게 보냈는지 묻는 질문이에요. 질문의 단어가 비슷해도 묻는 역할은 다릅니다.",
        "Who did you send the parcel to? asks about the recipient. Who sent the parcel to you? asks about the sender. Similar words can ask about different roles.",
      ]),
      consequence: text([
        "받는 사람을 구별했어요. 이번에는 다른 사람에게 해 달라고 부탁하는 문장을 만들어 보세요.",
        "Now build a sentence asking another person to do something.",
      ]),
      expressionIds: [],
      versions: versions(() => ({
        passage: "We sent the parcel to Nia.",
        translation: text(["우리는 니아에게 택배를 보냈어요.", "We sent the parcel to Nia."]),
        prompt: text([
          "받는 사람을 알고 싶을 때 어떤 질문을 하나요?",
          "Which question asks who received the parcel?",
        ]),
        options: [
          { id: "sender", text: "Who sent the parcel to you?" },
          { id: "item", text: "What did you send to Nia?" },
          { id: "recipient", text: "Who did you send the parcel to?" },
        ],
        correctOption: "recipient",
        model: "Who did you send the parcel to?",
        structure: [
          { role: "subject", label: text(["보낸 사람", "The sender"]), text: "We" },
          { role: "action", label: text(["한 일", "The action"]), text: "sent the parcel" },
          { role: "person", label: text(["받는 사람", "The recipient"]), text: "to Nia." },
        ],
      })),
    },
    {
      id: "relationship-build",
      skill: "writing",
      title: text(["확인해 달라고 부탁하기", "Ask someone to check"]),
      context: text([
        "내가 확인하고 싶다고 말하는 대신, 상대에게 주소를 확인해 달라고 부탁해 보세요.",
        "Ask the other person to check the address, rather than saying you want to check it yourself.",
      ]),
      document: text(["표현 조각", "Phrase chunks"]),
      feedback: text([
        "I'd like to check…는 내가 확인하고 싶다는 뜻이고, I'd like you to check…는 상대가 확인해 주길 바란다는 뜻이에요. you가 들어가면서 행동할 사람이 바뀝니다.",
        "I'd like to check… means you want to check it yourself. I'd like you to check… asks the other person to check it. You changes who would perform the action.",
      ]),
      consequence: text([
        "문장을 완성했어요. 다음에는 확인할 사람을 니아로 바꿔 직접 써 보세요.",
        "Next, write a request for Nia to do the checking.",
      ]),
      expressionIds: [relationshipExpressions[0].id],
      versions: versions((level) => ({
        passage: "Ask the person you are speaking to to check the address.",
        translation: text(["주소를 확인해 주셨으면 해요.", "I'd like you to check the address."]),
        prompt: assemblyInstructions,
        tokens: ["I'd like", "you", "to check", "the address."],
        model: "I'd like you to check the address.",
        accepted: ["I'd like you to check the address."],
        ...(level === "starter" ? { starter: "I'd like" } : {}),
        structure: [
          { role: "subject", label: text(["원하는 사람", "The person who wants it"]), text: "I" },
          { role: "action", label: text(["원한다는 표현", "Expressing a wish"]), text: "'d like" },
          {
            role: "person",
            label: text(["그 일을 할 사람", "The person who would do it"]),
            text: "you",
          },
          {
            role: "purpose",
            label: text(["원하는 일", "The desired action"]),
            text: "to check the address.",
          },
        ],
      })),
    },
    {
      id: "relationship-request",
      skill: "writing",
      title: text(["확인할 사람을 바꿔 쓰기", "Change who will check"]),
      context: text([
        "주소는 니아가 확인해야 합니다. 함께 있는 사람에게 니아에게 확인을 부탁해 달라고 영어로 써 보세요.",
        "Nia needs to check the address. Ask the person with you to pass the request to Nia.",
      ]),
      feedback: text([
        "ask Nia to check…라고 쓰면 확인할 사람이 니아라는 점이 분명해져요. 예문과 내가 쓴 문장에서 부탁받는 사람, 실제로 확인할 사람을 각각 짚어 보세요.",
        "Ask Nia to check… makes Nia the person who would check it. In your answer and the example, identify who passes on the request and who does the checking.",
      ]),
      consequence: text([
        "단어 순서와 역할을 살펴보고, 필요한 사람에게 부탁하는 문장까지 직접 썼어요.",
        "You explored word order and roles, then wrote a request for the right person.",
      ]),
      expressionIds: [relationshipExpressions[1].id],
      versions: versions((level) => ({
        passage: "Ask the person with you to ask Nia to check the address.",
        translation: text([
          "니아에게 주소를 확인해 달라고 부탁해 주세요.",
          "Please ask Nia to check the address.",
        ]),
        prompt: text([
          "니아가 주소를 확인하도록 부탁하는 문장을 직접 써 보세요.",
          "Write a request for Nia to check the address.",
        ]),
        model: "Please ask Nia to check the address.",
        accepted: [
          "Please ask Nia to check the address.",
          "Could you ask Nia to check the address?",
        ],
        keywords: [["ask"], ["Nia to check"], ["address"]],
        ...(level === "starter" ? { starter: "Please ask Nia" } : {}),
      })),
    },
  ],
  relationshipExpressions,
);

type ConversationSpec = {
  id: string;
  title: Pair;
  partner: Pair;
  question: Pair;
  fact: Pair;
  options: [string, string, string];
  correct: 0 | 1 | 2;
  first: Pair;
  change: Pair;
  response: Pair;
  keywords: string[][];
  final: Pair;
};
const conversations: ConversationSpec[] = [
  {
    id: "airport",
    title: ["공항에서 탑승구 확인", "At the airport"],
    partner: ["공항 직원", "Airport staff"],
    question: [
      "탑승구가 12번으로 바뀌었습니다. 3시 20분부터 탑승합니다.",
      "Your flight has moved to Gate 12. Boarding starts at 3:20.",
    ],
    fact: ["탑승구와 탑승 시각을 함께 확인하세요.", "Check both the gate and boarding time."],
    options: ["Gate 12, at 3:20.", "Gate 20, at 3:12.", "Gate 12, at 4:20."],
    correct: 0,
    first: [
      "탑승구와 시각을 직원에게 되물어 확인하세요.",
      "Repeat the gate and time to check with the staff.",
    ],
    change: [
      "죄송하지만 이제 12번이 아니라 14번 탑승구입니다. 탑승 시각은 같습니다.",
      "Sorry, it's now Gate 14, not Gate 12. The boarding time is unchanged.",
    ],
    response: [
      "14번 탑승구로 가겠습니다. 탑승은 3시 20분이죠?",
      "I'll go to Gate 14. Boarding is at 3:20, right?",
    ],
    keywords: [
      ["14", "fourteen"],
      ["3:20", "three twenty"],
    ],
    final: [
      "아직 출발하지 않은 친구에게 최종 탑승구와 시각을 전하세요.",
      "Tell a friend the final gate and boarding time.",
    ],
  },
  {
    id: "hotel",
    title: ["호텔에서 짐 보관과 조식 확인", "Luggage and breakfast at a hotel"],
    partner: ["호텔 직원", "Hotel staff"],
    question: [
      "체크인은 오후 3시부터입니다. 방이 준비될 때까지 가방을 맡아드릴 수 있습니다.",
      "Check-in begins at 3 p.m. We can store your bags until your room is ready.",
    ],
    fact: [
      "방이 준비되기 전 제공되는 서비스를 확인하세요.",
      "Find out what the hotel offers before your room is ready.",
    ],
    options: ["A free lunch.", "Bag storage.", "A room before 3 p.m."],
    correct: 1,
    first: [
      "방이 준비될 때까지 가방을 맡아 달라고 요청하세요.",
      "Ask the hotel to store your bags until your room is ready.",
    ],
    change: [
      "방은 준비됐습니다. 조식은 아침 7시부터 10시까지 아래층에서 제공됩니다.",
      "Your room is ready. Breakfast is served downstairs from 7 to 10 a.m.",
    ],
    response: [
      "조식은 아래층에서 7시부터 10시까지 제공됩니다.",
      "Breakfast is served downstairs from 7 to 10 a.m.",
    ],
    keywords: [
      ["breakfast"],
      ["downstairs", "first floor"],
      ["7 to 10", "seven to ten", "7 until 10", "seven until ten", "7 and 10", "seven and ten"],
    ],
    final: [
      "함께 온 사람에게 조식 장소와 시간을 말하세요.",
      "Tell your travel companion where and when breakfast is served.",
    ],
  },
  {
    id: "cafe",
    title: ["카페에서 주문 바꾸기", "Changing a cafe order"],
    partner: ["카페 직원", "Cafe staff"],
    question: [
      "뜨거운 차와 아이스 차가 있습니다. 작은 사이즈와 큰 사이즈 중 고를 수 있습니다.",
      "We have hot and iced tea. You can choose a small or a large.",
    ],
    fact: ["직원이 제공한 선택지를 확인하세요.", "Check which choices the staff offered."],
    options: [
      "Tea only comes hot.",
      "Only large tea is available.",
      "Tea can be hot or iced, small or large.",
    ],
    correct: 2,
    first: ["작은 사이즈의 뜨거운 차를 공손하게 주문하세요.", "Politely order a small hot tea."],
    change: [
      "작은 컵은 다 떨어졌습니다. 큰 컵에 작은 분량을 담아 같은 가격에 드려도 될까요?",
      "We're out of small cups. May we serve the small portion in a large cup at the same price?",
    ],
    response: [
      "같은 가격이라면 큰 컵에 작은 분량으로 주세요.",
      "A small portion in a large cup is fine if the price is the same.",
    ],
    keywords: [
      ["small portion", "small amount"],
      ["large cup", "big cup"],
      ["same price", "price is the same"],
    ],
    final: [
      "주문이 어떻게 바뀌었는지 함께 온 사람에게 설명하세요.",
      "Explain to your companion how your order changed.",
    ],
  },
  {
    id: "meeting",
    title: ["회의 시간을 조정하기", "Rescheduling a meeting"],
    partner: ["동료", "Colleague"],
    question: [
      "금요일 오전 10시 회의실 B에서 만날 수 있나요? 온라인으로 참석해도 괜찮습니다.",
      "Can we meet on Friday at 10 a.m. in Room B? Joining online is also fine.",
    ],
    fact: [
      "오프라인과 온라인 중 가능한 참석 방법을 확인하세요.",
      "Check which ways of attending are available.",
    ],
    options: ["Room B or online.", "Only online.", "Room A only."],
    correct: 0,
    first: [
      "온라인 참석이 가능하다고 답하고 시간을 확인하세요.",
      "Say that you can join online and confirm the time.",
    ],
    change: [
      "금요일 오전 11시로 바꿔야 합니다. 회의실과 온라인 링크는 그대로입니다.",
      "We need to move it to 11 a.m. on Friday. The room and online link are unchanged.",
    ],
    response: [
      "금요일 오전 11시에 온라인으로 참석하겠습니다.",
      "I'll join online on Friday at 11 a.m.",
    ],
    keywords: [["friday"], ["11", "eleven"], ["online"]],
    final: [
      "새 시간에 참석하기 어렵다면 다른 시간을 제안해 말하세요.",
      "If the new time does not work, suggest an alternative time aloud.",
    ],
  },
  {
    id: "library",
    title: ["도서관에서 책 빌리기", "Borrowing a book"],
    partner: ["사서", "Librarian"],
    question: [
      "이 책은 2주 동안 빌릴 수 있습니다. 예약한 사람이 없으면 한 번 연장할 수 있습니다.",
      "You can borrow this book for two weeks. You may renew it once if no one has reserved it.",
    ],
    fact: ["대출 기간과 연장 조건을 확인하세요.", "Check the loan period and renewal condition."],
    options: [
      "Keep it for a month without asking.",
      "Two weeks, with one renewal if there is no reservation.",
      "Renew it as often as you like.",
    ],
    correct: 1,
    first: [
      "책을 빌리고 싶다고 말하고 연장 조건을 확인하세요.",
      "Ask to borrow the book and check the renewal condition.",
    ],
    change: [
      "누군가 예약해서 연장할 수 없습니다. 금요일까지 반납해 주세요. 닫힌 시간에는 반납함을 이용할 수 있습니다.",
      "Someone has reserved it, so it cannot be renewed. Please return it by Friday. You can use the drop box when we're closed.",
    ],
    response: [
      "금요일까지 반납하겠습니다. 문이 닫혀 있으면 반납함을 이용하겠습니다.",
      "I'll return it by Friday. I'll use the drop box if you're closed.",
    ],
    keywords: [["friday"], ["return"], ["drop box", "dropbox"]],
    final: [
      "책을 빌린 친구에게 반납 기한과 닫힌 시간의 방법을 알려주세요.",
      "Tell a friend the return deadline and the option after closing.",
    ],
  },
  {
    id: "plans",
    title: ["친구와 장소 변경하기", "Changing plans with a friend"],
    partner: ["친구", "Friend"],
    question: [
      "토요일 2시에 공원에서 만나요. 비가 오면 도서관 앞 카페에서 만납시다.",
      "Let's meet in the park at two on Saturday. If it rains, let's meet at the cafe opposite the library.",
    ],
    fact: ["비가 올 때의 대체 장소를 확인하세요.", "Find the alternative place if it rains."],
    options: ["The station.", "The park, whatever the weather.", "The cafe opposite the library."],
    correct: 2,
    first: [
      "시간과 비가 올 때의 장소를 친구에게 확인해 말하세요.",
      "Confirm the time and the rainy-day location with your friend.",
    ],
    change: [
      "토요일에 비가 온대요. 두 시는 그대로 하고 카페에서 만나요.",
      "Rain is forecast for Saturday. Let's keep the time at two and meet at the cafe.",
    ],
    response: [
      "토요일 두 시에 도서관 앞 카페에서 만나요.",
      "Let's meet at the cafe opposite the library at two on Saturday.",
    ],
    keywords: [["saturday"], ["two", "2"], ["cafe"]],
    final: ["다른 친구에게 확정된 약속을 알려주세요.", "Tell another friend the confirmed plan."],
  },
];
const conversationPacks = conversations.map((item) => {
  const id = `conversation-${item.id}`;
  const prompt = text(item.first);
  text(item.response);
  const question = text(item.question);
  const change = text(item.change);
  const notes: Record<string, Pair> = {
    airport: [
      "탑승구와 탑승 시각은 따로 바뀔 수 있어요. 숫자를 되물어 확인하고, 바뀐 탑승구만 새 정보로 고쳐 말해 보세요.",
      "A gate and a boarding time can change independently. Repeat the numbers to check, then update only the detail that changed.",
    ],
    hotel: [
      "until은 어느 때까지, from…to…는 시작부터 끝까지를 나타냅니다. 짐을 언제까지 맡길지와 조식 시간을 말할 때 써 보세요.",
      "Until gives an end point, while from…to… gives a time range. Use them for luggage storage and breakfast hours.",
    ],
    cafe: [
      "컵의 크기와 음료의 분량은 다를 수 있어요. small portion과 large cup을 나누어 말하고 가격도 그대로인지 확인하세요.",
      "Cup size and drink amount are different details. Distinguish a small portion from a large cup and confirm the price.",
    ],
    meeting: [
      "시간이 바뀌어도 참석 방법은 그대로일 수 있습니다. I'll join online에 요일과 새 시각을 붙여 짧게 확인해 보세요.",
      "The time can change while the way you attend stays the same. Add the day and new time to I'll join online.",
    ],
    library: [
      "by Friday는 금요일까지라는 기한을 뜻합니다. 문이 닫혀 있다면 쓸 수 있는 반납 방법도 함께 알려주세요.",
      "By Friday sets a deadline. Also explain which return option is available when the library is closed.",
    ],
    plans: [
      "if는 아직 정해지지 않은 조건을 말할 때 씁니다. 장소가 확정되면 시간과 장소를 한 번 더 묶어 알려주세요.",
      "If introduces a condition. Once the place is confirmed, state the time and place together again.",
    ],
  };
  const feedback = text(notes[item.id]);
  const task = (
    suffix: string,
    skill: EnglishTask["skill"],
    title: Pair,
    context: Pair,
    build: () => TaskVersion,
    ids: string[] = [],
  ): EnglishTask => ({
    id: `${id}-${suffix}`,
    skill,
    title: text(title),
    context: text(context),
    speaker: text(item.partner),
    feedback,
    consequence: text([
      "다음 차례에 이 정보를 사용해 보세요.",
      "Use this information in your next turn.",
    ]),
    expressionIds: ids,
    versions: versions((level) => ({
      ...build(),
      ...(level === "starter" && skill === "speaking"
        ? { starter: build().model.split(" ").slice(0, 3).join(" ") }
        : {}),
    })),
  });
  const firstModel =
    item.id === "airport"
      ? "Is boarding at Gate 12 at 3:20?"
      : item.id === "hotel"
        ? "Could you store my bags until my room is ready?"
        : item.id === "cafe"
          ? "I'd like a small hot tea, please."
          : item.id === "meeting"
            ? "I can join online on Friday at 10 a.m."
            : item.id === "library"
              ? "I'd like to borrow this book. Can I renew it if no one has reserved it?"
              : "Are we meeting at two on Saturday, at the cafe if it rains?";
  const firstKo: Record<string, string> = {
    airport: "탑승은 12번 탑승구에서 3시 20분인가요?",
    hotel: "방이 준비될 때까지 제 가방을 맡아주실 수 있나요?",
    cafe: "작은 뜨거운 차를 주세요.",
    meeting: "금요일 오전 10시에 온라인으로 참석할 수 있어요.",
    library: "이 책을 빌리고 싶습니다. 예약한 사람이 없으면 연장할 수 있나요?",
    plans: "토요일 두 시에 만나고 비가 오면 카페에서 만나는 거죠?",
  };
  const expressions = [
    expression(`${id}-confirm`, firstModel, firstKo[item.id]),
    expression(`${id}-respond`, item.response[1], item.response[0]),
  ];
  expressions[0].recall = text([
    `${item.question[0]} ${item.first[0]}`,
    `${item.question[1]} ${item.first[1]}`,
  ]);
  const tasks = [
    task(
      "listen",
      "listening",
      ["상대의 말을 먼저 듣기", "Listen first"],
      item.fact,
      () => ({
        passage: item.question[1],
        translation: question,
        prompt: text(item.fact),
        options: item.options.map((v, i) => ({ id: String(i), text: v })),
        correctOption: String(item.correct),
        model: item.options[item.correct],
      }),
      [expressions[0].id],
    ),
    task("turn", "speaking", ["이제 내 차례", "Your turn"], item.first, () => ({
      passage: item.question[1],
      translation: question,
      prompt,
      model: firstModel,
    })),
    task(
      "update",
      "writing",
      ["바뀐 조건을 짧게 정리", "Summarize the change"],
      item.change,
      () => ({
        passage: item.change[1],
        translation: change,
        prompt: text([
          "최종 정보가 담긴 영어 답변을 쓰세요.",
          "Write a reply with the final details.",
        ]),
        model: item.response[1],
        accepted: [item.response[1]],
        keywords: item.keywords,
      }),
      [expressions[1].id],
    ),
    task(
      "transfer",
      "speaking",
      ["다른 사람에게 다시 전달", "Use it with someone else"],
      item.final,
      () => ({
        passage: item.change[1],
        translation: change,
        prompt: text(item.final),
        model:
          item.id === "meeting"
            ? "Could we meet at noon instead? I can't make it at eleven."
            : item.response[1],
      }),
    ),
  ];
  return base(id, item.title, "conversation", tasks, expressions);
});

type ReadingSpec = {
  id: string;
  title: Pair;
  paragraphs: [Pair, Pair, Pair];
  question: Pair;
  answers: [string, string, string];
  correct: 0 | 1 | 2;
  phrase: Pair;
  write: Pair;
  keywords: string[][];
  thought: Pair;
  thoughtModel: string;
};
const readings: ReadingSpec[] = [
  {
    id: "repair",
    title: ["고쳐 쓰는 토요일", "Repair, then reuse"],
    paragraphs: [
      [
        "동네 도서관은 토요일에 수리 모임을 엽니다. 의자가 흔들리거나 단추가 떨어진 옷을 가져올 수 있습니다. 전기 제품은 받지 않습니다. 수리는 무료지만 부품이 필요하면 비용을 설명하고 구입 전에 허락을 받습니다.",
        "The library holds a repair session on Saturday. Bring a wobbly chair or clothes with a missing button. Electrical items are not accepted. Repairs are free. If a part costs money, volunteers explain the price and ask your permission before buying it.",
      ],
      [
        "동네 도서관의 토요일 수리 모임에서는 작은 가구와 옷을 함께 고칩니다. 자원봉사자는 완성품만 돌려주지 않고 수리 방법을 설명합니다. 전기 제품은 전문 장비가 없어 받지 않습니다. 작업 자체는 무료입니다. 새 부품이 필요하면 비용을 설명하고 허락을 받은 뒤 구입합니다.",
        "At the library's Saturday repair session, volunteers help people fix small furniture and clothes. They explain the repair instead of simply handing back a finished item. Electrical items are not accepted because specialist equipment is unavailable. The work is free. If a new part is needed, the volunteer explains its cost and asks permission before buying it.",
      ],
      [
        "도서관의 토요일 수리 모임의 목표는 물건을 살리는 것과 방법을 나누는 것입니다. 봉사자는 참가자가 직접 할 수 있는 작업을 보여 줍니다. 의자의 느슨한 나사나 옷의 떨어진 단추는 좋은 대상이지만, 전문 장비 없이 전기 제품을 손대지는 않습니다. 수리 노동은 무료이며 교체 부품이 필요한 경우에만 비용이 생깁니다. 참가자가 가격을 듣고 동의하기 전에는 부품을 구입하지 않습니다. 고칠 수 없는 물건은 전문가에게 문의하도록 안내합니다.",
        "The library's Saturday repair session aims to save useful objects and share practical skills. Volunteers demonstrate work that participants can safely do themselves. A loose chair screw or a missing button is a suitable project; electrical repairs require equipment and training the session does not provide. Labour is free, while replacement parts may cost money. Nothing is purchased before the participant hears the price and agrees. Items beyond the volunteers' skills are referred to a professional, rather than being repaired by guesswork.",
      ],
    ],
    question: ["새 부품이 필요할 때 먼저 하는 일은?", "What happens before a new part is bought?"],
    answers: [
      "Explain the price and ask permission.",
      "Buy it without asking.",
      "Reject every item.",
    ],
    correct: 0,
    phrase: ["부품을 주문하기 전에 알려 주세요.", "Please let me know before you order the part."],
    write: [
      "부품을 주문하기 전에 알려 달라고 요청하세요.",
      "Ask to be told before the part is ordered.",
    ],
    keywords: [["before"], ["order"], ["part"], ["know", "tell"]],
    thought: [
      "버리기 전에 고쳐 보고 싶은 물건 하나를 말하세요.",
      "Name something you would like to repair before replacing it.",
    ],
    thoughtModel: "I'd like to repair my chair before buying a new one.",
  },
  {
    id: "library",
    title: ["빌리는 것은 책만이 아니다", "More than books"],
    paragraphs: [
      [
        "이 도서관은 작은 도구도 빌려줍니다. 공구는 한 번에 하나, 7일 동안 빌릴 수 있습니다. 예약은 무료입니다. 책과 달리 공구는 직원에게 직접 반납해야 합니다.",
        "This library also lends small tools. You can borrow one tool for seven days. Reservations are free. Unlike books, tools must be returned directly to a staff member.",
      ],
      [
        "드라이버를 한 번 쓰려고 살 필요는 없을지도 모릅니다. 도서관 회원은 공구를 한 번에 하나씩 7일 동안 빌릴 수 있습니다. 무료 예약을 하면 준비됐다는 알림을 받습니다. 공구를 책 반납함에 넣으면 손상될 수 있으므로 운영 시간에 직원에게 직접 반납해야 합니다.",
        "You may not need to buy a screwdriver for one small job. Library members can borrow one tool at a time for seven days. A free reservation brings a notification when the tool is ready. Tools should not go into the book drop box, where they might be damaged. Return them directly to staff during opening hours.",
      ],
      [
        "공구 대여는 가끔 필요한 물건을 함께 쓰는 도서관 서비스입니다. 회원은 한 번에 하나의 공구를 7일간 빌릴 수 있고, 무료 예약 후 준비됐다는 알림을 받고 방문합니다. 사용 방법을 모르겠다면 인수할 때 직원에게 물어볼 수 있습니다. 반납 방법은 책과 다릅니다. 공구를 반납함에 떨어뜨리면 다른 물건이 손상될 수 있으므로 운영 시간에 직원에게 건네야 합니다. 예약했다고 해서 이미 대출이 시작되는 것은 아닙니다.",
        "The tool service helps members share equipment they only occasionally need. One tool may be borrowed at a time for seven days. After making a free reservation, members wait for a ready notification before visiting. They can ask staff about basic use when collecting it. The return process differs from returning books: dropping a tool into the book box could damage other items. Tools must therefore be handed to staff during opening hours. A reservation secures a place in the queue; it does not mean a tool has already been collected.",
      ],
    ],
    question: ["공구는 어떻게 반납해야 하나요?", "How should a tool be returned?"],
    answers: [
      "Put it in the book box.",
      "Hand it directly to staff.",
      "Leave it outside overnight.",
    ],
    correct: 1,
    phrase: ["이 공구를 7일 동안 빌릴 수 있나요?", "Could I borrow this tool for seven days?"],
    write: [
      "공구를 7일 동안 빌릴 수 있는지 물어보세요.",
      "Ask whether you can borrow the tool for seven days.",
    ],
    keywords: [["borrow"], ["tool"], ["seven", "7"], ["days"]],
    thought: [
      "함께 빌려 쓰면 좋을 물건과 그 이유를 말하세요.",
      "Suggest something people could share and explain why.",
    ],
    thoughtModel: "We could share a ladder because most people only need it occasionally.",
  },
  {
    id: "walk",
    title: ["천천히 걷는 길", "A walk for everyone"],
    paragraphs: [
      [
        "동네 산책 모임은 일요일 9시에 출발합니다. 짧은 길은 경사로와 벤치를 지납니다. 긴 길에는 계단이 있습니다. 어느 길을 선택해도 출발 장소는 같습니다.",
        "The neighbourhood walk starts at nine on Sunday. The short route has a ramp and benches. The long route includes stairs. Both routes start at the same place.",
      ],
      [
        "일요일 산책에는 두 가지 길이 있습니다. 9시에 같은 광장에서 만나지만 참가자는 자신의 편안함에 맞춰 길을 고릅니다. 짧은 길은 경사로와 벤치를 지나고, 긴 길은 언덕의 계단을 오릅니다. 빨리 걷는 것이 목표가 아닙니다. 모임은 함께 나와 각자의 속도로 동네를 살펴보는 시간입니다.",
        "The Sunday walk offers two routes. Everyone meets in the same square at nine, then chooses a route that feels comfortable. The short route passes a ramp and benches; the long one climbs steps on a hill. Walking fast is not the goal. The group gives neighbours a chance to get outside and notice their surroundings at their own pace.",
      ],
      [
        "같은 산책을 모두 같은 속도로 할 필요는 없습니다. 일요일 모임은 9시에 광장에서 함께 출발한 뒤 두 갈래로 나뉩니다. 짧은 길에는 경사로와 쉬어 갈 벤치가 있고, 긴 길에는 언덕의 계단이 있습니다. 참가자는 건강이나 취향에 맞춰 선택할 수 있고 선택 이유를 설명할 의무도 없습니다. 안내자는 뒤처진 사람을 서두르게 하기보다 쉬고 싶은지 묻습니다. 여러 길을 준비하는 것은 모임에 참여할 방법을 넓히는 일입니다.",
        "A shared walk does not require everyone to move at the same speed. The Sunday group meets in the square at nine before separating into two routes. The short route offers a ramp and rest benches, while the longer route includes hill steps. Participants may choose according to their comfort or preference without having to justify that choice. A guide asks whether someone would like a break rather than urging them to hurry. Providing more than one route gives more neighbours a practical way to participate.",
      ],
    ],
    question: ["짧은 길에 있는 것은?", "What does the short route offer?"],
    answers: ["Only hill steps.", "A different starting time.", "A ramp and benches."],
    correct: 2,
    phrase: ["계단 대신 짧은 길로 갈게요.", "I'll take the short route instead of the stairs."],
    write: [
      "계단 대신 짧은 길로 가겠다고 쓰세요.",
      "Say that you will take the short route instead of the stairs.",
    ],
    keywords: [["short"], ["route", "path"], ["instead"], ["stairs", "steps"]],
    thought: [
      "함께 활동할 때 다른 속도를 존중하는 방법을 말하세요.",
      "How could a group respect different paces?",
    ],
    thoughtModel: "We could offer breaks and let people choose a comfortable route.",
  },
  {
    id: "market",
    title: ["시장에 가져가는 용기", "Bring your own container"],
    paragraphs: [
      [
        "이 시장의 일부 가게는 손님의 깨끗한 용기를 사용합니다. 계산하기 전에 빈 용기의 무게를 잽니다. 무거운 용기 값까지 내지 않도록 내용물 무게만 계산합니다.",
        "Some market stalls accept clean containers brought by customers. The empty container is weighed first. Customers pay for the contents, not the weight of the container.",
      ],
      [
        "장을 볼 때 용기를 가져가면 포장을 줄일 수 있습니다. 하지만 모든 가게가 같은 방식으로 판매하지는 않으므로 먼저 물어보세요. 용기를 받는 가게에서는 내용물을 담기 전에 빈 용기의 무게를 기록합니다. 최종 무게에서 용기 무게를 빼서 실제 산 물건의 양만 계산합니다.",
        "Bringing a container can reduce packaging, but not every stall uses the same system, so ask first. A stall that accepts your container records its empty weight before filling it. That weight is then subtracted from the total. You are charged only for the amount of food you actually buy.",
      ],
      [
        "용기 무게를 먼저 재는 것은 할인 행사가 아니라 정확한 계산을 위한 과정입니다. 용기를 받는 가게는 깨끗하고 용도에 맞는지 확인한 뒤 빈 무게를 기록합니다. 손님이 물건을 담고 나면 전체 무게에서 용기의 무게를 뺍니다. 따라서 유리병이 무겁다고 더 많은 음식을 산 것으로 계산되지 않습니다. 가게마다 취급 품목과 위생 절차가 다르므로 어떤 용기든 사용할 수 있다고 가정하기보다 먼저 물어보는 것이 좋습니다.",
        "Weighing an empty container is a way to measure a purchase accurately, not a special discount. Participating stalls check that the container is clean and suitable, then record its empty weight. After the customer fills it, that weight is subtracted from the total. A heavy glass jar should therefore not count as extra food. Each stall has its own products and hygiene procedures. Asking before filling a container is more useful than assuming every container will be accepted everywhere.",
      ],
    ],
    question: ["빈 용기의 무게를 먼저 재는 이유는?", "Why is the empty container weighed first?"],
    answers: [
      "So the customer pays only for the contents.",
      "So every jar receives a discount.",
      "So all stalls must accept it.",
    ],
    correct: 0,
    phrase: ["제 용기를 사용해도 될까요?", "May I use my own container?"],
    write: ["내 용기를 사용해도 되는지 물어보세요.", "Ask whether you can use your own container."],
    keywords: [["use"], ["own", "my"], ["container", "jar"]],
    thought: [
      "물건을 살 때 먼저 확인하면 좋은 조건을 말하세요.",
      "Name something useful to check before buying an item.",
    ],
    thoughtModel: "I'd ask whether I can return it if it does not fit.",
  },
  {
    id: "notice",
    title: ["공지의 날짜를 읽는 법", "Check the date"],
    paragraphs: [
      [
        "게시판에는 공원 행사 안내가 두 장 있습니다. 월요일 공지는 2시, 목요일 수정 공지는 3시라고 합니다. 장소는 같습니다. 최신 수정 공지를 따라야 합니다.",
        "Two notices describe a park event. Monday's notice says two o'clock; Thursday's correction says three. The place is unchanged. Follow the newer correction.",
      ],
      [
        "공지의 글씨가 크다고 더 최신인 것은 아닙니다. 공원 게시판의 월요일 안내에는 행사 시작이 2시로 적혀 있습니다. 목요일에 붙인 수정 안내는 3시로 바뀌었다고 설명하며 장소는 그대로라고 합니다. 서로 다른 정보를 보면 게시 날짜와 수정 이유를 함께 확인하면 오해를 줄일 수 있습니다.",
        "A larger notice is not necessarily a newer one. Monday's park notice gives the event time as two. Thursday's correction explains that it has moved to three and that the place is unchanged. When information conflicts, checking the publication date and the stated correction can help prevent a misunderstanding.",
      ],
      [
        "정보를 확인할 때는 제목뿐 아니라 작성 시각과 무엇이 바뀌었는지를 살펴봅니다. 월요일의 공원 행사 안내는 2시 시작이라고 합니다. 목요일에 게시된 정정문은 같은 행사가 3시로 변경됐다고 명시하지만 장소를 바꾸지는 않습니다. 정정문에 없는 변화까지 추측할 필요는 없습니다. 최신 공지가 이전 내용을 수정하는지, 아니면 다른 행사를 설명하는지도 구분해야 합니다. 날짜와 행사 이름을 함께 비교하면 최신이라는 이유만으로 관련 없는 공지를 고르는 일을 줄일 수 있습니다.",
        "Useful checks include when information was published and which detail was changed. Monday's park notice announces a two o'clock start. Thursday's correction explicitly moves the same event to three without changing its location. There is no need to invent other changes. It also matters whether a newer notice corrects this event or describes a different one. Comparing the event name as well as the date helps avoid choosing unrelated information simply because it happens to be newer.",
      ],
    ],
    question: ["확인된 최종 시작 시각은?", "What is the confirmed start time?"],
    answers: ["Two o'clock.", "Three o'clock.", "The place has changed."],
    correct: 1,
    phrase: ["최신 안내에는 세 시라고 적혀 있습니다.", "The latest notice says three o'clock."],
    write: [
      "최신 안내의 시작 시각이 세 시라고 전달하세요.",
      "Report that the latest notice gives a three o'clock start.",
    ],
    keywords: [["latest", "new", "updated"], ["notice"], ["three", "3"]],
    thought: [
      "서로 다른 안내를 봤을 때 확인할 두 가지를 말하세요.",
      "Name two things to check when notices disagree.",
    ],
    thoughtModel: "I'd check the date and whether both notices describe the same event.",
  },
  {
    id: "quiet",
    title: ["함께 쓰는 조용한 공간", "Sharing a quiet space"],
    paragraphs: [
      [
        "작업 공간의 초록 방은 조용히 일하는 곳입니다. 전화는 복도에서 받습니다. 파란 방에서는 예약한 사람들이 함께 이야기할 수 있습니다. 색깔마다 용도가 다릅니다.",
        "The green room is for quiet work. Take phone calls in the corridor. Groups with a booking may talk in the blue room. The colours mark different uses.",
      ],
      [
        "공유 작업 공간에는 두 가지 방이 있습니다. 초록 방에서는 조용히 읽거나 일하고 전화를 받을 때는 복도로 나갑니다. 파란 방은 모임을 위해 예약해서 쓰며 대화할 수 있습니다. 서로 다른 용도를 안내하면 모든 사람에게 조용히 하라고 요구하지 않고도 필요한 공간을 함께 사용할 수 있습니다.",
        "The shared workspace has two kinds of room. People read or work quietly in the green room and step into the corridor for calls. The blue room can be booked for a group discussion. Explaining different uses allows people to share the building without expecting every activity to happen in silence.",
      ],
      [
        "공간을 함께 쓰는 규칙은 누가 더 중요한지를 정하기보다 활동이 서로 방해하지 않게 돕습니다. 초록 방은 조용한 읽기와 개인 작업을 위해 마련됐고 전화는 복도에서 받습니다. 예약 가능한 파란 방에서는 그룹이 대화할 수 있습니다. 초록 방에 빈자리가 있다고 대화 모임을 그대로 옮기지는 않습니다. 먼저 목적에 맞는 방을 예약할 수 있는지 확인합니다. 안내판을 읽고 자신의 활동을 설명하면 필요한 공간을 찾는 데 도움이 됩니다.",
        "Shared-space rules help activities coexist rather than deciding whose work matters more. The green room supports quiet reading and individual work; calls are taken in the corridor. The bookable blue room allows group conversation. An empty seat in the green room does not automatically make it suitable for a discussion meeting. A group first checks whether a room intended for that activity can be reserved. Reading the notice and explaining what you plan to do makes it easier to find a suitable space.",
      ],
    ],
    question: ["모임 대화를 위한 공간은?", "Which space is intended for group discussion?"],
    answers: [
      "The green room without a booking.",
      "Any empty seat.",
      "The blue room with a booking.",
    ],
    correct: 2,
    phrase: [
      "그룹 토론을 위해 파란 방을 예약하고 싶습니다.",
      "I'd like to book the blue room for a group discussion.",
    ],
    write: [
      "그룹 토론을 위해 파란 방을 예약하고 싶다고 쓰세요.",
      "Request a booking of the blue room for a group discussion.",
    ],
    keywords: [["book", "reserve"], ["blue"], ["room"], ["group", "discussion"]],
    thought: [
      "공유 공간에서 다른 사람을 배려하는 방법을 말하세요.",
      "Describe a way to be considerate in a shared space.",
    ],
    thoughtModel: "I'd take calls outside the quiet room and book a room for discussions.",
  },
];
const listeningAlternatives: Record<string, [Pair, Pair]> = {
  repair: [
    ["부품을 주문한 뒤 알려 주세요.", "Tell me after you order the part."],
    ["지금 바로 부품을 주문해 주세요.", "Please order the part right now."],
  ],
  library: [
    ["공구 일곱 개를 빌릴 수 있나요?", "Could I borrow seven tools?"],
    ["이 공구를 한 달 동안 빌릴 수 있나요?", "Could I borrow this tool for a month?"],
  ],
  walk: [
    ["짧은 길 대신 계단으로 갈게요.", "I'll take the stairs instead of the short route."],
    ["두 길 모두 닫혀 있습니다.", "Both routes are closed."],
  ],
  market: [
    ["새 용기를 살 수 있나요?", "May I buy a new container?"],
    ["용기 가격을 낮춰 주실 수 있나요?", "Could you lower the price of the container?"],
  ],
  notice: [
    ["예전 안내에는 세 시라고 적혀 있습니다.", "The old notice says three o'clock."],
    ["최신 안내에는 두 시라고 적혀 있습니다.", "The latest notice says two o'clock."],
  ],
  quiet: [
    [
      "그룹 토론을 위해 초록 방을 예약하고 싶습니다.",
      "I'd like to book the green room for a group discussion.",
    ],
    [
      "혼자 공부하려고 파란 방을 예약하고 싶습니다.",
      "I'd like to book the blue room for individual study.",
    ],
  ],
};
const readingPacks = readings.map((item, readingIndex) => {
  const id = `reading-${item.id}`;
  const phrase = text(item.phrase);
  const question = text(item.question);
  const paragraphs = item.paragraphs.map((p) => ({ ko: text(p), en: p[1] }));
  const expressions = [expression(`${id}-phrase`, item.phrase[1], item.phrase[0])];
  const notes: Record<string, Pair> = {
    repair: [
      "before 뒤에 주문하는 일을 붙이면 그보다 먼저 알려 달라는 뜻이 됩니다. Please let me know…로 원하는 알림을 부탁해 보세요.",
      "Before the order means earlier than the purchase. Please let me know… asks for the notification you need.",
    ],
    library: [
      "for seven days는 7일 동안이라는 기간입니다. 반납 기한을 말하는 by Friday와 구별해서 써 보세요.",
      "For seven days describes a duration. Compare it with by Friday, which gives a return deadline.",
    ],
    walk: [
      "instead of 뒤에는 선택하지 않을 것을 붙입니다. 무엇을 대신할지 말하면 내 선택을 더 쉽게 설명할 수 있어요.",
      "After instead of, name the option you are not choosing. This makes your alternative clearer.",
    ],
    market: [
      "my own은 다른 사람이 준 것이 아니라 내가 가져온 것임을 강조합니다. May I use…?로 사용해도 되는지 먼저 물어보세요.",
      "My own emphasizes that the item is yours. Ask May I use…? to check before using it.",
    ],
    notice: [
      "The latest notice says…로 정보의 출처를 함께 전할 수 있습니다. 바뀌었다고 확인된 내용만 알려주세요.",
      "The latest notice says… tells someone where the information came from. Report only the confirmed change.",
    ],
    quiet: [
      "I'd like to book…로 예약할 공간을 말하고, for 뒤에 이용 목적을 덧붙일 수 있습니다.",
      "I'd like to book… requests a space, and for adds the purpose of the booking.",
    ],
  };
  const feedback = text(notes[item.id]);
  const task = (
    suffix: string,
    skill: EnglishTask["skill"],
    title: Pair,
    context: Pair,
    build: (i: number) => TaskVersion,
    ids: string[] = [],
  ): EnglishTask => ({
    id: `${id}-${suffix}`,
    skill,
    title: text(title),
    context: text(context),
    document: text(["오늘의 한 장", "Today's page"]),
    feedback,
    consequence: text([
      "읽은 정보를 실제로 쓸 표현으로 이어갑니다.",
      "Turn what you read into language you can use.",
    ]),
    expressionIds: ids,
    versions: versions((_, i) => build(i)),
  });
  const alternatives = listeningAlternatives[item.id].map((pair) => text(pair));
  const listenOptions = [phrase, ...alternatives].map((value, index) => ({
    id: String(index),
    text: value,
  }));
  const rotation = readingIndex % 3;
  const orderedOptions = [...listenOptions.slice(rotation), ...listenOptions.slice(0, rotation)];
  const tasks = [
    task(
      "read",
      "reading",
      ["한 장 읽고 핵심 찾기", "Read and find the key idea"],
      item.question,
      (i) => ({
        passage: paragraphs[i].en,
        translation: paragraphs[i].ko,
        prompt: question,
        options: item.answers.map((v, n) => ({ id: String(n), text: v })),
        correctOption: String(item.correct),
        model: item.answers[item.correct],
      }),
    ),
    task(
      "listen",
      "listening",
      ["오늘의 표현을 귀로 확인", "Listen to today's phrase"],
      [
        "본문에서 사용할 수 있는 표현을 듣고 뜻을 구별하세요.",
        "Listen to a useful phrase from this topic and identify its meaning.",
      ],
      () => ({
        passage: item.phrase[1],
        translation: phrase,
        prompt: text([
          "들은 문장의 뜻을 고르세요.",
          "Choose the meaning of the sentence you heard.",
        ]),
        options: orderedOptions,
        correctOption: "0",
        model: phrase,
      }),
    ),
    task(
      "write",
      "writing",
      ["읽은 내용을 짧게 쓰기", "Write what you would say"],
      item.write,
      () => ({
        passage: item.write[1],
        translation: text(item.write),
        prompt: text(item.write),
        model: item.phrase[1],
        accepted: [item.phrase[1]],
        keywords: item.keywords,
      }),
      [expressions[0].id],
    ),
    task(
      "think",
      "speaking",
      ["생각을 내 말로", "A thought in your own words"],
      item.thought,
      () => ({
        passage: item.thought[1],
        translation: text(item.thought),
        prompt: text(item.thought),
        model: item.thoughtModel,
      }),
    ),
  ];
  return base(id, item.title, "reading", tasks, expressions);
});
export const englishPracticePacks: EnglishPracticePack[] = [
  ...conversationPacks,
  ...sentencePacks,
  relationshipPack,
  ...readingPacks,
];
export function getEnglishPracticePack(id: string) {
  return englishPracticePacks.find((pack) => pack.id === id);
}
