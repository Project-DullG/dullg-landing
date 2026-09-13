import project from "./clues.json";
export type Place = "pier" | "records" | "observatory";
export type Person = "clara" | "mara" | "jonah" | "elliot";
export const places: Record<Place, { title: string; description: string; image: string }> = {
  pier: {
    title: "관측소 부두",
    description:
      "요나가 배를 부두에 묶은 줄을 살핀다. 관측소로 이어지는 계단에는 마른 소금이 붙어 있다.",
    image: "/assets/tide-room/pier.webp",
  },
  records: {
    title: "기록실",
    description:
      "석유등 옆에 관측일지가 펼쳐져 있다. 클라라는 벽에 걸린 해안 지도와 아버지가 남긴 도면을 번갈아 살핀다.",
    image: "/assets/tide-room/records.webp",
  },
  observatory: {
    title: "관측실",
    description:
      "황동 고리에 검은 유리가 끼워져 있고, 마라는 장치를 조절하는 손잡이 앞을 지킨다. 오른쪽에는 손잡이를 돌려 밧줄을 감는 윈치가 있다.",
    image: "/assets/tide-room/observatory.webp",
  },
};
export const people: Record<Person, { name: string; role: string }> = {
  clara: {
    name: "클라라 베일",
    role: "의뢰인 · 지도 제도사",
  },
  mara: {
    name: "마라 퀸",
    role: "관측소 기계 담당",
  },
  jonah: {
    name: "요나 리드",
    role: "뱃사공 · 인양 작업자",
  },
  elliot: {
    name: "엘리엇 베일",
    role: "유리 너머에서 자신을 밝힌 사람",
  },
};
export type Evidence = {
  id: string;
  title: string;
  source: string;
  text: string;
  location?: Place;
  x?: number;
  y?: number;
};
const clueLocations: Record<string, Pick<Evidence, "location" | "x" | "y">> = {
  departure: {
    location: "pier",
    x: 81,
    y: 39,
  },
  rope: {
    location: "pier",
    x: 76,
    y: 81,
  },
  log: {
    location: "records",
    x: 20,
    y: 67,
  },
  chart: {
    location: "records",
    x: 36,
    y: 28,
  },
  safety: {
    location: "records",
    x: 86,
    y: 66,
  },
  samples: {
    location: "records",
    x: 69,
    y: 73,
  },
  salt: {
    location: "observatory",
    x: 48,
    y: 74,
  },
  "old-notes": {
    location: "observatory",
    x: 16,
    y: 57,
  },
  "relic-notes": {
    location: "records",
    x: 58,
    y: 43,
  },
};
export const evidence: Evidence[] = project.clues.map((c) => ({
  id: c.id,
  title: c.title,
  source: c.carrier,
  text: c.observation,
  ...clueLocations[c.id],
}));
export const clueById = Object.fromEntries(evidence.map((c) => [c.id, c])) as Record<
  string,
  Evidence
>;
