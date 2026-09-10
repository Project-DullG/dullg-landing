import { useText } from "@/lib/i18n/use-text";
import { workTrailers } from "@/lib/work-trailers";
import styles from "./work-trailer.module.css";
export function WorkTrailer({ slug }: { slug: string }) {
  const t = useText();
  const trailer = workTrailers[slug];
  if (!trailer) return null;
  return (
    <section className={`shell ${styles.section}`} aria-labelledby="work-trailer-title">
      <div>
        <h2 id="work-trailer-title">{t("작품 예고편")}</h2>
        <p>{t(trailer.duration)}</p>
      </div>
      <figure>
        <video
          controls
          playsInline
          preload="none"
          width={1920}
          height={1080}
          poster={trailer.poster}
          aria-label={t(`${trailer.title} 작품 예고편, ${trailer.duration}`)}
        >
          <source src={trailer.src} type="video/mp4" />
          <a href={trailer.src}>{t("예고편 파일 열기")}</a>
        </video>
        <figcaption>
          <a href={trailer.src}>{t("영상 파일 열기 ↗")}</a>
        </figcaption>
      </figure>
    </section>
  );
}
