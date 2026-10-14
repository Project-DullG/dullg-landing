"use client";
import Image from "next/image";
import { useLocale } from "next-intl";
import { ArrowRight, BookOpen, Check, Puzzle } from "lucide-react";
import Link from "@/components/i18n/link";
import {
  englishCourses,
  getEnglishCourse,
  getCourseState,
  getCourseHref,
} from "@/lib/english/courses";
import { getEnglishEpisode } from "@/lib/english/catalog";
import { emptyEnglishProgress } from "@/lib/english/progress";
import { englishLevels, type EnglishLevel } from "@/lib/english/types";
import { localizeEnglishTree } from "@/lib/i18n/english-tree";
import { StudyNavigation } from "./study-navigation";
import { useStudyProgress, type StudyProgressProps } from "./use-study-progress";
import styles from "./study.module.css";

export function EnglishCourses(
  props: StudyProgressProps & { courseId?: string; level?: EnglishLevel },
) {
  const locale = useLocale();
  const { progress, status, refresh } = useStudyProgress(props);
  const course = getEnglishCourse(props.courseId || "") || englishCourses[0];
  const level = props.level || progress?.preferredLevel || "standard";
  const state = getCourseState(course, progress || emptyEnglishProgress());
  const href = (id: string, completed = false, inProgress = false) =>
    getCourseHref(id, inProgress ? progress?.episodes[id]?.level || level : level, {
      courseId: course.id,
      replay: completed,
    })!;
  return localizeEnglishTree(
    <div className={styles.page}>
      <div className={styles.shell}>
        <StudyNavigation />
        <header className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>A PATH THROUGH YOUR LIBRARY</p>
            <h1>어디서 시작할지 고민된다면</h1>
            <p>
              목적에 맞는 순서로 이야기와 짧은 연습을 함께 골랐어요. 원하는 활동부터 자유롭게
              시작해도 좋습니다.
            </p>
          </div>
          <Link className={styles.secondary} href="/english">
            전체 콘텐츠 보기 <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </header>
        {status === "guest" && (
          <div className={styles.status}>
            <p>
              로그인 없이도 코스를 체험할 수 있어요. 로그인하면 이미 마친 활동을 반영해 다음 학습을
              안내합니다.
            </p>
            <Link
              href={
                "/login?next=" +
                encodeURIComponent("/english/courses?course=" + course.id + "&level=" + level)
              }
              className={styles.secondary}
            >
              로그인하고 이어서 배우기
            </Link>
          </div>
        )}
        {status === "loading" && (
          <p className={styles.note} role="status">
            학습 기록을 확인하고 있어요.
          </p>
        )}
        {status === "error" && (
          <div className={styles.status} role="alert">
            <p>기록을 불러오지 못했어요. 체험은 계속할 수 있고, 기록은 다시 확인할 수 있습니다.</p>
            <button className={styles.secondary} onClick={() => void refresh(true)}>
              기록 다시 확인
            </button>
          </div>
        )}
        <nav className={styles.courseTabs} aria-label="학습 코스 선택">
          {englishCourses.map((item, index) => (
            <Link
              key={item.id}
              className={styles.courseTab}
              href={"/english/courses?course=" + item.id + "&level=" + level}
              aria-current={item.id === course.id ? "page" : undefined}
            >
              <small>
                PATH {String(index + 1).padStart(2, "0")} · {item.units.length}개 콘텐츠
              </small>
              <strong>{item.title.ko}</strong>
              <small>{item.description.ko}</small>
            </Link>
          ))}
        </nav>
        <section className={styles.courseHeader} aria-labelledby="course-title">
          <p className={styles.eyebrow}>YOUR NEXT STEP</p>
          <h2 id="course-title">{course.title.ko}</h2>
          <p>{course.purpose.ko}</p>
          <label className={styles.meta} htmlFor="course-level">
            새 활동의 난이도
          </label>{" "}
          <select
            id="course-level"
            value={level}
            onChange={(event) => {
              window.location.assign(
                (locale === "en" ? "/en" : "") +
                  "/english/courses?course=" +
                  course.id +
                  "&level=" +
                  event.target.value,
              );
            }}
            aria-label="새 활동의 난이도"
          >
            {englishLevels.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <p className={styles.note}>
            이어 하는 활동은 마지막에 사용한 난이도로 열립니다. 활동 안에서도 언제든 바꿀 수 있어요.
          </p>
          {status === "ready" && (
            <>
              <progress
                className={styles.progress}
                value={state.percent}
                max={100}
                aria-label="코스 진행률"
              />
              <p>
                <strong>
                  {state.completedUnits} / {state.totalUnits}
                </strong>
                개 콘텐츠 완료 · 활동 진행률 {state.percent}%
              </p>
            </>
          )}
          <div className={styles.actions}>
            {state.nextUnit ? (
              <Link
                className={styles.primary}
                href={href(state.nextUnit.contentId, false, state.nextUnit.inProgress)}
              >
                {state.nextUnit.inProgress ? "하던 활동 이어하기" : "다음 활동 시작하기"}{" "}
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            ) : (
              <Link className={styles.primary} href="/english/journal">
                코스를 마쳤어요 · 나의 학습 보기 <Check size={17} aria-hidden="true" />
              </Link>
            )}
            <Link className={styles.secondary} href="/english/review">
              배운 표현 복습
            </Link>
          </div>
          <p className={styles.note}>
            기존 콘텐츠를 목적에 맞게 묶은 코스입니다. 별도의 신작으로 세지 않으며, 같은 활동을 여러
            코스에서 마쳐도 보상은 한 번만 받습니다.
          </p>
        </section>
        <ol className={styles.units}>
          {state.units.map((unit, index) => {
            const item = getEnglishEpisode(unit.contentId)!;
            return (
              <li key={unit.contentId} className={styles.unit}>
                <span className={styles.number}>
                  {unit.completed ? (
                    <Check size={16} aria-label="완료" />
                  ) : (
                    String(index + 1).padStart(2, "0")
                  )}
                </span>
                {item.format === "practice" ? (
                  <span className={styles.practiceArt}>
                    <Puzzle size={27} aria-hidden="true" />
                  </span>
                ) : (
                  <Image
                    className={styles.thumbnail}
                    src={item.image}
                    alt={item.imageAlt}
                    width={100}
                    height={72}
                    sizes="100px"
                  />
                )}
                <div>
                  <span className={styles.meta}>
                    {item.format === "practice" ? "집중 연습" : "이야기"} · 예상 {item.minutes}분
                  </span>
                  <h3>{item.title}</h3>
                  <p>{unit.rationale.ko}</p>
                  {status === "ready" && (
                    <p className={styles.meta}>
                      {unit.count}/{unit.total}개 활동 완료
                    </p>
                  )}
                </div>
                <Link
                  className={styles.secondary}
                  href={href(item.id, unit.completed, unit.inProgress)}
                >
                  {unit.completed ? "다시 연습" : unit.inProgress ? "이어하기" : "시작하기"}{" "}
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ol>
        <p className={styles.note}>
          <BookOpen size={14} aria-hidden="true" /> 긴 이야기는 여러 번에 나누어 즐겨도 괜찮아요.
          로그인하면 마친 활동의 기록이 남습니다.
        </p>
      </div>
    </div>,
    locale,
  );
}
