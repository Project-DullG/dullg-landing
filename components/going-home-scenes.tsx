import Image from "next/image";
import { useText } from "@/lib/i18n/use-text";
import styles from "./going-home-scenes.module.css";

const base = "/assets/going-home-scenes/";

/** What the game feels like: the Friday-evening scene and the two places the keys should be. */
export function GoingHomeScenes({ cluesOnly = false }: { cluesOnly?: boolean }) {
  const t = useText();
  return (
    <section
      className={styles.section}
      aria-labelledby={cluesOnly ? "going-home-clues-title" : "going-home-scene-title"}
    >
      <div className={styles.shell}>
        {cluesOnly && (
          <h2 id="going-home-clues-title" className={styles.cluesTitle}>
            {t("사라진 두 열쇠")}
          </h2>
        )}
        {!cluesOnly && (
        <figure className={styles.hero}>
          <span className={styles.frame}>
            <Image
              src={base + "friday-710.webp"}
              alt={t("금요일 저녁 학원 3층 자습실, 지친 얼굴로 서로를 살피는 네 학생")}
              width={1600}
              height={900}
              sizes="(max-width: 1160px) 100vw, 1120px"
            />
          </span>
          <figcaption className={styles.heroCopy}>
            <p className={styles.kicker}>{t("어떤 게임인가요")}</p>
            <h2 id="going-home-scene-title">
              {t("금요일 저녁 7시 10분,")}
              <br />
              {t("집에 가고 싶은 네 사람")}
            </h2>
            <p>
              {t(
                "재시험만 보면 끝나는 금요일, 자료함 열쇠와 핸드폰함 열쇠가 사라졌습니다. 오늘 시험을 못 보면 토요일 오후에 다시 나와야 하고, 휴대폰도 돌려받을 수 없습니다.",
              )}
            </p>
          </figcaption>
        </figure>
        )}

        <div className={styles.clues}>
          <figure className={styles.clue}>
            <span className={styles.frame}>
              <Image
                src={base + "empty-key-hook.webp"}
                alt={t("원장실 입구 공용 볼펜 선반 위, 비어 있는 열쇠고리")}
                width={1100}
                height={825}
                sizes="(max-width: 760px) 100vw, 50vw"
              />
            </span>
            <figcaption>
              <strong>{t("열쇠가 걸려 있던 자리")}</strong>
              <span>{t("원장실 입구 공용 볼펜 선반 안쪽. 두 열쇠는 원래 여기 함께 걸려 있었습니다.")}</span>
            </figcaption>
          </figure>
          <figure className={styles.clue}>
            <span className={styles.frame}>
              <Image
                src={base + "locked-phone-box.webp"}
                alt={t("3층 복도 책장 위, 휴대폰이 든 채 잠긴 핸드폰함")}
                width={1100}
                height={825}
                sizes="(max-width: 760px) 100vw, 50vw"
              />
            </span>
            <figcaption>
              <strong>{t("잠긴 핸드폰함")}</strong>
              <span>{t("핸드폰은 바로 저기 있는데 꺼낼 수 없습니다. 핸드폰함 열쇠도 함께 사라졌기 때문입니다.")}</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

/** The game played as a lesson, shown inside the "why a mystery game" section. */
export function ClassroomPlay() {
  const t = useText();
  return (
    <figure className={styles.play}>
      <span className={styles.frame}>
        <Image
          src={base + "classroom-play.webp"}
          alt={t("수업 중 단서 카드를 들고 근거를 말하는 학생과 손을 들어 반박하는 학생")}
          width={1600}
          height={900}
          sizes="(max-width: 1160px) 100vw, 1120px"
        />
      </span>
      <figcaption>{t("수업 장면을 그린 일러스트입니다. 한 명이 카드를 짚어 말하면, 다른 한 명이 바로 반박합니다.")}</figcaption>
    </figure>
  );
}
