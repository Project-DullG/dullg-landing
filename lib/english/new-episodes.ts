import type {
  EnglishChapter,
  EnglishEpisode,
  EnglishExpression,
  EnglishLevel,
  EnglishTask,
  TaskVersion,
} from "./types.ts";

type Bilingual = [string, string];
type Three<T> = [T, T, T];
const levels: EnglishLevel[] = ["starter", "standard", "challenge"];
export const newEnglishStoryTranslations: Record<string, string> = {};
function text([ko, en]: Bilingual) {
  const previous = newEnglishStoryTranslations[ko];
  if (previous && previous !== en) throw new Error(`Conflicting story translation: ${ko}`);
  newEnglishStoryTranslations[ko] = en;
  return ko;
}
function choices(
  passages: Three<Bilingual>,
  prompt: Bilingual,
  answers: Three<string>,
  correct: 0 | 1 | 2,
): Record<EnglishLevel, TaskVersion> {
  return Object.fromEntries(
    levels.map((level, index) => [
      level,
      {
        passage: passages[index][1],
        translation: text(passages[index]),
        prompt: text(prompt),
        options: answers.map((answer, i) => ({ id: ["a", "b", "c"][i], text: answer })),
        correctOption: ["a", "b", "c"][correct],
        model: answers[correct],
      },
    ]),
  ) as Record<EnglishLevel, TaskVersion>;
}
function outputs(
  passages: Three<Bilingual>,
  prompt: Bilingual,
  models: Three<string>,
  keywords?: Three<string[][]>,
  alternatives: Three<string[]> = [[], [], []],
): Record<EnglishLevel, TaskVersion> {
  return Object.fromEntries(
    levels.map((level, index) => [
      level,
      {
        passage: passages[index][1],
        translation: text(passages[index]),
        prompt: text(prompt),
        model: models[index],
        accepted: [models[index], ...alternatives[index]],
        ...(keywords ? { keywords: keywords[index] } : {}),
        ...(level === "starter"
          ? { starter: models[0].split(" ").slice(0, 3).join(" ") + "…" }
          : {}),
      },
    ]),
  ) as Record<EnglishLevel, TaskVersion>;
}
type TaskSpec = Omit<
  EnglishTask,
  "title" | "context" | "document" | "speaker" | "feedback" | "consequence"
> & {
  title: Bilingual;
  context: Bilingual;
  document: Bilingual;
  speaker?: Bilingual;
  feedback: Bilingual;
  consequence: Bilingual;
};
function task(spec: TaskSpec): EnglishTask {
  const { speaker, ...rest } = spec;
  return {
    ...rest,
    title: text(spec.title),
    context: text(spec.context),
    document: text(spec.document),
    ...(speaker ? { speaker: text(speaker) } : {}),
    feedback: text(spec.feedback),
    consequence: text(spec.consequence),
  };
}
function expression(
  id: string,
  en: string,
  ko: string,
  recall: Bilingual,
  alternatives: string[] = [],
): EnglishExpression {
  return { id, en, ko: text([ko, en]), recall: text(recall), accepted: [en, ...alternatives] };
}
function chapter(
  id: string,
  title: Bilingual,
  location: Bilingual,
  objective: Bilingual,
  story: Bilingual,
  image: string,
  imageAlt: Bilingual,
  dialogue: { speaker: string; en: string; ko: string }[],
): EnglishChapter {
  return {
    id,
    title: text(title),
    location: text(location),
    objective: text(objective),
    story: text(story),
    storyEn: story[1],
    image,
    imageAlt: text(imageAlt),
    dialogue: dialogue.map((line) => ({ ...line, ko: text([line.ko, line.en]) })),
  };
}
const cafeImage = "/assets/english/cafe.webp",
  cafeGathering = "/assets/english/cafe-gathering.webp";
