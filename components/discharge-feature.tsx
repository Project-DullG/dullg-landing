import Image from "next/image";
import Link from "@/components/i18n/link";
import { useLocale } from "next-intl";
import styles from "@/components/tide-room/feature.module.css";

export function DischargeFeature({ play = false }: { play?: boolean }) {
  const en = useLocale() === "en";
  return (
    <article className={styles.card}>
      <Image
        className={styles.art}
        src="/assets/discharge-day/art/ward.webp"
        alt={en ? "An empty hospital room" : "사람이 보이지 않는 병실"}
        width={1600}
        height={900}
        sizes="(max-width:700px) 100vw, 55vw"
      />
      <div className={styles.body}>
        <span className={styles.tag}>
          {en ? "Solo escape adventure · Korean" : "1인 탈출 어드벤처 · 한국어"}
        </span>
        <h2>{en ? "Discharge Day" : "퇴원일"}</h2>
        <p>
          {en
            ? "You expected to go home after surgery. Wake up in a medical facility, investigate the rooms and restore its equipment to find out what happened outside."
            : "수술이 끝나면 집에 갈 생각이었다. 의료시설에서 깨어나 방을 조사하고 장치를 복구하며, 문밖에서 무슨 일이 있었는지 확인한다."}
        </p>
        <p>
          {en
            ? "Read the records and choose how to leave. Your decisions lead to five endings."
            : "발견한 기록을 읽고 떠날 방법을 선택한다. 결정에 따라 다섯 결말로 나뉜다."}
        </p>
        {play ? (
          <a className={styles.link} href="/assets/discharge-day/index.html">
            {en ? "Play in Korean" : "게임 시작하기"} →
          </a>
        ) : (
          <Link className={styles.link} href="/games/discharge-day">
            {en ? "About the game" : "게임 살펴보기"} →
          </Link>
        )}
      </div>
    </article>
  );
}
