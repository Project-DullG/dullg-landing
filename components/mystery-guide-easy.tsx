import Image from "next/image";
import { ArrowRight, Clock, MaskHappy, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { useText } from "@/lib/i18n/use-text";
import type { Work } from "@/lib/works";
import { workGuides } from "@/lib/work-guides";
import styles from "./mystery-guide-easy.module.css";

const base = "/assets/genre-guide/";

const steps = [
  { image: "step-1-read.webp", title: "책자를 받아 몰래 읽어요", note: "내가 누구인지, 무엇을 숨기는지 적혀 있어요" },
  { image: "step-2-talk.webp", title: "묻고 답해요", note: "단서 카드를 보며 서로의 말을 맞춰 봐요" },
  { image: "step-3-accuse.webp", title: "다 같이 범인을 가리켜요", note: "마지막에 해설을 읽으면 모든 게 밝혀져요" },
];

const worries = [
  ["연기를 해야 하나요?", "아니요. 책자에 적힌 걸 평소 말투로 말하면 돼요."],
  ["추리를 못하는데요?", "괜찮아요. 혼자 푸는 시험이 아니라 다 같이 이야기하는 놀이예요."],
  ["범인을 못 맞히면요?", "마지막 해설에서 모든 이야기를 알게 돼요."],
  ["여러 번 할 수 있나요?", "한 사건은 한 번이에요. 다 하고 나면 다른 모임에 빌려줄 수 있어요."],
] as const;

/** The first-time guide, picture first: one comparison, three steps, four short answers. */
export function MysteryGuideEasy({ work, children }: { work?: Work; children?: React.ReactNode }) {
  const t = useText();
  const guide = work ? workGuides[work.slug] : undefined;
  return (
    <section className={styles.guide} id="first-time" aria-labelledby="mystery-guide-title">
      <div className={styles.shell}>
        <p className={styles.kicker}>{t("머더미스터리가 처음이신가요")}</p>
        <h2 id="mystery-guide-title">
          {t("한마디로,")} <span className="pencil-mark">{t("내가 출연하는 「크라임씬」")}</span>
          {t("입니다")}
        </h2>

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
                alt={t("거실 탁자에 둘러앉아 인물 책자와 단서 카드로 머더미스터리를 하는 두 부부")}
                width={1600}
                height={900}
                sizes="(max-width: 760px) 100vw, 45vw"
              />
            </span>
            <figcaption>
              <strong>{t("우리 집에서는")}</strong>
              <span>{t("상자 하나로, 내가 출연자가 됩니다")}</span>
            </figcaption>
          </figure>
        </div>
        <p className={styles.credit}>
          {t("왼쪽: 넷플릭스 「크라임씬 제로」(2025) 스틸 · 사진 넷플릭스 제공 / 오른쪽: 일러스트")}
        </p>

        {work && guide && (
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
                {t("얼마나")}
              </dt>
              <dd>{t(work.duration)}</dd>
            </div>
            <div className={styles.role}>
              <dt>
                <MaskHappy size={28} aria-hidden="true" />
                {t("나는 누가 되나")}
              </dt>
              <dd>{t(guide.role)}</dd>
            </div>
          </dl>
        )}

        <h3 className={styles.stepsTitle}>{t("하는 방법은 딱 세 가지")}</h3>
        <ol className={styles.steps} data-stagger>
          {steps.map((step, index) => (
            <li key={step.title}>
              <span className={styles.frame}>
                <Image
                  src={base + step.image}
                  alt=""
                  width={900}
                  height={675}
                  sizes="(max-width: 760px) 100vw, 33vw"
                />
                <span className={styles.number}>{index + 1}</span>
              </span>
              <strong>{t(step.title)}</strong>
              <span>{t(step.note)}</span>
            </li>
          ))}
        </ol>

        <h3 className={styles.stepsTitle}>{t("걱정하지 마세요")}</h3>
        <ul className={styles.worries} data-stagger>
          {worries.map(([q, a]) => (
            <li key={q}>
              <strong>{t(q)}</strong>
              <span>{t(a)}</span>
            </li>
          ))}
        </ul>

        {guide?.caution && (
          <p className={styles.caution}>
            <strong>{t("미리 알아 두세요")}</strong> {t(guide.caution)}
          </p>
        )}

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
