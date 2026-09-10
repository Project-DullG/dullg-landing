import { rng } from "./random.ts";
export type LightsState = { cells: boolean[]; moves: number; solution: number[]; won: boolean };
function neighbors(index: number) {
  return [
    index,
    index - 5,
    index + 5,
    ...(index % 5 ? [index - 1] : []),
    ...(index % 5 < 4 ? [index + 1] : []),
  ].filter((cell) => cell >= 0 && cell < 25);
}
export function toggleLights(state: LightsState, index: number): LightsState {
  if (state.won || index < 0 || index >= 25) return state;
  const cells = [...state.cells];
  neighbors(index).forEach((cell) => {
    cells[cell] = !cells[cell];
  });
  const solution = state.solution.includes(index)
    ? state.solution.filter((cell) => cell !== index)
    : [...state.solution, index];
  return { cells, solution, moves: state.moves + 1, won: !cells.some(Boolean) };
}
export function createLights(seed = 42): LightsState {
  const random = rng(seed),
    cells = Array<boolean>(25).fill(false),
    solution: number[] = [];
  for (let index = 0; index < 25; index++) {
    if (random() < 0.4) {
      solution.push(index);
      neighbors(index).forEach((cell) => {
        cells[cell] = !cells[cell];
      });
    }
  }
  if (!cells.some(Boolean)) {
    neighbors(12).forEach((cell) => {
      cells[cell] = !cells[cell];
    });
    const index = solution.indexOf(12);
    if (index < 0) solution.push(12);
    else solution.splice(index, 1);
  }
  return { cells, moves: 0, solution, won: false };
}
