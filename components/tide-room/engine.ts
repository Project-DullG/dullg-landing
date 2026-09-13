import prose from "./prose.json";
import { clueById, places, people, type Place, type Person } from "./content";
import dialogue from "./dialogue.json";
export type Ending = "dismantle" | "seal" | "withdraw";
export type State = {
  place: Place;
  found: string[];
  flags: string[];
  aim: "sea" | "arch" | "stairs";
  width: 0 | 1 | 2;
  rescue: 0 | 1 | 2 | 3;
  ending: Ending | null;
  signals: string[];
};
export type Action = {
  id: string;
  label: string;
  place?: Place;
  person?: Person;
  group: "look" | "talk" | "device" | "rescue" | "ending";
  needs?: string[];
  flags?: string[];
  once?: string;
  test?: (s: State) => boolean;
  text: string | ((s: State) => string);
  gain?: string[];
  set?: Partial<State>;
  mark?: string[];
};
export type Result = {
  state: State;
  text: string;
  speaker: string;
  accepted: boolean;
};
export const initialState = (): State => ({
  place: "pier",
  found: ["letter"],
  flags: [],
  aim: "sea",
  width: 0,
  rescue: 0,
  ending: null,
  signals: [],
});
export const has = (s: State, id: string) => s.found.includes(id);
export const flag = (s: State, id: string) => s.flags.includes(id);
const npc = (id: Person) => dialogue.characters.find((c) => c.id === id)!;
export const npcPlace = (s: State, id: Person): Place | null =>
  id === "mara"
    ? "observatory"
    : id === "clara"
      ? flag(s, "clara-ready")
        ? "observatory"
        : "records"
      : id === "jonah"
        ? flag(s, "jonah-invited")
          ? "observatory"
          : "pier"
        : has(s, "rescue") || (has(s, "response") && s.aim === "arch" && s.width >= 1)
          ? "observatory"
          : null;
export const endingText = prose.endings;

export function withdrawText(s: State) {
  const known = has(s, "response")
    ? prose.withdrawKnownTexts.response
    : flag(s, "question-heard")
      ? prose.withdrawKnownTexts.reply
      : has(s, "closure")
        ? prose.withdrawKnownTexts.closure
        : prose.withdrawKnownTexts.unknown;
  return known + "\n\n" + prose.endings.withdraw.text;
}
export function endingDescription(s: State) {
  if (!s.ending) return "";
  if (s.ending === "withdraw") return withdrawText(s);
  return (
    prose.endings[s.ending].text +
    (has(s, "elliot-account") ? "\n\n" + prose.elliotAccountEndingAppendix : "") +
    (flag(s, "mara-delay-heard") ? "\n\n" + prose.maraDelayEndingAppendix : "")
  );
}

