import { initialEnglishEpisodes } from "./initial-episodes.ts";
import type {
  EnglishChapter,
  EnglishEpisode,
  EnglishExpression,
  EnglishTask,
  TaskVersion,
} from "./types.ts";

// Korean and English are authored together so clues and motivations cannot drift
// between locales. JSON is generated from this registry for the site translator.
export const revisedEnglishMessages: Record<string, string> = {};
function text(ko: string, en: string): string {
  revisedEnglishMessages[ko.replace(/\s+/g, " ").trim()] = en;
  return ko;
}
function pick(
  en: string,
  ko: string,
  promptKo: string,
  promptEn: string,
  answers: [string, string, string],
  answerIndex: 0 | 1 | 2,
): TaskVersion {
  const ids = ["a", "b", "c"];
  return {
    passage: en,
    translation: text(ko, en),
    prompt: text(promptKo, promptEn),
    options: answers.map((label, i) => ({ id: ids[i], text: label })),
    correctOption: ids[answerIndex],
    model: answers[answerIndex],
  };
}
function write(
  en: string,
  ko: string,
  promptKo: string,
  promptEn: string,
  model: string,
  keywords: string[][],
  starter?: string,
  alternatives: string[] = [],
): TaskVersion {
  return {
    passage: en,
    translation: text(ko, en),
    prompt: text(promptKo, promptEn),
    model,
    accepted: [model, ...alternatives],
    keywords,
    ...(starter ? { starter } : {}),
  };
}
function speak(
  en: string,
  ko: string,
  promptKo: string,
  promptEn: string,
  model: string,
  starter?: string,
): TaskVersion {
  return {
    passage: en,
    translation: text(ko, en),
    prompt: text(promptKo, promptEn),
    model,
    ...(starter ? { starter } : {}),
  };
}
function source(id: string): EnglishEpisode {
  const episode = initialEnglishEpisodes.find((item) => item.id === id);
  if (!episode) throw new Error(`Missing initial episode: ${id}`);
  return episode;
}
function keep(
  episode: EnglishEpisode,
  id: string,
  chapterId: string,
  changes: Partial<EnglishTask> = {},
): EnglishTask {
  const task = episode.tasks.find((item) => item.id === id);
  if (!task) throw new Error(`Missing initial task: ${id}`);
  return { ...polishTask(task), chapterId, ...changes };
}
function expression(
  id: string,
  en: string,
  ko: string,
  recallKo: string,
  recallEn: string,
  alternatives: string[] = [],
): EnglishExpression {
  return {
    id,
    en,
    ko: text(ko, en),
    recall: text(recallKo, recallEn),
    accepted: [en, ...alternatives],
  };
}
function line(speaker: string, en: string, ko: string) {
  return { speaker: storyName(speaker), en, ko: text(ko, en) };
}
function chapter(
  id: string,
  titleKo: string,
  titleEn: string,
  locationKo: string,
  locationEn: string,
  objectiveKo: string,
  objectiveEn: string,
  storyKo: string,
  storyEn: string,
  image: string,
  altKo: string,
  altEn: string,
  dialogue: EnglishChapter["dialogue"],
): EnglishChapter {
  return {
    id,
    title: text(titleKo, titleEn),
    location: text(locationKo, locationEn),
    objective: text(objectiveKo, objectiveEn),
    story: text(storyKo, storyEn),
    storyEn,
    image,
    imageAlt: text(altKo, altEn),
    dialogue,
  };
}

function reviseBookshop(): EnglishEpisode {
  const base = source("closed-bookshop");
  const chapters = [
    chapter(
      "bookshop-promise",
      "책 한 권을 부탁받다",
      "A promise for the final reading",
      "서점 안내 데스크",
      "The bookshop information desk",
      "책을 받을 사람을 알아보고, 비를 피할 길을 찾아요.",
      "Identify the recipient and choose a route for the book.",
      "낭독회가 끝날 무렵, 서점 직원 하나가 조심스럽게 부탁을 건넵니다. 이웃 도서관에서 빌린 책을 돌려줄 수 있겠느냐고요. 도서관에서는 조가 오늘의 마지막 낭독을 위해 그 책을 기다리고 있습니다. 마침 광장 쪽으로 가던 길이라 돕기로 합니다. 그때 폭풍 탓에 불이 잠깐 꺼집니다. 조명은 돌아왔지만 자동문은 멈췄고, 정문 밖에는 간판이 쓰러져 있습니다. 초록색 비상문은 안에서 언제든 열 수 있습니다. 다만 그 문으로 나가면 지붕 없는 안뜰을 건너야 하죠. 책을 젖지 않게 가져갈 길이 있을까요? 하나에게 물어봅시다.",
      "After the reading event, Hana asks whether you can return a book borrowed from the neighbouring library. Jo, who is leading its final reading tonight, is waiting for it. You are already heading towards the square and agree to help. A storm causes a short power cut. The lights return, but the automatic door has stopped and a sign has fallen outside. You can open the green emergency door from inside at any time, but it leads through an uncovered courtyard. Check with Hana which route will keep the book dry.",
      base.image,
      base.imageAlt,
      "A staff member and a visitor in a warmly lit bookshop with wooden shelves.",
      [
        line(
          "Hana",
          "Jo needs our borrowed book for the last reading. Could you take it to the reading room?",
          "조가 마지막 낭독에 쓸 책을 기다리고 있어요. 낭독실까지 가져다주실 수 있을까요?",
        ),
        line(
          "You",
          "I'm going towards the square. I can take it, but which exit should I use?",
          "저도 광장 쪽으로 가요. 가져다드릴게요. 어느 문으로 나가면 될까요?",
        ),
        line(
          "Hana",
          "The emergency door is available. Let me check the sheltered route before you carry the book outside.",
          "비상문으로 나가셔도 돼요. 다만 책이 젖을 수 있으니, 비를 피할 길부터 살펴볼게요.",
        ),
      ],
    ),
    chapter(
      "bookshop-cooperate",
      "책을 고르고 문을 열고",
      "The right book and the right exit",
      "서점 반납대와 정문",
      "The returns desk and front entrance",
      "반납할 책이 맞는지 확인하고, 하나의 안내에 따라 문을 열어요.",
      "Confirm the borrowed book and follow staff instructions to open the door.",
      "하나는 밖에서 간판을 치우며 인터폰으로 말을 건넵니다. 반납대에는 행사 뒤 따로 놓아둔 책 두 권이 있습니다. 파란 천 표지 책은 도서관에서 빌린 책이고, 비슷하게 생긴 다른 책은 직원의 개인 책입니다. 표지만 보고 집어 들면 잘못 가져갈 수도 있겠네요. 반납표에 적힌 이름과 장소를 읽고, 찾은 책을 하나에게 알려주세요. 책을 확인한 뒤에는 멈춘 자동문을 손으로 열 차례입니다.",
      "Hana guides you over the intercom while she clears the fallen sign. Two return books are ready at the desk: a blue cloth library book and a similar staff member's personal book. Choosing by cover alone is not enough. Check the recipient and destination on the return slips, and tell Hana which book you have found. Then follow the manual-release instructions.",
      base.image,
      base.imageAlt,
      "The warmly lit bookshop, with its staff member and visitor.",
      [
        line(
          "Hana",
          "The path is clear. Have you found the library book?",
          "간판은 치웠어요. 도서관 책은 찾으셨나요?",
        ),
        line(
          "You",
          "There are two books here. Could you check the label with me?",
          "여기 책이 두 권 있네요. 반납표를 같이 봐주실 수 있을까요?",
        ),
        line(
          "Hana",
          "Yes. Check the recipient first; then we'll open the door together.",
          "그럼요. 누구에게 갈 책인지 먼저 보고, 문 여는 방법도 알려드릴게요.",
        ),
      ],
    ),
    chapter(
      "bookshop-delivery",
      "통로 끝에서 기다리는 사람",
      "A story carried under shelter",
      "광장으로 이어지는 지붕 있는 통로",
      "The covered walkway towards the square",
      "책을 기다리던 조에게 건네고, 다른 곳에서도 배운 말을 써봐요.",
      "Hand the book to the right person and explain a route in a new setting.",
      "정문이 열리자 지붕 있는 통로 끝으로 도서관 불빛이 보입니다. 하나는 옆 골목이 아직 젖어 있다고 일러줍니다. 책을 가방 안에 넣고 통로를 따라가 봅시다. 낭독실 문 앞에는 책을 기다리는 사람이 있습니다. 처음 만난 사람이니 이름과 맡은 일을 물어본 뒤 건네면 좋겠죠. 책을 전하고 나면, 다음 날 박물관에서도 오늘 익힌 말을 다시 써봅니다.",
      "Through the open front door, you see the library lights at the end of the covered walkway. Hana warns that the alley is still wet. You put the book in your bag and take the sheltered route. Someone is waiting outside the reading room, but you should not hand a borrowed book to a stranger without checking their name and role. Complete the promised delivery, then use today's route expressions in a different place the next day.",
      "/assets/english/bookshop-walkway.webp",
      "비 내리는 해안 도시의 지붕 있는 통로와 도서관 쪽을 향하는 방문객",
      "A covered walkway in a rainy coastal town, with a visitor heading towards the library.",
      [
        line(
          "Jo",
          "Hello. I'm Jo, the reader tonight. Did Hana send you?",
          "안녕하세요. 오늘 낭독을 맡은 조입니다. 하나가 보내셨나요?",
        ),
        line(
          "You",
          "Yes. I have the book for the reading room.",
          "네. 낭독실에 가져다드릴 책이 있어요.",
        ),
        line(
          "Jo",
          "Thank you. We can begin as soon as the book arrives.",
          "고맙습니다. 책을 받으면 바로 시작할 수 있겠네요.",
        ),
      ],
    ),
  ];
  const additions: EnglishTask[] = [
    {
      id: "bookshop-delivery-note",
      chapterId: chapters[0].id,
      skill: "reading",
      title: text("책을 기다리는 사람", "Who is waiting for the book?"),
      context: text(
        "하나가 건넨 반납표를 읽어보세요. 누구에게, 어디로 가져가면 될까요?",
        "Read Hana's return slip. First identify the destination and the person who will receive the book.",
      ),
      document: text("도서관 반납표", "Library return slip"),
      feedback: text(
        "책을 받을 사람은 오늘 낭독을 맡은 조이고, 기다리는 곳은 도서관 낭독실이에요. 계산대나 우체국으로 가져갈 책은 아니죠. 갈 곳을 먼저 알아두면 어느 출구를 쓸지도 정하기 쉬워요.",
        "The recipient is Jo, tonight's reader, and the destination is the library reading room. This is not a book for the shop counter or the post office. Identifying the person and place gives your route choice a purpose.",
      ),
      consequence: text(
        "조에게 책을 가져다주기로 했습니다. 그런데 정문이 멈춰 있네요. 문 옆에 붙은 안내부터 읽어봅시다.",
        "You agree to take the book to Jo. Since the front door has stopped, you first read the exit notice.",
      ),
      expressionIds: ["bookshop-reading-room"],
      versions: {
        starter: pick(
          "For Jo. Place: the library reading room. Jo needs the book for tonight's last reading.",
          "받는 사람: 조. 가져갈 곳: 도서관 낭독실. 오늘 마지막 낭독에 쓸 책입니다.",
          "누구에게, 어디로 가져갈 책인가요?",
          "Who should receive the book, and where?",
          [
            "Hana at the shop counter.",
            "Jo at the library reading room.",
            "Miro at the post office.",
          ],
          1,
        ),
        standard: pick(
          "Return the borrowed book to Jo at the library reading room across the square. The final reading starts at 8:30 tonight. Jo has the audience ready but still needs the book.",
          "빌린 책을 광장 건너 도서관 낭독실의 조에게 돌려주세요. 마지막 낭독은 오늘 8시 30분에 시작합니다. 사람들은 모였지만, 조가 읽을 책은 아직 도착하지 않았습니다.",
          "조에게 지금 책을 가져다주는 까닭은 무엇일까요?",
          "Choose the correct reason for delivering the book now.",
          [
            "Jo needs it for the library's final reading tonight.",
            "Hana wants to sell it at the counter.",
            "The library has cancelled the reading.",
          ],
          0,
        ),
        challenge: pick(
          "The library lent this book to the bookshop for an earlier event. It must now be returned to Jo, who is leading the library's final reading at 8:30. Jo is waiting in the reading room across the square. You are already going that way, so Hana asks for your help rather than leaving the entrance unattended.",
          "앞선 행사에 쓰도록 도서관에서 서점에 빌려준 책입니다. 이제 8시 30분의 마지막 낭독을 맡은 조에게 돌려줘야 합니다. 조는 광장 건너 낭독실에서 기다립니다. 하나는 출입구를 지켜야 하기에, 마침 그쪽으로 가는 당신에게 부탁합니다.",
          "하나는 왜 직접 가지 않고 부탁했을까요?",
          "Which answer also explains why Hana asks you to deliver it?",
          [
            "Jo owns the shop and wants every visitor to buy a book.",
            "The emergency exit is locked until the book is returned.",
            "You can return the book on your route while Hana looks after the entrance.",
          ],
          2,
        ),
      },
    },
    {
      id: "bookshop-route-choice",
      chapterId: chapters[0].id,
      skill: "listening",
      speaker: storyName("Hana"),
      title: text("책이 젖지 않을 길", "An available exit and a useful route"),
      context: text(
        "나갈 문은 두 곳입니다. 하나의 설명을 듣고, 책을 들고 가기 좋은 길을 골라보세요.",
        "Hana is not preventing you from leaving. Listen to the difference between the two routes and choose one for carrying the book.",
      ),
      document: text("하나가 알려주는 길", "Hana's route explanation"),
      feedback: text(
        "비상문은 언제든 열 수 있지만, 그쪽으로 나가면 지붕 없는 안뜰을 건너야 해요. 정문 밖의 간판을 치우고 나면 지붕 있는 통로를 쓸 수 있죠. 잠깐 기다리는 건 갇혀 있어서가 아니라 빌린 책이 비에 젖지 않게 하려는 거예요.",
        "The emergency door is always available, but leads through an uncovered courtyard. Once the sign has been cleared, the front entrance leads to a covered walkway. You wait to keep the borrowed book dry, not because you are trapped.",
      ),
      consequence: text(
        "비상문으로 바로 나갈 수도 있지만, 책을 위해 하나와 지붕 있는 길을 준비하기로 했습니다.",
        "You confirm that the emergency exit is available and agree to prepare the sheltered route with Hana.",
      ),
      expressionIds: ["bookshop-keep-dry", "bookshop-safe-route"],
      versions: {
        starter: pick(
          "The green door opens to the courtyard. There is no roof there. The front door leads to the covered walkway. Wait while I clear the sign. The book needs to stay dry.",
          "초록색 문은 안뜰로 이어져요. 거기에는 지붕이 없어요. 정문 쪽에는 지붕 있는 통로가 있으니, 제가 간판을 치울 동안 잠깐 기다려주세요. 책은 젖지 않아야 하니까요.",
          "책을 비에 젖지 않게 가져갈 수 있는 길은 어디인가요?",
          "Which route will keep the book dry?",
          [
            "The uncovered courtyard.",
            "The window.",
            "The covered walkway after Hana clears the sign.",
          ],
          2,
        ),
        standard: pick(
          "You can leave through the green emergency door whenever you need to. That route crosses the open courtyard. If you can wait until I've moved the sign, the front door will give you a covered route to the reading room. That is better for the borrowed book in this rain.",
          "필요하면 초록색 비상문으로 언제든 나가셔도 돼요. 다만 그 길은 지붕 없는 안뜰을 건너요. 제가 간판을 치울 때까지 기다리실 수 있다면, 정문에서 낭독실까지 지붕 있는 길로 가실 수 있어요. 지금은 책에 비를 안 맞히는 게 좋겠죠.",
          "잠깐 기다렸다가 정문 쪽으로 가는 까닭은 무엇일까요?",
          "Why wait briefly and use the front route?",
          [
            "The emergency door cannot be opened.",
            "The front route protects the borrowed book from rain.",
            "The book can repair the door motor.",
          ],
          1,
        ),
        challenge: pick(
          "The emergency exit remains available, so there is no need to solve anything to get out. However, its courtyard route is exposed to the rain. Since you're delivering a borrowed book rather than simply leaving, it makes sense to use the sheltered front route once I've cleared the fallen sign. If your plans change, use the emergency door and leave the book with me.",
          "비상문은 열려 있으니, 나가려고 뭔가를 풀 필요는 없어요. 다만 그쪽 안뜰은 비를 맞아요. 빌린 책을 가져다주려면 간판을 치운 뒤 지붕 있는 정문 쪽 길을 쓰는 편이 좋겠죠. 기다리기 어려우시면 책은 제게 두고 비상문으로 나가셔도 돼요.",
          "부탁을 맡았을 때와 바로 떠나야 할 때, 각각 어떻게 하면 될까요?",
          "Which answer understands both your purpose and your choices?",
          [
            "Wait for the covered route to deliver the book, or leave the book with Hana if you need to go now.",
            "Stay trapped until the door accepts a correct English sentence.",
            "Use the courtyard because borrowed books must be carried in the rain.",
          ],
          0,
        ),
      },
    },
    {
      id: "bookshop-find-book",
      chapterId: chapters[1].id,
      skill: "reading",
      title: text("반납표에 적힌 이름", "The return slip matters more than the cover"),
      context: text(
        "반납대에 놓인 두 책의 표를 읽어보세요. 조에게, 낭독실로 가져갈 책은 어느 쪽인가요?",
        "Read the slips on the two books at the returns desk. Choose the book whose recipient and destination are both correct.",
      ),
      document: text("두 책에 붙은 반납표", "Two book return slips"),
      feedback: text(
        "파란 천 표지 책의 반납표에는 조와 도서관 낭독실이 함께 적혀 있어요. 회색 책은 직원의 개인 책이라 직원 책장에 두어야 하죠. 표지가 닮았더라도 누구에게 어디로 갈 책인지는 다를 수 있어요.",
        "The blue cloth book's slip names Jo and the library reading room. The grey book is a staff member's personal book for the staff shelf. The recipient and destination are stronger evidence than similar covers.",
      ),
      consequence: text(
        "도서관에서 빌린 파란 천 표지 책을 찾았습니다. 혹시 잘못 짚은 건 아닌지 하나에게 반납표를 한 번 더 봐달라고 부탁합니다.",
        "You choose the library's blue cloth book and ask Hana to check its slip before taking it.",
      ),
      expressionIds: ["bookshop-check-label"],
      versions: {
        starter: pick(
          "Blue book: Jo — library reading room. Grey book: Hana — staff shelf.",
          "파란 책: 조에게, 도서관 낭독실로. 회색 책: 하나의 책, 직원 책장으로.",
          "조에게 가져갈 책은 어느 쪽인가요?",
          "Which book should go to Jo?",
          ["The blue book.", "The grey book.", "Both books."],
          0,
        ),
        standard: pick(
          "Blue cloth book: borrowed from the library; return to Jo, reading room. Grey book: Hana's personal copy; return to the staff shelf. The two books have similar covers.",
          "파란 천 표지 책: 도서관에서 빌린 책. 낭독실의 조에게 반납. 회색 책: 하나의 개인 책. 직원 책장에 둘 것. 표지가 서로 비슷하니 확인해주세요.",
          "누구의 책인지, 어디로 갈 책인지 맞게 짚은 답을 골라보세요.",
          "Which choice matches ownership and destination?",
          [
            "Take the grey book because it belongs to Hana.",
            "Take both because their covers are similar.",
            "Take the blue library book to Jo.",
          ],
          2,
        ),
        challenge: pick(
          "Two books were set aside after the event. The blue cloth copy was lent by the library and has a return slip naming Jo at the reading room. The grey copy belongs to Hana and should remain on the staff shelf. Their similar covers do not mean they can be exchanged.",
          "행사가 끝나고 책 두 권을 따로 놓았습니다. 파란 천 표지 책은 도서관에서 빌린 것으로, 반납표에 낭독실의 조가 적혀 있습니다. 회색 책은 하나의 개인 책이라 직원 책장에 남겨야 합니다. 표지가 닮았다고 대신 가져가서는 안 됩니다.",
          "반납표를 읽고 나면 두 책을 어떻게 두는 게 좋을까요?",
          "Choose an action justified by the return slip.",
          [
            "Exchange the books because their covers are similar.",
            "Keep Hana's book at the shop and deliver the library copy to Jo.",
            "Send the library book to the post office without checking the slip.",
          ],
          1,
        ),
      },
    },
    {
      id: "bookshop-confirm-label",
      chapterId: chapters[1].id,
      skill: "writing",
      title: text("같이 봐주실 수 있나요?", "Check the slip together"),
      context: text(
        "책을 찾았다는 말을 인터폰에 남겨보세요. 반납표도 함께 봐달라고 부탁하면 좋겠습니다.",
        "Leave a message on the intercom saying you found the book. Ask Hana to check its label with you.",
      ),
      document: text("하나에게 보낼 확인 부탁", "Book confirmation message"),
      feedback: text(
        "label을 봐달라고 하면 가져갈 책이 맞는지 함께 확인할 수 있어요. 기본에서는 파란 책과 조를, 도전에서는 낭독실까지 알려주세요.",
        "Asking someone to check the label helps confirm the intended recipient. In Standard, name the blue book and Jo; in Challenge, also state the reading room.",
      ),
      consequence: text(
        "하나가 반납 기록을 살펴봅니다. 조에게 갈 파란 책이 맞다는 답과 함께, 문 여는 방법을 보내옵니다.",
        "Hana compares the return record and confirms the blue book is the one for Jo's reading. She sends the door-opening instructions.",
      ),
      expressionIds: ["bookshop-check-label", "bookshop-reading-room"],
      versions: {
        starter: write(
          "You found the book. Ask Hana to check its label.",
          "책을 찾았군요. 하나에게 반납표를 봐달라고 부탁해보세요.",
          "반납표를 봐달라고 영어로 부탁해보세요.",
          "Write a request to check the label.",
          "Could you check the label?",
          [
            ["check", "verify", "look at"],
            ["label", "slip"],
          ],
          "Could you check…?",
        ),
        standard: write(
          "Tell Hana you found the blue book for Jo, then ask her to check the label.",
          "조에게 줄 파란 책을 찾았다고 알려주세요. 반납표도 확인해달라고 부탁해보세요.",
          "조에게 줄 파란 책을 찾았다는 말과 반납표 확인 부탁을 써보세요.",
          "Write a message mentioning the blue book, Jo, and a label check.",
          "I found the blue book for Jo. Could you check the label?",
          [["blue"], ["book"], ["jo"], ["check", "verify", "look at"], ["label", "slip"]],
        ),
        challenge: write(
          "Before carrying the library book outside, confirm the blue book, its recipient Jo, and the reading room. Ask Hana to check the return label.",
          "도서관 책을 가져가기 전에 파란 책인지, 조에게 낭독실로 갈 책인지 한 번 더 확인해봅시다. 하나에게 반납표를 대조해달라고 부탁해보세요.",
          "책과 받을 사람, 낭독실을 알려주고 반납표 확인을 부탁해보세요.",
          "Name the book, recipient, and reading room, then ask for a label check.",
          "I found the blue book for Jo. It is for the reading room. Could you check the label?",
          [
            ["blue"],
            ["book"],
            ["jo"],
            ["reading room"],
            ["check", "verify", "look at"],
            ["label", "slip"],
          ],
        ),
      },
    },
    {
      id: "bookshop-handover",
      chapterId: chapters[2].id,
      skill: "listening",
      speaker: storyName("Jo"),
      title: text("낭독실 문 앞에서", "The intended recipient speaks"),
      context: text(
        "낭독실 앞 사람이 말을 건넵니다. 반납표에 적힌 사람인지 듣고, 책을 건네도 될지 생각해보세요.",
        "The person outside the reading room introduces themself. Listen and check both the name and the expected role.",
      ),
      document: text("낭독실 앞에서 만난 사람", "Introduction at the reading room"),
      feedback: text(
        "조는 오늘 도서관 낭독을 맡았고, 하나에게서 돌아올 책을 기다리고 있어요. 서점에 들른 적이 있다는 말만으로는 책을 건넬 수 없겠죠. 소개와 반납표의 이름·장소가 맞으면 함께 확인하고 돌려주세요.",
        "Jo is leading tonight's library reading and is waiting for the book from Hana. Merely being a bookshop visitor would not be enough. Once the recipient matches, hand over the book with its return slip.",
      ),
      consequence: text(
        "조가 반납표를 보고 책을 받습니다. 기다리던 사람들이 낭독자 쪽으로 몸을 돌리고, 마지막 이야기가 시작됩니다.",
        "Jo checks the slip and receives the book. The audience turns towards the reader, and the final story begins.",
      ),
      expressionIds: ["bookshop-reading-room"],
      versions: {
        starter: pick(
          "I'm Jo. I'm the reader tonight. The library lent this book to Hana. Thank you for returning it to the reading room.",
          "조입니다. 오늘 낭독을 맡았어요. 도서관에서 하나에게 빌려준 책이죠. 낭독실로 돌려주셔서 고맙습니다.",
          "이 사람에게 책을 건네도 되는 까닭은 무엇인가요?",
          "Why is this the right person to receive the book?",
          [
            "They are Jo, tonight's reader.",
            "They want to buy every book.",
            "They are waiting at the post office.",
          ],
          0,
        ),
        standard: pick(
          "Hello, I'm Jo, the reader for the library's final session. Hana said you'd bring our borrowed book. Does the return slip name me and this reading room? If so, you've found the right place.",
          "안녕하세요. 도서관의 마지막 낭독을 맡은 조입니다. 하나에게 빌린 책을 가져다주신다고 들었어요. 반납표에 제 이름과 이 낭독실이 적혀 있나요? 그렇다면 잘 찾아오셨습니다.",
          "소개와 반납표를 확인하고 나면 어떻게 하면 될까요?",
          "What should you do after comparing the introduction with the slip?",
          [
            "Take Jo's personal book back to the shop instead.",
            "Check Jo and the reading room on the slip, then hand over the library book.",
            "Give both books to any person outside.",
          ],
          1,
        ),
        challenge: pick(
          "I'm Jo, and I'm leading the final reading here tonight. Hana has already told me that a volunteer is returning the library copy. Please check my name against the slip before handing it over. The audience is ready; once we receive the book, we can begin.",
          "오늘 마지막 낭독을 맡은 조입니다. 하나에게 자원봉사자가 도서관 책을 돌려주러 온다고 들었어요. 건네주시기 전에 반납표의 이름과 제 이름이 맞는지 봐주시겠어요? 사람들은 준비됐으니 책을 받으면 시작할 수 있습니다.",
          "무엇을 확인하고 책을 돌려주면 될지, 까닭까지 맞는 답을 골라보세요.",
          "Which ending gives the correct action and reason?",
          [
            "Give the book to anyone because the audience is waiting.",
            "Keep the library book because the emergency door was open.",
            "Confirm Jo's name, return the borrowed copy, and let the final reading begin.",
          ],
          2,
        ),
      },
    },
    {
      id: "bookshop-transfer",
      chapterId: chapters[2].id,
      skill: "speaking",
      speaker: text("당신 → 박물관 안내 직원", "You → Museum staff"),
      title: text("이번에는 박물관에서", "Choose a route in a new place"),
      context: text(
        "다음 날, 박물관에서 종이 작품을 들고 나옵니다. 앞쪽은 지붕 있는 통로, 뒤쪽은 비 오는 안뜰입니다. 어제 쓴 말을 이번 상황에 맞춰 꺼내보세요.",
        "The next day, you leave a museum carrying a paper artwork. The front exit leads to a covered walkway; the back exit leads to a rainy courtyard. Adapt yesterday's expressions to this new situation.",
      ),
      document: text("다음 날의 박물관", "New situation · Museum exits"),
      feedback: text(
        "이번에 젖지 않게 옮길 것은 책이 아니라 종이 작품이에요. 어느 길로 갈지, 왜 그 길이 필요한지 말해보세요. 익힌 표현을 조금 바꾸면 다른 곳에서도 쓸 수 있어요.",
        "Here you are protecting a paper artwork rather than a book. Choosing a route and explaining why adapts the expression to a new purpose. Say your response aloud, then confirm your practice.",
      ),
      consequence: text(
        "직원이 지붕 있는 통로를 알려줍니다. 종이 작품을 들고 그 길로 향합니다. 어제의 부탁이 오늘의 다른 말로 이어졌습니다.",
        "The staff member points out the sheltered walkway. You carry the artwork safely and use your route expressions beyond the bookshop.",
      ),
      expressionIds: ["bookshop-keep-dry", "bookshop-safe-route"],
      versions: {
        starter: speak(
          "You have a paper artwork. Take the covered walkway to keep it dry.",
          "종이 작품을 들고 있습니다. 젖지 않게 지붕 있는 통로를 이용하세요.",
          "어느 길로 갈지 영어로 말해보세요.",
          "Say aloud which route you will take.",
          "I'll take the covered walkway.",
          "I'll take…",
        ),
        standard: speak(
          "The front route has a roof. The back route crosses the rainy courtyard. Tell museum staff which route you want and why.",
          "앞쪽에는 지붕이 있습니다. 뒤쪽으로 가면 비 오는 안뜰을 건너야 합니다. 직원에게 어느 길로 가고 싶은지, 왜 그런지 말해보세요.",
          "지붕 있는 길로 가겠다고 말하고, 작품을 젖지 않게 하려는 까닭도 전해보세요.",
          "Name the covered route and explain that you want to keep the artwork dry.",
          "I'll take the covered walkway because my paper artwork needs to stay dry.",
        ),
        challenge: speak(
          "At a museum, you are carrying a paper artwork in the rain. Explain your purpose, ask staff to confirm the covered route, and state which way you will take. Use your own words before opening the example.",
          "비 오는 날, 박물관에서 종이 작품을 들고 이동합니다. 작품을 젖지 않게 옮기고 싶다고 말하고 지붕 있는 길을 물어본 뒤, 그 길로 가겠다고 알려주세요. 예문을 보기 전에 스스로 해보세요.",
          "무엇을 옮기는지 알리고, 비를 피할 길을 물은 뒤, 선택한 길을 말해보세요.",
          "Adapt your purpose, confirmation request, and route choice to this new setting.",
          "My paper artwork needs to stay dry. Could you help me find the covered walkway? I'll take that route.",
        ),
      },
    },
  ];
  return {
    ...base,
    title: text("서점에 남겨진 부탁", "A Favour at the Bookshop"),
    englishTitle: "A Favour at the Bookshop",
    takeaway: text(
      "도움을 청하는 말, 안내를 따라 움직이는 말, 내가 갈 길을 알려주는 말을 연습해요.",
      "Practice asking for help, following a sequence of instructions, and explaining which route you will take.",
    ),
    minutes: 28,
    chapters,
    synopsis: text(
      "낭독실에서 기다리는 조에게 책 한 권을 전해주세요. 비를 피할 길을 찾고, 서점 직원 하나와 함께 뜻밖의 부탁을 마무리하는 이야기입니다.",
      "Return a borrowed book to someone waiting for a final reading. A conversation story about choosing a route and working with staff after a storm.",
    ),
    intro: chapters[0].story,
    ending: text(
      "초록색 비상문으로 바로 나갈 수도 있었습니다. 하지만 빌린 책을 젖지 않게 전하려면 지붕 있는 길이 필요했죠. 하나와 반납표를 대조하고 정문을 연 뒤, 통로 끝의 낭독실에서 조에게 책을 건넸습니다. 기다리던 사람들의 마지막 낭독도 시작됐습니다. 다음 날 박물관에서는 종이 작품을 들고 같은 말을 꺼내 보았습니다. 어디로 가야 할지 묻고 한 번 더 확인하는 말이, 책 한 권과 작은 약속을 제자리에 데려다주었습니다.",
      "You did not need a password to escape. The emergency exit was always available; your purpose was to deliver a borrowed book to Jo without getting it wet. You checked the return slip with Hana, followed the manual-release instructions, and reached the reading room by the covered walkway. Once Jo received the book, the final reading began. The next day, you used the same expressions to check a route at a museum. Clear questions and confirmations helped keep someone else's promise.",
    ),
    cast: [
      {
        name: storyName("Hana"),
        role: text("서점 직원", "Bookshop staff"),
        motivation: text(
          "출입구를 정리하는 동안에도 빌린 책이 도서관에 잘 돌아가길 바랍니다.",
          "Wants to clear the entrance and make sure the borrowed book reaches the library.",
        ),
      },
      {
        name: storyName("Jo"),
        role: text("도서관 낭독 진행자", "Library reader"),
        motivation: text(
          "기다리는 사람들에게 마지막 이야기를 읽어주려면 그 책이 필요합니다.",
          "Needs the book to read the final story to a waiting audience.",
        ),
      },
      {
        name: text("당신", "You"),
        role: text("낭독회 자원봉사자", "Reading-event volunteer"),
        motivation: text(
          "광장으로 가는 길에 책을 전해주고, 집으로 돌아갈 길도 확인하려 합니다.",
          "Offers to return the book on the way to the square and checks a route home.",
        ),
      },
    ],
    debrief: {
      question: text(
        "비상문으로 바로 나갈 수도 있었는데, 왜 하나와 정문 쪽 길을 준비했을까요?",
        "Explain why you prepared the front route with staff even though the emergency exit was available.",
      ),
      model:
        "The emergency exit was available, but the courtyard had no roof. I chose the covered route to keep the borrowed book dry and return it to Jo.",
      modelKo: text(
        "비상문은 열 수 있었지만, 그쪽 안뜰에는 지붕이 없었어요. 빌린 책을 젖지 않게 조에게 전하려고 지붕 있는 길을 골랐어요.",
        "The emergency exit was available, but the courtyard had no roof. I chose the covered route to keep the borrowed book dry and return it to Jo.",
      ),
    },
    expressions: [
      ...base.expressions.map(polishExpression),
      expression(
        "bookshop-reading-room",
        "This book is for the reading room.",
        "낭독실에 가져다줄 책이에요.",
        "책을 어디로 가져가야 하는지 직원에게 알려주세요.",
        "Tell a member of staff where the book is meant to go.",
        ["The book is for the reading room.", "This book goes to the reading room."],
      ),
      expression(
        "bookshop-check-label",
        "Could you check the label?",
        "반납표를 봐주실 수 있을까요?",
        "비슷한 책이 두 권 있습니다. 반납표를 함께 봐달라고 부탁해보세요.",
        "There are two similar books. Ask someone to check the label with you.",
        ["Can you check the label?", "Please check the label."],
      ),
      expression(
        "bookshop-keep-dry",
        "It needs to stay dry.",
        "이건 젖지 않아야 해요.",
        "종이로 된 물건을 들고 있습니다. 비를 피해야 하는 까닭을 말해보세요.",
        "You are carrying something made of paper. Explain why it needs shelter from the rain.",
        ["It must stay dry.", "We need to keep it dry."],
      ),
    ],
    tasks: [
      additions[0],
      keep(base, "bookshop-notice", chapters[0].id),
      additions[1],
      keep(base, "bookshop-message", chapters[0].id),
      keep(base, "bookshop-intercom", chapters[1].id),
      additions[2],
      additions[3],
      keep(base, "bookshop-release", chapters[1].id),
      keep(base, "bookshop-goodbye", chapters[2].id),
      additions[4],
      additions[5],
    ],
  };
}

