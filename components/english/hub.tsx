"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { localizeEnglishTree } from "@/lib/i18n/english-tree";
import { translateText } from "@/lib/i18n/translate";
import { StudyNavigation } from "./study-navigation";
import { allEnglishContent } from "@/lib/english/catalog";
import { getEnglishWeek } from "@/lib/english/journal";
import {
  getEnglishHomePlan,
  getEnglishContentTotals,
  getEnglishCourseStart,
  getEnglishHomePreviewHref,
} from "@/lib/english/home-plan";
import { getEnglishContentGuide } from "@/lib/english/content-guides";
import type { EnglishPracticePack } from "@/lib/english/practice";
import { englishCourses } from "@/lib/english/courses";
import { getEnglishReviewQueue } from "@/lib/english/review-queue";
import Link from "@/components/i18n/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenText,
  Check,
  Clock,
  Flame,
  MessageCircle,
  Puzzle,
  Sparkles,
  ChevronRight,
  NotebookPen,
  RotateCcw,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  englishLevels,
  type EnglishEpisode,
  type EnglishLevel,
  type EnglishProgress,
  type EnglishSkill,
} from "@/lib/english/types";
import { getEnglishGrowth } from "@/lib/english/progress";
import {
  canChooseEnglishLevel,
  ENGLISH_SESSION_TIMEOUT_MS,
  readEnglishSession,
  type EnglishSessionState,
} from "@/lib/english/session-ui";
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
  const [progress, setProgress] = useState<EnglishProgress | null>(null);
  const [account, setAccount] = useState<EnglishSessionState>("loading");
  const [notice, setNotice] = useState("");
  const [savingLevel, setSavingLevel] = useState(false);
  const accountKey = useRef<string | null>(null);
  const requestNumber = useRef(0);
  const guestLevel = useRef<EnglishLevel>("standard");
  const accountState = useRef<EnglishSessionState>("loading");
  const levelSaving = useRef(false);
  const refreshAfterSave = useRef(false);

  const refresh = useCallback(async () => {
    if (levelSaving.current) {
      refreshAfterSave.current = true;
      return;
    }
    const request = ++requestNumber.current;
    accountState.current = "loading";
    setAccount("loading");
    try {
      const data = await readEnglishSession();
      if (request !== requestNumber.current) return;
      if (!data) {
        accountKey.current = null;
        accountState.current = "guest";
        setProgress(null);
        setAccount("guest");
        setLevel(guestLevel.current);
        return;
      }
      accountKey.current = data.accountKey;
      accountState.current = "ready";
      setNow(Date.now());
      setProgress(data.progress);
      setLevel(data.progress.preferredLevel);
      setAccount("ready");
    } catch {
      if (request !== requestNumber.current) return;
      accountKey.current = null;
      accountState.current = "error";
      setProgress(null);
      setAccount("error");
    }
  }, []);

  const invalidateRequest = useCallback(() => {
    requestNumber.current++;
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      const requested = new URLSearchParams(window.location.search).get("level");
      if (englishLevels.some((item) => item.id === requested)) {
        guestLevel.current = requested as EnglishLevel;
        setLevel(guestLevel.current);
      }
      void refresh();
    }, 0);
    const clockTick = window.setInterval(() => setNow(Date.now()), 60_000);
    const visible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    window.addEventListener("focus", visible);
    document.addEventListener("visibilitychange", visible);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(clockTick);
      invalidateRequest();
      window.removeEventListener("focus", visible);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [refresh, invalidateRequest]);

  async function chooseLevel(next: EnglishLevel) {
    if (!canChooseEnglishLevel(accountState.current, levelSaving.current)) return;
    guestLevel.current = next;
    setLevel(next);
    setNotice("");
    const key = accountKey.current;
    if (!key || accountState.current !== "ready") return;
    levelSaving.current = true;
    setSavingLevel(true);
    try {
      const response = await fetch("/api/english/progress", {
        method: "POST",
        signal: AbortSignal.timeout(ENGLISH_SESSION_TIMEOUT_MS),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "level", level: next, accountKey: key }),
      });
      if (!response.ok) {
        setNotice(
          response.status === 409 || response.status === 401
            ? "계정이 바뀌었거나 로그인이 만료되어 기록을 다시 확인합니다."
            : "난이도를 저장하지 못했어요. 잠시 후 다시 선택해 주세요.",
        );
        refreshAfterSave.current = true;
        return;
      }
      const data = (await response.json()) as { progress: EnglishProgress };
      if (accountKey.current === key) setProgress(data.progress);
    } catch {
      setNotice("난이도를 저장하지 못했어요. 선택한 난이도로 체험은 계속할 수 있습니다.");
    } finally {
      levelSaving.current = false;
      setSavingLevel(false);
      if (refreshAfterSave.current) {
        refreshAfterSave.current = false;
        void refresh();
      }
    }
  }

  const ready = account === "ready" && !!progress;
  const growth = ready ? getEnglishGrowth(progress, new Date(now)) : null;
  const plan = getEnglishHomePlan(ready ? progress : null, level);
  const guide = getEnglishContentGuide(plan.content.id)!;
  const totals = getEnglishContentTotals(ready ? progress : null);
  const week = ready ? getEnglishWeek(progress, new Date(now)) : [];
  const reviewPlan = getEnglishReviewQueue(
    ready ? progress : null,
    allEnglishContent.flatMap((item) => item.expressions),
    new Date(now),
  );
  const practiceArt = (format: string) => "/assets/english/practice-" + format + "-v2.webp";
  const planArt =
    plan.content.format === "practice"
      ? practiceArt(
          (plan.content as typeof plan.content & { practiceFormat: string }).practiceFormat,
        )
      : plan.content.image;
  const levels = englishLevels.find((item) => item.id === level)!;
  const planLabel =
    plan.reason === "continue"
      ? "멈춘 곳부터, 가볍게 이어가요"
      : plan.reason === "course-next"
        ? "배운 영어를 다음 장면으로"
        : plan.reason === "first-step"
          ? "부탁 한마디부터 시작해요"
          : plan.reason === "replay"
            ? "다른 난이도로 다시 만나봐요"
            : "영어로 여는 첫 번째 이야기";
  const groups = [
    {
      kind: "conversation",
      title: "실전 회화",
      copy: "여행과 일상에서 주고받는 영어",
      icon: MessageCircle,
      count: allEnglishContent.filter(
        (item) =>
          item.format === "practice" &&
          (item as EnglishPracticePack).practiceFormat === "conversation",
      ).length,
    },
    {
      kind: "sentence",
      title: "문장과 표현",
      copy: "내 생각을 한 문장으로 만드는 연습",
      icon: Puzzle,
      count: allEnglishContent.filter(
        (item) =>
          item.format === "practice" && (item as EnglishPracticePack).practiceFormat === "sentence",
      ).length,
    },
    {
      kind: "reading",
      title: "읽기와 이해",
      copy: "짧은 글의 뜻을 읽고 내 말로 정리하기",
      icon: BookOpenText,
      count: allEnglishContent.filter(
        (item) =>
          item.format === "practice" && (item as EnglishPracticePack).practiceFormat === "reading",
      ).length,
    },
  ];
  return localizeEnglishTree(
    <div className={styles.hub}>
      <div className={styles.shell}>
        <StudyNavigation level={level} />
        <header className={styles.welcome}>
          <div>
            <p className={styles.eyebrow}>YOUR DAILY ENGLISH</p>
            <h1 id="english-title">오늘도, 영어 한 장면.</h1>
            <p>마음에 드는 이야기를 즐기고, 배운 영어를 내 말로 써 보세요.</p>
          </div>
          <details className={styles.levelSettings}>
            <summary>
              내 난이도 <strong>{levels.label}</strong>
            </summary>
            <fieldset>
              <legend>다음 학습의 난이도</legend>
              {englishLevels.map((item) => (
                <label key={item.id}>
                  <input
                    type="radio"
                    name="english-level"
                    value={item.id}
                    checked={level === item.id}
                    disabled={!canChooseEnglishLevel(account, savingLevel)}
                    onChange={() => void chooseLevel(item.id)}
                  />
                  <span>
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </span>
                </label>
              ))}
              <p>하던 학습은 저장된 난이도로 이어집니다. 학습 중에도 바꿀 수 있어요.</p>
            </fieldset>
          </details>
        </header>
        {notice && (
          <p className={styles.notice} role="status">
            {notice}
          </p>
        )}
        {account === "error" && (
          <div className={styles.error} role="alert">
            <p>학습 기록을 불러오지 못했어요. 체험은 계속할 수 있습니다.</p>
            <button onClick={() => void refresh()}>기록 다시 확인</button>
          </div>
        )}
        <div className={styles.dashboard}>
          <section className={styles.nextCard} aria-labelledby="next-learning-title">
            <div className={styles.nextCopy}>
              <span className={styles.pill}>{planLabel}</span>
              <h2 id="next-learning-title">{plan.content.title}</h2>
              <p>{guide.goal.ko}</p>
              <div className={styles.meta}>
                <span>
                  <Clock size={15} aria-hidden="true" />
                  예상 {plan.content.minutes}분
                </span>
                <span>{englishLevels.find((item) => item.id === plan.level)?.label}</span>
                <span>{plan.total}개 활동</span>
              </div>
              {plan.reason === "continue" && (
                <div className={styles.resumeProgress}>
                  <progress value={plan.count} max={plan.total} aria-label="이어 할 학습 진도" />
                  <span>
                    {plan.count}/{plan.total} 활동 완료
                  </span>
                </div>
              )}
              <Link
                className={styles.primaryButton}
                href={plan.href}
                aria-disabled={account === "loading"}
                onClick={(event) => {
                  if (account === "loading") event.preventDefault();
                }}
              >
                {account === "loading"
                  ? "학습 기록 확인 중"
                  : plan.reason === "continue"
                    ? "이어서 배우기"
                    : plan.reason === "replay"
                      ? "다시 연습하기"
                      : "학습 시작하기"}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link
                className={styles.textLink}
                href={"/english/library?focus=" + plan.content.id + "&level=" + plan.level}
              >
                시작 전에 살펴보기 <ChevronRight size={15} aria-hidden="true" />
              </Link>
            </div>
            <div className={styles.nextArt}>
              <Image
                src={planArt}
                alt={
                  plan.content.format === "practice"
                    ? "일상에서 영어를 연습하는 장면"
                    : plan.content.imageAlt
                }
                fill
                priority
                sizes="(max-width:700px) 100vw, 450px"
              />
            </div>
          </section>
          <aside className={styles.todayCard} aria-labelledby="journey-title" id="journey">
            <div className={styles.sectionLabel}>
              <Sparkles size={17} aria-hidden="true" />
              <h2 id="journey-title">오늘의 작은 성취</h2>
            </div>
            {ready && growth ? (
              <>
                <div className={styles.goalNumber}>
                  <strong>
                    {Math.min(growth.todayActivities, 3)}
                    <small> / 3</small>
                  </strong>
                  <span>장면 풀이와 표현 복습</span>
                </div>
                <progress
                  value={Math.min(growth.todayActivities, 3)}
                  max={3}
                  aria-label="오늘의 학습 목표"
                />
                <p>
                  {growth.todayActivities >= 3
                    ? "오늘의 목표를 마쳤어요. 더 배우거나 쉬어 가도 좋아요."
                    : "작은 활동 세 개면 충분해요. 한 장면씩 쌓아가세요."}
                </p>
                <div className={styles.week} aria-label="최근 7일 학습 기록">
                  {week.map((day) => (
                    <div key={day.day}>
                      <span
                        className={day.active ? styles.activeDay : ""}
                        title={day.day}
                        role="img"
                        aria-label={
                          day.day +
                          " · " +
                          translateText(day.active ? "학습한 날" : "쉬어 간 날", locale)
                        }
                      >
                        {day.active ? <Check size={15} aria-hidden="true" /> : "·"}
                      </span>
                      <small>
                        {new Intl.DateTimeFormat(locale === "en" ? "en-US" : "ko-KR", {
                          weekday: "narrow",
                          timeZone: "Asia/Seoul",
                        }).format(new Date(day.day + "T12:00:00Z"))}
                      </small>
                    </div>
                  ))}
                </div>
                <div className={styles.growthRow}>
                  <span>
                    <Flame size={15} aria-hidden="true" />
                    {growth.streak}일 연속
                  </span>
                  <span>
                    Lv.{growth.level} · {growth.xp} XP
                  </span>
                </div>
                <Link className={styles.textLink} href="/english/journal">
                  나의 기록과 배운 표현 <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </>
            ) : (
              <div className={styles.guestGoal}>
                <span className={styles.goalDots}>
                  <i />
                  <i />
                  <i />
                </span>
                <h3>{account === "loading" ? "학습 기록 확인 중" : "오늘의 첫 장면을 열어봐요"}</h3>
                <p>로그인하면 진도와 배운 표현이 쌓여요. 로그인 없이도 먼저 체험할 수 있습니다.</p>
                <Link className={styles.secondaryButton} href="/login?next=%2Fenglish">
                  로그인하고 기록 남기기 <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            )}
          </aside>
        </div>
        <div className={styles.learningTools}>
          <Link
            href={
              ready && reviewPlan.items.length ? "/english/review" : "/english/journal#expressions"
            }
          >
            <span className={styles.toolIcon}>
              <RotateCcw size={21} aria-hidden="true" />
            </span>
            <div>
              <strong>
                {ready && reviewPlan.items.length ? "지금 떠올릴 표현" : "내 표현 노트"}
              </strong>
              <p>
                {ready ? (
                  reviewPlan.items.length ? (
                    <>복습할 표현 {reviewPlan.items.length}개</>
                  ) : (
                    <>배운 표현 {totals.expressions}개</>
                  )
                ) : (
                  "배운 표현을 다시 듣고 떠올려요"
                )}
              </p>
            </div>
            <ChevronRight size={19} aria-hidden="true" />
          </Link>
          <Link href="/english/journal">
            <span className={styles.toolIcon}>
              <NotebookPen size={21} aria-hidden="true" />
            </span>
            <div>
              <strong>차곡차곡 쌓이는 학습</strong>
              <p>
                {ready ? (
                  locale === "en" ? (
                    `${totals.stories} stories · ${totals.practices} practice packs completed`
                  ) : (
                    <>
                      이야기 {totals.stories}편 · 집중 연습 {totals.practices}개 완료
                    </>
                  )
                ) : (
                  "마친 학습과 일주일 기록을 한눈에"
                )}
              </p>
            </div>
            <ChevronRight size={19} aria-hidden="true" />
          </Link>
        </div>
        <section className={styles.storySection} aria-labelledby="library-title" id="library">
          <div className={styles.sectionHead}>
            <div>
              <span className={styles.kicker}>PLAY A STORY</span>
              <h2 id="library-title">다음 장면이 궁금해지는 영어</h2>
              <p>단서를 따라가고, 마음을 전하고, 작은 문제를 함께 해결해요.</p>
            </div>
            <Link className={styles.textLink} href={"/english/library?kind=story&level=" + level}>
              이야기 모험 모두 보기 <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className={styles.storyGrid}>
            {episodes.map((episode) => {
              const episodeGuide = getEnglishContentGuide(episode.id)!;
              return (
                <article className={styles.storyCard} key={episode.id}>
                  <Link
                    href={getEnglishHomePreviewHref(episode.id, ready ? progress : null, level)!}
                    className={styles.cardArt}
                    aria-label={episode.title + " 상세 보기"}
                  >
                    <Image
                      src={episode.image}
                      alt={episode.imageAlt}
                      fill
                      sizes="(max-width:600px) 100vw, (max-width:950px) 50vw, 350px"
                    />
                    <span className={styles.genre}>{episode.genreLabel}</span>
                  </Link>
                  <div className={styles.cardBody}>
                    <p className={styles.storyMeta}>
                      {episode.chapterCount}장 · 예상 {episode.minutes}분
                    </p>
                    <h3>
                      <Link
                        href={
                          getEnglishHomePreviewHref(episode.id, ready ? progress : null, level)!
                        }
                      >
                        {episode.title}
                      </Link>
                    </h3>
                    <p>{episodeGuide.fit.ko}</p>
                    <Link
                      className={styles.textLink}
                      href={getEnglishHomePreviewHref(episode.id, ready ? progress : null, level)!}
                    >
                      이야기 살펴보기 <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
        <section
          className={styles.practiceSection}
          aria-labelledby="practice-library-title"
          id="practice"
        >
          <div className={styles.sectionHead}>
            <div>
              <span className={styles.kicker}>ENGLISH FOR REAL LIFE</span>
              <h2 id="practice-library-title">짧게 배워, 바로 써먹는 영어</h2>
              <p>오늘 필요한 연습만 골라서 가볍게 시작해도 좋아요.</p>
            </div>
          </div>
          <div className={styles.practiceGrid}>
            {groups.map((group) => {
              const Icon = group.icon;
              return (
                <Link
                  className={styles.practiceCard}
                  key={group.kind}
                  href={"/english/library?kind=" + group.kind + "&level=" + level}
                >
                  <div>
                    <Image
                      src={practiceArt(group.kind)}
                      alt=""
                      width={600}
                      height={400}
                      sizes="(max-width:650px) 100vw, 350px"
                    />
                  </div>
                  <section>
                    <span className={styles.practiceIcon}>
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <h3>{group.title}</h3>
                    <p>{group.copy}</p>
                    <span className={styles.textLink}>
                      {group.count}개 연습 살펴보기 <ArrowRight size={16} aria-hidden="true" />
                    </span>
                  </section>
                </Link>
              );
            })}
          </div>
        </section>
        <section className={styles.courseSection} aria-labelledby="course-home-title">
          <div className={styles.sectionHead}>
            <div>
              <span className={styles.kicker}>KEEP YOUR MOMENTUM</span>
              <h2 id="course-home-title">꾸준히 배우고 싶다면, 코스를 따라</h2>
              <p>짧은 연습에서 익힌 영어를 이야기 속에서 다시 써 봐요.</p>
            </div>
            <Link className={styles.textLink} href={"/english/courses?level=" + level}>
              코스 목차 보기 <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className={styles.courseGrid}>
            {englishCourses.map((course, index) => {
              const start = getEnglishCourseStart(course.id, ready ? progress : null, level)!;
              return (
                <article className={styles.courseCard} key={course.id}>
                  <span className={styles.courseNumber}>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{course.title.ko}</h3>
                  <p>{course.description.ko}</p>
                  <span className={styles.courseMeta}>
                    {course.units.length}개 콘텐츠
                    {ready && <> · {start.state.completedUnits}개 완료</>}
                  </span>
                  <Link
                    href={"/english/courses?course=" + course.id + "&level=" + level}
                    className={styles.textLink}
                  >
                    이 코스 살펴보기 <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
        <div className={styles.communityStrip}>
          <div>
            <MessageCircle size={24} aria-hidden="true" />
            <p>
              <strong>혼자 배워도, 함께 꾸준히.</strong>
              <span>배운 표현과 작은 성취를 커뮤니티에 나눠보세요.</span>
            </p>
          </div>
          <Link href="/english/community">
            커뮤니티 가기 <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <p className={styles.recordNote}>
          XP와 레벨은 연습 기록입니다. 난이도는 내가 편한 수준으로 고르면 됩니다.
        </p>
        {!home && (
          <p className={styles.studioLink}>
            추리 게임과 퍼즐도 즐기고 싶다면{" "}
            <Link href="/studio">
              작품·활동 <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </p>
        )}
      </div>
    </div>,
    locale,
  );
}
