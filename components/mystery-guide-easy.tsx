import Image from "next/image";
import Link from "@/components/i18n/link";
import { ArrowRight, Clock, MaskHappy, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { useText } from "@/lib/i18n/use-text";
import type { Work } from "@/lib/works";
import { workGuides } from "@/lib/work-guides";
import styles from "./mystery-guide-easy.module.css";
import { StepClip } from "./step-clip";

const base = "/assets/genre-guide/";

/** Numbered items in the kit picture; x and y are percentages of the image. */
const kitItems = [
  { label: "대본", note: "사람 수만큼 들어 있습니다", x: 47, y: 12 },
  { label: "단서 카드", note: "사건 현장의 물건이나 기록이 그려져 있습니다", x: 6, y: 60 },
  { label: "진행 안내서", note: "무엇을 먼저 할지 적혀 있습니다", x: 35, y: 50 },
  { label: "해설", note: "맨 마지막에 함께 읽습니다", x: 80, y: 60 },
];

const steps = [
  { image: "step-1-read.webp", title: "대본을 받아 혼자 읽습니다", note: "내가 누구인지, 무엇을 숨기는지 적혀 있습니다" },
  { image: "step-2-talk.webp", title: "그 사람이 되어 이야기합니다", note: "단서 카드를 보며 서로 묻고 답합니다" },
  { image: "step-3-accuse.webp", title: "누가 범인인지 각자 고른 뒤, 해설을 읽습니다", note: "그날 무슨 일이 있었는지 모두 밝혀집니다" },
];

const worries = [
  ["연기를 해야 하나요?", "아닙니다. 대본에 적힌 내용을 평소 말투로 전하면 됩니다."],
  ["추리를 잘 못하는데요?", "괜찮습니다. 혼자 푸는 시험이 아니라 다 같이 이야기하는 놀이입니다."],
  ["범인을 못 맞히면요?", "마지막 해설에서 모든 이야기를 알게 됩니다."],
  ["여러 번 할 수 있나요?", "범인과 결말을 알게 되므로, 한 작품은 한 번만 즐길 수 있습니다. 다 하고 나면 다른 모임에 빌려줄 수 있습니다."],
] as const;

/**
 * The first-time guide, written so that anyone from their 40s to their 70s can follow it.
 * It lives once, on the works page; each box's page links to it with MysteryGuideLink.
 */
export function MysteryGuideEasy({ children }: { children?: React.ReactNode }) {
  const t = useText();
  return (
    <section className={styles.guide} id="first-time" aria-labelledby="mystery-guide-title">
      <div className={styles.shell}>
        <p className={styles.kicker}>{t("머더미스터리가 처음이신가요")}</p>
        <h2 id="mystery-guide-title">
          {t("한마디로,")} <span className="pencil-mark">{t("집에서 하는 작은 연극")}</span>
          {t("입니다")}
        </h2>
        <div className={styles.plain}>
          <p>{t("이 연극 상자를 열면 사람 수만큼 대본이 들어 있습니다.")}</p>
          <p>{t("한 사람이 한 인물을 맡아, 그 사람이 된 듯 이야기합니다.")}</p>
          <p>{t("참가자 가운데 한 사람이 범인 역할을 맡고, 누가 범인인지는 그 사람만 압니다.")}</p>
          <p>{t("이야기를 나누며 범인을 찾아내면 연극이 끝납니다.")}</p>
        </div>

        <h3 className={styles.sub}>{t("상자 안에는 이런 것이 들어 있습니다")}</h3>
        <figure className={styles.kit}>
          <span className={styles.frame}>
            <Image
              src={base + "kit-contents.webp"}
              alt={t("탁자 위에 펼쳐 놓은 상자, 대본 네 권, 단서 카드, 진행 안내서, 해설")}
              width={1400}
              height={788}
              sizes="(max-width: 1160px) 100vw, 1120px"
            />
            {kitItems.map((item, index) => (
              <span
                key={item.label}
                className={styles.pin}
                style={{ left: `${item.x}%`, top: `${item.y}%` }}
                aria-hidden="true"
              >
                {index + 1}
              </span>
            ))}
          </span>
          <ol className={styles.kitList}>
            {kitItems.map((item, index) => (
              <li key={item.label}>
                <span className={styles.pinSmall}>{index + 1}</span>
                <strong>{t(item.label)}</strong>
                <span>{t(item.note)}</span>
              </li>
            ))}
          </ol>
          <figcaption>{t("그림은 예시입니다. 작품마다 들어 있는 것이 조금씩 다릅니다.")}</figcaption>
        </figure>

        <h3 className={styles.sub}>{t("하는 방법은 세 단계입니다")}</h3>
        <ol className={styles.steps} data-stagger>
          {steps.map((step, index) => (
            <li key={step.title}>
              <span className={styles.frame}>
                <StepClip src={base + step.image.replace(".webp", ".mp4")} poster={base + step.image} />
                <span className={styles.number}>{index + 1}</span>
              </span>
              <strong>{t(step.title)}</strong>
              <span>{t(step.note)}</span>
            </li>
          ))}
        </ol>

        <h3 className={styles.sub}>{t("TV 추리 예능 「크라임씬」을 보셨다면")}</h3>
        <div className={styles.versus}>
          <figure>
            <span className={styles.frame}>
              <Image
                src={base + "crime-scene-zero-netflix.webp"}
                alt={t("용의자 역할의 한복 차림으로 다른 출연자에게 따져 묻는 크라임씬 출연자")}
                width={1200}
                height={800}
                sizes="(max-width: 760px) 100vw, 45vw"
              />
            </span>
            <figcaption>
              <strong>{t("TV에서는")}</strong>
              <span>{t("출연자들이 용의자가 되어 범인을 찾고")}</span>
            </figcaption>
          </figure>
          <span className={styles.arrow} aria-hidden="true">
            <ArrowRight size={32} />
          </span>
          <figure>
            <span className={styles.frame}>
              <Image
                src={base + "living-room-play.webp"}
                alt={t("거실 탁자에 둘러앉아 대본과 단서 카드로 추리 연극을 하는 두 부부")}
                width={1600}
                height={900}
                sizes="(max-width: 760px) 100vw, 45vw"
              />
            </span>
            <figcaption>
              <strong>{t("우리 집에서는")}</strong>
              <span>{t("상자 하나로 내가 출연자가 됩니다")}</span>
            </figcaption>
          </figure>
        </div>
        <p className={styles.credit}>
          {t("왼쪽: 넷플릭스 「크라임씬 제로」(2025) 스틸 · 사진 넷플릭스 제공 / 오른쪽: 일러스트")}
        </p>

        <h3 className={styles.sub}>{t("걱정하지 마세요")}</h3>
        <ul className={styles.worries} data-stagger>
          {worries.map(([q, a]) => (
            <li key={q}>
              <strong>{t(q)}</strong>
              <span>{t(a)}</span>
            </li>
          ))}
        </ul>

        {children && (
          <details className={styles.more}>
            <summary>{t("더 자세히 알고 싶다면")}</summary>
            {children}
          </details>
        )}
      </div>
    </section>
  );
}

/** On a box's own page: who plays, for how long, as whom, and a way to the general first-time guide. */
export function MysteryGuideLink({ work }: { work: Work }) {
  const t = useText();
  const guide = workGuides[work.slug];
  return (
    <section className={styles.link} aria-labelledby="mystery-guide-link-title">
      <div className={styles.shell}>
        <p className={styles.kicker}>{t("이 작품 한눈에")}</p>
        <h2 id="mystery-guide-link-title">{t("인원과 시간, 내가 맡는 사람")}</h2>
        {guide && (
          <dl className={styles.facts}>
            <div>
              <dt>
                <UsersThree size={28} aria-hidden="true" />
                {t("몇 명이서")}
              </dt>
              <dd>{t(work.players)}</dd>
            </div>
            <div>
              <dt>
                <Clock size={28} aria-hidden="true" />
                {t("걸리는 시간")}
              </dt>
              <dd>{t(work.duration)}</dd>
            </div>
            <div className={styles.role}>
              <dt>
                <MaskHappy size={28} aria-hidden="true" />
                {t("내가 맡는 사람")}
              </dt>
              <dd>{t(guide.role)}</dd>
            </div>
          </dl>
        )}
        {guide?.caution && (
          <p className={styles.caution}>
            <strong>{t("미리 알려 드립니다")}</strong> {t(guide.caution)}
          </p>
        )}
        <Link className={styles.linkCard} href="/works#first-time">
          <span>
            <strong>{t("머더미스터리가 처음이신가요?")}</strong>
            {t("상자에 무엇이 들었는지, 어떻게 하는지 그림으로 보여 드립니다.")}
          </span>
          <ArrowRight size={24} weight="bold" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
