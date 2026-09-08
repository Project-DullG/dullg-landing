import { shuffled } from "./random.ts";
export type Card = { id: number; suit: number; rank: number; up: boolean };
export type Solitaire = {
  stock: Card[];
  waste: Card[];
  columns: Card[][];
  foundations: Card[][];
  moves: number;
  won: boolean;
};
export type CardSource = { kind: "column" | "waste" | "foundation"; pile: number; index: number };
export type CardTarget = { kind: "column" | "foundation"; pile: number };
export const SUITS = ["♠", "♥", "♣", "♦"];
export const isRed = (card: Card) => card.suit === 1 || card.suit === 3;
export const cardName = (card: Card) =>
  `${["스페이드", "하트", "클로버", "다이아"][card.suit]} ${card.rank === 1 ? "A" : card.rank === 11 ? "J" : card.rank === 12 ? "Q" : card.rank === 13 ? "K" : card.rank}`;
export function createSolitaire(seed = 42): Solitaire {
  const deck = shuffled(
    Array.from({ length: 52 }, (_, id) => ({
      id,
      suit: Math.floor(id / 13),
      rank: (id % 13) + 1,
      up: false,
    })),
    seed,
  );
  const columns = Array.from({ length: 7 }, (_, col) =>
    Array.from({ length: col + 1 }, (_, i) => ({ ...deck.pop()!, up: i === col })),
  );
  return { stock: deck, waste: [], columns, foundations: [[], [], [], []], moves: 0, won: false };
}
export function drawCard(s: Solitaire): Solitaire {
  if (s.won || (!s.stock.length && !s.waste.length)) return s;
  const next = structuredClone(s);
  if (next.stock.length) next.waste.push({ ...next.stock.shift()!, up: true });
  else {
    next.stock = next.waste.map((card) => ({ ...card, up: false }));
    next.waste = [];
  }
  next.moves++;
  return next;
}
export function selectedCards(s: Solitaire, source: CardSource): Card[] {
  if (source.kind === "waste") return s.waste.length ? [s.waste.at(-1)!] : [];
  if (source.kind === "foundation")
    return s.foundations[source.pile]?.length ? [s.foundations[source.pile].at(-1)!] : [];
  return s.columns[source.pile]?.slice(source.index) ?? [];
}
export function canMoveCard(s: Solitaire, from: CardSource, to: CardTarget): boolean {
  if (s.won || (from.kind === to.kind && from.pile === to.pile)) return false;
  const cards = selectedCards(s, from),
    first = cards[0];
  if (!first || cards.some((c) => !c.up)) return false;
  if (from.kind === "column" && from.index < 0) return false;
  if (
    cards.some(
      (card, i) =>
        i > 0 && (cards[i - 1].rank !== card.rank + 1 || isRed(cards[i - 1]) === isRed(card)),
    )
  )
    return false;
  if (to.kind === "foundation") {
    const pile = s.foundations[to.pile];
    return !!pile && cards.length === 1 && first.suit === to.pile && first.rank === pile.length + 1;
  }
  const column = s.columns[to.pile];
  if (!column) return false;
  const top = column.at(-1);
  return top
    ? top.up && top.rank === first.rank + 1 && isRed(top) !== isRed(first)
    : first.rank === 13;
}
export function moveCard(s: Solitaire, from: CardSource, to: CardTarget): Solitaire {
  if (!canMoveCard(s, from, to)) return s;
  const next = structuredClone(s),
    cards = selectedCards(next, from);
  if (from.kind === "column") {
    next.columns[from.pile].splice(from.index);
    const top = next.columns[from.pile].at(-1);
    if (top) top.up = true;
  } else if (from.kind === "waste") next.waste.pop();
  else next.foundations[from.pile].pop();
  if (to.kind === "column") next.columns[to.pile].push(...cards);
  else next.foundations[to.pile].push(...cards);
  next.moves++;
  next.won = next.foundations.every((pile) => pile.length === 13);
  return next;
}
export function solitaireHint(s: Solitaire): { from: CardSource; to: CardTarget } | null {
  const sources: CardSource[] = [{ kind: "waste", pile: 0, index: 0 }];
  s.columns.forEach((col, pile) =>
    col.forEach((card, index) => {
      if (card.up) sources.push({ kind: "column", pile, index });
    }),
  );
  s.foundations.forEach((pile, index) => {
    if (pile.length) sources.push({ kind: "foundation", pile: index, index: 0 });
  });
  for (const kind of ["foundation", "column"] as const)
    for (const from of sources)
      for (let pile = 0; pile < (kind === "column" ? 7 : 4); pile++) {
        if (
          kind === "column" &&
          from.kind === "column" &&
          from.index === 0 &&
          !s.columns[pile].length
        )
          continue;
        const to = { kind, pile };
        if (canMoveCard(s, from, to)) return { from, to };
      }
  return null;
}
