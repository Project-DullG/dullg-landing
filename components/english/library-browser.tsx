"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { ArrowRight, BookOpen, MessageCircle, Puzzle, Search, Volume2, X } from "lucide-react";
import Link from "@/components/i18n/link";
import { localizeEnglishTree } from "@/lib/i18n/english-tree";
import { translateText } from "@/lib/i18n/translate";
import { loginPath } from "@/lib/auth-navigation";
import { englishCourses, getCourseHref } from "@/lib/english/courses";
import {
  defaultLibraryFilters,
  filterDiscoveryItems,
  getDiscoveryStatus,
  libraryHref,
  parseLibrarySearch,
  type EnglishDiscoveryItem,
  type LibraryFilters,
} from "@/lib/english/discovery";
import { englishLevels, englishSkills, type EnglishLevel } from "@/lib/english/types";
import { StudyNavigation } from "./study-navigation";
import { useStudyProgress, type StudyProgressProps } from "./use-study-progress";
import styles from "./library-browser.module.css";

const kinds = [
  { id: "all" as const, label: "모두" },
  { id: "story" as const, label: "이야기" },
  { id: "conversation" as const, label: "회화" },
  { id: "sentence" as const, label: "문장 만들기" },
  { id: "reading" as const, label: "리딩" },
];
const kindIcons = {
  story: BookOpen,
  conversation: MessageCircle,
  sentence: Puzzle,
  reading: BookOpen,
};
export function EnglishLibraryBrowser(
  props: StudyProgressProps & {
    items: EnglishDiscoveryItem[];
    initialSearch: ReturnType<typeof parseLibrarySearch>;
  },
) {
  const locale = useLocale();
  const { progress, status, refresh } = useStudyProgress(props);
  const [filters, setFilters] = useState(props.initialSearch.filters);
  const [selectedId, setSelectedId] = useState(props.initialSearch.focus);
  const [chosenLevel, setChosenLevel] = useState<EnglishLevel | undefined>(
    props.initialSearch.level,
  );
  const [listening, setListening] = useState(false),
    [audioError, setAudioError] = useState("");
  const previewRef = useRef<HTMLElement>(null),
    searchRef = useRef<HTMLInputElement>(null);
  const speechToken = useRef(0);
  const invalidateVoice = useCallback(() => {
    speechToken.current++;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);
  const selected = props.items.find((item) => item.id === selectedId);
  const filtered = filterDiscoveryItems(props.items, filters, progress);
  const activeLevel =
    chosenLevel ||
    (selected ? progress?.episodes[selected.id]?.level : undefined) ||
    progress?.preferredLevel ||
    "standard";
  const selectedStatus = selected ? getDiscoveryStatus(selected, progress) : undefined;
  const localized = (path: string) => (locale === "en" ? "/en" : "") + path;
  function stopVoice() {
    invalidateVoice();
    setListening(false);
  }
  function updateUrl(
    nextFilters: LibraryFilters,
    focus: string,
    level: EnglishLevel | undefined,
    push = false,
  ) {
    window.history[push ? "pushState" : "replaceState"](
      null,
      "",
      localized(libraryHref(nextFilters, { focus, level })),
    );
  }
  function changeFilters(next: LibraryFilters) {
    setFilters(next);
    setSelectedId("");
    stopVoice();
    updateUrl(next, "", chosenLevel);
  }
  function openPreview(id: string) {
    stopVoice();
    setAudioError("");
    setSelectedId(id);
    updateUrl(filters, id, chosenLevel, true);
  }
  function closePreview() {
    stopVoice();
    setSelectedId("");
    updateUrl(filters, "", chosenLevel);
    searchRef.current?.scrollIntoView({ block: "nearest" });
    searchRef.current?.focus({ preventScroll: true });
  }
  useEffect(() => {
    const pop = () => {
      const next = parseLibrarySearch(
        Object.fromEntries(new URLSearchParams(window.location.search)),
      );
      invalidateVoice();
      setListening(false);
      setAudioError("");
      setFilters(next.filters);
      setSelectedId(next.focus);
      setChosenLevel(next.level);
    };
    window.addEventListener("popstate", pop);
    return () => {
      window.removeEventListener("popstate", pop);
      invalidateVoice();
    };
  }, [invalidateVoice]);
  useEffect(() => {
    if (!selectedId) return;
    const tick = window.setTimeout(() => {
      previewRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
      previewRef.current?.focus({ preventScroll: true });
    }, 0);
    return () => window.clearTimeout(tick);
  }, [selectedId]);
  function listenPreview() {
    setAudioError("");
    if (!selected) return;
    if (!("speechSynthesis" in window)) {
      setAudioError("이 기기에서는 음성을 재생할 수 없어요. 맛보기 문장을 읽으며 살펴보세요.");
      return;
    }
    const wasPlaying = listening;
    stopVoice();
    if (wasPlaying) return;
    const token = ++speechToken.current;
    const utterance = new SpeechSynthesisUtterance(selected.guide.sample[activeLevel].en);
    utterance.lang = "en-US";
    utterance.rate = activeLevel === "starter" ? 0.88 : 1;
    const voice = window.speechSynthesis
      .getVoices()
      .find((item) => item.lang.toLowerCase() === "en-us");
    if (voice) utterance.voice = voice;
    utterance.onend = () => {
      if (token === speechToken.current) setListening(false);
    };
    utterance.onerror = () => {
      if (token === speechToken.current) {
        setListening(false);
        setAudioError("음성 재생이 멈췄어요. 글로도 맛보기를 살펴볼 수 있습니다.");
      }
    };
    setListening(true);
    window.speechSynthesis.speak(utterance);
  }
  const startHref = (item: EnglishDiscoveryItem, preview = false) => {
    const itemStatus = getDiscoveryStatus(item, progress);
    const level = preview
      ? activeLevel
      : itemStatus.started
        ? progress?.episodes[item.id]?.level ||
          chosenLevel ||
          progress?.preferredLevel ||
          "standard"
        : chosenLevel || progress?.preferredLevel || "standard";
    return getCourseHref(item.id, level, {
      replay: itemStatus.finished,
      courseId: progress?.episodes[item.id]?.courseId,
    })!;
  };
  const courses = selected
    ? englishCourses.filter((course) => selected.courseIds.includes(course.id))
    : [];
  return localizeEnglishTree(
    <div className={styles.page}>
      <div className={styles.shell}>
        <StudyNavigation />
        <header className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>FIND YOUR NEXT ENGLISH MOMENT</p>
            <h1>지금 배우고 싶은 영어를 찾아요</h1>
            <p>
              이야기부터 짧은 회화와 문장 연습까지. 학습 목표와 맛보기를 살펴보고 내게 맞는 콘텐츠를
              골라 보세요.
            </p>
          </div>
          <Link className={styles.secondary} href="/english/courses">
            순서대로 배우는 코스 <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </header>
        <form
          className={styles.searchForm}
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            updateUrl(filters, selectedId, chosenLevel);
          }}
        >
          <label htmlFor="english-content-search">
            <Search size={20} aria-hidden="true" />
            <span className={styles.visuallyHidden}>영어 콘텐츠 검색</span>
          </label>
          <input
            ref={searchRef}
            id="english-content-search"
            className={styles.searchInput}
            type="search"
            value={filters.query}
            maxLength={160}
            placeholder="제목이나 배우고 싶은 표현으로 찾기"
            onChange={(event) => changeFilters({ ...filters, query: event.target.value })}
          />
          <button className={styles.searchButton} type="submit">
            찾기
          </button>
        </form>
        <div className={styles.kinds} role="group" aria-label="콘텐츠 형태">
          {kinds.map((kind) => (
            <button
              key={kind.id}
              className={filters.kind === kind.id ? styles.activeKind : ""}
              aria-pressed={filters.kind === kind.id}
              onClick={() => changeFilters({ ...filters, kind: kind.id })}
            >
              {kind.label}
              <span>
                {kind.id === "all"
                  ? props.items.length
                  : props.items.filter((item) => item.kind === kind.id).length}
              </span>
            </button>
          ))}
        </div>
        <details className={styles.filters}>
          <summary>학습 조건 더 보기</summary>
          <div className={styles.filterGrid}>
            <label className={styles.filterLabel}>
              연습 영역
              <select
                value={filters.skill}
                onChange={(event) =>
                  changeFilters({
                    ...filters,
                    skill: event.target.value as LibraryFilters["skill"],
                  })
                }
              >
                <option value="all">전체 영역</option>
                {Object.entries(englishSkills).map(([id, skill]) => (
                  <option key={id} value={id}>
                    {skill.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.filterLabel}>
              예상 학습 시간
              <select
                value={filters.pace}
                onChange={(event) =>
                  changeFilters({ ...filters, pace: event.target.value as LibraryFilters["pace"] })
                }
              >
                <option value="all">시간 상관없이</option>
                <option value="quick">5분 안팎으로 짧게</option>
                <option value="short">10분 이내로</option>
                <option value="long">이야기를 천천히 즐기기</option>
              </select>
            </label>
            <label className={styles.filterLabel}>
              내 진도
              <select
                disabled={status !== "ready"}
                value={progress ? filters.record : "all"}
                onChange={(event) =>
                  changeFilters({
                    ...filters,
                    record: event.target.value as LibraryFilters["record"],
                  })
                }
              >
                <option value="all">모든 진도</option>
                <option value="ongoing">진행 중인 콘텐츠</option>
                <option value="completed">마친 콘텐츠</option>
                <option value="new">아직 시작하지 않은 콘텐츠</option>
              </select>
            </label>
          </div>
          <p className={styles.note}>
            진도 조건은 로그인한 계정의 기록으로 표시합니다. 예상 시간은 한 번에 끝내야 하는 제한
            시간이 아닙니다.
          </p>
        </details>
        {status === "error" && (
          <div className={styles.status} role="alert">
            <p>학습 기록을 불러오지 못했어요. 콘텐츠 안내는 살펴볼 수 있습니다.</p>
            <button className={styles.secondary} onClick={() => void refresh(true)}>
              기록 다시 확인
            </button>
          </div>
        )}
        {status === "guest" && (
          <p className={styles.note}>
            로그인하면 내 진도로 찾고 하던 학습을 이어갈 수 있어요.{" "}
            <Link href={loginPath(libraryHref(filters, { focus: selectedId, level: chosenLevel }))}>
              영어 학습 로그인
            </Link>
          </p>
        )}
        {filters.record !== "all" && !progress && status !== "guest" && (
          <p className={styles.note}>로그인하면 선택한 진도 조건을 적용할 수 있어요.</p>
        )}
        {selectedId && !selected && (
          <div className={styles.status}>
            <p>요청한 콘텐츠를 찾지 못했어요. 아래에서 현재 제공하는 콘텐츠를 골라 보세요.</p>
            <button className={styles.secondary} onClick={closePreview}>
              안내 닫기
            </button>
          </div>
        )}
        {selected && (
          <section
            ref={previewRef}
            tabIndex={-1}
            className={styles.preview}
            aria-labelledby="content-preview-title"
          >
            <header className={styles.previewHeading}>
              <div>
                <p className={styles.eyebrow}>BEFORE YOU BEGIN</p>
                <h2 id="content-preview-title">{selected.title}</h2>
                <span>{selected.englishTitle}</span>
              </div>
              <button
                className={styles.previewClose}
                onClick={closePreview}
                aria-label="콘텐츠 안내 닫기"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </header>
            <div className={styles.previewGrid}>
              <div className={styles.previewArt}>
                {selected.kind === "story" ? (
                  <Image
                    src={selected.image}
                    alt={selected.imageAlt}
                    width={800}
                    height={520}
                    sizes="(max-width:760px) 100vw, 450px"
                  />
                ) : (
                  <div className={styles.practiceArt}>
                    {(() => {
                      const Icon = kindIcons[selected.kind];
                      return <Icon size={64} aria-hidden="true" />;
                    })()}
                    <span>{kinds.find((kind) => kind.id === selected.kind)?.label}</span>
                  </div>
                )}
                <p className={styles.meta}>
                  예상 {selected.minutes}분 ·{" "}
                  {selected.chapterCount > 0 ? <>{selected.chapterCount}장 · </> : null}
                  {selected.taskIds.length}개 활동
                </p>
              </div>
              <div className={styles.previewCopy}>
                <p>{selected.synopsis}</p>
                <div className={styles.goalBlocks}>
                  <div>
                    <h3>이렇게 영어를 써 봐요</h3>
                    <p>{selected.guide.goal.ko}</p>
                  </div>
                  <div>
                    <h3>이런 연습을 찾고 있다면</h3>
                    <p>{selected.guide.fit.ko}</p>
                  </div>
                </div>
                {selected.cast.length > 0 && (
                  <details className={styles.cast}>
                    <summary>이야기 속 사람들</summary>
                    {selected.cast.map((person) => (
                      <div className={styles.castEntry} key={person.name}>
                        <strong>{person.name}</strong>
                        <span>{person.role}</span>
                        <p>{person.motivation}</p>
                      </div>
                    ))}
                  </details>
                )}
              </div>
            </div>
            <div className={styles.sample}>
              <h3>어떤 문장으로 배우는지 맛볼까요?</h3>
              <p className={styles.note}>
                콘텐츠를 소개하는 별도의 예문입니다. 맛보기를 읽거나 들어도 진도와 XP는 바뀌지
                않습니다.
              </p>
              <div className={styles.levels} role="group" aria-label="맛보기 난이도">
                {englishLevels.map((level) => (
                  <button
                    key={level.id}
                    className={activeLevel === level.id ? styles.selectedLevel : ""}
                    aria-pressed={activeLevel === level.id}
                    onClick={() => {
                      stopVoice();
                      setChosenLevel(level.id);
                      updateUrl(filters, selected.id, level.id);
                    }}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
              <p className={styles.sampleEnglish} lang="en">
                {selected.guide.sample[activeLevel].en}
              </p>
              {locale === "ko" && (
                <details className={styles.sampleTranslation} key={selected.id + "-" + activeLevel}>
                  <summary>한국어 뜻 살펴보기</summary>
                  <p>{selected.guide.sample[activeLevel].ko}</p>
                </details>
              )}
              <button className={styles.secondary} onClick={listenPreview}>
                <Volume2 size={16} aria-hidden="true" />
                {listening ? "맛보기 듣기 멈추기" : "맛보기 듣기"}
              </button>
              <p className={styles.note}>
                기기 음성으로 재생합니다. 난이도는 언제든 바꿔도 좋습니다.
              </p>
              {audioError && (
                <p className={styles.note} role="status">
                  {audioError}
                </p>
              )}
            </div>
            <div className={styles.previewActions}>
              <Link
                className={styles.primary}
                href={startHref(selected, true)}
                aria-disabled={status === "loading"}
                onClick={(event) => {
                  if (status === "loading") event.preventDefault();
                }}
              >
                {status === "loading"
                  ? "기록 확인 중"
                  : selectedStatus?.finished
                    ? "다시 연습하기"
                    : selectedStatus?.started
                      ? "하던 곳부터 이어하기"
                      : "이 콘텐츠 시작하기"}
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <span className={styles.note}>
                선택한 난이도로 열립니다. 학습 중에도 바꿀 수 있어요.
              </span>
            </div>
            {!!courses.length && (
              <div className={styles.courseLinks}>
                <span>코스로 함께 배우기</span>
                {courses.map((course) => (
                  <Link
                    key={course.id}
                    href={"/english/courses?course=" + course.id + "&level=" + activeLevel}
                  >
                    {course.title.ko}
                    <ArrowRight size={13} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
        <header className={styles.resultHeader}>
          <p className={styles.count} aria-live="polite">
            찾은 콘텐츠 <strong>{filtered.length}</strong> / {props.items.length}
          </p>
          {(filters.query ||
            filters.kind !== "all" ||
            filters.skill !== "all" ||
            filters.pace !== "all" ||
            filters.record !== "all") && (
            <button
              className={styles.secondary}
              onClick={() => changeFilters({ ...defaultLibraryFilters })}
            >
              조건 초기화
            </button>
          )}
        </header>
        <div className={styles.grid}>
          {filtered.map((item) => {
            const record = getDiscoveryStatus(item, progress),
              Icon = kindIcons[item.kind];
            return (
              <article className={styles.card} key={item.id}>
                <Link
                  className={styles.cardArt}
                  href={libraryHref(filters, { focus: item.id, level: chosenLevel })}
                  onClick={(event) => {
                    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                    event.preventDefault();
                    openPreview(item.id);
                  }}
                  aria-label={
                    translateText(item.title, locale) + " · " + translateText("콘텐츠 안내", locale)
                  }
                >
                  {item.kind === "story" ? (
                    <Image
                      className={styles.cardImage}
                      src={item.image}
                      alt={item.imageAlt}
                      fill
                      sizes="(max-width:620px) 100vw, (max-width:1000px) 50vw, 350px"
                    />
                  ) : (
                    <div className={styles.practiceArt}>
                      <Icon size={39} aria-hidden="true" />
                      <span>{kinds.find((kind) => kind.id === item.kind)?.label}</span>
                    </div>
                  )}
                </Link>
                <div className={styles.cardBody}>
                  <p className={styles.meta}>
                    {item.genreLabel} · 예상 {item.minutes}분
                  </p>
                  <h2>{item.title}</h2>
                  <p>{item.guide.goal.ko}</p>
                  <div className={styles.skillTags}>
                    {item.skills.map((skill) => (
                      <span key={skill}>{englishSkills[skill].label}</span>
                    ))}
                  </div>
                  {progress && (
                    <p className={styles.meta}>
                      {record.finished ? "학습 완료" : record.started ? "진행 중" : "아직 시작 전"}{" "}
                      · {record.count}/{record.total}개 활동
                    </p>
                  )}
                  <div className={styles.cardActions}>
                    <Link
                      className={styles.secondary}
                      href={libraryHref(filters, { focus: item.id, level: chosenLevel })}
                      onClick={(event) => {
                        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
                          return;
                        event.preventDefault();
                        openPreview(item.id);
                      }}
                    >
                      안내와 맛보기
                    </Link>
                    <Link
                      href={startHref(item)}
                      aria-disabled={status === "loading"}
                      onClick={(event) => {
                        if (status === "loading") event.preventDefault();
                      }}
                    >
                      {record.finished ? "다시 연습" : record.started ? "이어하기" : "시작하기"}
                      <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {!filtered.length && (
          <div className={styles.empty}>
            <Search size={25} aria-hidden="true" />
            <h2>조건에 맞는 콘텐츠가 없어요</h2>
            <p>다른 표현으로 찾거나 학습 조건을 조금 넓혀 보세요.</p>
            <button
              className={styles.secondary}
              onClick={() => changeFilters({ ...defaultLibraryFilters })}
            >
              모든 콘텐츠 보기
            </button>
          </div>
        )}
        <p className={styles.note}>
          이야기 6편과 집중 연습 19개. 원하는 콘텐츠를 고르거나 코스를 따라 꾸준히 배워 보세요.
        </p>
      </div>
    </div>,
    locale,
  );
}
