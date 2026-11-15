"use client";

import { useEffect, useRef, useState } from "react";
import { Backpack, ChatsCircle, FileText, HandPointing, Timer } from "@phosphor-icons/react";
import { useText } from "@/lib/i18n/use-text";
import styles from "./episode-play.module.css";

const times = [
  { time: "7:10", title: "열쇠가 사라졌습니다", body: "재시험을 시작하려던 원장님이 빈 열쇠고리를 발견합니다." },
  { time: "7:25", title: "남은 시간 35분", body: "3층을 다 뒤졌지만 없습니다. 남은 곳은 네 사람의 가방뿐입니다." },
  { time: "8:00", title: "이때까지 못 찾으면", body: "재시험은 취소되고, 네 명 모두 토요일 오후 보충반에 다시 나와야 합니다." },
];

/** The ticking deadline: the study-room clip, then 7:10 → 7:25 → 8:00. */
export function EpisodeDeadline() {
  const t = useText();
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setShown(true);
        io.disconnect();
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section className={styles.deadline} aria-labelledby="episode-deadline-title">
      <div className={styles.shell}>
        <p className={styles.kicker}>{t("금요일 저녁")}</p>
        <h2 id="episode-deadline-title">{t("여덟 시까지 두 열쇠를 찾아야 합니다")}</h2>
        <span className={`${styles.clip} ${shown ? styles.drift : ""}`}>
          <img
            src="/assets/going-home-scenes/friday-710.webp"
            alt={t("금요일 저녁 학원 3층 자습실, 지친 얼굴로 서로를 살피는 네 학생")}
            width={1600}
            height={900}
            loading="lazy"
            decoding="async"
          />
        </span>
        <div ref={ref} className={`${styles.line} ${shown ? styles.run : ""}`}>
          <i className={styles.track} aria-hidden="true">
            <i />
          </i>
          <ol>
            {times.map((item) => (
              <li key={item.time}>
                <time>{item.time}</time>
                <strong>{t(item.title)}</strong>
                <span>{t(item.body)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

type Stage = { title: string; body: string; open: number; icon: typeof Backpack };
const stages: Stage[] = [
  { title: "준비", body: "네 사람이 각자 가방에 짐 카드 3장을 숨겨 둡니다. 모두 12장입니다.", open: 0, icon: Backpack },
  { title: "1라운드", body: "선 플레이어가 1장을 꺼내고, 수상한 두 사람을 지목합니다. 지목받은 사람도 1장씩 꺼냅니다. 5분 이야기한 뒤 공통 단서 1번을 엽니다.", open: 3, icon: HandPointing },
  { title: "2라운드", body: "방금 지목받았던 사람이 이번엔 다른 사람을 지목합니다. 2장이 더 나옵니다. 5분 이야기, 공통 단서 2번.", open: 5, icon: ChatsCircle },
  { title: "3라운드", body: "같은 방법으로 2장이 더 나옵니다. 5분 이야기, 공통 단서 3번.", open: 7, icon: ChatsCircle },
  { title: "4라운드", body: "마지막으로 2장이 더 나옵니다. 남은 3장은 끝까지 숨긴 채 5분 동안 마지막 이야기를 합니다.", open: 9, icon: Timer },
  { title: "투표와 해설", body: "모두 동시에 범인이라고 생각하는 사람을 가리킵니다. 그다음 규칙서의 해설을 열어 그날 일을 확인합니다.", open: 9, icon: FileText },
];
const owners = ["윤지원", "박세준", "차하린", "한도경"];
/** Which card opens in which order, as an example only. */
const revealOrder = [0, 4, 8, 5, 9, 1, 10, 6, 2];

/** Rounds of the game shown as twelve cards turning over. */
export function EpisodeRounds() {
  const t = useText();
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(false);
  const [stopped, setStopped] = useState(false);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => setAuto(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!auto || stopped) return;
    const id = window.setTimeout(() => setStep((s) => (s + 1) % stages.length), 3600);
    return () => window.clearTimeout(id);
  }, [auto, stopped, step]);
  const opened = new Set(revealOrder.slice(0, stages[step].open));
  const current = stages[step];
  const Icon = current.icon;
  return (
    <section ref={ref} className={styles.rounds} aria-labelledby="episode-rounds-title">
      <div className={styles.shell}>
        <p className={styles.kicker}>{t("이렇게 진행합니다")}</p>
        <h2 id="episode-rounds-title">{t("가방 속 짐을 한 장씩 꺼내 보입니다")}</h2>
        <p className={styles.lead}>
          {t("네 사람은 각자 가방에 짐 카드 3장을 숨기고 시작합니다. 수상한 사람을 지목하면 그 사람이 한 장을 꺼내 보이고, 다 함께 5분 동안 이야기합니다.")}
        </p>

        <div className={styles.board}>
          <div className={styles.tabs} role="tablist" aria-label={t("진행 단계")}>
            {stages.map((s, i) => (
              <button
                key={s.title}
                role="tab"
                type="button"
                aria-selected={i === step}
                className={i === step ? styles.on : undefined}
                onClick={() => {
                  setStopped(true);
                  setStep(i);
                }}
              >
                {t(s.title)}
              </button>
            ))}
          </div>

          <div className={styles.table}>
            {owners.map((name, row) => (
              <div className={styles.player} key={name}>
                <span className={styles.name}>{t(name)}</span>
                <span className={styles.cards}>
                  {[0, 1, 2].map((col) => {
                    const index = row * 3 + col;
                    const open = opened.has(index);
                    return (
                      <i key={col} className={`${styles.card} ${open ? styles.open : ""}`} aria-hidden="true">
                        <b className={styles.back} />
                        <b className={styles.face} />
                      </i>
                    );
                  })}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.caption} aria-live="polite">
            <span className={styles.icon}>
              <Icon size={28} aria-hidden="true" />
            </span>
            <div>
              <strong>{t(current.title)}</strong>
              <p>{t(current.body)}</p>
              <small>
                {t(`꺼낸 짐 ${current.open}장 · 숨은 짐 ${12 - current.open}장`)}
              </small>
            </div>
          </div>
        </div>
        <p className={styles.note}>
          {t("누가 언제 꺼내는지는 예시입니다. 실제로는 지목에 따라 달라집니다.")}
        </p>
      </div>
    </section>
  );
}
