export type FeaturedGame = {
  title: string;
  tag: string;
  image: { src: string; alt: string; width: number; height: number };
  paragraphs: string[][];
  href: string;
  play: { href: string; label: string; kind: "page" | "document" };
};
export const featuredGames = {
  "tide-room": {
    title: "유리 너머의 목소리",
    tag: "1인 추리 · 한국어 · 초자연적 공포",
    image: {
      src: "/assets/tide-room/pier.webp",
      alt: "해 질 무렵, 섬의 관측소로 이어지는 부두",
      width: 1440,
      height: 960,
    },
    paragraphs: [
      [
        "돌아오겠다던 아버지가 사라졌다.",
        "그를 마지막으로 본 사람은 이미 배를 타고 떠났다고 말한다. 하지만 출항장부에는 그의 이름이 없다.",
      ],
      ["탐정이 되어 관측소를 조사하고, 문서와 증언이 서로 다른 이유를 밝혀라."],
    ],
    href: "/games/tide-room",
    play: { href: "/play/tide-room", label: "조사 시작하기", kind: "page" },
  },
  "discharge-day": {
    title: "퇴원일",
    tag: "1인 탈출 어드벤처 · 한국어",
    image: {
      src: "/assets/discharge-day/art/ward.webp",
      alt: "사람이 보이지 않는 병실",
      width: 1600,
      height: 900,
    },
    paragraphs: [
      [
        "수술이 끝나면 집에 갈 생각이었다. 의료시설에서 깨어나 방을 조사하고 장치를 복구하며, 문밖에서 무슨 일이 있었는지 확인한다.",
      ],
      ["발견한 기록을 읽고 떠날 방법을 선택한다. 결정에 따라 다섯 결말로 나뉜다."],
    ],
    href: "/games/discharge-day",
    play: { href: "/assets/discharge-day/index.html", label: "게임 시작하기", kind: "document" },
  },
} satisfies Record<string, FeaturedGame>;
export type FeaturedGameId = keyof typeof featuredGames;