const cafe: EnglishEpisode = {
  id: "raincheck-cafe",
  title: text(["비 오는 날, 카페에서", "A Rainy Day at the Café"]),
  englishTitle: "A Rainy Day at the Café",
  genre: "everyday",
  genreLabel: text(["일상 · 함께 만드는 회화", "Everyday · Conversation together"]),
  minutes: 26,
  image: cafeImage,
  imageAlt: text([
    "비 내리는 동네 카페에서 새 직원과 손님이 모임 안내를 함께 살펴보는 애니메이션 장면",
    "An animated scene of a new café assistant and a guest planning a gathering while rain falls outside",
  ]),
  accent: "#d4a66d",
  synopsis: text([
    "공원에서 열려던 낭독 모임에 비가 내렸어요. 카페에 자리를 마련하고, 여섯 사람의 주문과 약속 시간을 챙겨 주세요.",
    "A reading circle nearly cancelled by rain. Correct its booking and respect each guest's needs to create a welcoming space for six.",
  ]),
  intro: text([
    "낭독 모임을 앞두고 비가 쏟아집니다. 첫 근무를 시작한 레오는 젖은 책가방을 안고 들어오는 준을 봅니다. 공원에서 만나려던 사람들이 비를 피할 곳을 찾고 있다고 해요. 매니저 마야에게 자리를 물어보니 사용할 수 있는 테이블을 메모로 알려줍니다. 준이 말한 시간과 예약표가 맞는지도 아직 확인해야 합니다. 모임을 취소하지 않고 열 수 있도록, 레오와 함께 필요한 것을 하나씩 물어보세요.",
    "Rain begins before the reading circle. On his first shift, Leo sees June come in holding a wet book bag. The people who planned to meet in the park need somewhere out of the rain. Maya gives him a note about a table they may use, but he still needs to check that June's times agree with the booking. Help Leo ask for the information needed to keep the gathering from being cancelled.",
  ]),
  ending: text([
    "오후 4시, 뒤쪽 창가에 여섯 사람이 둘러앉습니다. 물 세 잔과 레모네이드 두 잔이 놓이고, 노라는 자기 간식과 물병을 꺼냅니다. 확인할 수 없었던 카페 간식은 테이블에 놓지 않았어요. 샘도 바뀐 장소를 전해 듣고 제시간에 왔습니다. 낭독이 시작되자 준이 레오에게 웃으며 고맙다고 말합니다. 처음에는 빨리 자리를 내주는 게 전부인 줄 알았던 레오도 이제 압니다. 인원과 시간을 확인하고, 모르는 건 묻고, 각자의 선택을 받아줘야 함께 앉을 수 있다는 것을요. 레오는 다음 주문을 받기 전에 먼저 질문할 준비를 합니다.",
    "At four, six people sit at the back window table. The table has three waters and two lemonades; Nora takes out her own snack and bottle. The café snacks whose preparation could not be verified stay off the table. Sam arrives on time after hearing the change of location. As the reading begins, June smiles and thanks Leo. At first, he thought finding a table quickly was the whole job. Now he knows that checking numbers and times, asking when unsure, and respecting each person's choice are what let everyone sit together. He is ready to ask a question before taking the next order.",
  ]),
  takeaway: text([
    "인원과 시간을 따로 확인하고, 바뀐 예약과 주문을 분명히 전해요. 모르는 조건은 물어본 뒤, 손님의 선택을 받아주는 말도 건넵니다.",
    "Check numbers and times separately, explain changes to bookings and orders, ask about uncertain conditions, and respond respectfully to a guest's choice.",
  ]),
  cast: [
    {
      name: "Leo",
      role: text(["카페에서 첫 근무를 시작한 직원", "A café assistant on his first shift"]),
      motivation: text([
        "첫 근무라 빨리 답하고 싶지만, 모르는 것은 마야에게 물어보려 합니다. 손님이 필요한 말을 꺼내기 편한 직원이 되고 싶어요.",
        "On his first shift he wants to answer quickly, but checks with Maya when he is unsure. He wants guests to feel comfortable saying what they need.",
      ]),
    },
    {
      name: "June",
      role: text(["동네 낭독 모임을 이끄는 손님", "Host of the neighborhood reading circle"]),
      motivation: text([
        "비가 와도 함께 읽기로 한 약속을 지키고 싶어요. 친구마다 필요한 것을 챙겨 같은 자리에 모이려 합니다.",
        "She wants to keep the group's promise to read together despite the rain and consider what each friend needs to join them.",
      ]),
    },
    {
      name: "Maya",
      role: text(["카페 매니저", "The café manager"]),
      motivation: text([
        "모임을 반갑게 맞되 알아보지 못한 것을 괜찮다고 약속하지 않아요. 레오가 혼자 짐작하지 않고 물어봐주길 바랍니다.",
        "She wants to welcome the group without making assurances she cannot verify, and wants Leo to ask rather than guess on his own.",
      ]),
    },
  ],
  chapters: [
    chapter(
      "cafe-ch1",
      ["1장 · 모임을 어디서 열까요?", "Chapter 1 · A plan changed by rain"],
      ["카페 입구와 예약 데스크", "Café entrance and booking desk"],
      [
        "여섯 명이 앉을 자리를 찾고 예약 시간을 고쳐요.",
        "Find an approved table and correct the booking for six",
      ],
      [
        "준은 젖은 책가방을 안고 카페 문 앞에서 머뭇거립니다. 함께 읽기로 한 약속을 비 때문에 취소하고 싶지 않다고 해요. 첫 근무 중인 레오도 얼른 자리를 내주고 싶지만, 다른 손님이 예약한 테이블이나 통로를 쓸 수는 없습니다. 마야가 건넨 메모에는 사용을 허락한 자리가 적혀 있습니다. 그곳을 찾은 뒤 준에게 인원과 시간을 다시 물어보세요. 예약표의 시각이 맞는지 확인해 고쳐두면, 뒤이어 올 사람들이 기다리지 않고 함께 앉을 수 있습니다.",
        "June hesitates at the café door, holding her wet book bag. She does not want rain to cancel the group's promise to read together. Leo, on his first shift, wants to offer a place quickly, but cannot use another guest's reserved table or fill the aisle with chairs. Maya's note identifies the table she has approved. Find it, then ask June again about the number of people and the times. Checking and correcting the booking will let the others sit together when they arrive.",
      ],
      cafeImage,
      [
        "우산과 책가방을 든 손님, 예약 데스크와 뒤쪽 창가가 보이는 따뜻한 카페",
        "A warm café with a guest carrying an umbrella and book bag, a booking desk, and a back window",
      ],
      [
        {
          speaker: "June",
          en: "We still want to read together today, but it's raining too hard in the park. Could we meet inside?",
          ko: "오늘도 함께 읽고 싶은데, 공원은 비가 너무 와요. 안에서 모일 수 있을까요?",
        },
        {
          speaker: "Leo",
          en: "I'll check the place Maya noted first. Let's also make sure the booking is right.",
          ko: "마야가 적어준 자리를 먼저 볼게요. 예약표도 맞는지 함께 확인해요.",
        },
        {
          speaker: "June",
          en: "Thank you. I'll go over the number and times again. I don't want my friends waiting outside.",
          ko: "고마워요. 인원과 시간을 다시 말씀드릴게요. 친구들이 밖에서 기다리지 않았으면 좋겠어요.",
        },
      ],
    ),
    chapter(
      "cafe-ch2",
      ["2장 · 무엇을 준비하면 될까요?", "Chapter 2 · A drink for each guest"],
      ["카페 주문대", "Order counter and the manager's preparation notes"],
      [
        "음료 주문을 받고, 노라의 간식을 준비할 수 있는지 물어봐요.",
        "Confirm drink quantities and food preparation conditions",
      ],
      [
        "예약표를 고치자 준이 안심하고 음료 주문표를 건넵니다. 손님 수와 음료 종류를 따로 살펴 준비해야겠죠. 이어 준은 노라에게 견과류 알레르기가 있어 간식 전에 확인할 것이 있다고 말합니다. 레오는 메뉴 사진만 보고 대답하려다 마야에게 물어보기로 해요. 이 카페에서는 매니저가 확인한 내용만 알려주며, 확인하지 못하면 그 손님의 간식은 만들지 않습니다. 노라는 필요하면 자기 간식과 물병을 가져올 수 있다고 했어요. 주문부터 준비까지 이어지는 부탁을 듣고, 마야의 답을 받은 뒤 바뀐 내용을 정리해봅시다.",
        "Once the booking is corrected, June relaxes and hands over the drinks order. The number of guests and the drink types need separate attention. She then says Nora has a nut allergy and needs something checked before a snack is prepared. Leo considers replying from the menu picture, but decides to ask Maya. The café's manager reports only what can be verified; if she cannot verify the conditions, Nora's café snack will not be prepared. Nora can bring her own snack and bottle if needed. Listen to the request, ask Maya, and update the arrangements after her reply.",
      ],
      "/assets/english/cafe-counter-v2.webp",
      [
        "음료를 준비하기 전 주문 조건을 확인하는 카페 직원과 매니저",
        "A café assistant and manager checking order conditions before preparing drinks",
      ],
      [
        {
          speaker: "Leo",
          en: "I shouldn't answer just from the menu. I'll listen to what needs checking before we prepare anything.",
          ko: "제가 메뉴만 보고 답할 수는 없겠네요. 준비 전에 무엇을 확인해야 하는지 들어볼게요.",
        },
        {
          speaker: "Maya",
          en: "I'll tell you only what we can verify. If we cannot verify it, we won't prepare that snack.",
          ko: "확인할 수 있는 것만 알려줄게요. 확인이 안 되면 그 간식은 만들지 않을 거예요.",
        },
        {
          speaker: "June",
          en: "Nora said she can bring her own snack and bottle. Thank you for asking first.",
          ko: "노라도 자기 간식과 물병을 가져올 수 있다고 했어요. 먼저 물어봐줘서 고마워요.",
        },
      ],
    ),
    chapter(
      "cafe-ch3",
      ["3장 · 이제 친구들을 맞이해요.", "Chapter 3 · A place that keeps the promise"],
      ["뒤쪽 창가의 낭독 테이블", "The reading table at the back of the café"],
      [
        "샘에게 새 장소를 알려 주고, 노라가 편하게 앉을 자리를 마련해요.",
        "Send the corrected invitation and welcome each guest's choices",
      ],
      [
        "3시 20분, 바뀐 모임 안내가 올라왔습니다. 주문은 정리됐지만, 아직 공원 초대장을 보고 있는 샘에게도 새 장소를 알려야 해요. 준은 메시지를 준비하고 레오는 뒤쪽 테이블을 정리합니다. 통로를 비우고 노라의 간식과 물병을 놓을 자리도 남겨둡니다. 3시 45분부터 손님들이 들어오기 시작합니다. 노라는 자기가 가져온 것을 먹어도 되는지 한 번 더 묻습니다. 준비한 자리를 보여주며 그 선택을 받아주는 말을 해보세요. 이제 필요한 정보를 전하는 일이 사람을 편하게 맞는 일로 이어집니다.",
        "At 3:20, the updated gathering notice is posted. The order is settled, but Sam still has the park invitation and needs to hear the new location. June prepares a message while Leo tidies the back table, keeps the aisle clear, and leaves space for Nora's own snack and bottle. Guests begin arriving at 3:45. Nora asks once more whether she may use what she brought. Show her the place you have prepared and respond to her choice. Sharing the necessary information now becomes a way of making someone feel welcome.",
      ],
      cafeGathering,
      [
        "비 오는 창밖을 배경으로 책을 펼친 사람들이 함께 앉는 카페 낭독 모임",
        "A café reading circle gathered around open books with rain outside the window",
      ],
      [
        {
          speaker: "June",
          en: "We need to send Sam the updated details too. He still seems to be heading for the park.",
          ko: "샘에게도 바뀐 안내를 보내야겠어요. 아직 공원으로 가려는 것 같거든요.",
        },
        {
          speaker: "Nora",
          en: "I've brought my own snack and bottle. Would it be all right to use them here?",
          ko: "제 간식이랑 물병을 가져왔어요. 여기서 써도 괜찮을까요?",
        },
        {
          speaker: "Leo",
          en: "I'll show you the place we've prepared. Please tell me if you need anything.",
          ko: "준비해둔 자리를 보여드릴게요. 필요한 것이 있으면 말씀해주세요.",
        },
      ],
    ),
  ],
  expressions: [
    expression(
      "cafe-group",
      "There will be six of us.",
      "저희는 여섯 명이에요.",
      [
        "예약을 받을 직원에게 몇 명이 올지 알려 주세요.",
        "Tell the booking assistant how many people are in your group.",
      ],
      ["There are six of us.", "Six people will come."],
    ),
    expression(
      "cafe-reservation",
      "Could you change our reservation to four?",
      "예약 시간을 4시로 바꿔 주실 수 있나요?",
      [
        "예약 시간이 잘못 적혔어요. 4시로 바꿔 달라고 부탁하세요.",
        "The booking has the wrong start time. Ask for it to be corrected to four.",
      ],
      ["Can you change our reservation to four?", "Please change our reservation to four."],
    ),
    expression(
      "cafe-check",
      "Could you check the ingredients and equipment?",
      "재료와 조리 도구를 알아봐 주실 수 있나요?",
      [
        "간식을 만들기 전에 재료와 조리 도구를 알아봐 달라고 해 주세요.",
        "Food preparation conditions are uncertain. Ask for the ingredients and equipment to be checked.",
      ],
      [
        "Please check the ingredients and equipment.",
        "Can you check the ingredients and equipment?",
      ],
    ),
    expression(
      "cafe-own-snack",
      "I'll bring my own snack.",
      "제 간식을 가져올게요.",
      [
        "카페 간식 대신 먹을 간식을 직접 가져오겠다고 말해 주세요.",
        "You have decided not to use café snacks. Say that you will bring your own snack.",
      ],
      ["I will bring my own snack.", "I'll bring my own food."],
    ),
    expression(
      "cafe-invitation",
      "Meet us at the café at four.",
      "4시에 카페에서 만나요.",
      [
        "공원으로 가려는 친구에게 카페에서 몇 시에 만날지 알려 주세요.",
        "Tell an attendee who has the old invitation the new place and time.",
      ],
      ["Please meet us at the cafe at four.", "Meet us at the cafe at 4."],
    ),
  ],
  tasks: [
    task({
      id: "cafe-table",
      chapterId: "cafe-ch1",
      skill: "reading",
      title: ["어디에 앉을까요?", "A table needs permission"],
      context: [
        "마야가 내준 테이블이 어디인지 메모를 읽어 보세요.",
        "Find the seating Maya approved in her note.",
      ],
      document: ["좌석 안내 메모", "Seating note"],
      feedback: [
        "뒤쪽 창가 테이블에는 여덟 명이 앉을 수 있어요. 마야가 이 자리를 써도 된다고 했죠. 입구 테이블은 다른 손님이 예약했고, 통로에 의자를 놓아서는 안 됩니다.",
        "The back window table has eight seats and permission to use it. The entrance table is reserved, and chairs must not block the aisle.",
      ],
      consequence: [
        "허락받은 뒤쪽 창가 자리를 안내하자 준이 젖은 책가방을 내려놓습니다. 레오는 몇 명이 올지, 언제 시작할지 이어서 물어봅니다.",
        "Once Leo shows June the approved back window table, she sets down her wet book bag. He then asks how many people are coming and when they will begin.",
      ],
      expressionIds: ["cafe-group"],
      versions: choices(
        [
          [
            "뒤쪽 창가 테이블은 여덟 자리예요. 마야가 이 자리를 써도 된다고 했습니다. 입구 테이블은 다른 손님 예약이고, 통로는 비워 두세요.",
            "The back window table has eight seats. Maya has approved it. The entrance table is reserved. Keep the aisle clear.",
          ],
          [
            "마야의 메모: 여섯 분은 뒤쪽 창가의 여덟 자리 테이블을 쓰세요. 입구 테이블은 다른 손님이 예약했어요. 통로에 의자를 더 놓지는 마세요.",
            "Maya's note: the group of six may use the eight-seat back window table. The entrance table belongs to another booking. Do not add chairs in the aisle.",
          ],
          [
            "공원 모임을 카페로 옮겨도 다른 손님이 예약한 자리는 지켜야 해요. 마야가 뒤쪽 창가의 여덟 자리 테이블을 내주었습니다. 입구 테이블은 다른 모임 예약이고, 여분 의자로 통로를 막아서는 안 됩니다.",
            "Moving the park circle indoors does not cancel existing bookings. Maya has approved the eight-seat table by the back window. The entrance area is reserved for another group, and extra chairs must not obstruct the aisle.",
          ],
        ],
        ["여섯 명이 앉을 자리는 어디일까요?", "Where should you seat the group of six?"],
        [
          "At the reserved entrance table.",
          "At the approved back window table.",
          "In the aisle with extra chairs.",
        ],
        1,
      ),
    }),
    task({
      id: "cafe-count-time",
      chapterId: "cafe-ch1",
      skill: "listening",
      title: ["몇 명이, 몇 시에?", "June's plan"],
      context: [
        "준의 말을 듣고 모임 인원과 시작 시간을 알아보세요.",
        "Listen to June and confirm both the starting time and group size.",
      ],
      document: ["준의 모임 설명", "June's gathering details"],
      speaker: ["준 · 모임 진행자", "June · Circle host"],
      feedback: [
        "준까지 모두 여섯 명이에요. 4시에 시작해서 5시에 끝납니다. 예약표의 5시는 시작이 아니라 끝나는 시간이었어요.",
        "There are six people including June. They start at four and finish at five. Five on the booking is not the start time.",
      ],
      consequence: [
        "레오가 “여섯 명, 오후 4시”라고 적습니다. 예약표에 끝나는 시간이 잘못 옮겨 적힌 걸 알아챘어요.",
        "Leo notes six people at four and spots the booking error.",
      ],
      expressionIds: ["cafe-group", "cafe-reservation"],
      versions: choices(
        [
          [
            "저까지 여섯 명이에요. 4시에 시작해서 5시에 끝나요.",
            "There are six of us, including me. We start at four and finish at five.",
          ],
          [
            "저랑 다섯 명이 더 와요. 낭독은 오후 4시에 시작해서 한 시간 동안 할 거예요. 예약표에는 5시라고 되어 있어도 시작은 4시예요.",
            "Five other people are coming with me. The reading starts at four this afternoon and lasts an hour. Even if the booking says five, our start time is four.",
          ],
          [
            "저까지 모두 여섯 명이고, 4시부터 5시까지 읽을 거예요. 예약 메시지에는 5시에 시작한다고 되어 있네요. 끝나는 시간을 시작하는 칸에 잘못 적은 것 같아요.",
            "Including me, the total is six, and the reading runs from four to five. The booking confirmation lists a five o'clock start; I think our finishing time was copied into the start-time box.",
          ],
        ],
        [
          "예약표에 적을 인원과 시작 시간은?",
          "Which group size and start time belong on the booking?",
        ],
        ["Five people at four.", "Six people at five.", "Six people at four."],
        2,
      ),
    }),
    task({
      id: "cafe-correct-booking",
      chapterId: "cafe-ch1",
      skill: "writing",
      title: ["예약 시간을 고쳐 주세요.", "Correct the booking"],
      context: [
        "준을 대신해서 예약 시간을 고쳐 달라는 메시지를 써 주세요.",
        "Write a message requesting the corrected start time for June.",
      ],
      document: ["예약 정정 메시지", "Booking correction message"],
      feedback: [
        "예약을 4시로 바꿔 달라고 말해요. 기본 난이도에서는 여섯 명이라는 정보도 넣고, 도전에서는 5시가 끝나는 시간이라고 덧붙여 주세요. 이 단계는 메시지에 필요한 정보가 들어 있는지 살펴보며, 문법 전반을 채점하지는 않아요.",
        "The booking and four o'clock are essential. Standard also includes six guests; challenge explains that five is the finishing time. This does not assess all grammar.",
      ],
      consequence: [
        "예약표를 “여섯 명, 4시부터 5시까지”로 고칩니다. 준은 친구들이 같은 시간에 앉을 수 있겠다며 안심하고 음료 주문표를 건넵니다.",
        "The booking is corrected to six people from four to five. June is relieved that her friends can sit down together and hands over the drinks order.",
      ],
      expressionIds: ["cafe-group", "cafe-reservation"],
      versions: outputs(
        [
          [
            "예약표에는 5시라고 적혀 있지만, 모임은 4시에 시작해요. 4시로 바꿔 달라고 부탁하세요.",
            "The booking says five. The circle starts at four. Ask for the reservation to be changed to four.",
          ],
          [
            "여섯 명이 낭독 모임에 옵니다. 예약 시간을 5시에서 4시로 고쳐 달라고 부탁하세요.",
            "Six people are coming to the reading circle. Ask for its booked start time to change from five to four.",
          ],
          [
            "직원이 끝나는 시간인 5시를 시작 시간으로 적었어요. 모임은 여섯 명, 4시부터 5시까지입니다. 왜 잘못 적혔는지 설명하고 시간을 고쳐 달라고 말해 주세요.",
            "The booking assistant copied the finishing time, five, into the start-time field. There are six guests; the circle starts at four and ends at five. Explain the error and request the correction.",
          ],
        ],
        [
          "예약 시간을 고쳐 달라고 영어로 부탁해 보세요.",
          "Write an English message correcting the booking's start time.",
        ],
        [
          "Please change our reservation to four.",
          "Please change our reservation to four for six people.",
          "Please change our reservation to four for six people. Five is our finishing time.",
        ],
        [
          [
            ["reservation", "booking"],
            ["change", "correct"],
            ["four", "4"],
          ],
          [
            ["reservation", "booking"],
            ["change", "correct"],
            ["four", "4"],
            ["six", "6"],
          ],
          [
            ["reservation", "booking"],
            ["change", "correct"],
            ["four", "4"],
            ["six", "6"],
            ["five", "5"],
            ["finish", "finishing", "ends", "end"],
          ],
        ],
        [
          ["Could you change our booking to 4?"],
          ["Could you correct our booking to 4 for 6 people?"],
          ["Could you change our booking to 4 for 6 people? We finish at 5."],
        ],
      ),
    }),
    task({
      id: "cafe-drinks",
      chapterId: "cafe-ch2",
      skill: "reading",
      title: ["음료는 모두 몇 잔일까요?", "Drinks for six"],
      context: [
        "준이 적어 준 주문표에서 음료 종류와 잔 수를 읽어 보세요.",
        "Check the drink types and quantities on June's order.",
      ],
      document: ["모임 음료 주문표", "Circle drink order"],
      feedback: [
        "물 네 잔에 레모네이드 두 잔, 모두 여섯 잔이에요. 손님이 여섯 명이라고 각 음료를 여섯 잔씩 준비하는 건 아니죠.",
        "Four waters and two lemonades make the six drinks ordered. The group size is not the quantity of each drink.",
      ],
      consequence: [
        "레오가 물 네 잔과 레모네이드 두 잔을 적습니다. 준이 간식에 대해 부탁할 것이 있다고 말해요.",
        "Leo records four waters and two lemonades. June brings up a separate food preparation request.",
      ],
      expressionIds: ["cafe-group"],
      versions: choices(
        [
          [
            "모임 인원: 여섯 명. 음료 주문: 물 네 잔, 레모네이드 두 잔.",
            "Circle: six people. Drinks: four waters and two lemonades.",
          ],
          [
            "여섯 명의 주문표에 물 4잔과 레모네이드 2잔이 적혀 있어요. “여섯 명”은 손님 수예요. 음료를 각각 여섯 잔씩 주문한 건 아닙니다.",
            "The order for six lists four waters and two lemonades. Six is the total number of guests, not the quantity of each drink.",
          ],
          [
            "음료 주문: 여섯 분이 물 네 잔과 레모네이드 두 잔을 원합니다. 각 음료를 여섯 잔씩 주문한 것이 아니에요. 간식 칸은 준비할 수 있는지 알아보는 중이라 아직 비어 있습니다.",
            "Confirmed order: six guests in total, with four waters and two lemonades. The group has not ordered six of each drink. The snack section remains blank while preparation conditions are checked.",
          ],
        ],
        ["주문표대로 준비한 음료는?", "Which drink preparation matches the order?"],
        [
          "Four waters and two lemonades.",
          "Six waters and six lemonades.",
          "Two waters and four lemonades.",
        ],
        0,
      ),
    }),
    task({
      id: "cafe-food-request",
      chapterId: "cafe-ch2",
      skill: "listening",
      title: ["짐작하지 말고 물어봐요.", "Check instead of assuming"],
      context: [
        "준이 노라의 부탁을 전해 줍니다. 간식을 만들기 전에 무엇을 알아봐야 할까요?",
        "Listen to Nora's request through June and the café's checking procedure.",
      ],
      document: ["간식을 만들기 전에 물어볼 것", "Food preparation request"],
      speaker: ["준 · 손님의 요청 전달", "June · Passing on a guest's request"],
      feedback: [
        "재료와 다른 음식에도 함께 쓰는 조리 도구를 마야에게 물어봐야 해요. 토핑을 빼거나 메뉴 사진을 보는 것만으로는 알 수 없습니다. 확인할 수 없다면 노라의 간식은 만들지 않아요.",
        "Ask the manager to check ingredients and shared equipment. Removing a topping or looking at a menu picture does not verify those conditions. If unverified, do not prepare a café snack for Nora.",
      ],
      consequence: [
        "레오는 간식을 먼저 권하지 않고 마야에게 재료와 조리 도구를 물어보기로 합니다.",
        "Leo decides to ask Maya about preparation rather than recommending a snack on his own.",
      ],
      expressionIds: ["cafe-check"],
      versions: choices(
        [
          [
            "노라에게 견과류 알레르기가 있어요. 마야에게 재료와 함께 쓰는 조리 도구를 알아봐 달라고 해 주세요. 확인할 수 없다면 간식은 만들지 마세요.",
            "Nora has a nut allergy. Please check ingredients and shared equipment with Maya. If they cannot be verified, do not prepare a snack.",
          ],
          [
            "노라는 견과류 알레르기가 있어서 간식을 만들기 전에 알아봐 달라고 했어요. 매니저에게 재료와 다른 음식에도 쓰는 조리 도구를 물어보세요. 확인할 수 없으면 노라의 간식은 만들지 말아 주세요.",
            "Nora asked us to check food preparation first because she has a nut allergy. Following the café's procedure, ask the manager to verify ingredients and shared equipment; if that cannot be done, please do not prepare her snack.",
          ],
          [
            "노라에게 견과류 알레르기가 있어요. 토핑을 빼면 괜찮을 거라고 짐작하면 안 됩니다. 매니저에게 재료와 다른 음식에도 함께 쓰는 조리 도구를 알아봐 달라고 해 주세요. 카페에서 그 과정을 확인할 수 없다면 노라의 간식은 만들지 않고, 알아본 내용을 그대로 전해야 합니다.",
            "Nora has a nut allergy, so we must not assume that removing a topping settles the issue. Ask the manager about ingredients and shared equipment. If the café's verification procedure cannot be completed, we do not prepare a snack for that guest and communicate the result honestly.",
          ],
        ],
        ["간식을 만들기 전에 레오가 할 일은?", "What should Leo do before preparing a snack?"],
        [
          "Remove the topping and promise it is fine.",
          "Ask Maya to verify ingredients and shared equipment.",
          "Choose the snack with the simplest menu picture.",
        ],
        1,
      ),
    }),
    task({
      id: "cafe-check-message",
      chapterId: "cafe-ch2",
      skill: "writing",
      title: ["마야에게 부탁해요.", "Two checks for the manager"],
      context: [
        "재료와 조리 도구를 알아봐 달라고 부탁하세요. 확인할 수 없으면 간식을 만들지 말아 달라는 말도 전해요.",
        "Write a request to check ingredients and equipment and avoid preparation if unverified.",
      ],
      document: ["마야에게 남기는 부탁", "Preparation message to Maya"],
      feedback: [
        "ingredients와 equipment, 두 가지를 모두 물어봐야 해요. 기본과 도전에서는 확인할 수 없을 때 간식을 만들지 말아 달라는 부탁도 넣어 주세요. 이 연습으로 음식의 알레르기 안전성을 판단하는 것은 아닙니다.",
        "The request needs both ingredients and equipment. Standard and challenge also communicate the condition not to prepare food if unverified. This task does not determine whether any food is safe for an allergy.",
      ],
      consequence: [
        "마야가 재료와 함께 쓰는 조리 도구를 알아보러 갑니다. 레오에게는 확인한 내용만 답하겠다고 말합니다.",
        "Maya goes to check the ingredients and shared equipment. She tells Leo she will report only what she can verify.",
      ],
      expressionIds: ["cafe-check"],
      versions: outputs(
        [
          [
            "마야에게 재료와 조리 도구를 알아봐 달라고 부탁하세요. 카페에서는 확인할 수 없으면 간식을 만들지 않습니다.",
            "Ask Maya to check the ingredients and equipment. Under the café's procedure, unverified conditions mean no snack preparation.",
          ],
          [
            "재료와 공용 조리 도구를 알아봐 달라고 해 주세요. 확인할 수 없다면 간식을 만들지 말아 달라는 부탁도 적어요.",
            "The items to check are ingredients and shared equipment. Include the condition not to prepare a snack if they cannot be verified.",
          ],
          [
            "노라의 부탁을 마야에게 전해 주세요. 재료와 함께 쓰는 조리 도구를 알아보고, 확인할 수 없으면 노라의 간식을 만들지 않아야 합니다. 토핑만 빼면 괜찮을 거라고 말하지 마세요.",
            "Pass Nora's request to the manager. Verify the ingredients and shared equipment, and do not prepare her snack if they cannot be confirmed. Removing a topping alone must not be treated as verification.",
          ],
        ],
        [
          "마야에게 무엇을 알아봐 달라고 할까요? 영어로 써 보세요.",
          "Tell Maya the checks and necessary conditions in English.",
        ],
        [
          "Please check the ingredients and equipment.",
          "Please check the ingredients and equipment. If you cannot confirm them, do not prepare a snack.",
          "Nora has a nut allergy. Please check the ingredients and shared equipment. If you cannot confirm them, do not prepare her snack.",
        ],
        [
          [["check", "verify"], ["ingredients"], ["equipment"]],
          [
            ["check", "verify"],
            ["ingredients"],
            ["equipment"],
            ["confirm", "verify"],
            ["do not prepare", "don't prepare", "will not prepare"],
          ],
          [
            ["nora"],
            ["allergy"],
            ["check", "verify"],
            ["ingredients"],
            ["equipment"],
            ["confirm", "verify"],
            ["do not prepare", "don't prepare", "will not prepare"],
          ],
        ],
        [
          ["Could you check the ingredients and equipment?"],
          [
            "Verify the ingredients and equipment. If you cannot confirm them, don't prepare a snack.",
          ],
          [
            "Nora has a nut allergy. Verify the ingredients and shared equipment. If you cannot confirm them, don't prepare her snack.",
          ],
        ],
      ),
    }),
    task({
      id: "cafe-manager-result",
      chapterId: "cafe-ch2",
      skill: "listening",
      title: ["마야의 답을 듣고", "An honest limit"],
      context: [
        "마야가 무엇을 알아냈는지 들어 보세요. 그 답에 맞게 노라의 자리를 준비해요.",
        "Listen to Maya's findings and choose an arrangement that respects Nora's choice.",
      ],
      document: ["마야가 알아본 내용", "Manager's preparation result"],
      speaker: ["마야 · 카페 매니저", "Maya · Café manager"],
      feedback: [
        "마야는 공용 조리 도구 사용을 확인할 수 없다고 했어요. 그래서 노라의 카페 간식은 만들지 않습니다. 노라는 자기 간식과 물병을 쓰고, 모임 테이블에도 카페 간식을 놓지 않아요.",
        "Maya cannot verify shared equipment use. She therefore does not prepare Nora's café snack. Nora uses her own snack and bottle, and café snacks stay off the circle's table.",
      ],
      consequence: [
        "노라의 카페 간식은 준비하지 않기로 합니다. 물은 세 잔으로 바꾸고, 노라가 가져올 간식과 물병을 놓을 자리를 남겨둡니다. 모르는 것을 약속하지 않고도 손님을 맞을 수 있습니다.",
        "Nora's café snack will not be prepared. The water order changes to three, and space is left for her own snack and bottle. They can still welcome her without making an assurance they cannot verify.",
      ],
      expressionIds: ["cafe-own-snack"],
      versions: choices(
        [
          [
            "오늘 제과에 함께 쓴 조리 도구를 확인할 수 없었어요. 노라의 간식은 만들지 않을게요. 노라는 자기 간식과 물병을 가져오기로 했어요. 물 주문은 네 잔에서 세 잔으로 바꾸고, 모임 테이블에는 카페 간식을 놓지 마세요.",
            "I can't verify the shared bakery equipment today. We won't prepare Nora's snack. She will bring her own snack and bottle. Change the water order from four to three. Keep café snacks off this circle's table.",
          ],
          [
            "제과에 함께 쓴 조리 도구를 확인할 수 없어서 노라의 간식은 만들지 않을 거예요. 준이 이 말을 전했고, 노라는 자기 간식과 물병을 쓰기로 했습니다. 물 주문은 네 잔에서 세 잔으로 바꿔 주세요. 모임 테이블에는 카페 간식을 놓지 마세요.",
            "Because I cannot verify the shared bakery equipment, we will not prepare Nora's snack. June has told her, and Nora has chosen to use her own snack and bottle. Please correct the water order from four to three. Please do not serve café snacks at the circle's table.",
          ],
          [
            "오늘 간식을 만들 때 공용 조리 도구를 어떻게 썼는지 확인할 수 없었어요. 카페 규칙대로 노라의 간식은 만들지 않습니다. 토핑을 빼면 괜찮다고 권하지도 않을 거예요. 노라가 가져올 간식과 물병을 놓을 자리를 남기고, 물 주문을 네 잔에서 세 잔으로 바꿔 주세요. 모임 테이블에는 카페 간식을 놓지 마세요.",
            "I was unable to verify the conditions of today's shared bakery equipment. Following our procedure, we will not prepare a snack for Nora or suggest that removing a topping solves the uncertainty. Leave room for her chosen snack and bottle, correct the water order from four to three, and keep café snacks off the gathering table.",
          ],
        ],
        ["마야의 답을 듣고 어떻게 준비할까요?", "Which preparation follows the result?"],
        [
          "Serve a café snack after removing its topping.",
          "Ask Nora to eat a café snack to avoid awkwardness.",
          "Leave space for her own snack and bottle; keep café snacks off the table.",
        ],
        2,
      ),
    }),
    task({
      id: "cafe-invitation-note",
      chapterId: "cafe-ch3",
      skill: "reading",
      title: ["바뀐 장소를 알려요.", "Two facts on the new invitation"],
      context: [
        "3시 20분에 올라온 새 안내에서 장소와 시작 시간을 찾아보세요.",
        "Check the venue and start time on the notice posted at 3:20.",
      ],
      document: ["오늘의 수정 초대장 · 오후 3시 20분", "Today's revised invitation · 3:20 p.m."],
      feedback: [
        "모임은 레인체크 카페에서 오후 4시에 시작해요. 공원은 원래 장소이고, 5시는 끝나는 시간입니다.",
        "The revised venue is Raincheck Café and the start is four. The park is the old venue; five is the finishing time.",
      ],
      consequence: [
        "준이 샘에게 보낼 메시지에 “레인체크 카페, 오후 4시”라고 적습니다.",
        "June puts Raincheck Café and four into the invitation for Sam.",
      ],
      expressionIds: ["cafe-invitation"],
      versions: choices(
        [
          [
            "바뀐 안내 · 오늘 오후 3시 20분. 낭독 모임은 레인체크 카페에서 오후 4시에 시작해요. 끝나는 시간은 5시입니다. 공원에서 하려던 모임을 실내로 옮겼어요.",
            "Updated notice · today, 3:20 p.m. The circle starts at Raincheck Café at 4 p.m. It ends at 5. The park gathering has moved inside.",
          ],
          [
            "오늘 3시 20분에 올린 안내: 비가 와서 장소를 바꿨어요. 레인체크 카페 뒤쪽 창가에서 오후 4시부터 5시까지 읽을 거예요. 예전 공원 초대장 대신 이 안내를 봐 주세요.",
            "Posted today at 3:20: rain has changed the venue. The reading circle meets at Raincheck Café's back window table from four to five. Please disregard the old park invitation.",
          ],
          [
            "오늘 3시 20분에 고친 초대장입니다. 장소: 레인체크 카페 뒤쪽 창가 테이블. 시작: 오후 4시. 끝: 오후 5시. 참가할 여섯 분에게 장소가 바뀌었다고 알려 드려요. 예전 초대장의 공원 대신 이 카페로 오시면 됩니다.",
            "Confirmed invitation · revised today at 3:20. Venue: the back window table at Raincheck Café. Start: 4 p.m. Finish: 5 p.m. This change-of-venue message is for the six attendees and replaces the park location on the previous invitation.",
          ],
        ],
        [
          "샘에게 알려 줄 장소와 시작 시간은?",
          "Which new venue and start time should Sam receive?",
        ],
        ["Raincheck Café at four.", "The park at four.", "Raincheck Café at five."],
        0,
      ),
    }),
    task({
      id: "cafe-invite-sam",
      chapterId: "cafe-ch3",
      skill: "speaking",
      title: ["샘, 여기서 만나자.", "Tell the friend outside"],
      context: [
        "모임에 오기로 한 샘에게 카페로 장소가 바뀌었다고 말해 주세요.",
        "Tell Sam, one of the six attendees, the confirmed change of venue.",
      ],
      document: ["샘에게 전하는 초대", "Invitation for Sam"],
      feedback: [
        "새 손님을 더 부르는 말이 아니라, 오기로 한 샘에게 장소와 시간을 알려 주는 말이에요. café와 four를 또렷하게 말해 보세요. 발음 점수는 계산하지 않습니다.",
        "This tells an existing attendee the new place and time; it does not add another guest. Say café and four clearly and check your own delivery. No pronunciation score is calculated.",
      ],
      consequence: [
        "샘이 카페로 가겠다고 답합니다. 준은 공원에서 친구를 기다릴까 걱정했던 마음을 놓고, 모임 준비를 이어갑니다.",
        "Sam replies that he will go to the café. June no longer worries that he will wait in the park and continues preparing the gathering.",
      ],
      expressionIds: ["cafe-invitation"],
      versions: outputs(
        [
          [
            "샘에게 4시에 카페에서 만나자고 해 주세요.",
            "Tell Sam to meet you at the café at four.",
          ],
          [
            "샘은 아직 예전 공원 초대장을 보고 있어요. 비가 와서 카페로 옮겼고 4시에 시작한다고 말해 주세요.",
            "Sam has the old park invitation. Explain that the circle moved inside because of rain and tell him café and four.",
          ],
          [
            "샘은 이미 모임에 오기로 한 친구예요. 레인체크 카페에서 4시에 시작한다고 알려 주세요. 뒤쪽 창가 테이블이라고 말하면 도착해서 찾기 쉽겠죠.",
            "Explain the venue change warmly to Sam, who is already in the group. Include Raincheck Café, a four o'clock start, and the back window table so he can find the group on arrival.",
          ],
        ],
        [
          "초대 내용을 듣고 직접 말해 보세요. 장소와 시간을 모두 전했나요?",
          "Listen to the invitation, say it aloud, and check whether you conveyed it.",
        ],
        [
          "Meet us at the café at four.",
          "We moved inside because of the rain. Meet us at the café at four.",
          "We moved inside because of the rain. Meet us at Raincheck Café at four, at the back window table.",
        ],
      ),
    }),
    task({
      id: "cafe-welcome-choice",
      chapterId: "cafe-ch3",
      skill: "speaking",
      title: ["편하게 자리하세요.", "Welcome a guest's choice"],
      context: [
        "노라가 자기 간식과 물병을 쓰겠다고 합니다. 준비한 자리를 알려 주며 맞아 주세요.",
        "Nora says she will use her own snack and bottle. Welcome her and describe the confirmed arrangement.",
      ],
      document: ["도착한 손님과의 대화", "Conversation with an arriving guest"],
      feedback: [
        "다른 음식을 먹으라고 권하지 않고 노라의 선택을 받아 줘요. 자신의 간식과 물병을 둘 자리를 알려 주고, 확인하지 못한 음식에 대해서는 괜찮다고 약속하지 않습니다.",
        "Do not pressure the guest toward another food. Explain the space prepared for her own snack and bottle without making unverified food assurances.",
      ],
      consequence: [
        "노라가 고맙다며 준비한 자리에 앉습니다. 4시, 여섯 사람이 책을 펼칩니다. 레오는 주문을 맞춘 것뿐 아니라 각자가 편히 머물 자리를 마련했습니다.",
        "Nora thanks them and sits in the place they prepared. At four, six people open their books. Leo has done more than fulfil an order: he has made room for each person to feel welcome.",
      ],
      expressionIds: ["cafe-own-snack", "cafe-check"],
      versions: outputs(
        [
          [
            "노라가 가져온 간식과 물병을 놓을 자리가 있어요. 반갑게 맞으며 자리를 알려 주세요.",
            "There is space for Nora's own snack and bottle. Welcome her and say what is ready.",
          ],
          [
            "노라는 카페 간식 대신 자기 것을 먹기로 했어요. 그 선택을 받아 주고, 이 테이블에는 카페 간식을 놓지 않았다고 말해 주세요.",
            "Nora has chosen not to use café snacks. Respect her choice and explain that café snacks have been kept off the table.",
          ],
          [
            "노라에게 가져온 간식과 물병을 둘 자리를 보여 주세요. 매니저가 조리 과정을 확인할 수 없어서 카페 간식을 테이블에 놓지 않았다고 설명하고, 모임에 온 것을 반갑게 맞아 주세요.",
            "Show Nora the space for her own snack and bottle. Honestly explain that café snacks stayed off the table because the manager could not verify the conditions, and warmly welcome her to the circle.",
          ],
        ],
        [
          "노라가 편하게 느낄 수 있도록 직접 말해 보세요.",
          "Practice responding with respect for Nora's choice.",
        ],
        [
          "Welcome! There's space for your own snack and bottle.",
          "Of course. We've kept café snacks off this table. There's space for your own snack and bottle.",
          "Welcome, Nora. Maya couldn't verify the preparation, so we've kept café snacks off this table. There's space for your own snack and bottle.",
        ],
      ),
    }),
  ],
  debrief: {
    question: text([
      "도서관 워크숍 예약에도 시간이 잘못 적혔어요. 여섯 명이 오후 3시에 시작한다고 어떻게 알려 줄까요?",
      "Next, a library workshop booking is an hour late. How would you correct it to six people starting at three?",
    ]),
    model: "Could you change our library booking to three? There will be six of us.",
    modelKo: text([
      "도서관 예약 시간을 3시로 바꿔 주실 수 있나요? 저희는 여섯 명이에요.",
      "Could you change our library booking to three? There will be six of us.",
    ]),
  },
};

