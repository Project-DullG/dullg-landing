import type { TableGameId } from "@/lib/mini-projects";
import { MinesGame } from "./table/mines-game";
import { SolitaireGame } from "./table/solitaire-game";
import { SudokuGame } from "./table/sudoku-game";
import { MergeGame } from "./table/merge-game";
import { MemoryGame } from "./table/memory-game";
import { SlidingGame } from "./table/sliding-game";
import styles from "./games.module.css";
export function TableGamePlayer({ kind }: { kind: TableGameId }) {
  const games = {
    minesweeper: MinesGame,
    solitaire: SolitaireGame,
    sudoku: SudokuGame,
    "number-merge": MergeGame,
    "memory-pairs": MemoryGame,
    "sliding-puzzle": SlidingGame,
  };
  const Component = games[kind];
  return (
    <div className={styles.tablePlayer}>
      <Component key={kind} />
    </div>
  );
}
