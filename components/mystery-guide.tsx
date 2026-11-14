import Image from "next/image";
import { useText } from "@/lib/i18n/use-text";
import styles from "./mystery-guide.module.css";

const steps = [
  {
    title: "인물 고르기",
    body: "상자 안에는 등장인물 수만큼 대본이 들어 있습니다. 한 사람이 한 인물을 맡습니다.",
  },
  {
    title: "내 대본 혼자 읽기",
    body: "내 인물이 그날 무엇을 했는지, 누구와 어떤 사이인지, 남에게 숨기고 싶은 일이 적혀 있습니다. 다른 사람에게는 보여 주지 않습니다.",
  },
  {
    title: "자기소개",
    body: "돌아가며 내 인물이 누구인지 소개합니다. 대본에 적힌 내용을 내 말투로 전하면 됩니다.",
  },
  {
    title: "조사하고 대화하기",
    body: "규칙서 순서대로 단서 카드를 펼치고, 서로 묻고 답합니다. 앞뒤가 안 맞는 말이 실마리가 됩니다.",
  },
  {
    title: "범인 지목과 해설",
    body: "각자 범인이라고 생각하는 사람을 고릅니다. 마지막에 해설을 읽으면 그날 밤 무슨 일이 있었는지 모두 밝혀집니다.",
  },
];

const questions = [
  {
    q: "연기를 잘해야 하나요?",
    a: "아닙니다. 목소리나 말투를 바꿀 필요가 없습니다. 대본에 적힌 내용을 평소 말투로 전하면 충분합니다.",
  },
  {
    q: "추리를 잘 못하는데 괜찮을까요?",
    a: "혼자 푸는 시험이 아니라 여럿이 이야기하며 맞춰 가는 놀이입니다. 범인을 맞히지 못해도 마지막 해설에서 모든 이야기를 알게 됩니다.",
  },
  {
    q: "거짓말을 해야 하나요?",
    a: "범인을 맡은 사람은 들키지 않도록 말을 고르게 됩니다. 범인이 아니어도 인물마다 숨기고 싶은 일이 있어서, 무엇을 말하고 무엇을 아낄지 고르는 재미가 있습니다.",
  },
  {
    q: "인원이 모자라면 할 수 있나요?",
    a: "인물 수가 정해져 있어서, 작품에 적힌 인원이 모여야 합니다. 가족 모임이나 친구 부부 모임처럼 인원이 맞는 자리에 잘 어울립니다.",
  },
  {
    q: "시간은 어느 정도 걸리나요?",
    a: "작품마다 적힌 시간을 기준으로 하되, 처음이라면 규칙서를 함께 읽는 시간을 더해 넉넉하게 잡으시면 좋습니다. 한 사람이 규칙서를 소리 내어 읽으며 진행하면 편합니다.",
  },
  {
    q: "여러 번 할 수 있나요?",
    a: "한 사건은 한 번 즐기는 놀이입니다. 범인과 해설을 알고 나면 같은 사건을 다시 풀 수는 없습니다. 대신 상자를 다른 모임에 빌려주거나, 진행을 맡아 다른 모임이 즐기도록 도울 수 있습니다.",
  },
];

