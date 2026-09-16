/* 0.6.2 language edit, not a new fact or scene. Stable line IDs and order are preserved.
 * Save aliases accept ONLY the exact old text at the matching ID and speaker. */
(function(root){'use strict';const D=root.STORY;const edits=[
  {
    "id": "topic/t_machine/6",
    "topic": "t_machine",
    "index": 6,
    "who": "haeon",
    "before": "그 사실과 사건 때 손에 쥐고 있었는지는 다른 문제입니다. 마지막으로 본 상태를 확인하겠습니다.",
    "after": "관리하던 장비인 건 알겠습니다. 마지막으로 본 상태부터 말씀해 주세요."
  },
  {
    "id": "topic/t_machine/8",
    "topic": "t_machine",
    "index": 8,
    "who": "haeon",
    "before": "장비의 용도부터 기록하겠습니다. 공격한 사람은 다른 자료까지 봐야 합니다.",
    "after": "당시 손잡이가 어디에 놓여 있었는지부터 확인하겠습니다."
  },
  {
    "id": "topic/t_after_admit/1",
    "topic": "t_after_admit",
    "index": 1,
    "who": "haeon",
    "before": "그 시간의 위치를 보여 줍니다. 오늘 있었던 다른 일을 없애 주지는 않고요.",
    "after": "영상에 찍힌 동안에는 그렇습니다. 렌즈를 바꾼 일은 남아 있고요."
  },
  {
    "id": "topic/t_after_admit/3",
    "topic": "t_after_admit",
    "index": 3,
    "who": "haeon",
    "before": "네. 그래서 렌즈 문제는 그 근거로 기록하고, 공격 여부는 시간과 현장을 따로 보겠습니다.",
    "after": "렌즈 얘기는 들었습니다. 그 뒤 대표와 통화한 부분도 확인하죠."
  },
  {
    "id": "topic/t_after_admit/5",
    "topic": "t_after_admit",
    "index": 5,
    "who": "haeon",
    "before": "그렇게 처리할 이유가 없습니다.",
    "after": "영상에 나온 내용은 그대로 봐야죠."
  },
  {
    "id": "topic/t_after_admit/8",
    "topic": "t_after_admit",
    "index": 8,
    "who": "haeon",
    "before": "그 판단을 기록하겠습니다. 통화 뒤 동선도 빠뜨리지 않고요.",
    "after": "통화 뒤 어디로 갔는지도 계속 확인하겠습니다."
  },
  {
    "id": "topic/j_signature_purpose/8",
    "topic": "j_signature_purpose",
    "index": 8,
    "who": "haeon",
    "before": "서명 사용과 실제 이체를 별도 항목으로 기록하겠습니다.",
    "after": "허락은 받지 않고, 동의서에 있던 서명을 옮긴 거군요."
  },
  {
    "id": "topic/s_photo_limits/6",
    "topic": "s_photo_limits",
    "index": 6,
    "who": "n",
    "before": "사진으로 확인한 상태와 사람이 기억한 이동을 같은 확정 사실 칸에 넣지 않았다.",
    "after": "사진 옆에 ‘18:32’를 적고, 다음 줄에 서아가 말한 이동 시각을 덧붙였다."
  },
  {
    "id": "topic/s_photo_limits/7",
    "topic": "s_photo_limits",
    "index": 7,
    "who": "haeon",
    "before": "그 차이를 기록하겠습니다. 사진 뒤의 행적은 다른 자료와 맞추겠습니다.",
    "after": "그 뒤에 장부를 본 사람이 있는지도 알아보겠습니다."
  },
  {
    "id": "topic/y_work/6",
    "topic": "y_work",
    "index": 6,
    "who": "haeon",
    "before": "일하신 내용도 기록하겠습니다. 오늘 입금 건은 따로 확인하고요.",
    "after": "일한 기억은 남기고, 못 받은 돈은 계속 확인하고 싶으신 거군요."
  },
  {
    "id": "topic/h_followup/1",
    "topic": "h_followup",
    "index": 1,
    "who": "haeon",
    "before": "그 말이 확인서의 전액 수령과 다르다는 점을 기록하겠습니다.",
    "after": "확인서에는 천육백만 원을 받았다고 적혀 있습니다."
  },
  {
    "id": "topic/h_followup/3",
    "topic": "h_followup",
    "index": 3,
    "who": "haeon",
    "before": "직접 하신 말만 남깁니다. 작성 파일과 연결하는 판단은 별도입니다.",
    "after": "천만 원을 받았다는 말씀 그대로 적었습니다."
  },
  {
    "id": "topic/h_followup/6",
    "topic": "h_followup",
    "index": 6,
    "who": "haeon",
    "before": "합의와 실행이 다른 문제라서요.",
    "after": "받기로 한 금액과 실제 들어온 금액이 다르니까요."
  },
  {
    "id": "topic/h_anonymity/3",
    "topic": "h_anonymity",
    "index": 3,
    "who": "haeon",
    "before": "네. 허락했다고 추정해서 진행하지 않습니다.",
    "after": "네. 보시고 마음이 바뀌면 말씀해 주세요."
  },
  {
    "id": "topic/h_anonymity/6",
    "topic": "h_anonymity",
    "index": 6,
    "who": "haeon",
    "before": "지금은 확인본 요청만 기록하겠습니다.",
    "after": "먼저 본인 부분만 보내 달라고 전하겠습니다."
  },
  {
    "id": "topic/s_noautoplay/3",
    "topic": "s_noautoplay",
    "index": 3,
    "who": "haeon",
    "before": "그렇다면 영상이 시작되지 않은 것이 고장이나 조작의 증거는 아니겠군요.",
    "after": "그럼 사람을 기다리느라 틀지 않은 거군요."
  },
  {
    "id": "topic/s_noautoplay/5",
    "topic": "s_noautoplay",
    "index": 5,
    "who": "n",
    "before": "준비됐지만 실행되지 않은 일정도 있었다. 일어나지 않은 일을 고장이라고 설명할 이유는 없었다.",
    "after": "빈 객석 앞에는 아직 재생하지 않은 영상이 준비돼 있었다."
  },
  {
    "id": "topic/s_noautoplay/6",
    "topic": "s_noautoplay",
    "index": 6,
    "who": "haeon",
    "before": "안내와 영상의 연결 여부를 기록에 남기겠습니다.",
    "after": "방송 예약과 영상 재생은 따로 확인하겠습니다."
  }
];
 const aliases=new Map();
 for(const e of edits){const line=D.topics.find(t=>t.id===e.topic)?.lines[e.index];
  if(!line||line.who!==e.who||line.text!==e.before)throw Error('Editorial source mismatch: '+e.id);
  line.text=e.after;aliases.set(e.id,e);
 }
 function migrateLog(log){for(const l of log||[]){const e=aliases.get(l.id);if(e&&l.who===e.who&&l.text===e.before)l.text=e.after;}}
 root.EDITORIAL={edits,migrateLog};
})(typeof window!=='undefined'?window:globalThis);
