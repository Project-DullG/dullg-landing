import { GameFeature } from "./game-feature";
export function DischargeFeature({ play = false }: { play?: boolean }) {
  return <GameFeature id="discharge-day" play={play} />;
}
