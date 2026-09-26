import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { episodeTitle } from "@/lib/education";
import styles from "./episode-trailer.module.css";

type EpisodeTrailerProps = {
  id: string;
  showEpisodeLink?: boolean;
};

export function EpisodeTrailer({ id, showEpisodeLink = false }: EpisodeTrailerProps) {
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
          poster="/assets/videos/two-keys-trailer-v8-poster.webp"
          aria-label={`${episodeTitle} 예고편, 26초, 한국어 자막 포함`}
          aria-describedby={`${id}-caption`}
        >
          <source src="/assets/videos/two-keys-trailer-v8.mp4" type="video/mp4" />
          <track
            kind="captions"
            src="/assets/videos/two-keys-trailer-v8.ko.vtt"
            srcLang="ko"
            label="한국어"
          />
          <a href="/assets/videos/two-keys-trailer-v8.mp4">두 열쇠 예고편 열기</a>
        </video>
        <figcaption className={styles.caption} id={`${id}-caption`}>
          <span>
            <strong>{episodeTitle}</strong>
            <span className={styles.meta}>예고편 · 26초 · 한국어 자막</span>
          </span>
          {showEpisodeLink && (
            <Link href="/episode#episode-trailer" className={styles.link}>
              에피소드 보기 <ArrowRight size={17} aria-hidden="true" />
            </Link>
          )}
        </figcaption>
      </figure>
      <details className={styles.transcript}>
        <summary>영상 대본 읽기</summary>
        <div>
          <p>두 열쇠가 사라졌다. 시험지도, 휴대폰도 꺼낼 수 없다. 여덟 시까지 찾아야 한다.</p>
          <p>남은 곳은… 네 사람의 가방. 범인이 아니어도, 숨기고 싶은 건 있다.</p>
          <p>우리 중에… 범인이 있다.</p>
          <p>여덟 시까지 두 열쇠.</p>
        </div>
      </details>
    </div>
  );
}
