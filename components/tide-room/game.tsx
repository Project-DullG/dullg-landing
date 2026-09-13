"use client";
import { parseReaderState, type ReaderState } from "./reader-state";
import { useCallback, useEffect, useSyncExternalStore, useRef, useState } from "react";
import { Button } from "./ui";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "./ui";
import { Slider } from "./ui";
import {
  ArrowRight,
  BookOpen,
  Volume2,
  VolumeX,
  Settings,
  Map,
  Search,
  MessageCircle,
  SlidersHorizontal,
  ChevronRight,
  X,
  Download,
  Upload,
  Maximize,
  Eye,
  HelpCircle,
  Check,
  ArrowLeft,
  ChevronLeft,
  Hand,
  ZoomIn,
  CheckCheck,
} from "lucide-react";
import { places, people, evidence, clueById, type Person } from "./content";
import {
  actions,
  available,
  has,
  npcPlace,
  introduction,
  hint,
  endingText,
  endingDescription,
  type Result,
} from "./engine";
import { useProgress } from "./progress";
import { useAmbience, useBackgroundMusic } from "./audio";
import { useSoundEffects, soundForAction } from "./sound-effects";
import { useScenePreload, portraitImage } from "./scene-assets";
import { MapPuzzle, SignalPuzzle, DevicePanel, Text } from "./puzzles";
import prose from "./prose.json";
import "./tide-room.css";
import {
  backdrop,
  canCompare,
  detailImages,
  roomOrder,
  shortNames,
  toggleEvidence,
  ensureEvidence,
  objective,
  previousPlace,
  beforeEnding,
  rescueReadiness,
  dialogueNextLabel,
} from "./presentation";
import { EvidenceCard } from "./evidence-card";
import { EvidenceView } from "./evidence-view";
import { SceneBackdrop } from "./scene-backdrop";
import { CaseBrief } from "./case-brief";
import { GameGuide } from "./game-guide";
import { paginateText, openingBeats } from "./vn-reading";
import { InvestigationTutorial } from "./investigation-tutorial";
import { NovelReader } from "./novel-reader";
import type { SceneImageStatus } from "./image-load";

type Panel =
  | "guide"
  | "transcript"
  | "case"
  | "detail"
  | "compare"
  | "journal"
  | "map"
  | "device"
  | "signal"
  | "evidence"
  | "settings"
  | "help"
  | "objects"
  | null;