export const actions: Action[] = [
  ...Object.values(clueById)
    .filter((c) => c.location)
    .map((c) => ({
      id: `inspect:${c.id}`,
      label: c.title,
      place: c.location,
      group: "look" as const,
      text: c.text,
      gain: [c.id],
    })),
  {
    id: "mara-departure",
    label: prose.actionLabels["mara-departure"],
    person: "mara",
    group: "talk",
    needs: ["departure"],
    test: (s) => !has(s, "closure"),
    text: prose.actionTexts["mara-departure"],
  },
  {
    id: "mara-rope",
    label: prose.actionLabels["mara-rope"],
    person: "mara",
    group: "talk",
    needs: ["rope"],
    test: (s) => !has(s, "closure") && !has(s, "log"),
    text: prose.actionTexts["mara-rope"],
  },
  {
    id: "mara-confess",
    label: prose.actionLabels["mara-confess"],
    person: "mara",
    group: "talk",
    needs: ["rope", "log"],
    once: "mara-confessed",
    flags: ["mara-evidence-shown"],
    text: prose.actionTexts["mara-confess"],
    gain: ["closure"],
    mark: ["mara-confessed"],
  },
  {
    id: "mara-choice",
    label: prose.actionLabels["mara-choice"],
    person: "mara",
    group: "talk",
    needs: ["closure", "safety"],
    text: prose.actionTexts["mara-choice"],
  },
  {
    id: "mara-delay",
    label: prose.actionLabels["mara-delay"],
    person: "mara",
    group: "talk",
    needs: ["closure"],
    text: prose.actionTexts["mara-delay"],
    mark: ["mara-delay-heard"],
  },
  {
    id: "clara-map",
    label: prose.actionLabels["clara-map"],
    person: "clara",
    group: "talk",
    needs: ["chart"],
    once: "map-read",
    flags: ["map-aligned"],
    text: prose.actionTexts["clara-map"],
    gain: ["bearing"],
    mark: ["map-read"],
  },
  {
    id: "clara-letter",
    label: prose.actionLabels["clara-letter"],
    person: "clara",
    group: "talk",
    test: (s) => !has(s, "rescue"),
    text: prose.actionTexts["clara-letter"],
  },
  {
    id: "jonah-brother",
    label: prose.actionLabels["jonah-brother"],
    person: "jonah",
    group: "talk",
    once: "funeral-shown",
    text: prose.actionTexts["jonah-brother"],
    gain: ["funeral"],
    mark: ["funeral-shown"],
  },
  {
    id: "jonah-invite",
    label: prose.actionLabels["jonah-invite"],
    person: "jonah",
    group: "talk",
    needs: ["response", "echo"],
    once: "jonah-invited",
    text: prose.actionTexts["jonah-invite"],
    mark: ["jonah-invited"],
  },
  {
    id: "jonah-confess",
    label: prose.actionLabels["jonah-confess"],
    person: "jonah",
    place: "observatory",
    group: "talk",
    needs: ["funeral", "echo", "response", "old-notes"],
    flags: ["jonah-invited"],
    once: "jonah-confessed",
    test: (s) => s.aim === "arch" && s.width === 1,
    text: prose.actionTexts["jonah-confess"],
    gain: ["pin-confession"],
    mark: ["jonah-confessed"],
  },
  {
    id: "clara-ready",
    label: prose.actionLabels["clara-ready"],
    person: "clara",
    group: "talk",
    needs: ["response", "bearing"],
    once: "clara-ready",
    text: prose.actionTexts["clara-ready"],
    mark: ["clara-ready"],
  },
  {
    id: "mara-ready",
    label: prose.actionLabels["mara-ready"],
    person: "mara",
    group: "talk",
    needs: ["pin-confession", "safety"],
    once: "mara-ready",
    text: prose.actionTexts["mara-ready"],
    mark: ["mara-ready"],
  },
  {
    id: "jonah-ready",
    label: prose.actionLabels["jonah-ready"],
    person: "jonah",
    group: "talk",
    needs: ["pin-confession"],
    once: "jonah-ready",
    text: prose.actionTexts["jonah-ready"],
    mark: ["jonah-ready"],
  },
  {
    id: "elliot-condition",
    label: prose.actionLabels["elliot-condition"],
    person: "elliot",
    group: "talk",
    needs: ["response"],
    test: (s) => !has(s, "rescue") && s.aim === "arch" && s.width === 1,
    text: prose.actionTexts["elliot-condition"],
  },
  ...(["sea", "arch", "stairs"] as const).map((aim, i) => ({
    id: `aim:${aim}`,
    label: ["물결 표식", "사각형 표식", "계단 표식"][i],
    place: "observatory" as const,
    group: "device" as const,
    needs: ["closure", "safety"],
    test: (s: State) => s.rescue === 0 && s.width < 2,
    text: (s: State) =>
      s.width === 0
        ? prose.actionTextVariants.aim.closed.replace("{mark}", ["물결", "사각형", "계단"][i])
        : prose.actionTextVariants.aim[aim],
    set: { aim },
  })),
  {
    id: "listen",
    label: prose.actionLabels["listen"],
    place: "observatory",
    group: "device",
    needs: ["closure", "safety"],
    test: (s) => s.width < 2 && s.rescue === 0,
    text: (s) =>
      prose.actionTextVariants.listen.base +
      "\n\n" +
      (s.aim === "arch"
        ? prose.actionTextVariants.listen.arch
        : prose.actionTextVariants.listen.other),
    gain: ["echo"],
    set: { width: 1 },
  },
  {
    id: "question-response",
    label: prose.actionLabels["question-response"],
    place: "observatory",
    group: "device",
    test: (s) => s.aim === "arch" && s.width === 1,
    once: "question-heard",
    text: (s) =>
      s.signals.length >= 2
        ? prose.actionTexts["question-response"]
        : prose.actionTexts["question-only"],
    mark: ["question-heard"],
  },
  {
    id: "open-rescue",
    label: prose.actionLabels["open-rescue"],
    place: "observatory",
    group: "rescue",
    needs: ["response", "safety", "pin-confession"],
    flags: ["clara-ready", "mara-ready", "jonah-ready"],
    test: (s) => s.rescue === 0 && s.aim === "arch",
    text: prose.actionTexts["open-rescue"],
    set: { width: 2, rescue: 1 },
  },
  {
    id: "enter",
    label: prose.actionLabels["enter"],
    place: "observatory",
    group: "rescue",
    test: (s) => s.rescue === 1,
    text: prose.actionTexts["enter"],
    set: { rescue: 2 },
  },
  {
    id: "return",
    label: prose.actionLabels["return"],
    place: "observatory",
    group: "rescue",
    test: (s) => s.rescue === 2,
    text: prose.actionTexts["return"],
    set: { rescue: 3 },
  },
  {
    id: "close-rescue",
    label: prose.actionLabels["close-rescue"],
    place: "observatory",
    group: "rescue",
    test: (s) => s.rescue === 3 && !has(s, "rescue"),
    text: prose.actionTexts["close-rescue"],
    set: { width: 0 },
    gain: ["rescue"],
  },
  ...(["clara", "mara", "jonah", "elliot"] as Person[]).map((person) => ({
    id: `after:${person}`,
    label:
      person === "elliot"
        ? "요나에게 한 설명과 클라라의 도면 사용을 묻는다"
        : "귀환 뒤의 말을 듣는다",
    person,
    group: "talk" as const,
    needs: ["rescue"],
    gain: person === "elliot" ? ["elliot-account"] : [],
    text: () => prose.actionTexts[`after:${person}`],
  })),
  ...(["dismantle", "seal"] as const).map((ending) => ({
    id: `end:${ending}`,
    label:
      ending === "dismantle"
        ? "유리를 분해하고 파편을 밀폐한다"
        : "장치를 가리고 봉인해 조사에 넘긴다",
    place: "observatory" as const,
    group: "ending" as const,
    needs: ["rescue", "samples"],
    text: (s: State) => endingDescription({ ...s, ending }),
    set: { ending },
  })),
  {
    id: "end:withdraw",
    label: prose.actionLabels["end:withdraw"],
    place: "pier",
    group: "ending",
    test: (s) => !has(s, "rescue"),
    text: (s) => withdrawText(s),
    set: { ending: "withdraw" },
  },
];
export const actionById = Object.fromEntries(actions.map((a) => [a.id, a])) as Record<
  string,
  Action
