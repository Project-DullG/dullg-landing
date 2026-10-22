import Image from "next/image";
import { getLocale } from "next-intl/server";
import { localizeEnglishTree } from "@/lib/i18n/english-tree";
import Link from "@/components/i18n/link";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { EnglishHub } from "@/components/english/hub";
import { Header, Footer } from "@/components/site";
import { englishLibrary } from "@/lib/english/library";
import { featuredGames } from "@/lib/featured-games";
import { homeFeaturedWorks } from "@/lib/works";
import { pageMetadata } from "@/lib/metadata";
import { localizeMetadata } from "@/lib/i18n/server";
import styles from "@/components/english/hub.module.css";

export async function generateMetadata() {
  return localizeMetadata(
    pageMetadata("/", {
      absoluteTitle: "트위즈덤 | 게임과 이야기로 배우는 곳",
      ogImage: "/assets/english/bookshop.webp",
    }),
  );
}

export default async function Home() {
  const locale = await getLocale();
  const echo = featuredGames["last-screening"];
  const work = homeFeaturedWorks[0];
  return localizeEnglishTree(
    <>
      <Header />
      <main id="main-content">
        <EnglishHub episodes={englishLibrary()} home />
        <section className={styles.studio} aria-labelledby="home-studio-title">
          <div className={styles.shell}>
            <div className={styles.studioHead}>
              <div>
                <p className={styles.eyebrow}>FROM THE STUDIO</p>
                <h2 id="home-studio-title">게임과 교육을 만드는 트위즈덤</h2>
              </div>
              <p>
                Twisdom은 Twist와 Wisdom을 합친 이름입니다. 이야기의 반전을 통해 이해가
                깊어진다는 뜻으로, 추리 게임과 교육 콘텐츠를 함께 만듭니다.
              </p>
            </div>
            <div className={styles.studioCards}>
              <article className={styles.studioCard}>
                <Image
                  src={echo.image.src}
                  alt={echo.image.alt}
                  width={360}
                  height={260}
                  sizes="(max-width: 700px) 110px, 200px"
                />
                <div>
                  <span>추리·퍼즐·아케이드</span>
                  <h3>트위즈덤 웹게임</h3>
                  <p>잔향 탐정의 사건을 조사하고, 울릉마블과 여러 퍼즐 게임을 즐겨보세요.</p>
                  <Link href="/mini-projects">
                    웹게임 둘러보기
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </article>
              {work && (
                <article className={styles.studioCard}>
                  <Image
                    src={work.image}
                    alt={work.alt}
                    width={360}
                    height={360}
                    sizes="(max-width: 700px) 110px, 200px"
                  />
                  <div>
                    <span>함께 푸는 머더미스터리</span>
                    <h3>{work.title}</h3>
                    <p>
                      인물이 되어 단서를 나누고, 이야기 속 사건을 함께 해결하는 트위즈덤의 실물
                      작품.
                    </p>
                    <Link href="/works">
                      작품과 펀딩 기록
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              )}
            </div>
            <div className={styles.studioMore}>
              <Link href="/studio">
                작품·활동 전체 보기
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
              <Link href="/about">
                브랜드 소개
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
              <Link href="/activity">
                제작·활동 기록
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
              <Link href="/materials">
                수강생 자료실
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
              <Link href="/contact">
                교육·제작 협업 문의
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>,
    locale,
  );
}