type Entry = { text: string; speaker: string; person?: Person };
const objectNames: Record<string, string> = {
  departure: "출항장부",
  rope: "부두에 놓인 밧줄",
  log: "펼쳐진 일지",
  chart: "벽의 도면",
  safety: "기계 시험표",
  samples: "유리 표본 기록",
  salt: "덮개 아래 흔적",
  "old-notes": "제어대의 수첩",
  "relic-notes": "번역 기록",
};
const portrait = portraitImage;
function download(raw: string, name: string) {
  const url = URL.createObjectURL(new Blob([raw], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function subscribeMotion(notify: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", notify);
  return () => mq.removeEventListener("change", notify);
}
function motionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
export default function TideRoomGame() {
  const { state, ready, events, notice, saveError, broken, perform, reset, restore } =
    useProgress();
  const [resumeInfo, setResumeInfo] = useState<ReaderState | null>(null);
  const [selectionNote, setSelectionNote] = useState("");
  const [journalQuery, setJournalQuery] = useState("");
  const [begun, setBegun] = useState(false),
    [intro, setIntro] = useState<number | null>(null),
    [introPage, setIntroPage] = useState(0),
    [readLog, setReadLog] = useState<{ speaker: string; text: string }[]>([]),
    [entry, setEntry] = useState<Entry | null>(null),
    [page, setPage] = useState(0),
    [person, setPerson] = useState<Person | null>(null),
    [panel, setPanel] = useState<Panel>(null),
    [clue, setClue] = useState("letter"),
    [selection, setSelection] = useState<string[]>([]),
    [selected, setSelected] = useState<string[]>([]),
    [compared, setCompared] = useState<string[]>(["rope", "salt"]),
    [panelHistory, setPanelHistory] = useState<Panel[]>([]),
    [hovered, setHovered] = useState(""),
    [discovery, setDiscovery] = useState(""),
    [sceneCue, setSceneCue] = useState(0),
    [confirm, setConfirm] = useState<string | null>(null),
    [hintLevel, setHintLevel] = useState(0),
    [sound, setSound] = useState(true),
    [volume, setVolume] = useState(60),
    [size, setSize] = useState(18),
    [showLabels, setShowLabels] = useState(true),
    [motionOverride, setReduced] = useState<boolean | null>(null),
    [artState, setArtState] = useState<{
      src: string;
      status: SceneImageStatus;
    }>({ src: "", status: "loading" }),
    [settingsNote, setSettingsNote] = useState("");
  // Presentation is restored only when its event history still matches the game save.
  const viewKey = "tide-room-reader-20260913-editorial";
  const preferencesKey = "tide-room-preferences-v1";
  const preferencesReady = useRef(false);
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const v = JSON.parse(localStorage.getItem(preferencesKey) || "{}");
        if (Number.isInteger(v.volume) && v.volume >= 0 && v.volume <= 100) setVolume(v.volume);
        if (Number.isInteger(v.size) && v.size >= 16 && v.size <= 24) setSize(v.size);
        if (typeof v.showLabels === "boolean") setShowLabels(v.showLabels);
        if (typeof v.motionOverride === "boolean") setReduced(v.motionOverride);
      } catch {
        /* Defaults remain usable if storage is unavailable. */
      }
      preferencesReady.current = true;
    });
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    if (!preferencesReady.current) return;
    try {
      localStorage.setItem(
        preferencesKey,
        JSON.stringify({ volume, size, showLabels, motionOverride }),
      );
    } catch {
      /* Progress storage reports its own errors. */
    }
  }, [volume, size, showLabels, motionOverride]);
  useEffect(() => {
    if (!begun || !ready || broken) return;
    try {
      localStorage.setItem(
        viewKey,
        JSON.stringify({
          events,
          intro,
          introPage,
          entry,
          page,
          person,
          readLog: readLog.slice(-300),
        }),
      );
    } catch {
      /* Reading position is optional; investigation progress is saved separately. */
    }
  }, [begun, ready, broken, events, intro, introPage, entry, page, person, readLog]);
  useEffect(() => {
    if (!ready || begun) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        setResumeInfo(parseReaderState(localStorage.getItem(viewKey), events));
      } catch {
        setResumeInfo(null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [ready, begun, events]);
  const hasPrevious = events.length > 0 || !!resumeInfo;
  const shownLog = begun ? readLog : resumeInfo?.readLog || [];
  const preparations = rescueReadiness(state);
  const decisionSave = state.ending ? beforeEnding(events) : null;
  const incoming = useRef<string | null>(null),
    fileInput = useRef<HTMLInputElement>(null),
    reading = useRef<HTMLDivElement>(null);
  const ambienceError = useAmbience(sound && begun, state.place, volume);
  const music = useBackgroundMusic(sound && begun, volume);
  const effects = useSoundEffects(sound && begun, volume);
  const audioError = music.error || ambienceError;
  const toggleSound = () => {
    if (!sound && begun) music.startFromGesture();
    setSound(!sound);
  };
  const preferredMotion = useSyncExternalStore(subscribeMotion, motionSnapshot, () => true);
  const reduced = motionOverride ?? preferredMotion;
  const backdropSrc = intro !== null ? places.pier.image : backdrop(state);
  const imageReady = artState.src === backdropSrc && artState.status === "ready";
  const reportArt = useCallback(
    (status: SceneImageStatus) => setArtState({ src: backdropSrc, status }),
    [backdropSrc],
  );
  useScenePreload(state, begun && imageReady);
  const here = actions.filter((a) => available(state, a)),
    localPeople = (Object.keys(people) as Person[]).filter(
      (p) => npcPlace(state, p) === state.place,
    );
  const chunks = entry ? paginateText(entry.text) : [],
    lastPage = page >= chunks.length - 1;
  const say = (e: Entry) => {
    setEntry(e);
    setPage(0);
  };
  function run(id: string, surface: "scene" | "panel" = "scene"): Result {
    const result = perform(id);
    const effect = soundForAction(id, result.accepted);
    if (effect) effects.play(effect);
    if (surface === "scene" || (result.accepted && result.state.width === 2)) {
      say({
        text: result.text,
        speaker: result.speaker,
        person: person || undefined,
      });
    } else {
      setEntry(null);
    }
    if (id.startsWith("present:")) closePanel();
    setHintLevel(0);
    setSelectionNote("");
    if (result.accepted) {
      if (["open-rescue", "close-rescue"].includes(id)) setSceneCue((n) => n + 1);
      const gained = result.state.found.filter((x) => !state.found.includes(x));
      if (gained.length)
        setDiscovery(gained.map((x) => shortNames[x]).join(" · ") + " — 단서함에 추가했다.");
      if (id.startsWith("move:")) {
        setDiscovery("");
        setHovered("");
        setPerson(null);
        closePanel();
        setEntry(null);
      }
      if (id.startsWith("inspect:")) {
        setClue(id.slice(8));
        open("detail");
        setEntry(null);
        setPerson(null);
      }
      if (id.startsWith("end:")) {
        setPerson(null);
        setEntry(null);
        closePanel();
      }
      if (result.state.width === 2) {
        closePanel();
        setPerson(null);
      }
      if (person && npcPlace(result.state, person) !== result.state.place) setPerson(null);
    }
    return result;
  }
  function talk(id: Person) {
    if (selected.length) {
      const result = run(`present:${id}:${selected.join("+")}`);
      setPerson(npcPlace(result.state, id) === result.state.place ? id : null);
      say({
        text: result.text,
        speaker: id === "elliot" && !has(state, "rescue") ? "반대편 사람" : people[id].name,
        person: id,
      });
      setSelected([]);
      return;
    }
    setPerson(id);
    setSelection([]);

    say({
      text: introduction(state, id),
      speaker: id === "elliot" && !has(state, "rescue") ? "반대편 사람" : people[id].name,
      person: id,
    });
  }
  function begin() {
    if (broken) {
      setConfirm("reset");
      return;
    }
    if (sound) music.startFromGesture();
    setBegun(true);
    try {
      const raw = localStorage.getItem(viewKey);
      const v = parseReaderState(raw, events);
      if (v) {
        setIntro(v.intro);
        setIntroPage(v.introPage);
        setEntry(v.entry);
        setPage(v.page);
        setPerson(v.person);
        setReadLog(v.readLog);
        return;
      }
    } catch {
      /* Ignore incompatible reading positions and use the verified game state. */
    }
    if (!events.length) {
      setIntro(0);
      setIntroPage(0);
    }
  }
  function closePanel() {
    setPanel(null);
    setPanelHistory([]);
  }
  function restart() {
    setSceneCue(0);
    if (sound) music.startFromGesture();
    try {
      localStorage.removeItem(viewKey);
    } catch {
      /* Continue without optional reading storage. */
    }
    reset();
    setIntro(0);
    setIntroPage(0);
    setReadLog([]);
    setSelectionNote("");
    setJournalQuery("");
    setResumeInfo(null);
    setBegun(true);
    setEntry(null);
    setPerson(null);
    closePanel();
    setConfirm(null);
    setSelected([]);
    setDiscovery("");
  }
  const open = (next: Panel) => {
    if (next && ["journal", "compare", "evidence", "map"].includes(next)) effects.play("paper");
    if (panel && panel !== next) setPanelHistory((h) => [...h, panel]);
    setPanel(next);
  };
  const backPanel = () => {
    setPanel(panelHistory.at(-1) || null);
    setPanelHistory((h) => h.slice(0, -1));
  };
  const openComparison = (ids: string[] = ["rope", "salt"]) => {
    if (ids.length !== 2 || !ids.every((id) => has(state, id))) return;
    setCompared(ids);
    open("compare");
  };
  const currentClue = clueById[has(state, clue) ? clue : "letter"];
  const openingScene = intro === null ? null : prose.openingScenes[intro];
  const showScene = begun && intro === null && !state.ending;
  const beats = openingScene ? openingBeats(openingScene) : [];
  const beat = beats[introPage];
  const isControlGuide = openingScene?.id === "first-look" && beat?.kind === "note";
  const introPerson = beat?.speaker
    ? (Object.keys(people) as Person[]).find((id) => people[id].name.startsWith(beat.speaker))
    : undefined;
  const speakerPerson = intro !== null ? introPerson : entry?.person || person;
  const picture = speakerPerson && portrait(speakerPerson);
  const speakerRole =
    speakerPerson === "clara"
      ? "엘리엇의 딸 · 의뢰인"
      : speakerPerson === "mara"
        ? "관측소 기계 담당"
        : speakerPerson === "jonah"
          ? "뱃사공 · 인양 작업자"
          : speakerPerson === "elliot"
            ? has(state, "rescue")
              ? "관측소 책임자"
              : "반대편에서 응답하는 사람"
            : undefined;
  const currentReading = isControlGuide
    ? null
    : beat ||
      (entry
        ? {
            speaker: entry.person ? `대화 상대: ${entry.speaker}` : entry.speaker,
            text: chunks[page] || "",
          }
        : null);
  const readingText = currentReading?.text || "",
    readingSpeaker = currentReading?.speaker || "";
  useEffect(() => {
    if (!readingText || !begun) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setReadLog((log) =>
        log.at(-1)?.text === readingText && log.at(-1)?.speaker === readingSpeaker
          ? log
          : [...log, { speaker: readingSpeaker, text: readingText }],
      );
    });
    return () => {
      cancelled = true;
    };
  }, [readingText, readingSpeaker, begun]);
  const nextIntro = () => {
    if (introPage < beats.length - 1) setIntroPage(introPage + 1);
    else if (intro! < prose.openingScenes.length - 1) {
      setIntro(intro! + 1);
      setIntroPage(0);
    } else {
      setIntro(null);
      setIntroPage(0);
    }
  };
  const roomIndex = roomOrder.indexOf(state.place);
  const dismiss = () => {
    setEntry(null);
    setPerson(null);
  };
  const inspectOwned = (id: string) => {
    if (has(state, id)) {
      effects.play(["rope", "salt"].includes(id) ? "evidence" : "paper");
      setClue(id);
      open("detail");
    }
  };
  const pick = (id: string) => {
    if (selected.length === 2 && !selected.includes(id)) {
      setSelectionNote(
        "자료는 두 개까지 고를 수 있다. 선택한 자료를 한 번 더 눌러 해제한 뒤 고른다.",
      );
      return;
    }
    setSelectionNote("");
    setSelected((v) => toggleEvidence(v, id, state.found));
  };
  const personQuestions = here.filter(
    (a) =>
      a.person === person &&
      ![
        "mara-confess",
        "mara-rope",
        "mara-departure",
        "clara-map",
        "jonah-invite",
        "after:clara",
        "after:mara",
        "after:jonah",
      ].includes(a.id),
  );
  const lastPlace = previousPlace(events, state.place);
  const goBack = () => {
    if (intro !== null) {
      if (introPage > 0) setIntroPage(introPage - 1);
      else if (intro > 0) {
        setIntro(intro - 1);
        setIntroPage(openingBeats(prose.openingScenes[intro - 1]).length - 1);
      } else {
        setIntro(null);
        setBegun(false);
      }
      return;
    }
    if (entry) {
      if (page > 0) setPage(page - 1);
      else dismiss();
      return;
    }
    if (selected.length) {
      setSelected([]);
      return;
    }
    if (state.ending) {
      open("journal");
      return;
    }
    if (lastPlace && state.width !== 2) {
      run(`move:${lastPlace}`);
      return;
    }
    setBegun(false);
  };
  return (
    <main
      id="main-content"
      className={`tide-game flash-game ${openingScene || entry ? "vn-active" : ""} ${reduced ? "reduce-motion" : ""}`}
      style={{ "--reading-size": `${size}px` } as React.CSSProperties}
    >
      <header className="game-titlebar">
        <Button
          className="game-back"
          disabled={!begun || (state.width === 2 && !entry)}
          onClick={goBack}
        >
          <ArrowLeft />
          {intro !== null
            ? "앞 내용"
            : entry
              ? "뒤로가기"
              : selected.length
                ? "선택 취소"
                : state.ending
                  ? "조사 기록"
                  : lastPlace
                    ? "직전 장소"
                    : "시작 화면"}
        </Button>
        <strong>유리 너머의 목소리</strong>
        <div className="tide-row">
          <Button aria-label="게임 안내" onClick={() => open("guide")}>
            <HelpCircle />
          </Button>
          <Button aria-label="지난 대화" onClick={() => open("transcript")}>
            <BookOpen />
          </Button>
          <Button
            aria-label={sound ? "소리 끄기" : "소리 켜기"}
            aria-pressed={sound}
            onClick={toggleSound}
          >
            {sound ? <Volume2 /> : <VolumeX />}
          </Button>
          <Button aria-label="설정" onClick={() => open("settings")}>
            <Settings />
          </Button>
        </div>
      </header>
      {begun && saveError && (
        <div className="room-status save-warning" role="alert">
          <span>{saveError}</span>
          <Button onClick={() => open("settings")}>저장 설정</Button>
        </div>
      )}
      {audioError && <output className="room-status">{audioError}</output>}
      <div className="room-viewport">
        <SceneBackdrop key={backdropSrc} src={backdropSrc} onStatus={reportArt} />
        {sceneCue > 0 && <div key={sceneCue} className="mechanism-cue" aria-hidden="true" />}
        {!begun && (
          <section className="game-start">
            <small>1894년 · 벨로우항</small>
            <h1>유리 너머의 목소리</h1>
            <p>
              관측소에 간 엘리엇 베일이 돌아오지 않았다. 딸 클라라의 의뢰를 받은 탐정이 되어, 그의
              마지막 행적을 조사한다.
            </p>
            <p className="start-audio-note">
              {sound ? "시작하면 음악과 효과음이 재생됩니다." : "소리를 끈 상태로 시작합니다."}
            </p>
            <div className="game-start-actions">
              <Button className="tide-primary" disabled={!ready} onClick={begin}>
                {!ready
                  ? "준비 중…"
                  : broken
                    ? "저장 문제 확인"
                    : hasPrevious
                      ? "이어 하기"
                      : "시작하기"}
                <ArrowRight />
              </Button>
              {hasPrevious && !broken && (
                <Button onClick={() => setConfirm("reset")}>처음부터 시작</Button>
              )}
              <Button onClick={() => open("guide")}>게임 안내</Button>
            </div>
            {ready && hasPrevious && !broken && (
              <aside className="resume-brief" aria-label="이어서 할 내용">
                <strong>
                  {state.ending
                    ? "지난 조사 결말"
                    : resumeInfo?.intro !== null && resumeInfo?.intro !== undefined
                      ? `읽던 도입 · ${prose.openingScenes[resumeInfo.intro].title}`
                      : `머물던 곳 · ${places[state.place].title}`}
                </strong>
                <p>
                  {state.ending
                    ? endingText[state.ending].title
                    : resumeInfo?.intro !== null && resumeInfo?.intro !== undefined
                      ? "마지막으로 읽던 대사부터 이어 읽는다."
                      : objective(state)}
                </p>
                <Button onClick={() => open("case")}>조사 기록 먼저 읽기</Button>
              </aside>
            )}
            {saveError && (
              <p className="start-save-error" role="alert">
                {saveError}
              </p>
            )}
          </section>
        )}
        {showScene && (
          <>
            <div className="room-name">
              {state.rescue === 2 ? "유리 너머의 석실" : places[state.place].title}
            </div>
            {!entry && state.width !== 2 && (
              <>
                <div
                  hidden={!imageReady}
                  className={`room-hotspots ${showLabels ? "show-labels" : ""}`}
                  aria-label="장면 속 조사 대상"
                >
                  {evidence
                    .filter((c) => c.location === state.place)
                    .map((c) => (
                      <Button
                        key={c.id}
                        className={`scene-hotspot ${has(state, c.id) ? "visited" : ""} ${(c.x ?? 50) > 70 ? "label-right" : (c.x ?? 50) < 30 ? "label-left" : ""}`}
                        style={{ left: `${c.x}%`, top: `${c.y}%` }}
                        aria-label={`${objectNames[c.id]} ${has(state, c.id) ? "다시 읽기" : "조사하기"}`}
                        onMouseEnter={() => setHovered(objectNames[c.id])}
                        onFocus={() => setHovered(objectNames[c.id])}
                        onMouseLeave={() => setHovered("")}
                        onBlur={() => setHovered("")}
                        onClick={() => run(`inspect:${c.id}`)}
                      >
                        {has(state, c.id) ? <Check /> : <Search />}
                        <span>{objectNames[c.id]}</span>
                      </Button>
                    ))}
                  {state.place === "observatory" &&
                    has(state, "closure") &&
                    has(state, "safety") &&
                    !has(state, "rescue") && (
                      <Button
                        className="scene-hotspot device-hotspot"
                        onClick={() => open("device")}
                        aria-label="제어대 조작"
                      >
                        <SlidersHorizontal />
                        <span>제어대</span>
                      </Button>
                    )}
                </div>
                {roomIndex > 0 && (
                  <Button
                    className="room-arrow room-left"
                    onClick={() => run(`move:${roomOrder[roomIndex - 1]}`)}
                    aria-label={`${places[roomOrder[roomIndex - 1]].title}로 이동`}
                  >
                    <ChevronLeft />
                    <span>{places[roomOrder[roomIndex - 1]].title}</span>
                  </Button>
                )}
                {roomIndex < roomOrder.length - 1 && (
                  <Button
                    className="room-arrow room-right"
                    onClick={() => run(`move:${roomOrder[roomIndex + 1]}`)}
                    aria-label={`${places[roomOrder[roomIndex + 1]].title}로 이동`}
                  >
                    <ChevronRight />
                    <span>{places[roomOrder[roomIndex + 1]].title}</span>
                  </Button>
                )}
              </>
            )}
            {state.place === "observatory" && has(state, "safety") && (
              <div className="room-device-state">
                {state.width === 0
                  ? "덮개 닫힘"
                  : state.width === 1
                    ? "빛과 소리가 통함"
                    : "통로 열림"}{" "}
                · 눈금 {state.width}
              </div>
            )}
          </>
        )}
        {(openingScene || entry) && picture && (
          <img key={picture} className="vn-actor" src={picture} alt="" decoding="async" />
        )}
        {openingScene &&
          beat &&
          (isControlGuide ? (
            <InvestigationTutorial onStart={nextIntro} onPrevious={goBack} />
          ) : (
            <NovelReader
              title={openingScene.title}
              speaker={beat.speaker}
              portrait={picture || undefined}
              speakerRole={speakerRole}
              text={beat.text}
              kind={beat.kind}
              page={introPage}
              total={beats.length}
              onPrevious={goBack}
              onNext={nextIntro}
              onLog={() => open("transcript")}
              nextLabel={introPage === beats.length - 1 ? openingScene.continueLabel : "다음"}
            />
          ))}
        {showScene && entry && (
          <NovelReader
            title={places[state.place].title}
            speaker={entry.speaker}
            portrait={picture || undefined}
            speakerRole={speakerRole}
            text={chunks[page] || ""}
            kind="narration"
            page={page}
            total={chunks.length}
            onPrevious={page ? () => setPage(page - 1) : undefined}
            onNext={() => {
              if (!lastPage) {
                setPage(page + 1);
                return;
              }
              if (!person || state.width === 2) {
                dismiss();
                return;
              }
              reading.current?.scrollIntoView({
                behavior: reduced ? "instant" : "smooth",
                block: "nearest",
              });
              reading.current
                ?.querySelector<HTMLButtonElement>(".conversation-choices button")
                ?.focus({ preventScroll: true });
            }}
            onLog={() => open("transcript")}
            nextLabel={dialogueNextLabel(lastPage, !!person, state.width === 2)}
          />
        )}
      </div>
      {showScene && (
        <>
          <output
            className="room-status"
            hidden={!!entry || (!hovered && !selected.length && !discovery)}
          >
            {hovered ||
              (selected.length
                ? `${selected.map((id) => shortNames[id]).join(" + ")} 선택 중 — 보여 줄 인물을 누른다.`
                : discovery)}
          </output>
          <section className="case-task" hidden={!!entry}>
            <div>
              <small>지금 확인할 일</small>
              <p>{objective(state)}</p>
            </div>
            <Button onClick={() => open("case")}>의뢰와 조사 기록</Button>
          </section>
          {!entry && preparations.length > 0 && (
            <section className="rescue-checklist" aria-label="구조 준비">
              <strong>구조 준비</strong>
              <ul>
                {preparations.map((p) => (
                  <li key={p.name}>
                    <span aria-hidden="true">{p.done ? "✓" : "○"}</span> {p.name} ·{" "}
                    {p.done ? "확인함" : "확인 필요"}
                  </li>
                ))}
              </ul>
            </section>
          )}
          <div className="room-toolbar" hidden={!!entry}>
            <div className="tide-row">
              <Button onClick={() => open("journal")}>
                <BookOpen />
                자료 수첩
              </Button>
              <Button onClick={() => open("objects")} disabled={state.width === 2}>
                <Search />
                조사할 곳
              </Button>
              <Button
                onClick={() => {
                  setHintLevel(0);
                  open("help");
                }}
              >
                <HelpCircle />
                힌트
              </Button>
              <Button onClick={() => setShowLabels(!showLabels)} aria-pressed={showLabels}>
                <Eye />
                조사 대상 이름
              </Button>
            </div>
            <div className="room-people" aria-label="이곳의 인물">
              {state.width !== 2 &&
                localPeople.map((id) => (
                  <Button
                    key={id}
                    onClick={() => talk(id)}
                    className={selected.length ? "ready-to-show" : ""}
                  >
                    {portrait(id) && <img src={portraitImage(id, true)!} alt="" decoding="async" />}
                    <span>
                      {id === "elliot" && !has(state, "rescue")
                        ? "반대편 사람"
                        : people[id].name.split(" ")[0]}
                    </span>
                    {selected.length ? <Hand /> : <MessageCircle />}
                  </Button>
                ))}
            </div>
          </div>
          {entry && (
            <section
              ref={reading}
              className="conversation vn-questions"
              aria-label="질문과 다음 행동"
            >
              <div className="conversation-heading">
                <strong>{lastPage ? "질문과 다음 행동" : "대화를 읽는 중"}</strong>
                <Button onClick={dismiss}>
                  <X />
                  대화 닫기
                </Button>
              </div>
              {lastPage && (
                <div className="conversation-choices">
                  {person && state.width !== 2 && (
                    <>
                      <Button
                        onClick={() => {
                          setSelection([]);
                          open("evidence");
                        }}
                      >
                        <Hand />
                        자료를 골라 보여 준다
                      </Button>
                      {person === "clara" && has(state, "chart") && !has(state, "bearing") && (
                        <Button onClick={() => open("map")}>
                          <Map />두 도면을 펼친다
                        </Button>
                      )}
                      {person === "jonah" &&
                        state.place === "observatory" &&
                        has(state, "response") &&
                        !has(state, "pin-confession") &&
                        (state.aim !== "arch" || state.width !== 1) && (
                          <Button onClick={() => open("device")}>
                            함께 신호를 보도록 제어대를 맞춘다
                          </Button>
                        )}
                      {personQuestions.map((a) => (
                        <Button key={a.id} onClick={() => run(a.id)}>
                          {a.label}
                          {events.includes(a.id) && (
                            <small className="asked-label">들었던 답</small>
                          )}
                          <ChevronRight />
                        </Button>
                      ))}
                    </>
                  )}
                  <Button onClick={dismiss}>
                    {state.width === 2 ? "다음 행동 보기" : "현장 보기"}
                  </Button>
                </div>
              )}
            </section>
          )}
          <section className="inventory" hidden={!!entry} aria-label="확인한 단서함">
            <div className="inventory-heading">
              <strong>
                단서함 <small>{state.found.length}</small>
              </strong>
              <span>자료를 눌러 읽는다. 보여 줄 자료는 ‘고르기’를 누른다.</span>
            </div>
            <p className="selection-feedback" role="status">
              {selectionNote}
            </p>
            <div className="inventory-slots">
              {state.found.map((id) => (
                <EvidenceCard
                  key={id}
                  id={id}
                  selected={selected.includes(id)}
                  onRead={() => inspectOwned(id)}
                  onSelect={() => pick(id)}
                />
              ))}
            </div>
            {selected.length > 0 && (
              <div className="inventory-actions">
                {selected.length === 2 && (
                  <Button onClick={() => openComparison(selected)}>
                    <CheckCheck />
                    선택한 두 자료 비교
                  </Button>
                )}
                {selected.map((id) => (
                  <Button key={id} onClick={() => inspectOwned(id)}>
                    <ZoomIn />
                    {shortNames[id]} 살펴보기
                  </Button>
                ))}
                {canCompare(state) && selected.some((id) => ["rope", "salt"].includes(id)) && (
                  <Button onClick={() => openComparison()}>
                    <CheckCheck />
                    줄과 홈 비교
                  </Button>
                )}
                <Button onClick={() => setSelected([])}>선택 취소</Button>
              </div>
            )}
          </section>
          {!entry && state.width === 2 && (
            <section className="rescue-panel">
              <h2>
                {state.rescue === 1
                  ? "통로 앞"
                  : state.rescue === 2
                    ? "부상자를 데리고 돌아가기"
                    : "문턱에 남은 줄"}
              </h2>
              <p>
                {state.rescue === 1
                  ? "세 사람은 각자 맡은 도구를 잡고 기다린다. 아직 아무도 건너지 않았다."
                  : state.rescue === 2
                    ? "왼발을 다친 남자가 손을 내민다."
                    : "사람은 모두 돌아왔다. 줄 끝까지 걷은 뒤 닫아야 한다."}
              </p>
              {here
                .filter((a) => a.group === "rescue")
                .map((a) => (
                  <Button className="tide-primary" key={a.id} onClick={() => run(a.id)}>
                    {a.label}
                    <ArrowRight />
                  </Button>
                ))}
              <Button onClick={() => open("device")}>제어대 상태 확인</Button>
            </section>
          )}
          {!entry && has(state, "rescue") && state.place === "observatory" && (
            <section className="aftermath">
              <h2>모두 돌아왔다</h2>
              <p>더 물어볼 말을 마치면 장치를 어떻게 처리할지 정한다.</p>
              {has(state, "samples") ? (
                here
                  .filter((a) => a.group === "ending")
                  .map((a) => (
                    <Button key={a.id} onClick={() => setConfirm(a.id)}>
                      {a.label}
                    </Button>
                  ))
              ) : (
                <Button onClick={() => run("move:records")}>유리 표본 기록을 확인하러 간다</Button>
              )}
            </section>
          )}
          {!entry && state.place === "pier" && !has(state, "rescue") && (
            <Button className="withdraw-button" onClick={() => setConfirm("end:withdraw")}>
              지원 요청하고 이번 조사 마치기
            </Button>
          )}
        </>
      )}
      {begun && intro === null && state.ending && (
        <section className="ending-scene">
          <small>조사 종료</small>
          <h1>{endingText[state.ending].title}</h1>
          <Text text={endingDescription(state)} />
          <details>
            <summary>이번 조사에서 확인한 사실</summary>
            <CaseBrief state={state} recap />
          </details>
          <div className="tide-row">
            <Button onClick={() => open("journal")}>확인한 기록</Button>
            {decisionSave && (
              <Button onClick={() => setConfirm("revisit")}>조사 종료 직전으로 돌아가기</Button>
            )}
            <Button onClick={() => setConfirm("reset")}>처음부터 다시 조사하기</Button>
            <Button onClick={() => setConfirm("exit")}>게임 소개로</Button>
          </div>
        </section>
      )}
      <Dialog
        open={!!panel}
        onOpenChange={(v) => {
          if (!v) closePanel();
        }}
      >
        <DialogContent
          style={{ fontSize: `${size}px` }}
          className={`tide-modal ${["guide", "journal", "map", "evidence", "detail", "compare", "case", "transcript"].includes(panel || "") ? "tide-wide" : ""}`}
        >
          <Button className="panel-back" onClick={backPanel}>
            <ArrowLeft />
            {panelHistory.length ? "이전 화면" : begun ? "게임으로" : "시작 화면으로"}
          </Button>
          <DialogTitle>
            {
              (
                {
                  guide: "게임 안내",
                  transcript: "지난 대화",
                  case: "탐정의 의뢰와 조사 기록",
                  detail: "자세히 살펴보기",
                  compare: "나란히 놓고 비교하기",
                  journal: "조사 수첩",
                  map: "해도와 관측소 도면",
                  device: "관측실 제어대",
                  signal: "등불 시험",
                  evidence: `${person ? people[person].name : "인물"}에게 자료 제시`,
                  settings: "설정",
                  help: "조사 도움말",
                  objects: "조사할 곳",
                } as Record<string, string>
              )[panel || ""]
            }
          </DialogTitle>
          <DialogDescription className="sr-only">
            {panel === "journal"
              ? "눈으로 확인한 흔적과 인물에게 들은 말을 구분해 기록한다."
              : panel === "settings"
                ? "글자 크기와 소리를 바꾸고 진행 기록을 보관할 수 있다."
                : "내용을 읽은 뒤 위쪽의 돌아가기 버튼으로 창을 닫을 수 있다."}
          </DialogDescription>
          {panel === "guide" && <GameGuide />}
          {panel === "transcript" && (
            <div className="vn-transcript">
              <p className="tide-small">
                최근 읽은 대사를 순서대로 볼 수 있다. 같은 브라우저에서 이어 하면 기록도 함께
                불러온다.
              </p>
              {!shownLog.length && <p>아직 읽은 대화가 없다.</p>}
              {shownLog.map((line, i) => (
                <article key={i}>
                  <strong>{line.speaker}</strong>
                  <Text text={line.text} />
                </article>
              ))}
            </div>
          )}
          {panel === "detail" && (
            <>
              <EvidenceView key={currentClue.id} id={currentClue.id} />
              {canCompare(state) && ["rope", "salt"].includes(currentClue.id) && (
                <Button onClick={() => openComparison()}>줄과 덮개 홈을 나란히 본다</Button>
              )}
              <Button
                onClick={() => {
                  if (selected.length === 2 && !selected.includes(currentClue.id)) {
                    setSelected([currentClue.id]);
                    setSelectionNote(
                      "앞서 고른 자료 대신 이 자료를 선택했다. 함께 보여 줄 자료를 하나 더 고를 수 있다.",
                    );
                  } else {
                    setSelected((v) => ensureEvidence(v, currentClue.id, state.found));
                    setSelectionNote("");
                  }
                  closePanel();
                  dismiss();
                }}
              >
                {selected.length === 2 && !selected.includes(currentClue.id)
                  ? "기존 선택을 지우고 이 자료 고르기"
                  : "이 자료 선택하기"}
              </Button>
              {currentClue.id === "chart" &&
                state.place === "records" &&
                !has(state, "bearing") && (
                  <Button onClick={() => open("map")}>클라라와 두 도면을 맞춘다</Button>
                )}
              <Button onClick={closePanel}>현장으로 돌아가기</Button>
            </>
          )}
          {panel === "compare" &&
            compared.length === 2 &&
            compared.every((id) => has(state, id)) && (
              <EvidenceView id={compared[0]} compare compareIds={compared} />
            )}
          {panel === "case" && <CaseBrief state={state} />}
          {panel === "journal" && (
            <div className="journal-layout">
              <nav aria-label="확인한 자료">
                <label className="journal-search">
                  자료 찾기
                  <input
                    type="search"
                    value={journalQuery}
                    placeholder="예: 편지, 밧줄"
                    onChange={(e) => setJournalQuery(e.target.value)}
                  />
                </label>
                {journalQuery && (
                  <Button onClick={() => setJournalQuery("")}>전체 자료 보기</Button>
                )}
                {!state.found.some((id) =>
                  (clueById[id].title + clueById[id].text).includes(journalQuery.trim()),
                ) && <p>찾는 자료가 없다. 다른 말로 검색해 본다.</p>}
                {state.found
                  .filter((id) =>
                    (clueById[id].title + clueById[id].text).includes(journalQuery.trim()),
                  )
                  .map((id) => (
                    <Button key={id} aria-pressed={clue === id} onClick={() => setClue(id)}>
                      {clueById[id].title}
                    </Button>
                  ))}
              </nav>
              <article className="tide-paper">
                {state.flags.includes("question-heard") && !has(state, "response") && (
                  <aside>
                    <h3>반대편에서 들은 답</h3>
                    <p>
                      엘리엇 베일이라고 말하는 사람이 물통 하나와 하루치 식량이 남았다고 답했다.
                      아직 등불 시험을 모두 마치지 않았고, 그 사람의 신원도 확인하지 못했다.
                    </p>
                  </aside>
                )}
                <small>{currentClue.source}</small>
                <h2>{currentClue.title}</h2>
                <Text text={currentClue.text} />
                {detailImages[currentClue.id] && (
                  <Button onClick={() => open("detail")}>흔적을 확대해서 본다</Button>
                )}
                {["chart", "bearing"].includes(currentClue.id) && has(state, "bearing") && (
                  <Button onClick={() => open("map")}>맞춘 도면 다시 펼치기</Button>
                )}
              </article>
            </div>
          )}
          {panel === "map" && <MapPuzzle state={state} perform={(id) => run(id, "panel")} />}
          {panel === "signal" && (
            <SignalPuzzle state={state} reduced={reduced} perform={(id) => run(id, "panel")} />
          )}
          {panel === "device" && (
            <DevicePanel
              state={state}
              perform={(id) => run(id, "panel")}
              openSignals={() => open("signal")}
            />
          )}
          {panel === "evidence" && person && (
            <>
              <p>
                확인받고 싶은 자료를 한두 개 고른다. 상대가 무엇을 알고 있는지, 말이 기록과 맞는지
                물을 수 있다.
              </p>
              <div className="evidence-picker">
                {state.found.map((id) => (
                  <Button
                    key={id}
                    aria-pressed={selection.includes(id)}
                    disabled={!selection.includes(id) && selection.length >= 2}
                    onClick={() =>
                      setSelection((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
                    }
                  >
                    {selection.includes(id) && <Check />}
                    {clueById[id].title}
                  </Button>
                ))}
              </div>
              <p className="tide-small">
                한 번에 두 개까지 고른다. 선택한 자료를 다시 누르면 해제된다.
              </p>
              <p className="tide-small">
                선택한 자료: {selection.map((id) => clueById[id].title).join(" / ") || "없음"}
              </p>
              <Button
                className="tide-primary"
                disabled={!selection.length}
                onClick={() => {
                  run(`present:${person}:${selection.join("+")}`);
                }}
              >
                선택한 자료를 보여 준다
              </Button>
            </>
          )}
          {panel === "objects" && (
            <div className="object-list">
              <p>
                {places[state.place].title} ·{" "}
                {evidence.filter((c) => c.location === state.place && !has(state, c.id)).length}곳을
                아직 살펴보지 않았다.
              </p>
              {state.place === "observatory" &&
                has(state, "closure") &&
                has(state, "safety") &&
                !has(state, "rescue") && (
                  <Button onClick={() => open("device")}>
                    <SlidersHorizontal />
                    제어대
                  </Button>
                )}
              {evidence
                .filter((c) => c.location === state.place)
                .map((c) => (
                  <Button key={c.id} onClick={() => run(`inspect:${c.id}`)}>
                    <Search />
                    {objectNames[c.id]}
                    {has(state, c.id) && <small>확인함</small>}
                  </Button>
                ))}
            </div>
          )}
          {panel === "help" && (
            <>
              <Text
                text={hint(state)
                  .slice(0, hintLevel + 1)
                  .join("\n\n")}
              />
              {hintLevel < hint(state).length - 1 && (
                <Button onClick={() => setHintLevel(hintLevel + 1)}>더 구체적인 설명</Button>
              )}
              <hr />
              <Button onClick={() => open("guide")}>조작 방법 보기</Button>
            </>
          )}
          {panel === "settings" && (
            <>
              <div className="tide-slider-label">
                글자 크기 · {size}px
                <Slider
                  aria-label="글자 크기"
                  min={16}
                  max={24}
                  step={1}
                  value={[size]}
                  onValueChange={(v) => setSize(Array.isArray(v) ? v[0] : v)}
                />
              </div>
              <Button aria-pressed={sound} onClick={toggleSound}>
                {sound ? <Volume2 /> : <VolumeX />}소리 {sound ? "켜짐" : "꺼짐"}
              </Button>
              <div className="tide-slider-label">
                소리 크기
                <Slider
                  aria-label="소리 크기"
                  min={0}
                  max={100}
                  value={[volume]}
                  onValueChange={(v) => setVolume(Array.isArray(v) ? v[0] : v)}
                />
              </div>
              {audioError && (
                <p aria-live="polite" aria-atomic="true">
                  {audioError}
                </p>
              )}
              <Button aria-pressed={reduced} onClick={() => setReduced(!reduced)}>
                화면 전환 효과 {reduced ? "꺼짐" : "켜짐"}
              </Button>
              <Button
                onClick={() => {
                  if (!document.documentElement.requestFullscreen) {
                    setSettingsNote("이 기기는 전체 화면 전환을 지원하지 않는다.");
                    return;
                  }
                  const p = document.fullscreenElement
                    ? document.exitFullscreen()
                    : document.documentElement.requestFullscreen();
                  void p.catch(() =>
                    setSettingsNote("이 기기는 전체 화면 전환을 지원하지 않는다."),
                  );
                }}
              >
                <Maximize />
                전체 화면 전환
              </Button>
              <hr />
              <h3>진행 저장</h3>
              <p aria-live="polite" aria-atomic="true">
                {notice}
              </p>
              {!saveError && (
                <p>
                  물건을 조사하거나 장소를 옮길 때마다 자동으로 저장된다. 다음에 같은 브라우저에서
                  ‘이어 하기’를 누르면 계속할 수 있다.
                </p>
              )}
              <details className="save-details">
                <summary>파일로 보관하기</summary>
                <p>
                  다른 기기에서 이어 하거나 브라우저 기록을 지우기 전에 저장 파일을 받아 둔다. 읽던
                  대화의 쪽수와 누르기 전의 선택은 이어지지 않는다.
                </p>
                <div className="tide-row">
                  <Button
                    onClick={() =>
                      download(
                        JSON.stringify({ version: 2, events }),
                        "유리_너머의_목소리_진행.json",
                      )
                    }
                  >
                    <Download />
                    저장 파일 받기
                  </Button>
                  <Button onClick={() => fileInput.current?.click()}>
                    <Upload />
                    저장 파일 불러오기
                  </Button>
                </div>
              </details>
              <input
                ref={fileInput}
                hidden
                type="file"
                accept=".json,application/json"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  if (file.size > 1_000_000) {
                    setSettingsNote("진행 파일은 1MB 이하여야 한다.");
                    return;
                  }
                  try {
                    incoming.current = await file.text();
                    setConfirm("import");
                  } catch {
                    setSettingsNote("파일을 읽지 못했다. 기존 진행은 그대로 보관했다.");
                  }
                }}
              />
              {broken && (
                <Button onClick={() => download(broken, "유리_너머의_목소리_읽지못한_원본.json")}>
                  읽지 못한 원본 받기
                </Button>
              )}
              <p aria-live="polite" aria-atomic="true">
                {settingsNote}
              </p>
              <Button
                onClick={() => {
                  closePanel();
                  setIntro(0);
                  setIntroPage(0);
                  setBegun(true);
                }}
              >
                사건 도입 다시 읽기
              </Button>
              <Button onClick={() => setConfirm("exit")}>게임 소개로 돌아가기</Button>
              <Button variant="ghost" onClick={() => setConfirm("reset")}>
                현재 기록을 지우고 처음부터 시작
              </Button>
              <details className="game-credits">
                <summary>사용 음악</summary>
                <p>Ink in the Files</p>
              </details>
            </>
          )}
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!confirm}
        onOpenChange={(v) => {
          if (!v) setConfirm(null);
        }}
      >
        <AlertDialogContent className="tide-modal tide-confirm">
          <AlertDialogTitle>
            {confirm === "exit"
              ? "게임 소개로 돌아갈까?"
              : confirm === "revisit"
                ? "조사 종료 직전으로 돌아갈까?"
                : confirm === "reset"
                  ? "처음부터 다시 시작할까?"
                  : confirm === "import"
                    ? "진행 파일을 불러올까?"
                    : "이번 조사를 이 선택으로 마칠까?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {confirm === "exit"
              ? saveError
                ? `${saveError} 나가기 전에 설정에서 저장 파일을 받아 두는 것이 좋다.`
                : "조사한 내용은 저장돼 있다. ‘이어 하기’를 누르면 계속할 수 있다. 같은 브라우저에서는 읽던 대사도 이어 볼 수 있다."
              : confirm === "revisit"
                ? "이번 결말 선택만 되돌린다. 찾은 자료는 남고, 다시 조사하거나 다른 결말을 고를 수 있다. 현재 결말을 파일로 남기려면 먼저 설정에서 저장한다."
                : confirm === "reset"
                  ? "지금까지 조사한 내용이 지워진다. 남겨 두려면 설정에서 저장 파일을 먼저 받는다."
                  : confirm === "import"
                    ? "현재 진행 내용이 파일에 저장된 내용으로 바뀐다."
                    : confirm === "end:withdraw"
                      ? "지금 확인한 자료를 가지고 항구에 지원을 요청한다. 이번 조사에서 실종자 구조는 완료되지 않는다."
                      : confirm === "end:dismantle"
                        ? "유리를 분해하면 이 장치로 통로를 다시 열 수 없다. 소리를 내는 파편은 밀폐하고 관측 기록은 보관한다."
                        : "장치를 가리고 봉인한다. 유리는 남겨 두며, 이후 접근과 시험 여부는 별도 조사 뒤에 정한다."}
          </AlertDialogDescription>
          {["reset", "import", "revisit"].includes(confirm || "") && (
            <Button
              onClick={() =>
                download(
                  broken || JSON.stringify({ version: 2, events }),
                  broken ? "유리_너머의_목소리_읽지못한_원본.json" : "유리_너머의_목소리_진행.json",
                )
              }
            >
              <Download />
              {broken ? "읽지 못한 원본 받기" : "현재 진행 파일 받기"}
            </Button>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>돌아가기</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirm === "exit") window.location.assign("/games/tide-room");
                else if (confirm === "revisit" && decisionSave) {
                  restore(decisionSave);
                  setEntry(null);
                  setPerson(null);
                  setIntro(null);
                  setReadLog([]);
                  setSelected([]);
                  setSelectionNote("");
                  setConfirm(null);
                  closePanel();
                } else if (confirm === "reset") restart();
                else if (confirm === "import") {
                  try {
                    restore(incoming.current || "");
                    setReadLog([]);
                    setSelectionNote("");
                    setJournalQuery("");
                    closePanel();
                    setBegun(true);
                    setIntro(null);
                    setPerson(null);
                    setEntry(null);
                    setSettingsNote("");
                    setSelected([]);
                    setDiscovery("");
                  } catch {
                    setSettingsNote(
                      "현재 판에서 읽을 수 없는 진행 파일이다. 기존 기록은 바꾸지 않았다.",
                    );
                  }
                  setConfirm(null);
                } else if (confirm) {
                  run(confirm);
                  setConfirm(null);
                }
              }}
            >
              {confirm === "exit"
                ? "게임 나가기"
                : confirm === "revisit"
                  ? "마지막 선택 되돌리기"
                  : confirm === "reset"
                    ? "기록 지우고 시작"
                    : confirm === "import"
                      ? "불러오기"
                      : "이 선택으로 마치기"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
