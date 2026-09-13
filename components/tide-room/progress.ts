"use client";
import { useEffect, useRef, useState } from "react";
import {
  act,
  compactEvents,
  initialState,
  replay,
  SAVE_KEY,
  LEGACY_SAVE_KEY,
  type Result,
} from "./engine";

const readError = "저장한 진행 기록을 확인하지 못했다. 설정에서 저장 파일을 받아 두세요.";
const brokenError =
  "저장한 내용을 읽지 못했다. 설정에서 원본을 보관하거나 처음부터 시작할 수 있다.";
const writeError = "최근 진행을 저장하지 못했다. 설정에서 저장 파일을 받아 두세요.";
export function useProgress() {
  const [state, setState] = useState(initialState),
    [ready, setReady] = useState(false),
    [events, setEvents] = useState<string[]>([]),
    [notice, setNotice] = useState(""),
    [saveError, setSaveError] = useState<string | null>(null),
    [broken, setBroken] = useState<string | null>(null);
  const current = useRef(initialState()),
    history = useRef<string[]>([]),
    writable = useRef(false);
  useEffect(() => {
    let cancelled = false;
    // Read browser-only storage after hydration; discard work from an unmounted instance.
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (raw) {
          try {
            const save = replay(raw);
            current.current = save.state;
            history.current = compactEvents(save.events);
            setState(save.state);
            setEvents(history.current);
            writable.current = true;
            setNotice("저장한 지점부터 이어 할 수 있다.");
            setSaveError(null);
          } catch {
            writable.current = false;
            setBroken(raw);
            setNotice(brokenError);
            setSaveError(brokenError);
          }
        } else {
          writable.current = true;
          setNotice(
            localStorage.getItem(LEGACY_SAVE_KEY)
              ? "이전 판의 기록은 남아 있다. 이번 판은 처음부터 시작한다."
              : "진행 상황은 자동으로 저장된다.",
          );
          setSaveError(null);
        }
      } catch {
        setNotice(readError);
        setSaveError(readError);
      }
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  function persist(next: string[]) {
    if (!writable.current) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 2, events: next }));
      setNotice("진행 상황을 저장했다.");
      setSaveError(null);
    } catch {
      setNotice(writeError);
      setSaveError(writeError);
    }
  }
  function perform(id: string): Result {
    const result = act(current.current, id);
    if (!ready)
      return {
        state: current.current,
        text: "진행 기록을 읽고 있다. 잠시 뒤 다시 시도해 주세요.",
        speaker: "저장",
        accepted: false,
      };
    if (result.accepted) {
      const next = compactEvents([...history.current, id]);
      if (next.length > 6000)
        return {
          state: current.current,
          text: "진행 기록이 가득 차 더 진행할 수 없다. 설정에서 현재 기록을 저장 파일로 받아 두세요.",
          speaker: "저장",
          accepted: false,
        };
      current.current = result.state;
      history.current = next;
      setState(result.state);
      setEvents(next);
      persist(next);
    }
    return result;
  }
  function reset() {
    current.current = initialState();
    history.current = [];
    setState(current.current);
    setEvents([]);
    setBroken(null);
    writable.current = true;
    persist([]);
  }
  function restore(raw: string) {
    const saved = replay(raw),
      next = compactEvents(saved.events);
    current.current = saved.state;
    history.current = next;
    setState(saved.state);
    setEvents(next);
    setBroken(null);
    writable.current = true;
    persist(next);
  }
  return {
    state,
    ready,
    events,
    notice,
    saveError,
    broken,
    perform,
    reset,
    restore,
  };
}