function reviseLocker(): EnglishEpisode {
  const base = source("locker-seven");
  const chapters = [
    chapter(
      "locker-identify",
      "닮은 가방 두 개",
      "Similar objects, different owners",
      "여울항 역 분실물 안내소",
      "Yeoul Harbour Station lost-property desk",
      "읽어도 되는 자료를 살피며, 두 가방을 구별할 단서를 찾아요.",
      "Use only authorised records and compare the bags' distinguishing features.",
      "오늘은 항구 옆 역의 분실물 안내소에서 일을 돕습니다. 레나는 오랫동안 떨어져 지낸 동생 카이를 만나러 왔다가 그만 가방을 잃어버렸습니다. 보관대에는 파란 가방이 두 개 있습니다. 역 직원 미나는 짐작만으로 어느 하나를 돌려줄 수 없다며, 신고서를 보관한 업무용 7번 보관함을 열어줍니다. 먼저 읽을 것은 레나가 남긴 신고서와 직원의 접수 기록입니다. 가방 안의 개인 편지까지 펼쳐볼 필요는 없습니다.",
      "You are helping at the station's lost-property desk beside the harbour. Lena has come to meet her brother Kai after a long time apart, but has lost her bag. Mina, a station employee, cannot return one of the two blue bags on a guess. She opens staff locker seven, where she keeps the reports. You may read the owner's report and the staff records. Personal letters inside the bags are not yours to open.",
      base.image,
      base.imageAlt,
      "A lost-property employee, teal lockers, and a red envelope on the desk.",
      [
        line(
          "Mina",
          "Lena is worried, but we need more than the colour of a bag.",
          "레나가 많이 걱정하네요. 그래도 색만 보고 돌려드릴 수는 없어요.",
        ),
        line("You", "Which records may I read?", "제가 어떤 기록부터 보면 될까요?"),
        line(
          "Mina",
          "The report in locker seven and our intake records. I'll handle any checks inside the bags.",
          "7번 보관함의 신고서와 접수 기록을 봐주세요. 가방 안은 제가 확인할게요.",
        ),
      ],
    ),
    chapter(
      "locker-verify",
      "은색 별과 레몬빵 영수증",
      "Matching clues and the remaining check",
      "분실물 안내소 확인 데스크",
      "The lost-property verification desk",
      "가방을 고른 까닭을 설명하고, 미나가 주인을 확인할 때까지 기다려요.",
      "Explain the evidence for your choice and wait for the ownership check.",
      "미나가 접수 기록을 가져옵니다. 두 가방의 색은 같지만, 지퍼 장식과 안에 있던 영수증은 서로 다릅니다. 어느 쪽이 레나의 설명과 맞는지 찾아봅시다. 다만 맞는 가방을 골랐다고 바로 돌려줄 수는 없습니다. 미나는 레나에게 아직 알려주지 않은 물건을 설명해달라고 할 예정입니다. 레나는 가방 안에 카이에게 전하려던 봉인된 편지도 있다고 합니다. 반환 확인서를 마치는 동안, 되찾은 편지의 전달을 부탁할지도 모르겠네요.",
      "Mina brings the records and asks you to compare the zipper decoration with the receipt. The bags have the same colour, but their purchase details differ. Your role is to identify the matching bag. Before returning it, Mina will ask Lena about contents that have not been disclosed. Lena says there is also a sealed letter inside that she had hoped to give Kai herself. She needs to complete the return paperwork, so if the letter is recovered, she may need help getting it to him.",
      base.image,
      base.imageAlt,
      "The lost-property desk, with its employee and lockers.",
      [
        line(
          "Mina",
          "The clues identify a likely bag. We still need to verify its owner.",
          "단서는 이 가방을 가리키네요. 이제 주인도 확인해볼게요.",
        ),
        line(
          "You",
          "The receipt matches the letter. What should we check next?",
          "영수증이 신고서 내용과 맞아요. 다음에는 뭘 확인하나요?",
        ),
        line(
          "Mina",
          "I'll ask Lena to describe something we haven't told her about.",
          "레나에게 우리가 아직 말하지 않은 물건을 설명해달라고 할 거예요.",
        ),
      ],
    ),
    chapter(
      "locker-deliver",
      "편지는 카이에게",
      "How to deliver a sealed letter",
      "역의 지붕 있는 승강장",
      "The station's covered platform",
      "레나의 부탁을 확인하고, 편지를 받을 사람에게 직접 건네요.",
      "Check the owner's permission and the recipient before handing over the letter.",
      "레나는 되찾은 편지를 카이에게 전해달라고 부탁합니다. 봉투 겉면에는 카이의 이름이 적혀 있습니다. 안에 무슨 말을 썼는지는 읽지 않아도 되죠. 미나는 다음 근무자에게 안내소를 맡기고 함께 승강장으로 갑니다. 레나가 알려준 연락처로 카이가 어디에서 기다리는지 물어볼 수 있습니다. 자리를 찾았다고 벤치에 두고 오지는 말고, 이름을 확인한 뒤 손에 건네주세요. 마지막에는 다음 날 박물관에서 만난 분실물에도 오늘의 확인 방법을 써봅니다.",
      "Lena gives you permission to take her sealed letter to Kai. His name is on the outside; you do not need to read the contents. Mina hands the desk over to the next employee and accompanies you to the platform. Using the contact Lena provides, you can check where Kai is waiting. Do not leave the letter unattended just because you found the right platform: confirm the recipient's name and hand it to him. Finally, apply the same checking process to a different lost object the next day.",
      "/assets/english/locker-platform.webp",
      "역의 지붕 있는 승강장에서 안내 직원과 방문객이 봉투를 들고 서 있는 모습",
      "An information-desk employee and a visitor holding an envelope on a covered station platform.",
      [
        line(
          "Lena",
          "Thank you for taking this sealed letter to Kai. He is my brother.",
          "카이에게 편지를 가져다주셔서 고마워요. 제 동생이에요.",
        ),
        line(
          "You",
          "I will take it with Mina and keep it sealed.",
          "미나와 함께 가져갈게요. 봉투는 그대로 둘게요.",
        ),
        line(
          "Mina",
          "I'll go with you after my colleague takes over the desk. We'll confirm his name before handing it over.",
          "동료가 데스크를 맡으면 같이 가요. 건네기 전에 이름부터 확인하고요.",
        ),
      ],
    ),
  ];
  const additions: EnglishTask[] = [
    {
      id: "locker-record-permission",
      chapterId: chapters[0].id,
      skill: "reading",
      title: text("어떤 자료부터 볼까요?", "Which records may you read?"),
      context: text(
        "미나가 건넨 봉사자 안내를 읽어보세요. 가방을 찾을 때 살펴봐도 되는 자료는 무엇인가요?",
        "Read Mina's volunteer instructions. Identifying a lost object does not give permission to read personal letters.",
      ),
      document: text("봉사자가 먼저 읽을 안내", "Lost-property volunteer instructions"),
      feedback: text(
        "직원이 건넨 신고서와 접수 기록은 비교해볼 수 있어요. 그렇다고 가방 속 개인 편지를 펼쳐봐도 되는 건 아니에요. 안의 물건을 확인하고 마지막에 돌려주는 일은 직원이 맡습니다.",
        "You may compare the report and intake records authorised by staff. Do not open a personal letter just because it is in the bag. Staff handle the contents check and the final return.",
      ),
      consequence: text(
        "미나가 업무용 7번 보관함에서 신고서를 꺼내줍니다. 우선 이 자료부터 읽어봅시다.",
        "Mina gives you the report from staff locker seven. You begin with the authorised records.",
      ),
      expressionIds: ["locker-confirm-name"],
      versions: {
        starter: pick(
          "Read the owner's report and the staff records. Do not open personal letters. Staff check the bags and return them.",
          "주인이 남긴 신고서와 직원 기록을 읽으세요. 개인 편지는 열지 마세요. 가방 안을 확인하고 돌려주는 일은 직원이 맡습니다.",
          "어떤 자료를 읽어도 될까요?",
          "Which materials may you read?",
          [
            "Every personal letter inside a bag.",
            "Only the colour written on a bag.",
            "The authorised report and staff records.",
          ],
          2,
        ),
        standard: pick(
          "Volunteers may compare a lost-property report with the intake records provided by staff. A personal letter remains private even when found inside a lost bag. Staff will inspect the contents for ownership verification.",
          "봉사자는 직원이 제공한 분실 신고서와 접수 기록을 비교할 수 있습니다. 가방 안에서 찾았더라도 개인 편지는 함부로 읽지 않습니다. 안의 물건으로 주인을 확인하는 일은 직원이 합니다.",
          "자료를 읽는 일과 가방을 돌려주는 일을 바르게 나눈 답을 골라보세요.",
          "Which answer uses the records and assigns the return role correctly?",
          [
            "Compare the authorised records and let staff verify ownership.",
            "Open a private letter to look for a convenient answer.",
            "Return both bags before checking because they are blue.",
          ],
          0,
        ),
        challenge: pick(
          "Your authorisation covers the owner's written report and the staff's intake records, not private correspondence inside a bag. Matching those records helps identify a candidate, but it does not replace staff verification. If a sealed letter later needs to be delivered, obtain its owner's permission and confirm the recipient.",
          "살펴봐도 되는 것은 주인의 신고서와 직원의 접수 기록입니다. 가방 속 개인 편지는 포함되지 않습니다. 기록을 비교해 맞을 법한 가방을 찾더라도, 직원이 주인 확인을 마쳐야 합니다. 나중에 봉인된 편지를 전하게 된다면 주인에게 먼저 허락을 받고 받을 사람도 확인해주세요.",
          "지금 기록을 볼 때와 나중에 편지를 전할 때, 각각 어떻게 해야 할까요?",
          "Which action respects both your current and later roles?",
          [
            "Treat every paper inside a lost bag as public evidence.",
            "Use the permitted records now, and seek permission before delivering private correspondence.",
            "Skip ownership checks if the bag contains a letter.",
          ],
          1,
        ),
      },
    },
    {
      id: "locker-owner-check",
      chapterId: chapters[1].id,
      skill: "listening",
      speaker: storyName("Lena"),
      title: text("말하지 않은 물건 하나", "An item not yet disclosed"),
      context: text(
        "미나는 확인할 물건을 미리 알려주지 않고 레나에게 묻습니다. 레나의 답이 접수 기록과 맞는지 들어보세요.",
        "Mina asks Lena about the bag's contents without disclosing the verification item. Compare Lena's answer with the intake record.",
      ),
      document: text("레나가 들려주는 가방 속 물건", "Lena's ownership-check response"),
      feedback: text(
        "레나는 그림을 그리는 초록색 공책을 말했고, 미공개 기록에도 green notebook이 있어요. 같은 색의 가방을 고르는 것에서 한 번 더 확인한 거죠. 개인 편지 내용을 읽을 필요는 없어요.",
        "Lena describes a green notebook, and the staff's undisclosed record also says 'green notebook'. This is a separate check from choosing between bags of the same colour. You do not read a personal letter as evidence.",
      ),
      consequence: text(
        "미나가 주인 확인을 마치고 B 가방을 레나에게 돌려줍니다. 레나는 안에서 카이에게 줄 봉인된 편지를 꺼내, 대신 전해줄 수 있겠느냐고 묻습니다.",
        "Mina completes the check and returns Bag B. Lena opens it and takes out a sealed letter for Kai, then asks whether you could deliver it.",
      ),
      expressionIds: ["locker-describe-bag", "locker-confirm-name"],
      versions: {
        starter: pick(
          "There is a green notebook in my bag. I use it for sketches. I also have a sealed letter for my brother. Please keep that letter closed.",
          "가방 안에 초록색 공책이 있어요. 거기에 그림을 그려요. 동생에게 줄 봉인된 편지도 있고요. 편지는 열지 말아주세요.",
          "기록의 초록색 공책과 맞는 설명은 무엇인가요?",
          "Which detail matches the recorded green notebook?",
          [
            "A red notebook.",
            "A green notebook for sketches.",
            "An opened letter with a public address.",
          ],
          1,
        ),
        standard: pick(
          "My bag has a green notebook that I use for sketches. Beside it is a sealed letter addressed to Kai, my brother. I wrote it to welcome him home. You don't need to open it to identify my bag.",
          "제 가방에는 그림을 그리는 초록색 공책이 있어요. 옆에는 동생 카이에게 쓴 봉인된 편지가 있습니다. 돌아온 걸 환영하려고 썼어요. 가방을 확인하려고 그 편지를 열어볼 필요는 없어요.",
          "주인 확인도 하고 편지도 잘 다루는 방법은 무엇일까요?",
          "Which answer correctly handles both verification and the letter?",
          [
            "Open the letter and read its contents to everyone.",
            "Ignore the notebook because both bags are blue.",
            "Compare the green notebook with the record and keep the letter sealed.",
          ],
          2,
        ),
        challenge: pick(
          "I can describe something you haven't told me about: there is a green sketch notebook inside my bag. There is also a sealed welcome letter for my brother Kai, but its contents are private. Please compare the notebook with your intake record rather than reading the letter aloud.",
          "아직 말씀하지 않으신 물건을 설명해볼게요. 가방 안에는 초록색 그림 공책이 있어요. 동생 카이를 환영하려고 쓴 봉인된 편지도 있지만, 그 안의 글은 개인적인 거예요. 편지를 소리 내 읽기보다 공책이 기록과 맞는지 봐주세요.",
          "이 확인은 앞서 두 가방 중 하나를 고른 것과 어떻게 다른가요?",
          "Why does this check add something beyond selecting the matching bag?",
          [
            "Lena describes undisclosed contents that match the record, without exposing private correspondence.",
            "Every owner must have a green notebook, so no comparison is needed.",
            "A sealed letter automatically proves that every blue bag belongs to Lena.",
          ],
          0,
        ),
      },
    },
    {
      id: "locker-letter-permission",
      chapterId: chapters[1].id,
      skill: "writing",
      title: text("가져가도 될까요?", "Ask permission before delivering"),
      context: text(
        "레나는 안내소에서 반환 확인서를 마쳐야 합니다. 편지를 카이에게 가져가도 되는지 한 번 더 물어보세요.",
        "Lena needs to finish the return paperwork at the desk. Write a question confirming whether you may take the sealed letter to Kai.",
      ),
      document: text("레나에게 한 번 더 물을 말", "A permission question for Lena"),
      feedback: text(
        "May I take this letter to Kai?로 다른 사람의 편지를 옮겨도 되는지 물을 수 있어요. 기본·도전에서는 봉투를 그대로 닫아두겠다는 말도 넣어주세요. 주인의 허락과 받을 사람의 이름을 확인하면 안의 글을 읽지 않고도 전할 수 있어요.",
        "'May I take this letter to Kai?' asks permission before moving someone else's letter. In Standard and Challenge, also make clear that it will remain sealed. Permission and recipient confirmation let you deliver it without reading the contents.",
      ),
      consequence: text(
        "레나가 카이에게 가져다줘도 된다고 답하며 연락할 방법을 알려줍니다. 미나는 교대가 끝나면 함께 가겠다고 합니다.",
        "Lena explicitly permits you to deliver it and provides a way to contact Kai. Mina agrees to accompany you after the desk handover.",
      ),
      expressionIds: ["locker-letter-permission"],
      versions: {
        starter: write(
          "Ask Lena whether you may take the letter to Kai.",
          "레나에게 이 편지를 카이에게 가져가도 되는지 물어보세요.",
          "카이에게 편지를 가져가도 되는지 영어로 물어보세요.",
          "Ask permission using letter and Kai.",
          "May I take this letter to Kai?",
          [["may i", "can i", "could i"], ["letter"], ["kai"]],
          "May I take…?",
          ["Can I take this letter to Kai?"],
        ),
        standard: write(
          "Ask permission to take the sealed letter to Kai. Make it clear that you will keep it sealed.",
          "봉인된 편지를 카이에게 가져가도 되는지 물어보세요. 봉투를 닫힌 채로 두겠다는 말도 함께 전해주세요.",
          "카이에게 가져갈 허락을 구하고, 봉투는 닫힌 채로 두겠다고 말해주세요.",
          "Include permission, Kai, and keeping the letter sealed.",
          "May I take this letter to Kai? I will keep it sealed.",
          [["may i", "can i", "could i"], ["letter"], ["kai"], ["sealed", "closed"]],
        ),
        challenge: write(
          "Lena has offered a sealed welcome letter. Ask whether you may deliver it to Kai with Mina, while keeping it sealed. Do not request access to its contents.",
          "레나가 봉인된 환영 편지를 내밀었습니다. 미나와 함께 카이에게 전해도 되는지 물어보세요. 봉투는 열지 않겠다는 말도 넣고, 내용을 읽게 해달라고 하지는 마세요.",
          "미나와 함께 카이에게 가져가되 봉투는 열지 않겠다고, 허락을 구해보세요.",
          "Ask to deliver it to Kai with Mina while keeping it sealed.",
          "May I take this letter to Kai with Mina? We will keep it sealed.",
          [["may i", "can i", "could i"], ["letter"], ["kai"], ["mina"], ["sealed", "closed"]],
        ),
      },
    },
    {
      id: "locker-recipient-location",
      chapterId: chapters[2].id,
      skill: "listening",
      speaker: storyName("Kai"),
      title: text("카이가 기다리는 자리", "Check both the platform and the person"),
      context: text(
        "레나가 알려준 연락처로 카이에게 어디에 있는지 물었습니다. 미나와 어느 승강장으로 가면 될지 들어보세요.",
        "Use the contact Lena provides to ask where Kai is waiting. Check which platform you and Mina should visit.",
      ),
      document: text("카이가 알려주는 대기 장소", "Kai's waiting-place directions"),
      feedback: text(
        "카이는 2번 승강장의 파란 벤치 옆에서 기다려요. 1번 승강장 시계 아래는 다른 곳이죠. 맞는 자리를 찾아도 편지를 두고 오지는 말고, 이름을 확인한 뒤 직접 건네주세요.",
        "Kai is waiting by the blue bench on Platform Two. The clock on Platform One is a different location. Even after finding the right place, confirm his name before handing over the letter.",
      ),
      consequence: text(
        "미나와 2번 승강장 파란 벤치로 갑니다. 카이를 만나면 먼저 레나의 부탁으로 편지를 가져왔다고 말해주세요.",
        "You and Mina go to the blue bench on Platform Two. You see Kai and first explain that Lena asked you to deliver the letter.",
      ),
      expressionIds: ["locker-confirm-name", "locker-authorised-delivery"],
      versions: {
        starter: pick(
          "I'm Kai, Lena's brother. I'm on Platform Two, beside the blue bench. I'm not at the clock on Platform One.",
          "레나의 동생 카이예요. 2번 승강장 파란 벤치 옆에 있어요. 1번 승강장 시계 쪽은 아니에요.",
          "카이는 어디에서 기다리나요?",
          "Where is Kai waiting?",
          [
            "At the clock on Platform One.",
            "At the lost-property locker.",
            "By the blue bench on Platform Two.",
          ],
          2,
        ),
        standard: pick(
          "Hello, this is Kai. Lena told me you're bringing her letter with Mina. I'm waiting beside the blue bench on Platform Two. The clock you can see from the entrance is on Platform One, so please check the platform signs.",
          "안녕하세요, 카이예요. 레나한테 미나와 편지를 가져오신다고 들었어요. 2번 승강장 파란 벤치 옆에서 기다릴게요. 입구에서 보이는 시계는 1번 승강장에 있으니 표지판을 확인해주세요.",
          "눈에 띄는 곳을 무작정 따라가지 않고, 어떻게 찾아가면 될까요?",
          "Which route avoids the misleading landmark?",
          [
            "Go to Platform Two and find the blue bench.",
            "Go to the clock without checking the platform.",
            "Leave the sealed letter at the entrance.",
          ],
          0,
        ),
        challenge: pick(
          "Lena has just called me about the letter. I'm Kai, her brother, and I'm waiting by the blue bench on Platform Two. Don't use the prominent clock as your destination: it belongs to Platform One. When you arrive, please ask my name rather than leaving the letter on a bench.",
          "레나에게 방금 편지 얘기를 들었어요. 동생 카이이고, 2번 승강장 파란 벤치 옆에 있어요. 눈에 잘 띄는 시계 쪽으로 가지 마세요. 그건 1번 승강장이에요. 도착하면 벤치에 편지를 놓고 가지 말고, 제 이름을 먼저 물어봐주세요.",
          "어디로 가서 무엇을 확인한 뒤 건네면 될까요?",
          "Which action gets both the location and the final check right?",
          [
            "Leave the letter beneath the clock on Platform One.",
            "Find the blue bench on Platform Two, then confirm the recipient's name.",
            "Give it to the first person who mentions a blue bag.",
          ],
          1,
        ),
      },
    },
    {
      id: "locker-explain-delivery",
      chapterId: chapters[2].id,
      skill: "writing",
      title: text("레나의 부탁으로 왔어요", "Explain who asked you to deliver it"),
      context: text(
        "카이는 처음 보는 사람이 왜 편지를 들고 왔는지 궁금하겠죠. 레나가 전해달라고 부탁했다는 짧은 글을 남겨보세요.",
        "Kai needs to know why a stranger has brought a letter. Write a short handover note explaining that Lena asked you to deliver it.",
      ),
      document: text("카이에게 남길 짧은 글", "Letter handover note"),
      feedback: text(
        "Lena asked me to give you this letter.라고 하면 누구의 부탁으로 왔는지 알릴 수 있어요. 편지 내용을 읽거나 짐작해서 말할 필요는 없어요. 도전에서는 봉투를 열지 않았다는 말도 넣어주세요.",
        "'Lena asked me to give you this letter.' explains your authorisation and purpose. You do not need to read or invent its contents. In Challenge, also state that it remained sealed.",
      ),
      consequence: text(
        "카이가 이름을 확인하고 레나에게 들은 얘기와 맞다고 답합니다. 봉인된 편지를 손에 건넵니다. 카이는 혼자 읽은 뒤 누나에게 연락하겠다고 합니다.",
        "Kai confirms his name and what Lena told him. You hand over the sealed letter. He reads it privately and says he will contact his sister.",
      ),
      expressionIds: ["locker-authorised-delivery"],
      versions: {
        starter: write(
          "Explain that Lena asked you to give Kai the letter.",
          "레나가 카이에게 이 편지를 전해달라고 부탁했다고 말해보세요.",
          "레나가 부탁해 이 편지를 가져왔다고 영어로 써보세요.",
          "Write a sentence mentioning Lena, her request, and the letter.",
          "Lena asked me to give you this letter.",
          [["lena"], ["asked", "told", "requested"], ["letter"]],
          "Lena asked me…",
        ),
        standard: write(
          "Write Kai a handover note. Name Lena and explain that she asked you to deliver the letter to him.",
          "카이에게 짧은 인계 메모를 남겨보세요. 레나가 부탁해서 편지를 가져왔다는 말을 써주세요.",
          "카이에게, 레나의 부탁으로 편지를 가져왔다고 알려주세요.",
          "Explain to Kai that you came with the letter at Lena's request.",
          "Kai, Lena asked me to give you this letter.",
          [["kai"], ["lena"], ["asked", "told", "requested"], ["letter"]],
        ),
        challenge: write(
          "Explain to Kai who authorised the delivery and confirm that the letter stayed sealed. Avoid describing private contents you have not read.",
          "카이에게 누구의 부탁으로 왔는지, 편지를 닫힌 채로 가져왔는지 설명해보세요. 읽지 않은 안의 글을 설명할 필요는 없어요.",
          "카이와 레나의 이름을 쓰고, 편지를 전해달라는 부탁을 받았으며 봉투를 열지 않았다고 알려주세요.",
          "Include Kai, Lena's request, the letter, and the fact that it remained sealed.",
          "Kai, Lena asked me to give you this letter. I kept it sealed.",
          [["kai"], ["lena"], ["asked", "told", "requested"], ["letter"], ["sealed", "closed"]],
        ),
      },
    },
    {
      id: "locker-transfer",
      chapterId: chapters[2].id,
      skill: "speaking",
      speaker: text("당신 → 박물관 안내 직원", "You → Museum staff"),
      title: text("다음 날의 분실물", "The same principle with a new lost object"),
      context: text(
        "다음 날 박물관에 비슷하게 생긴 지갑 두 개가 들어왔습니다. 어제 가방을 찾았던 방법을 이번에도 직원에게 제안해보세요.",
        "The next day, a museum receives two similar lost wallets. Suggest yesterday's checking process to staff, adapting it to the new object.",
      ),
      document: text("다음 날의 분실 지갑", "New situation · Lost wallets"),
      feedback: text(
        "이번에는 bag 대신 wallet을 써서 특징을 물어볼 수 있어요. 색만 보고 돌려주지 않고, 설명과 기록을 비교한 뒤 직원이 주인을 확인하게 하는 점은 같아요.",
        "Replace 'bag' with 'wallet' to ask about its features and suggest checking the records. The principle still holds: colour alone is not enough, and staff should verify the owner.",
      ),
      consequence: text(
        "직원이 주인의 설명과 기록을 비교해보기로 합니다. 가방에서 익힌 확인 방법을 지갑에도 써보았습니다.",
        "The staff member agrees to compare the owner's description with the records. You have transferred the process of checking permission and evidence to a new object.",
      ),
      expressionIds: ["locker-describe-bag", "locker-confirm-name"],
      versions: {
        starter: speak(
          "Ask a visitor to describe their wallet.",
          "손님에게 지갑이 어떻게 생겼는지 설명해달라고 해보세요.",
          "이번에는 가방이 아닌 지갑의 특징을 영어로 물어보세요.",
          "Ask aloud, replacing bag with wallet.",
          "Could you describe your wallet?",
          "Could you describe…?",
        ),
        standard: speak(
          "Two wallets have the same colour. Ask the visitor for a description and suggest checking the staff record before returning one.",
          "두 지갑의 색이 같습니다. 손님에게 다른 특징을 물어보고, 돌려주기 전에 직원 기록도 비교하자고 말해보세요.",
          "지갑의 특징을 묻고, 기록도 함께 보자고 말해보세요.",
          "Ask about the wallet and suggest checking the record.",
          "Could you describe your wallet? We should compare your description with the record.",
        ),
        challenge: speak(
          "A visitor wants one of two similar wallets. Explain why colour alone is insufficient, ask for a description, and recommend staff verification without reading private papers inside.",
          "손님이 비슷한 지갑 두 개 중 하나를 찾고 있습니다. 색만으로는 구별하기 어렵다고 설명하고 다른 특징을 물어보세요. 안의 개인 문서를 읽지 않고 직원이 주인을 확인하도록 제안해보세요.",
          "지갑을 찾는 사람에게 특징을 물어보고, 왜 기록과 주인 확인도 필요한지 설명해보세요.",
          "Adapt your description question, reasoning, and staff-check procedure to the new object.",
          "Could you describe your wallet? Both are the same colour, so we should compare the description with the record and let staff verify ownership.",
        ),
      },
    },
  ];
  return {
    ...base,
    takeaway: inheritedTakeaway(base),
    minutes: 30,
    chapters,
    synopsis: text(
      "닮은 가방 두 개, 은색 별 하나, 그리고 영수증. 가방의 주인을 찾아준 뒤, 그 안에 남아 있던 편지도 받을 사람에게 전해주세요.",
      "A bag identified by its silver star and receipt contains a letter. With its owner's permission, carry the sealed message to the intended recipient.",
    ),
    intro: chapters[0].story,
    ending: text(
      "은색 별과 15시 20분 레몬빵 영수증은 모두 B 가방을 가리켰습니다. 미나는 그 안의 초록색 공책까지 레나의 설명과 대조한 뒤 가방을 돌려주었습니다. A 가방은 다른 주인이 찾으러 올 때까지 안내소에 남겨두었고요. 레나는 되찾은 가방에서 봉인된 편지를 꺼내 카이에게 전해달라고 부탁했습니다. 교대를 마친 미나와 2번 승강장 파란 벤치로 가서 카이의 이름을 확인하고 편지를 건넸습니다. 카이는 혼자 편지를 읽고 누나에게 연락하겠다고 했습니다. 가방을 찾으려고 읽은 신고서와, 누군가에게 전하려고 맡은 편지. 둘을 구분한 덕분에 물건도 마음도 제 주인에게 돌아갔습니다.",
      "Mina hears your explanation that Bag B matches both the silver star and the 15:20 lemon bun receipt, then verifies the owner using the undisclosed green notebook. Bag A stays at the desk for its own owner. Lena finds her sealed letter in the returned bag and authorises you to deliver it. After Mina's desk handover, you go together to the blue bench on Platform Two, confirm Kai's name, and hand it to him. Kai reads the letter privately and decides to contact his sister. Evidence for finding an object and permission to read correspondence are different things.",
    ),
    cast: [
      {
        name: storyName("Mina"),
        role: text("역 분실물 담당 직원", "Station lost-property employee"),
        motivation: text(
          "닮은 가방을 잘못 돌려주는 일도, 개인 편지가 함부로 읽히는 일도 없길 바랍니다.",
          "Wants to return each bag correctly while protecting private correspondence.",
        ),
      },
      {
        name: storyName("Lena"),
        role: text("가방을 잃어버린 누나", "Sister who lost her bag"),
        motivation: text(
          "오랜만에 돌아온 동생을 환영하려고 쓴 편지를 되찾고 싶습니다.",
          "Wants to recover her letter and welcome her brother home after a long absence.",
        ),
      },
      {
        name: storyName("Kai"),
        role: text("역에서 기다리는 편지 수신자", "Letter recipient waiting at the station"),
        motivation: text(
          "누나가 늦는 까닭을 알아보고, 직접 연락하려 합니다.",
          "Wants to understand why his sister is delayed and contact her himself.",
        ),
      },
    ],
    debrief: {
      question: text(
        "가방을 찾으려고 읽은 신고서와 카이에게 전한 편지는, 왜 다르게 다뤄야 했을까요?",
        "How did the letter used to identify the bag differ from the letter you later delivered?",
      ),
      model:
        "The first was Lena's authorised lost-property report. The second was a sealed personal letter. I could deliver it with her permission, but its contents were for Kai to read.",
      modelKo: text(
        "먼저 읽은 건 레나가 확인에 쓰도록 남긴 분실 신고서였어요. 나중에 맡은 건 봉인된 개인 편지였고요. 레나의 허락을 받아 전할 수는 있었지만, 내용은 카이가 읽을 몫이었어요.",
        "The first was Lena's authorised lost-property report. The second was a sealed personal letter. I could deliver it with her permission, but its contents were for Kai to read.",
      ),
    },
    expressions: [
      ...base.expressions.map(polishExpression),
      expression(
        "locker-confirm-name",
        "Could you confirm your name?",
        "이름을 확인해주실 수 있을까요?",
        "편지를 건네기 전에 받을 사람의 이름을 확인해보세요.",
        "Confirm the recipient's name before handing over a sealed letter.",
        ["Can you confirm your name?", "Please confirm your name."],
      ),
      expression(
        "locker-letter-permission",
        "May I take this letter to Kai?",
        "이 편지를 카이에게 가져가도 될까요?",
        "다른 사람의 편지를 맡았습니다. 주인에게 가져가도 되는지 물어보세요.",
        "You want to carry someone else's letter. Ask its owner for permission.",
        ["Can I take this letter to Kai?", "Could I take this letter to Kai?"],
      ),
      expression(
        "locker-authorised-delivery",
        "Lena asked me to give you this letter.",
        "레나가 이 편지를 전해달라고 부탁했어요.",
        "처음 만난 카이에게 편지를 가져온 까닭을 알려주세요.",
        "Explain to Kai why you, a stranger, have brought a letter.",
        ["Lena asked me to deliver this letter to you.", "Lena told me to give you this letter."],
      ),
    ],
    tasks: [
      additions[0],
      keep(base, "locker-letter", chapters[0].id),
      keep(base, "locker-testimony", chapters[0].id),
      keep(base, "locker-request", chapters[0].id),
      keep(base, "locker-records", chapters[1].id),
      keep(base, "locker-report", chapters[1].id, {
        consequence: text(
          "미나가 설명을 듣고 B 가방을 따로 놓습니다. 바로 돌려주지 않고, 레나에게 아직 알려주지 않은 물건을 묻기 시작합니다.",
          "Mina records your evidence and identifies Bag B as the candidate. Rather than returning it immediately, she begins the undisclosed-item check with Lena.",
        ),
      }),
      additions[1],
      additions[2],
      additions[3],
      additions[4],
      additions[5],
    ],
  };
}

