import Image from "next/image";
import { getLocale } from "next-intl/server";
import { localizeEnglishTree } from "@/lib/i18n/english-tree";
import Link from "@/components/i18n/link";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { EnglishHub } from "@/components/english/hub";
import { DebateScene } from "@/components/debate-scene";
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
      ogImage: "/assets/og/twisdom-site.png",
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
        <section className={styles.first} aria-labelledby="home-first-title">
          <div className={styles.shell}>
            <div className={styles.firstCard}>
              <Image
                src="/assets/genre-guide/living-room-play.webp"
                alt="거실 탁자에 둘러앉아 웃으며 이야기하는 네 사람"
                width={720}
                height={480}
                sizes="(max-width: 760px) 100vw, 560px"
              />
              <div>
                <span>처음 해 보는 분께</span>
                <h2 id="home-first-title">머더미스터리는 어떻게 하는 놀이인가요?</h2>
                <p>
                  각자 대본을 받아 자기 역할을 읽고, 이야기를 나누다 범인을 고릅니다.
                  집에서 하는 작은 연극처럼 하시면 됩니다.
                </p>
                <Link href="/works#first-time">
                  처음 하는 법 보기
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>
        <DebateScene variant="home" />
        <section className={styles.studio} aria-labelledby="home-studio-title">
          <div className={styles.shell}>
            <div className={styles.studioHead}>
              <div>
                <p className={styles.eyebrow}>트위즈덤 스튜디오</p>
                <h2 id="home-studio-title">추리 게임과 영어 수업을 만드는 트위즈덤</h2>
              </div>
              <p>
                twisdom은 Twist와 Wisdom을 합친 이름입니다. 반전을 알고 나면 앞서 읽은
                단서를 다시 보게 됩니다. 그 순간을 만드는 추리 게임과 수업을 만듭니다.
              </p>
            </div>
            <div className={styles.studioCards} data-stagger>
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
