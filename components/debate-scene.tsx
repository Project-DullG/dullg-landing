"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import Link from "@/components/i18n/link";
import { useText } from "@/lib/i18n/use-text";
import styles from "./debate-scene.module.css";

type Skill = "literacy" | "reasoning" | "thinking" | "creativity";
type Evidence = "saturday" | "book" | "makeup" | "four";

const skills: { id: Skill; name: string; action: string; evidence: Evidence[] }[] = [
  {
    id: "literacy",
    name: "문해력",
    action: "영어 단서에서 날짜·장소·사람을 정확히 찾아 읽습니다",
    evidence: ["saturday"],
  },
  {
    id: "reasoning",
    name: "추론력",
    action: "단서 두 개를 이어 ‘그렇다면’을 끌어냅니다",
    evidence: ["saturday", "makeup"],
  },
  {
    id: "thinking",
    name: "사고력",
    action: "친구의 추리에 근거를 묻고, 맞지 않는 추리는 버립니다",
    evidence: ["book"],
  },
  {
    id: "creativity",
    name: "창의력",
    action: "다른 설명을 새로 세우고 팀을 설득합니다",
    evidence: ["four"],
  },
];

const talk: { skill: Skill; name: string; image: string; line: string }[] = [
  {
    skill: "literacy",
    name: "차하린",
    image: "chaharin",
    line: "카드에 ‘this Saturday’라고 적혀 있어. 세준이 생일이 이번 토요일이라는 거지.",
  },
  {
    skill: "reasoning",
    name: "한도경",
    image: "handokyung",
    line: "오늘 재시험을 못 보면 토요일에 보충반에 다시 나와야 하잖아. 그럼 세준이는 생일 모임에 못 가.",
  },
  {
    skill: "thinking",
    name: "박세준",
    image: "parksejun",
    line: "그건 내가 열쇠를 가져갔다는 증거가 아니야. 그 쪽지는 지원이 영어책 사이에 있었잖아.",
  },
  {
    skill: "creativity",
    name: "윤지원",
    image: "yoonjiwon",
    line: "토요일에 못 나오는 사람이 세준이 하나일까? 넷 다 재시험 대상이야. 다른 이유도 세워 보자.",
  },
];

export function DebateScene({ variant = "academy" }: { variant?: "home" | "academy" }) {
  const t = useText();
  const [active, setActive] = useState<Skill>("literacy");
  // Autoplay walks through the four skills while the scene is on screen,
  // and stops for good once the reader chooses a skill.
  const [auto, setAuto] = useState(false);
  const [paused, setPaused] = useState(false);
  const sceneRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = sceneRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(([entry]) => setAuto(entry.isIntersecting), {
      threshold: 0.35,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const [stopped, setStopped] = useState(false);
  const playing = auto && !paused && !stopped;
  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      const index = skills.findIndex((skill) => skill.id === active);
      setActive(skills[(index + 1) % skills.length].id);
    }, 4200);
    return () => window.clearTimeout(timer);
  }, [playing, active]);
  const current = skills.find((skill) => skill.id === active)!;
  const hit = (key: Evidence) => (current.evidence.includes(key) ? styles.hit : undefined);
  return (
    <section
      ref={sceneRef}
      className={`${styles.scene} ${variant === "home" ? styles.home : ""} ${playing ? styles.playing : ""}`}
      id="debate"
      aria-labelledby={`${variant}-debate-title`}
    >
      <div className={styles.shell}>
        <div className={styles.head}>
          <p className={styles.kicker}>
            {t(variant === "home" ? "학원·학교용 영어 미스터리 수업" : "토론 수업")}
          </p>
          <h2 id={`${variant}-debate-title`}>
            <span className="pencil-mark">{t("토론하며")}</span> {t("키우는")}
            <br />
            {t("창의력·문해력·추론력·사고력")}
          </h2>
          <p className={styles.lead}>
            {t(
              "단서 카드 한 장을 두고 네 학생이 말을 주고받습니다. 아래 네 가지를 하나씩 눌러, 각 발언에서 어떤 힘을 쓰는지 보세요.",
            )}
          </p>
        </div>

        <div
          className={styles.board}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div className={styles.skills} role="group" aria-label={t("토론에서 쓰는 네 가지 힘")}>
            {skills.map((skill, index) => (
              <button
                key={skill.id}
                type="button"
                className={styles.skill}
                aria-pressed={active === skill.id}
                onClick={() => {
                  setStopped(true);
                  setActive(skill.id);
                }}
              >
                <span className={styles.skillIndex}>{String(index + 1).padStart(2, "0")}</span>
                {active === skill.id && <i className={styles.timer} key={skill.id} aria-hidden="true" />}
                <strong>{t(skill.name)}</strong>
                <span className={styles.skillAction}>{t(skill.action)}</span>
              </button>
            ))}
          </div>

          <div className={styles.table}>
            <div className={styles.papers}>
              <figure className={styles.card}>
                <p className={styles.cardOwner}>Yoon Jiwon Item 2</p>
                <p className={styles.cardTitle} lang="en">
                  English Book and Note
                </p>
                <p lang="en">
                  A small card is tucked{" "}
                  <span className={hit("book")}>between the pages of the English book.</span>
                </p>
                <blockquote lang="en">
                  “It’s my birthday <span className={hit("saturday")}>this Saturday</span>, so I’m
                  meeting a few friends. If you’re free, do you want to come too?”
                </blockquote>
                <p lang="en">
                  At the bottom, “<span className={hit("book")}>– Sejun</span>” is written in small
                  letters.
                </p>
                <figcaption>{t("공개 단서 카드 · 윤지원 소지품 2")}</figcaption>
              </figure>
              <figure className={styles.synopsis}>
                <p>
                  <span className={hit("four")}>
                    {t("네 사람은 기준 점수에 미치지 못해 재시험을 치러야 했다.")}
                  </span>{" "}
                  <span className={hit("makeup")}>
                    {t("오늘 재시험이 진행되지 않으면 토요일 오후 보충반에 다시 나와야 했다.")}
                  </span>
                </p>
                <figcaption>{t("공개 시놉시스 · 사건 도입")}</figcaption>
              </figure>
            </div>

            <ol className={styles.talk} data-stagger aria-live="polite">
              {talk.map((turn) => (
                <li
                  key={turn.skill === active ? `${turn.name}-on` : turn.name}
                  className={turn.skill === active ? styles.speaking : styles.quiet}
                >
                  <span className={styles.avatar}>
                    <Image
                      src={`/assets/academy-remake/${turn.image}.webp`}
                      alt=""
                      width={300}
                      height={300}
                      sizes="150px"
                    />
                  </span>
                  <div>
                    <strong>{t(turn.name)}</strong>
                    <p>{t(turn.line)}</p>
                  </div>
                  {turn.skill === active && <span className={styles.badge}>{t(current.name)}</span>}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.report}>
            <span>{t("4차시에 남기는 개인 영작")}</span>
            <p lang="en">
              I think <i>____</i> took the keys. First, card <i>____</i> says <i>____</i>. Second,{" "}
              <i>____</i>.
            </p>
          </div>
          <p className={styles.note}>
            {t(
              "수업 장면 예시입니다. 공개된 단서 카드와 시놉시스로 꾸민 대화이며, 실제 학생 발언이 아닙니다. 사건의 정답은 공개하지 않습니다.",
            )}
          </p>
          <Link
            className="button button-dark"
            href={variant === "home" ? "/academy" : "/academy/curriculum"}
          >
            {t(variant === "home" ? "영어 미스터리 수업팩 보기" : "4차시 수업 흐름 보기")}
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