function reviseMoonpost(): EnglishEpisode {
  const base = source("moonlight-post");
  const chapters = [
    chapter(
      "moonpost-invitation",
      "첫 등불을 함께",
      "An invitation for a first lantern",
      "달빛 우체국 분류대",
      "The Moonlight Post Office sorting desk",
      "미로의 부탁을 듣고, 초대장이 갈 곳과 탈 배를 알아봐요.",
      "Understand the invitation, identify its recipient, and prepare for the right boat.",
      "토끼 미로가 조금 삐뚤어진 등불을 들고 우체국에 찾아옵니다. 혼자 만든 첫 등불입니다. 어릴 때 매듭을 가르쳐준 윌로 할머니와 내일 해 질 무렵 축제에서 함께 밝히고 싶다고 하네요. 할머니는 동쪽 등대에 살고 있어, 오늘 밤 초대장을 받아야 준비할 시간이 생깁니다. 여우 우체국장 솔이 배달 약속을 짚어줍니다. 봉투에는 받는이와 장소를 적습니다. 흰 등불 배는 동쪽 등대로, 호박빛 등불 배는 사과 과수원으로 갑니다. 출항은 두 번째 종이 울릴 때입니다. 해가 뜨면 다음 밤까지 배가 쉬니, 이번 초대장은 오늘 전해야겠죠.",
      "Miro the rabbit arrives with his first, rather uneven lantern. He wants to light it at tomorrow's sunset festival with Grandma Willow, who taught him knots when he was small. She lives at the East Lighthouse and needs the invitation tonight so she can prepare. Sol the fox explains the existing delivery rules: an envelope needs a recipient and a destination; the white-lantern boat serves the East Lighthouse, the amber-lantern boat serves the Apple Orchard, and departure is at the second bell. The boats rest from sunrise until the following night, so this invitation cannot wait.",
      base.image,
      base.imageAlt,
      "A fox postal worker and a rabbit exchange a letter at a moonlit tree post office.",
      [
        line(
          "Miro",
          "Grandma taught me the knot for this lantern. I want her beside me when I light it.",
          "이 매듭은 할머니가 가르쳐주셨어요. 등불을 켤 때 옆에 계시면 좋겠어요.",
        ),
        line(
          "Sol",
          "Then let's send your invitation tonight. Have you written her name and destination?",
          "그럼 초대장을 오늘 보내자꾸나. 할머니 이름과 사는 곳은 적었니?",
        ),
        line(
          "You",
          "I'll check the address and the boat before we leave.",
          "출발하기 전에 주소랑 배부터 확인해볼게요.",
        ),
      ],
    ),
    chapter(
      "moonpost-journey",
      "등대까지 가는 길",
      "The right route, not just the nearest",
      "동쪽 선착장과 조개 표지 돌길",
      "The eastern landing and shell-marked stone path",
      "배에서 들은 말과 길의 표지를 맞춰보고, 갈 길을 다시 말해봐요.",
      "Distinguish boat directions from signs on land and explain your route.",
      "솔은 봉투를 제자리에 넣으며 첫 번째 종은 준비 신호라고 다시 일러줍니다. 호박빛 배가 더 가까이 있어도, 등대로 가려면 흰 등불 배를 타야 합니다. 두 번째 종이 울려 배가 떠나자 펀 선장이 육지의 길을 설명합니다. 시계탑 옆에서 내려 조개 표지가 있는 돌길을 따라가면 된다고요. 나무다리는 지름길처럼 보이지만 과수원 쪽으로 이어집니다. 잘못 들은 곳이 없는지 선장에게 다시 묻고, 걸어갈 길을 배달 일지에 적어봅시다.",
      "After sorting the envelope, Sol reminds you that the first bell means preparation only. Even though the amber boat is nearer, the white-lantern boat goes to the lighthouse. Once you depart at the second bell, Captain Fern explains the route on land: get off beside the clock tower and follow the shell-marked stone path. A wooden bridge looks like a shortcut but leads towards the orchard. Before setting off on foot, repeat what you heard and write the route in your delivery log.",
      base.image,
      base.imageAlt,
      "The moonlit tree post office where the letter's journey begins.",
      [
        line(
          "Captain Fern",
          "White lantern for the lighthouse. Second bell for departure. Do you want me to repeat that?",
          "등대행은 흰 등불 배입니다. 두 번째 종에 떠나고요. 한 번 더 말씀드릴까요?",
        ),
        line(
          "You",
          "Could you say that again? I want to be sure I've chosen the right boat.",
          "네, 다시 말씀해주실 수 있나요? 제가 맞는 배를 골랐는지 확인하고 싶어요.",
        ),
        line(
          "Captain Fern",
          "Of course. On shore, follow the shell signs on the stone path.",
          "물론이지요. 육지에 내리면 돌길에 있는 조개 표지를 따라가세요.",
        ),
      ],
    ),
    chapter(
      "moonpost-arrival",
      "할머니가 문을 열면",
      "A message reaches the lighthouse",
      "동쪽 등대 문 앞에서",
      "The East Lighthouse doorstep",
      "이름을 확인해 편지를 건네고, 다음 편지에 맞는 배도 골라봐요.",
      "Confirm the recipient, deliver the letter, and plan the next delivery to a different destination.",
      "돌길 끝에 등대 불빛이 포근하게 번집니다. 문을 연 윌로 할머니는 작은 둥근 안경을 쓰고 연보라색 숄을 두른 토끼입니다. 이제 이름을 확인하고 미로의 편지를 건넬 차례입니다. 안의 이야기는 할머니가 직접 읽겠죠. 첫 등불을 함께 밝히고 싶다는 미로의 마음이 닿으면, 내일의 준비도 시작될 겁니다. 배달을 마친 뒤에는 다음 편지가 기다립니다. 이번에는 등대가 아니라 과수원으로 가니, 아까 탔던 배를 그대로 골라서는 안 되겠네요.",
      "At the end of the stone path, you see the lighthouse's soft light. Willow opens the door: an elderly rabbit with small round glasses and a pale lavender shawl. Now it is your turn to check her name and deliver the letter for her to read herself. If Miro's wish to share his achievement reaches her, preparations for tomorrow can begin. After completing the delivery, you will plan the next request. This time the destination is the orchard, not the lighthouse, so repeating the previous boat choice would be wrong.",
      "/assets/english/moonpost-lighthouse.webp",
      "달빛 아래 등대 현관에서 토끼 할머니 윌로가 배달 편지를 건네받는 모습",
      "Grandma Willow, an elderly rabbit, receives a delivered letter at a moonlit lighthouse door.",
      [
        line(
          "You",
          "Are you Grandma Willow? I have a letter for you from Miro.",
          "윌로 할머니가 맞으신가요? 미로가 보낸 편지가 있어요.",
        ),
        line(
          "Grandma Willow",
          "Yes, I'm Willow. May I ask who sent it?",
          "그래, 내가 윌로란다. 누가 보냈다고 했지?",
        ),
        line(
          "You",
          "Miro asked me to deliver it to you tonight.",
          "미로가 오늘 밤 할머니께 전해달라고 부탁했어요.",
        ),
      ],
    ),
  ];
  const additions: EnglishTask[] = [
    {
      id: "moonpost-miro-purpose",
      chapterId: chapters[0].id,
      skill: "listening",
      speaker: storyName("Miro"),
      title: text("오늘 밤 전하고 싶은 마음", "Why must it arrive tonight?"),
      context: text(
        "미로가 왜 할머니를 초대하고 싶은지 말합니다. 오늘 밤 편지를 전해달라는 부탁에도 까닭이 있겠죠. 들어봅시다.",
        "Miro explains why he is sending the invitation. The delivery connects two people's plans, rather than merely matching a boat timetable.",
      ),
      document: text("미로가 건네는 부탁", "Miro explains the invitation"),
      feedback: text(
        "할머니는 미로에게 매듭을 가르쳐준 분이에요. 미로는 처음 만든 등불을 내일 함께 밝히고 싶어 하죠. 초대장을 오늘 받아야 할머니가 종이를 준비할 수 있어요. 다음 밤 배를 기다리면 내일 해 질 무렵 축제에 늦고요.",
        "Grandma taught Miro knots, and he wants her to help light his first lantern tomorrow. Receiving the invitation tonight gives her time to prepare paper. Waiting for the following night's boat would be too late for the sunset festival.",
      ),
      consequence: text(
        "오늘 밤 전해야 하는 까닭을 알았습니다. 주소를 마저 쓰기 전에, 솔에게 탈 배와 출항 신호를 물어봅니다.",
        "You understand why tonight's delivery matters. Before completing the address, you ask Sol about the boat and its departure signal.",
      ),
      expressionIds: ["moonpost-repeat"],
      versions: {
        starter: pick(
          "Grandma taught me to make a knot. I made my first lantern. I want to light it with her tomorrow. Please give her the invitation tonight.",
          "할머니가 매듭을 가르쳐주셨어요. 제가 첫 등불을 만들었는데, 내일 할머니랑 같이 켜보고 싶어요. 오늘 밤 초대장을 전해주실래요?",
          "미로는 왜 할머니를 초대하고 싶어 할까요?",
          "Why does Miro invite his grandmother?",
          [
            "He wants to light his first lantern with her.",
            "He wants her to repair the boat motor.",
            "He wants her to move to the orchard tonight.",
          ],
          0,
        ),
        standard: pick(
          "Grandma showed me the knot when I was little. Now I've made my first lantern, and I want us to light it together at sunset tomorrow. She needs tonight to prepare some paper. If the letter waits until the next night's boat, it will be too late.",
          "어릴 때 할머니가 이 매듭을 가르쳐주셨어요. 이제 첫 등불을 만들었으니 내일 해 질 무렵 같이 밝혀보고 싶어요. 할머니가 오늘 밤 종이를 준비하셔야 해요. 다음 밤 배까지 기다리면 늦거든요.",
          "함께 하고 싶은 일과 오늘 전해야 하는 까닭이 모두 맞는 답은 무엇인가요?",
          "Which answer gets both the invitation and its timing right?",
          [
            "The festival is tonight, and the boat leaves at sunrise.",
            "Grandma needs to open every letter before helping anyone.",
            "Miro wants to light the lantern with Grandma, who needs time to prepare.",
          ],
          2,
        ),
        challenge: pick(
          "This is the first lantern I've made without Grandma's help. She taught me the knot years ago, and I want to share this small achievement with her. The festival begins at sunset tomorrow. Because the boats rest during the day, the letter must reach her tonight if she is to prepare before the festival.",
          "할머니 도움 없이 처음 만든 등불이에요. 몇 년 전에 매듭을 가르쳐주셨는데, 이번에 제가 해낸 걸 같이 나누고 싶어요. 축제는 내일 해 질 무렵 시작해요. 배는 낮에 쉬니까, 그전에 준비하시려면 오늘 밤 편지를 받으셔야 해요.",
          "초대장을 오늘 밤 전해야 하는 까닭을 가장 잘 짚은 답은 무엇인가요?",
          "Which answer best explains why the delivery should happen tonight?",
          [
            "Magic will destroy the lantern unless a grammar answer is correct.",
            "It gives Grandma time to prepare for a shared moment before daytime service stops and tomorrow's festival begins.",
            "The orchard and lighthouse have the same address.",
          ],
          1,
        ),
      },
    },
    {
      id: "moonpost-repeat-plan",
      chapterId: chapters[1].id,
      skill: "speaking",
      speaker: text("당신 → 펀 선장", "You → Captain Fern"),
      title: text("한 번 더 말씀해주세요", "Ask again to be sure"),
      context: text(
        "배에 오르기 전에 펀 선장에게 안내를 다시 말해달라고 부탁해보세요. 들은 내용을 한 번 더 말하면 잘 이해했는지도 알 수 있겠죠.",
        "Before boarding, ask the captain to repeat the instructions and restate your departure plan. The purpose is to check understanding through conversation.",
      ),
      document: text("펀 선장에게 다시 물을 말", "Confirm the plan with the captain"),
      feedback: text(
        "Could you say that again?으로 다시 들려달라고 부탁할 수 있어요. 흰 등불 배와 두 번째 종을 함께 말하면 어떤 배를 언제 탈지 확인할 수 있죠. 직접 소리 내어 말해보세요.",
        "Use 'Could you say that again?' to hear the instructions once more. Restating both the white-lantern boat and the second bell checks the boat and its time together. Speak aloud, then confirm your practice.",
      ),
      consequence: text(
        "펀 선장이 배와 출항 신호를 다시 짚어줍니다. 두 번째 종이 울리자 흰 등불 배에 올라 동쪽으로 향합니다.",
        "Fern confirms the boat and signal. When the second bell rings, you board the white-lantern boat and head east.",
      ),
      expressionIds: ["moonpost-repeat", "moonpost-departure"],
      versions: {
        starter: speak(
          "Ask the captain to repeat the instructions.",
          "선장에게 안내를 한 번 더 말해달라고 부탁해보세요.",
          "한 번 더 말씀해달라고 소리 내어 부탁해보세요.",
          "Ask aloud for the instructions to be repeated.",
          "Could you say that again?",
          "Could you…?",
        ),
        standard: speak(
          "The lighthouse boat has a white lantern and leaves at the second bell. Ask for a repeat, then state the plan.",
          "등대행 배는 흰 등불을 달고 두 번째 종에 떠납니다. 한 번 더 말해달라고 부탁한 뒤, 내가 탈 배와 시간을 다시 말해보세요.",
          "다시 들려달라고 부탁하고, 흰 등불 배를 두 번째 종에 타겠다고 말해보세요.",
          "Ask for a repeat and state the white-lantern boat and second-bell plan.",
          "Could you say that again? I'll take the white-lantern boat at the second bell.",
        ),
        challenge: speak(
          "You need to verify the destination, the correct boat, and the departure signal before boarding. Ask for a repeat and restate all three details in your own words.",
          "오르기 전에 갈 곳, 탈 배, 떠날 신호를 확인해봅시다. 선장에게 다시 들려달라고 부탁하고, 세 가지를 내가 이해한 대로 말해보세요.",
          "다시 물어본 뒤 갈 곳, 배, 출항 신호를 말해보세요. 선장이 맞는지 확인해줄 수 있도록요.",
          "After asking for a repeat, restate the destination, boat, and signal so the captain can confirm them.",
          "Could you say that again? I'm going to the East Lighthouse on the white-lantern boat when the second bell rings.",
        ),
      },
    },
    {
      id: "moonpost-map-check",
      chapterId: chapters[1].id,
      skill: "reading",
      title: text("표지판에도 같은 길이 있을까", "Compare the directions with the map"),
      context: text(
        "선착장에 안내판이 있습니다. 선장에게 들은 말과 맞는 길을 찾아보세요. 그림을 짐작하기보다 안내판의 글을 읽으면 좋겠습니다.",
        "Read the sign at the landing. Choose the land route matching the captain's instructions, using the written information rather than guessing from the illustration.",
      ),
      document: text("선착장의 길 안내판", "Landing route sign"),
      feedback: text(
        "시계탑 옆 선착장에서 조개 표지 돌길을 따라가면 동쪽 등대에 닿아요. 나무다리는 가까워 보여도 과수원행이죠. 선장이 말한 길을 다른 자료에서 한 번 더 확인한 셈이에요.",
        "The lighthouse route is: landing beside the clock tower → shell-marked stone path → East Lighthouse. The wooden bridge leads to the orchard, so it is wrong for this destination even if it looks nearer. You are checking the same directions in another source, not discovering a new magical rule.",
      ),
      consequence: text(
        "조개 표지의 돌길을 찾았습니다. 나무다리는 건너지 않고, 걸어갈 길을 배달 일지에 남깁니다.",
        "You identify the shell-marked stone path and plan to avoid the wooden bridge. You record the route in your delivery log.",
      ),
      expressionIds: ["moonpost-stone-path"],
      versions: {
        starter: pick(
          "Lighthouse: clock tower → shell signs → stone path. Orchard: wooden bridge → apple signs.",
          "등대행: 시계탑 → 조개 표지 → 돌길. 과수원행: 나무다리 → 사과 표지.",
          "등대에 가려면 어느 표지를 따라가나요?",
          "Which signs should you follow to reach the lighthouse?",
          [
            "Apple signs over the bridge.",
            "Shell signs along the stone path.",
            "Any sign near the boat.",
          ],
          1,
        ),
        standard: pick(
          "From the clock-tower landing, shell signs lead along the stone path to the East Lighthouse. The wooden bridge joins the route marked with apple signs to the orchard. The two paths do not have the same destination.",
          "시계탑 선착장에서 조개 표지를 따라 돌길로 가면 동쪽 등대입니다. 나무다리는 사과 표지가 있는 과수원 쪽 길로 이어집니다. 두 길이 같은 곳으로 가는 것은 아닙니다.",
          "선장에게 들은 말과 지도에 적힌 길이 같은 답을 골라보세요.",
          "Which route agrees with both the captain and the map?",
          [
            "The bridge because both paths end at the lighthouse.",
            "The apple route because it is nearest.",
            "The shell-marked stone path from the clock-tower landing.",
          ],
          2,
        ),
        challenge: pick(
          "Map note: The landing is beside the clock tower. The shell-marked stone path runs from there towards the East Lighthouse. The wooden bridge turns towards the orchard's apple-marked route. It may shorten a journey to the orchard, but it does not shorten this delivery to Willow.",
          "지도 설명: 선착장은 시계탑 옆에 있습니다. 여기서 조개 표지 돌길이 동쪽 등대로 이어집니다. 나무다리는 사과 표지가 있는 과수원 쪽으로 꺾입니다. 과수원에 가는 길이라면 짧아질 수도 있지만, 윌로 할머니께 가는 이번 배달의 지름길은 아닙니다.",
          "나무다리가 이번 배달의 지름길은 아닌 까닭이 무엇인가요?",
          "Why is the apparent shortcut the wrong choice?",
          [
            "Its destination is the orchard, while this letter is for the East Lighthouse.",
            "The wooden bridge is a new magical lock that needs a password.",
            "All shell signs have disappeared since the boat arrived.",
          ],
          0,
        ),
      },
    },
    {
      id: "moonpost-route-log",
      chapterId: chapters[1].id,
      skill: "writing",
      title: text("일지에 남길 짧은 계획", "Write the route in your delivery log"),
      context: text(
        "처음 가는 길이니 일지에 짧게 적어두면 좋겠습니다. 따라갈 길과 도착할 곳을 써보세요.",
        "As a trainee, write a short plan to avoid mixing up the routes. Record the stone path and your destination before walking to the lighthouse.",
      ),
      document: text("배달 일지", "Delivery route log"),
      feedback: text(
        "I'll follow the stone path.로 돌길을 따라가겠다고 말할 수 있어요. 기본에서는 동쪽 등대까지, 도전에서는 출발할 시계탑도 함께 적어주세요. 써두면 길을 다시 확인하기 쉬워요.",
        "'I'll follow the stone path.' explains the route you will take. In Standard, add the East Lighthouse; in Challenge, also include the clock tower as your starting point. Writing helps you remember and check the known route.",
      ),
      consequence: text(
        "돌길과 등대를 일지에 적고, 조개 표지를 따라 걷습니다. 미로의 편지는 봉인된 채 가방 안에 있습니다.",
        "After recording the stone path and lighthouse destination, you follow the shell signs. Miro's letter stays sealed in your bag.",
      ),
      expressionIds: ["moonpost-stone-path"],
      versions: {
        starter: write(
          "Write that you will follow the stone path.",
          "돌길을 따라가겠다고 써보세요.",
          "돌길을 따라가겠다는 말을 영어로 써보세요.",
          "Write a route plan including stone path.",
          "I'll follow the stone path.",
          [["stone path"], ["follow", "take", "use"]],
          "I'll follow…",
          ["I will follow the stone path."],
        ),
        standard: write(
          "Plan to follow the stone path to the East Lighthouse.",
          "돌길을 따라 동쪽 등대로 갈 계획입니다.",
          "돌길을 따라 동쪽 등대로 가겠다고 써보세요.",
          "Write the stone-path route and East Lighthouse destination.",
          "I'll follow the stone path to the East Lighthouse.",
          [["stone path"], ["east"], ["lighthouse"], ["follow", "take", "use"]],
        ),
        challenge: write(
          "Write the route from the clock-tower landing to the East Lighthouse, using the stone path with shell signs.",
          "시계탑 선착장에서 출발해, 조개 표지 돌길을 따라 동쪽 등대로 가는 길을 써보세요.",
          "시계탑에서 출발해 돌길로 동쪽 등대에 가겠다고 써보세요.",
          "Include the clock tower, stone path, and East Lighthouse in your plan.",
          "From the clock tower, I'll follow the stone path to the East Lighthouse.",
          [["clock tower"], ["stone path"], ["east"], ["lighthouse"], ["follow", "take", "use"]],
        ),
      },
    },
    {
      id: "moonpost-receipt",
      chapterId: chapters[2].id,
      skill: "reading",
      title: text("도착했다는 작은 답", "Delivery confirmation and tomorrow's plans"),
      context: text(
        "편지를 읽은 윌로 할머니가 수령 확인표를 적어줍니다. 안의 편지가 아니라, 받았다는 표시와 할머니가 전하고 싶은 말을 읽어보세요.",
        "After receiving the letter, Willow writes a delivery acknowledgement. Read the receipt and the response she chooses to share, not the private letter itself.",
      ),
      document: text("윌로 할머니의 수령 확인표", "Willow's delivery acknowledgement"),
      feedback: text(
        "확인표에는 윌로 할머니가 동쪽 등대에서 오늘 밤 편지를 받았다고 적혀 있어요. 내일 축제에 가져갈 종이도 준비하겠다고 하죠. 초대장이 제때 닿은 덕분에 준비할 시간이 생긴 거예요.",
        "The receipt confirms that Grandma Willow received the letter at the East Lighthouse tonight. She also says she will prepare paper for tomorrow's sunset festival. The delivery gives her time to prepare, completing the reason this letter had to arrive tonight.",
      ),
      consequence: text(
        "편지를 전했다고 일지에 남깁니다. 할머니는 내일 미로와 밝힐 등불의 종이를 준비합니다. 다음 편지는 다른 곳으로 가니 배도 다시 골라야겠죠.",
        "You record the delivery. Willow prepares paper to help light Miro's first lantern tomorrow. The next delivery has a different destination, so you will need to choose its route again.",
      ),
      expressionIds: ["moonpost-arrived"],
      versions: {
        starter: pick(
          "Received tonight: Grandma Willow, East Lighthouse. The letter has arrived. I will prepare paper for Miro's lantern tomorrow.",
          "오늘 밤 받았습니다. 윌로 할머니, 동쪽 등대. 편지가 도착했어요. 내일 미로의 등불에 쓸 종이를 준비할게요.",
          "할머니는 내일을 위해 무엇을 준비하나요?",
          "What will Willow prepare for tomorrow?",
          ["A new boat motor.", "A key to the emergency door.", "Paper for Miro's lantern."],
          2,
        ),
        standard: pick(
          "Grandma Willow confirms receipt tonight at the East Lighthouse. Her response: 'The letter has arrived. I have time to prepare paper before tomorrow's sunset festival. I look forward to lighting Miro's first lantern with him.'",
          "윌로 할머니가 동쪽 등대에서 오늘 밤 편지를 받았다고 적었습니다. “편지가 도착했네요. 내일 해 질 무렵 축제 전에 종이를 준비할 시간이 생겼어요. 미로랑 첫 등불을 같이 밝힐 생각에 기쁘네요.”",
          "오늘 밤 초대장을 받은 덕분에 할머니는 무엇을 할 수 있나요?",
          "How does tonight's delivery connect with her response?",
          [
            "It gives Willow time to prepare for a shared festival moment.",
            "It cancels the festival because the letter came too early.",
            "It changes the white-lantern boat into the orchard boat.",
          ],
          0,
        ),
        challenge: pick(
          "Delivery acknowledged by Grandma Willow at the East Lighthouse tonight. She voluntarily adds: 'Now I can prepare the paper before tomorrow's sunset festival. Miro has made the lantern himself; I want to be there when he lights it.' The private letter remains with its recipient. Your log records its delivery, not its full contents.",
          "윌로 할머니가 동쪽 등대에서 오늘 밤 편지를 받았다고 확인합니다. 할머니가 덧붙입니다. “이제 내일 해 질 무렵 축제 전에 종이를 준비할 수 있겠구나. 미로가 혼자 등불을 만들었다니, 켜는 순간에 곁에 있고 싶단다.” 개인 편지는 받은 사람이 간직하고, 일지에는 안의 글을 옮겨 쓰지 않고 전했다는 사실만 남깁니다.",
          "초대장을 전한 까닭과 일지에 남길 내용이 모두 맞는 답을 골라보세요.",
          "Which conclusion understands both the story's goal and the limits of the delivery log?",
          [
            "Copy the entire letter into the public log because it was delivered at night.",
            "Record the completed delivery; Willow can prepare for the festival and keeps the letter itself.",
            "Send the letter back unopened because recipients cannot read their own mail.",
          ],
          1,
        ),
      },
    },
    {
      id: "moonpost-transfer",
      chapterId: chapters[2].id,
      skill: "speaking",
      speaker: text("당신 → 솔", "You → Sol"),
      title: text("다음 편지는 과수원으로", "The next letter has a different destination"),
      context: text(
        "다음 편지는 사과 과수원에 사는 파인에게 갑니다. 아까 탔던 흰 배 말고, 이번 목적지에 맞는 배를 골라보세요.",
        "The next request is a letter for Pine at the Apple Orchard. Apply the same rules, but do not automatically choose the white boat from your previous trip.",
      ),
      document: text("다음 과수원행 편지", "New situation · A letter for the orchard"),
      feedback: text(
        "과수원행은 호박빛 등불 배예요. 떠나는 때는 여전히 두 번째 종이고요. 어디로 갈 편지인지 먼저 묻고 나면, 앞서 고른 답을 그대로 되풀이하지 않을 수 있어요.",
        "The orchard route uses the established amber-lantern boat, and departure is still at the second bell. Asking about the destination helps you apply the rule to a new delivery rather than repeat a memorised answer.",
      ),
      consequence: text(
        "솔이 과수원 주소를 확인해줍니다. 이번에는 호박빛 등불 배를 준비합니다. 할머니께 가는 편지는 잘 전했고, 다음 배달도 스스로 계획해보았습니다.",
        "Sol confirms the orchard address. You prepare for the amber-lantern boat. Willow's delivery is complete, and you can use the same principles to plan the next one.",
      ),
      expressionIds: ["moonpost-destination", "moonpost-departure"],
      versions: {
        starter: speak(
          "The new letter goes to the Apple Orchard. Say which boat you will take: the amber-lantern boat.",
          "이번 편지는 사과 과수원으로 갑니다. 호박빛 등불 배를 타겠다고 말해보세요.",
          "이번에 탈 배를 소리 내어 말해보세요.",
          "Say aloud which boat matches this destination.",
          "I'll take the amber-lantern boat.",
          "I'll take…",
        ),
        standard: speak(
          "The letter is for Pine at the Apple Orchard. Ask when the boat leaves, then state your choice. Both routes still depart at the second bell.",
          "사과 과수원에 사는 파인에게 갈 편지입니다. 배가 언제 떠나는지 묻고, 내가 탈 배를 알려주세요. 두 노선 모두 두 번째 종에 떠납니다.",
          "언제 떠나는지 묻고, 호박빛 배를 두 번째 종에 타겠다고 말해보세요.",
          "Ask about departure and state the amber-boat, second-bell plan.",
          "When does the boat leave? I'll take the amber-lantern boat at the second bell.",
        ),
        challenge: speak(
          "A new sealed letter is addressed to Pine at the Apple Orchard. Confirm the destination with Sol, ask about departure, and explain which boat fits the existing route rules. Do not use the lighthouse route merely because it worked before.",
          "새 봉인 편지는 사과 과수원의 파인에게 갑니다. 솔에게 갈 곳을 확인하고 출항 시간을 물어보세요. 배달 약속에 맞춰 탈 배도 설명해보세요. 앞서 잘 갔다고 등대행 배를 또 타면 안 되겠죠.",
          "이번 편지가 갈 곳과 출발 시간을 물어보고, 맞는 배를 골라 말해보세요.",
          "Connect a destination question, departure question, and boat choice for this new recipient and place.",
          "Where should I deliver this letter? When does the boat leave? For Pine at the Apple Orchard, I'll take the amber-lantern boat at the second bell.",
        ),
      },
    },
  ];
  return {
    ...base,
    takeaway: inheritedTakeaway(base),
    minutes: 30,
    chapters,
    synopsis: text(
      "혼자 만든 첫 등불을 할머니와 함께 밝히고 싶은 미로. 달빛 배를 타고, 조개 표지의 길을 따라 그 초대장을 전해주세요.",
      "Miro wants to light his first handmade lantern with Grandma. Understand his invitation and follow the established boat and path rules to deliver it to the lighthouse.",
    ),
    intro: chapters[0].story,
    ending: text(
      "미로는 할머니가 가르쳐준 매듭으로 첫 등불을 만들었습니다. 이제 그 불빛을 내일 할머니와 함께 보고 싶었던 거죠. 봉투에 이름과 장소를 적고 두 번째 종이 울릴 때 흰 등불 배에 올랐습니다. 조개 표지를 따라 돌길을 걸어가니 등대 문을 열고 윌로 할머니가 나왔습니다. 이름을 확인하고 편지를 건네자, 할머니는 직접 읽고 내일 축제에 쓸 종이를 준비하기로 했습니다. 오늘 밤 도착한 초대장이 내일의 약속을 이어준 셈입니다. 다음 편지는 과수원행이었습니다. 이번에는 호박빛 등불 배를 골라, 같은 약속을 다른 길에도 적용해보았습니다.",
      "Miro made his first lantern using the knot Grandma taught him and wanted to share that achievement tomorrow. You wrote the recipient and destination and boarded the white-lantern boat at the second bell. Following the shell-marked stone path, you reached the lighthouse, confirmed Grandma Willow's name, and delivered the letter. She read it herself and began preparing paper for the festival. Tonight's delivery made tomorrow's shared moment possible. For the next orchard request, you chose the amber-lantern boat, applying the same rules to a different destination.",
    ),
    cast: [
      {
        name: storyName("Miro"),
        role: text("첫 등불을 만든 어린 토끼", "Young rabbit who made his first lantern"),
        motivation: text(
          "혼자 완성한 첫 등불을, 매듭을 가르쳐준 할머니와 함께 밝히고 싶습니다.",
          "Wants to light his first independent lantern with the grandmother who taught him knots.",
        ),
      },
      {
        name: storyName("Sol"),
        role: text("여우 우체국장", "Fox postmaster"),
        motivation: text(
          "처음 배달에 나선 이가 주소와 배를 헷갈리지 않도록 도와줍니다.",
          "Helps the trainee understand addresses and the established route rules.",
        ),
      },
      {
        name: storyName("Grandma Willow"),
        role: text("동쪽 등대의 토끼 할머니", "Grandmother rabbit at the East Lighthouse"),
        motivation: text(
          "미로가 자란 모습을 기뻐하며, 내일 함께 밝힐 등불의 종이를 준비하려 합니다.",
          "Celebrates Miro's progress and wants to prepare paper for lighting his lantern together tomorrow.",
        ),
      },
      {
        name: storyName("Captain Fern"),
        role: text("달빛 배 선장", "Moon boat captain"),
        motivation: text(
          "배를 타고 내리는 곳부터 육지의 길까지, 편지가 무사히 닿도록 알려줍니다.",
          "Explains boat and land directions separately so the letter reaches the right home.",
        ),
      },
    ],
    debrief: {
      question: text(
        "초대장을 오늘 밤 전해야 했던 까닭은 무엇일까요? 다음 편지에는 왜 다른 배를 골랐나요?",
        "Explain why the invitation needed to arrive tonight and why you chose a different boat for the next letter.",
      ),
      model:
        "Willow needed time to prepare before tomorrow's festival, and the boats rest during the day. The next letter was for the Apple Orchard, so I chose the amber-lantern boat instead of the lighthouse boat.",
      modelKo: text(
        "윌로 할머니는 내일 축제 전에 준비할 시간이 필요했어요. 배는 낮 동안 쉬고요. 다음 편지는 사과 과수원으로 가서, 등대행 배가 아니라 호박빛 등불 배를 골랐어요.",
        "Willow needed time to prepare before tomorrow's festival, and the boats rest during the day. The next letter was for the Apple Orchard, so I chose the amber-lantern boat instead of the lighthouse boat.",
      ),
    },
    expressions: [
      ...base.expressions.map(polishExpression),
      expression(
        "moonpost-repeat",
        "Could you say that again?",
        "다시 말씀해주실 수 있을까요?",
        "안내를 한 번 더 듣고 싶습니다. 다시 말해달라고 부탁해보세요.",
        "You want to hear the instructions once more. Ask for a repeat.",
        ["Can you say that again?", "Could you repeat that?", "Please say that again."],
      ),
      expression(
        "moonpost-stone-path",
        "I'll follow the stone path.",
        "돌길을 따라갈게요.",
        "선착장에서 들은 길을 내가 이해한 대로 말해보세요.",
        "Restate the route you heard at the landing.",
        ["I will follow the stone path.", "I'll take the stone path."],
      ),
      expression(
        "moonpost-arrived",
        "The letter has arrived.",
        "편지가 도착했어요.",
        "편지가 닿았다는 말을 배달 일지에 남겨보세요.",
        "Record in one sentence that the letter has arrived.",
        ["The letter arrived.", "The letter has been delivered."],
      ),
    ],
    tasks: [
      keep(base, "moonpost-assignment", chapters[0].id),
      additions[0],
      keep(base, "moonpost-boat", chapters[0].id),
      keep(base, "moonpost-address", chapters[0].id, {
        consequence: text(
          "솔이 이름과 장소를 살핀 뒤 흰 등불 배의 우편 가방에 넣습니다. 떠나기 전에 선장에게 배와 시간을 다시 물어볼 여유가 있습니다.",
          "Sol checks the recipient and destination and places the letter in the white-lantern boat's mailbag. There is still time to confirm the plan with the captain before departure.",
        ),
      }),
      additions[1],
      keep(base, "moonpost-route", chapters[1].id),
      additions[2],
      additions[3],
      keep(base, "moonpost-deliver", chapters[2].id),
      additions[4],
      additions[5],
    ],
  };
}