const radioImage = "/assets/english/radio.webp",
  radioTower = "/assets/english/radio-tower.webp";
const radio: EnglishEpisode = {
  id: "midnight-radio",
  title: text(["여덟 시에 만나요", "Meet Us at Eight"]),
  englishTitle: "Meet Us at Eight",
  genre: "mystery",
  genreLabel: text(["기록 추리 · 정정 방송", "Archive mystery · A correction on air"]),
  minutes: 27,
  image: radioImage,
  accent: "#91a7b2",
  imageAlt: text([
    "따뜻한 조명 아래 오래된 음성 기록을 확인하는 진행자와 기술자의 영화 같은 라디오 스튜디오",
    "A cinematic radio studio where a host and technician examine an old audio recording under warm lights",
  ]),
  synopsis: text([
    "마을 단체 대화방에 “8시에 만나요”라는 녹음이 올라왔어요. 올해 포스터에는 다른 시간이 적혀 있는데, 어느 안내를 따라야 할까요?",
    "An eight o'clock announcement returns to the town chat. Compare the recording date with the current notice to recover today's real plan.",
  ]),
  intro: text([
    "11월 6일 금요일 오후 5시, 라디오 스튜디오로 “오늘 산책은 8시인가요?”라는 질문이 들어옵니다. 단체 대화방의 녹음과 올해 포스터가 서로 다르다는 거예요. 진행자 아이리스는 곧 집을 나설 이웃들이 헷갈린 채 기다리지 않도록 안내를 준비하려 합니다. 기술자 벤이 녹음의 원본을 찾아옵니다. 오늘 공유된 파일이 언제 만들어진 것인지부터 함께 확인해보세요.",
    "At five on Friday, November 6, a question reaches the radio studio: 'Is today's walk at eight?' The recording in the group chat and this year's poster differ. Iris wants to prepare guidance before neighbours leave home and end up waiting in confusion. Ben brings the original recording. Start by checking when the file shared today was actually made.",
  ]),
  ending: text([
    "5시 30분, 아이리스가 바로잡은 안내를 방송합니다. 오늘, 2026년 11월 6일 등불 산책은 오후 6시 동부공원 동문에서 시작합니다. 8시와 북문을 말한 녹음은 2019년 11월 8일 행사 때의 방송이었죠. 메이는 잘못 들은 게 아니었다는 설명에 안심하고 집을 나섭니다. 6시가 되자 이웃들이 동문에 모입니다. 벤은 원본에 녹음 날짜를 눈에 띄게 붙이고, 아이리스는 다음 원고에도 출처를 함께 적기로 합니다. 처음에는 목소리 하나를 믿고 시간을 전할 뻔했지만, 이제는 확인한 정보와 그 이유를 함께 말했습니다. 옛 방송도 지우지 않고 제때의 기록으로 남겼습니다.",
    "At 5:30, Iris broadcasts the correction. Today's Lantern Walk, on November 6, 2026, begins at six at the east gate at East Park. The voice saying eight and the north gate was recorded for the event on November 8, 2019. Mae is relieved to learn that she did not mishear and leaves home. At six, the neighbours gather at the east gate. Ben makes the source recording date easy to see, and Iris decides to include sources in her next script too. They had nearly passed on a time from a voice alone; now they have shared verified information and the reason for it. The old broadcast is kept as a record of its own occasion.",
  ]),
  takeaway: text([
    "녹음한 날과 공유한 날을 구별하고, 오늘의 안내를 확인해요. 서로 다른 정보가 생긴 까닭을 설명하며, 들은 사람을 탓하지 않고 바로잡습니다.",
    "Distinguish when something was recorded from when it was shared, verify today's guidance, and explain the difference without blaming the listener.",
  ]),
  cast: [
    {
      name: "Iris",
      role: text(["동네 라디오 진행자", "Neighborhood radio host"]),
      motivation: text([
        "이웃들이 다른 시간에 기다리는 일을 막고 싶어요. 먼저 확인하고, 잘못 들었다는 말을 듣지 않도록 이유까지 전하려 합니다.",
        "She wants to prevent neighbours from waiting at different times, verifying the guidance and explaining it without treating listeners as if they misheard.",
      ]),
    },
    {
      name: "Ben",
      role: text(["옛 방송 녹음을 관리하는 기술자", "Technician responsible for audio archives"]),
      motivation: text([
        "옛 방송의 가치는 지키면서 언제의 안내인지 분명히 남기고 싶어요. 공유된 시각과 녹음한 날짜를 나눠 살펴봅니다.",
        "He wants to preserve the old broadcast while making clear when its guidance applied, distinguishing the sharing time from the recording date.",
      ]),
    },
    {
      name: "Mae",
      role: text(["등불 산책에 가려는 청취자", "A listener planning to join the walk"]),
      motivation: text([
        "들었던 말을 믿고 출발하려다 포스터가 달라 망설입니다. 어느 약속으로 가야 하는지 차근차근 설명받고 싶어요.",
        "She was ready to leave based on what she heard, but the different poster makes her hesitate. She wants a clear explanation of which arrangements to follow.",
      ]),
    },
  ],
  chapters: [
    chapter(
      "radio-ch1",
      ["1장 · 언제 녹음한 방송일까요?", "Chapter 1 · A voice returns"],
      ["스튜디오의 녹음 자료 책상", "Archive desk in the radio studio"],
      [
        "원본 날짜를 읽고, 녹음에서 말하는 시간과 장소를 들어요.",
        "Check the recording date separately from what the voice claims",
      ],
      [
        "스튜디오 벽시계가 5시를 가리킵니다. 아이리스의 화면에 모임 시간을 묻는 질문이 이어집니다. 벤은 단체 대화방의 파일과 그 원본을 나란히 놓습니다. 오늘 올라온 메시지에도 날짜가 있지만 원본에는 녹음한 날이 따로 적혀 있어요. 사람들은 같은 목소리를 듣고도 서로 다른 약속을 떠올리고 있습니다. 아이리스가 방송으로 전하기 전에, 어느 때의 안내인지 먼저 알아봐야겠죠. 원본 날짜를 읽고 그 목소리가 말한 시간과 장소를 들은 뒤, 올해 주최자에게 확인할 질문을 준비합니다.",
        "The studio clock shows five, and questions about the meeting time keep arriving on Iris's screen. Ben sets the shared file beside its original. The message has today's date, but the original has a separate recording date. People hear the same voice and picture different arrangements. Before Iris broadcasts any guidance, they need to establish which event the recording describes. Read the source date, listen accurately to the time and place in the voice, and prepare a question for this year's organizer.",
      ],
      radioImage,
      [
        "음성 재생기와 날짜가 있는 원본 기록을 나란히 놓은 라디오 데스크",
        "A radio desk with an audio player beside the dated original archive",
      ],
      [
        {
          speaker: "Iris",
          en: "People who are about to leave are asking. Shall we first find out when this was recorded?",
          ko: "곧 출발하려는 분들이 묻고 있어요. 먼저 이 녹음이 언제 것인지 알아볼까요?",
        },
        {
          speaker: "Ben",
          en: "I've brought the shared message and the original. We need to check whether their dates mean the same thing.",
          ko: "공유 메시지와 원본을 가져왔어요. 두 날짜가 같은 뜻인지는 따로 봐야겠네요.",
        },
        {
          speaker: "Iris",
          en: "Let's note exactly what we hear, then confirm today's arrangements with the organizer.",
          ko: "들은 말부터 정확히 적고, 오늘 안내는 주최자에게 확인해요.",
        },
      ],
    ),
    chapter(
      "radio-ch2",
      ["2장 · 올해는 언제, 어디서?", "Chapter 2 · Find today's record"],
      ["행사 게시판 앞", "Studio event board and telephone"],
      [
        "올해 포스터를 읽고 주최자의 답과 맞는지 살펴봐요.",
        "Confirm today's place and time with the current notice and organizer",
      ],
      [
        "벤이 오늘, 2026년 11월 6일 등불 산책 포스터를 가져옵니다. 시작 시간과 만나는 곳, 안내를 고친 시간이 각각 적혀 있습니다. 주최자의 음성 답장도 도착했으니 같은 내용을 전하는지 비교해보세요. 5시에 공유된 옛 녹음과 3시 30분에 고친 포스터 중 무엇이 늦게 올라왔는지만 따져서는 안 되겠죠. 벤은 녹음 날짜, 공유 시간, 포스터를 고친 시간을 따로 적습니다. 아이리스는 오늘의 약속을 먼저 말하고, 안내가 달랐던 까닭도 설명할 원고를 준비합니다.",
        "Ben brings today's Lantern Walk poster for November 6, 2026. It separates the start time, meeting place, and revision time. The organizer's voice reply has arrived too, so compare the two sources. Choosing between an old recording shared at five and a poster revised at 3:30 is not simply a matter of which appeared later. Ben puts the recording date, sharing time, and revision time on separate lines. Iris prepares a script that states today's arrangements first and explains why the guidance differed.",
      ],
      "/assets/english/radio-noticeboard-v2.webp",
      [
        "주최자의 답장을 들으며 행사 게시판의 안내를 함께 살펴보는 두 사람",
        "Two people listening to the organizer and comparing guidance at the event noticeboard",
      ],
      [
        {
          speaker: "Ben",
          en: "I've found this year's poster. Shall we compare it with the organizer's reply?",
          ko: "올해 포스터를 찾았어요. 주최자의 답장도 같이 살펴볼까요?",
        },
        {
          speaker: "Iris",
          en: "Then we can start by checking that they describe the same event and date.",
          ko: "같은 행사, 같은 날짜의 안내인지부터 맞춰보면 되겠네요.",
        },
        {
          speaker: "Ben",
          en: "Yes. Being shared later does not by itself make a recording today's guidance.",
          ko: "네. 늦게 공유됐다는 이유만으로 오늘 안내가 되는 건 아니니까요.",
        },
      ],
    ),
    chapter(
      "radio-ch3",
      ["3장 · 오늘은 여섯 시에 만나요.", "Chapter 3 · Back to today's plan"],
      ["스튜디오 방송 마이크 앞", "Broadcast microphone and the view toward the park"],
      [
        "바른 시간과 장소를 방송하고 메이에게 이유를 설명해요.",
        "Complete a sourced correction and guide the listener",
      ],
      [
        "5시 20분, 메이에게 전화가 옵니다. 녹음에서 8시라고 들었는데 다른 안내를 따라가도 되는지 아직 망설이고 있어요. 아이리스는 메이가 잘못 들었다고 말하지 않습니다. 들은 말은 맞았지만 서로 다른 해의 안내였으니까요. 5시 30분 방송에서는 확인한 시간과 장소를 먼저 전하고, 옛 녹음이 다시 들린 까닭을 덧붙이기로 합니다. 벤은 원본에 날짜 설명을 붙입니다. 같은 혼란이 되풀이되지 않도록 기록도 남기는 것이죠. 아이리스는 질문한 사람을 탓하지 않고, 이웃들이 제시간에 만나도록 안내하려 합니다.",
        "At 5:20, Mae calls. She heard eight in the recording and still hesitates about following a different notice. Iris does not tell her that she heard incorrectly: the words were right, but the sources described different years. In the 5:30 broadcast, Iris will give the verified time and place first, then explain why the old recording was heard again. Ben adds a date explanation to the original so the same confusion is less likely to return. Iris's aim is to help neighbours arrive together, not to find someone to blame.",
      ],
      radioTower,
      [
        "저녁 공원을 바라보는 라디오 건물에서 정정 방송을 준비하는 인물들",
        "People preparing a radio correction in a station overlooking the evening park",
      ],
      [
        {
          speaker: "Mae",
          en: "Was I wrong to hear eight? I'm not sure which guidance to follow.",
          ko: "제가 8시라고 들은 게 틀린 건가요? 어느 안내를 따라야 할지 모르겠어요.",
        },
        {
          speaker: "Iris",
          en: "You heard it correctly. The recording and today's poster simply do not describe the same year.",
          ko: "들은 말은 맞아요. 다만 그 녹음과 오늘 포스터가 같은 해의 안내는 아니에요.",
        },
        {
          speaker: "Iris",
          en: "I'll give you today's confirmed time and place first, then explain why they differed.",
          ko: "오늘 확인한 시간과 장소를 먼저 알려드리고, 왜 달랐는지도 설명할게요.",
        },
      ],
    ),
  ],
  expressions: [
    expression(
      "radio-recorded",
      "When was it recorded?",
      "언제 녹음한 건가요?",
      [
        "단체 대화방에 녹음이 올라왔어요. 언제 녹음한 건지 물어보세요.",
        "You want to check the original date of a shared audio clip. Ask when it was recorded.",
      ],
      ["When was this recorded?", "When was the recording made?"],
    ),
    expression(
      "radio-confirm",
      "Could you confirm the time and meeting place?",
      "시간과 만나는 곳을 다시 알려 주실 수 있나요?",
      [
        "주최자에게 행사 시간과 만나는 곳을 다시 알려 달라고 부탁하세요.",
        "Ask the event organizer to confirm the current time and meeting place.",
      ],
      ["Can you confirm the time and meeting place?", "Please confirm the time and meeting place."],
    ),
    expression(
      "radio-old",
      "That recording is from 2019.",
      "그 녹음은 2019년 것이에요.",
      [
        "오늘 안내로 잘못 전해진 녹음이 2019년 것이었다고 설명해 주세요.",
        "Explain that audio mistaken for today's notice is a 2019 recording.",
      ],
      ["The recording is from 2019.", "It was recorded in 2019."],
    ),
    expression(
      "radio-start",
      "Today's walk starts at six.",
      "오늘 산책은 6시에 시작해요.",
      [
        "오늘 산책이 6시에 시작한다고 알려 주세요.",
        "State that today's confirmed walk starts at six.",
      ],
      ["The walk starts at six today.", "Today's walk begins at six.", "Today's walk starts at 6."],
    ),
    expression(
      "radio-repeat",
      "Let me repeat the confirmed details.",
      "알아본 내용을 다시 말씀드릴게요.",
      [
        "청취자가 다시 듣고 싶어 해요. 알아본 내용을 한 번 더 말하겠다고 해 주세요.",
        "A listener wants the announcement again. Say that you will repeat the confirmed details.",
      ],
      ["I'll repeat the confirmed details.", "I will repeat the confirmed details."],
    ),
  ],
  tasks: [
    task({
      id: "radio-original",
      chapterId: "radio-ch1",
      skill: "reading",
      title: ["올라온 날과 녹음한 날", "Shared time, recorded date"],
      context: [
        "원본을 녹음한 날과 단체 대화방에 올라온 시간을 각각 읽어 보세요.",
        "Distinguish the original recording date from the time it was shared.",
      ],
      document: ["음성 원본 표지와 공유 기록", "Audio source cover and sharing log"],
      feedback: [
        "녹음한 날은 2019년 11월 8일이에요. 오늘, 2026년 11월 6일 5시는 단체 대화방에 올라온 시간일 뿐 녹음한 때가 아닙니다.",
        "The original was recorded on November 8, 2019. Five today, November 6, 2026, is the chat sharing time, not the creation date.",
      ],
      consequence: [
        "벤이 이 파일을 2019년 행사 자료로 분류합니다. 아이리스는 그때 방송이 무슨 말을 했는지 들어봐요.",
        "Ben identifies the source as a 2019 event archive. Iris listens to what it actually says.",
      ],
      expressionIds: ["radio-recorded", "radio-old"],
      versions: choices(
        [
          [
            "녹음한 날: 2019년 11월 8일. 공유한 시간: 2026년 11월 6일 오후 5시. 오늘 날짜는 공유 기록에만 적혀 있어요.",
            "Recorded: November 8, 2019. Shared: November 6, 2026, at 5 p.m. Today's date belongs only to the sharing log.",
          ],
          [
            "원본에 적힌 날짜: 2019년 11월 8일 행사 녹음. 단체 대화방에 올라온 시간: 2026년 11월 6일 오후 5시. 녹음한 때와 공유한 때는 따로 적혀 있어요.",
            "Source cover: event recording from November 8, 2019. Chat log: shared on November 6, 2026, at five. Sharing time and recording date are separate fields.",
          ],
          [
            "원본에는 “녹음: 2019-11-08”, 단체 대화방에는 “공유: 2026-11-06 17:00”이라고 적혀 있어요. 오늘 올라온 것은 오래된 녹음을 다시 보낸 파일입니다. 공유했다고 녹음한 날이 바뀌지는 않아요.",
            "The source metadata says Recorded 2019-11-08, while the chat shows Shared 2026-11-06 17:00. Recent sharing passes along an older sound; it does not change when the original was created.",
          ],
        ],
        ["이 파일을 녹음한 때는 언제일까요?", "When was this audio created?"],
        [
          "In 2026, because it was shared today.",
          "In 2019, according to the original recording date.",
          "At 5 p.m. today, because that is the chat time.",
        ],
        1,
      ),
    }),
    task({
      id: "radio-old-voice",
      chapterId: "radio-ch1",
      skill: "listening",
      title: ["목소리는 뭐라고 했을까요?", "What the old voice says"],
      context: [
        "옛 방송에서 말하는 시간과 장소를 들어 보세요. 오늘 안내인지 판단하는 건 그다음이에요.",
        "Listen accurately to the old recording's time and place without treating it as today's guidance.",
      ],
      document: ["2019년 행사 음성", "The 2019 event recording"],
      speaker: ["벤 · 과거 녹음 재생과 설명", "Ben · Playing and explaining the archive"],
      feedback: [
        "녹음에서는 8시와 북문을 말했어요. 그 말을 제대로 들었더라도 오늘 행사에 그대로 적용할 수 있는지는 따로 살펴봐야 합니다.",
        "The archive says eight and the north gate. Hearing those words accurately is different from deciding they apply today.",
      ],
      consequence: [
        "아이리스가 “옛 안내: 8시, 북문”이라고 적습니다. 올해 주최자에게 물어볼 것이 생겼어요.",
        "Iris labels the old claim as eight at the north gate and prepares a question for today's organizer.",
      ],
      expressionIds: ["radio-confirm"],
      versions: choices(
        [
          [
            "이번 금요일 등불 산책은 8시에 시작합니다. 북문에서 만나요. 이 방송은 2019년에 녹음한 것이에요.",
            "This Friday's Lantern Walk starts at eight. Meet at the north gate. This audio belongs to the 2019 archive.",
          ],
          [
            "이번 금요일, 등불을 들고 산책합니다. 저녁 8시에 북문에서 만나요. 편한 신발을 신고 와 주세요. 원본에 적힌 날짜를 보면 2019년 행사 때의 방송이라는 걸 알 수 있어요.",
            "This Friday we'll walk with lanterns. Meet at the north gate at eight in the evening, and bring comfortable shoes. The source cover identifies this as the 2019 event.",
          ],
          [
            "2019년 녹음 속 진행자가 말합니다. “이번 금요일 등불 산책은 저녁 8시, 북문에서 시작합니다.” 여기서 이번 금요일은 녹음하던 해의 행사 날을 말해요.",
            "In the 2019 recording, the host says: this Friday's Lantern Walk starts at eight in the evening, at the north gate. 'This Friday' refers to the event current when that recording was made.",
          ],
        ],
        ["옛 방송이 안내한 시간과 장소는?", "Which two details did you hear in the old recording?"],
        [
          "Six at the east gate at East Park.",
          "Eight at the east gate at East Park.",
          "Eight at the north gate.",
        ],
        2,
      ),
    }),
    task({
      id: "radio-ask-organizer",
      chapterId: "radio-ch1",
      skill: "writing",
      title: ["주최자에게 물어봐요.", "Ask today's organizer"],
      context: [
        "아직 모르는 내용을 방송할 수는 없죠. 주최자에게 오늘 시간과 장소를 물어보세요.",
        "Ask today's organizer to confirm the time and place before broadcasting a guess.",
      ],
      document: ["주최 측 확인 메시지", "Message to the organizer"],
      feedback: [
        "time과 meeting place를 함께 물어봐야 필요한 답을 받을 수 있어요. 도전에서는 옛 녹음이 다시 올라와서 헷갈린다는 이유도 전해 주세요.",
        "Ask about both time and meeting place to get the information needed. Challenge also explains the uncertainty caused by the old shared clip.",
      ],
      consequence: [
        "주최자에게 오늘의 시간과 장소를 묻는 질문을 보냅니다. 아이리스는 답을 기다리고, 벤은 비교할 올해 포스터를 가져옵니다.",
        "You send the organizer a question about today's time and place. Iris waits for the reply while Ben brings this year's poster for comparison.",
      ],
      expressionIds: ["radio-confirm", "radio-recorded"],
      versions: outputs(
        [
          [
            "주최자에게 오늘 행사 시간과 만나는 곳을 알려 달라고 부탁하세요.",
            "Ask the organizer to confirm today's event time and meeting place.",
          ],
          [
            "공유된 녹음과 올해 포스터가 서로 다르네요. 주최자에게 오늘 산책 시간과 만나는 곳을 물어보세요.",
            "The shared audio and current poster differ. Ask for confirmation of today's walk time and meeting place.",
          ],
          [
            "2019년 녹음이 오늘 단체 대화방에 올라와 이웃들이 헷갈리고 있어요. 이 사정을 설명하고, 주최자에게 오늘 산책 시간과 만나는 곳을 다시 알려 달라고 부탁하세요.",
            "A 2019 recording shared in today's chat has caused confusion. Explain that reason and ask the organizer to confirm the time and place of today's walk.",
          ],
        ],
        [
          "오늘의 시간과 장소를 묻는 영어 메시지를 써 보세요.",
          "Write a message confirming today's time and place.",
        ],
        [
          "Please confirm the time and meeting place.",
          "Could you confirm today's walk time and meeting place?",
          "A recording from 2019 was shared today. Could you confirm today's walk time and meeting place?",
        ],
        [
          [["confirm", "check"], ["time"], ["meeting place", "location", "gate"]],
          [
            ["confirm", "check"],
            ["today", "today's"],
            ["walk"],
            ["time"],
            ["meeting place", "location", "gate"],
          ],
          [
            ["2019"],
            ["recording", "audio", "clip"],
            ["shared"],
            ["confirm", "check"],
            ["today", "today's"],
            ["time"],
            ["meeting place", "location", "gate"],
          ],
        ],
        [
          ["Could you check the time and location?"],
          ["Please check today's walk time and location."],
          [
            "An audio clip from 2019 was shared today. Please check today's walk time and location.",
          ],
        ],
      ),
    }),
    task({
      id: "radio-current-poster",
      chapterId: "radio-ch2",
      skill: "reading",
      title: ["포스터의 날짜와 시간", "The current event notice"],
      context: [
        "올해 포스터를 읽어 보세요. 행사 날짜와 시작 시간, 안내를 고친 시간을 구분해요.",
        "Read the current poster's event date and revision time, then check the place and time.",
      ],
      document: ["올해 행사 포스터 · 2026년 11월 6일", "Current event poster · November 6, 2026"],
      feedback: [
        "올해 산책은 2026년 11월 6일, 오후 6시, 동부공원 동문이에요. 3시 30분은 안내를 고친 시간이지 산책 시작 시간이 아닙니다.",
        "Today's notice states November 6, 2026, six p.m., and the east gate at East Park. 3:30 is the revision time, not the event start.",
      ],
      consequence: [
        "아이리스가 포스터의 “6시, 동문”에 표시합니다. 주최자의 답도 같은지 들어볼 차례예요.",
        "Iris marks six and the east gate on the current notice, ready to compare them with the organizer's reply.",
      ],
      expressionIds: ["radio-start"],
      versions: choices(
        [
          [
            "등불 산책 · 2026년 11월 6일 금요일. 시작: 오후 6시. 만나는 곳: 동부공원 동문. 안내를 고친 시간: 오늘 오후 3시 30분.",
            "Lantern Walk · Friday, November 6, 2026. Start: 6 p.m. Meeting point: east gate at East Park. Notice updated: today at 3:30 p.m.",
          ],
          [
            "올해 행사 안내: 2026년 11월 6일 오후 6시에 동부공원 동문에서 모입니다. 같은 날 오후 3시 30분에 이 안내를 고쳤어요. 안내를 고친 시간과 시작하는 시간은 서로 다릅니다.",
            "Current event notice: meet at the east gate at East Park at six on November 6, 2026. This notice was updated the same day at 3:30 p.m. Its revision time is separate from its start time.",
          ],
          [
            "오늘 등불 산책 포스터입니다. 행사: 2026-11-06 18:00. 만나는 곳: 동부공원 동문. 안내 수정: 2026-11-06 15:30. 산책 시작은 18:00이고, 15:30은 포스터 내용을 고친 시간이에요.",
            "Today's Lantern Walk poster reads Event 2026-11-06 18:00, Meeting point east gate at East Park, Updated 2026-11-06 15:30. The event starts at 18:00; 15:30 records when the posted information was revised.",
          ],
        ],
        [
          "올해 포스터대로 어디에, 몇 시에 모일까요?",
          "What is today's meeting according to the current notice?",
        ],
        [
          "Six at the east gate at East Park on November 6, 2026.",
          "3:30 at the east gate at East Park on November 6, 2026.",
          "Eight at the north gate on November 8, 2019.",
        ],
        0,
      ),
    }),
    task({
      id: "radio-confirmed-voice",
      chapterId: "radio-ch2",
      skill: "listening",
      title: ["전화로 한 번 더", "The organizer confirms"],
      context: [
        "주최자의 답장을 들어 보세요. 올해 장소를 바꾼 이유와 시작 시간이 나옵니다.",
        "Listen for the current time and why this year's meeting point changed.",
      ],
      document: ["주최자의 회신 음성", "Organizer's voice reply"],
      speaker: ["주최자 · 오늘 행사 확인", "Organizer · Confirming today's event"],
      feedback: [
        "오늘은 오후 6시, 동부공원 동문입니다. 올해는 오기 편한 동문으로 모이는 곳을 바꿨어요. 북문과 8시는 2019년 행사 때의 안내예요.",
        "The organizer confirms six today at the east gate at East Park. The east gate was chosen for easier access this year; the north gate and eight belong to 2019.",
      ],
      consequence: [
        "포스터와 주최자의 답이 일치합니다. 아이리스가 두 자료에 같은 표시를 하고, 지금 전할 안내의 근거를 갖춥니다.",
        "The poster and the organizer's reply agree. Iris marks both sources, giving her a basis for the guidance she will share now.",
      ],
      expressionIds: ["radio-confirm", "radio-start"],
      versions: choices(
        [
          [
            "네, 오늘은 6시에 동부공원 동문에서 만나요. 올해는 동문이 오기 편하거든요. 북문과 8시는 2019년 안내예요.",
            "Yes, meet at the east gate at East Park at six today. That gate is easier to reach this year. The north gate and eight are from the 2019 notice.",
          ],
          [
            "오늘 11월 6일 산책은 오후 6시, 동부공원 동문입니다. 올해는 오기 편하도록 동문에서 만나기로 했어요. 2019년 북문 행사 때의 녹음이 다시 올라온 것 같네요.",
            "Today's November 6 walk meets at the east gate at East Park at six. We chose the east gate for easier access this year. It seems the old north-gate recording from 2019 has been shared again.",
          ],
          [
            "올해 안내를 봐 주세요. 오늘, 2026년 11월 6일 산책은 오후 6시에 동부공원 동문에서 시작해요. 올해는 오기 편한 동문을 택했습니다. 2019년 녹음에 나온 북문과 8시는 그해에는 맞는 안내였지만 올해 계획은 아닙니다.",
            "Please use the current notice: today's November 6, 2026 event starts at six at the east gate at East Park. This year's location was chosen for easier access. The 2019 recording correctly describes its own event as eight at the north gate, but that is not this year's plan.",
          ],
        ],
        ["주최자가 오늘 오라고 한 시간과 장소는?", "Which guidance did today's organizer confirm?"],
        [
          "Use eight at the north gate because the old voice is clear.",
          "Meet at six at the east gate at East Park, chosen for easier access this year.",
          "Meet at 3:30 because the notice was updated then.",
        ],
        1,
      ),
    }),
    task({
      id: "radio-timeline",
      chapterId: "radio-ch2",
      skill: "reading",
      title: ["오늘 올라왔으면 새 안내일까요?", "Does a new upload mean new guidance?"],
      context: [
        "녹음한 날짜, 공유한 시간, 포스터를 고친 시간을 나눠 살펴보세요.",
        "Compare recording date, sharing time, and notice revision as different records.",
      ],
      document: ["세 기록의 시간표", "Timeline of three records"],
      feedback: [
        "오늘 늦게 올라왔어도 녹음한 건 2019년이에요. 올해 행사에는 올해 포스터와 주최자의 답을 따라야 합니다. 다시 올렸다고 녹음 내용이 새로 바뀌지는 않으니까요.",
        "The later share still contains a 2019 recording. Today's event should use the current notice and organizer confirmation. A recent upload alone does not update its content.",
      ],
      consequence: [
        "벤이 공유 메시지에 원본 날짜를 붙입니다. 아이리스도 안내가 서로 달랐던 이유를 원고에 적어요.",
        "Ben adds the original date to the sharing explanation. Iris includes the reason for the differing instructions in her correction.",
      ],
      expressionIds: ["radio-old", "radio-recorded"],
      versions: choices(
        [
          [
            "옛 녹음: 2019년. 올해 안내를 고친 시간: 오늘 오후 3시 30분. 옛 녹음을 공유한 시간: 오늘 오후 5시. 오늘 공유해도 원래 녹음은 그대로예요.",
            "Old recording: 2019. Current notice updated: today at 3:30. Old recording shared: today at five. Sharing does not make the original new.",
          ],
          [
            "오늘 3시 30분에 고친 안내는 6시, 동문이라고 해요. 오늘 5시에 다시 올라온 2019년 녹음에서는 8시, 북문이라고 합니다. 나중에 공유했다고 옛 내용이 올해 안내를 대신할 수는 없어요.",
            "Today's 3:30 revision says six at the east gate. A 2019 recording shared at five today says eight at the north gate. A later sharing time does not make past content replace the current notice.",
          ],
          [
            "각각 무엇을 한 시간인지 살펴보세요. 원본 녹음: 2019-11-08. 올해 안내 수정: 2026-11-06 15:30. 원본 공유: 2026-11-06 17:00. 주최자는 오늘 18:00에 동문에서 만난다고 답했습니다. 녹음한 날, 공유한 시간, 안내를 고친 시간은 서로 다른 기록이에요.",
            "Distinguish the records: original creation, 2019-11-08; current notice revision, 2026-11-06 15:30; original sharing, 2026-11-06 17:00. These timestamps describe different actions. The current organizer directly confirmed today's 18:00 east-gate meeting.",
          ],
        ],
        [
          "오늘의 안내를 알아내는 방법으로 맞는 것은?",
          "Which reasoning correctly establishes today's guidance?",
        ],
        [
          "The file shared at five must replace every earlier notice.",
          "The old voice sounds confident, so its event must be today's.",
          "Check the original date and use today's notice with the organizer's confirmation.",
        ],
        2,
      ),
    }),
    task({
      id: "radio-write-correction",
      chapterId: "radio-ch2",
      skill: "writing",
      title: ["어떻게 바로잡아 말할까요?", "A correction with a reason"],
      context: [
        "오늘의 안내부터 적고, 옛 녹음은 언제 만들어졌는지 덧붙여 주세요.",
        "Write today's guidance first, then explain the old audio's source.",
      ],
      document: ["정정 방송 원고", "Correction script"],
      feedback: [
        "오늘 6시, 동부공원 동문이라는 말을 꼭 넣어요. 기본부터는 녹음이 2019년 것이라고 설명하고, 도전에서는 오늘 다시 공유됐을 뿐이라고 덧붙여 주세요.",
        "Include today's six o'clock start and east gate at East Park. Standard adds the 2019 source; challenge explains that today's sharing did not change its original date.",
      ],
      consequence: [
        "확인한 시간과 장소, 옛 녹음의 날짜가 원고에 담깁니다. 마침 메이에게 전화가 와서, 왜 안내가 달랐는지 직접 설명할 기회가 생깁니다.",
        "The script now includes the verified time and place and the old recording date. Mae calls, giving Iris a chance to explain directly why the guidance differed.",
      ],
      expressionIds: ["radio-start", "radio-old"],
      versions: outputs(
        [
          [
            "오늘 산책은 6시에 동부공원 동문에서 시작해요. 방송 원고에 시간과 장소를 적어 주세요.",
            "Today's walk starts at six at the east gate at East Park. Put both details in the correction.",
          ],
          [
            "오늘은 6시, 동부공원 동문이라고 알려 주세요. 다른 시간을 말하는 녹음은 2019년 것이었다고 덧붙여요.",
            "State six today at the east gate at East Park and explain that the recording with the other time is from 2019.",
          ],
          [
            "오늘은 6시에 동문에서 모이고, 옛 녹음은 2019년 것이라고 설명해 주세요. 그 녹음이 오늘 다시 공유됐을 뿐이라는 말도 넣으면 왜 헷갈렸는지 알 수 있어요.",
            "Explain today's six o'clock east-gate meeting and the 2019 source. Add that the old recording was only shared today to resolve the misunderstanding about a recent file.",
          ],
        ],
        [
          "오늘의 안내와 옛 녹음이 다른 이유를 영어로 써 보세요.",
          "Write a correction containing today's guidance and its source.",
        ],
        [
          "Today's walk starts at six at the east gate at East Park.",
          "Today's walk starts at six at the east gate at East Park. That recording is from 2019.",
          "Today's walk starts at six at the east gate at East Park. The recording is from 2019 and was only shared today.",
        ],
        [
          [["today", "today's"], ["six", "6"], ["east gate at east park"]],
          [
            ["today", "today's"],
            ["six", "6"],
            ["east gate at east park"],
            ["recording", "audio", "clip"],
            ["2019"],
          ],
          [
            ["today", "today's"],
            ["six", "6"],
            ["east gate at east park"],
            ["recording", "audio", "clip"],
            ["2019"],
            ["shared"],
          ],
        ],
        [
          ["Today's walk begins at 6 at the east gate at East Park."],
          ["The audio is from 2019. Today's walk begins at 6 at the east gate at East Park."],
          [
            "The audio from 2019 was shared today. Today's walk begins at 6 at the east gate at East Park.",
          ],
        ],
      ),
    }),
    task({
      id: "radio-listener",
      chapterId: "radio-ch3",
      skill: "listening",
      title: ["메이는 왜 전화를 했을까요?", "What Mae needs to know"],
      context: [
        "메이는 옛 방송을 제대로 들었어요. 지금 무엇이 궁금한지 들어 보세요.",
        "Mae heard the old audio accurately. Listen for the confirmation she needs now.",
      ],
      document: ["청취자의 전화", "Listener's call"],
      speaker: ["메이 · 행사 참가자", "Mae · Event attendee"],
      feedback: [
        "메이는 8시를 잘못 들은 게 아니에요. 포스터와 녹음이 달라서 오늘 어디에, 몇 시에 가야 하는지 알고 싶은 거죠.",
        "Mae did not mishear eight. The old clip and poster differ, so she wants to know which time and place to follow today.",
      ],
      consequence: [
        "아이리스가 메이에게 오늘의 안내를 설명하려고 합니다. 먼저 8시를 제대로 들었다고 말해 주면 좋겠어요.",
        "Iris prepares to respect Mae's understanding while stating today's verified guidance.",
      ],
      expressionIds: ["radio-repeat"],
      versions: choices(
        [
          [
            "녹음에서는 8시라고 들었어요. 포스터에는 6시, 동문이라고 하네요. 오늘 어디에, 몇 시에 가면 되나요?",
            "I heard eight in the recording. The poster says six at the east gate. Where and when should I go today?",
          ],
          [
            "녹음에서는 분명히 8시, 북문이라고 들었어요. 그런데 올해 포스터는 6시, 동문이라고 하네요. 제가 잘못 들은 건가요? 오늘은 어느 안내대로 가면 될까요?",
            "I clearly heard eight and the north gate in the recording, but the current poster says six and the east gate. Did I hear incorrectly, or which guidance should I follow today?",
          ],
          [
            "옛 방송이 8시, 북문이라고 말한 건 알아요. 올해 포스터에는 6시, 동문이라고 적혀 있어서 왜 다른지 궁금합니다. 오늘은 어떻게 가면 되는지, 안내가 다른 이유는 뭔지 알려 주시면 좋겠어요.",
            "I know the old voice says eight at the north gate. The current poster says six at the east gate, so I wonder why the announcements differ. Please explain the plan I should follow today and its reason.",
          ],
        ],
        ["메이의 질문에는 어떤 답이 필요할까요?", "What should the response to Mae accomplish?"],
        [
          "Explain today's time and place and why the old recording differs.",
          "Tell her she failed to hear the word eight.",
          "Find someone to blame for sharing the recording.",
        ],
        0,
      ),
    }),
    task({
      id: "radio-on-air",
      chapterId: "radio-ch3",
      skill: "speaking",
      title: ["5시 30분, 방송 시작", "The 5:30 correction"],
      context: [
        "오늘의 시간과 장소부터 말해 주세요. 이어서 옛 녹음의 날짜를 설명해요.",
        "Practice announcing today's event first and then the old recording's source.",
      ],
      document: ["방송에서 읽을 원고", "Confirmed script at the microphone"],
      feedback: [
        "6시, 동부공원 동문을 먼저 알려 주면 이웃들이 출발할 수 있어요. 이어서 2019년 녹음이었다고 말하면 왜 8시라는 안내가 들렸는지도 알 수 있겠죠. 음성 점수는 계산하지 않습니다.",
        "Today's six o'clock start and east gate at East Park let listeners act. The 2019 source explains the different time. No voice score is calculated.",
      ],
      consequence: [
        "5시 30분, 새 안내가 방송됩니다. 이웃들이 오늘 모일 시간과 장소를 알게 돼요.",
        "At 5:30 the correction is broadcast. Listeners can recheck today's time and place.",
      ],
      expressionIds: ["radio-start", "radio-old"],
      versions: outputs(
        [
          [
            "방송에서 오늘 산책은 6시에 동부공원 동문에서 시작한다고 알려 주세요.",
            "Announce that today's walk begins at six at the east gate at East Park.",
          ],
          [
            "오늘은 6시에 동문에서 만난다고 먼저 말해요. 이어서 8시라고 한 녹음은 2019년 것이었다고 설명해 주세요.",
            "State six today at the east gate first, then explain that the recording saying eight is from 2019.",
          ],
          [
            "짧게 바로잡아 방송해 보세요. 오늘은 2026년 11월 6일, 오후 6시에 동부공원 동문에서 모입니다. 다른 안내는 2019년 녹음이 오늘 다시 올라온 것이라고 알려 주세요.",
            "Make a short correction: today's event is November 6, 2026, at six at the east gate at East Park. Explain that the other announcement is a 2019 recording shared today.",
          ],
        ],
        [
          "원고를 듣고 시간과 장소, 녹음 날짜를 직접 말해 보세요.",
          "Listen to the correction and practice saying its time, place, and source.",
        ],
        [
          "Today's walk starts at six at the east gate at East Park.",
          "Today's walk starts at six at the east gate at East Park. The eight o'clock recording is from 2019.",
          "A quick correction: today's November 6, 2026 walk starts at six at the east gate at East Park. The recording shared today is from 2019.",
        ],
      ),
    }),
    task({
      id: "radio-reassure-mae",
      chapterId: "radio-ch3",
      skill: "speaking",
      title: ["잘못 들은 게 아니에요.", "Acknowledge what she heard"],
      context: [
        "메이에게 옛 방송을 제대로 들었다고 말해 주세요. 그 방송은 다른 해의 안내였다고 설명하고 오늘 시간과 장소를 다시 알려요.",
        "Explain that Mae heard accurately but the recording belongs to another year, then repeat the confirmed details.",
      ],
      document: ["메이에게 다시 알려 줘요.", "Repeat the guidance to the listener"],
      feedback: [
        "8시라고 들었다는 말을 먼저 받아 주세요. 그다음 녹음 날짜가 달랐다는 걸 설명하고 오늘의 안내를 반복하면 됩니다. 질문한 사람을 탓할 필요는 없어요.",
        "Acknowledge the eight she heard and explain the difference in source and current guidance. This conversation repeats verified information without blaming her question.",
      ],
      consequence: [
        "메이가 “이제 알겠어요”라며 동문으로 출발합니다. 6시, 이웃들이 같은 곳에 모입니다. 아이리스는 시간과 장소를 알리는 데서 그치지 않고 혼란이 생긴 까닭도 풀었습니다.",
        "Mae says she understands and leaves for the east gate. At six, neighbours gather in the same place. Iris has done more than give the correct details: she has resolved the reason for the confusion.",
      ],
      expressionIds: ["radio-repeat", "radio-old", "radio-start"],
      versions: outputs(
        [
          [
            "메이에게 내용을 다시 알려 주겠다고 말하고 오늘은 6시에 시작한다고 전해 주세요.",
            "Tell Mae you will repeat the confirmed details and that today's start is six.",
          ],
          [
            "메이가 8시를 제대로 들었다고 말해 주세요. 그 녹음은 2019년 것이고, 오늘은 6시에 동부공원 동문에서 만난다고 다시 알려요.",
            "Acknowledge that Mae heard eight correctly. Explain that the recording is from 2019 and repeat six today at the east gate at East Park.",
          ],
          [
            "메이가 잘못 들은 게 아니라 녹음한 해가 달랐다고 설명해 주세요. 올해 포스터와 주최자의 답이 같다는 것도 덧붙이고, 오늘 시간과 장소를 차분하게 알려 주세요.",
            "Respect Mae's understanding and explain the different source. Calmly add that the current poster and organizer agree, with the time and place she should follow today.",
          ],
        ],
        [
          "메이가 이해할 수 있도록 오늘의 안내를 직접 전해 보세요.",
          "Respond to the listener with respect and confirmed information.",
        ],
        [
          "Let me repeat the confirmed details. Today's walk starts at six.",
          "You heard eight correctly. That recording is from 2019. Today, meet at six at the east gate at East Park.",
          "You heard the old recording correctly. It is from 2019. Today's poster and organizer agree: six at the east gate at East Park. Let me repeat those confirmed details.",
        ],
      ),
    }),
  ],
  debrief: {
    question: text([
      "학교 동아리 단체 대화방에 지난해 “3시 시작” 안내가 올라왔어요. 올해 공지에는 2시라고 적혀 있습니다. 시간을 물어보고 왜 두 안내가 다른지 설명해 볼까요?",
      "A school club shares last year's three o'clock announcement, but this year's notice says two. Ask for confirmation and explain the difference.",
    ]),
    model:
      "Could you confirm today's club time? The old notice is from last year. Today's confirmed start is two.",
    modelKo: text([
      "오늘 동아리 시간을 알려 주실 수 있나요? 예전 안내는 지난해 것이에요. 오늘은 2시에 시작합니다.",
      "Could you confirm today's club time? The old notice is from last year. Today's confirmed start is two.",
    ]),
  },
};

