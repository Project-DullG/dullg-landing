import { useText } from "@/lib/i18n/use-text";
import Image from "next/image";
import Link from "@/components/i18n/link";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Kicker } from "@/components/site";
import { getWorkStatus, homeFeaturedWorks } from "@/lib/works";
import styles from "./home-works.module.css";
export function HomeWorks() {
  const t = useText();
  const [featured, ...related] = homeFeaturedWorks;
  if (!featured) return null;
  return (
    <section className="brand-works shell" aria-labelledby="brand-works-title">
      <div className="brand-section-head">
        <div>
          <Kicker>{t("작품")}</Kicker>
          <h2 id="brand-works-title">{t("공개한 머더미스터리")}</h2>
        </div>
        <Link href="/works">
          {t("모든 작품과 펀딩 기록")}
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>

      <article className={styles.featured} aria-labelledby="featured-work-title">
        <Link href={`/works/${featured.slug}`} className={styles.cover}>
          <Image
            src={featured.image}
            width={1000}
            height={1000}
            alt={t(featured.alt)}
            sizes="(max-width: 760px) 100vw, 55vw"
          />
        </Link>
        <div className={styles.copy}>
          <span className={styles.status}>{t(getWorkStatus(featured))}</span>
          <h3 id="featured-work-title">
            <Link href={`/works/${featured.slug}`}>{t(featured.title)}</Link>
          </h3>
          <p>{t(featured.synopsis)}</p>
          <dl className={styles.facts}>
            <div>
              <dt>{t("인원")}</dt>
              <dd>{t(featured.players)}</dd>
            </div>
            <div>
              <dt>{t("시간")}</dt>
              <dd>{t(featured.duration)}</dd>
            </div>
            <div>
              <dt>{t("형태")}</dt>
              <dd>{t(featured.platform)}</dd>
            </div>
          </dl>
          <Link className={styles.action} href={`/works/${featured.slug}`}>
            {t("작품 자세히 보기")}
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </article>

      <div className={styles.related}>
        {t(
          related.map((work) => (
            <Link href={`/works/${work.slug}`} className={styles.item} key={work.slug}>
              <Image
                src={work.image}
                width={1000}
                height={1000}
                alt={t(work.alt)}
                sizes="(max-width: 760px) 88px, 120px"
              />
              <div>
                <span className={styles.status}>{t(getWorkStatus(work))}</span>
                <h3>{t(work.title)}</h3>
                <p>
                  {t(work.players)} · {t(work.duration)} · {t(work.platform)}
                </p>
              </div>
              <ArrowUpRight className={styles.arrow} size={18} aria-hidden="true" />
            </Link>
          )),
        )}
      </div>
    </section>
  );
}
