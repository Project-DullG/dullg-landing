import dictionary from "./en.json" with { type: "json" };
import interfaceDictionary from "./en-interface.json" with { type: "json" };
export type Locale = "ko" | "en";
const decodeText = (text: string) =>
  text
    .replace(/&nbsp;/g, "\u00a0")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
export const normalizeText = (text: string) => decodeText(text).replace(/\s+/g, " ").trim();
const messages: Record<string, string> = Object.fromEntries(
  Object.entries({ ...dictionary, ...interfaceDictionary }).map(([key, value]) => [
    normalizeText(key),
    value,
  ]),
);
export function translateText(text: string, locale: string): string {
  text = decodeText(text);
  if (locale !== "en" || !/[가-힣]/.test(text)) return text;
  const key = normalizeText(text);
  if (messages[key] !== undefined) return messages[key];
  const patterns: [RegExp, (...groups: string[]) => string][] = [
    [/^(.*) 상세 보기$/, (name) => `View ${translateText(name, locale)}`],
    [/^(.*) 캐릭터$/, (name) => `${translateText(name, locale)} character`],
    [/^에피소드 (\d+)$/, (n) => `Episode ${n}`],
    [/^(\d+)쪽 크게 보기 \(새 창\)$/, (n) => `Open slide ${n} in a new window`],
    [
      /^(초등|중등|고등) (\d+)학년$/,
      (level, n) =>
        `${({ 초등: "Elementary", 중등: "Middle school", 고등: "High school" } as Record<string, string>)[level]} year ${n}`,
    ],
    [/^평균 ([\d.]+)점$/, (n) => `Average ${n} points`],
    [
      /^(.*) 작품 예고편, (\d+)초$/,
      (name, sec) => `${translateText(name, locale)} trailer, ${sec} seconds`,
    ],
    [
      /^(.*) 공식 소개 · 이야기와 등장인물, 게임 구성 \((\d+)\/(\d+)\)$/,
      (name, i, n) =>
        `${translateText(name, locale)} original Korean story, characters, and components (${i}/${n})`,
    ],
    [/^카드 한 장 뽑기, (\d+)장 남음$/, (n) => `Draw a card, ${n} remaining`],
    [
      /^([♠♥♣♦]) A 더미, (.*)$/,
      (suit, value) => `${suit} foundation, ${translateText(value, locale)}`,
    ],
    [/^(\d+)번째 열, (.*)$/, (n, card) => `Column ${n}, ${translateText(card, locale)}`],
    [
      /^(하트|스페이드|클로버|다이아) (A|[2-9]|10|J|Q|K)$/,
      (suit, rank) =>
        `${rank} of ${({ 하트: "hearts", 스페이드: "spades", 클로버: "clubs", 다이아: "diamonds" } as Record<string, string>)[suit]}`,
    ],
    [
      /^(\d+)번 만에 여섯 쌍을 모두 찾았습니다\.$/,
      (n) => `You found all six pairs in ${n} attempts.`,
    ],
    [/^(.*), 짝을 찾음$/, (name) => `${translateText(name, locale)}, matched`],
    [/^(\d+)번 이동해 퍼즐을 완성했습니다\.$/, (n) => `You solved the puzzle in ${n} moves.`],
    [/^다시 확인할 숫자가 (\d+)개 있습니다\.$/, (n) => `${n} numbers need another look.`],
    [/^입력한 수 (\d+)$/, (n) => `Entered number ${n}`],
    [/^(.*), 확인 필요$/, (value) => `${translateText(value, locale)}, check this cell`],
    [
      /^(.*) 선택 · 옮길 열이나 A 더미를 누르세요\.$/,
      (card) => `${translateText(card, locale)} selected · Choose a column or foundation.`,
    ],
    [
      /^([♠♥♣♦]) A 더미로 옮길 수 있습니다\.$/,
      (suit) => `Move this card to the ${suit} foundation.`,
    ],
    [/^(\d+)번째 열로 옮길 수 있습니다\.$/, (n) => `Move this card to column ${n}.`],
    [/^뽑은 카드 (.*)$/, (card) => `Drawn card: ${translateText(card, locale)}`],
    [/^(\d+)번째 빈 열, K 놓기$/, (n) => `Empty column ${n}, place a King`],
    [/^주변 지뢰 (\d+)개$/, (n) => `${n} adjacent mines`],
    [/^주어진 수 (\d+)$/, (n) => `Given number ${n}`],
    [/^(\d+)번 카드, (.*)$/, (n, card) => `Card ${n}, ${translateText(card, locale)}`],
    [/^(\d+), (\d+)행 (\d+)열$/, (n, row, col) => `${n}, row ${row}, column ${col}`],
    [
      /^(왼쪽|오른쪽|위|아래)(으로|로) 이동$/,
      (d) =>
        `Move ${({ 왼쪽: "left", 오른쪽: "right", 위: "up", 아래: "down" } as Record<string, string>)[d]}`,
    ],
    [/^레벨 (\d+)$/, (n) => `Level ${n}`],
    [/^(\d+)줄 뒤 속도 증가$/, (n) => `Speed increases in ${n} lines`],
    [/^(\d+)줄 삭제$/, (n) => `${n} lines cleared`],
    [/^남은 공 (\d+)개 · 다시 발사하세요$/, (n) => `${n} balls left · Launch again`],
    [/^(\d+)초$/, (n) => `${n}s`],
    [/^예시 학생 (\d+)$/, (n) => `Example student ${n}`],
    [
      /^(\d+)차시 \(참여도: (.*)\)$/,
      (n, p) => `Lesson ${n} (participation: ${translateText(p, locale)})`,
    ],
    [
      /^(.*) 게임판\. 시작 후 방향키로 조작합니다\. P 또는 Escape로 일시정지합니다\.$/,
      (name) =>
        `${translateText(name, locale)} board. Use arrow keys after starting. P or Escape pauses.`,
    ],
    [/^(.*) 게임 화면$/, (name) => `${translateText(name, locale)} game screen`],
    [/^(\d+)개 제거 · (\d+)연쇄$/, (count, combo) => `${count} cleared · ${combo} cascades`],
    [
      /^(\d+)행 (\d+)열, (.*)$/,
      (row, col, value) => `Row ${row}, column ${col}, ${translateText(value, locale)}`,
    ],
    [/^(\d+)행 (\d+)열$/, (row, col) => `Row ${row}, column ${col}`],
    [
      /^(\d+)년 (\d+)월 (\d+)일$/,
      (year, month, day) => `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
    ],
    [/^(\d+)년 (\d+)월$/, (year, month) => `${year}-${month.padStart(2, "0")}`],
    [/^(\d+)차시$/, (n) => `Lesson ${n}`],
    [/^(\d+)쪽$/, (n) => `Page ${n}`],
    [/^(\d+)점$/, (n) => `${n} points`],
    [/^(\d+)명$/, (n) => `${n} people`],
    [/^(\d+)종$/, (n) => `${n} games`],
    [/^(\d+)분$/, (n) => `${n} min`],
    [/^(\d+)인$/, (n) => `${n} players`],
    [/^([\d,]+)원$/, (n) => `₩${n}`],
    [/^([\d,]+)점$/, (n) => `${n} points`],
    [
      /^(.*) 소개 이미지 (\d+) 크게 보기 \(새 탭\)$/,
      (name, n) => `Open ${translateText(name, locale)} introduction image ${n} in a new tab`,
    ],
    [
      /^(.*) 상세 소개 · 이야기와 등장인물, 게임 구성 \((\d+)\/(\d+)\)$/,
      (name, i, n) =>
        `${translateText(name, locale)} original Korean story, characters, and components (${i}/${n})`,
    ],
    [/^(.*) 규칙서 표지$/, (name) => `${translateText(name, locale)} classroom rulebook cover`],
    [/^(.*) 게임판 구성$/, (name) => `${translateText(name, locale)} board layout`],
    [/^(.*) 게임 화면 구성$/, (name) => `${translateText(name, locale)} game layout`],
    [/^(.*) 플레이$/, (name) => `Play ${translateText(name, locale)}`],
    [
      /^(.*) 공식 소개 이미지 (\d+)$/,
      (name, n) => `${translateText(name, locale)} official introduction, image ${n}`,
    ],
    [/^(.*)님의 성적$/, (name) => `Scores for ${name}`],
    [/^(.*)까지$/, (date) => `Until ${translateText(date, locale)}`],
  ];
  for (const [pattern, format] of patterns) {
    const match = key.match(pattern);
    if (match) return format(...match.slice(1));
  }
  // Match complete editorial phrases first, then stable labels in composed captions.
  for (const separator of [" · ", " → ", " / ", " | ", " — ", "\n"]) {
    if (key.includes(separator))
      return key
        .split(separator)
        .map((part) => translateText(part, locale))
        .join(separator);
  }
  return text;
}
export function translateValue<T>(value: T, locale: string): T {
  if (typeof value === "string") return translateText(value, locale) as T;
  if (Array.isArray(value)) return value.map((part) => translateValue(part, locale)) as T;
  return value;
}
export function localizedPath(href: string, locale: string) {
  if (
    !href.startsWith("/") ||
    href.startsWith("//") ||
    /^\/(?:api|assets|_next|speaking|logout)(?:\/|$)/.test(href) ||
    /\.[a-z0-9]+(?:[?#]|$)/i.test(href)
  )
    return href;
  const path = href.replace(/^\/en(?=\/|[?#]|$)/, "") || "/";
  return locale === "en" ? `/en${path === "/" ? "" : path}` : path;
}
