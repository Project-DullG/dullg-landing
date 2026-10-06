import Link from "@/components/i18n/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { useText } from "@/lib/i18n/use-text";
import styles from "./episode-trailer.module.css";

type EpisodeTrailerProps = {
  id: string;
  showEpisodeLink?: boolean;
};

export function EpisodeTrailer({ id, showEpisodeLink = false }: EpisodeTrailerProps) {
  const t = useText();
  return (
    <div className={styles.root} id={id}>
      <figure className={styles.figure}>
        <video
          className={styles.video}
          controls
          playsInline
          preload="none"
          width={1920}
          height={1080}
          poster="/assets/going-home-20261006/intro-poster.webp"
          aria-label={t("집에 가고 싶어! 게임 소개, 1분, 한국어 자막 포함")}
          aria-describedby={`${id}-caption`}
        >
          <source src="/assets/going-home-20261006/intro.mp4" type="video/mp4" />
          <a href="/assets/going-home-20261006/intro.mp4">{t("게임 소개 영상 열기")}</a>
        </video>
        <figcaption className={styles.caption} id={`${id}-caption`}>
          <span>
            <strong>{t("집에 가고 싶어! · 게임 소개")}</strong>
            <span className={styles.meta}>{t("1분 · 한국어 자막")}</span>
          </span>
          {showEpisodeLink && (
            <Link href="/episode" className={styles.link}>
              {t("현재 수업팩 보기")} <ArrowRight size={17} aria-hidden="true" />
            </Link>
          )}
        </figcaption>
      </figure>
      <details className={styles.transcript}>
        <summary>{t("영상 대본")}</summary>
        <div>
          <p>{t("금요일 저녁. 재시험만 보면 끝인데, 열쇠가 없다. 8시까지 못 찾으면 내일도 학원.")}</p>
          <p>{t("네 학생 중 한 사람을 맡습니다. 각자의 가방에서 물건을 하나씩 꺼냅니다.")}</p>
          <p>{t("누가 어디 있었는지, 카드를 보며 이야기를 맞춰 봅니다. “그럼 넌 그때 어디 있었어?”")}</p>
          <p>{t("9장을 보고, 한 사람을 지목합니다. 남은 3장은 비공개. 오늘은 집에 가자.")}</p>
        </div>
      </details>
    </div>
  );
}
