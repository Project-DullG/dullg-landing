import { allEnglishContent, getEnglishEpisode } from "./catalog.ts";
import { isEnglishLevel } from "./progress.ts";
import type { EnglishLevel, EnglishProgress } from "./types.ts";

export type EnglishCourseText = { ko: string; en: string };
export type EnglishCourseUnit = {
  contentId: string;
  rationale: EnglishCourseText;
};
export type EnglishCourse = {
  id: string;
  title: EnglishCourseText;
  description: EnglishCourseText;
  purpose: EnglishCourseText;
  units: EnglishCourseUnit[];
};
export type EnglishCourseUnitState = EnglishCourseUnit & {
  count: number;
  total: number;
  completed: boolean;
  inProgress: boolean;
};
export type EnglishCourseState = {
  units: EnglishCourseUnitState[];
  completedUnits: number;
  totalUnits: number;
  percent: number;
  allComplete: boolean;
  nextUnit: EnglishCourseUnitState | undefined;
};

export const coursesEnglishDictionary: Record<string, string> = {};
function text(ko: string, en: string): EnglishCourseText {
  const previous = coursesEnglishDictionary[ko];
  if (previous && previous !== en) throw new Error(`Course translation conflict: ${ko}`);
  coursesEnglishDictionary[ko] = en;
  return { ko, en };
}
function unit(contentId: string, ko: string, en: string): EnglishCourseUnit {
  return { contentId, rationale: text(ko, en) };
}

