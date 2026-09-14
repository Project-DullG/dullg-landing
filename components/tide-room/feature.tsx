import { GameFeature } from "../game-feature";
export function TideFeature({ play = false }: { play?: boolean }) {
  return <GameFeature id="tide-room" play={play} />;
}