type CopyPair = [string, string];
type RetainedTaskCopy = Partial<
  Record<"title" | "context" | "document" | "feedback" | "consequence" | "speaker", CopyPair>
> & {
  versions?: Partial<
    Record<
      "starter" | "standard" | "challenge",
      Partial<Record<"translation" | "prompt", CopyPair>>
    >
  >;
};
const retainedTaskCopy: Record<string, RetainedTaskCopy> = {
  "bookshop-notice": {
    title: ["문 옆에 붙은 안내", "A notice by the front door"],
    context: [
      "자동문 옆에 안내 카드가 붙어 있습니다. 정문으로 나가기 전에 무엇부터 하면 될까요?",
      "Read the notice beside the automatic door. What should you check before leaving through the front entrance?",
    ],
    document: ["문 옆 안내 카드", "Staff notice"],
    feedback: [
      "먼저 인터폰으로 직원에게 연락해야 해요. 밖에 쓰러진 간판을 치웠는지 확인해야 하니까요. 창문 손잡이로는 출입문을 열 수 없고, 전원이 돌아올 때까지 기다릴 필요도 없어요. 급히 나가야 한다면 초록색 비상문을 쓸 수 있어요.",
      "Contact staff on the intercom before using the front door. They need to confirm that the fallen sign has been cleared from the path outside. The window handle does not operate the door, and you do not need to wait for power to return. If you need to leave immediately, the green emergency door is always available.",
    ],
    consequence: [
      "정문 옆에서 인터폰을 찾았습니다. 화면에 야간 직원 하나의 이름이 뜹니다.",
      "You find the intercom beside the front door. Hana's name appears on its screen.",
    ],
    versions: {
      starter: {
        translation: [
          "정문에 전원이 들어오지 않습니다. 먼저 인터폰으로 직원에게 연락해주세요. 초록색 비상문은 안에서 언제든 열 수 있습니다.",
          "The front door has no power. Call the staff on the intercom first. The green emergency door is always open from inside.",
        ],
        prompt: [
          "정문으로 나가기 전에 무엇부터 해야 하나요?",
          "What should you do first before leaving through the front door?",
        ],
      },
      standard: {
        translation: [
          "정전으로 정문 모터가 멈췄습니다. 수동 해제 장치를 쓰기 전에 인터폰으로 직원에게 연락해주세요. 밖에 쓰러진 간판을 치웠는지 확인해야 합니다. 초록색 비상문은 안에서 언제든 밀어 열 수 있습니다.",
          "The front door's motor is off after the power cut. Before using the manual release, contact staff on the intercom. We need to check that the fallen sign outside has been cleared. You can always push the green emergency door open from inside.",
        ],
        prompt: [
          "정문을 손으로 열기 전에 해야 할 일은 무엇인가요?",
          "Choose the step you need to take before opening the front door manually.",
        ],
      },
      challenge: {
        translation: [
          "정전으로 정문 모터가 멈췄지만 수동 해제 장치는 쓸 수 있습니다. 폭풍으로 간판이 입구에 쓰러졌으니 통로가 비었는지 먼저 확인해야 합니다. 장치를 쓰기 전에 야간 직원에게 연락해주세요. 급히 나가야 한다면 초록색 비상문을 안에서 밀어 열 수 있습니다. 은색 걸쇠는 창문용입니다.",
          "A power cut has stopped the front door's motor, but its manual release still works. Please contact the night staff before operating it: a sign fell across the entrance during the storm, and we must confirm that the path is clear. If you need to leave immediately, the green emergency door can always be pushed open from inside. The silver latch controls the window only.",
        ],
        prompt: [
          "직원에게 먼저 연락해야 하는 까닭까지 맞는 답을 골라보세요.",
          "Choose the action that also gives the correct reason for contacting staff first.",
        ],
      },
    },
  },
  "bookshop-message": {
    title: ["어디에 있는지, 무엇이 필요한지", "Explain where you need help"],
    context: [
      "인터폰에 짧은 글도 남길 수 있습니다. 하나에게 어디에 있는지 알리고, 문 여는 일을 도와달라고 부탁해보세요.",
      "The intercom also accepts short text messages. Tell Hana that you need help opening the front door.",
    ],
    document: ["인터폰에 남길 글", "Intercom message"],
    feedback: [
      "문을 여는 데 도움이 필요하다는 뜻을 전하면 돼요. 기본·도전에서는 정문에 있다는 말도 함께 넣어주세요. Could you help me…? 뒤에 부탁할 일을 붙이면 공손하게 도움을 청할 수 있어요.",
      "The key information is your request for help with the door. In Standard and Challenge, also explain that you are at the front door. Add the action you need after 'Could you help me…?' to make a polite request. This exercise checks the necessary information in your message; it does not grade all aspects of grammar.",
    ],
    consequence: [
      "인터폰에 부탁을 남겼습니다. 밖에 있던 하나가 위치를 확인하고 답합니다.",
      "Your request reaches Hana through the in-game intercom. She confirms your location and replies from outside.",
    ],
    versions: {
      starter: {
        translation: [
          "문 여는 데 도움이 필요하네요. 하나에게 짧게 부탁해보세요.",
          "You need help with the door. Send Hana a short request.",
        ],
        prompt: [
          "문을 열도록 도와달라는 부탁을 영어로 써보세요.",
          "Write an English sentence asking for help opening the door.",
        ],
      },
      standard: {
        translation: [
          "하나는 밖에서 입구를 정리하고 있습니다. 정문에 있다는 말과 함께, 문을 여는 일을 도와달라고 부탁해보세요.",
          "Hana is clearing the entrance outside. Tell her you are at the front door and ask for help opening it.",
        ],
        prompt: [
          "어디에 있는지 알리고 도움을 청하는 짧은 글을 써보세요.",
          "Write a short message that includes your location and a request for help.",
        ],
      },
      challenge: {
        translation: [
          "정문이 자동으로 열리지 않습니다. 밖에 있는 하나에게는 당신이 보이지 않죠. 어디에 있는지, 왜 도움이 필요한지, 무엇을 도와주면 좋을지 전해주세요.",
          "The front door will not open automatically. Hana cannot see you from outside. Explain where you are, why you need help, and what you want her to help you do.",
        ],
        prompt: [
          "정문에 있다는 말, 정전이 났다는 말, 도움을 바란다는 말을 넣어보세요.",
          "Write a message that mentions the front door, the power cut, and your request for help.",
        ],
      },
    },
  },
  "bookshop-intercom": {
    title: ["하나의 목소리를 따라", "A voice on the intercom"],
    context: [
      "하나가 밖의 상황과 문 옆 장치를 설명합니다. 먼저 듣고, 수동으로 문을 여는 손잡이를 찾아보세요.",
      "Hana describes the situation outside and the location of the door mechanism. Listen first, then find the manual release.",
    ],
    document: ["인터폰으로 들려오는 안내", "Hana's spoken instructions"],
    feedback: [
      "정문 옆 투명 덮개 아래의 빨간 손잡이가 수동 해제 장치예요. 은색 손잡이는 창문용이고, 초록색 막대는 다른 비상문에 있어요. red lever, clear cover, beside the front door를 함께 들으면 어느 장치인지 알 수 있어요.",
      "The manual release is the red lever beneath the clear cover beside the front door. The silver handle is for the window; the green bar belongs to a separate emergency door. 'Red lever', 'clear cover', and 'beside the front door' all describe the same device.",
    ],
    consequence: [
      "쓰러진 간판은 치워졌습니다. 정문 옆에서 투명 덮개 아래의 빨간 손잡이도 찾았습니다.",
      "The fallen sign has been cleared. You find the clear cover and the red lever beside the front door.",
    ],
    versions: {
      starter: {
        translation: [
          "이제 통로는 비었어요. 정문 옆 투명 덮개 아래에서 빨간 손잡이를 찾아보세요. 은색 손잡이는 창문용이에요.",
          "The path is clear now. Find the red lever beside the front door. It is under a clear cover. The silver handle is for the window.",
        ],
        prompt: [
          "문을 손으로 열게 해주는 장치는 어느 것인가요?",
          "Which device is the manual release?",
        ],
      },
      standard: {
        translation: [
          "쓰러진 간판을 치워서 밖으로 나갈 길은 비었어요. 정문 옆 투명 덮개 아래의 빨간 손잡이를 찾아보세요. 그게 수동 해제 장치예요. 은색 창문 손잡이는 그대로 두시고요. 찾으면 알려주세요.",
          "I've moved the fallen sign, so the path outside is clear. Look beside the front door for a red lever under a clear cover. That's the manual release. Leave the silver window handle alone. Tell me when you've found the lever.",
        ],
        prompt: [
          "하나가 찾으라고 한 것은 무엇인가요?",
          "Choose the device Hana asked you to find.",
        ],
      },
      challenge: {
        translation: [
          "간판을 치우고 입구도 살펴봤어요. 이제 정문을 쓰셔도 돼요. 수동 해제 장치는 문 옆 투명 덮개 아래의 빨간 손잡이예요. 가까이 있는 창문의 은색 걸쇠가 아니고요. 먼저 찾아두고 다음에 뭘 할지 물어봐주세요. 안내를 듣기 전에는 당기지 마세요.",
          "The sign has been removed and I've checked the entrance. You can use the front door now. Its manual release is the red lever beneath the transparent cover beside the door, not the silver latch on the nearby window. Find the lever first; then ask me what to do next. Don't pull it until you've heard the instructions.",
        ],
        prompt: [
          "지금 찾아야 할 것과 그다음 할 일이 모두 맞는 답을 골라보세요.",
          "Which answer gives both the correct location and the action to take now?",
        ],
      },
    },
    speaker: ["하나 · 야간 직원", "Hana · Night staff"],
  },
  "bookshop-release": {
    title: ["문을 여는 순서", "The order of the next steps"],
    context: [
      "“다음에는 뭘 하면 될까요?”라고 묻자 하나가 안내를 보내옵니다. 적힌 순서대로 문을 열어봅시다.",
      "You ask, 'What should I do next?' Hana sends a short set of instructions. Opening the door manually depends on following the device's sequence.",
    ],
    document: ["문 여는 방법", "Manual release instructions"],
    feedback: [
      "먼저 덮개를 들고, 빨간 손잡이를 아래로 당긴 뒤, 문을 밀면 돼요. first, then, finally가 그 순서를 알려줘요. 은색 창문 걸쇠는 건드리지 않아도 돼요. 문이 잘 움직이지 않으면 억지로 밀지 말고 하나에게 다시 물어보세요.",
      "The sequence is: lift the cover → pull the red lever down → push the door. 'First', 'then', and 'finally' tell you the order. The silver window latch is not part of this procedure. If the door does not open, stop and contact staff again rather than pushing harder.",
    ],
    consequence: [
      "안내대로 손잡이를 조작하자 정문이 열립니다. 하나가 지붕 있는 통로를 가리킵니다.",
      "You follow the instructions, and the front door opens manually. Hana points towards the covered walkway.",
    ],
    versions: {
      starter: {
        translation: [
          "먼저 투명 덮개를 드세요. 그다음 빨간 손잡이를 아래로 당기고, 마지막으로 문을 미세요. 안 열리면 멈추고 연락해주세요.",
          "First, lift the clear cover. Then, pull the red lever down. Finally, push the door. If it does not open, stop and call me.",
        ],
      },
      standard: {
        translation: [
          "투명 덮개부터 드세요. 빨간 손잡이를 아래로 당겨 모터 연결을 풀고 나면, 문을 손으로 밀어 열 수 있어요. 쉽게 움직이지 않으면 멈추고 다시 연락해주세요.",
          "Lift the clear cover first. Next, pull the red lever down to release the door's motor. You can then push the door open by hand. Stop and contact me if the door does not move easily.",
        ],
        prompt: ["문을 여는 순서를 골라보세요.", "Choose the correct sequence."],
      },
      challenge: {
        translation: [
          "투명 덮개를 들고 빨간 손잡이를 아래로 당기면 멈춘 모터와 문의 연결이 풀려요. 그런 다음 손으로 문을 밀어 열 수 있어요. 창문 걸쇠는 건드리지 않아도 됩니다. 문이 잘 움직이지 않으면 억지로 밀지 말고 멈춘 뒤 직원에게 다시 연락해주세요.",
          "To disengage the stopped motor, lift the transparent cover and pull the red lever down. Once the motor is disengaged, the door can be pushed open manually. The window latch plays no part in this procedure. If the door resists, stop rather than forcing it and contact staff again.",
        ],
        prompt: [
          "손잡이의 역할과 문이 잘 안 움직일 때 할 일이 모두 맞는 답은 무엇인가요?",
          "Which answer correctly explains the mechanism and what to do if the door resists?",
        ],
      },
    },
  },
  "bookshop-goodbye": {
    title: ["어느 길로 갈지 알려주기", "Say goodbye and choose your route"],
    context: [
      "하나는 골목 바닥이 아직 젖어 있다며 정문 오른쪽 통로를 알려줍니다. 그 길로 가겠다고 말하고 고마운 마음도 전해주세요.",
      "Hana recommends the covered walkway to the right of the front entrance because the alley is wet. Say which way you will go, and say goodbye.",
    ],
    document: ["서점 앞에서 나누는 인사", "Conversation outside the bookshop"],
    feedback: [
      "I'll take…로 내가 갈 길을 말할 수 있어요. 길 이름과 방향을 한 번 더 말하면 서로 같은 곳을 생각하고 있는지 확인하기 좋죠. 소리 내어 말해보고, 예문과도 비교해보세요.",
      "'I'll take…' tells someone which route you have chosen. Repeating the route helps you check that you both mean the same place. Say it aloud, then confirm that you have practiced. Your recording, pronunciation, and fluency are not scored automatically.",
    ],
    consequence: [
      "하나가 통로 쪽으로 빛을 비춰줍니다. 고맙다는 인사를 건네고 책을 들고 서점을 나섭니다.",
      "Hana shines a light towards the walkway. You thank her and leave the bookshop safely.",
    ],
    versions: {
      starter: {
        translation: [
          "오른쪽의 지붕 있는 통로로 가세요. 골목은 젖어 있어요.",
          "Take the covered walkway on the right. The alley is wet.",
        ],
        prompt: [
          "지붕 있는 통로로 가겠다고 소리 내어 말해보세요.",
          "Say aloud that you will take the covered walkway.",
        ],
      },
      standard: {
        translation: [
          "지붕 있는 통로는 오른쪽이에요. 그리로 가면 비를 피할 수 있어요. 왼쪽의 젖은 골목은 피하세요.",
          "The covered walkway is on your right. It will keep you out of the rain. Avoid the wet alley on the left.",
        ],
        prompt: [
          "어느 방향의 길로 갈지 말하고, 하나에게 고맙다는 인사도 전해보세요.",
          "Say which route and direction you will take, and thank Hana.",
        ],
      },
      challenge: {
        translation: [
          "비는 약해졌지만 왼쪽의 좁은 골목은 아직 젖어 있어요. 오른쪽의 지붕 있는 통로는 광장으로 이어져요. 오늘 밤은 그쪽으로 가는 게 좋겠어요.",
          "The rain has eased, but the narrow alley on your left is still wet. The covered walkway on the right leads to the square and is the better route tonight.",
        ],
        prompt: [
          "어느 길을 왜 택했는지 말하고 인사해보세요. 예문을 보기 전에 먼저 해보면 좋아요.",
          "Explain which route you will take and why, then say goodbye. Try before looking at the example.",
        ],
      },
    },
    speaker: ["당신 → 하나", "You → Hana"],
  },
  "locker-letter": {
    title: ["색 말고 다른 특징", "A clue more useful than colour"],
    context: [
      "7번 보관함에서 꺼낸 신고서를 읽어보세요. 레나의 가방을 구별할 만한 특징이 있을까요?",
      "Read the report from staff locker seven. Find a feature that distinguishes Lena's bag.",
    ],
    document: ["레나가 남긴 분실 신고서", "Lena's lost-property letter"],
    feedback: [
      "두 가방이 모두 파란색이라 색만으로는 구별하기 어려워요. 레나의 글에는 지퍼의 은색 별과 3시 이후에 산 레몬빵 영수증이 나와요. 빨간 꼬리표나 계피빵은 레나가 말한 특징이 아니죠. 먼저 별을 찾고, 이어서 영수증도 확인해봐요.",
      "Both bags are blue, so colour does not distinguish them. The letter mentions a silver star on the zipper and a receipt for a lemon bun bought after three. A red tag and a cinnamon bun are not the features described in the letter. Start with the zipper decoration, then check a separate clue in the next steps.",
    ],
    consequence: [
      "신고서에서 은색 별과 레몬빵을 짚었습니다. 미나가 가방을 접수할 때 남긴 음성 메모를 들려줍니다.",
      "You note the silver star and the lemon bun in the letter. Mina plays the voice memo she recorded when the bags were handed in.",
    ],
    versions: {
      starter: {
        translation: [
          "비가 시작될 때 파란 가방을 두고 왔어요. 지퍼에 은색 별이 달려 있어요. 3시가 지나서 레몬빵을 샀고, 영수증은 가방 안에 있어요. — 레나",
          "I left my blue bag when the rain started. There is a silver star on the zipper. I bought a lemon bun after three. The receipt is in the bag. — Lena",
        ],
      },
      standard: {
        translation: [
          "비가 시작될 때 안내 데스크 근처에 파란 천 가방을 두고 왔어요. 지퍼에 작은 은색 별이 달려 있습니다. 3시가 지나 항구 빵집에서 레몬빵을 사고 영수증을 안에 넣었어요. 찾으러 갈 때까지 데스크에 보관해주시면 고맙겠습니다. — 레나",
          "I left my blue canvas bag near the information desk when the rain started. A small silver star hangs from its zipper. I bought a lemon bun at the harbour bakery after three, and put the receipt inside. Please keep the bag at the desk until I return. — Lena",
        ],
        prompt: [
          "두 파란 가방을 구별할 때 더 도움이 되는 특징은 무엇인가요?",
          "Which feature is more useful for distinguishing the two blue bags?",
        ],
      },
      challenge: {
        translation: [
          "분실물 안내소 담당자님께. 비가 시작될 때 안내 데스크 옆에 파란 천 가방을 두고 온 것 같아요. 근처에 다른 파란 가방도 있어서 색만으로는 찾기 어려울 거예요. 제 가방은 지퍼에 작은 은색 별이 달려 있습니다. 안에는 3시가 지나 항구 빵집에서 산 레몬빵 영수증도 있을 거예요. 직접 찾으러 갈 테니 데스크에 보관해주시면 고맙겠습니다. — 레나",
          "To the lost-property team: I believe I left my blue canvas bag by the information desk when the rain started. Since another blue bag was nearby, colour alone will not identify mine. Look for a small silver star attached to the zipper. Inside should be a receipt for a lemon bun that I bought at the harbour bakery sometime after three. Please retain it at the desk so I can collect it in person. — Lena",
        ],
        prompt: [
          "신고서를 읽고, 함께 확인하면 좋을 두 단서를 골라보세요.",
          "Choose the pair of clues that should be checked together.",
        ],
      },
    },
  },
  "locker-testimony": {
    title: ["어느 가방이 먼저 왔을까", "When the two bags arrived"],
    context: [
      "가방이 들어왔을 때 남긴 미나의 메모입니다. 어느 쪽이 먼저 있었는지 들어보세요.",
      "Listen to Mina's recording of what happened when the bags arrived. Note which bag was already there and compare this with the letter.",
    ],
    document: ["가방 접수 때 남긴 메모", "Staff voice memo"],
    feedback: [
      "빨간 꼬리표 가방은 비가 오기 전부터 있었고, 은색 별 가방은 비가 시작된 뒤 들어왔어요. already, before, after가 그 차이를 알려줘요. 같은 색이라고 같은 가방은 아니죠. 들어온 시각은 참고할 단서이고, 영수증도 이어서 살펴봐야 해요.",
      "The red-tag bag was there before the rain. The silver-star bag was found after the rain started. 'Already', 'before', and 'after' distinguish the timing. The bags are not the same object just because they share a colour. Timing is supporting evidence; the receipt still needs to be checked.",
    ],
    consequence: [
      "은색 별 가방이 들어온 때가 신고서의 “비가 시작될 때”와 맞습니다. 이제 영수증을 비교해볼 차례입니다.",
      "The arrival of the silver-star bag agrees with the letter's reference to the start of the rain. Next, you need to check the receipt.",
    ],
    versions: {
      starter: {
        translation: [
          "빨간 꼬리표 가방은 비가 오기 전부터 있었어요. 은색 별 가방은 비가 시작된 뒤 들어왔고요. 둘 다 파란색이에요.",
          "The bag with the red tag was here before the rain. The bag with the silver star arrived after the rain started. Both bags are blue.",
        ],
        prompt: [
          "비가 오기 전부터 있던 가방은 어느 쪽인가요?",
          "Which bag was already there before the rain?",
        ],
      },
      standard: {
        translation: [
          "근무를 시작할 때 빨간 꼬리표가 달린 파란 가방은 이미 선반에 있었어요. 비가 시작된 뒤에는 누군가 지퍼에 은색 별이 달린 다른 파란 가방을 맡겼고요. 헷갈리지 않게 각각 기록해뒀어요.",
          "When I started my shift, the blue bag with a red tag was already on the shelf. After the rain began, someone handed in another blue bag with a silver star on its zipper. I recorded them separately so we wouldn't mix them up.",
        ],
        prompt: ["미나의 메모와 맞는 설명을 골라보세요.", "Which answer agrees with Mina's memo?"],
      },
      challenge: {
        translation: [
          "한 가방을 다르게 말한 게 아니라, 두 가방이 따로 들어온 거예요. 빨간 꼬리표 가방은 비가 오기 전 제가 근무를 시작할 때부터 선반에 있었어요. 은색 별 가방은 비가 시작된 뒤에 방문객이 맡겼고요. 아직 주인은 어느 쪽도 확인하지 못했어요. 돌려드리기 전에는 가방이 어떻게 생겼는지 먼저 여쭤보고 기록과 비교합니다.",
          "There were two separate arrivals, not one bag described in two ways. The red-tag bag was on the shelf when my shift began, before the rain. Only after the rain started did a visitor hand in the bag with the silver star. I haven't verified either owner yet. Before returning a bag, I always ask, 'Could you describe your bag?' and compare the answer with the record.",
        ],
        prompt: [
          "메모로 알 수 있는 것과 아직 확인해야 할 것은 무엇인가요?",
          "Distinguish what this memo establishes from what still needs checking.",
        ],
      },
    },
    speaker: ["미나 · 안내소 직원", "Mina · Information desk staff"],
  },
  "locker-request": {
    title: ["영수증도 봐주세요", "Ask staff to check"],
    context: [
      "가방 안은 담당 직원이 확인합니다. 미나에게 영수증을 신고서와 비교해달라고 짧게 부탁해보세요.",
      "Only staff can inspect the items inside a bag. Write Mina a message asking her to compare the receipt with the letter.",
    ],
    document: ["미나에게 보낼 부탁", "A note requesting a check"],
    feedback: [
      "영수증을 보면 신고서에 적힌 물건과 시간을 대조할 수 있어요. 기본에서는 레몬빵을, 도전에서는 3시 이후라는 말도 넣어주세요. 무엇을 확인해달라는지 구체적으로 전할수록 도움이 됩니다.",
      "Checking the receipt lets you compare the purchase described in the letter with the record. In Standard, include 'lemon bun'; in Challenge, also include 'after three' so the condition is clear. 'Check' means to examine or verify here. This checks the necessary information in your request, not your grammar or writing proficiency.",
    ],
    consequence: [
      "미나가 두 가방의 영수증 정보를 접수 기록에서 찾아줍니다. 가방을 직접 열지 않고도 비교할 수 있게 됐습니다.",
      "Mina brings the receipt details from the two bag records. You compare the records without opening the bags yourself.",
    ],
    versions: {
      starter: {
        translation: [
          "미나에게 가방 안의 영수증을 봐달라고 부탁해보세요.",
          "Ask Mina to check the receipt in the bag.",
        ],
        prompt: [
          "영수증을 확인해달라는 짧은 부탁을 써보세요.",
          "Write a short English sentence asking for the receipt to be checked.",
        ],
      },
      standard: {
        translation: [
          "신고서에 레몬빵이 나옵니다. 영수증이 레몬빵을 산 내역인지 미나에게 확인해달라고 부탁해보세요.",
          "The letter mentions a lemon bun. Ask Mina to check whether the receipt is for that item.",
        ],
        prompt: [
          "레몬빵 영수증이 맞는지 확인해달라고 써보세요.",
          "Ask for a check that mentions the receipt and the lemon bun.",
        ],
      },
      challenge: {
        translation: [
          "무엇을 언제 샀는지 레나의 신고서와 비교해야 합니다. 미나에게 부탁하면서 품목과 “3시 이후”라는 말을 함께 넣어주세요.",
          "You need to compare both the purchase and its time with Lena's letter. Write Mina a request that includes the item and the condition 'after three'.",
        ],
        prompt: [
          "영수증, 레몬빵, 3시 이후를 함께 넣어 확인을 부탁해보세요.",
          "Ask for a check that includes the receipt, the lemon bun, and the condition after three.",
        ],
      },
    },
  },
  "locker-records": {
    title: ["두 단서가 가리키는 가방", "The bag where two clues agree"],
    context: [
      "미나가 가져온 기록을 읽어보세요. 지퍼 장식과 산 물건이 모두 레나의 설명과 맞는 가방은 어느 쪽인가요?",
      "Mina has brought the records. Find the bag whose zipper decoration and purchase details both agree with the letter.",
    ],
    feedback: [
      "B 가방에는 은색 별과 레몬빵 영수증이 있고, 15시 20분은 3시 이후예요. A 가방은 빨간 꼬리표에 14시 10분 계피빵 영수증이라 두 가지 모두 달라요. 색이나 들어온 순서만 보지 않고, 특징과 기록을 함께 비교한 거예요. 주인 확인은 아직 남아 있어요.",
      "Bag B matches both the silver star and the lemon bun receipt, and 15:20 is after three. Bag A has a red tag and a 14:10 cinnamon bun receipt, so both details differ. You have compared a physical feature with a record rather than deciding from colour or arrival order alone. The final ownership check is still needed.",
    ],
    consequence: [
      "B 가방이 맞을 것 같다고 표시했습니다. 미나가 고른 까닭을 물어봅니다. 어떤 단서가 서로 맞았는지 말해봅시다.",
      "You mark Bag B as the matching bag. Mina prepares to verify the owner and asks you to explain your conclusion.",
    ],
    versions: {
      starter: {
        prompt: [
          "은색 별과 레몬빵 영수증이 있는 가방은 어느 쪽인가요?",
          "Which bag has the silver star and the lemon bun receipt?",
        ],
      },
      standard: {
        translation: [
          "A 가방: 파란 천, 빨간 꼬리표. 항구 빵집 계피빵 영수증, 14시 10분.\nB 가방: 파란 천, 지퍼의 은색 별. 항구 빵집 레몬빵 영수증, 15시 20분.\n레나의 신고서: 은색 별, 3시가 지나서 산 레몬빵.",
          "Bag A — blue canvas; red tag; harbour bakery receipt for a cinnamon bun at 14:10.\nBag B — blue canvas; silver star on zipper; harbour bakery receipt for a lemon bun at 15:20.\nLena's letter — silver star; lemon bun bought after three.",
        ],
        prompt: [
          "가방의 특징과 산 물건을 함께 보면 어느 쪽이 맞을까요?",
          "Which conclusion considers both the feature and the purchase record?",
        ],
      },
      challenge: {
        translation: [
          "두 가방은 같은 곳에서 들어왔고 모두 파란 천 가방이라 이것만으로는 구별할 수 없습니다. A에는 빨간 꼬리표와 14시 10분 계피빵 영수증이 있습니다. B에는 지퍼의 은색 별과 15시 20분 레몬빵 영수증이 있습니다. 레나는 은색 별과 3시가 지나서 산 레몬빵을 말했습니다. 마지막 주인 확인에 쓸 가방 속 물건은 레나에게 아직 알려주지 않았습니다.",
          "The two bags came from the same area and are both blue canvas, so neither fact distinguishes them. A has a red tag and a 14:10 receipt for a cinnamon bun. B has a silver star attached to its zipper and a 15:20 receipt for a lemon bun. Lena specified a silver star and a lemon bun purchased after three. The contents used for the final ownership check have not been disclosed to her.",
        ],
        prompt: [
          "단서를 짚은 뒤 해야 할 일까지 맞는 답을 골라보세요.",
          "Which conclusion gives both sound evidence and an appropriate next step?",
        ],
      },
    },
  },
  "locker-report": {
    title: ["왜 B 가방일까요?", "Explain your evidence"],
    context: [
      "미나에게 B 가방을 고른 까닭을 말해보세요. 가방 이름만 답하지 말고, 살펴본 단서도 함께 전해주세요.",
      "Explain to Mina why you chose Bag B. Go beyond naming an answer by stating your evidence.",
    ],
    document: ["가방을 고른 까닭", "A short report before returning the bag"],
    feedback: [
      "The receipt matches the letter.라고 하면 영수증이 신고서와 맞는다고 설명할 수 있어요. 기본에서는 은색 별도 함께 말하고, 도전에서는 돌려주기 전 주인 확인이 필요하다는 말도 덧붙여보세요.",
      "'The receipt matches the letter.' explains the result of comparing the records. In Standard, mention the silver star too; in Challenge, suggest checking ownership before returning the bag. Say your report aloud and confirm that you practiced. This is not an automatic pronunciation assessment.",
    ],
    versions: {
      starter: {
        translation: [
          "B 가방의 영수증이 맞는 것 같습니다. 레나의 신고서와 맞다고 미나에게 말해보세요.",
          "Bag B has the correct receipt. Tell Mina that it matches Lena's letter.",
        ],
        prompt: [
          "B 가방이라고 답하고, 영수증이 신고서와 맞는다고 말해보세요.",
          "Say aloud that you think it is Bag B and that the receipt matches the letter.",
        ],
      },
      standard: {
        translation: [
          "B 가방에는 은색 별이 달려 있고, 15시 20분 레몬빵 영수증이 있습니다. 이 두 가지가 왜 레나의 가방을 가리키는지 설명해보세요.",
          "Bag B has a silver star and a lemon bun receipt from 15:20. Explain why both details matter.",
        ],
        prompt: [
          "은색 별과 영수증을 들어 B 가방을 고른 까닭을 설명해보세요.",
          "Explain your choice of Bag B using both the decoration and the receipt.",
        ],
      },
      challenge: {
        translation: [
          "가방의 특징과 영수증은 모두 B를 가리킵니다. 그래도 주인 확인이 끝난 것은 아니죠. 미나에게 어느 가방인지, 왜 그렇게 생각했는지, 다음에 뭘 확인하면 좋을지 말해보세요.",
          "The physical feature and the purchase record both point to Bag B. However, matching evidence is not the final ownership check. Give Mina your conclusion, its reasons, and a sensible next step.",
        ],
        prompt: [
          "별과 산 시각을 짚어 설명하고, 돌려주기 전에 주인도 확인하자고 말해보세요. 먼저 스스로 해보면 좋아요.",
          "Use the decoration and purchase time to explain your conclusion, then suggest checking the owner before returning the bag. Try it in your own words first.",
        ],
      },
    },
    speaker: ["당신 → 미나", "You → Mina"],
  },
  "moonpost-assignment": {
    title: ["초대장이 갈 곳", "Your first delivery request"],
    context: [
      "미로가 봉투에 주소를 빠뜨렸네요. 솔이 적어둔 의뢰 카드를 읽고, 누구에게 어디로 보낼지 알아보세요.",
      "The address on Miro's envelope is still blank. Check the recipient and destination on the postmaster's request card.",
    ],
    document: ["솔이 적어둔 의뢰 카드", "Delivery request card"],
    feedback: [
      "받을 사람은 윌로 할머니, 사는 곳은 동쪽 등대예요. 사과 과수원은 다른 배가 가는 곳이고, west는 east와 반대 방향이죠. 이름과 장소를 제대로 읽어야 맞는 배로 보낼 수 있어요.",
      "The recipient is Grandma Willow, and the destination is the East Lighthouse. The Apple Orchard is served by a different boat, while west is the opposite of east. To apply the fairy-tale world's delivery rules, first read the letter's information accurately.",
    ],
    consequence: [
      "윌로 할머니와 동쪽 등대를 확인했습니다. 이제 솔에게 배가 언제 떠나는지 물어보려 합니다.",
      "You identify Grandma Willow and the East Lighthouse. Next, you will ask Sol when the boat leaves.",
    ],
    versions: {
      starter: {
        translation: [
          "이 편지는 동쪽 등대의 윌로 할머니께 갑니다. 미로가 보낸 초대장이에요. 오늘 밤 전해주세요.",
          "Deliver this letter to Grandma Willow at the East Lighthouse. It is an invitation from Miro. Please deliver it tonight.",
        ],
        prompt: ["편지는 어디로 가나요?", "Where should the letter go?"],
      },
      standard: {
        translation: [
          "미로가 축제에 쓸 첫 등불을 만들었습니다. 내일 해 질 무렵 윌로 할머니와 함께 밝히고 싶어 해요. 할머니는 동쪽 등대에 삽니다. 해가 떠서 달빛 배가 쉬기 전에 오늘 밤 초대장을 전해주세요. 봉투에는 이름과 갈 곳부터 적어주세요.",
          "Miro has made his first festival lantern and wants Grandma Willow to light it with him at sunset tomorrow. She lives at the East Lighthouse. Deliver the invitation tonight, before the moon boats stop at sunrise. Write her name and destination on the envelope first.",
        ],
        prompt: [
          "누구에게, 어디로 갈 편지인가요?",
          "Which answer gives both the correct recipient and destination?",
        ],
      },
      challenge: {
        translation: [
          "미로는 동쪽 등대에 사는 윌로 할머니를 내일 해 질 무렵 축제에 초대하려 합니다. 처음 만든 등불을 함께 밝히고 싶어서요. 초대장은 오늘 밤 닿아야 합니다. 달빛 배가 해 뜰 때부터 다음 밤까지 쉬니, 그때 받으면 준비할 시간이 부족하겠죠. 맞는 배에 실을 수 있도록 봉투에는 받을 사람의 이름과 갈 곳을 모두 적어주세요.",
          "Delivery request: Miro would like Grandma Willow, who lives at the East Lighthouse, to join him in lighting his first lantern at tomorrow's sunset festival. His invitation must reach her tonight: the moon boats rest from sunrise until the following night, which would be too late for her to prepare. The envelope needs both the recipient's name and the destination before it can be sorted onto the correct boat.",
        ],
        prompt: [
          "어디로 가야 하는지와 오늘 밤 전해야 하는 까닭이 모두 맞는 답을 골라보세요.",
          "Choose the correct destination and the reason the letter needs to arrive tonight.",
        ],
      },
    },
  },
  "moonpost-boat": {
    title: ["흰 등불과 두 번째 종", "The second bell and the white lantern"],
    context: [
      "배는 언제 떠나는지 묻자 솔이 두 배를 설명합니다. 어느 배가 어디로 가는지, 어떤 신호에 떠나는지 들어보세요.",
      "You ask, 'When does the boat leave?' Sol explains the two boats. Listen for both the destination and the departure signal.",
    ],
    document: ["솔이 알려주는 출항 시간", "Sol's departure instructions"],
    feedback: [
      "흰 등불 배는 동쪽 등대로 가고, 두 번째 종이 울릴 때 떠나요. 가까운 호박빛 배는 사과 과수원행이라 이번 편지와 맞지 않아요. 첫 번째 종은 준비하라는 신호일 뿐이니 두 번째 종을 기다려야 해요.",
      "The white-lantern boat goes to the East Lighthouse and leaves at the second bell. The amber-lantern boat goes to the Apple Orchard, so it is wrong for this delivery even if it is nearer. The first bell is a signal to prepare. Wait for the 'second bell' before leaving.",
    ],
    consequence: [
      "흰 등불 배를 찾았습니다. 아직 첫 번째 종만 울렸으니, 기다리는 동안 봉투의 주소를 마저 씁니다.",
      "You identify the white-lantern boat. Only the first bell has rung, so you use the waiting time to complete the address.",
    ],
    versions: {
      starter: {
        translation: [
          "흰 등불 배를 타세요. 동쪽 등대로 갑니다. 두 번째 종에 떠나요. 첫 번째 종은 준비하라는 뜻이에요.",
          "Take the boat with the white lantern. It goes to the East Lighthouse. It leaves at the second bell. The first bell means get ready.",
        ],
        prompt: ["어떤 배가 언제 떠나나요?", "Which boat leaves, and when?"],
      },
      standard: {
        translation: [
          "흰 등불은 등대행, 호박빛 등불은 과수원행이에요. 첫 번째 종은 준비 신호이고, 두 배 모두 두 번째 종이 울릴 때 떠납니다. 윌로 할머니의 편지라면 흰 등불 옆에서 기다리세요.",
          "The white lantern marks the lighthouse boat; the amber lantern marks the orchard boat. The first bell is only a signal to get ready. Both boats leave when the second bell rings. For Willow's letter, wait beside the white lantern.",
        ],
        prompt: [
          "이번 편지를 전하려면 어떻게 하면 될까요?",
          "Which action matches the destination of this letter?",
        ],
      },
      challenge: {
        translation: [
          "가까이 있는 호박빛 등불 배와 헷갈리지 마세요. 그 배는 과수원행이고, 흰 등불 배가 동쪽 등대로 갑니다. 첫 번째 종이 곧 울리지만 선원들에게 준비하라는 뜻일 뿐이에요. 떠나는 때는 두 번째 종입니다. 해가 뜨면 내일 밤까지 배가 쉬어요.",
          "Don't confuse the nearer amber-lantern boat with yours; that one serves the orchard. The white-lantern boat is bound for the East Lighthouse. Although the first bell is about to ring, it only tells the crews to prepare. Departure is at the second bell. After sunrise there will be no further service until tomorrow night.",
        ],
        prompt: [
          "가까운 배나 첫 번째 종에 서두르지 않고, 어떻게 기다리면 될까요?",
          "Choose a plan that is not distracted by the nearer boat or the preparation signal.",
        ],
      },
    },
    speaker: ["솔 · 우체국장", "Sol · Postmaster"],
  },
  "moonpost-address": {
    title: ["봉투에 이름과 주소를", "Address the blank envelope"],
    context: [
      "미로는 초대장을 썼지만 봉투의 주소는 비워두었습니다. 받을 사람과 사는 곳을 적어주세요.",
      "Miro wrote his invitation but forgot the address. Follow the post office rules by adding the recipient and the destination.",
    ],
    feedback: [
      "봉투에는 윌로 할머니의 이름과 동쪽 등대를 모두 적어야 해요. 이름만 있으면 어디로 갈지 모르고, 장소만 있으면 누구에게 줄지 모르니까요. 도전에서는 해 뜨기 전에 전해달라는 말도 덧붙여보세요.",
      "The envelope needs both Willow's name and the East Lighthouse destination. A name alone does not identify the place, and a place alone does not identify the person. In Challenge, also add the condition 'before sunrise'. This exercise checks that the necessary information is present; it does not assign a grammar score.",
    ],
    versions: {
      starter: {
        translation: [
          "받는 사람: 윌로 할머니. 갈 곳: 동쪽 등대. 봉투에 둘 다 적어주세요.",
          "Recipient: Grandma Willow. Place: East Lighthouse. Put both on the envelope.",
        ],
        prompt: [
          "윌로 할머니와 동쪽 등대를 넣어 주소 한 줄을 써보세요.",
          "Write one address line that includes Willow and the East Lighthouse.",
        ],
      },
      standard: {
        translation: [
          "받을 사람과 갈 곳을 또렷하게 적어주세요. 동쪽 등대에 사는 윌로 할머니께 가는 편지입니다.",
          "Write the recipient and destination clearly. The letter is for Grandma Willow, who lives at the East Lighthouse.",
        ],
        prompt: [
          "누구에게 어디로 전하면 좋을지 영어 문장으로 써보세요.",
          "Write a complete sentence asking for the letter to be delivered to the right person and place.",
        ],
      },
      challenge: {
        translation: [
          "선원에게 건넬 배달 메모를 써보세요. 누가 받을지, 어디에 사는지, 해 뜨기 전에 닿아야 한다는 말까지 넣어주세요.",
          "Prepare a delivery note that tells the crew who should receive the letter, where she lives, and that it needs to arrive before sunrise.",
        ],
        prompt: [
          "윌로 할머니께 동쪽 등대로, 해 뜨기 전에 전해달라는 부탁을 써보세요.",
          "Write a delivery request that includes Willow, the East Lighthouse, and arrival before sunrise.",
        ],
      },
    },
  },
  "moonpost-route": {
    title: ["배에서 내린 다음에는", "From the landing to the lighthouse"],
    context: [
      "배가 동쪽 선착장에 가까워집니다. 펀 선장의 말을 듣고, 내린 뒤 어느 길로 가야 할지 기억해보세요.",
      "The boat approaches the eastern landing. Listen to the captain and remember which route to take after getting off.",
    ],
    document: ["배에서 내리기 전의 안내", "The captain's arrival instructions"],
    feedback: [
      "시계탑 옆에서 내려 조개 표지가 있는 돌길을 따라가면 돼요. 나무다리는 과수원 쪽으로 가는 길이에요. beside the clock tower는 내릴 곳, stone path with shell signs는 그다음 걸어갈 길을 알려줘요. 배의 등불과 육지의 표지는 서로 다른 구간을 안내하죠.",
      "Get off beside the clock tower, then follow the shell-marked stone path. The wooden bridge leads towards the orchard, a different destination. 'Beside the clock tower' tells you where to get off; 'stone path with shell signs' tells you the next route. The boat's lantern and the signs on land guide different stages of the journey.",
    ],
    consequence: [
      "배가 시계탑 옆에 멈춥니다. 조개 표지가 가리키는 돌길을 찾아 등대 쪽으로 향합니다.",
      "The boat stops beside the clock tower. You follow the shell signs along the stone path and reach the East Lighthouse.",
    ],
    versions: {
      starter: {
        translation: [
          "시계탑 옆에서 내리세요. 조개 표지가 있는 돌길을 따라가면 등대예요. 나무다리는 과수원으로 갑니다.",
          "Get off beside the clock tower. Follow the stone path with shell signs. It goes to the lighthouse. The wooden bridge goes to the orchard.",
        ],
        prompt: ["등대로 가는 길은 어느 쪽인가요?", "Which route leads to the lighthouse?"],
      },
      standard: {
        translation: [
          "시계탑 옆 선착장에 멈출 거예요. 거기서 조개 표지를 따라 돌길로 가면 동쪽 등대가 나옵니다. 나무다리는 건너지 마세요. 윌로 할머니 댁이 아니라 과수원 쪽으로 이어져요.",
          "We'll stop at the landing beside the clock tower. From there, follow the shell signs along the stone path to the East Lighthouse. Don't cross the wooden bridge: it leads back towards the orchard, not to Willow's home.",
        ],
        prompt: [
          "어디에서 내려 어느 길로 가면 될까요?",
          "Which answer gives both the correct landing and the next route?",
        ],
      },
      challenge: {
        translation: [
          "흰 등불 배가 시계탑 옆 선착장까지 데려다줬네요. 아직 걸어갈 길이 남아 있어요. 육지에서 조개 표지를 따라 돌길로 가면 동쪽 등대입니다. 나무다리가 지름길처럼 보여도, 그쪽은 반대 방향인 과수원으로 가요. 윌로 할머니 댁에 닿을 때까지 돌길의 표지를 따라가세요.",
          "The white lantern has brought you to the correct landing, beside the clock tower. Your journey isn't quite finished. On shore, shell signs mark the stone path towards the East Lighthouse. The wooden bridge may look like a shortcut, but it leads in the opposite direction, towards the orchard. Stay on the marked stone path until you reach Willow's front door.",
        ],
        prompt: [
          "지름길처럼 보이는 나무다리로 가면 안 되는 까닭은 무엇인가요?",
          "Why should you avoid the route that looks like a shortcut?",
        ],
      },
    },
    speaker: ["펀 선장 · 달빛 배", "Captain Fern · Moon boat captain"],
  },
  "moonpost-deliver": {
    document: ["동쪽 등대 문 앞에서", "At the East Lighthouse door"],
    title: ["윌로 할머니께", "Hand the letter to its recipient"],
    context: [
      "등대 문이 열리고 할머니가 나옵니다. 윌로 할머니가 맞는지 물어보고, 편지가 있다고 말해주세요. 안의 글은 할머니가 직접 읽습니다.",
      "The lighthouse door opens and a grandmother steps outside. Check her name and say that you have a letter. The recipient will read the contents herself.",
    ],
    feedback: [
      "I have a letter for you.로 편지를 가져왔다고 알릴 수 있어요. 먼저 Are you Grandma Willow?라고 이름을 물어보면 잘못 건네는 일을 막을 수 있죠. 도전에서는 미로가 보낸 초대장이라는 말도 덧붙여보세요.",
      "'I have a letter for you.' explains why you are there. Asking 'Are you Grandma Willow?' first helps avoid giving it to the wrong person. In Challenge, explain who sent the letter and that it is an invitation. Say it yourself, then confirm your practice; no pronunciation score is produced.",
    ],
    consequence: [
      "할머니가 윌로라고 답합니다. 편지를 읽고 웃으며 내일 미로와 첫 등불을 함께 밝히겠다고 합니다.",
      "Willow confirms her name. She reads the letter with a smile and says she will help Miro light his first lantern tomorrow.",
    ],
    versions: {
      starter: {
        translation: [
          "윌로 할머니가 문을 엽니다. 당신은 미로의 편지를 들고 있습니다.",
          "Grandma Willow opens the door. You are holding Miro's letter.",
        ],
        prompt: [
          "윌로 할머니가 맞는지 묻고, 편지가 있다고 말해보세요.",
          "Check the grandmother's name and say aloud that you have a letter for her.",
        ],
      },
      standard: {
        translation: [
          "누군가 등대 문을 엽니다. 윌로 할머니가 맞는지 물어보고, 미로가 보낸 편지가 있다고 말해보세요.",
          "Someone opens the lighthouse door. Check that she is Grandma Willow, then tell her you have a letter from Miro.",
        ],
        prompt: [
          "받을 사람을 확인하고 누가 보낸 편지인지 알려주세요.",
          "Check the recipient and explain who sent the letter.",
        ],
      },
      challenge: {
        translation: [
          "해 뜨기 전에 동쪽 등대에 닿았습니다. 새 배달원이라고 소개하고 윌로 할머니가 맞는지 물어보세요. 누가 보냈는지, 오늘 밤 전해달라고 한 까닭도 알려주세요.",
          "You have reached the East Lighthouse before sunrise. Introduce yourself as the new delivery worker, confirm the recipient, and explain who sent the letter and why it needed to arrive tonight.",
        ],
        prompt: [
          "나를 소개하고 이름을 확인한 뒤, 미로가 내일 축제에 초대하려고 오늘 밤 편지를 보냈다고 말해보세요. 먼저 스스로 해보면 좋아요.",
          "Introduce yourself, check the recipient, name the sender, and explain the invitation to tomorrow's festival. Try without the example first.",
        ],
      },
    },
    speaker: ["당신 → 윌로 할머니", "You → Grandma Willow"],
  },
};
const retainedExpressionCopy: Record<string, { ko: CopyPair; recall: CopyPair }> = {
  "bookshop-ask-help": {
    ko: ["문 여는 걸 도와주실 수 있을까요?", "Could you help me open the door?"],
    recall: [
      "자동문이 멈췄습니다. 직원에게 문 여는 일을 도와달라고 해보세요.",
      "The automatic door has stopped. Ask a member of staff to help you open it.",
    ],
  },
  "bookshop-next-step": {
    ko: ["다음에는 뭘 하면 될까요?", "What should I do next?"],
    recall: [
      "첫 안내를 따라 했습니다. 다음에는 뭘 하면 되는지 물어보세요.",
      "You have followed the first instruction. Ask what to do next.",
    ],
  },
  "bookshop-safe-route": {
    ko: ["지붕 있는 통로로 갈게요.", "I'll take the covered walkway."],
    recall: [
      "직원이 비를 피할 길을 알려줬습니다. 그 길로 가겠다고 말해보세요.",
      "A member of staff has shown you a sheltered route. Say that you will take it.",
    ],
  },
  "locker-describe-bag": {
    ko: ["가방이 어떻게 생겼는지 설명해주실 수 있을까요?", "Could you describe your bag?"],
    recall: [
      "분실물을 찾으러 온 손님에게 가방의 특징을 물어보세요.",
      "At the lost-property desk, ask a visitor to describe their bag.",
    ],
  },
  "locker-check-receipt": {
    ko: ["영수증을 확인해주실 수 있을까요?", "Could you check the receipt?"],
    recall: [
      "직원에게 가방 안의 영수증을 확인해달라고 부탁해보세요.",
      "Ask a member of staff to check the receipt in the bag.",
    ],
  },
  "locker-evidence-match": {
    ko: ["영수증에 적힌 내용이 편지와 맞아요.", "The receipt matches the letter."],
    recall: [
      "영수증과 편지의 내용이 맞습니다. 직원에게 그렇게 말해보세요.",
      "You compared the receipt with the letter and they agree. Explain this evidence in one sentence.",
    ],
  },
  "moonpost-destination": {
    ko: ["이 편지는 어디로 전하면 될까요?", "Where should I deliver this letter?"],
    recall: [
      "전할 편지를 받았습니다. 어디로 가져가면 되는지 물어보세요.",
      "You have been given a letter to deliver. Ask where it should go.",
    ],
  },
  "moonpost-departure": {
    ko: ["배는 언제 떠나나요?", "When does the boat leave?"],
    recall: [
      "맞는 배를 찾았습니다. 언제 떠나는지 물어보세요.",
      "You have found the correct boat. Ask when it leaves.",
    ],
  },
  "moonpost-delivery": {
    ko: ["전해드릴 편지가 있어요.", "I have a letter for you."],
    recall: [
      "받을 사람을 만났습니다. 전해줄 편지가 있다고 말해보세요.",
      "You have reached the recipient. Say that you have a letter for them.",
    ],
  },
};
const retainedTakeaways: Record<string, CopyPair> = {
  "locker-seven": [
    "물건의 특징을 묻고, 기록을 살피고, 왜 그렇게 생각했는지 짧게 말해봐요.",
    "Practice asking about an object, checking records, and briefly explaining the evidence for your conclusion.",
  ],
  "moonlight-post": [
    "배의 목적지와 출발 시간을 듣고, 주소를 쓰고, 받을 사람에게 편지를 건네는 말을 익혀요.",
    "Practice listening for a destination and departure time, writing a clear address, and checking the recipient before handing over a letter.",
  ],
};
const storyNames: Record<string, string> = {
  Hana: "하나",
  Jo: "조",
  Mina: "미나",
  Lena: "레나",
  Kai: "카이",
  Miro: "미로",
  Sol: "솔",
  "Grandma Willow": "윌로 할머니",
  "Captain Fern": "펀 선장",
  You: "당신",
};
function storyName(name: string): string {
  return storyNames[name] ? text(storyNames[name], name) : name;
}
function polishTask(task: EnglishTask): EnglishTask {
  const copy = retainedTaskCopy[task.id];
  if (!copy) return task;
  const next = { ...task, versions: { ...task.versions } };
  for (const field of [
    "title",
    "context",
    "document",
    "feedback",
    "consequence",
    "speaker",
  ] as const) {
    const pair = copy[field];
    if (pair) next[field] = text(...pair);
  }
  for (const level of ["starter", "standard", "challenge"] as const) {
    const copyVersion = copy.versions?.[level];
    if (!copyVersion) continue;
    next.versions[level] = { ...task.versions[level] };
    for (const field of ["translation", "prompt"] as const) {
      const pair = copyVersion[field];
      if (pair) next.versions[level][field] = text(...pair);
    }
  }
  return next;
}
function polishExpression(expression: EnglishExpression): EnglishExpression {
  const copy = retainedExpressionCopy[expression.id];
  return copy ? { ...expression, ko: text(...copy.ko), recall: text(...copy.recall) } : expression;
}
function inheritedTakeaway(episode: EnglishEpisode): string {
  const pair = retainedTakeaways[episode.id];
  return pair ? text(...pair) : episode.takeaway;
}

export const revisedEnglishEpisodes: EnglishEpisode[] = [
  reviseBookshop(),
  reviseLocker(),
  reviseMoonpost(),
];

for (const episode of revisedEnglishEpisodes) {
  text(`${episode.title} · 영어 학습`, `${episode.englishTitle} · English Learning`);
}
