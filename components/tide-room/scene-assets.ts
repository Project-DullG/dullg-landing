"use client";
import { useEffect } from "react";
import { places, type Person } from "./content";
import { has, npcPlace, type State } from "./engine";
import { detailImages, roomOrder, backdrop } from "./presentation";
export const roomSmallImage = (src: string) => src.replace(/\.webp$/, "-small.webp");
export const portraitImage = (id: Person, thumb = false) =>
  id === "elliot" ? null : `/assets/tide-room/${id}-cutout${thumb ? "-thumb" : ""}.webp`;
export const detailThumb = (id: string) => detailImages[id]?.src.replace(/\.webp$/, "-thumb.webp");
// Only warm adjacent rooms and relevant scene states after the visible room has loaded.
export function nextSceneImages(state: State, small: boolean) {
  const index = roomOrder.indexOf(state.place);
  const rooms = roomOrder
    .filter((_, i) => Math.abs(i - index) === 1)
    .map((p) =>
      p === "observatory" ? "/assets/tide-room/observatory-closed.webp" : places[p].image,
    );
  if (state.place === "observatory" && has(state, "closure")) {
    rooms.push(
      "/assets/tide-room/observatory-water.webp",
      "/assets/tide-room/observatory-listening.webp",
      "/assets/tide-room/observatory-closed.webp",
    );
    if (has(state, "response"))
      rooms.push(places.observatory.image, "/assets/tide-room/chamber.webp");
  }
  const portraits = (["clara", "mara", "jonah"] as const)
    .filter((id) => npcPlace(state, id) === state.place)
    .map((id) => portraitImage(id)!);
  return [
    ...new Set([
      ...rooms
        .filter((src) => src !== backdrop(state))
        .map((src) => (small ? roomSmallImage(src) : src)),
      ...portraits,
    ]),
  ];
}
const warmed = new Set<string>();
export function useScenePreload(state: State, ready: boolean) {
  const plan = nextSceneImages(state, false).join("|");
  useEffect(() => {
    if (!ready) return;
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    if (connection?.saveData || ["slow-2g", "2g"].includes(connection?.effectiveType || "")) return;
    let cancelled = false;
    const small = window.matchMedia("(max-width: 720px)").matches;
    const urls = plan
      .split("|")
      .filter(Boolean)
      .map((src) =>
        small && !/\/(clara|mara|jonah)-cutout\.webp$/.test(src) ? roomSmallImage(src) : src,
      );
    const timer = setTimeout(async () => {
      for (const src of urls) {
        if (cancelled) break;
        if (warmed.has(src)) continue;
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.fetchPriority = "low";
          let settled = false;
          const done = (success: boolean) => {
            if (settled) return;
            settled = true;
            clearTimeout(timeout);
            img.onload = img.onerror = null;
            if (success) warmed.add(src);
            resolve();
          };
          const timeout = setTimeout(() => done(false), 8000);
          img.onload = () => done(img.naturalWidth > 0);
          img.onerror = () => done(false);
          img.src = src;
          if (img.complete) done(img.naturalWidth > 0);
        });
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [plan, ready]);
}
