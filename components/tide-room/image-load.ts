export type SceneImageStatus = "loading" | "ready" | "slow" | "error";
type ImageTarget = Pick<
  HTMLImageElement,
  "complete" | "naturalWidth" | "addEventListener" | "removeEventListener"
>;
type Clock = {
  set: (fn: () => void, ms: number) => unknown;
  clear: (id: unknown) => void;
};
const clock: Clock = {
  set: (fn, ms) => setTimeout(fn, ms),
  clear: (id) => clearTimeout(id as ReturnType<typeof setTimeout>),
};
// A server-rendered or cached image may complete before React attaches its onLoad handler.
export function watchSceneImage(
  image: ImageTarget,
  notify: (state: SceneImageStatus) => void,
  timer: Clock = clock,
) {
  let active = true;
  let handle: unknown;
  const clear = () => {
    if (handle !== undefined) timer.clear(handle);
    handle = undefined;
  };
  const detach = () => {
    image.removeEventListener("load", loaded);
    image.removeEventListener("error", failed);
  };
  const finish = (state: "ready" | "error") => {
    if (!active) return;
    active = false;
    clear();
    detach();
    notify(state);
  };
  const loaded = () => finish(image.naturalWidth > 0 ? "ready" : "error");
  const failed = () => finish("error");
  image.addEventListener("load", loaded);
  image.addEventListener("error", failed);
  if (image.complete) loaded();
  else {
    notify("loading");
    handle = timer.set(() => {
      handle = undefined;
      if (!active) return;
      if (image.complete) loaded();
      else notify("slow"); // Keep listening: a late success can still recover without a retry.
    }, 8000);
  }
  return () => {
    active = false;
    clear();
    detach();
  };
}