/** These courses arrange existing stories and practice packs; they add no new works. */
export const englishCourses: EnglishCourse[] = [
  {
    id: "first-steps",
    title: text("처음부터 차근차근", "One step at a time"),
    description: text(
      "짧은 부탁부터 시작해, 듣고 이해한 내용을 이야기 속에서 직접 써 봐요.",
      "Start with a short request, then use what you understand in a story.",
    ),
    purpose: text(
      "부탁하기와 되묻기를 익힌 뒤 문장 속 역할을 살펴봅니다. 서점과 도서관에서 연습하고, 호텔과 우편 배달 이야기로 표현을 넓혀 가요. 난이도는 언제든 고를 수 있어요.",
      "Practise requests and clarification, then explore who does what in a sentence. Use those skills in a bookshop and library before trying a hotel conversation and a postal adventure. Choose your difficulty at any point.",
    ),
    units: [
      unit(
        "sentence-requests",
        "도움이 필요할 때 꺼낼 수 있는 짧은 부탁부터 만들어 봐요.",
        "Build a short request you can use when you need help.",
      ),
      unit(
        "sentence-clarify",
        "답을 잘 못 들었거나 뜻이 헷갈릴 때 다시 물어보는 표현을 이어 배워요.",
        "Next, learn how to ask again when you miss an answer or are unsure what it means.",
      ),
      unit(
        "sentence-relationships",
        "누가 부탁하고 누가 그 일을 하는지 구별하면 다음 이야기의 대화를 더 쉽게 따라갈 수 있어요.",
        "Distinguish who makes a request from who does the action so the next story's dialogue is easier to follow.",
      ),
      unit(
        "closed-bookshop",
        "익힌 부탁과 확인 표현을 써서 책을 전달하고, 필요한 안내를 따라가 봐요.",
        "Use your requests and clarification to deliver a book and follow the directions you need.",
      ),
      unit(
        "conversation-library",
        "이번에는 실제 도서관 대화처럼 책을 빌리고 바뀐 조건을 상대에게 전해요.",
        "Try a library conversation: borrow a book and explain a change in the arrangements.",
      ),
      unit(
        "reading-library",
        "대화에서 만난 도서관을 짧은 글로 읽고, 중요한 뜻을 내 말로 정리해 봐요.",
        "Read a short page about libraries and put its key idea into your own words.",
      ),
      unit(
        "conversation-hotel",
        "새로운 장소에서도 부탁해 보세요. 가방을 맡기고 조식 안내를 함께 온 사람에게 전해요.",
        "Use a request in a new setting: arrange bag storage and explain breakfast details to a companion.",
      ),
      unit(
        "moonlight-post",
        "주소와 길을 읽고 동료의 말을 들으며, 배운 표현으로 편지 배달을 끝까지 이어가요.",
        "Read an address and route, listen to a companion, and use your phrases to complete a letter delivery.",
      ),
    ],
  },
  {
    id: "everyday-english",
    title: text("일상에서 바로 쓰기", "English for everyday life"),
    description: text(
      "주문과 약속, 바뀐 안내처럼 일상에서 자주 만나는 대화를 연습해요.",
      "Practise everyday conversations about orders, plans, and changing information.",
    ),
    purpose: text(
      "원하는 것을 말하고 약속을 정한 뒤, 조건이 달라졌을 때도 대화를 이어 봅니다. 글의 날짜와 필요한 정보를 읽는 연습을 거쳐 카페 모임을 함께 준비해요.",
      "State a preference, make plans, and keep a conversation going when the details change. Read dates and useful details before helping prepare a gathering at a café.",
    ),
    units: [
      unit(
        "sentence-preferences",
        "원하는 것과 빼고 싶은 것을 먼저 말해 보면 주문할 때도 표현이 떠올라요.",
        "Practise saying what you want and what to leave out before placing an order.",
      ),
      unit(
        "conversation-cafe",
        "작은 차 한 잔을 주문하고, 컵이 바뀌어도 분량과 가격을 분명히 전해요.",
        "Order a small tea and make the portion and price clear when the cup changes.",
      ),
      unit(
        "sentence-plans",
        "약속의 시간과 날짜를 넣어 문장을 만들고, 다른 시간을 제안해 봐요.",
        "Build sentences with times and dates, then suggest a different time.",
      ),
      unit(
        "conversation-plans",
        "비가 와서 만날 장소가 달라져도 친구와 약속을 다시 맞춰 봐요.",
        "Agree on a revised plan with a friend when rain changes the meeting place.",
      ),
      unit(
        "conversation-airport",
        "시간을 말하는 표현을 공항에서도 써 봐요. 바뀐 탑승구와 그대로인 탑승 시각을 함께 전합니다.",
        "Use time expressions at an airport: explain the new gate and the unchanged boarding time.",
      ),
      unit(
        "reading-market",
        "짧은 시장 이야기를 읽고, 물건을 살 때 도움이 되는 생각을 나눠요.",
        "Read a short market story and share an idea you can use when shopping.",
      ),
      unit(
        "reading-notice",
        "예전 안내와 새 안내를 구별하는 연습을 해 두면 바뀐 약속도 놓치지 않아요.",
        "Practise distinguishing an old notice from a new one so you can follow a change of plans.",
      ),
      unit(
        "raincheck-cafe",
        "주문, 예약, 초대장을 이어 살펴보며 비 오는 날의 낭독 모임을 함께 준비해요.",
        "Bring orders, bookings, and invitations together to prepare a rainy-day reading gathering.",
      ),
    ],
  },
  {
    id: "clues-and-english",
    title: text("단서로 영어 익히기", "Follow the clues in English"),
    description: text(
      "기록과 대화를 비교해 오해를 풀고, 근거를 들어 다음 행동을 골라요.",
      "Compare records and conversations, resolve misunderstandings, and choose an action based on the clues.",
    ),
    purpose: text(
      "되묻기, 길 안내, 이유를 말하는 표현을 먼저 익힙니다. 날짜와 바뀐 조건을 읽고 듣는 연습을 거쳐 보관함, 라디오, 온실의 단서를 따라가요.",
      "Start with clarification, directions, and reasons. Practise reading dates and listening for changed arrangements before following clues in a locker, a radio station, and a glasshouse.",
    ),
    units: [
      unit(
        "sentence-clarify",
        "단서를 모으기 전에 내가 들은 뜻이 맞는지 되묻는 표현을 익혀요.",
        "Before collecting clues, learn how to check that you understood what you heard.",
      ),
      unit(
        "sentence-directions",
        "장소의 위치와 대신 갈 수 있는 길을 말하며 지도를 읽을 준비를 해요.",
        "Describe a location and an alternative route to prepare for reading a map.",
      ),
      unit(
        "sentence-reasons",
        "왜 그 길이나 방법을 골랐는지 설명하고, 가능한 대안을 덧붙여 봐요.",
        "Explain why you chose a route or method, and add an alternative you can offer.",
      ),
      unit(
        "reading-notice",
        "날짜가 다른 안내문을 비교하며 지금 쓸 수 있는 정보가 무엇인지 찾아요.",
        "Compare notices with different dates to find the information that still applies.",
      ),
      unit(
        "conversation-meeting",
        "바뀐 회의 시각과 그대로인 참석 방법을 듣고 구별해 보세요.",
        "Listen for the changed meeting time and distinguish it from the unchanged ways to attend.",
      ),
      unit(
        "locker-seven",
        "허락받은 기록과 증언을 살펴보고, 편지를 누구에게 어떻게 전할지 판단해요.",
        "Use permitted records and testimony to decide who should receive a letter and how to deliver it.",
      ),
      unit(
        "midnight-radio",
        "오래된 녹음과 최신 공지를 비교해 잘못 전해진 약속을 바로잡아요.",
        "Compare an old recording with a current notice to correct a misunderstood invitation.",
      ),
      unit(
        "glasshouse-garden",
        "지도, 식물 상태, 설계자의 편지를 함께 읽고 정원을 돌볼 방법을 골라요.",
        "Read a map, plant-care details, and the designer's letter together to choose how to care for the garden.",
      ),
    ],
  },
  {
    id: "read-and-respond",
    title: text("읽고 내 생각 말하기", "Read, then share a thought"),
    description: text(
      "여섯 편의 짧은 글을 읽고 듣고, 중요한 뜻을 쓰고 내 생각을 말해요.",
      "Read and listen to six short pages, write the key idea, and share a thought.",
    ),
    purpose: text(
      "친숙한 물건과 장소에서 시작해 다른 사람과 함께 살아가는 이야기를 읽습니다. 글마다 뜻을 정리하고 내 생각을 말한 뒤, 편지 배달 이야기에서 읽기와 표현을 함께 써 봐요.",
      "Begin with familiar objects and places, then read about sharing everyday life with others. Sum up each page and share a thought before combining reading and expression in a letter-delivery story.",
    ),
    units: [
      unit(
        "reading-repair",
        "고쳐 쓰는 물건에 관한 친숙한 이야기로, 글의 중심 생각을 찾는 연습을 시작해요.",
        "Start finding a page's main idea with a familiar story about repairing and reusing things.",
      ),
      unit(
        "reading-library",
        "도서관에서 빌릴 수 있는 것이 무엇인지 읽고, 나에게 필요한 것을 떠올려요.",
        "Read about what a library can lend and think about what you would use.",
      ),
      unit(
        "reading-walk",
        "여러 사람이 함께 걸을 수 있는 길을 읽으며 장소와 사람의 필요를 연결해 봐요.",
        "Read about a walk for different people and connect a place with people's needs.",
      ),
      unit(
        "reading-market",
        "시장에 용기를 가져가는 작은 선택을 읽고, 내가 해 볼 수 있는 일을 말해요.",
        "Read about bringing a container to a market and say what you could try yourself.",
      ),
      unit(
        "reading-notice",
        "공지의 날짜와 바뀐 내용을 살펴보고, 글을 읽을 때 확인할 점을 정리해요.",
        "Explore notice dates and changes, then sum up what to check when reading information.",
      ),
      unit(
        "reading-quiet",
        "함께 쓰는 공간에 관한 글을 읽고, 서로 배려할 수 있는 방법을 내 말로 전해요.",
        "Read about sharing a space and explain, in your own words, how people can consider one another.",
      ),
      unit(
        "moonlight-post",
        "주소와 지도, 동료의 말을 이어 이해하고, 편지를 전하는 데 필요한 생각을 직접 말해요.",
        "Connect an address, a map, and a companion's words, then express what is needed to deliver the letter.",
      ),
    ],
  },
];

