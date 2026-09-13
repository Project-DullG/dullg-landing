import Image from "next/image";
import Link from "@/components/i18n/link";
import { useText } from "@/lib/i18n/use-text";
import styles from "./feature.module.css";
export function TideFeature({ play = false }: { play?: boolean }) {
  const t = useText();
  return (
    <article className={styles.card}>
      <Image
        className={styles.art}
        src="/assets/tide-room/pier.webp"
        alt={t("해 질 무렵, 섬의 관측소로 이어지는 부두")}
        width={1440}
        height={960}
        sizes="(max-width:700px) 100vw, 55vw"
      />
      <div className={styles.body}>
        <span className={styles.tag}>{t("1인 추리 · 한국어 · 초자연적 공포")}</span>
        <h2>{t("유리 너머의 목소리")}</h2>
        <p>
          {t("돌아오겠다던 아버지가 사라졌다.")}
          <br />
          {t(
            "그를 마지막으로 본 사람은 이미 배를 타고 떠났다고 말한다. 하지만 출항장부에는 그의 이름이 없다.",
          )}
        </p>
        <p>{t("탐정이 되어 관측소를 조사하고, 문서와 증언이 서로 다른 이유를 밝혀라.")}</p>
        <Link className={styles.link} href={play ? "/play/tide-room" : "/games/tide-room"}>
          {t(play ? "조사 시작하기" : "게임 살펴보기")} →
        </Link>
      </div>
    </article>
  );
}
