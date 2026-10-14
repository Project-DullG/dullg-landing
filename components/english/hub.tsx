"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { localizeEnglishTree } from "@/lib/i18n/english-tree";
import { PracticeLibrary } from "./practice-library";
import Link from "@/components/i18n/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenText,
  CheckCircle,
  Clock,
  Flame,
  Headphones,
  Microphone,
  PencilSimple,
  Sparkle,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  englishLevels,
  englishSkills,
  type EnglishEpisode,
  type EnglishGenre,
  type EnglishLevel,
  type EnglishProgress,
  type EnglishSkill,
} from "@/lib/english/types";
import { getEnglishGrowth } from "@/lib/english/progress";
import styles from "./hub.module.css";

export type EnglishEpisodeSummary = Pick<
  EnglishEpisode,
  | "id"
  | "title"
  | "englishTitle"
  | "genre"
  | "genreLabel"
  | "synopsis"
  | "minutes"
  | "image"
  | "imageAlt"
  | "takeaway"
> & { skills: EnglishSkill[]; taskCount: number; chapterCount: number };
const skillIcons = {
  reading: BookOpenText,
  listening: Headphones,
  writing: PencilSimple,
  speaking: Microphone,
};
const genres: { id: "all" | EnglishGenre; label: string }[] = [
  { id: "all", label: "모든 이야기" },
  { id: "escape", label: "방탈출" },
  { id: "mystery", label: "추리" },
  { id: "fairytale", label: "동화" },
  { id: "everyday", label: "일상" },
  { id: "adventure", label: "탐험·퍼즐" },
];
type AccountState = "loading" | "guest" | "ready" | "error";

