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
    title: "마지막 상영",
    tag: "1인 수사·추리 게임 · 한국어",
    image: { src: "/assets/last-screening/cover.webp", alt: "마지막 상영의 극장 입구", width: 1440, height: 810 },
    paragraphs: [
      ["마지막 영업을 마친 모서리 극장의 영사실에서 대표가 숨진 채 발견됐다. 형사 정해온이 되어 극장에 남은 사람들을 만나고 현장과 자료를 조사한다."],
      ["수집한 단서로 판단과 근거를 제시하고, 부족한 정보를 다시 조사하며 사건을 해결한다."],
    ],
    href: "/games/last-screening",
    play: { href: "/assets/last-screening/index.html", label: "게임 시작하기", kind: "document" },
  },
} satisfies Record<string, FeaturedGame>;
export type FeaturedGameId = keyof typeof featuredGames;
