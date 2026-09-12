import Image from "next/image";
import Link from "@/components/i18n/link";
import { useText } from "@/lib/i18n/use-text";
import { youthArtsFestival as festival } from "@/lib/festival";
import styles from "./festival.module.css";

export function FestivalHighlight() {
  const t = useText();
  return (
    <Link href={festival.href} className={styles.highlight}>
      <Image
        src={festival.image.src}
        alt={t(festival.image.alt)}
        width={1600}
        height={1200}
        sizes="(max-width: 760px) 100vw, 420px"
      />
      <div>
        <span>
          <time dateTime={festival.date}>2026.09.12</time> · {t("전시")}
        </span>
        <h3>{t(festival.title)}</h3>
        <p>{t(festival.body)}</p>
        <strong>{t("참여 기록 보기 →")}</strong>
      </div>
    </Link>
  );
}
