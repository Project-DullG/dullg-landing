"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Place } from "./content";
export function useAmbience(enabled: boolean, place: Place, volume: number) {
  const [error, setError] = useState("");
  useEffect(() => {
    if (!enabled) return;
    let ctx: AudioContext | undefined;
    let cleanup = () => {};
    let cancelled = false;
    try {
      ctx = new AudioContext();
      const active = ctx;
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 5, ctx.sampleRate),
        data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = place === "pier" ? 450 : place === "records" ? 140 : 230;
      const gain = ctx.createGain();
      gain.gain.value = (volume / 100) * 0.15;
      const swell = ctx.createOscillator(),
        swellGain = ctx.createGain();
      swell.frequency.value = 0.14;
      swellGain.gain.value = (volume / 100) * 0.05;
      swell.connect(swellGain);
      swellGain.connect(gain.gain);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start();
      swell.start();
      const resume = () =>
        void active
          .resume()
          .then(() => {
            if (!cancelled) setError("");
          })
          .catch(
            () =>
              !cancelled &&
              setError("브라우저가 환경음 재생을 막았다. 소리를 껐다가 다시 켤 수 있다."),
          );
      const visibility = () => {
        if (document.hidden) void active.suspend().catch(() => {});
        else resume();
      };
      document.addEventListener("visibilitychange", visibility);
      resume();
      cleanup = () => {
        document.removeEventListener("visibilitychange", visibility);
        void active.close().catch(() => {});
      };
    } catch {
      queueMicrotask(() => {
        if (!cancelled) setError("이 브라우저에서는 환경음을 재생하지 못했다.");
      });
      void ctx?.close().catch(() => {});
    }
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [enabled, place, volume]);
  return enabled ? error : "";
}

// Keep one media element for the whole visit: moving rooms must not restart the song.
export function useBackgroundMusic(enabled: boolean, volume: number) {
  const media = useRef<HTMLAudioElement | null>(null);
  const alive = useRef(true);
  const attempt = useRef(0);
  const [error, setError] = useState("");
  const startFromGesture = useCallback(() => {
    const ticket = ++attempt.current;
    try {
      if (!media.current || media.current.error) {
        if (media.current) {
          media.current.onerror = null;
          media.current.pause();
          media.current.removeAttribute("src");
          media.current.load();
        }
        const track = new Audio("/assets/tide-room/ink-in-the-files.m4a");
        track.loop = true;
        track.preload = "none";
        track.onerror = () => {
          if (alive.current && media.current === track)
            setError("음악을 재생하지 못했다. 소리 버튼을 껐다가 다시 켜 주세요.");
        };
        media.current = track;
      }
      const track = media.current;
      track.volume = (Math.max(0, Math.min(100, volume)) / 100) * 0.32;
      if (!track.paused) return;
      void track
        .play()
        .then(() => {
          if (alive.current && attempt.current === ticket) setError("");
        })
        .catch((reason: unknown) => {
          if (reason instanceof DOMException && reason.name === "AbortError") return;
          if (alive.current && attempt.current === ticket)
            setError("음악을 재생하지 못했다. 소리 버튼을 껐다가 다시 켜 주세요.");
        });
    } catch {
      if (alive.current) setError("이 브라우저에서는 배경음악을 재생하지 못했다.");
    }
  }, [volume]);
  useEffect(() => {
    const update = () => {
      if (enabled && !document.hidden) startFromGesture();
      else {
        attempt.current++;
        media.current?.pause();
      }
    };
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, [enabled, startFromGesture]);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      // oxlint-disable-next-line react-hooks/exhaustive-deps -- Invalidate every outstanding play request, including those started after this effect mounted.
      attempt.current++;
      // oxlint-disable-next-line react-hooks/exhaustive-deps -- This owned media element is created lazily and may be replaced after the effect mounts.
      const track = media.current;
      if (track) {
        track.onerror = null;
        track.pause();
        track.removeAttribute("src");
        track.load();
        media.current = null;
      }
    };
  }, []);
  return { error: enabled ? error : "", startFromGesture };
}
