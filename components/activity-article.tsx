import Image from "next/image";
import Link from "@/components/i18n/link";
import { PageFrame } from "@/components/site";
import { useText } from "@/lib/i18n/use-text";
import type { ActivityArticleData } from "@/lib/activity-articles";
import styles from "./activity-article.module.css";

export function ActivityArticle({ article }: { article: ActivityArticleData }) {
  const t = useText();
  return (
    <PageFrame>
      <article className={styles.article}>
        <header className={styles.header}>
          <Link href="/activity" className={styles.back}>
            {t("활동 기록")} ←
          </Link>
          <div className={styles.meta}>
            <span>{t(article.category)}</span>
            <time dateTime={article.date}>{article.date.replaceAll("-", ".")}</time>
            <span>{t("단서공방")}</span>
          </div>
          <h1>{t(article.title)}</h1>
          <p className={styles.intro}>{t(article.intro)}</p>
        </header>
        {article.sections.map((section, index) => (
          <section className={styles.section} key={section.title}>
            <h2>{t(section.title)}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{t(paragraph)}</p>
            ))}
            {section.photo && (
              <figure>
                <Image
                  src={section.photo.src}
                  alt={t(section.photo.alt)}
                  width={1600}
                  height={1200}
                  sizes="(max-width: 800px) 100vw, 760px"
                  priority={index === 0}
                />
                <figcaption>{t(section.photo.caption)}</figcaption>
              </figure>
            )}
          </section>
        ))}
        {article.privacyNote && (
          <p className={styles.note}>
            {t("참여자 얼굴은 개인정보 보호를 위해 흐림 처리했습니다.")}
          </p>
        )}
        <aside className={styles.related} aria-labelledby="related-title">
          <h2 id="related-title">{t(article.relatedTitle)}</h2>
          {article.links.map((link) =>
            link.href.startsWith("https:") || link.download ? (
              <a
                key={link.href}
                href={link.href}
                download={link.download || undefined}
                target={link.download ? undefined : "_blank"}
                rel="noopener noreferrer"
              >
                {t(link.label).replace(/\s*[→↗]$/, "")}{" "}
                <span aria-hidden="true">{link.download ? "↓" : "↗"}</span>
              </a>
            ) : (
              <Link key={link.href} href={link.href}>
                {t(link.label).replace(/\s*[→↗]$/, "")} <span aria-hidden="true">→</span>
              </Link>
            ),
          )}
        </aside>
        <footer className={styles.footer}>
          <Link href="/activity">← {t("활동 기록으로 돌아가기")}</Link>
        </footer>
      </article>
    </PageFrame>
  );
}
