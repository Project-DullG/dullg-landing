import type { EnglishLevel, EnglishSkill } from "./types.ts";

export type EnglishGuideText = { ko: string; en: string };
export type EnglishContentGuide = {
  contentId: string;
  goal: EnglishGuideText;
  fit: EnglishGuideText;
  tags: EnglishSkill[];
  sample: Record<EnglishLevel, EnglishGuideText>;
};
export const guidesEnglishDictionary: Record<string, string> = {};
type Pair = readonly [ko: string, en: string];
function text([ko, en]: Pair): EnglishGuideText {
  const previous = guidesEnglishDictionary[ko];
  if (previous && previous !== en) throw new Error(`Content guide translation conflict: ${ko}`);
  guidesEnglishDictionary[ko] = en;
  return { ko, en };
}
function guide(
  contentId: string,
  goal: Pair,
  fit: Pair,
  tags: EnglishSkill[],
  starter: Pair,
  standard: Pair,
  challenge: Pair,
): EnglishContentGuide {
  return {
    contentId,
    goal: text(goal),
    fit: text(fit),
    tags,
    sample: { starter: text(starter), standard: text(standard), challenge: text(challenge) },
  };
}

/** Selection aids for existing content. Samples are introductions or parallel examples, not extra activities. */
export const englishContentGuides: EnglishContentGuide[] = [
  guide(
    "closed-bookshop",
    [
      "도움을 부탁하고 안내를 확인해, 기다리는 사람에게 책을 전해요.",
      "Ask for help, check instructions, and deliver a book to the person waiting for it.",
    ],
    [
      "이야기를 따라가며 부탁하기와 길 안내를 함께 연습하고 싶은 분께 맞아요.",
      "For learners who want to practise requests and directions through a story.",
    ],
    ["reading", "listening", "writing", "speaking"],
    [
      "서점 직원이 가까운 곳으로 책을 전해야 해요. 글을 읽고 말을 들으며 도와주세요.",
      "A bookshop worker needs a book delivered nearby. Read and listen to help.",
    ],
    [
      "서점 직원이 가까운 곳으로 책을 전해달라고 부탁합니다. 메모를 읽고 이야기를 들으며 어떻게 도울지 알아보세요.",
      "A worker at the bookshop asks you to deliver a book nearby. Read the notes and listen to find out how to help.",
    ],
    [
      "동네 서점의 직원이 가까운 곳에 책 한 권을 가져다달라고 부탁합니다. 메모와 안내를 차근차근 살펴보며 그 부탁을 마무리해보세요.",
      "A member of staff at a neighbourhood bookshop asks you to take a book to a place nearby. Read the notes and listen to the instructions so you can carry out the request.",
    ],
  ),
  guide(
    "locker-seven",
    [
      "물건의 특징과 접수 기록을 비교하고, 주인과 받는 사람을 확인해 물건과 편지를 전해요.",
      "Compare an item's features with the records, then verify the owner and recipient before handing over the item and a letter.",
    ],
    [
      "단서를 비교한 뒤 내 판단의 까닭을 말해보고 싶은 분께 맞아요.",
      "For learners who want to compare clues and explain the reasons for a decision.",
    ],
    ["reading", "listening", "writing", "speaking"],
    [
      "역에 비슷한 가방 두 개가 있어요. 직원과 기록을 살펴보고 한 가방의 주인을 찾아주세요.",
      "Two similar bags are waiting at a station. Help the staff check records and find who owns one of them.",
    ],
    [
      "역에 보관된 가방 두 개가 닮아 있습니다. 직원과 함께 기록을 비교하며 한 가방의 주인을 찾아보세요.",
      "Two bags being kept at a station look alike. Work with the staff to compare the records and find the owner of one bag.",
    ],
    [
      "역에서 맡아둔 가방 두 개가 비슷하게 생겨 쉽게 구별되지 않습니다. 직원과 기록을 함께 살펴보며 한 가방의 주인이 누구인지 확인해보세요.",
      "Two bags being held at a station look so similar that they are difficult to tell apart. Work with the staff to examine the records and identify the owner of one of them.",
    ],
  ),
  guide(
    "moonlight-post",
    [
      "받는 사람과 목적지를 읽고, 들은 안내를 확인하며 초대장을 전해요.",
      "Read the recipient and destination, check the directions you hear, and deliver an invitation.",
    ],
    [
      "동화 속 여정을 즐기며 주소 쓰기와 길 묻기를 연습하고 싶은 분께 맞아요.",
      "For learners who enjoy a fairy-tale journey and want to practise addresses and directions.",
    ],
    ["reading", "listening", "writing", "speaking"],
    [
      "어린 토끼가 할머니에게 초대장을 보내고 싶어 해요. 밤의 우체국에서 배달을 도와주세요.",
      "A young rabbit wants to send an invitation to his grandmother. Help the night post office deliver it.",
    ],
    [
      "어린 토끼가 할머니에게 보낼 초대장을 맡깁니다. 밤에 문을 여는 우체국에서 그 초대장을 전하는 일을 도와보세요.",
      "A young rabbit brings an invitation for his grandmother. Help the post office that opens at night deliver it to her.",
    ],
    [
      "어린 토끼가 할머니에게 전하고 싶은 초대장을 우체국에 맡겼습니다. 밤에 일을 시작하는 우체국의 배달을 도와, 초대장이 할머니에게 닿게 해주세요.",
      "A young rabbit has left an invitation at the post office because he wants it to reach his grandmother. Help the office, which begins its work at night, deliver the invitation to her.",
    ],
  ),
  guide(
    "raincheck-cafe",
    [
      "모임의 예약과 주문을 확인하고, 달라진 장소와 필요한 준비를 사람들에게 전해요.",
      "Check a group's booking and orders, then explain the changed location and the preparations needed.",
    ],
    [
      "여러 사람의 부탁을 듣고 모임을 함께 준비하는 대화를 연습하고 싶은 분께 맞아요.",
      "For learners who want to listen to different requests and practise arranging a gathering.",
    ],
    ["reading", "listening", "writing", "speaking"],
    [
      "비 때문에 낭독 모임이 카페로 옮겨졌어요. 모임을 준비하고 손님들에게 바뀐 계획을 알려주세요.",
      "Rain has moved a reading group's plans to a café. Help prepare the gathering and tell the guests what has changed.",
    ],
    [
      "비가 내려 낭독 모임을 카페에서 열기로 했습니다. 모임 준비를 도우면서 손님들에게 달라진 계획을 전해보세요.",
      "A reading group has decided to meet at a café because of the rain. Help get the gathering ready and explain the changed plans to the guests.",
    ],
    [
      "낭독 모임은 비가 오는 바람에 카페로 장소를 옮겼습니다. 모임을 함께 준비하며, 찾아오는 손님들이 바뀐 계획을 알 수 있도록 안내해주세요.",
      "A reading group has moved its gathering to a café after rain changed its plans. Help with the preparations and make sure the guests arriving for the gathering know what has changed.",
    ],
  ),
  guide(
    "midnight-radio",
    [
      "옛 녹음과 최신 안내의 날짜를 구별하고, 확인한 행사 정보를 사람들에게 바로잡아 전해요.",
      "Distinguish the dates of an old recording and a current notice, then share verified event information to correct a misunderstanding.",
    ],
    [
      "엇갈리는 안내를 읽고 들으며 어떤 정보를 믿을지 판단해보고 싶은 분께 맞아요.",
      "For learners who want to compare conflicting written and spoken information before deciding what applies.",
    ],
    ["reading", "listening", "writing", "speaking"],
    [
      "옛 녹음과 새 안내에 적힌 계획이 달라요. 날짜를 살피고 지금의 정보를 알려주세요.",
      "An old recording and a new notice give different plans. Check the dates and share the current information.",
    ],
    [
      "오래된 녹음과 새 안내가 서로 다른 계획을 전합니다. 날짜를 비교한 뒤 사람들에게 지금의 정보를 알려보세요.",
      "An old recording and a new notice describe different arrangements. Compare their dates and help people understand the current information.",
    ],
    [
      "오래전에 만든 녹음과 새로 나온 안내가 같은 일을 두고 서로 다른 계획을 전하고 있습니다. 두 자료의 날짜를 살펴본 뒤, 사람들이 지금의 정보를 알 수 있도록 전해주세요.",
      "An older recording and a newly issued notice give different arrangements for the same event. Examine the dates on both sources, then help people hear the information that currently applies.",
    ],
  ),
  guide(
    "glasshouse-garden",
    [
      "지도와 관리 안내를 읽고, 불분명한 내용은 물어본 뒤 정원을 준비한 까닭을 설명해요.",
      "Read a map and care instructions, ask about anything unclear, and explain the choices you made while preparing a garden.",
    ],
    [
      "안내대로 행동하고, 모르는 것을 확인하며 이유까지 말해보고 싶은 분께 맞아요.",
      "For learners who want to follow instructions, check what they do not know, and explain their reasons.",
    ],
    ["reading", "listening", "writing", "speaking"],
    [
      "정원에서 손님을 맞을 준비를 하고 있어요. 안내를 읽고 직원들을 도와주세요.",
      "A garden is getting ready to welcome visitors. Read its notes and help the staff prepare.",
    ],
    [
      "정원에 손님들이 찾아올 예정입니다. 남겨진 안내를 살펴보며 직원들과 함께 정원을 준비해보세요.",
      "Visitors will soon be welcomed into a garden. Read the notes left there and work with the staff to get it ready.",
    ],
    [
      "정원은 찾아올 손님들을 맞이하기 위해 준비 중입니다. 남겨진 안내를 차근차근 읽으며, 직원들이 공간을 마련하는 일을 함께 도와주세요.",
      "A garden is being prepared so that it can welcome its visitors. Read the notes that have been left there and help the staff get the space ready for them.",
    ],
  ),
  guide(
    "conversation-airport",
    [
      "탑승 안내를 듣고 되묻고, 바뀐 탑승구와 그대로인 시각을 함께 전해요.",
      "Listen to boarding information, check it by asking again, and explain a changed gate alongside the unchanged time.",
    ],
    [
      "번호와 시간을 놓치지 않고 짧게 되묻는 대화를 연습하고 싶은 분께 맞아요.",
      "For learners who want to catch numbers and times and check them in a short conversation.",
    ],
    ["listening", "writing", "speaking"],
    [
      "어느 탑승구로 가야 하나요? 탑승은 열 시에 시작하나요?",
      "Which gate do I need? Is boarding at ten?",
    ],
    [
      "제가 어느 탑승구로 가야 하는지 알려주실 수 있나요? 탑승은 열 시에 시작하나요?",
      "Could you tell me which gate I should go to? Does boarding begin at ten?",
    ],
    [
      "어느 탑승구로 가면 되는지 확인해주실 수 있나요? 탑승이 열 시에 시작하는지도 함께 확인하고 싶습니다.",
      "Could you confirm which gate I should be heading towards? I'd also like to check whether boarding begins at ten.",
    ],
  ),
  guide(
    "conversation-hotel",
    [
      "가방 보관을 부탁하고, 조식 장소와 시간을 함께 온 사람에게 전해요.",
      "Request bag storage and explain the breakfast location and times to a companion.",
    ],
    [
      "숙소에서 서비스를 부탁하고 들은 안내를 전달하는 연습을 원하는 분께 맞아요.",
      "For learners who want to request a service at a hotel and pass on the information they hear.",
    ],
    ["listening", "writing", "speaking"],
    [
      "제 여행 가방을 여기에 맡아주세요. 점심을 먹고 찾으러 올게요.",
      "Please keep my suitcase here. I'll collect it after lunch.",
    ],
    [
      "제 여행 가방을 여기에 맡아주실 수 있나요? 점심을 먹은 뒤 찾으러 오겠습니다.",
      "Could you keep my suitcase here for me? I'll collect it after lunch.",
    ],
    [
      "잠시 동안 제 여행 가방을 여기에 맡아주실 수 있을까요? 점심을 먹고 나서 찾으러 올 생각입니다.",
      "Would you be able to keep my suitcase here for a while? I plan to collect it once I've had lunch.",
    ],
  ),
  guide(
    "conversation-cafe",
    [
      "원하는 음료를 주문하고, 주문 조건이 바뀌어도 분량과 가격을 분명히 말해요.",
      "Order the drink you want and make the portion and price clear when the arrangements change.",
    ],
    [
      "주문부터 직원의 대안에 답하기까지 한 번에 연습하고 싶은 분께 맞아요.",
      "For learners who want to practise both placing an order and responding to an alternative.",
    ],
    ["listening", "writing", "speaking"],
    [
      "큰 아이스 커피를 마시고 싶어요. 시럽은 빼주세요.",
      "I'd like a large iced coffee. Please leave out the syrup.",
    ],
    [
      "큰 아이스 커피 한 잔을 부탁드려도 될까요? 시럽 없이 마시고 싶어요.",
      "Could I have a large iced coffee, please? I'd like it without syrup.",
    ],
    [
      "얼음을 넣은 큰 커피 한 잔을 주문하고 싶습니다. 시럽을 넣지 않고 만들어주실 수 있을까요?",
      "I'd like to order a large coffee served with ice, please. Could you make it without adding any syrup?",
    ],
  ),
  guide(
    "conversation-meeting",
    [
      "회의에 참석할 방법을 말하고, 달라진 시각을 확인하거나 다른 시간을 제안해요.",
      "State how you will attend a meeting, check a changed time, or propose an alternative.",
    ],
    [
      "동료와 약속을 조정하며 시간과 참석 방법을 구별해 말하고 싶은 분께 맞아요.",
      "For learners who want to discuss meeting plans while distinguishing the time from the way they will attend.",
    ],
    ["listening", "writing", "speaking"],
    [
      "화요일에 만날 수 있나요? 저는 집에서 참석하고 싶어요.",
      "Can we meet on Tuesday? I'd prefer to join from home.",
    ],
    [
      "회의를 화요일로 정해도 될까요? 저는 집에서 참석하는 쪽이 좋겠습니다.",
      "Could we arrange the meeting for Tuesday? I'd prefer to take part from home.",
    ],
    [
      "화요일이 회의하기에 괜찮은 날일까요? 그날 만나게 된다면 저는 집에서 참석하는 쪽을 선호합니다.",
      "Would Tuesday be suitable for our meeting? If we meet then, my preference would be to take part from home.",
    ],
  ),
  guide(
    "conversation-library",
    [
      "책 대출과 연장 조건을 묻고, 바뀐 반납 안내에 맞춰 어떻게 돌려줄지 전해요.",
      "Ask about borrowing and renewal conditions, then explain how you will return a book after the instructions change.",
    ],
    [
      "빌릴 때와 돌려줄 때 필요한 부탁과 조건 표현을 연습하고 싶은 분께 맞아요.",
      "For learners who want to practise requests and conditions when borrowing and returning something.",
    ],
    ["listening", "writing", "speaking"],
    [
      "이 안내서를 빌릴 수 있나요? 언제 돌려줘야 하나요?",
      "Can I borrow this guidebook? When do I need to return it?",
    ],
    [
      "이 안내서를 빌려도 괜찮을까요? 언제까지 반납해야 하는지 알려주세요.",
      "Would it be all right to borrow this guidebook? Please tell me when it needs to be returned.",
    ],
    [
      "이 안내서를 대출할 수 있는지 알고 싶습니다. 언제까지 돌려줘야 하는지도 함께 알려주실 수 있을까요?",
      "I'd like to find out whether I may borrow this guidebook. Could you also tell me when I would be required to return it?",
    ],
  ),
  guide(
    "conversation-plans",
    [
      "날씨 때문에 달라진 만남의 장소를 확인하고, 날짜와 시각을 함께 전달해요.",
      "Check a meeting place changed by the weather and pass on the date and time together.",
    ],
    [
      "친구와 약속을 맞추고 바뀐 계획을 빠짐없이 전하고 싶은 분께 맞아요.",
      "For learners who want to make plans with a friend and explain the revised arrangements clearly.",
    ],
    ["listening", "writing", "speaking"],
    [
      "일요일에 빵집에서 만나요. 열한 시에 올 수 있나요?",
      "Let's meet at the bakery on Sunday. Can you come at eleven?",
    ],
    [
      "일요일에 빵집에서 만나는 건 어때요? 열한 시가 괜찮으세요?",
      "How about meeting at the bakery on Sunday? Would eleven work for you?",
    ],
    [
      "이번 일요일에 빵집에서 만날 생각이 있으신가요? 열한 시가 만나기 편한 시간인지 궁금합니다.",
      "Would you be interested in meeting at the bakery this Sunday? I'm wondering whether eleven would be a convenient time for you.",
    ],
  ),
  guide(
    "sentence-requests",
    [
      "도와달라는 부탁과 물건을 빌리는 요청을 문장으로 만들고 직접 말해요.",
      "Build and say requests for help and for borrowing an item.",
    ],
    [
      "단어는 떠오르지만 부탁하는 문장의 순서를 잡기 어려운 분께 맞아요.",
      "For learners who know the words but want support arranging them into a request.",
    ],
    ["writing", "speaking"],
    [
      "이 가방을 옮기는 일을 도와주세요. 문 옆에 놓아주세요.",
      "Please help me carry this bag. Put it by the door.",
    ],
    [
      "이 가방을 옮기는 일을 도와주실 수 있나요? 문 옆에 놓고 싶습니다.",
      "Could you help me carry this bag? I'd like to leave it by the door.",
    ],
    [
      "이 가방을 옮길 때 손을 좀 보태주실 수 있을까요? 문 옆에 놓아주시면 감사하겠습니다.",
      "Could you give me a hand with carrying this bag? I'd appreciate it if you could place it by the door.",
    ],
  ),
  guide(
    "sentence-directions",
    [
      "장소의 위치와 가는 길을 설명하고, 대신 이용할 길을 제안해요.",
      "Describe where a place is and how to get there, and suggest an alternative route.",
    ],
    [
      "위치와 방향을 말할 때 표현을 어떤 순서로 놓을지 연습하고 싶은 분께 맞아요.",
      "For learners who want to practise arranging phrases about locations and directions.",
    ],
    ["writing", "speaking"],
    [
      "박물관은 호텔 맞은편에 있어요. 곧장 가면 도착해요.",
      "The museum is opposite the hotel. Go straight to reach it.",
    ],
    [
      "박물관은 호텔 맞은편에서 찾을 수 있어요. 도착할 때까지 곧장 가세요.",
      "You'll find the museum opposite the hotel. Keep going straight until you get there.",
    ],
    [
      "박물관은 호텔을 마주 보는 쪽에 있습니다. 계속 곧장 가면 박물관에 도착할 수 있어요.",
      "The museum is on the side directly opposite the hotel. If you continue straight ahead, you'll arrive there.",
    ],
  ),
  guide(
    "sentence-plans",
    [
      "날짜와 시각을 넣어 약속을 정하고, 다른 시간을 제안하거나 연락을 부탁해요.",
      "Use dates and times to make plans, suggest a different time, or ask someone to keep you informed.",
    ],
    [
      "시간 표현을 문장에 넣는 순서부터 차근차근 연습하고 싶은 분께 맞아요.",
      "For learners who want to practise where time expressions belong in a sentence.",
    ],
    ["writing", "speaking"],
    [
      "수요일에 만날 수 있나요? 다섯 시에 시작해요.",
      "Can we meet on Wednesday? Let's start at five.",
    ],
    [
      "수요일에 만날 시간이 있으세요? 다섯 시에 시작하면 좋겠습니다.",
      "Would you be free to meet on Wednesday? I'd suggest starting at five.",
    ],
    [
      "우리가 만날 날을 수요일로 정할 수 있을까요? 제 생각에는 다섯 시에 시작하는 것이 좋겠습니다.",
      "Would it be possible for us to arrange a meeting on Wednesday? My suggestion would be to begin at five.",
    ],
  ),
  guide(
    "sentence-clarify",
    [
      "잘 못 들은 말은 다시 부탁하고, 내가 이해한 뜻이 맞는지 확인해요.",
      "Ask to hear something again and check whether you understood it correctly.",
    ],
    [
      "대화가 끊겼을 때 쓸 수 있는 되묻기 표현을 익히고 싶은 분께 맞아요.",
      "For learners who want useful clarification phrases when a conversation becomes unclear.",
    ],
    ["writing", "speaking"],
    [
      "서쪽 입구를 뜻하나요? 다시 말해주세요.",
      "Do you mean the west entrance? Please say that again.",
    ],
    [
      "서쪽 입구를 말씀하시는 건가요? 한 번 더 말해주실 수 있나요?",
      "Did you mean the west entrance? Could you say that once more?",
    ],
    [
      "말씀하신 곳이 서쪽 입구인지 확인해도 될까요? 그 부분을 한 번 더 말씀해주시면 좋겠습니다.",
      "Could I check whether you were referring to the west entrance? I'd appreciate hearing that part once more.",
    ],
  ),
  guide(
    "sentence-preferences",
    [
      "원하는 것과 더 마음에 드는 선택을 말하고, 빼거나 더하고 싶은 조건을 덧붙여요.",
      "State what you want or prefer and add a condition about what to include or leave out.",
    ],
    [
      "주문이나 선택에서 내 취향을 짧게 표현해보고 싶은 분께 맞아요.",
      "For learners who want to express a preference briefly when ordering or choosing something.",
    ],
    ["writing", "speaking"],
    [
      "따뜻한 샌드위치를 먹고 싶어요. 토마토는 빼주세요.",
      "I'd like a warm sandwich. Please leave out the tomato.",
    ],
    [
      "따뜻한 샌드위치 하나 부탁드려도 될까요? 토마토 없이 먹는 쪽이 좋겠어요.",
      "Could I have a warm sandwich, please? I'd prefer it without tomato.",
    ],
    [
      "따뜻하게 준비한 샌드위치를 먹고 싶습니다. 토마토를 전혀 넣지 않은 샌드위치가 제 취향에 맞겠어요.",
      "I'd like a sandwich served warm, please. My preference would be for it to come without any tomato.",
    ],
  ),
  guide(
    "sentence-reasons",
    [
      "왜 그렇게 할지 이유를 말하고, 가능한 다른 방법을 덧붙여요.",
      "Explain why you suggest an action and add an alternative that is possible.",
    ],
    [
      "짧은 답에서 한 걸음 더 나아가 이유와 대안을 연결하고 싶은 분께 맞아요.",
      "For learners who want to connect a short answer with a reason and an alternative.",
    ],
    ["writing", "speaking"],
    [
      "홀 안이 시끄러우니 밖에서 이야기해요. 벤치에 앉을 수 있어요.",
      "The hall is noisy, so let's talk outside. We can sit on the bench.",
    ],
    [
      "홀 안이 시끄러워서 밖에서 이야기하면 좋겠어요. 벤치에 앉아도 되겠네요.",
      "I'd suggest that we talk outside because the hall is noisy. We could sit on the bench.",
    ],
    [
      "홀 안에 소음이 많으니 밖에서 대화를 이어가자고 제안합니다. 앉을 곳으로는 벤치를 이용할 수 있겠어요.",
      "Since there's a lot of noise in the hall, I'd suggest continuing our conversation outside. We could use the bench as a place to sit.",
    ],
  ),
  guide(
    "sentence-relationships",
    [
      "문장에서 바라는 사람, 행동할 사람, 물건을 받는 사람을 구별해 부탁을 정확히 써요.",
      "Distinguish who wants an action, who is asked to perform it, and who receives an item, then write a clear request.",
    ],
    [
      "단어 뜻은 알아도 누가 누구에게 무엇을 하는지 헷갈리는 분께 맞아요.",
      "For learners who understand the words but want to clarify who does what to whom.",
    ],
    ["reading", "listening", "writing"],
    [
      "미나가 레오에게 창문을 열어달라고 부탁해요. 미나는 부탁하고, 레오는 열어달라는 요청을 받습니다.",
      "Mina asks Leo to open the window. Mina makes the request, and Leo is asked to open it.",
    ],
    [
      "미나가 레오에게 창문을 열어달라고 부탁하고 있습니다. 부탁하는 사람은 미나이고, 행동해달라는 요청을 받는 사람은 레오입니다.",
      "Mina is asking Leo to open the window. She makes the request, while Leo is the person being asked to act.",
    ],
    [
      "창문을 열어달라는 부탁을 하는 사람은 미나입니다. 미나가 그 행동을 해달라고 요청하는 상대는 바로 레오입니다.",
      "Mina is the person making the request that the window should be opened. It is Leo whom she is asking to carry out that action.",
    ],
  ),
  guide(
    "reading-repair",
    [
      "수리 안내의 비용과 허락 조건을 읽고, 작업 전에 알려달라는 부탁을 전해요.",
      "Read the cost and permission conditions in repair information, then ask to be informed before work begins.",
    ],
    [
      "짧은 생활 글을 읽고 필요한 부탁을 써보거나 말해보고 싶은 분께 맞아요.",
      "For learners who want to read a short everyday text and turn it into a written or spoken request.",
    ],
    ["reading", "listening", "writing", "speaking"],
    [
      "제 램프가 작동하지 않아요. 수리하기 전에 비용을 알려주세요.",
      "My lamp does not work. Please tell me the cost before repairing it.",
    ],
    [
      "제 램프가 고장 났습니다. 수리를 시작하기 전에 비용이 얼마인지 알려주실 수 있나요?",
      "My lamp has stopped working. Could you let me know the repair cost before starting?",
    ],
    [
      "제 램프가 제대로 작동하지 않고 있습니다. 수리 작업을 진행하기 전에 비용이 얼마가 될지 먼저 알려주실 수 있을까요?",
      "My lamp is no longer working as it should. Before you carry out any repair on it, could you please tell me what the work would cost?",
    ],
  ),
  guide(
    "reading-library",
    [
      "공구 대출 안내를 읽고, 빌리는 기간과 돌려주는 방법을 확인해요.",
      "Read tool-borrowing information and check the loan period and how to return an item.",
    ],
    [
      "안내문에서 이용 조건을 찾고 다른 사람과 물건을 나누는 생각도 말해보고 싶은 분께 맞아요.",
      "For learners who want to find conditions in a notice and discuss sharing useful items.",
    ],
    ["reading", "listening", "writing", "speaking"],
    [
      "이 망원경을 사흘 동안 빌릴 수 있나요? 어떻게 돌려주면 되나요?",
      "Can I borrow this telescope for three days? How should I return it?",
    ],
    [
      "이 망원경을 사흘 동안 빌려도 괜찮을까요? 어떻게 반납해야 하는지도 알고 싶어요.",
      "Would it be possible to borrow this telescope for three days? I'd also like to know how to return it.",
    ],
    [
      "이 망원경을 사흘이라는 기간 동안 빌릴 수 있는지 알려주시겠어요? 대여한 뒤에는 어떤 방법으로 반납해야 하는지도 안내해주시면 좋겠습니다.",
      "Could you tell me whether I may borrow this telescope for a period of three days? I'd appreciate some guidance on how it should be returned afterwards.",
    ],
  ),
  guide(
    "reading-walk",
    [
      "걷기 안내에서 길의 특징과 쉬어갈 곳을 찾아, 필요한 길을 고르고 이유를 말해요.",
      "Find route features and resting places in a walking notice, then choose a route and explain why it suits the need.",
    ],
    [
      "글에서 사람마다 필요한 조건을 찾고 선택의 이유를 말해보고 싶은 분께 맞아요.",
      "For learners who want to identify different people's needs in a text and explain a choice.",
    ],
    ["reading", "listening", "writing", "speaking"],
    [
      "평평한 길을 골라요. 쉬고 싶으면 멈출 수 있어요.",
      "Let's choose a flat path. We can stop when we need a rest.",
    ],
    [
      "산책할 때 평평한 길로 가는 건 어때요? 쉬어야 할 때마다 멈추면 되겠어요.",
      "How about taking a flat path for our walk? We can stop whenever we need a rest.",
    ],
    [
      "산책길은 높낮이 없이 평평하게 이어지는 곳을 고르자고 제안합니다. 쉬어갈 필요가 있을 때마다 잠시 멈춰 쉬면 되겠어요.",
      "I suggest choosing a path that stays on level ground for our walk. Whenever we need a break, we can stop and rest.",
    ],
  ),
  guide(
    "reading-market",
    [
      "개인 용기를 쓰는 시장의 안내를 읽고, 무게를 재는 이유와 필요한 부탁을 표현해요.",
      "Read a market's information about personal containers and express a request while explaining why weight is measured.",
    ],
    [
      "생활 속 작은 선택을 영어 글로 읽고 내 생각을 나누고 싶은 분께 맞아요.",
      "For learners who want to read about an everyday choice and share their own thoughts.",
    ],
    ["reading", "listening", "writing", "speaking"],
    [
      "이 천 가방을 써도 되나요? 사과를 담아서 가져가고 싶어요.",
      "Can I use this cloth bag? I'd like to carry the apples in it.",
    ],
    [
      "이 천 가방을 사용해도 괜찮을까요? 사과를 담아 가져가고 싶습니다.",
      "Would it be all right to use this cloth bag? I'd like to put the apples in it to carry them.",
    ],
    [
      "물건을 살 때 이 천 가방을 사용해도 되는지 알려주시겠어요? 사과를 가지고 갈 수 있도록 가방 안에 담을 생각입니다.",
      "Could you let me know whether I may use this cloth bag for my purchase? I'm planning to put the apples inside it so that I can carry them.",
    ],
  ),
  guide(
    "reading-notice",
    [
      "서로 다른 날짜의 공지를 비교하고, 지금 적용되는 안내를 확인해 전해요.",
      "Compare notices with different dates, then check and explain which information currently applies.",
    ],
    [
      "날짜나 바뀐 조건을 꼼꼼히 읽고 확인하는 표현을 익히고 싶은 분께 맞아요.",
      "For learners who want to read dates and changed arrangements carefully and practise checking them.",
    ],
    ["reading", "listening", "writing", "speaking"],
    [
      "이 초대장에는 연주회가 화요일이라고 적혀 있어요. 최신 초대장인지 확인해주실 수 있나요?",
      "This invitation says the concert is on Tuesday. Can you check whether it is the latest one?",
    ],
    [
      "제가 가진 초대장은 연주회 날짜를 화요일로 안내합니다. 가장 최근에 나온 초대장이 맞는지 확인해주시겠어요?",
      "The invitation I have lists the concert for Tuesday. Could you confirm whether this is the most recent invitation?",
    ],
    [
      "제 앞에 놓인 초대장에 따르면 연주회는 화요일로 예정돼 있습니다. 그 안내를 따르기 전에 더 새로 나온 초대장이 있는지 확인해주실 수 있을까요?",
      "According to the invitation in front of me, the concert is scheduled for Tuesday. Before I rely on that information, could you check whether a newer invitation has been issued?",
    ],
  ),
  guide(
    "reading-quiet",
    [
      "공간마다 정해진 이용 조건을 읽고, 내 활동에 맞는 방을 예약하는 부탁을 해요.",
      "Read the conditions for different spaces and request a room suited to your activity.",
    ],
    [
      "조용한 공간과 대화할 공간을 구별하며 예약 표현도 연습하고 싶은 분께 맞아요.",
      "For learners who want to distinguish quiet spaces from conversation spaces and practise booking one.",
    ],
    ["reading", "listening", "writing", "speaking"],
    [
      "영상 통화를 할 방이 필요해요. 방 하나를 예약할 수 있나요?",
      "I'd like a room for a video call. Can I book one?",
    ],
    [
      "영상 통화를 할 방을 예약해도 될까요? 예약이 가능한지 먼저 확인하고 싶어요.",
      "Could I reserve a room for a video call? I'd like to check whether a booking is possible.",
    ],
    [
      "영상 통화에 참여할 수 있는 별도 방을 마련하고 싶습니다. 그런 방을 하나 예약하는 것이 가능한지 알려주시겠어요?",
      "I'd like to arrange a separate room where I can take part in a video call. Could you let me know whether it is possible to book one?",
    ],
  ),
];

export function getEnglishContentGuide(contentId: string): EnglishContentGuide | undefined {
  return englishContentGuides.find((item) => item.contentId === contentId);
}
