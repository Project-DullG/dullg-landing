"use client";
import { useText } from "@/lib/i18n/use-text";
import { useState } from "react";
import {
  createSolitaire,
  drawCard,
  moveCard,
  canMoveCard,
  solitaireHint,
  selectedCards,
  cardName,
  SUITS,
  isRed,
  type Card,
  type CardSource,
  type CardTarget,
} from "@/lib/games/solitaire";
import { useTurnGame } from "./use-turn-game";
import { TableShell } from "./table-shell";
import styles from "./table.module.css";
const rank = (card: Card) =>
  card.rank === 1
    ? "A"
    : card.rank === 11
      ? "J"
      : card.rank === 12
        ? "Q"
        : card.rank === 13
          ? "K"
          : String(card.rank);
function Face({ card }: { card: Card }) {
  const t = useText();
  return (
    <>
      <span className={styles.cardCorner}>
        {t(rank(card))}
        <small>{t(SUITS[card.suit])}</small>
      </span>
      <span className={styles.cardSuit} aria-hidden="true">
        {t(SUITS[card.suit])}
      </span>
    </>
  );
}
export function SolitaireGame() {
  const t = useText();
  const game = useTurnGame(createSolitaire),
    s = game.state;
  const [selected, setSelected] = useState<CardSource | null>(null),
    [hint, setHint] = useState<CardTarget | null>(null),
    [notice, setNotice] = useState("");
  const same = (source: CardSource) =>
    selected?.kind === source.kind &&
    selected.pile === source.pile &&
    selected.index === source.index;
  const clear = () => {
    setSelected(null);
    setHint(null);
    setNotice("");
  };
  function target(to: CardTarget) {
    if (!selected) return;
    if (canMoveCard(s, selected, to)) {
      game.act((state) => moveCard(state, selected, to));
      clear();
    } else
      setNotice(
        to.kind === "foundation"
          ? "A부터 같은 무늬 순서로 올려주세요."
          : "색을 번갈아 큰 수 아래에 놓으세요. 빈 열에는 K만 놓을 수 있습니다.",
      );
  }
  function choose(source: CardSource) {
    if (same(source)) {
      clear();
      return;
    }
    if (
      selected &&
      source.kind === "column" &&
      !(selected.kind === "column" && selected.pile === source.pile)
    ) {
      target({ kind: "column", pile: source.pile });
      return;
    }
    setSelected(source);
    setNotice("");
    setHint(null);
  }
  const selectedName = selected ? selectedCards(s, selected)[0] : null;
  return (
    <TableShell
      title={t("솔리테어")}
      tone="felt"
      stats={[
        { label: "모은 카드", value: `${s.foundations.reduce((n, p) => n + p.length, 0)} / 52` },
        { label: "이동", value: s.moves },
      ]}
      onReset={() => {
        game.reset();
        clear();
      }}
      onUndo={() => {
        game.undo();
        clear();
      }}
      canUndo={game.canUndo}
      won={s.won}
      message={
        s.won
          ? "52장을 모두 정리했습니다."
          : notice ||
            (selectedName
              ? `${cardName(selectedName)} 선택 · 옮길 열이나 A 더미를 누르세요.`
              : "카드를 고른 뒤 옮길 열이나 A 더미를 누르세요.")
      }
      actions={
        <button
          type="button"
          disabled={s.won}
          onClick={() => {
            const move = solitaireHint(s);
            if (move) {
              setSelected(move.from);
              setHint(move.to);
              setNotice(
                `${move.to.kind === "foundation" ? `${SUITS[move.to.pile]} A 더미` : `${move.to.pile + 1}번째 열`}로 옮길 수 있습니다.`,
              );
            } else
              setNotice(
                s.stock.length || s.waste.length
                  ? "지금 옮길 카드가 없습니다. 뽑기에서 다음 카드를 확인하세요."
                  : "옮길 카드가 없습니다. 새 게임으로 다시 시작하세요.",
              );
          }}
        >
          {t("힌트")}
        </button>
      }
    >
      <div className={styles.solitaire}>
        <div className={styles.cardRow}>
          <button
            type="button"
            className={`${styles.card} ${s.stock.length ? styles.cardBack : styles.emptyCard}`}
            onClick={() => {
              game.act(drawCard);
              clear();
            }}
            disabled={s.won || (!s.stock.length && !s.waste.length)}
            aria-label={t(
              s.stock.length
                ? `카드 한 장 뽑기, ${s.stock.length}장 남음`
                : "뽑은 카드 다시 섞지 않고 되돌리기",
            )}
          >
            <span>{t(s.stock.length ? "뽑기" : "↻")}</span>
            <small>{t(s.stock.length || "다시")}</small>
          </button>
          {t(
            s.waste.length ? (
              <button
                type="button"
                className={`${styles.card} ${isRed(s.waste.at(-1)!) ? styles.red : ""} ${same({ kind: "waste", pile: 0, index: 0 }) ? styles.selectedCard : ""}`}
                onClick={() => choose({ kind: "waste", pile: 0, index: 0 })}
                aria-pressed={same({ kind: "waste", pile: 0, index: 0 })}
                aria-label={t(`뽑은 카드 ${cardName(s.waste.at(-1)!)}`)}
              >
                <Face card={s.waste.at(-1)!} />
              </button>
            ) : (
              <div className={styles.emptyCard} aria-label={t("뽑은 카드 없음")} />
            ),
          )}
          <div aria-hidden="true" />
          {t(
            s.foundations.map((pile, i) => {
              const card = pile.at(-1);
              return (
                <button
                  type="button"
                  key={i}
                  className={`${styles.card} ${card && isRed(card) ? styles.red : ""} ${!card ? styles.emptyCard : ""} ${(hint?.kind === "foundation" && hint.pile === i) || same({ kind: "foundation", pile: i, index: 0 }) ? styles.selectedCard : ""}`}
                  aria-pressed={same({ kind: "foundation", pile: i, index: 0 })}
                  aria-label={t(`${SUITS[i]} A 더미, ${card ? cardName(card) : "빈 더미"}`)}
                  onClick={() =>
                    same({ kind: "foundation", pile: i, index: 0 })
                      ? clear()
                      : selected
                        ? target({ kind: "foundation", pile: i })
                        : card && choose({ kind: "foundation", pile: i, index: 0 })
                  }
                >
                  {t(
                    card ? (
                      <Face card={card} />
                    ) : (
                      <span>
                        {t(SUITS[i])}
                        <small>A</small>
                      </span>
                    ),
                  )}
                </button>
              );
            }),
          )}
        </div>
        <div className={styles.columns}>
          {t(
            s.columns.map((column, pile) => (
              <div
                key={pile}
                className={`${styles.column} ${hint?.kind === "column" && hint.pile === pile ? styles.targetColumn : ""}`}
                style={{ minHeight: `${Math.max(1, column.length - 1) * 28 + 100}px` }}
              >
                {t(
                  !column.length && (
                    <button
                      type="button"
                      className={`${styles.card} ${styles.emptyCard}`}
                      aria-label={t(`${pile + 1}번째 빈 열, K 놓기`)}
                      onClick={() => target({ kind: "column", pile })}
                    >
                      K
                    </button>
                  ),
                )}
                {t(
                  column.map((card, index) => (
                    <button
                      type="button"
                      key={card.id}
                      style={{ top: index * 28 }}
                      className={`${styles.card} ${styles.stackedCard} ${!card.up ? styles.cardBack : isRed(card) ? styles.red : ""} ${selected?.kind === "column" && selected.pile === pile && index >= selected.index ? styles.selectedCard : ""}`}
                      disabled={!card.up || s.won}
                      aria-pressed={same({ kind: "column", pile, index })}
                      aria-label={t(
                        `${pile + 1}번째 열, ${card.up ? cardName(card) : "뒤집힌 카드"}`,
                      )}
                      onClick={() => choose({ kind: "column", pile, index })}
                    >
                      {t(
                        card.up ? (
                          <Face card={card} />
                        ) : (
                          <span className={styles.backMark} aria-hidden="true">
                            ◇
                          </span>
                        ),
                      )}
                    </button>
                  )),
                )}
              </div>
            )),
          )}
        </div>
      </div>
    </TableShell>
  );
}