export function getEnglishCourse(id: string): EnglishCourse | undefined {
  return englishCourses.find((course) => course.id === id);
}

/** Count only current required IDs; old completion timestamps cannot complete expanded content. */
export function getCourseState(
  course: EnglishCourse,
  progress: EnglishProgress | null | undefined,
): EnglishCourseState {
  const seen = new Set<string>();
  const units = course.units.map((item): EnglishCourseUnitState => {
    const content = getEnglishEpisode(item.contentId);
    if (!content) throw new RangeError(`Unknown English course content: ${item.contentId}`);
    if (seen.has(item.contentId))
      throw new RangeError(`Duplicate English course content: ${item.contentId}`);
    seen.add(item.contentId);
    const requiredTaskIds = [...new Set(content.tasks.map((task) => task.id))];
    const completedTaskIds = new Set(progress?.episodes[content.id]?.completedTasks || []);
    const count = requiredTaskIds.filter((id) => completedTaskIds.has(id)).length;
    const completed =
      requiredTaskIds.length > 0 && requiredTaskIds.every((id) => completedTaskIds.has(id));
    return {
      ...item,
      count,
      total: requiredTaskIds.length,
      completed,
      inProgress: count > 0 && !completed,
    };
  });
  const completedUnits = units.filter((item) => item.completed).length;
  const allComplete = units.length > 0 && units.every((item) => item.completed);
  const totalTasks = units.reduce((total, item) => total + item.total, 0);
  const completedTasks = units.reduce((total, item) => total + item.count, 0);
  // Partial work contributes to the percentage, but an unfinished course never reads 100%.
  const percent = allComplete
    ? 100
    : totalTasks > 0
      ? Math.min(99, Math.floor((completedTasks / totalTasks) * 100))
      : 0;
  let nextUnit: EnglishCourseUnitState | undefined;
  let latest = -Infinity;
  for (const item of units) {
    if (!item.inProgress) continue;
    const updatedAt = progress?.episodes[item.contentId]?.updatedAt;
    const parsed = typeof updatedAt === "string" ? Date.parse(updatedAt) : NaN;
    const date = Number.isFinite(parsed) ? parsed : -Infinity;
    // Ties and missing dates retain course order; completing a unit removes it from candidates.
    if (!nextUnit || date > latest) {
      nextUnit = item;
      latest = date;
    }
  }
  nextUnit ??= units.find((item) => !item.completed);
  return { units, completedUnits, totalUnits: units.length, percent, allComplete, nextUnit };
}