>;
export function available(s: State, a: Action) {
  if (s.ending) return false;
  if (a.place && a.place !== s.place) return false;
  if (a.person && npcPlace(s, a.person) !== s.place) return false;
  if (a.once && flag(s, a.once)) return false;
  if (a.needs?.some((id) => !has(s, id)) || a.flags?.some((id) => !flag(s, id))) return false;
  if (s.width === 2 && a.group !== "rescue") return false;
  return a.test?.(s) ?? true;
}
// A reply is testimony. Only two different visual trials plus that reply
// complete the comparison, whichever action happens last.
function confirmResponse(s: State): State {
  if (has(s, "response") || !flag(s, "question-heard") || s.signals.length < 2) return s;
  return {
    ...s,
    found: [...s.found, "response"],
    flags: [...s.flags, "response-confirmed"],
  };
}
export function act(s: State, id: string): Result {
  const fail = (text: string): Result => ({
    state: s,
    text,
    speaker: "현장",
    accepted: false,
  });
  if (typeof id !== "string" || id.length > 80) return fail(prose.engineMessages.invalidAction);
  if (s.ending) return fail(prose.engineMessages.ended);
  if (id.startsWith("present:")) {
    const parts = id.split(":");
    if (parts.length !== 3) return fail("제시할 자료를 다시 골라야 한다.");
    const who = parts[1] as Person,
      ids = parts[2].split("+");
    if (
      !Object.hasOwn(people, who) ||
      npcPlace(s, who) !== s.place ||
      s.width === 2 ||
      ids.length < 1 ||
      ids.length > 2 ||
      new Set(ids).size !== ids.length ||
      ids.some((x) => !has(s, x))
    )
      return fail("지금 확인한 자료를 이곳의 인물에게 제시할 수 있다.");
    if (who === "mara" && !has(s, "closure") && ids.includes("rope") && ids.includes("log"))
      return act({ ...s, flags: [...s.flags, "mara-evidence-shown"] }, "mara-confess");
    if (who === "mara" && !has(s, "closure") && ids.includes("rope") && ids.includes("salt"))
      return fail(
        "마라는 줄 끝과 덮개에 남은 올을 번갈아 본다. “덮개에 끼인 모양은 맞네요.” 다만 이 줄이 잘린 날과 조작자는 아직 확인하지 못했다. 그날의 작업 기록과 대조해야 한다.",
      );
    if (who === "mara" && !has(s, "closure") && ids.includes("log"))
      return fail(
        "일지에는 베일이 들어간 뒤 덮개를 닫았다는 기록이 있다. 마라는 “당시 줄이 끊어졌습니다”라고 말한다. 부두에 남은 줄이 실제로 어떤 상태인지 보여 줄 필요가 있다.",
      );
    if (who === "mara" && !has(s, "closure") && ids.includes("departure"))
      return act(s, "mara-departure");
    if (who === "mara" && !has(s, "closure") && ids.includes("rope"))
      return fail(prose.actionTextVariants.present.ropeToMara);
    if (who === "mara" && has(s, "closure") && ids.includes("safety")) return act(s, "mara-choice");
    if (who === "clara" && ids.includes("letter") && !has(s, "rescue"))
      return act(s, "clara-letter");
    if (who === "clara" && ids.includes("chart"))
      return fail(
        has(s, "bearing")
          ? "클라라가 이미 맞춘 도면의 사각형을 짚는다. “이 표식이 마른 석실이에요. 해안선이 겹치는 곳을 보세요.”"
          : prose.actionTextVariants.present.chartToClara,
      );
    if (
      who === "jonah" &&
      ids.includes("response") &&
      ids.includes("echo") &&
      !flag(s, "jonah-invited")
    )
      return act(s, "jonah-invite");
    if (who === "jonah" && ids.includes("echo") && !has(s, "response"))
      return fail(
        "요나는 되풀이되는 말을 듣고 고개를 끄덕인다. “맞소. 동생이 마지막으로 했던 말이오. 말을 걸면 답도 합니까?” 요나에게 답하려면, 질문이나 신호를 바꿔도 상대가 대답하는지 먼저 알아봐야 한다.",
      );
    return fail(
      prose.actionTextVariants.present.unmatched
        .replaceAll("{person}", people[who].name)
        .replace("{clues}", ids.map((x) => clueById[x].title).join(" / ")),
    );
  }
  if (id.startsWith("map:")) {
    if (
      s.place !== "records" ||
      !has(s, "chart") ||
      flag(s, "map-read") ||
      npcPlace(s, "clara") !== "records" ||
      s.width === 2
    )
      return fail("기록실에서 클라라와 두 도면을 펼쳐야 한다.");
    const match = /^map:(0|90|180|270):(sea|arch|stairs)$/.exec(id);
    if (!match) return fail("도면의 방향과 표식을 선택해야 한다.");
    if (Number(match[1]) !== 270) return fail(prose.actionTextVariants.map.wrongRotation);
    if (match[2] !== "arch")
      return fail(
        match[2] === "stairs"
          ? prose.actionTextVariants.map.wrongStairs
          : prose.actionTextVariants.map.wrongSea,
      );
    return act({ ...s, flags: [...s.flags, "map-aligned"] }, "clara-map");
  }
  if (id.startsWith("signal-input:")) {
    const match = /^signal-input:([1-4]):([1-4])$/.exec(id);
    if (
      !match ||
      s.place !== "observatory" ||
      s.aim !== "arch" ||
      s.width !== 1 ||
      !has(s, "bearing") ||
      !has(s, "echo")
    )
      return fail("석실에 조준하고 빛이 통하는 폭으로 열어야 등불을 보낼 수 있다.");
    const pattern = `${match[1]}–${match[2]}`;
    const fill = (text: string) =>
      text.replaceAll("{first}", match[1]).replaceAll("{second}", match[2]);
    if (s.signals.includes(pattern))
      return fail(fill(prose.actionTextVariants["signal-input"].repeat));
    if (s.signals.length >= 2) return fail(prose.actionTextVariants["signal-input"].alreadyTwo);
    return {
      state: confirmResponse({ ...s, signals: [...s.signals, pattern] }),
      accepted: true,
      speaker: "등불 시험",
      text:
        fill(prose.actionTextVariants["signal-input"].successBase) +
        "\n\n" +
        (s.signals.length
          ? flag(s, "question-heard")
            ? prose.actionTexts["response-complete"]
            : prose.actionTextVariants["signal-input"].secondResult
          : prose.actionTextVariants["signal-input"].firstResult),
    };
  }
  if (id.startsWith("aperture:")) {
    if (s.place !== "observatory" || !has(s, "safety") || !has(s, "closure"))
      return fail("마라의 설명과 개방 시험표를 확인한 뒤 조작해야 한다.");
    const n = id.slice(9);
    if (n === "3")
      return fail(
        flag(s, "mara-ready")
          ? prose.actionTextVariants.aperture.blockedThreePinned
          : prose.actionTextVariants.aperture.blockedThreeUnpinned,
      );
    if (n === "2") {
      if (s.aim !== "arch")
        return fail("이쪽에는 물이 차 있다. 도면에서 확인한 마른 석실 쪽으로 조준해야 한다.");
      if (!available(s, actionById["open-rescue"]))
        return fail(
          has(s, "response") && !has(s, "pin-confession")
            ? "마라는 요나가 조절기에 다시 손댈까 염려한다. 요나와 기록과 응답을 함께 비교하고, 그가 통로를 넓히는 대신 안전줄을 맡겠다고 동의해야 한다."
            : "아직 통로를 넓힐 수 없다. 반대편 응답을 확인하고, 클라라의 등불·마라의 제한핀·요나의 안전줄 준비를 각각 확인해야 한다.",
        );
      return act(s, "open-rescue");
    }
    if (n === "1") return act(s, "listen");
    if (n === "0" && s.rescue === 1)
      return {
        state: { ...s, width: 0, rescue: 0 },
        text: "아직 아무도 건너지 않았다. 마라가 덮개를 닫고, 나는 허리띠에서 안전줄을 풀어 둔다. 세 사람은 각자 준비한 도구를 곁에 두고 기다린다.",
        speaker: "제어대",
        accepted: true,
      };
    if (n === "0" && s.width < 2)
      return {
        state: { ...s, width: 0 },
        text: prose.actionTextVariants.aperture.zero,
        speaker: "제어대",
        accepted: true,
      };
    return fail("사람과 줄이 통로에 남아 있다. 모두 돌아온 뒤 줄을 걷고 덮개를 닫아야 한다.");
  }

  if (id.startsWith("move:")) {
    const place = id.slice(5) as Place;
    if (!Object.hasOwn(places, place) || s.ending || s.width === 2)
      return {
        state: s,
        text: "구조 중에는 세 사람이 자리를 지켜야 한다. 건너기 전이라면 제어대에서 덮개를 닫고 준비를 멈출 수 있다. 이미 건넜다면 모두 돌아온 뒤 남은 줄을 회수해야 한다.",
        speaker: "현장",
        accepted: false,
      };
    return {
      state: { ...s, place },
      text: sceneText({ ...s, place }),
      speaker: places[place].title,
      accepted: true,
    };
  }
  const a = Object.hasOwn(actionById, id) ? actionById[id] : undefined;
  if (!a || !available(s, a))
    return {
      state: s,
      text: prose.engineMessages.notReady,
      speaker: "현장",
      accepted: false,
    };
  return {
    state: confirmResponse({
      ...s,
      ...a.set,
      found: [...new Set([...s.found, ...(a.gain || [])])],
      flags: [...new Set([...s.flags, ...(a.mark || [])])],
    }),
    text: typeof a.text === "function" ? a.text(s) : a.text,
    speaker: a.person ? people[a.person].name : a.group === "look" ? "조사 기록" : "현장",
    accepted: true,
  };
}
export function introduction(s: State, person: Person) {
  if (has(s, "rescue"))
    return person === "elliot"
      ? prose.introductionTexts.elliotAfterRescue
      : npc(person).afterRescue;
  if (person === "mara" && flag(s, "mara-ready")) return prose.introductionTexts.maraReady;
  if (person === "mara" && has(s, "closure")) return prose.introductionTexts.maraAfterConfession;
  if (person === "jonah" && has(s, "pin-confession"))
    return prose.introductionTexts.jonahAfterConfession;
  if (person === "jonah" && flag(s, "jonah-invited")) return prose.introductionTexts.jonahInvited;
  if (person === "clara" && flag(s, "clara-ready")) return prose.introductionTexts.claraReady;
  return npc(person).initial;
}
export function sceneText(s: State) {
  if (s.place === "observatory") {
    if (has(s, "rescue")) return prose.sceneTexts.observatoryAfterRescue;
    if (s.width === 2) return prose.sceneTexts.observatoryRescue;
    if (has(s, "response") && s.width === 1 && s.aim === "arch")
      return prose.sceneTexts.observatoryResponse;
  }
  if (s.place === "pier" && flag(s, "jonah-invited")) return prose.sceneTexts.pierJonahGone;
  if (s.place === "records" && flag(s, "clara-ready")) return prose.sceneTexts.recordsClaraGone;
  return prose.sceneTexts[s.place];
}
export function chapter(s: State) {
  return has(s, "rescue")
    ? ["귀환", "더 물어보고 장치를 처리한다"]
    : has(s, "response")
      ? ["구조", "세 사람과 구조를 준비한다"]
      : has(s, "closure")
        ? ["응답", "지금 하는 대답인지 확인한다"]
        : ["실종", "배로 떠났다는 말"];
}
export function hint(s: State) {
  if (has(s, "rescue")) return prose.hintTexts.afterRescue;
  if (s.width === 2) return prose.hintTexts.rescue;
  if (!has(s, "closure")) return prose.hintTexts.closure;
  if (!has(s, "response") && !has(s, "echo"))
    return [
      "마라는 덮개를 닫은 뒤에도 안쪽 사람과 대화했다고 말했다. 시험표를 읽고 직접 확인한다.",
      "기록실의 시험표는 덮개 눈금과 안전하게 여는 방법을 설명한다.",
      "관측실에서 제어대를 살펴 눈금 1로 연다. 반대편의 위치는 도면을 대조해서 확인한다.",
    ];
  if (!has(s, "response")) return prose.hintTexts.response;
  if (!has(s, "pin-confession")) return prose.hintTexts.jonah;
  return prose.hintTexts.preparation;
}
export const SAVE_KEY = "mmw-tide-room-progress-v2";
export const LEGACY_SAVE_KEY = "mmw-tide-room-progress-v1";
export function replay(raw: string): {
  state: State;
  events: string[];
  last?: Result;
} {
  if (raw.length > 1_000_000) throw new Error("save size");
  const parsed: unknown = JSON.parse(raw);
  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("version" in parsed) ||
    parsed.version !== 2 ||
    !("events" in parsed) ||
    !Array.isArray(parsed.events) ||
    parsed.events.length > 6000
  )
    throw new Error("save format");
  let state = initialState();
  let last: Result | undefined;
  const events: string[] = [];
  for (const id of parsed.events) {
    if (typeof id !== "string" || id.length > 80) throw new Error("save action");
    last = act(state, id);
    if (!last.accepted) throw new Error("invalid progression");
    state = last.state;
    events.push(id);
  }
  return { state, events, last };
}

// Remove revisits that return to the exact same knowledge and physical state.
// Newly learned facts and completed rescue steps can never be removed by this.
export function compactEvents(input: string[]): string[] {
  let state = initialState();
  const result: string[] = [];
  const keys = [JSON.stringify(state)];
  for (const id of input) {
    const next = act(state, id);
    if (!next.accepted) throw new Error("invalid progression");
    state = next.state;
    const key = JSON.stringify(state),
      seen = keys.indexOf(key);
    if (seen >= 0) {
      result.splice(seen);
      keys.splice(seen + 1);
    } else {
      result.push(id);
      keys.push(key);
    }
  }
  return result;
}
