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
import { englishLevels, type EnglishLevel } from "@/lib/english/types";
import { StudyNavigation } from "./study-navigation";
import { useStudyProgress, type StudyProgressProps } from "./use-study-progress";
import styles from "./library-browser.module.css";

const categories = [
  {
    id: "story" as const,
    label: "이야기 모험",
    description: "영어로 부탁하고 단서를 살피며 이야기를 이어가요.",
  },
  {
    id: "conversation" as const,
    label: "실전 회화",
    description: "공항, 카페, 약속 자리에서 바로 꺼내 쓸 말을 연습해요.",
  },
  {
    id: "sentence" as const,
    label: "문장과 표현",
    description: "단어 순서를 맞추고, 내 뜻을 영어 한 문장으로 전해요.",
  },
  {
    id: "reading" as const,
    label: "읽기와 이해",
    description: "짧은 글을 읽고, 생활 속에서 필요한 정보를 찾아요.",
  },
];
const kinds = [{ id: "all" as const, label: "전체 콘텐츠" }, ...categories];
const kindIcons = {
  story: BookOpen,
  conversation: MessageCircle,
  sentence: Puzzle,
  reading: BookOpen,
};
const practiceImages = {
  conversation: "/assets/english/practice-conversation-v2.webp",
  sentence: "/assets/english/practice-sentence-v2.webp",
  reading: "/assets/english/practice-reading-v2.webp",
};
const practiceAlts = {
  conversation: "실전 회화 연습을 소개하는 그림",
  sentence: "문장과 표현 연습을 소개하는 그림",
  reading: "읽기와 이해 연습을 소개하는 그림",
};
function LibraryArtwork({
  kind,
  image,
  imageAlt,
  className = "",
}: {
  kind: EnglishDiscoveryItem["kind"];
  image: string;
  imageAlt: string;
  className?: string;
}) {
  const locale = useLocale();
  const [failed, setFailed] = useState(false);
  const Icon = kindIcons[kind];
  const source = kind === "story" ? image : practiceImages[kind];
  const alt = kind === "story" ? imageAlt : practiceAlts[kind];
  return (
    <div className={`${styles.artwork} ${className}`}>
      {failed ? (
        <div className={styles.artFallback}>
          <Icon size={42} aria-hidden="true" />
        </div>
      ) : (
        <Image
          src={source}
          alt={translateText(alt, locale)}
          fill
          sizes="(max-width:620px) 100vw, (max-width:1000px) 50vw, 380px"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
const hasConditions = (filters: LibraryFilters) =>
  !!filters.query.trim() ||
  filters.kind !== "all" ||
  filters.skill !== "all" ||
  filters.pace !== "all" ||
  filters.record !== "all";
export function EnglishLibraryBrowser(
  props: StudyProgressProps & {
    items: EnglishDiscoveryItem[];
    initialSearch: ReturnType<typeof parseLibrarySearch>;
    initialView?: "all";
  },
) {
  const locale = useLocale();
  const { progress, status, refresh } = useStudyProgress(props);
  const [filters, setFilters] = useState(props.initialSearch.filters);
  const [showAll, setShowAll] = useState(props.initialView === "all");
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
  function browseHref(nextFilters: LibraryFilters, focus = "", level = chosenLevel, all = showAll) {
    const href = libraryHref(nextFilters, { focus, level });
    const [path, search] = href.split("?");
    const params = new URLSearchParams(search);
    if (all) params.set("view", "all");
    return path + (params.size ? "?" + params.toString() : "");
  }
  function updateUrl(
    nextFilters: LibraryFilters,
    focus: string,
    level: EnglishLevel | undefined,
    push = false,
    all = showAll,
  ) {
    window.history[push ? "pushState" : "replaceState"](
      null,
      "",
      localized(browseHref(nextFilters, focus, level, all)),
    );
  }
  function changeFilters(next: LibraryFilters, all = hasConditions(next), push = false) {
    setShowAll(all);
    setFilters(next);
    setSelectedId("");
    stopVoice();
    updateUrl(next, "", chosenLevel, push, all);
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
      setShowAll(new URLSearchParams(window.location.search).get("view") === "all");
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
  const browsing = !showAll && !hasConditions(filters);
  const starters = ["conversation-cafe", "sentence-requests", "reading-notice"].flatMap((id) => {
    const item = props.items.find((candidate) => candidate.id === id);
    return item ? [item] : [];
  });
  function renderCard(item: EnglishDiscoveryItem, compact = false) {
    const record = getDiscoveryStatus(item, progress);
    return (
      <article className={`${styles.card} ${compact ? styles.compactCard : ""}`} key={item.id}>
        <Link
          className={styles.cardLink}
          href={browseHref(filters, item.id)}
          aria-label={translateText(item.title, locale) + " · " + translateText("살펴보기", locale)}
          aria-describedby={`library-goal-${item.id}`}
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            openPreview(item.id);
          }}
        >
          <LibraryArtwork
            key={item.id}
            kind={item.kind}
            image={item.image}
            imageAlt={item.imageAlt}
            className={styles.cardArt}
          />
          <div className={styles.cardBody}>
            <p className={styles.meta}>
              <span>{categories.find((category) => category.id === item.kind)?.label}</span>
              <span>약 {item.minutes}분</span>
            </p>
            <h3>{item.title}</h3>
            <p id={`library-goal-${item.id}`} className={styles.cardGoal}>
              {item.guide.goal.ko}
            </p>
            {progress && (
              <span className={styles.record}>
                {record.finished ? "학습 완료" : record.started ? "진행 중" : "아직 시작 전"} ·{" "}
                {record.count}/{record.total}개 활동
              </span>
            )}
            <span className={styles.cardAction}>
              살펴보기 <ArrowRight size={17} aria-hidden="true" />
            </span>
          </div>
        </Link>
      </article>
    );
  }
  return localizeEnglishTree(
    <div className={styles.page}>
      <div className={styles.shell}>
        <StudyNavigation level={activeLevel} />
        <header className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>CHOOSE YOUR ENGLISH MOMENT</p>
            <h1>오늘은 어떤 영어를 해볼까요?</h1>
            <p>이야기에 빠져들어도, 필요한 표현부터 연습해도 좋아요.</p>
          </div>
          <Link className={styles.secondary} href="/english/courses">
            차근차근 배우고 싶다면 <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </header>
        <form
          className={styles.searchForm}
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            setShowAll(true);
            updateUrl(filters, selectedId, chosenLevel, false, true);
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
            placeholder="카페, 공항, 도서관…"
            onChange={(event) => changeFilters({ ...filters, query: event.target.value })}
          />
          <button className={styles.searchButton} type="submit">
            찾기
          </button>
        </form>
        {!browsing && (
          <>
            <div className={styles.kinds} role="group" aria-label="콘텐츠 분류">
              {kinds.map((kind) => (
                <button
                  type="button"
                  key={kind.id}
                  className={filters.kind === kind.id ? styles.activeKind : ""}
                  aria-pressed={filters.kind === kind.id}
                  onClick={() => changeFilters({ ...filters, kind: kind.id }, true)}
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
              <summary>시간과 연습 방법으로 좁혀보기</summary>
              <div className={styles.filterGrid}>
                <label>
                  연습 방법
                  <select
                    value={filters.skill}
                    onChange={(event) =>
                      changeFilters(
                        { ...filters, skill: event.target.value as LibraryFilters["skill"] },
                        true,
                      )
                    }
                  >
                    <option value="all">어떤 방법이든 좋아요</option>
                    <option value="reading">영어 글 읽기</option>
                    <option value="listening">듣고 이해하기</option>
                    <option value="writing">영어로 직접 쓰기</option>
                    <option value="speaking">소리 내어 말하기</option>
                  </select>
                </label>
                <label>
                  공부할 시간
                  <select
                    value={filters.pace}
                    onChange={(event) =>
                      changeFilters(
                        { ...filters, pace: event.target.value as LibraryFilters["pace"] },
                        true,
                      )
                    }
                  >
                    <option value="all">시간 상관없이</option>
                    <option value="quick">5분 안팎</option>
                    <option value="short">10분 이내</option>
                    <option value="long">이야기를 천천히</option>
                  </select>
                </label>
                <label>
                  내 학습 기록
                  <select
                    disabled={status !== "ready"}
                    value={progress ? filters.record : "all"}
                    onChange={(event) =>
                      changeFilters(
                        { ...filters, record: event.target.value as LibraryFilters["record"] },
                        true,
                      )
                    }
                  >
                    <option value="all">모든 콘텐츠</option>
                    <option value="ongoing">하던 학습 이어가기</option>
                    <option value="completed">마친 학습 다시 하기</option>
                    <option value="new">아직 시작하지 않은 학습</option>
                  </select>
                </label>
              </div>
              <p className={styles.note}>
                학습 기록은 로그인한 계정으로 확인해요. 예상 시간은 내 속도에 맞춰 나눠 써도 좋아요.
              </p>
            </details>
          </>
        )}
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
            로그인하면 하던 학습과 배운 표현을 이어갈 수 있어요.{" "}
            <Link href={loginPath(browseHref(filters, selectedId))}>영어 학습 로그인</Link>
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
                <p className={styles.eyebrow}>YOUR NEXT EXPERIENCE</p>
                <h2 id="content-preview-title">{selected.title}</h2>
                <span>
                  {categories.find((category) => category.id === selected.kind)?.label} · 약{" "}
                  {selected.minutes}분
                </span>
              </div>
              <button
                type="button"
                className={styles.previewClose}
                onClick={closePreview}
                aria-label="콘텐츠 안내 닫기"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </header>
            <div className={styles.previewGrid}>
              <LibraryArtwork
                key={selected.id}
                kind={selected.kind}
                image={selected.image}
                imageAlt={selected.imageAlt}
                className={styles.previewArt}
              />
              <div className={styles.previewCopy}>
                <h3>이렇게 영어를 써 봐요</h3>
                <p>{selected.guide.goal.ko}</p>
                <details className={styles.moreInfo}>
                  <summary>
                    {selected.kind === "story" ? "이야기 더 알아보기" : "어떤 연습인지 알아보기"}
                  </summary>
                  <p>{selected.synopsis}</p>
                  <h4>이런 연습을 찾고 있다면</h4>
                  <p>{selected.guide.fit.ko}</p>
                  {selected.cast.length > 0 && (
                    <div className={styles.cast}>
                      <h4>이야기 속 사람들</h4>
                      {selected.cast.map((person) => (
                        <div className={styles.castEntry} key={person.name}>
                          <strong>{person.name}</strong>
                          <span>{person.role}</span>
                          <p>{person.motivation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className={styles.meta}>
                    {selected.chapterCount > 0 ? <>{selected.chapterCount}장 · </> : null}
                    {selected.taskIds.length}개 활동
                  </p>
                </details>
                <div className={styles.levelPicker}>
                  <span>시작할 난이도</span>
                  <div className={styles.levels} role="group" aria-label="학습 난이도">
                    {englishLevels.map((level) => (
                      <button
                        type="button"
                        key={level.id}
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
                </div>
                <details
                  className={styles.sample}
                  key={selected.id}
                  onToggle={(event) => {
                    if (!event.currentTarget.open) stopVoice();
                  }}
                >
                  <summary>문장 난이도를 미리 살펴볼까요?</summary>
                  <p className={styles.sampleEnglish} lang="en">
                    {selected.guide.sample[activeLevel].en}
                  </p>
                  {locale === "ko" && (
                    <details className={styles.sampleTranslation} key={activeLevel}>
                      <summary>뜻 보기</summary>
                      <p>{selected.guide.sample[activeLevel].ko}</p>
                    </details>
                  )}
                  <button type="button" className={styles.textButton} onClick={listenPreview}>
                    <Volume2 size={16} aria-hidden="true" />
                    {listening ? "듣기 멈추기" : "맛보기 듣기"}
                  </button>
                  <p className={styles.note}>
                    맛보기는 기기 음성으로 들을 수 있어요. 진도와 XP에는 포함되지 않아요.
                  </p>
                  {audioError && (
                    <p className={styles.note} role="status">
                      {audioError}
                    </p>
                  )}
                </details>
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
                          : "시작하기"}
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                </div>
                {!!courses.length && (
                  <details className={styles.courseLinks}>
                    <summary>차근차근 이어 배울 코스</summary>
                    {courses.map((course) => (
                      <Link
                        key={course.id}
                        href={"/english/courses?course=" + course.id + "&level=" + activeLevel}
                      >
                        {course.title.ko}
                        <ArrowRight size={13} aria-hidden="true" />
                      </Link>
                    ))}
                  </details>
                )}
              </div>
            </div>
          </section>
        )}
        {browsing ? (
          <>
            <section className={styles.categorySection} aria-labelledby="category-title">
              <div className={styles.sectionHeading}>
                <div>
                  <h2 id="category-title">어떻게 배워보고 싶나요?</h2>
                  <p>마음이 가는 쪽부터 골라보세요. 난이도는 시작 전에 바꿀 수 있어요.</p>
                </div>
              </div>
              <div className={styles.categoryGrid}>
                {categories.map((category) => {
                  const content = props.items.filter((item) => item.kind === category.id);
                  if (!content.length) return null;
                  const first = content[0],
                    min = Math.min(...content.map((item) => item.minutes)),
                    max = Math.max(...content.map((item) => item.minutes));
                  return (
                    <Link
                      key={category.id}
                      className={styles.categoryCard}
                      href={browseHref(
                        { ...defaultLibraryFilters, kind: category.id },
                        "",
                        chosenLevel,
                        true,
                      )}
                      onClick={(event) => {
                        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
                          return;
                        event.preventDefault();
                        changeFilters({ ...defaultLibraryFilters, kind: category.id }, true, true);
                      }}
                    >
                      <LibraryArtwork
                        kind={category.id}
                        image={first.image}
                        imageAlt={first.imageAlt}
                        className={styles.categoryArt}
                      />
                      <div>
                        <h3>{category.label}</h3>
                        <p>{category.description}</p>
                        <span className={styles.categoryMeta}>
                          {content.length}개 콘텐츠 · 약 {min === max ? min : `${min}~${max}`}분
                        </span>
                        <span className={styles.categoryAction}>
                          둘러보기 <ArrowRight size={16} aria-hidden="true" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
            {!!starters.length && (
              <section className={styles.starters} aria-labelledby="starter-title">
                <header className={styles.sectionHeading}>
                  <div>
                    <h2 id="starter-title">가볍게 시작하는 연습</h2>
                    <p>카페에서 말하기, 부탁하는 문장, 공지 읽기. 익숙한 상황부터 해보세요.</p>
                  </div>
                </header>
                <div className={styles.grid}>{starters.map((item) => renderCard(item))}</div>
              </section>
            )}
            <div className={styles.allContent}>
              <div>
                <h2>더 둘러보고 싶다면</h2>
                <p>모든 콘텐츠를 한눈에 보고, 원하는 조건으로 찾아보세요.</p>
              </div>
              <Link
                className={styles.primary}
                href={browseHref({ ...defaultLibraryFilters }, "", chosenLevel, true)}
                onClick={(event) => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  event.preventDefault();
                  changeFilters({ ...defaultLibraryFilters }, true, true);
                }}
              >
                전체 콘텐츠 {props.items.length}개 보기 <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </>
        ) : (
          <section className={styles.results} aria-labelledby="library-results-title">
            <header className={styles.resultHeader}>
              <div>
                <h2 id="library-results-title">
                  {filters.query.trim()
                    ? "찾은 콘텐츠"
                    : kinds.find((kind) => kind.id === filters.kind)?.label}
                </h2>
                <p className={styles.count} aria-live="polite">
                  {filtered.length}개 콘텐츠
                </p>
              </div>
              <div className={styles.resultActions}>
                {hasConditions(filters) && (
                  <button
                    type="button"
                    className={styles.textButton}
                    onClick={() => changeFilters({ ...defaultLibraryFilters }, true)}
                  >
                    조건 지우기
                  </button>
                )}
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={() => changeFilters({ ...defaultLibraryFilters }, false, true)}
                >
                  분류부터 다시 보기
                </button>
              </div>
            </header>
            <div className={styles.grid}>{filtered.map((item) => renderCard(item, true))}</div>
            {!filtered.length && (
              <div className={styles.empty}>
                <Search size={28} aria-hidden="true" />
                <h3>조건에 맞는 콘텐츠가 없어요</h3>
                <p>다른 말로 검색하거나 조건을 조금 넓혀보세요.</p>
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={() => changeFilters({ ...defaultLibraryFilters }, true)}
                >
                  모든 콘텐츠 보기
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </div>,
    locale,
  );
}
