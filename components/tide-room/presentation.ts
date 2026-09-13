import { places, type Place } from "./content";
import { has, replay, type State } from "./engine";
export const roomOrder: Place[] = ["pier", "records", "observatory"];
export const shortNames: Record<string, string> = {
  letter: "편지",
  departure: "출항장부",
  rope: "잘린 줄",
  log: "관측일지",
  chart: "두 도면",
  safety: "시험표",
  samples: "표본 기록",
  salt: "덮개 흔적",
  "old-notes": "음성 기록",
  "relic-notes": "필사본",
  funeral: "장례 기록",
  closure: "마라의 말",
  bearing: "도면 대조",
  echo: "반복 음성",
  response: "새 응답",
  "pin-confession": "요나의 말",
  rescue: "귀환 기록",
  "elliot-account": "엘리엇의 말",
};
export const detailImages: Record<string, { src: string; alt: string }> = {
  rope: {
    src: "/assets/tide-room/rope-detail.webp",
    alt: "끝이 납작하게 눌려 일자로 잘린 굵은 밧줄. 눌린 곳에 검은 조각과 황동 가루가 박혀 있다.",
  },
  salt: {
    src: "/assets/tide-room/groove-detail.webp",
    alt: "곧은 덮개 홈에 굵은 밧줄의 올이 끼어 있고, 아래에는 소금 흔적이 남아 있다.",
  },
};
export function backdrop(s: State) {
  if (s.rescue === 2) return "/assets/tide-room/chamber.webp";
  if (s.place !== "observatory") return places[s.place].image;
  if (s.width === 0) return "/assets/tide-room/observatory-closed.webp";
  if (s.width === 1)
    return s.aim === "arch"
      ? "/assets/tide-room/observatory-listening.webp"
      : "/assets/tide-room/observatory-water.webp";
  return places.observatory.image;
}
export function canCompare(s: State) {
  return has(s, "rope") && has(s, "salt");
}
export function toggleEvidence(current: string[], id: string, found: string[]) {
  if (!found.includes(id)) return current;
  if (current.includes(id)) return current.filter((x) => x !== id);
  return current.length < 2 ? [...current, id] : current;
}
export function lampFrames(first: number, second: number) {
  if (![first, second].every((n) => Number.isInteger(n) && n >= 1 && n <= 4)) return [];
  const frames: { side: "sent" | "reply"; on: boolean; ms: number }[] = [];
  for (const side of ["sent", "reply"] as const) {
    for (const [group, count] of [first, second].entries()) {
      for (let i = 0; i < count; i++)
        frames.push({ side, on: true, ms: 360 }, { side, on: false, ms: 260 });
      if (group === 0) frames.push({ side, on: false, ms: 700 });
    }
    frames.push({ side, on: false, ms: 900 });
  }
  return frames;
}

export function ensureEvidence(current: string[], id: string, found: string[]) {
  return current.includes(id) ? current : toggleEvidence(current, id, found);
}
export function objective(s: State) {
  if (s.ending) return "조사를 마쳤다. 확인한 기록과 결말을 다시 읽을 수 있다.";
  if (has(s, "rescue")) {
    if (!has(s, "elliot-account"))
      return "돌아온 엘리엇에게 관측소에서 무슨 일을 했는지 묻는다. 남은 자료도 확인할 수 있다.";
    if (!has(s, "samples"))
      return "기록실의 유리 표본 기록을 읽고 장치를 남겨 둘 때의 위험을 확인한다.";
    return "더 물어볼 말이 있으면 대화를 마친 뒤, 관측실에서 장치를 어떻게 처리할지 정한다.";
  }
  if (s.width === 2)
    return s.rescue === 1
      ? "통로를 건너 반대편 사람을 확인한다."
      : s.rescue === 2
        ? "부상자를 부축해 관측실로 돌아온다."
        : "문턱에 남은 안전줄을 회수하고 덮개를 닫는다.";
  if (has(s, "response")) {
    if (["clara-ready", "mara-ready", "jonah-ready"].every((f) => s.flags.includes(f)))
      return "세 사람의 준비가 끝났다. 관측실 제어대에서 석실 쪽 통로를 연다.";
    return "구조 준비에서 ‘확인 필요’로 표시된 인물을 찾아 맡을 일을 확인한다.";
  }
  if (has(s, "closure") && !has(s, "echo"))
    return "마라는 안쪽 사람과 대화했다고 했다. 시험표를 읽고 덮개를 조금 열어 직접 확인한다.";
  if (has(s, "closure"))
    return "반복되는 말과 지금 오는 답을 구별한다. 새 질문과 서로 다른 등불 신호를 보내 본다.";
  if (has(s, "log") && has(s, "rope"))
    return "마라에게 엘리엇의 마지막 작업과 끊어진 안전줄을 묻는다.";
  if (has(s, "departure"))
    return "기록실에서 엘리엇의 마지막 작업 기록을 찾고, 관측실에서 마라에게 행적을 묻는다.";
  return "부두의 출항장부를 읽고 엘리엇이 떠났다는 기록이 있는지 확인한다.";
}
export function previousPlace(events: string[], current: Place): Place | null {
  let last: Place = "pier",
    previous: Place | null = null;
  for (const event of events) {
    if (!event.startsWith("move:")) continue;
    const next = event.slice(5) as Place;
    if (roomOrder.includes(next) && next !== last) {
      previous = last;
      last = next;
    }
  }
  return last === current ? previous : null;
}

/** A review branch removes only the final ending action, never an earned discovery. */
export function beforeEnding(events: string[]): string | null {
  if (!/^end:(seal|dismantle|withdraw)$/.test(events.at(-1) || "")) return null;
  try {
    const current = replay(JSON.stringify({ version: 2, events }));
    const raw = JSON.stringify({ version: 2, events: events.slice(0, -1) });
    if (!current.state.ending || replay(raw).state.ending) return null;
    return raw;
  } catch {
    return null;
  }
}
export function rescueReadiness(s: State) {
  if (!has(s, "response") || has(s, "rescue") || s.ending) return [];
  return [
    { name: "클라라 · 등불", done: s.flags.includes("clara-ready") },
    { name: "마라 · 제한핀", done: s.flags.includes("mara-ready") },
    { name: "요나 · 안전줄", done: s.flags.includes("jonah-ready") },
  ];
}
export function dialogueNextLabel(lastPage: boolean, talking: boolean, crossing: boolean) {
  return !lastPage
    ? "다음"
    : talking && !crossing
      ? "질문 고르기"
      : crossing
        ? "구조 계속하기"
        : "현장으로 돌아가기";
}