/** Guest page changes carry no saved history, so follow the current unit's course position. */
export function getCourseFollowUp(
  course: EnglishCourse,
  progress: EnglishProgress | null | undefined,
  currentContentId: string,
  hasSavedAccount: boolean,
): EnglishCourseUnitState | undefined {
  if (hasSavedAccount) return getCourseState(course, progress).nextUnit;
  const currentIndex = course.units.findIndex((item) => item.contentId === currentContentId);
  if (currentIndex < 0 || !getEnglishEpisode(currentContentId)) return undefined;
  return getCourseState(course, progress).units[currentIndex + 1];
}

/** Invalid targets return null; unrelated course queries are omitted instead of creating a dead end. */
export function getCourseHref(
  contentId: string,
  level: EnglishLevel,
  options: { replay?: boolean; courseId?: string } = {},
): string | null {
  if (!isEnglishLevel(level)) return null;
  const content = allEnglishContent.find((item) => item.id === contentId);
  if (!content) return null;
  const route = content.format === "practice" ? "practice" : "play";
  const query = new URLSearchParams({ level });
  if (options.replay === true) query.set("replay", "1");
  if (options.courseId) {
    const course = getEnglishCourse(options.courseId);
    if (course?.units.some((item) => item.contentId === contentId)) query.set("course", course.id);
  }
  return `/english/${route}/${encodeURIComponent(content.id)}?${query.toString()}`;
}