export function EnglishHub({
  episodes,
  home = false,
}: {
  episodes: EnglishEpisodeSummary[];
  home?: boolean;
}) {
  const locale = useLocale();
  const [now, setNow] = useState(0);
  const [level, setLevel] = useState<EnglishLevel>("standard");
  const [genre, setGenre] = useState<EnglishGenre | "all">("all");
  const [skill, setSkill] = useState<EnglishSkill | "all">("all");
  const [progress, setProgress] = useState<EnglishProgress | null>(null);
  const [account, setAccount] = useState<AccountState>("loading");
  const [notice, setNotice] = useState("");
  const [savingLevel, setSavingLevel] = useState(false);
  const accountKey = useRef<string | null>(null);
  const requestNumber = useRef(0);
  const guestLevel = useRef<EnglishLevel>("standard");

  const refresh = useCallback(async () => {
    const request = ++requestNumber.current;
    try {
      const response = await fetch("/api/english/progress", {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (request !== requestNumber.current) return;
      if (response.status === 401) {
        accountKey.current = null;
        setProgress(null);
        setAccount("guest");
        setLevel(guestLevel.current);
        return;
      }
      if (!response.ok) throw new Error("progress unavailable");
      const data = (await response.json()) as { progress: EnglishProgress; accountKey: string };
      if (request !== requestNumber.current) return;
      accountKey.current = data.accountKey;
      setNow(Date.now());
      setProgress(data.progress);
      setLevel(data.progress.preferredLevel);
      setAccount("ready");
    } catch {
      if (request !== requestNumber.current) return;
      accountKey.current = null;
      setProgress(null);
      setAccount("error");
    }
  }, []);

  const invalidateRequest = useCallback(() => {
    requestNumber.current++;
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void refresh(), 0);
    const visible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    window.addEventListener("focus", visible);
    document.addEventListener("visibilitychange", visible);
    return () => {
      window.clearTimeout(initialLoad);
      invalidateRequest();
      window.removeEventListener("focus", visible);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [refresh, invalidateRequest]);

  async function chooseLevel(next: EnglishLevel) {
    guestLevel.current = next;
    setLevel(next);
    setNotice("");
    const key = accountKey.current;
    if (!key || account !== "ready") return;
    setSavingLevel(true);
    try {
      const response = await fetch("/api/english/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "level", level: next, accountKey: key }),
      });
      if (!response.ok) {
        setNotice(
          response.status === 409 || response.status === 401
            ? "계정이 바뀌었거나 로그인이 만료되어 기록을 다시 확인합니다."
            : "난이도를 저장하지 못했어요. 잠시 후 다시 선택해 주세요.",
        );
        await refresh();
        return;
      }
      const data = (await response.json()) as { progress: EnglishProgress };
      if (accountKey.current === key) setProgress(data.progress);
    } catch {
      setNotice("난이도를 저장하지 못했어요. 선택한 난이도로 체험은 계속할 수 있습니다.");
    } finally {
      setSavingLevel(false);
    }
  }

  const lead = episodes[0];
  const growth = progress ? getEnglishGrowth(progress, new Date(now)) : null;
  const dueReviews = progress
    ? Object.values(progress.reviews).filter((review) => Date.parse(review.dueAt) <= now).length
    : 0;
  const activeEpisode = progress
    ? [...episodes]
        .filter(
          (episode) =>
            progress.episodes[episode.id]?.completedTasks.length &&
            !progress.episodes[episode.id]?.completedAt,
        )
        .sort((a, b) =>
          progress.episodes[b.id].updatedAt.localeCompare(progress.episodes[a.id].updatedAt),
        )[0]
    : undefined;
  const nextEpisode =
    activeEpisode ||
    episodes.find((episode) => !progress?.episodes[episode.id]?.completedAt) ||
    lead;
  const filtered = episodes.filter(
    (episode) =>
      (genre === "all" || episode.genre === genre) &&
      (skill === "all" || episode.skills.includes(skill)),
  );
  const playHref = (id: string) =>
    `/english/play/${id}?level=${level}${progress?.episodes[id]?.completedAt ? "&replay=1" : ""}`;
  const selectedLevel = englishLevels.find((item) => item.id === level)!;

  return localizeEnglishTree(
    <div className={styles.hub}>
      <div className={styles.shell}>
        <section className={styles.intro} aria-labelledby="english-title">
          <div>
            <p className={styles.eyebrow}>
              THE ENGLISH JOURNAL <span>01 · 첫 번째 페이지</span>
            </p>
            <h1 id="english-title">
              이야기를 따라,
              <br />
              영어가 쌓이는 곳.
            </h1>
          </div>
          <p className={styles.introCopy}>
            문을 열고, 단서를 찾고, 마음을 전하세요.
            <br />
            읽고 듣고 쓰고 말하는 영어를 하나의 이야기 안에서.
          </p>
        </section>

        <nav className={styles.learningNav} aria-label="영어 학습 방식">
          <a href="#library">
            이야기 즐기기 <span>{episodes.length}편</span>
          </a>
          <a href="#practice">
            짧게 집중 연습 <span>회화·문장·리딩</span>
          </a>
          <a href="#journey">
            나의 학습 여정 <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </nav>

        <div className={styles.leadGrid}>
          {lead && (
            <article className={styles.leadStory}>
              <Link
                className={styles.leadArt}
                href={playHref(lead.id)}
                aria-label={`${lead.title} 시작하기`}
              >
                <Image
                  src={lead.image}
                  alt={lead.imageAlt}
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 760px"
                />
                <span className={styles.artNote}>당신의 첫 번째 이야기</span>
              </Link>
              <div className={styles.leadCopy}>
                <div>
                  <p className={styles.storyMeta}>
                    <span>{lead.genreLabel}</span>
                    <span>
                      <Clock size={14} aria-hidden="true" /> 예상 {lead.minutes}분
                    </span>
                  </p>
                  <h2>
                    <Link href={playHref(lead.id)}>{lead.title}</Link>
                  </h2>
                  <p>{lead.synopsis}</p>
                </div>
                <Link className={styles.primaryButton} href={playHref(lead.id)}>
                  이야기 시작하기 <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </div>
            </article>
          )}

          <section className={styles.journey} aria-labelledby="journey-title" id="journey">
            <div className={styles.journeyHead}>
              <h2 id="journey-title">나의 학습 여정</h2>
              <span className={styles.smallEnglish}>MY JOURNEY</span>
            </div>
            {account === "ready" && progress && growth ? (
              <>
                <div className={styles.levelTitle}>
                  <span>Lv.{growth.level}</span>
                  <strong>{growth.title}</strong>
                </div>
                <div className={styles.xpRow}>
                  <span>{growth.xp} XP</span>
                  <span>다음 표식 {growth.nextLevelXp} XP</span>
                </div>
                <progress
                  className={styles.progressBar}
                  value={Math.min(growth.xp, growth.nextLevelXp)}
                  max={growth.nextLevelXp}
                  aria-label="연습 경험치"
                />
                <div className={styles.journeyStats}>
                  <div>
                    <Flame size={20} aria-hidden="true" />
                    <strong>
                      {growth.streak}
                      <small>일</small>
                    </strong>
                    <span>연속 학습</span>
                  </div>
                  <div>
                    <CheckCircle size={20} aria-hidden="true" />
                    <strong>
                      {growth.completedEpisodes}
                      <small>편</small>
                    </strong>
                    <span>마친 이야기</span>
                  </div>
                </div>
                <div className={styles.dailyGoal}>
                  <div>
                    <strong>오늘의 작은 목표</strong>
                    <span>{Math.min(growth.todayActivities, 3)} / 3 활동</span>
                  </div>
                  <progress
                    value={Math.min(growth.todayActivities, 3)}
                    max={3}
                    aria-label="오늘의 학습 목표"
                  />
                  <p>
                    {growth.todayActivities >= 3
                      ? "오늘의 목표를 마쳤어요. 다음 이야기는 내 속도로."
                      : "장면 풀이와 표현 복습을 합쳐 3개씩."}
                  </p>
                </div>
                {nextEpisode && (
                  <Link className={styles.primaryButton} href={playHref(nextEpisode.id)}>
                    {activeEpisode
                      ? "멈춘 이야기 이어하기"
                      : growth.completedEpisodes === episodes.length
                        ? "이야기 다시 연습"
                        : "다음 이야기 시작하기"}
                    <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                )}
                <Link className={styles.reviewLink} href="/english/review">
                  표현 복습{" "}
                  <span>{dueReviews ? `${dueReviews}개가 기다려요` : "배운 표현 모아보기"}</span>
                  <ArrowUpRight size={17} aria-hidden="true" />
                </Link>
                <p className={styles.recordNote}>XP와 레벨은 연습 기록입니다.</p>
                <p className={styles.recordNote}>
                  집중 연습 <strong>{growth.completedPractices}</strong>묶음 완료
                </p>
              </>
            ) : (
              <div className={styles.guestJourney}>
                <BookOpenText size={35} weight="light" aria-hidden="true" />
                <h3>
                  {account === "loading"
                    ? "학습 기록을 확인하고 있어요"
                    : account === "error"
                      ? "학습 기록을 불러오지 못했어요"
                      : "오늘, 첫 페이지를 열어보세요"}
                </h3>
                <p>
                  {account === "error"
                    ? "이야기를 바로 체험하거나 기록을 다시 확인할 수 있습니다."
                    : "하루 3개의 작은 활동부터. 로그인하면 진도와 배운 표현을 저장하고 이어서 연습할 수 있어요."}
                </p>
                {account === "error" ? (
                  <button
                    type="button"
                    className={styles.outlineButton}
                    onClick={() => void refresh()}
                  >
                    기록 다시 확인
                  </button>
                ) : (
                  <Link className={styles.outlineButton} href="/login?next=%2Fenglish">
                    학습 로그인 <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                )}
                <span className={styles.guestNote}>로그인 없이도 이야기를 체험할 수 있어요.</span>
              </div>
            )}
            <div className={styles.skillSummary}>
              {(Object.keys(englishSkills) as EnglishSkill[]).map((id) => {
                const Icon = skillIcons[id];
                return (
                  <div key={id}>
                    <Icon size={18} aria-hidden="true" />
                    <span>{englishSkills[id].label}</span>
                    {progress && <strong>{progress.skills[id]}회</strong>}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <section className={styles.library} id="library" aria-labelledby="library-title">
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.eyebrow}>CHOOSE YOUR STORY</p>
              <h2 id="library-title">오늘은 어떤 이야기로?</h2>
            </div>
            <p>
              지금 플레이할 수 있는 {episodes.length}편<br />
              모든 이야기에서 난이도를 고를 수 있어요.
            </p>
          </div>
          <div className={styles.levelPicker}>
            <fieldset>
              <legend>나에게 맞는 난이도</legend>
              <div className={styles.levelOptions}>
                {englishLevels.map((item) => (
                  <label key={item.id}>
                    <input
                      type="radio"
                      name="english-level"
                      value={item.id}
                      checked={level === item.id}
                      disabled={savingLevel}
                      onChange={() => void chooseLevel(item.id)}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <p>
              {selectedLevel.description}
              <small>이야기는 같고, 문장의 길이와 도움이 달라집니다.</small>
            </p>
          </div>
          {notice && (
            <p className={styles.notice} role="status">
              {notice}
            </p>
          )}
          <div className={styles.filters}>
            <div className={styles.genreOptions} role="group" aria-label="이야기 장르">
              {genres.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={genre === item.id}
                  onClick={() => setGenre(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <label className={styles.skillFilter}>
              연습 영역
              <select
                value={skill}
                onChange={(event) => setSkill(event.target.value as EnglishSkill | "all")}
              >
                <option value="all">전체 영역</option>
                {(Object.keys(englishSkills) as EnglishSkill[]).map((id) => (
                  <option key={id} value={id}>
                    {englishSkills[id].label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className={styles.resultCount} aria-live="polite">
            {filtered.length}편의 이야기
          </p>
          <div className={styles.storyGrid}>
            {filtered.map((episode) => {
              const saved = progress?.episodes[episode.id];
              return (
                <article className={styles.storyCard} key={episode.id}>
                  <Link
                    href={playHref(episode.id)}
                    className={styles.cardArt}
                    aria-label={`${episode.title} 시작하기`}
                  >
                    <Image
                      src={episode.image}
                      alt={episode.imageAlt}
                      fill
                      sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 360px"
                    />
                    <span className={styles.chapter}>
                      EP. {String(episodes.indexOf(episode) + 1).padStart(2, "0")}
                    </span>
                  </Link>
                  <div className={styles.cardBody}>
                    <p className={styles.storyMeta}>
                      <span>{episode.genreLabel}</span>
                      <span>예상 {episode.minutes}분</span>
                    </p>
                    <span className={styles.cardEnglish}>{episode.englishTitle}</span>
                    <p className={styles.cardStructure}>
                      {episode.chapterCount}장 · {episode.taskCount}개 활동
                    </p>
                    <h3>
                      <Link href={playHref(episode.id)}>{episode.title}</Link>
                    </h3>
                    <p className={styles.synopsis}>{episode.synopsis}</p>
                    <div className={styles.cardSkills}>
                      {episode.skills.map((id) => {
                        const Icon = skillIcons[id];
                        return (
                          <span key={id}>
                            <Icon size={15} aria-hidden="true" />
                            {englishSkills[id].label}
                          </span>
                        );
                      })}
                    </div>
                    <Link href={playHref(episode.id)} className={styles.cardAction}>
                      {saved?.completedAt
                        ? "다시 플레이"
                        : saved?.completedTasks.length
                          ? `이어하기 · ${saved.completedTasks.length}/${episode.taskCount}`
                          : "이야기 열기"}
                      <ArrowRight size={18} aria-hidden="true" />
                    </Link>
                    {saved?.completedAt && (
                      <span className={styles.completed}>
                        <CheckCircle size={15} aria-hidden="true" />
                        완료한 이야기
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
          {!filtered.length && (
            <div className={styles.empty}>
              <p>선택한 조건의 이야기가 없어요.</p>
              <button
                type="button"
                className={styles.outlineButton}
                onClick={() => {
                  setGenre("all");
                  setSkill("all");
                }}
              >
                모든 이야기 보기
              </button>
            </div>
          )}
        </section>

        <PracticeLibrary progress={progress} level={level} />

        <section className={styles.learningMethod} aria-labelledby="method-title">
          <div>
            <Sparkle size={24} weight="light" aria-hidden="true" />
            <h2 id="method-title">영어를 써야, 이야기가 움직이니까.</h2>
          </div>
          <p>
            단서를 읽고, 말을 듣고, 필요한 답을 쓰고 말합니다.
            <br />
            배운 표현은 시간이 지난 뒤 보기 없이 다시 떠올려요.
          </p>
          <Link href="/english/about">
            학습 설계 살펴보기
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </section>

        <section className={styles.pathways} aria-labelledby="pathways-title">
          <h2 id="pathways-title">다른 방식으로도 함께 공부해요.</h2>
          <div>
            <Link href="/english/community">
              <span>함께 공부하기</span>
              <h3>
                학습 커뮤니티 <ArrowUpRight size={19} aria-hidden="true" />
              </h3>
              <p>닉네임으로 학습 이야기를 나누고 서로 응원해요.</p>
            </Link>
            <Link href="/speaking">
              <span>개인 학습 · 기존 과정</span>
              <h3>
                TOEIC Speaking <ArrowUpRight size={19} aria-hidden="true" />
              </h3>
              <p>기존 이용 코드로 들어가는 듣기·말하기 코스와 반복 연습.</p>
            </Link>
            <Link href="/academy">
              <span>교사·학원용</span>
              <h3>
                영어 미스터리 수업팩 <ArrowUpRight size={19} aria-hidden="true" />
              </h3>
              <p>영어 단서를 읽고 서로 질문하는 4인 수업 자료.</p>
            </Link>
          </div>
        </section>
        {!home && (
          <p className={styles.studioLink}>
            추리 게임과 퍼즐을 찾고 계신가요?{" "}
            <Link href="/mini-projects">
              공방 게임 둘러보기 <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </p>
        )}
      </div>
    </div>,
    locale,
  );
}
