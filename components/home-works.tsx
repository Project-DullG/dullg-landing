import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Kicker } from "@/components/site";
import { getWorkStatus, homeFeaturedWorks } from "@/lib/works";
import styles from "./home-works.module.css";

export function HomeWorks() {
  const [featured, ...related] = homeFeaturedWorks;
  if (!featured) return null;

  return (
    <section className="brand-works shell" aria-labelledby="brand-works-title">
      <div className="brand-section-head">
        <div>
          <Kicker>작품</Kicker>
          <h2 id="brand-works-title">공개한 머더미스터리</h2>
        </div>
        <Link href="/works">
          모든 작품과 펀딩 기록 <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>

      <article className={styles.featured} aria-labelledby="featured-work-title">
        <Link href={`/works/${featured.slug}`} className={styles.cover}>
          <Image
            src={featured.image}
            width={1000}
            height={1000}
            alt={featured.alt}
            sizes="(max-width: 760px) 100vw, 55vw"
          />
        </Link>
        <div className={styles.copy}>
          <span className={styles.status}>{getWorkStatus(featured)}</span>
          <h3 id="featured-work-title">
            <Link href={`/works/${featured.slug}`}>{featured.title}</Link>
          </h3>
          <p>{featured.synopsis}</p>
          <dl className={styles.facts}>
            <div>
              <dt>인원</dt>
              <dd>{featured.players}</dd>
            </div>
            <div>
              <dt>시간</dt>
              <dd>{featured.duration}</dd>
            </div>
            <div>
              <dt>형태</dt>
              <dd>{featured.platform}</dd>
            </div>
          </dl>
          <Link className={styles.action} href={`/works/${featured.slug}`}>
            작품 자세히 보기 <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </article>

      <div className={styles.related}>
        {related.map((work) => (
          <Link href={`/works/${work.slug}`} className={styles.item} key={work.slug}>
            <Image
              src={work.image}
              width={1000}
              height={1000}
              alt={work.alt}
              sizes="(max-width: 760px) 88px, 120px"
            />
            <div>
              <span className={styles.status}>{getWorkStatus(work)}</span>
              <h3>{work.title}</h3>
              <p>
                {work.players} · {work.duration} · {work.platform}
              </p>
            </div>
            <ArrowUpRight className={styles.arrow} size={18} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}