const gardenImage = "/assets/english/garden.webp",
  gardenCourtyard = "/assets/english/garden-courtyard.webp";
const garden: EnglishEpisode = {
  id: "glasshouse-garden",
  title: text(["온실에 남겨진 지도", "The Map in the Glasshouse"]),
  englishTitle: "The Map in the Glasshouse",
  genre: "adventure",
  genreLabel: text(["그림책 탐험 · 돌봄 퍼즐", "Picture-book adventure · Caring puzzles"]),
  minutes: 28,
  image: gardenImage,
  accent: "#91a980",
  imageAlt: text([
    "은빛 땋은 머리의 정원사가 초록 온실 입구에서 방문객과 지도를 보는 그림책 장면",
    "A picture-book scene of a silver-braided gardener studying a map with a visitor at a green glasshouse entrance",
  ]),
  synopsis: text([
    "가족들이 찾아오기 전에 온실을 준비해요. 지도를 따라 도구를 찾고, 화분마다 필요한 일을 살피며 정원을 함께 열어 주세요.",
    "A glasshouse reopens for a family event. Follow changed paths and current plant conditions to prepare a living garden, not just a pretty display.",
  ]),
  intro: text([
    "오후 2시, 정원사 에이다가 돌봐온 유리온실의 문을 엽니다. 가족 행사는 3시에 시작하지만 모종을 돌볼 자리는 아직 준비 중입니다. 에이다는 식물도 잘 보이고 사람들도 편히 지날 수 있는 자리를 만들고 싶다고 해요. 지붕 점검 때문에 닫힌 길이 있어 도구를 가지러 갈 때는 오늘 지도를 봐야 합니다. 가져올 도구와 화분의 상태도 하나씩 확인하며, 온실을 열 준비를 함께 해주세요.",
    "At two, Ada opens the glasshouse she has been caring for. The family event begins at three, but the seedling-care station is not yet ready. She wants a place where people can see the plants and still walk comfortably. A roof inspection has closed a path, so check today's map before fetching the tools. Confirm the tool and each pot's condition as you help get the glasshouse ready to open.",
  ]),
  ending: text([
    "3시, 가족들이 남쪽 길을 따라 안뜰로 들어옵니다. 그늘에는 모종 테이블이 놓이고 통로는 비어 있습니다. 파란 물뿌리개도 도구 선반에 돌아갔습니다. 수첩에는 A에 100mL를 한 번 준 것, B는 축축해 물을 더 주지 않은 것, C는 에이다가 확인해 오늘 물을 주지 않은 것이 남았습니다. 에이다가 기록을 보여주자 핀이 다른 화분도 먼저 살펴보겠다고 말합니다. 처음에는 도구를 가져오는 부탁이었지만, 이제는 왜 그렇게 돌봤는지도 누군가에게 전했습니다. 오늘 지도와 오래된 편지는 서로 다른 일을 도왔고, 함께 확인하고 기록한 덕분에 다음 사람도 이어서 정원을 돌볼 수 있습니다.",
    "At three, families follow the south path into the courtyard. The seedling table stands in the shade, the walkway is clear, and the blue watering can is back on its tool shelf. The log records one 100 mL measure for A, no extra water for damp B, and no water for C after Ada checked it. When Ada shows the record, Finn says he will look at other pots before deciding what to do. What began as fetching a tool has become explaining the reasons for their care. Today's map and the old letter served different purposes, while checking and recording together lets the next person continue caring for the garden.",
  ]),
  takeaway: text([
    "갈 길과 필요한 도구를 확인하고, 화분마다 안내를 따로 읽어요. 모르는 것은 물어보고, 한 일과 그 까닭을 다음 사람에게 전합니다.",
    "Check the route and tool, read each pot's instructions separately, ask about what is unclear, and explain what you did and why to the next person.",
  ]),
  cast: [
    {
      name: "Ada",
      role: text(["유리온실을 돌보는 정원사", "Gardener caring for the glasshouse"]),
      motivation: text([
        "식물을 가까이 보고도 길을 편히 지날 수 있는 정원을 만들고 싶어요. 방문자에게 각 화분을 살피는 이유와 기록하는 습관을 전하려 합니다.",
        "She wants a garden where people can see plants closely and still move comfortably, sharing why they should check each pot and record their work.",
      ]),
    },
    {
      name: "Finn",
      role: text(["가족 행사에 온 호기심 많은 방문자", "A curious visitor at the family event"]),
      motivation: text([
        "비슷한 화분을 왜 다르게 돌봤는지 궁금해요. 답을 들으면 다음 식물은 먼저 살펴보려 합니다.",
        "He wonders why similar pots received different care. After hearing the explanation, he wants to check the next plant before acting.",
      ]),
    },
  ],
  chapters: [
    chapter(
      "garden-ch1",
      ["1장 · 남쪽으로 돌아가요.", "Chapter 1 · The path open today"],
      ["온실 입구 지도판 앞", "Map board at the glasshouse entrance"],
      [
        "지도를 읽고 도구를 가져올 길을 찾아요.",
        "Find the tools using today's map and the gardener's guidance",
      ],
      [
        "온실 유리에 햇살이 번집니다. 에이다는 가족들에게 보여줄 모종 곁을 정리하며 도구를 가져다 달라고 부탁합니다. 입구에는 1시 50분에 고친 지도가 있습니다. 지붕을 점검하는 길은 닫혀 있어, 눈에 보이는 길로 무작정 들어가면 안 됩니다. 먼저 지금 갈 수 있는 길과 도구 벤치의 위치를 읽어보세요. 벤치에는 물뿌리개가 여럿이니 어떤 것을 가져올지도 에이다에게 들어야 합니다. 가는 길을 말해주면 에이다도 당신이 어디로 움직이는지 알고 모종 자리에서 기다릴 수 있습니다.",
        "Sunlight spreads across the glasshouse. Ada tidies the seedling area for the families and asks you to fetch a tool. The map at the entrance was revised at 1:50. A roof inspection has closed one route, so a visible path is not automatically one you may use. Read which route is currently open and where the tool bench is. Several watering cans are on the bench; listen to Ada to learn which one she needs. Tell her which way you will go so she knows where you are heading while she waits by the seedlings.",
      ],
      gardenImage,
      [
        "온실 입구 지도판과 파란 바닥 길을 안내하는 정원사",
        "A gardener pointing out the map board and blue-tiled path at the glasshouse entrance",
      ],
      [
        {
          speaker: "Ada",
          en: "I'd like to prepare the seedling area before the families arrive. Could you help by fetching a tool?",
          ko: "가족들이 오기 전에 모종 자리를 준비하려고 해요. 도구를 가져오는 일을 도와주시겠어요?",
        },
        {
          speaker: "Ada",
          en: "Please start with today's map. A path is being inspected, so the route may differ from yesterday's.",
          ko: "오늘 지도부터 봐주세요. 점검하는 길이 있어서 어제와 다를 수 있어요.",
        },
        {
          speaker: "Ada",
          en: "Check the map and the tool I describe, then tell me which way you will go.",
          ko: "지도와 제가 말하는 도구를 확인하고, 어느 길로 갈지 알려주세요.",
        },
      ],
    ),
    chapter(
      "garden-ch2",
      ["2장 · 화분마다 다르네요.", "Chapter 2 · Different needs in neighboring pots"],
      ["안뜰의 모종 테이블", "Courtyard seedlings and current care cards"],
      [
        "화분의 관리 카드를 읽고, 흐려서 읽을 수 없는 것은 물어봐요.",
        "Distinguish dry and damp pots and ask about an unclear card",
      ],
      [
        "도구를 가져오자 에이다가 모종 곁의 관리 카드를 보여줍니다. 2시 10분에 살펴본 상태가 적혀 있습니다. 비슷한 화분이어도 필요한 일은 서로 다르니, A와 B를 각각 읽어보고 결정해야 합니다. C의 글자는 흐려서 잘 보이지 않습니다. 다른 화분처럼 해도 될지 짐작하기보다, 물을 주기 전에 에이다에게 살펴봐 달라고 부탁해보세요. 옆에는 작은 수첩과 연필이 있습니다. 한 일을 적어두면 다음 사람이 모르고 같은 일을 반복하지 않을 수 있습니다. 확인하고 돌본 뒤 기록하는 것까지 오늘 맡은 일입니다.",
        "After you bring the tool, Ada shows you the care cards beside the seedlings. They record the conditions checked at 2:10. Similar pots may need different actions, so read A and B separately before deciding. Pot C's lettering is faded. Rather than guessing that it needs the same care as another pot, ask Ada to check before you water it. A small notebook and pencil lie nearby. Recording what you have done keeps the next person from repeating it unknowingly. Today's job includes checking, caring, and leaving a record.",
      ],
      "/assets/english/garden-seedlings-v2.webp",
      [
        "모종 관리 카드를 살펴보며 수첩에 기록할 준비를 하는 정원사와 방문객",
        "A gardener and visitor checking seedling care cards before recording their work",
      ],
      [
        {
          speaker: "Ada",
          en: "Thank you for bringing the tool. Shall we check what each pot needs now?",
          ko: "도구를 가져와줘서 고마워요. 이제 화분마다 필요한 것을 살펴볼까요?",
        },
        {
          speaker: "Ada",
          en: "Even when pots look alike, their soil can differ. Read the condition and measure together on each card.",
          ko: "같아 보여도 흙의 상태는 다를 수 있어요. 카드의 상태와 양을 함께 읽어주세요.",
        },
        {
          speaker: "Ada",
          en: "I'll check any card whose writing is unclear. Please wait for that check before watering.",
          ko: "글자가 흐린 것은 제가 다시 살펴볼게요. 확인하기 전에는 물을 주지 말아주세요.",
        },
      ],
    ),
    chapter(
      "garden-ch3",
      ["3장 · 온실을 열 준비", "Chapter 3 · A garden people can meet"],
      ["안뜰의 그늘진 자리", "The shaded glasshouse courtyard"],
      [
        "통로를 비워 두고 테이블을 놓아요. 식물을 돌본 이유도 알려 주세요.",
        "Prepare a care station beside a clear path and explain its actions",
      ],
      [
        "에이다가 도구 벤치에 보관한 오래된 편지를 펼칩니다. 온실을 설계한 사람이 왜 이런 자리를 만들고 싶었는지 담겨 있다고 해요. 식물을 가까이 볼 자리와 사람들이 지날 길을 함께 생각하며 읽어보세요. 오늘 어느 길이 열렸는지는 새 지도로 확인하면 됩니다. 2시 40분, 모종 돌봄은 끝났고 테이블과 통로의 마지막 정리가 남았습니다. 일찍 온 핀이 화분마다 다르게 돌본 까닭을 묻습니다. 관리 카드와 수첩을 보여주며 설명하고, 쓴 도구까지 돌려놓으면 3시에 올 가족들을 맞을 준비가 끝납니다.",
        "Ada unfolds the old letter kept at the tool bench. It explains why the glasshouse designer wanted this kind of space. Read it with both a place to see plants closely and a path for people in mind; today's map still determines which route is open. By 2:40, the plant care is finished, with the table and walkway left to arrange. Finn arrives early and asks why the pots received different care. Explain using the cards and log, then return the tool so everything is ready for the families arriving at three.",
      ],
      gardenCourtyard,
      [
        "넓게 열린 통로 옆 그늘에 모종 돌봄 자리가 마련된 온실 안뜰",
        "A glasshouse courtyard with a shaded seedling-care station beside a wide clear walkway",
      ],
      [
        {
          speaker: "Ada",
          en: "This letter tells us what kind of place the designer wanted. Shall we read it beside today's map?",
          ko: "이 편지는 어떤 자리를 만들고 싶었는지 알려줘요. 오늘 지도와 나란히 놓고 읽어볼까요?",
        },
        {
          speaker: "Finn",
          en: "The pots look similar, so why did you care for them differently?",
          ko: "화분은 비슷해 보이는데 왜 다르게 돌봤어요?",
        },
        {
          speaker: "Ada",
          en: "That's a good question. We'll show you the cards we read and the work we recorded.",
          ko: "좋은 질문이에요. 우리가 읽은 카드와 적어둔 일을 함께 보여드릴게요.",
        },
      ],
    ),
  ],
  expressions: [
    expression(
      "garden-route",
      "I'll take the south path.",
      "남쪽 길로 갈게요.",
      [
        "오늘은 남쪽 길로 돌아가야 해요. 그 길로 가겠다고 말해 주세요.",
        "Today's open detour is the south path. Say you will take it.",
      ],
      ["I will take the south path.", "I'll use the south path."],
    ),
    expression(
      "garden-label",
      "Let's check the label first.",
      "먼저 관리 카드를 봐요.",
      [
        "모종에 물을 주기 전에 관리 카드부터 함께 읽자고 말해 주세요.",
        "Suggest checking the care label together before tending the seedling.",
      ],
      ["Let us check the label first.", "Let's check the care label first."],
    ),
    expression(
      "garden-check-pot",
      "Could you check pot C before I water it?",
      "제가 물을 주기 전에 C 화분을 좀 봐 주시겠어요?",
      [
        "C의 관리 카드를 읽을 수 없어요. 물을 주기 전에 살펴봐 달라고 부탁하세요.",
        "Pot C's label is unclear. Ask for it to be checked before you water it.",
      ],
      ["Can you check pot C before I water it?", "Please check pot C before I water it."],
    ),
    expression(
      "garden-clear-path",
      "Please keep the path clear.",
      "통로를 비워 두세요.",
      [
        "가족들이 지나갈 수 있도록 통로를 비워 달라고 해 주세요.",
        "Ask for the path to stay free of objects so families can move through.",
      ],
      ["Keep the path clear, please.", "Please leave the path clear."],
    ),
    expression(
      "garden-return",
      "I've put the watering can back.",
      "물뿌리개를 제자리에 돌려놓았어요.",
      [
        "다 쓴 물뿌리개를 제자리에 놓았다고 알려 주세요.",
        "After using the tools, say you have put the watering can back.",
      ],
      [
        "I have put the watering can back.",
        "I've returned the watering can.",
        "I have returned the watering can.",
      ],
    ),
  ],
  tasks: [
    task({
      id: "garden-current-map",
      chapterId: "garden-ch1",
      skill: "reading",
      title: ["어느 길로 갈까요?", "A map that changes the route"],
      context: [
        "1시 50분에 고친 지도를 읽고 도구 벤치까지 갈 길을 찾아보세요.",
        "Find the permitted route to the tool bench on the map revised today at 1:50.",
      ],
      document: ["오늘의 온실 지도 · 오후 1시 50분", "Today's glasshouse map · 1:50 p.m."],
      feedback: [
        "동쪽 길은 점검 중이라 지나갈 수 없어요. 남쪽 길로 돌아가고 화단은 가로지르지 않습니다. 그림에 길이 보여도 지금 안내판에서 열려 있다고 한 길을 따라야 해요.",
        "The east path is closed for inspection. Take the south path to the courtyard tool bench without crossing the planted beds. Current guidance determines route status, not the picture's appearance.",
      ],
      consequence: [
        "남쪽 길로 갈 수 있다는 걸 알아냈어요. 에이다가 가져올 도구를 알려 줍니다.",
        "You identify the open south path. Ada explains which tool to fetch.",
      ],
      expressionIds: ["garden-route"],
      versions: choices(
        [
          [
            "오늘 지도: 동쪽 길은 닫혔고 남쪽 길은 열려 있어요. 남쪽 길로 안뜰의 도구 벤치에 가세요. 화단으로 들어가지는 마세요.",
            "Today's map: the east path is closed. The south path is open. Take the south path to the courtyard tool bench. Stay out of the planted beds.",
          ],
          [
            "1시 50분에 고친 지도입니다. 동쪽 길은 지붕 점검 중이니 남쪽 길로 도구 벤치에 가세요. 파란 바닥 길을 따라가고 화단은 가로지르지 마세요.",
            "Map revised at 1:50: use the south path to the tool bench instead of the east path under roof inspection. Follow the blue-tiled walkway without crossing the planted beds.",
          ],
          [
            "오늘은 지붕 점검 때문에 동쪽 길로 갈 수 없어요. 남쪽으로 돌아가면 안뜰의 도구 벤치에 닿습니다. 오래된 배치 그림 대신 오늘 고친 지도를 봐 주세요. 화단을 가로지르는 건 지나가도 되는 길이 아닙니다.",
            "Today's guidance closes the east path for a roof inspection and connects the southern detour to the courtyard tool bench. Follow this revised map rather than an old layout sketch. Crossing planted beds is not an authorized route.",
          ],
        ],
        [
          "도구 벤치에 가려면 어느 길을 따라야 할까요?",
          "Which route to the tool bench is permitted?",
        ],
        ["The closed east path.", "The open south path.", "Straight across the planted beds."],
        1,
      ),
    }),
    task({
      id: "garden-tool-voice",
      chapterId: "garden-ch1",
      skill: "listening",
      title: ["어떤 물뿌리개를 가져올까요?", "The tool for the seedlings"],
      context: [
        "에이다가 말하는 도구의 색과 쓰임을 들어 보세요.",
        "Listen to the color and purpose of the tool Ada specifies.",
      ],
      document: ["정원사의 도구 안내", "Gardener's tool guidance"],
      speaker: ["에이다 · 온실 정원사", "Ada · Glasshouse gardener"],
      feedback: [
        "작은 모종에 쓰는 것은 파란 물뿌리개예요. 빨간 물뿌리개는 직원이 큰 화분에 쓰고 양동이는 바닥 청소용입니다. 비슷한 도구라도 쓰임이 달라요.",
        "The blue watering can is for the small seedlings. Staff use the red one for large pots, while the bucket is for floor cleaning. Follow each specified purpose even when tools look similar.",
      ],
      consequence: [
        "파란 물뿌리개를 찾았습니다. 에이다에게 어느 길로 갈지 알려 주면 되겠어요.",
        "You find the blue seedling watering can. You can now tell Ada which route you will use.",
      ],
      expressionIds: ["garden-label"],
      versions: choices(
        [
          [
            "작은 모종에 쓸 파란 물뿌리개를 가져와 주세요. 빨간 것은 큰 화분용이고, 양동이는 바닥 청소용이에요.",
            "Please bring the blue watering can for the small seedlings. The red one is for large pots. The bucket is for floor cleaning.",
          ],
          [
            "도구 벤치의 파란 물뿌리개에는 작은 모종용이라고 적혀 있어요. 빨간 것은 직원이 큰 화분에 쓰고, 양동이는 바닥을 청소할 때 씁니다. 오늘은 파란 것을 가져와 주세요.",
            "The blue watering can on the tool bench is labeled for small seedlings. Staff use the red one for large pots and the bucket for cleaning the floor. Please bring the blue one today.",
          ],
          [
            "모종을 돌볼 때는 작은 파란 물뿌리개를 써요. 빨간 큰 물뿌리개는 직원이 큰 화분에 쓰고 양동이는 바닥 청소용이니 헷갈리지 마세요. 가져온 뒤에도 물을 주기 전에 관리 카드부터 읽어 주세요.",
            "Use the small blue watering can for the seedling-care station. Keep its purpose distinct from the large red staff can for big pots and the floor-cleaning bucket. Even after fetching it, check the current care card before watering.",
          ],
        ],
        ["에이다가 가져오라고 한 도구는?", "Which tool did Ada ask you to bring?"],
        [
          "The red staff can for large pots.",
          "The floor-cleaning bucket.",
          "The blue can for small seedlings.",
        ],
        2,
      ),
    }),
    task({
      id: "garden-route-message",
      chapterId: "garden-ch1",
      skill: "writing",
      title: ["에이다에게 길을 알려요.", "Tell Ada your route"],
      context: [
        "어느 길로 도구를 가지러 갈지 에이다에게 알려 주세요.",
        "Tell Ada your movement plan based on the current map.",
      ],
      document: ["도구를 가져오는 이동 메모", "Route note for fetching the tool"],
      feedback: [
        "남쪽 길로 간다는 말을 넣어요. 기본부터는 도구 벤치로 간다는 것도 알려 주고, 도전에서는 동쪽 길이 닫혀서 돌아간다고 설명해 주세요.",
        "The south path is essential. Standard also states the tool bench destination; challenge connects the closed east path to the plan.",
      ],
      consequence: [
        "에이다가 어느 길로 가는지 들었다며 고개를 끄덕입니다. 남쪽 길을 따라 파란 물뿌리개를 가져오자, 모종 자리에서 다음 할 일을 함께 살펴봅니다.",
        "Ada nods to show she knows which route you will take. You follow the south path to fetch the blue watering can, then join her at the seedlings to check the next task.",
      ],
      expressionIds: ["garden-route"],
      versions: outputs(
        [
          ["남쪽 길로 가겠다고 알려 주세요.", "Write that you will take today's open south path."],
          [
            "남쪽 길을 따라 도구 벤치로 가겠다고 써 보세요.",
            "Write that you will take the south path to the tool bench.",
          ],
          [
            "동쪽 길은 점검 때문에 닫혔어요. 그래서 남쪽 길로 돌아 도구 벤치에 가겠다고 말해 주세요.",
            "The east path is closed for inspection. Explain that this condition means you will take the south path to the tool bench.",
          ],
        ],
        ["어느 길로 갈지 영어로 알려 주세요.", "State your permitted route plan in English."],
        [
          "I'll take the south path.",
          "I'll take the south path to the tool bench.",
          "The east path is closed. I'll take the south path to the tool bench.",
        ],
        [
          [["south"], ["path", "route"]],
          [["south"], ["path", "route"], ["tool bench"]],
          [["east"], ["closed"], ["south"], ["path", "route"], ["tool bench"]],
        ],
        [
          ["I will use the south path."],
          ["I will use the south path to reach the tool bench."],
          ["The east path is closed, so I will use the south path to reach the tool bench."],
        ],
      ),
    }),
    task({
      id: "garden-care-cards",
      chapterId: "garden-ch2",
      skill: "reading",
      title: ["두 화분의 관리 카드", "Different cards for A and B"],
      context: [
        "에이다가 2시 10분에 적은 카드를 읽고 흙의 상태와 물의 양을 알아보세요.",
        "Read the current conditions and amounts Ada checked at 2:10.",
      ],
      document: ["모종 관리 카드 · 오후 2시 10분", "Seedling care cards · 2:10 p.m."],
      feedback: [
        "A의 흙은 말라서 100mL를 한 번 줍니다. B는 축축하니 물을 더 주지 않아요. 이 양은 이 모종의 카드에 적힌 것으로, 모든 식물에 똑같이 적용하는 양은 아닙니다.",
        "A is dry and receives one 100 mL measure for this preparation. B is damp and receives no additional water. These amounts belong to the individual station cards, not a general rule for every plant.",
      ],
      consequence: [
        "A에 100mL를 한 번 주고 수첩에 적습니다. B에는 물을 더 주지 않아요.",
        "You use one 100 mL measure for A and record it. B receives no additional water.",
      ],
      expressionIds: ["garden-label"],
      versions: choices(
        [
          [
            "2시 10분에 살펴본 카드: A는 말랐어요(DRY). 물 100mL를 한 번 주세요. B는 축축해요(DAMP). 지금은 물을 더 주지 않습니다. 각 화분의 카드를 따라 주세요.",
            "Checked at 2:10: A is DRY, one 100 mL measure. B is DAMP, no extra water now. Follow each pot's own card.",
          ],
          [
            "관리 카드에 A의 흙은 말랐다고 적혀 있어요. 이번에는 계량컵으로 100mL를 한 번 줍니다. B는 축축해서 물을 더 주지 않아요. 비슷한 모양의 화분이어도 흙의 상태는 다를 수 있어요.",
            "Current cards: A's soil is dry and this preparation calls for one measured 100 mL cup. B is damp and receives no additional water. Similar pot shapes do not mean the conditions are the same.",
          ],
          [
            "에이다가 오늘 2시 10분에 살펴본 카드입니다. A: 흙이 마름(DRY), 100mL 한 번. B: 흙이 축축함(DAMP), 지금은 추가 물 없음. 이 두 모종에게 필요한 일을 적은 거예요. 개장 행사를 한다고 두 화분에 같은 양을 주거나 A에 여러 번 주어서는 안 됩니다.",
            "Ada's cards checked today at 2:10 read A: DRY / one measure of 100 mL, B: DAMP / no additional water now. These are current individual instructions for two seedlings. The opening event is not a reason to give both the same amount or repeat A's measure.",
          ],
        ],
        ["카드에 적힌 대로 돌보려면?", "Which care follows the current cards?"],
        [
          "Give A one 100 mL measure and leave B without extra water.",
          "Give both A and B 100 mL.",
          "Give A 100 mL repeatedly until visitors arrive.",
        ],
        0,
      ),
    }),
    task({
      id: "garden-unclear-card",
      chapterId: "garden-ch2",
      skill: "listening",
      title: ["C의 글자가 흐려요.", "C's unreadable card"],
      context: [
        "카드를 읽을 수 없을 때 어떻게 해야 하는지 에이다의 말을 들어 보세요.",
        "Ada explains the procedure for an unclear care card.",
      ],
      document: ["카드 글자가 흐릴 때", "Procedure for an unclear card"],
      speaker: ["에이다 · 물 주기 전 확인", "Ada · Checking before watering"],
      feedback: [
        "흐려진 카드만으로는 C에 물이 필요한지 알 수 없어요. 다른 화분을 따라 하지 말고 에이다에게 물어봐야 합니다.",
        "C's faded card does not establish its need for water. Ask Ada instead of copying another pot's amount.",
      ],
      consequence: [
        "C에는 아직 물을 주지 않습니다. 먼저 에이다에게 살펴봐 달라고 부탁하려고 해요.",
        "You leave C unwatered for now and prepare to ask Ada to check its current condition.",
      ],
      expressionIds: ["garden-check-pot", "garden-label"],
      versions: choices(
        [
          [
            "C의 카드 글자가 흐리네요. 물을 주기 전에 저에게 물어보세요. A와 같을 거라고 짐작하지 마세요.",
            "C's card is faded. Ask me before watering it. Don't guess that it is like A.",
          ],
          [
            "C의 카드가 흐려서 무엇을 해야 할지 읽을 수 없어요. A는 카드대로 돌봤지만 C에도 같은 양을 주면 안 됩니다. 물을 주기 전에 저에게 물어봐 주세요.",
            "C's writing has faded, so its current care cannot be read. A has already been treated according to its card, but its amount must not be copied to C. Please check with me before watering.",
          ],
          [
            "다른 화분을 보고 C도 같을 거라고 생각하지 마세요. 카드를 읽을 수 없으면 직원이 먼저 상태를 살피고 새 카드를 붙여야 해요. 그전에는 C에 물을 주지 말고 저에게 물어보세요.",
            "Do not use a neighboring pot's condition as C's instruction. When the current card is unreadable, staff must check the condition and replace the label first. Ask me and leave C unwatered until that check is complete.",
          ],
        ],
        ["C에 물을 주기 전에 무엇을 할까요?", "What should you do next for C?"],
        [
          "Copy A's 100 mL because the pots look similar.",
          "Ask Ada to check C before watering.",
          "Add water until the faded card becomes readable.",
        ],
        1,
      ),
    }),
    task({
      id: "garden-ask-check",
      chapterId: "garden-ch2",
      skill: "writing",
      title: ["먼저 살펴봐 주세요.", "A question before water"],
      context: [
        "C의 카드를 읽기 어렵다고 말하고, 물을 주기 전에 살펴봐 달라고 부탁하세요.",
        "Tell Ada the situation with C's unreadable card and request a check.",
      ],
      document: ["C 화분 확인 요청", "Request to check pot C"],
      feedback: [
        "어느 화분인지 알 수 있도록 pot C를 넣어요. 기본부터는 before I water it으로 물을 주기 전에 봐 달라고 부탁하고, 도전에서는 label is unclear로 이유도 설명해 주세요.",
        "Include pot C and a request to check it. Standard adds before I water it; challenge includes the reason, an unclear label.",
      ],
      consequence: [
        "에이다가 부탁을 듣고 C를 살펴보러 옵니다. 짐작해서 물을 주지 않고 기다린 덕분에, 필요한 돌봄을 확인할 수 있게 됐습니다.",
        "Ada comes to check C after hearing your request. Waiting rather than watering on a guess lets you find out what care is needed.",
      ],
      expressionIds: ["garden-check-pot"],
      versions: outputs(
        [
          ["에이다에게 C 화분을 살펴봐 달라고 부탁하세요.", "Ask Ada to check pot C."],
          [
            "C의 카드를 읽기 어려워요. 물을 주기 전에 C를 살펴봐 달라고 부탁하세요.",
            "C's instructions are unclear. Ask for C to be checked before you water it.",
          ],
          [
            "C의 관리 카드 글자가 흐려서 물이 필요한지 알 수 없어요. 이 사정을 말하고 물을 주기 전에 살펴봐 달라고 부탁하세요.",
            "The care label on pot C is unclear, so you cannot tell whether it needs water. Include the label problem and a request for a check before watering.",
          ],
        ],
        ["C를 살펴봐 달라고 영어로 부탁해 보세요.", "Write an English request to check C."],
        [
          "Please check pot C.",
          "Could you check pot C before I water it?",
          "The label on pot C is unclear. Could you check it before I water it?",
        ],
        [
          [["check", "inspect"], ["pot c"]],
          [["check", "inspect"], ["pot c"], ["before"], ["water", "watering"]],
          [
            ["check", "inspect"],
            ["pot c"],
            ["label", "card"],
            ["unclear", "faded", "unreadable"],
            ["before"],
            ["water", "watering"],
          ],
        ],
        [
          ["Could you inspect pot C?"],
          ["Please inspect pot C before watering it."],
          ["Pot C has a faded card. Please inspect it before watering."],
        ],
      ),
    }),
    task({
      id: "garden-ada-result",
      chapterId: "garden-ch2",
      skill: "listening",
      title: ["에이다가 새 카드를 붙였어요.", "A checked and replaced card"],
      context: [
        "에이다가 C를 살펴본 뒤 뭐라고 하는지 들어 보세요. 수첩에 적을 내용도 나옵니다.",
        "Listen to Ada's checked instruction for C and request for the care log.",
      ],
      document: ["에이다가 C를 살펴본 뒤", "Ada's check of C"],
      speaker: ["에이다 · 새 관리 표지", "Ada · New care card"],
      feedback: [
        "에이다가 C를 살펴보고 오늘은 물을 주지 않기로 했어요. 새 카드도 붙였습니다. A에 100mL를 한 번 준 것, B에는 물을 더 주지 않은 것과 함께 적어 두세요.",
        "Ada checks C and adds a no-watering-today card. Record it alongside the completed actions: one 100 mL measure for A and no extra water for B.",
      ],
      consequence: [
        "에이다가 확인한 대로 C는 오늘 물을 주지 않는다고 적습니다. A와 B의 기록도 함께 남겨, 다음 사람이 같은 일을 또 하지 않도록 합니다.",
        "You record Ada's checked instruction that C gets no water today, alongside A and B's entries, so the next person does not repeat the work.",
      ],
      expressionIds: ["garden-label", "garden-check-pot"],
      versions: choices(
        [
          [
            "C를 살펴봤어요. 오늘은 물을 주지 마세요. 새 카드도 붙였어요. 수첩에는 A는 100mL 한 번, B는 추가 물 없음, C도 오늘 물 없음이라고 적어 주세요.",
            "I've checked C. Do not water it today. I've added a new card. Please record A: one 100 mL measure; B: no extra water; C: no watering today.",
          ],
          [
            "C를 직접 살펴보고 오늘은 물을 주지 않는다는 새 카드를 붙였어요. 수첩에 A는 100mL 한 번, B는 물을 더 주지 않았고 C도 오늘은 그대로 둔다고 적어 주세요.",
            "I checked C myself and added a new no-watering-today label. In the log, write that A received one 100 mL measure, B received no additional water, and C will also be left alone today.",
          ],
          [
            "C를 살펴본 뒤 흐린 카드를 새것으로 바꿨어요. 오늘은 C에 물을 주지 않습니다. 제가 직접 보고 정한 안내예요. 방문자가 물어볼 수 있으니 A에는 100mL를 한 번 주었고, B와 C에는 더 주지 않았다는 것도 수첩에 남겨 주세요.",
            "C's faded card has been checked and replaced with a new instruction: no watering today. This is the current plan I verified, not a guess. Visitors may ask why, so log A's one 100 mL measure, B's no additional water, and C's no watering today.",
          ],
        ],
        ["에이다의 말을 듣고 C를 어떻게 돌볼까요?", "Which care for C follows the checked result?"],
        [
          "Give C 100 mL to match A.",
          "Ignore the new card and copy B's old picture.",
          "Give C no water today and record Ada's checked instruction.",
        ],
        2,
      ),
    }),
    task({
      id: "garden-design-letter",
      chapterId: "garden-ch3",
      skill: "reading",
      title: ["편지에 담긴 뜻", "The designer's purpose"],
      context: [
        "오래된 편지를 읽고 오늘 테이블을 어디에 놓을지 생각해 보세요.",
        "Connect the letter's principle with today's map to choose the care-station layout.",
      ],
      document: ["도구 벤치에 보관된 설계자의 편지", "Designer's letter kept at the tool bench"],
      feedback: [
        "사람들이 식물을 가까이 보면서도 지나갈 수 있어야 해요. 테이블은 안뜰 그늘의 통로 옆에 놓고 길은 비워 둡니다. 어느 길이 열렸는지는 오늘 지도를 따라요.",
        "The purpose is for people to meet plants without blocking movement. Put the table in the courtyard shade beside a clear walkway. Today's map determines which routes are closed.",
      ],
      consequence: [
        "안뜰의 그늘, 통로 옆에 모종 테이블을 놓습니다. 남쪽 길은 가족들이 지나갈 수 있게 비워 뒀어요.",
        "You place the seedling-care table in shade beside the courtyard walkway. The south path stays clear for families.",
      ],
      expressionIds: ["garden-clear-path"],
      versions: choices(
        [
          [
            "편지: 모종 테이블은 안뜰 그늘에 두세요. 테이블을 길 옆에 놓고, 길은 비워 주세요. 어느 길로 갈 수 있는지는 오늘 지도를 보면 됩니다.",
            "Letter: place the seedling table in the courtyard shade, beside the path. Keep the path clear. Use today's map to know which routes are open.",
          ],
          [
            "설계자는 편지에 사람들이 식물을 가까이 보면서도 지나갈 수 있어야 한다고 썼어요. 모종 테이블은 안뜰 그늘의 통로 옆에 놓습니다. 오래된 편지가 있어도 지금 점검 중인 길로 갈 수 있는 건 아니에요.",
            "The designer's letter calls for a place where people meet plants closely without obstructing movement. Put the seedling table in the courtyard shade beside the path. The old letter does not cancel a current inspection closure.",
          ],
          [
            "정원은 달라지니 어느 길로 갈 수 있는지는 오늘 지도를 보라는 편지예요. 모종 테이블은 안뜰의 그늘, 통로 옆에 놓고 남쪽 길을 비워 두세요. 오래된 배치도만 따라 하지 말고 식물과 사람들이 다닐 자리를 함께 생각해 주세요.",
            "The letter says that a changing garden needs a current route map. Arrange the seedling-care station in the courtyard shade beside the walkway, leaving the south path clear. Consider living plants and people's movement together rather than copying an old layout exactly.",
          ],
        ],
        [
          "지도와 편지를 모두 따르는 테이블 자리는?",
          "Which layout respects both today's map and the letter's purpose?",
        ],
        [
          "Put the table in courtyard shade beside the clear south path.",
          "Put the table across the south path so everyone stops there.",
          "Use the closed east path because it appears on an old layout.",
        ],
        0,
      ),
    }),
    task({
      id: "garden-explain-care",
      chapterId: "garden-ch3",
      skill: "speaking",
      title: ["왜 A에만 물을 주었나요?", "Why only one pot received water"],
      context: [
        "핀이 궁금해합니다. 관리 카드와 수첩을 보며 왜 다르게 돌봤는지 말해 주세요.",
        "Answer Finn using the current cards and actual care log.",
      ],
      document: ["방문자에게 설명하는 돌봄 기록", "Explain the care log to a visitor"],
      feedback: [
        "A는 흙이 말라 물을 주었고, B는 축축해서 더 주지 않았어요. 화분마다 그렇게 한 이유를 설명하는 연습입니다. 음성 점수는 계산하지 않습니다.",
        "A was dry and received its specified amount; B was damp and received no extra water. Explain conditions and reasons rather than repeating one action for every pot. No voice score is calculated.",
      ],
      consequence: [
        "핀이 카드를 보며 왜 다르게 돌봤는지 이해합니다. “다른 화분도 먼저 봐야겠네요”라고 말합니다. 당신의 설명이 다음 사람이 살펴볼 이유가 됐습니다.",
        "Finn looks at the cards and understands why the care differed. He says he should check other pots first too. Your explanation gives the next person a reason to look before acting.",
      ],
      expressionIds: ["garden-label"],
      versions: outputs(
        [
          [
            "핀에게 A의 흙은 말랐고 B는 축축했다고 알려 주세요.",
            "Tell Finn that A was dry and B was damp.",
          ],
          [
            "A는 흙이 말라서 100mL를 한 번 주었고, B는 축축해서 물을 더 주지 않았다고 설명해 주세요.",
            "Explain that A was dry and received one 100 mL measure, while B was damp and received no extra water.",
          ],
          [
            "관리 카드와 수첩을 보며 이유를 말해 주세요. A에는 100mL를 한 번 주었고, B는 축축해서 더 주지 않았어요. C도 에이다가 살펴본 뒤 오늘은 물을 주지 않기로 했습니다.",
            "Connect current care cards to the action log: A received one 100 mL measure, B received no extra water, and C was checked by Ada and receives no water today. Explain the different reasons.",
          ],
        ],
        [
          "화분마다 다르게 돌본 이유를 직접 말해 보세요.",
          "Practice explaining why the pots received different care.",
        ],
        [
          "Pot A was dry. Pot B was damp.",
          "Pot A was dry, so we gave it one hundred milliliters once. Pot B was damp, so we left it alone.",
          "A was dry and received one hundred milliliters once. B was damp, so we added no water. Ada checked C and told us not to water it today.",
        ],
      ),
    }),
    task({
      id: "garden-return-tool",
      chapterId: "garden-ch3",
      skill: "speaking",
      title: ["도구를 돌려놓을 시간", "Ready for the next person"],
      context: [
        "파란 물뿌리개를 선반에 놓고 에이다에게 준비가 끝났다고 말해 주세요.",
        "Return the blue watering can to the tool shelf and tell Ada the station is ready.",
      ],
      document: ["문을 열기 전에", "Final check before opening"],
      feedback: [
        "도구를 돌려놓고 통로를 비워 두면 다음 사람도 편하게 쓸 수 있어요. 지금 마친 일을 하나씩 알려 주세요.",
        "Confirming a returned tool and clear path leaves the station ready for the next person. Saying the setup is complete reports what was done; it is not a promise to add more water.",
      ],
      consequence: [
        "파란 물뿌리개를 선반에 돌려놓고 남쪽 길을 비워둡니다. 에이다가 고맙다고 말하며 3시에 올 가족들을 맞이합니다. 다음 사람도 도구와 기록을 바로 찾을 수 있습니다.",
        "You put the blue watering can back on its shelf and leave the south path clear. Ada thanks you and welcomes the families at three. The next person can now find both the tool and the record.",
      ],
      expressionIds: ["garden-return", "garden-clear-path", "garden-route"],
      versions: outputs(
        [
          [
            "에이다에게 물뿌리개를 돌려놓았다고 말해 주세요.",
            "Tell Ada you have put the watering can back.",
          ],
          [
            "물뿌리개를 도구 선반에 놓았고, 통로도 비워 뒀다고 알려 주세요.",
            "Say that the watering can is back on the tool shelf and the path is clear.",
          ],
          [
            "수첩에 한 일을 적고 파란 물뿌리개를 선반에 돌려놓았어요. 남쪽 길도 비워 두었으니 3시에 가족들을 맞을 준비가 됐다고 말해 주세요.",
            "The care log is ready and the blue watering can is back on its shelf. Explain that the south path is clear and the station is ready for the three o'clock family event.",
          ],
        ],
        [
          "무엇을 마쳤는지 직접 말하며 온실 준비를 마무리해요.",
          "Finish the garden preparation by stating what was returned and what is ready for the next user.",
        ],
        [
          "I've put the watering can back.",
          "I've put the watering can back on the tool shelf. The path is clear.",
          "The care log is ready. I've put the blue watering can back on the tool shelf, and the south path is clear for the family event at three.",
        ],
      ),
    }),
  ],
  debrief: {
    question: text([
      "학교 미술실에서 표지가 흐려진 도구를 발견했어요. 사용하기 전에 선생님께 물어보고, 쓰고 나서 돌려놓겠다고 어떻게 말할까요?",
      "Next, you find an art-room tool with a faded label. Transfer the expressions to checking the label and asking the teacher before using it.",
    ]),
    model:
      "Let's check the label first. Could you check this tool before I use it? I'll put it back afterward.",
    modelKo: text([
      "먼저 표지를 살펴봐요. 제가 쓰기 전에 이 도구를 확인해 주실 수 있나요? 다 쓰면 제자리에 놓을게요.",
      "Let's check the label first. Could you check this tool before I use it? I'll put it back afterward.",
    ]),
  },
};

export const newEnglishEpisodes: EnglishEpisode[] = [cafe, radio, garden];
