export type FeaturedGame = {
  title: string;
  tag: string;
  image: { src: string; alt: string; width: number; height: number };
  paragraphs: string[][];
  href: string;
  play: { href: string; label: string; kind: "page" | "document" };
};
export const featuredGames = {
  "last-screening": {
    title: "잔향 탐정",
    tag: "1인 수사·추리 게임 · 한국어",
    image: { src: "/assets/last-screening/cover.webp", alt: "잔향 탐정 대표 이미지", width: 1440, height: 810 },
    paragraphs: [
      ["정해온이 되어 인물의 진술과 현장 기록을 조사하는 추리 게임입니다. 사무소에서 의뢰를 받고, 확인한 단서를 근거로 사건을 해결합니다."],
      ["마지막 상영, 두 번 기록된 죽음, 규격 안의 사고 등 장편 사건 3편과 짧은 의뢰를 담았습니다."],
    ],
    href: "/games/last-screening",
    play: { href: "/assets/last-screening/index.html", label: "게임 시작하기", kind: "document" },
  },
} satisfies Record<string, FeaturedGame>;
export type FeaturedGameId = keyof typeof featuredGames;
