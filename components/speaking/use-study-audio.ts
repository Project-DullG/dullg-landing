"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { speechText } from "@/lib/speaking/audio-text";

export type AudioClip = { text: string; src: string; kind: "ai" | "human" } | null;
export function useStudyAudio() {
  const [playing, setPlaying] = useState("");
  const [error, setError] = useState("");
  const [reentryRequired, setReentryRequired] = useState(false);
  const [rate, setRate] = useState(1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceName, setVoiceName] = useState("");
  const serial = useRef(0),
    audio = useRef<HTMLAudioElement | null>(null),
    utterance = useRef<SpeechSynthesisUtterance | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accessCheck = useRef<AbortController | null>(null);
  const stop = useCallback(() => {
    serial.current++;
    accessCheck.current?.abort();
    accessCheck.current = null;
    if (timeout.current) clearTimeout(timeout.current);
    if (audio.current) {
      audio.current.onended = null;
      audio.current.onerror = null;
      audio.current.pause();
      audio.current.removeAttribute("src");
      audio.current.load();
      audio.current = null;
    }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    utterance.current = null;
    setPlaying("");
    setError("");
    setReentryRequired(false);
  }, []);
  useEffect(() => {
    const load = () => {
      const list =
        "speechSynthesis" in window
          ? window.speechSynthesis.getVoices().filter((v) => /^en/i.test(v.lang))
          : [];
      const score = (v: SpeechSynthesisVoice) =>
        (v.lang.toLowerCase() === "en-us" ? 100 : 0) +
        (/premium|enhanced|natural|neural/i.test(v.name) ? 30 : 0) +
        (/google|samantha|ava|jenny/i.test(v.name) ? 10 : 0);
      list.sort((a, b) => score(b) - score(a));
      setVoices(list);
      setVoiceName((old) => (list.some((v) => v.name === old) ? old : list[0]?.name || ""));
    };
    const frame = requestAnimationFrame(load);
    const hidden = () => {
      if (document.hidden) stop();
    };
    document.addEventListener("visibilitychange", hidden);
    if ("speechSynthesis" in window) window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", hidden);
      if ("speechSynthesis" in window)
        window.speechSynthesis.removeEventListener("voiceschanged", load);
      stop();
    };
  }, [stop]);
  function play(text: string, clip: AudioClip = null, count = 1) {
    stop();
    setError("");
    if (!text.trim()) return;
    if (clip && clip.text !== text) {
      setError("이 문장과 제작 음성의 원고가 일치하지 않아 재생을 중단했습니다.");
      return;
    }
    const id = serial.current;
    let remaining = Math.min(2, Math.max(1, count));
    const fail = () => {
      if (serial.current !== id) return;
      stop();
      setError(
        clip
          ? "제작 음성을 재생하지 못했습니다. 인터넷 연결을 확인한 뒤 듣기를 다시 눌러 주세요."
          : "기기 음성을 재생하지 못했습니다. 기기의 영어 음성 설정을 확인한 뒤 다시 눌러 주세요.",
      );
      if (clip) {
        const failedAttempt = serial.current;
        const abort = new AbortController();
        accessCheck.current = abort;
        const limit = setTimeout(() => abort.abort(), 5000);
        void fetch(clip.src, { method: "HEAD", cache: "no-store", signal: abort.signal })
          .then((response) => {
            if (abort.signal.aborted || serial.current !== failedAttempt) return;
            if (response.status === 401) {
              setReentryRequired(true);
              setError("접속 시간이 만료됐습니다. 다시 입장한 뒤 음성을 들을 수 있어요.");
            }
          })
          .catch(() => {})
          .finally(() => {
            clearTimeout(limit);
            if (accessCheck.current === abort) accessCheck.current = null;
          });
      }
    };
    const watch = () => {
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(fail, Math.max(30000, (text.length * 180) / rate));
    };
    if (clip) {
      const player = new Audio(clip.src);
      audio.current = player;
      player.playbackRate = rate;
      player.preservesPitch = true;
      const run = () => {
        watch();
        void player.play().catch(fail);
      };
      player.onerror = fail;
      player.onended = () => {
        if (serial.current !== id) return;
        if (--remaining > 0) {
          player.currentTime = 0;
          run();
        } else stop();
      };
      setPlaying(text);
      run();
      return;
    }
    const voice = voices.find((v) => v.name === voiceName) || voices[0];
    if (!("speechSynthesis" in window) || !voice) {
      setError(
        "영어 음성을 찾지 못했습니다. 기기의 영어 음성을 설정하거나 발음 카드의 사전 음성을 이용하세요.",
      );
      return;
    }
    const run = () => {
      if (serial.current !== id) return;
      const u = new SpeechSynthesisUtterance(speechText(text));
      utterance.current = u;
      u.voice = voice;
      u.lang = voice.lang;
      u.rate = rate;
      u.onerror = fail;
      u.onend = () => {
        if (serial.current !== id) return;
        if (--remaining > 0) run();
        else stop();
      };
      watch();
      window.speechSynthesis.speak(u);
    };
    setPlaying(text);
    run();
  }
  return {
    playing,
    error,
    reentryRequired,
    rate,
    voices,
    voiceName,
    setRate,
    setVoiceName,
    play,
    stop,
  };
}
export type StudyAudio = ReturnType<typeof useStudyAudio>;
