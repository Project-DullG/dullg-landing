export const TILE_COLORS = ["blue", "yellow", "pink", "green", "red", "grey", "orange"];
export const spritePaths: Record<string, string> = {
  ...Object.fromEntries(
    TILE_COLORS.map((color, i) => [`tile${i + 1}`, `/assets/games/tiles/${color}.png`]),
  ),
  ball: "/assets/games/ball.png",
  bumper: "/assets/games/bumper.png",
  paddle: "/assets/games/paddle.png",
  player: "/assets/games/racing/player.png",
  traffic: "/assets/games/racing/traffic.png",
  tree: "/assets/games/racing/tree.png",
};
export type Sprites = Record<string, HTMLImageElement>;
export async function loadSprites(): Promise<Sprites> {
  const entries = await Promise.all(
    Object.entries(spritePaths).map(
      ([name, src]) =>
        new Promise<[string, HTMLImageElement | null]>((resolve) => {
          const img = new Image();
          img.onload = () => resolve([name, img]);
          img.onerror = () => resolve([name, null]);
          img.src = src;
        }),
    ),
  );
  return Object.fromEntries(
    entries.filter((entry): entry is [string, HTMLImageElement] => !!entry[1]),
  );
}
