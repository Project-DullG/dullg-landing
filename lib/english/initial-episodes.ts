import type { EnglishEpisode, TaskVersion } from "./types";

// Original guided practice. Answers are public, not secure examination data.
function choice(
  passage: string,
  translation: string,
  prompt: string,
  answers: [string, string, string],
  correctIndex: 0 | 1 | 2,
): TaskVersion {
  const ids = ["a", "b", "c"];
  return {
    passage,
    translation,
    prompt,
    options: answers.map((text, index) => ({ id: ids[index], text })),
    correctOption: ids[correctIndex],
    model: answers[correctIndex],
  };
}

export const initialEnglishEpisodes: EnglishEpisode[] = [
  {
    id: "closed-bookshop",
    title: "닫힌 서점의 밤",
    englishTitle: "The Bookshop After Closing",
    genre: "escape",
    genreLabel: "방탈출 · 회화",
    synopsis: "폭풍이 지난 서점. 도움을 요청하고, 안내를 따라 안전한 귀갓길을 찾으세요.",
    intro:
      "해안 도시 여울의 작은 서점, 첫 번째 페이지. 낭독회가 끝난 뒤 갑작스러운 비를 피해 잠시 더 머물렀습니다. 폭풍으로 정전이 난 뒤 실내 조명은 돌아왔지만 정문 자동문은 멈춘 채입니다. 직원 하나는 밖에서 쓰러진 간판을 치우고 있습니다. 초록색 비상문은 언제든 밀어 열 수 있습니다. 안내 카드와 인터폰으로 정문의 수동 해제 방법과 비를 피할 귀갓길을 확인해 봅시다.",
    ending:
      "하나가 바깥 통로를 확인한 뒤, 당신은 투명 덮개를 들고 빨간 손잡이를 아래로 당겨 정문을 열었습니다. 지붕 있는 통로를 따라 나가니 비가 잦아든 항구가 보입니다. 하나는 돌아와 자동문 앞에 안내판을 놓습니다. 서점의 밤은 다시 조용해집니다. 서로 위치와 다음 행동을 정확히 전달한 덕분에 안전하게 나왔습니다.",
    takeaway: "도움을 요청하고, 순서가 있는 안내를 이해하고, 이동할 경로를 말할 수 있어요.",
    minutes: 14,
    image: "/assets/english/bookshop.webp",
    imageAlt: "따뜻한 불빛과 나무 책장이 있는 서점에서 직원과 방문객이 마주한 모습",
    accent: "#c9a06b",
    expressions: [
      {
        id: "bookshop-ask-help",
        en: "Could you help me open the door?",
        ko: "문 여는 것을 도와주실 수 있나요?",
        recall: "자동문이 멈췄어요. 직원에게 문을 여는 데 도움을 요청하세요.",
        accepted: [
          "Could you help me open the door?",
          "Can you help me open the door?",
          "Please help me open the door.",
          "Could you help me with the door?",
        ],
      },
      {
        id: "bookshop-next-step",
        en: "What should I do next?",
        ko: "다음에는 무엇을 해야 하나요?",
        recall: "첫 번째 안내를 따랐어요. 다음 행동을 물어보세요.",
        accepted: [
          "What should I do next?",
          "What do I do next?",
          "What should I do now?",
          "What's the next step?",
        ],
      },
      {
        id: "bookshop-safe-route",
        en: "I'll take the covered walkway.",
        ko: "지붕 있는 통로로 갈게요.",
        recall: "직원이 비를 피할 길을 알려주었어요. 그 길로 가겠다고 말하세요.",
        accepted: [
          "I'll take the covered walkway.",
          "I will take the covered walkway.",
          "I'll use the covered walkway.",
          "I will use the covered walkway.",
        ],
      },
    ],
    tasks: [
      {
        id: "bookshop-notice",
        skill: "reading",
        title: "정문에 남겨진 안내",
        context: "자동문 옆 안내 카드입니다. 정문으로 나가려면 먼저 무엇을 확인해야 할까요?",
        document: "직원 안내 카드",
        feedback:
          "정문으로 나가려면 먼저 인터폰으로 직원에게 연락해야 합니다. 밖에 쓰러진 간판을 치웠는지 확인해야 하기 때문입니다. 창문 손잡이는 출입문 장치가 아니며, 전원이 돌아올 때까지 기다릴 필요도 없습니다. 급히 나가야 한다면 초록색 비상문은 언제든 사용할 수 있습니다.",
        consequence: "당신은 정문 옆 인터폰을 찾습니다. 화면에 야간 직원 하나의 이름이 나타납니다.",
        expressionIds: ["bookshop-ask-help"],
        versions: {
          starter: choice(
            "The front door has no power. Call the staff on the intercom first. The green emergency door is always open from inside.",
            "정문에는 전원이 들어오지 않습니다. 먼저 인터폰으로 직원에게 연락하세요. 초록색 비상문은 안에서 언제든 열 수 있습니다.",
            "정문으로 나가기 전에 먼저 할 일은?",
            ["Call the staff.", "Open the window.", "Wait for the power."],
            0,
          ),
          standard: choice(
            "The front door's motor is off after the power cut. Before using the manual release, contact staff on the intercom. We need to check that the fallen sign outside has been cleared. You can always push the green emergency door open from inside.",
            "정전으로 정문 모터가 멈췄습니다. 수동 해제 장치를 쓰기 전에 인터폰으로 직원에게 연락하세요. 밖에 쓰러진 간판이 치워졌는지 확인해야 합니다. 초록색 비상문은 안에서 언제든 밀어 열 수 있습니다.",
            "정문을 수동으로 열기 전에 필요한 행동을 고르세요.",
            [
              "Wait until the front door's motor starts again.",
              "Ask staff to check the path outside.",
              "Use the silver window handle to unlock the door.",
            ],
            1,
          ),
          challenge: choice(
            "A power cut has stopped the front door's motor, but its manual release still works. Please contact the night staff before operating it: a sign fell across the entrance during the storm, and we must confirm that the path is clear. If you need to leave immediately, the green emergency door can always be pushed open from inside. The silver latch controls the window only.",
            "정전으로 정문 모터가 멈췄지만 수동 해제 장치는 작동합니다. 폭풍으로 간판이 입구를 가로질러 쓰러져 통로가 비었는지 확인해야 하므로, 장치를 쓰기 전에 야간 직원에게 연락하세요. 즉시 나가야 한다면 초록색 비상문은 안에서 언제든 밀어 열 수 있습니다. 은색 걸쇠는 창문용입니다.",
            "직원에게 먼저 연락하는 이유까지 맞는 행동을 고르세요.",
            [
              "Ask for a window key because the emergency door is locked.",
              "Ask staff to restore power because the manual release is broken.",
              "Ask whether the entrance is clear before using the manual release.",
            ],
            2,
          ),
        },
      },
      {
        id: "bookshop-message",
        skill: "writing",
        title: "도움이 필요한 위치",
        context:
          "인터폰에는 짧은 문자 메시지도 남길 수 있습니다. 하나에게 정문을 여는 데 도움이 필요하다고 전하세요.",
        document: "인터폰 메시지",
        feedback:
          "핵심은 문을 여는 데 도움을 요청하는 것입니다. 기본부터는 정문에 있다는 위치도 함께 전합니다. Could you help me…? 뒤에 필요한 행동을 붙이면 공손한 요청이 됩니다. 이 연습은 메시지의 핵심 내용을 확인하며 문법 전체를 채점하지 않습니다.",
        consequence:
          "게임 속 인터폰으로 요청이 전달됩니다. 밖에 있던 하나가 당신의 위치를 확인하고 응답합니다.",
        expressionIds: ["bookshop-ask-help"],
        versions: {
          starter: {
            passage: "You need help with the door. Send Hana a short request.",
            translation: "문을 여는 데 도움이 필요합니다. 하나에게 짧게 요청하세요.",
            prompt: "문을 여는 것을 도와 달라는 영어 문장을 쓰세요.",
            model: "Could you help me open the door?",
            accepted: [
              "Could you help me open the door?",
              "Can you help me open the door?",
              "Please help me open the door.",
            ],
            keywords: [["help", "assist"], ["door"]],
            starter: "Could you help me…?",
          },
          standard: {
            passage:
              "Hana is clearing the entrance outside. Tell her you are at the front door and ask for help opening it.",
            translation:
              "하나는 밖에서 입구를 정리하고 있습니다. 정문에 있다고 알리고 문을 여는 데 도움을 요청하세요.",
            prompt: "위치와 도움 요청이 담긴 짧은 메시지를 쓰세요.",
            model: "I'm at the front door. Could you help me open it?",
            accepted: [
              "I'm at the front door. Could you help me open it?",
              "I am at the front door. Can you help me open it?",
              "I'm at the front door. Please help me open it.",
            ],
            keywords: [["front"], ["door", "entrance"], ["help", "assist"]],
          },
          challenge: {
            passage:
              "The front door will not open automatically. Hana cannot see you from outside. Explain where you are, why you need help, and what you want her to help you do.",
            translation:
              "정문이 자동으로 열리지 않습니다. 밖의 하나는 당신을 볼 수 없습니다. 위치, 도움이 필요한 이유, 부탁할 행동을 전달하세요.",
            prompt: "정문·정전·도움 요청을 담아 메시지를 작성하세요.",
            model: "I'm at the front door. The power is out. Could you help me open it manually?",
            accepted: [
              "I'm at the front door. The power is out. Could you help me open it manually?",
              "I am at the front door. There is a power cut. Could you help me open it?",
            ],
            keywords: [
              ["front"],
              ["door", "entrance"],
              ["power", "electricity"],
              ["help", "assist"],
            ],
          },
        },
      },
      {
        id: "bookshop-intercom",
        skill: "listening",
        title: "인터폰 너머의 목소리",
        speaker: "Hana · 야간 직원",
        context:
          "하나가 바깥 상황과 문 옆 장치의 위치를 설명합니다. 음성을 먼저 듣고, 수동 해제 장치를 찾으세요.",
        document: "하나의 음성 안내",
        feedback:
          "수동 해제 장치는 정문 옆 투명 덮개 아래의 빨간 손잡이입니다. 은색 손잡이는 창문용이고 초록색 막대는 다른 비상문에 있습니다. red lever, clear cover, beside the front door가 같은 장치를 가리키는 단서입니다.",
        consequence:
          "쓰러진 간판은 치워졌습니다. 당신은 정문 옆의 투명 덮개와 빨간 손잡이를 찾습니다.",
        expressionIds: ["bookshop-next-step"],
        versions: {
          starter: choice(
            "The path is clear now. Find the red lever beside the front door. It is under a clear cover. The silver handle is for the window.",
            "이제 통로가 비었습니다. 정문 옆 빨간 손잡이를 찾으세요. 투명 덮개 아래 있습니다. 은색 손잡이는 창문용입니다.",
            "수동 해제 장치는 어느 것인가요?",
            [
              "The silver window handle.",
              "The red lever under the clear cover.",
              "The green bar on the emergency door.",
            ],
            1,
          ),
          standard: choice(
            "I've moved the fallen sign, so the path outside is clear. Look beside the front door for a red lever under a clear cover. That's the manual release. Leave the silver window handle alone. Tell me when you've found the lever.",
            "쓰러진 간판을 치워서 바깥 통로가 비었습니다. 정문 옆에서 투명 덮개 아래의 빨간 손잡이를 찾으세요. 그것이 수동 해제 장치입니다. 은색 창문 손잡이는 건드리지 마세요. 찾으면 알려주세요.",
            "하나가 찾으라고 한 장치를 고르세요.",
            [
              "The red lever beside the front door, under a clear cover.",
              "The silver handle beside the window, without a cover.",
              "The green bar on the emergency door, behind the bookshelves.",
            ],
            0,
          ),
          challenge: choice(
            "The sign has been removed and I've checked the entrance. You can use the front door now. Its manual release is the red lever beneath the transparent cover beside the door, not the silver latch on the nearby window. Find the lever first; then ask me what to do next. Don't pull it until you've heard the instructions.",
            "간판을 치우고 입구를 확인했습니다. 이제 정문을 사용할 수 있습니다. 수동 해제 장치는 문 옆 투명 덮개 아래의 빨간 손잡이이며 가까운 창문의 은색 걸쇠가 아닙니다. 먼저 손잡이를 찾고 다음 행동을 물어보세요. 안내를 듣기 전에는 당기지 마세요.",
            "위치와 지금 해야 할 행동이 모두 맞는 답은?",
            [
              "Pull the silver latch immediately; it is the door release.",
              "Pull the red lever before asking for instructions.",
              "Find the covered red lever beside the door and wait for instructions.",
            ],
            2,
          ),
        },
      },
      {
        id: "bookshop-release",
        skill: "reading",
        title: "다음 행동의 순서",
        context:
          "당신이 What should I do next?라고 묻자 하나가 짧은 안내를 보내옵니다. 수동 해제는 실제 장치의 순서를 따릅니다.",
        document: "수동 해제 순서",
        feedback:
          "안내 순서는 덮개를 들고 → 빨간 손잡이를 아래로 당기고 → 문을 미는 것입니다. first, then, finally가 순서를 알려 줍니다. 은색 창문 걸쇠는 이 과정과 관계가 없습니다. 문이 열리지 않으면 힘으로 밀지 말고 직원에게 다시 연락하세요.",
        consequence:
          "안내 순서대로 장치를 조작하자 정문이 수동으로 열립니다. 하나가 지붕 있는 통로를 가리킵니다.",
        expressionIds: ["bookshop-next-step"],
        versions: {
          starter: choice(
            "First, lift the clear cover. Then, pull the red lever down. Finally, push the door. If it does not open, stop and call me.",
            "먼저 투명 덮개를 드세요. 그다음 빨간 손잡이를 아래로 당기세요. 마지막으로 문을 미세요. 열리지 않으면 멈추고 연락하세요.",
            "덮개를 든 다음에는 무엇을 하나요?",
            [
              "Turn the silver handle.",
              "Push harder without using the lever.",
              "Pull the red lever down.",
            ],
            2,
          ),
          standard: choice(
            "Lift the clear cover first. Next, pull the red lever down to release the door's motor. You can then push the door open by hand. Stop and contact me if the door does not move easily.",
            "먼저 투명 덮개를 드세요. 다음으로 빨간 손잡이를 아래로 당겨 문 모터를 해제하세요. 그 뒤 손으로 문을 밀어 열 수 있습니다. 쉽게 움직이지 않으면 멈추고 연락하세요.",
            "올바른 순서를 고르세요.",
            [
              "Lift the cover → pull the red lever down → push the door.",
              "Push the door → turn the silver latch → lift the cover.",
              "Pull the red lever → push harder → call only after it breaks.",
            ],
            0,
          ),
          challenge: choice(
            "To disengage the stopped motor, lift the transparent cover and pull the red lever down. Once the motor is disengaged, the door can be pushed open manually. The window latch plays no part in this procedure. If the door resists, stop rather than forcing it and contact staff again.",
            "멈춘 모터를 해제하려면 투명 덮개를 들고 빨간 손잡이를 아래로 당기세요. 모터가 해제되면 문을 손으로 밀어 열 수 있습니다. 창문 걸쇠는 이 절차와 관련 없습니다. 문이 잘 움직이지 않으면 억지로 밀지 말고 멈춘 뒤 직원에게 다시 연락하세요.",
            "장치의 역할과 주의사항을 모두 이해한 답은?",
            [
              "The lever restores electrical power, so wait for the motor to start.",
              "The lever disengages the motor; push gently and stop if the door resists.",
              "The window latch disengages the motor; force the door if necessary.",
            ],
            1,
          ),
        },
      },
      {
        id: "bookshop-goodbye",
        skill: "speaking",
        title: "마지막 인사와 귀갓길",
        speaker: "당신 → Hana",
        context:
          "하나는 작은 골목 바닥이 젖어 있으니 정문 오른쪽의 지붕 있는 통로를 이용하라고 합니다. 갈 길을 말하고 인사하세요.",
        document: "서점 앞 대화",
        feedback:
          "I'll take…는 선택한 경로를 전하는 표현입니다. 길을 다시 말하면 서로 같은 경로를 이해했는지 확인할 수 있습니다. 소리 내어 말해 본 뒤 스스로 완료를 확인하세요. 녹음·발음·유창성을 자동 채점하지 않습니다.",
        consequence: "하나가 통로 쪽을 비춰 줍니다. 당신은 감사를 전하고 안전하게 서점을 나섭니다.",
        expressionIds: ["bookshop-safe-route"],
        versions: {
          starter: {
            passage: "Take the covered walkway on the right. The alley is wet.",
            translation: "오른쪽 지붕 있는 통로로 가세요. 골목은 젖어 있습니다.",
            prompt: "지붕 있는 통로로 가겠다고 소리 내어 말하세요.",
            model: "I'll take the covered walkway. Thank you!",
            starter: "I'll take…",
          },
          standard: {
            passage:
              "The covered walkway is on your right. It will keep you out of the rain. Avoid the wet alley on the left.",
            translation:
              "지붕 있는 통로는 오른쪽에 있습니다. 비를 피할 수 있습니다. 왼쪽 젖은 골목은 피하세요.",
            prompt: "선택한 경로와 방향을 말하고, 하나에게 감사 인사를 전하세요.",
            model: "I'll take the covered walkway on the right. Thanks for your help.",
          },
          challenge: {
            passage:
              "The rain has eased, but the narrow alley on your left is still wet. The covered walkway on the right leads to the square and is the better route tonight.",
            translation:
              "비가 약해졌지만 왼쪽 좁은 골목은 아직 젖어 있습니다. 오른쪽 지붕 있는 통로는 광장으로 이어지며 오늘 밤 더 좋은 경로입니다.",
            prompt:
              "어느 길로 갈지, 왜 그 길을 택했는지 설명하고 인사하세요. 예문을 보기 전에 먼저 말해 보세요.",
            model:
              "I'll take the covered walkway on the right because the alley is still wet. Thanks for helping me get out safely.",
          },
        },
      },
    ],
  },
  {
    id: "locker-seven",
    title: "7번 보관함의 편지",
    englishTitle: "The Letter in Locker Seven",
    genre: "mystery",
    genreLabel: "추리 · 퍼즐",
    synopsis:
      "닮은 가방 두 개와 서로 다른 영수증. 편지와 목격담을 대조해 분실물의 주인을 찾아주세요.",
    intro:
      "여울항의 분실물 안내소에서 하루 자원봉사를 하게 되었습니다. 직원 미나가 신고서를 넣어 둔 업무용 7번 보관함을 열어 달라고 합니다. 안에는 레나의 편지가 있습니다. 보관대에는 비슷한 파란 천 가방 두 개가 놓여 있습니다. 당신의 역할은 편지·목격담·접수 기록을 대조해 어느 가방인지 찾는 것입니다. 가방을 돌려주는 마지막 확인은 담당 직원이 합니다.",
    ending:
      "당신은 은색 별 지퍼와 15시 20분 레몬빵 영수증이 모두 맞는 B 가방을 골랐습니다. 미나는 레나에게 아직 공개하지 않은 가방 속 물건을 먼저 묻습니다. 레나가 초록색 공책이라고 답했고, 접수 기록과도 일치했습니다. 직원은 확인 후 가방을 돌려줍니다. 빨간 꼬리표의 A 가방은 다른 주인을 기다리도록 그대로 남겨 둡니다. 닮은 색만으로 판단하지 않고 서로 독립적인 단서를 함께 확인했습니다.",
    takeaway: "물건의 특징을 묻고, 기록을 확인하고, 판단의 근거를 짧게 설명할 수 있어요.",
    minutes: 16,
    image: "/assets/english/locker.webp",
    imageAlt: "여울항 분실물 안내소의 직원, 청록색 보관함과 책상 위 빨간 봉투",
    accent: "#83b5b5",
    expressions: [
      {
        id: "locker-describe-bag",
        en: "Could you describe your bag?",
        ko: "가방이 어떻게 생겼는지 설명해 주실 수 있나요?",
        recall: "분실물 안내소에서 손님에게 가방의 특징을 물어보세요.",
        accepted: [
          "Could you describe your bag?",
          "Can you describe your bag?",
          "Please describe your bag.",
          "What does your bag look like?",
        ],
      },
      {
        id: "locker-check-receipt",
        en: "Could you check the receipt?",
        ko: "영수증을 확인해 주실 수 있나요?",
        recall: "가방 안의 영수증을 직원에게 확인해 달라고 요청하세요.",
        accepted: [
          "Could you check the receipt?",
          "Can you check the receipt?",
          "Please check the receipt.",
          "Would you check the receipt?",
        ],
      },
      {
        id: "locker-evidence-match",
        en: "The receipt matches the letter.",
        ko: "영수증이 편지 내용과 일치해요.",
        recall: "영수증을 편지와 대조했더니 맞습니다. 그 근거를 한 문장으로 말하세요.",
        accepted: [
          "The receipt matches the letter.",
          "This receipt matches the letter.",
          "The receipt is consistent with the letter.",
          "The letter and the receipt match.",
        ],
      },
    ],
    tasks: [
      {
        id: "locker-letter",
        skill: "reading",
        title: "색보다 정확한 단서",
        context:
          "7번 업무용 보관함에서 꺼낸 신고 편지를 읽습니다. 레나의 가방을 구별할 특징을 찾으세요.",
        document: "레나의 분실 신고 편지",
        feedback:
          "두 가방 모두 파란색이라 색은 구별되는 단서가 아닙니다. 편지는 지퍼에 달린 은색 별과 3시 이후 산 레몬빵 영수증을 말합니다. 빨간 꼬리표와 계피빵은 편지에 없는 특징입니다. 처음에는 지퍼 장식에 주목하고, 다음 단계에서 다른 단서로 확인합니다.",
        consequence:
          "편지에서 은색 별과 레몬빵을 표시합니다. 미나가 접수 때 남겨 둔 음성 메모를 재생합니다.",
        expressionIds: ["locker-describe-bag"],
        versions: {
          starter: choice(
            "I left my blue bag when the rain started. There is a silver star on the zipper. I bought a lemon bun after three. The receipt is in the bag. — Lena",
            "비가 시작됐을 때 파란 가방을 두고 왔습니다. 지퍼에 은색 별이 있습니다. 3시 이후에 레몬빵을 샀습니다. 영수증은 가방 안에 있습니다. — 레나",
            "레나의 가방 지퍼에는 무엇이 달려 있나요?",
            ["A red tag.", "A silver star.", "A brass key."],
            1,
          ),
          standard: choice(
            "I left my blue canvas bag near the information desk when the rain started. A small silver star hangs from its zipper. I bought a lemon bun at the harbour bakery after three, and put the receipt inside. Please keep the bag at the desk until I return. — Lena",
            "비가 시작됐을 때 안내 데스크 근처에 파란 천 가방을 두고 왔습니다. 지퍼에 작은 은색 별이 달려 있습니다. 3시 이후 항구 빵집에서 레몬빵을 사고 영수증을 안에 넣었습니다. 제가 돌아올 때까지 가방을 데스크에 보관해 주세요. — 레나",
            "파란 가방 두 개를 구별하는 데 더 유용한 특징은?",
            [
              "Its silver star on the zipper.",
              "Its blue colour alone.",
              "Its red tag and cinnamon bun receipt.",
            ],
            0,
          ),
          challenge: choice(
            "To the lost-property team: I believe I left my blue canvas bag by the information desk when the rain started. Since another blue bag was nearby, colour alone will not identify mine. Look for a small silver star attached to the zipper. Inside should be a receipt for a lemon bun that I bought at the harbour bakery sometime after three. Please retain it at the desk so I can collect it in person. — Lena",
            "분실물 담당자에게: 비가 시작됐을 때 안내 데스크 옆에 파란 천 가방을 두고 온 것 같습니다. 근처에 또 다른 파란 가방이 있어 색만으로는 제 것을 구별할 수 없습니다. 지퍼에 달린 작은 은색 별을 찾아주세요. 안에는 3시 이후 항구 빵집에서 산 레몬빵 영수증이 있을 것입니다. 직접 찾으러 갈 수 있도록 데스크에 보관해 주세요. — 레나",
            "편지에서 함께 확인해야 할 단서 조합을 고르세요.",
            [
              "Blue fabric and a receipt from any shop.",
              "A red tag and a bakery receipt from before three.",
              "A silver star and a lemon bun receipt from after three.",
            ],
            2,
          ),
        },
      },
      {
        id: "locker-testimony",
        skill: "listening",
        title: "두 가방이 놓인 시간",
        speaker: "Mina · 안내소 직원",
        context:
          "접수 당시 상황을 남긴 미나의 음성입니다. 어느 가방이 먼저 있었는지 들으며 편지의 단서를 확인하세요.",
        document: "직원 음성 메모",
        feedback:
          "빨간 꼬리표의 가방은 비가 오기 전부터 있었습니다. 은색 별이 달린 가방은 비가 시작된 뒤 발견됐습니다. already, before, after가 시간의 차이를 만듭니다. 같은 색이라는 이유로 두 가방을 같은 물건으로 취급하면 안 됩니다. 시간 단서는 보조 근거이고, 영수증도 이어서 확인합니다.",
        consequence:
          "편지의 '비가 시작될 때'라는 설명과 은색 별 가방의 접수 시점이 맞습니다. 이제 영수증을 확인할 차례입니다.",
        expressionIds: ["locker-describe-bag"],
        versions: {
          starter: choice(
            "The bag with the red tag was here before the rain. The bag with the silver star arrived after the rain started. Both bags are blue.",
            "빨간 꼬리표 가방은 비가 오기 전부터 있었습니다. 은색 별 가방은 비가 시작된 뒤 들어왔습니다. 두 가방 모두 파란색입니다.",
            "비가 오기 전부터 있던 가방은?",
            ["The bag with the red tag.", "The bag with the silver star.", "Both bags."],
            0,
          ),
          standard: choice(
            "When I started my shift, the blue bag with a red tag was already on the shelf. After the rain began, someone handed in another blue bag with a silver star on its zipper. I recorded them separately so we wouldn't mix them up.",
            "제 근무가 시작됐을 때 빨간 꼬리표의 파란 가방은 이미 선반에 있었습니다. 비가 시작된 뒤 누군가 지퍼에 은색 별이 달린 다른 파란 가방을 맡겼습니다. 혼동하지 않도록 따로 기록했습니다.",
            "미나의 메모 내용과 일치하는 답은?",
            [
              "The two blue bags arrived together before the rain.",
              "The red-tag bag was already there; the star bag arrived later.",
              "The star bag arrived first, and its tag was later changed to red.",
            ],
            1,
          ),
          challenge: choice(
            "There were two separate arrivals, not one bag described in two ways. The red-tag bag was on the shelf when my shift began, before the rain. Only after the rain started did a visitor hand in the bag with the silver star. I haven't verified either owner yet. Before returning a bag, I always ask, 'Could you describe your bag?' and compare the answer with the record.",
            "같은 가방을 두 방식으로 묘사한 것이 아니라 별도로 접수된 두 가방입니다. 빨간 꼬리표 가방은 비가 오기 전 제 근무가 시작됐을 때 선반에 있었습니다. 비가 시작된 뒤에야 방문객이 은색 별 가방을 맡겼습니다. 아직 어느 주인도 확인하지 않았습니다. 가방을 돌려주기 전에는 항상 가방 특징을 설명해 달라고 요청하고 기록과 비교합니다.",
            "이 메모가 알려 주는 사실과 아직 모르는 사실을 구분하세요.",
            [
              "The red-tag bag arrived later, and both owners have been verified.",
              "Both bags are Lena's because they have the same colour.",
              "The star bag arrived later; its owner still needs to be verified.",
            ],
            2,
          ),
        },
      },
      {
        id: "locker-request",
        skill: "writing",
        title: "직원에게 확인 요청",
        context:
          "가방 안의 물건은 담당 직원만 확인합니다. 미나에게 영수증을 대조해 달라는 메시지를 작성하세요.",
        document: "확인 요청 메모",
        feedback:
          "영수증 확인을 부탁하면 편지의 구매 내용과 실제 기록을 비교할 수 있습니다. 기본에서는 lemon bun, 도전에서는 after three도 전달해야 확인할 조건이 분명해집니다. check는 여기서 '확인하다'라는 뜻입니다. 이 검사는 요청의 핵심 내용 확인이며 문법이나 작문 실력의 등급 판정은 아닙니다.",
        consequence:
          "미나가 두 가방의 접수 기록에 적힌 영수증 정보를 가져옵니다. 당신은 가방을 직접 열지 않고 기록을 비교합니다.",
        expressionIds: ["locker-check-receipt"],
        versions: {
          starter: {
            passage: "Ask Mina to check the receipt in the bag.",
            translation: "미나에게 가방 안 영수증을 확인해 달라고 요청하세요.",
            prompt: "영수증 확인을 부탁하는 짧은 영어 문장을 쓰세요.",
            model: "Could you check the receipt?",
            accepted: [
              "Could you check the receipt?",
              "Can you check the receipt?",
              "Please check the receipt.",
            ],
            keywords: [["check", "look at", "verify", "compare"], ["receipt"]],
            starter: "Could you check…?",
          },
          standard: {
            passage:
              "The letter mentions a lemon bun. Ask Mina to check whether the receipt is for that item.",
            translation:
              "편지에는 레몬빵이 나옵니다. 미나에게 영수증이 그 품목의 것인지 확인해 달라고 요청하세요.",
            prompt: "영수증과 레몬빵을 언급하며 확인을 요청하세요.",
            model: "Could you check the receipt for the lemon bun?",
            accepted: [
              "Could you check the receipt for the lemon bun?",
              "Please check whether the receipt is for a lemon bun.",
              "Can you check the lemon bun receipt?",
            ],
            keywords: [["check", "look at", "verify", "compare"], ["receipt"], ["lemon"]],
          },
          challenge: {
            passage:
              "You need to compare both the purchase and its time with Lena's letter. Write Mina a request that includes the item and the condition 'after three'.",
            translation:
              "구매 품목과 시간을 모두 레나의 편지와 비교해야 합니다. 품목과 '3시 이후' 조건을 포함해 미나에게 요청하세요.",
            prompt: "영수증·레몬빵·3시 이후 조건을 넣어 확인을 요청하세요.",
            model: "Could you check whether the receipt is for a lemon bun bought after three?",
            accepted: [
              "Could you check whether the receipt is for a lemon bun bought after three?",
              "Please check the receipt for a lemon bun purchased after 3 p.m.",
            ],
            keywords: [
              ["check", "look at", "verify", "compare"],
              ["receipt"],
              ["lemon"],
              ["after three", "after 3", "after 15", "later than three", "later than 3"],
            ],
          },
        },
      },
      {
        id: "locker-records",
        skill: "reading",
        title: "두 단서가 만나는 가방",
        context:
          "미나가 가져온 기록입니다. 지퍼 장식과 구매 기록이 모두 편지와 맞는 가방을 찾으세요.",
        document: "분실물 접수 기록",
        feedback:
          "B 가방은 은색 별과 레몬빵 영수증이 모두 맞고, 15:20은 3시 이후입니다. A 가방은 빨간 꼬리표이고 영수증도 14:10 계피빵이어서 두 조건 모두 다릅니다. 색이나 접수 순서 하나만으로 결정하지 않고 특징과 기록을 대조한 것입니다. 반환 전 본인 확인은 아직 남아 있습니다.",
        consequence:
          "당신은 B 가방을 반환 후보로 표시합니다. 미나는 주인 확인 절차를 준비하고, 당신에게 판단 근거를 물어봅니다.",
        expressionIds: ["locker-evidence-match"],
        versions: {
          starter: choice(
            "Bag A: blue, red tag. Receipt: cinnamon bun, 14:10.\nBag B: blue, silver star. Receipt: lemon bun, 15:20.",
            "A 가방: 파란색, 빨간 꼬리표. 영수증: 계피빵, 14시 10분.\nB 가방: 파란색, 은색 별. 영수증: 레몬빵, 15시 20분.",
            "은색 별과 레몬빵 영수증이 있는 가방은?",
            ["Bag A.", "Both bags.", "Bag B."],
            2,
          ),
          standard: choice(
            "Bag A — blue canvas; red tag; harbour bakery receipt for a cinnamon bun at 14:10.\nBag B — blue canvas; silver star on zipper; harbour bakery receipt for a lemon bun at 15:20.\nLena's letter — silver star; lemon bun bought after three.",
            "A 가방 — 파란 천, 빨간 꼬리표, 14시 10분 항구 빵집 계피빵 영수증.\nB 가방 — 파란 천, 지퍼의 은색 별, 15시 20분 항구 빵집 레몬빵 영수증.\n레나의 편지 — 은색 별, 3시 이후에 산 레몬빵.",
            "특징과 구매 기록을 함께 고려한 결론은?",
            [
              "Bag B matches both the silver star and the lemon bun receipt.",
              "Bag A matches because 14:10 is after three.",
              "Both bags match because they are blue.",
            ],
            0,
          ),
          challenge: choice(
            "The two bags came from the same area and are both blue canvas, so neither fact distinguishes them. A has a red tag and a 14:10 receipt for a cinnamon bun. B has a silver star attached to its zipper and a 15:20 receipt for a lemon bun. Lena specified a silver star and a lemon bun purchased after three. The contents used for the final ownership check have not been disclosed to her.",
            "두 가방은 같은 지역에서 왔고 모두 파란 천이므로 어느 사실도 구별에 도움이 되지 않습니다. A에는 빨간 꼬리표와 14시 10분 계피빵 영수증이 있습니다. B에는 지퍼에 은색 별과 15시 20분 레몬빵 영수증이 있습니다. 레나는 은색 별과 3시 이후 산 레몬빵을 명시했습니다. 최종 주인 확인에 쓸 가방 속 물건은 아직 레나에게 알려 주지 않았습니다.",
            "근거와 다음 확인 절차가 모두 타당한 결론은?",
            [
              "Return A immediately because it was found in the same area.",
              "Select B as the matching bag, then let staff verify ownership.",
              "Return both bags because matching colours prove the same owner.",
            ],
            1,
          ),
        },
      },
      {
        id: "locker-report",
        skill: "speaking",
        title: "판단의 근거를 전달하기",
        speaker: "당신 → Mina",
        context:
          "미나에게 B 가방을 고른 이유를 설명하세요. 정답만 말하는 것에서 한 걸음 더 나아가 근거를 전달합니다.",
        document: "반환 전 짧은 보고",
        feedback:
          "The receipt matches the letter.는 기록을 대조한 결과를 설명합니다. 기본부터는 은색 별도 함께 말하고, 도전에서는 반환 전 주인 확인을 제안합니다. 소리 내어 말하고 스스로 확인하는 연습이며 자동 발음 평가가 아닙니다.",
        consequence:
          "미나는 레나에게 가방 속 물건을 먼저 묻습니다. 초록색 공책이라는 답이 미공개 기록과 맞아 B 가방을 반환합니다.",
        expressionIds: ["locker-evidence-match"],
        versions: {
          starter: {
            passage: "Bag B has the correct receipt. Tell Mina that it matches Lena's letter.",
            translation:
              "B 가방에는 맞는 영수증이 있습니다. 레나의 편지와 일치한다고 미나에게 전하세요.",
            prompt: "B 가방이라고 말하고, 영수증이 편지와 맞는다고 소리 내어 설명하세요.",
            model: "I think it's Bag B. The receipt matches the letter.",
            starter: "I think it's… The receipt…",
          },
          standard: {
            passage:
              "Bag B has a silver star and a lemon bun receipt from 15:20. Explain why both details matter.",
            translation:
              "B 가방에는 은색 별과 15시 20분 레몬빵 영수증이 있습니다. 두 정보가 근거가 되는 이유를 설명하세요.",
            prompt: "B 가방을 고른 이유를 장식과 영수증 두 가지로 설명하세요.",
            model:
              "I think Bag B is Lena's. It has a silver star, and the receipt matches the letter.",
          },
          challenge: {
            passage:
              "The physical feature and the purchase record both point to Bag B. However, matching evidence is not the final ownership check. Give Mina your conclusion, its reasons, and a sensible next step.",
            translation:
              "가방 특징과 구매 기록은 모두 B를 가리킵니다. 하지만 일치하는 단서만으로 최종 주인 확인이 끝난 것은 아닙니다. 결론, 이유, 타당한 다음 절차를 미나에게 전하세요.",
            prompt:
              "장식·구매 시각을 근거로 결론을 말하고, 반환 전 주인 확인을 제안하세요. 먼저 스스로 표현해 보세요.",
            model:
              "Bag B has the silver star, and its 15:20 lemon bun receipt matches the letter. We should verify the owner before returning it.",
          },
        },
      },
    ],
  },
  {
    id: "moonlight-post",
    title: "달빛 우체국",
    englishTitle: "The Moonlight Post Office",
    genre: "fairytale",
    genreLabel: "동화 · 모험",
    synopsis: "밤에만 열리는 우체국의 새 배달원. 흰 등불 배에 편지를 싣고 동쪽 등대까지 전하세요.",
    intro:
      "여울의 잠든 항구에 달빛이 닿으면 동물들의 작은 우체국이 열립니다. 오늘은 당신이 견습 배달원입니다. 토끼 미로는 멀리 있는 할머니 윌로에게 내일 해 질 무렵 열리는 등불 축제의 초대장을 보내려 합니다. 이 세계에는 세 가지 약속이 있습니다. 편지에는 받는이와 장소를 써야 하고, 흰 등불 배는 동쪽 등대로, 호박빛 등불 배는 사과 과수원으로 갑니다. 배는 두 번째 종이 울릴 때 출발하며 해가 뜨면 다음 밤까지 쉬어야 합니다. 우체국장 여우 솔의 안내를 따라 초대장을 오늘 밤 전해 주세요.",
    ending:
      "당신은 받는이와 동쪽 등대 주소를 적고, 두 번째 종이 울릴 때 흰 등불 배에 올랐습니다. 시계탑 앞 선착장에서 내린 뒤 조개 표지의 돌길을 따라 등대에 도착했습니다. 할머니 윌로에게 이름을 확인하고 편지를 건네자, 미로가 만든 첫 등불을 내일 함께 밝혀 달라는 초대가 나옵니다. 윌로는 답장을 준비해 다음 밤 우체국에 맡기기로 합니다. 해 뜨기 전에 배달을 마친 당신의 가방에는 도착 확인 도장이 하나 남습니다.",
    takeaway:
      "목적지와 시간을 듣고, 정확한 주소를 쓰고, 받는이를 확인하며 편지를 전달할 수 있어요.",
    minutes: 14,
    image: "/assets/english/moonpost.webp",
    imageAlt: "달빛 아래 나무 우체국에서 여우 직원과 토끼가 편지를 주고받는 수채화 장면",
    accent: "#b5a8dd",
    expressions: [
      {
        id: "moonpost-destination",
        en: "Where should I deliver this letter?",
        ko: "이 편지를 어디로 배달해야 하나요?",
        recall: "배달할 편지를 받았어요. 목적지를 물어보세요.",
        accepted: [
          "Where should I deliver this letter?",
          "Where do I deliver this letter?",
          "Where should I take this letter?",
          "Where does this letter need to go?",
        ],
      },
      {
        id: "moonpost-departure",
        en: "When does the boat leave?",
        ko: "배는 언제 출발하나요?",
        recall: "맞는 배를 찾았어요. 출발 시각을 물어보세요.",
        accepted: [
          "When does the boat leave?",
          "What time does the boat leave?",
          "When will the boat leave?",
          "When does this boat depart?",
        ],
      },
      {
        id: "moonpost-delivery",
        en: "I have a letter for you.",
        ko: "전해 드릴 편지가 있어요.",
        recall: "받는이 앞에 도착했어요. 전해 드릴 편지가 있다고 말하세요.",
        accepted: [
          "I have a letter for you.",
          "I've got a letter for you.",
          "I have a letter to deliver to you.",
          "There is a letter for you.",
        ],
      },
    ],
    tasks: [
      {
        id: "moonpost-assignment",
        skill: "reading",
        title: "첫 번째 배달 의뢰",
        context:
          "미로의 편지에는 아직 주소가 비어 있습니다. 우체국장이 적어 둔 의뢰 카드에서 받는이와 장소를 확인하세요.",
        document: "배달 의뢰 카드",
        feedback:
          "받는이는 Grandma Willow, 목적지는 East Lighthouse입니다. 사과 과수원은 다른 배의 목적지이고, west는 east와 반대 방향입니다. 동화의 배달 규칙도 편지에 적힌 정보를 정확히 읽어야 적용할 수 있습니다.",
        consequence:
          "당신은 할머니 윌로와 동쪽 등대를 확인합니다. 솔에게 배의 출발 시각을 물으려 합니다.",
        expressionIds: ["moonpost-destination"],
        versions: {
          starter: choice(
            "Deliver this letter to Grandma Willow at the East Lighthouse. It is an invitation from Miro. Please deliver it tonight.",
            "이 편지를 동쪽 등대의 할머니 윌로에게 배달하세요. 미로가 보낸 초대장입니다. 오늘 밤 배달해 주세요.",
            "편지는 어디로 가야 하나요?",
            ["The East Lighthouse.", "The Apple Orchard.", "The West Lighthouse."],
            0,
          ),
          standard: choice(
            "Miro has made his first festival lantern and wants Grandma Willow to light it with him at sunset tomorrow. She lives at the East Lighthouse. Deliver the invitation tonight, before the moon boats stop at sunrise. Write her name and destination on the envelope first.",
            "미로는 축제를 위한 첫 등불을 만들었고 내일 해 질 무렵 할머니 윌로와 함께 밝히고 싶어 합니다. 할머니는 동쪽 등대에 삽니다. 해 뜰 때 달빛 배가 쉬기 전에 오늘 밤 초대장을 배달하세요. 먼저 봉투에 이름과 목적지를 쓰세요.",
            "배달 대상과 목적지가 모두 맞는 답은?",
            [
              "Miro at the Apple Orchard.",
              "Grandma Willow at the East Lighthouse.",
              "Grandma Willow at the West Lighthouse.",
            ],
            1,
          ),
          challenge: choice(
            "Delivery request: Miro would like Grandma Willow, who lives at the East Lighthouse, to join him in lighting his first lantern at tomorrow's sunset festival. His invitation must reach her tonight: the moon boats rest from sunrise until the following night, which would be too late for her to prepare. The envelope needs both the recipient's name and the destination before it can be sorted onto the correct boat.",
            "배달 의뢰: 미로는 동쪽 등대에 사는 할머니 윌로가 내일 해 질 무렵의 축제에서 자신의 첫 등불을 함께 밝혀 주길 바랍니다. 초대장은 오늘 밤 도착해야 합니다. 달빛 배는 해 뜰 때부터 다음 밤까지 쉬기 때문에 그때 배달하면 준비할 시간이 부족합니다. 맞는 배로 분류하려면 봉투에 받는이 이름과 목적지가 모두 필요합니다.",
            "정확한 목적지와 오늘 밤 배달해야 하는 이유를 고르세요.",
            [
              "The orchard, because the lighthouse boat never runs at night.",
              "The west lighthouse, because Willow sent Miro the invitation.",
              "The East Lighthouse, so Willow has time to prepare for tomorrow's festival.",
            ],
            2,
          ),
        },
      },
      {
        id: "moonpost-boat",
        skill: "listening",
        title: "두 번째 종과 흰 등불",
        speaker: "Sol · 우체국장",
        context:
          "When does the boat leave?라고 묻자 솔이 두 배를 설명합니다. 음성에서 목적지와 출발 신호를 함께 찾으세요.",
        document: "솔의 출항 안내",
        feedback:
          "흰 등불 배가 동쪽 등대로 가며 두 번째 종에 출발합니다. 호박빛 등불 배는 사과 과수원행이라 더 가까이 있어도 이번 목적지에 맞지 않습니다. 첫 번째 종은 준비 신호입니다. second bell을 들은 뒤 움직여야 합니다.",
        consequence:
          "당신은 흰 등불 배를 확인합니다. 아직 첫 번째 종이 울렸으므로 기다리는 동안 봉투 주소를 완성합니다.",
        expressionIds: ["moonpost-departure"],
        versions: {
          starter: choice(
            "Take the boat with the white lantern. It goes to the East Lighthouse. It leaves at the second bell. The first bell means get ready.",
            "흰 등불 배를 타세요. 동쪽 등대로 갑니다. 두 번째 종에 출발합니다. 첫 번째 종은 준비하라는 뜻입니다.",
            "어떤 배가 언제 출발하나요?",
            [
              "The amber-lantern boat at sunrise.",
              "The white-lantern boat at the second bell.",
              "The white-lantern boat at the first bell.",
            ],
            1,
          ),
          standard: choice(
            "The white lantern marks the lighthouse boat; the amber lantern marks the orchard boat. The first bell is only a signal to get ready. Both boats leave when the second bell rings. For Willow's letter, wait beside the white lantern.",
            "흰 등불은 등대 배를, 호박빛 등불은 과수원 배를 표시합니다. 첫 번째 종은 준비 신호일 뿐입니다. 두 배 모두 두 번째 종이 울릴 때 출발합니다. 윌로의 편지를 배달하려면 흰 등불 옆에서 기다리세요.",
            "이번 편지의 목적지에 맞는 행동은?",
            [
              "Wait beside the white lantern and leave at the second bell.",
              "Take the amber-lantern boat as soon as the first bell rings.",
              "Wait until sunrise to take either boat.",
            ],
            0,
          ),
          challenge: choice(
            "Don't confuse the nearer amber-lantern boat with yours; that one serves the orchard. The white-lantern boat is bound for the East Lighthouse. Although the first bell is about to ring, it only tells the crews to prepare. Departure is at the second bell. After sunrise there will be no further service until tomorrow night.",
            "더 가까이 있는 호박빛 등불 배와 당신의 배를 혼동하지 마세요. 그것은 과수원행입니다. 흰 등불 배가 동쪽 등대로 갑니다. 첫 번째 종이 곧 울리지만 그것은 선원들의 준비 신호일 뿐입니다. 출발은 두 번째 종입니다. 해가 뜨면 내일 밤까지 운항하지 않습니다.",
            "가까운 배와 준비 신호에 현혹되지 않은 계획을 고르세요.",
            [
              "Board the nearer boat because lantern colour only marks decoration.",
              "Leave at the first bell because there is no second departure signal.",
              "Use the white-lantern boat at the second bell, before the service pauses at sunrise.",
            ],
            2,
          ),
        },
      },
      {
        id: "moonpost-address",
        skill: "writing",
        title: "빈 봉투에 주소 쓰기",
        context:
          "미로는 초대장을 썼지만 봉투 주소를 빠뜨렸습니다. 우체국의 규칙에 따라 받는이와 장소를 적어 배달을 준비하세요.",
        document: "미로의 편지 봉투",
        feedback:
          "봉투에는 Willow라는 받는이와 East Lighthouse라는 장소가 모두 필요합니다. 이름만 있으면 어느 집인지 모르고, 장소만 있으면 누구에게 줄지 모릅니다. 도전에서는 before sunrise라는 배달 요청도 덧붙입니다. 정확한 뜻이 전달되는지 핵심 내용을 확인하며 문법 점수를 매기지 않습니다.",
        consequence:
          "솔이 받는이와 목적지를 확인하고 흰 등불 배의 우편 가방에 편지를 넣습니다. 두 번째 종이 울립니다.",
        expressionIds: ["moonpost-destination"],
        versions: {
          starter: {
            passage: "Recipient: Grandma Willow. Place: East Lighthouse. Put both on the envelope.",
            translation: "받는이: 할머니 윌로. 장소: 동쪽 등대. 봉투에 둘 다 적으세요.",
            prompt: "Willow와 East Lighthouse를 포함해 주소 한 줄을 쓰세요.",
            model: "To Grandma Willow at the East Lighthouse.",
            accepted: [
              "To Grandma Willow at the East Lighthouse.",
              "Grandma Willow, East Lighthouse.",
              "To Willow, East Lighthouse.",
            ],
            keywords: [["willow"], ["east"], ["lighthouse"]],
            starter: "To Grandma… at the…",
          },
          standard: {
            passage:
              "Write the recipient and destination clearly. The letter is for Grandma Willow, who lives at the East Lighthouse.",
            translation:
              "받는이와 목적지를 분명히 적으세요. 편지는 동쪽 등대에 사는 할머니 윌로에게 가야 합니다.",
            prompt: "누구에게 어디로 배달할지 완전한 문장으로 요청하세요.",
            model: "Please deliver this letter to Grandma Willow at the East Lighthouse.",
            accepted: [
              "Please deliver this letter to Grandma Willow at the East Lighthouse.",
              "Take this letter to Grandma Willow at the East Lighthouse.",
              "This letter is for Grandma Willow at the East Lighthouse.",
            ],
            keywords: [["willow"], ["east"], ["lighthouse"], ["letter"]],
          },
          challenge: {
            passage:
              "Prepare a delivery note that tells the crew who should receive the letter, where she lives, and that it needs to arrive before sunrise.",
            translation:
              "선원에게 받는이, 사는 장소, 해 뜨기 전 도착해야 한다는 조건을 전달하는 배달 메모를 쓰세요.",
            prompt: "Willow·East Lighthouse·해 뜨기 전 조건을 포함한 배달 요청을 쓰세요.",
            model:
              "Please deliver this letter to Grandma Willow at the East Lighthouse before sunrise.",
            accepted: [
              "Please deliver this letter to Grandma Willow at the East Lighthouse before sunrise.",
              "This letter must reach Grandma Willow at the East Lighthouse before sunrise.",
            ],
            keywords: [
              ["willow"],
              ["east"],
              ["lighthouse"],
              ["letter"],
              ["before sunrise", "before dawn", "before the sun rises"],
            ],
          },
        },
      },
      {
        id: "moonpost-route",
        skill: "listening",
        title: "선착장부터 등대까지",
        speaker: "Captain Fern · 달빛 배 선장",
        context: "배가 동쪽 선착장에 가까워집니다. 선장의 음성을 듣고 내린 뒤의 길을 기억하세요.",
        document: "선장의 도착 안내",
        feedback:
          "시계탑 옆 선착장에서 내려 조개 표지의 돌길을 따라가야 합니다. 나무다리는 과수원으로 가는 길이라 목적지가 다릅니다. beside the clock tower는 내리는 장소를, stone path with shell signs는 그다음 이동 경로를 알려 줍니다. 배의 등불 색과 육지의 표지판은 서로 다른 단계의 안내입니다.",
        consequence:
          "배가 시계탑 옆에 멈춥니다. 당신은 조개 표지를 따라 돌길을 걸어 동쪽 등대 앞에 도착합니다.",
        expressionIds: ["moonpost-destination"],
        versions: {
          starter: choice(
            "Get off beside the clock tower. Follow the stone path with shell signs. It goes to the lighthouse. The wooden bridge goes to the orchard.",
            "시계탑 옆에서 내리세요. 조개 표지가 있는 돌길을 따라가세요. 그 길은 등대로 갑니다. 나무다리는 과수원으로 갑니다.",
            "등대로 가는 길은?",
            [
              "The wooden bridge.",
              "The path with apple signs.",
              "The stone path with shell signs.",
            ],
            2,
          ),
          standard: choice(
            "We'll stop at the landing beside the clock tower. From there, follow the shell signs along the stone path to the East Lighthouse. Don't cross the wooden bridge: it leads back towards the orchard, not to Willow's home.",
            "시계탑 옆 선착장에 멈춥니다. 거기에서 조개 표지를 따라 돌길로 동쪽 등대까지 가세요. 나무다리를 건너지 마세요. 윌로의 집이 아니라 과수원 쪽으로 이어집니다.",
            "내릴 장소와 이후 경로가 모두 맞는 답은?",
            [
              "Get off by the clock tower, then follow the shell-marked stone path.",
              "Stay on the boat until the orchard, then cross the wooden bridge.",
              "Get off by the clock tower, then follow the apple signs over the bridge.",
            ],
            0,
          ),
          challenge: choice(
            "The white lantern has brought you to the correct landing, beside the clock tower. Your journey isn't quite finished. On shore, shell signs mark the stone path towards the East Lighthouse. The wooden bridge may look like a shortcut, but it leads in the opposite direction, towards the orchard. Stay on the marked stone path until you reach Willow's front door.",
            "흰 등불 배가 시계탑 옆 맞는 선착장까지 데려왔습니다. 하지만 여정은 아직 끝나지 않았습니다. 육지의 조개 표지는 동쪽 등대로 가는 돌길을 표시합니다. 나무다리는 지름길처럼 보여도 반대 방향인 과수원 쪽으로 이어집니다. 윌로의 현관에 도착할 때까지 표시된 돌길을 따라가세요.",
            "지름길처럼 보이는 길을 피해야 하는 이유는?",
            [
              "The bridge is broken, so no one can cross it.",
              "It leads towards the orchard instead of the East Lighthouse.",
              "The shell signs mean the lighthouse boat has been cancelled.",
            ],
            1,
          ),
        },
      },
      {
        id: "moonpost-deliver",
        skill: "speaking",
        title: "받는이에게 편지 전하기",
        speaker: "당신 → Grandma Willow",
        context:
          "등대 문이 열리고 할머니가 나옵니다. 받는이 이름을 확인하고 편지가 있다고 말하세요. 편지 내용은 받는이가 직접 읽습니다.",
        document: "동쪽 등대 현관",
        feedback:
          "I have a letter for you.로 배달 목적을 전할 수 있습니다. 먼저 Are you Grandma Willow?라고 이름을 확인하면 잘못 전달하는 일을 줄입니다. 도전에서는 보낸 사람과 초대장이라는 목적도 설명합니다. 직접 말해 본 뒤 스스로 확인하며 발음 점수는 생성하지 않습니다.",
        consequence:
          "윌로가 자신의 이름을 확인합니다. 편지를 건네받아 읽고 웃으며 내일 미로의 첫 등불을 함께 밝히겠다고 합니다.",
        expressionIds: ["moonpost-delivery"],
        versions: {
          starter: {
            passage: "Grandma Willow opens the door. You are holding Miro's letter.",
            translation: "할머니 윌로가 문을 엽니다. 당신은 미로의 편지를 들고 있습니다.",
            prompt: "할머니 이름을 확인하고, 편지가 있다고 소리 내어 말하세요.",
            model: "Are you Grandma Willow? I have a letter for you.",
            starter: "Are you…? I have…",
          },
          standard: {
            passage:
              "Someone opens the lighthouse door. Check that she is Grandma Willow, then tell her you have a letter from Miro.",
            translation:
              "누군가 등대 문을 엽니다. 할머니 윌로가 맞는지 확인한 뒤 미로에게서 온 편지가 있다고 말하세요.",
            prompt: "받는이를 확인하고, 누가 보낸 편지인지 전달하세요.",
            model: "Are you Grandma Willow? I have a letter for you from Miro.",
          },
          challenge: {
            passage:
              "You have reached the East Lighthouse before sunrise. Introduce yourself as the new delivery worker, confirm the recipient, and explain who sent the letter and why it needed to arrive tonight.",
            translation:
              "해 뜨기 전에 동쪽 등대에 도착했습니다. 새 배달원이라고 소개하고 받는이를 확인하세요. 누가 보냈고 왜 오늘 밤 도착해야 했는지도 설명하세요.",
            prompt:
              "소개·받는이 확인·보낸이·내일 축제 초대 목적을 자유롭게 말하세요. 예문 없이 먼저 도전해 보세요.",
            model:
              "Hello, I'm the new delivery worker. Are you Grandma Willow? I have a letter for you from Miro. It's an invitation to tomorrow's lantern festival, so he wanted you to receive it tonight.",
          },
        },
      },
    ],
  },
];