const comparisons = [
  {
    kicker: "TV 예능으로 치면",
    title: "「크라임씬」을 거실 테이블에서",
    same: "출연자마다 용의자 한 명을 맡고, 그중 한 명이 진짜 범인입니다. 서로 캐묻고 단서를 맞춰 본 뒤 마지막에 범인을 지목합니다.",
    differ: "촬영 세트와 의상 대신 대본과 단서 카드가 든 상자 하나면 됩니다. 이번에는 내가 출연자입니다.",
    image: "/assets/genre-guide/crime-scene-zero-netflix.webp",
    alt: "용의자 역할의 한복 차림으로 다른 출연자에게 따져 묻는 크라임씬 출연자",
    width: 1200,
    height: 800,
    credit: "넷플릭스 「크라임씬 제로」(2025) 스틸 · 사진 넷플릭스 제공",
    creditHref: null,
  },
  {
    kicker: "방탈출과 비교하면",
    title: "자물쇠 대신 사람의 말을 풉니다",
    same: "여럿이 머리를 맞대고 단서를 이어 답을 찾는다는 점은 같습니다.",
    differ: "방탈출은 자물쇠와 장치를 풀어 방을 빠져나오고, 머더미스터리는 사람들의 말 속 앞뒤가 안 맞는 곳을 찾습니다. 함께 푸는 사람 가운데 범인이 숨어 있고, 매장 예약 없이 집에서 할 수 있습니다.",
    image: "/assets/genre-guide/escape-room-hudson-bloom.webp",
    alt: "벽에 걸린 오래된 지도를 짚으며 단서를 찾는 방탈출 참가자",
    width: 1200,
    height: 900,
    credit: "방탈출 「The Expedition」 · 사진 Hudson Bloom, CC BY-SA 4.0",
    creditHref: "https://commons.wikimedia.org/wiki/File:Escape_Room_-_%22The_Expedition%22_(Escape_Quest_Bethesda).jpg",
  },
] as const;

const terms = [
  ["대본", "내가 맡은 인물의 이야기와 비밀이 적힌 작은 책입니다. 인물 책자, 캐릭터 시트라고도 합니다."],
  ["단서 카드", "사건 현장이나 소지품에서 찾은 물건, 기록이 적힌 카드입니다."],
  ["지목", "범인이라고 생각하는 사람을 고르는 일입니다. 투표라고도 합니다."],
  ["해설", "모든 비밀이 밝혀지는 마지막 글입니다. 엔딩이라고도 합니다."],
  ["스포일러", "아직 하지 않은 사람에게 범인이나 결말을 미리 알려 주는 일입니다. 한 번뿐인 놀이라 특히 조심합니다."],
] as const;

/** The long version, shown folded under the picture-first guide. */
export function MysteryGuideDetails() {
  const t = useText();
  const escape = comparisons[1];
  return (
    <div className={styles.details}>
      <figure className={styles.compareCard}>
        <span className={styles.compareImage}>
          <Image src={escape.image} alt={t(escape.alt)} width={escape.width} height={escape.height} sizes="(max-width: 760px) 100vw, 50vw" />
        </span>
        <figcaption>
          <p className={styles.compareKicker}>{t(escape.kicker)}</p>
          <h3>{t(escape.title)}</h3>
          <dl>
            <div>
              <dt>{t("같은 점")}</dt>
              <dd>{t(escape.same)}</dd>
            </div>
            <div>
              <dt>{t("다른 점")}</dt>
              <dd>{t(escape.differ)}</dd>
            </div>
          </dl>
          <a className={styles.credit} href={escape.creditHref!} target="_blank" rel="noopener noreferrer">
            {t(escape.credit)}
          </a>
        </figcaption>
      </figure>

      <div className={styles.flow}>
        <h3>{t("하룻저녁은 이렇게 흘러갑니다")}</h3>
        <ol>
          {steps.map((step, index) => (
            <li key={step.title}>
              <span className={styles.step}>{index + 1}</span>
              <strong>{t(step.title)}</strong>
              <p>{t(step.body)}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className={styles.bottom}>
        <div className={styles.faq}>
          <h3>{t("처음 하시는 분들이 자주 묻는 것")}</h3>
          {questions.map((item) => (
            <details key={item.q}>
              <summary>{t(item.q)}</summary>
              <p>{t(item.a)}</p>
            </details>
          ))}
        </div>
        <div className={styles.terms}>
          <h3>{t("낯선 말 풀이")}</h3>
          <dl>
            {terms.map(([term, meaning]) => (
              <div key={term}>
                <dt>{t(term)}</dt>
                <dd>{t(meaning)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
