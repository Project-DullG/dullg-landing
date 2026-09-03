import Image from "next/image";
import landings from "@/lib/work-landings.json";
import styles from "./work-landing.module.css";

export function WorkLanding({ slug, title }: { slug: string; title: string }) {
  const landing = landings[slug as keyof typeof landings];
  if (!landing) return null;

  return (
    <section className={styles.section} aria-labelledby="work-landing-title">
      <header className={styles.header}>
        <h2 id="work-landing-title">작품 소개</h2>
        <a href={landing.source} target="_blank" rel="noopener noreferrer">
          텀블벅 원문 ↗
        </a>
      </header>
      <div className={styles.images}>
        {landing.images.map((image, index) => (
          <Image
            key={image.src}
            src={image.src}
            width={image.width}
            height={image.height}
            sizes="(max-width: 900px) 100vw, 860px"
            alt={`${title} 공식 소개 · 이야기와 등장인물, 게임 구성 (${index + 1}/${landing.images.length})`}
            unoptimized
          />
        ))}
      </div>
      <footer className={styles.note}>
        <p>
          출처: 단서공방 텀블벅 프로젝트 · 2026년 9월 3일 확인. 구성과 제공 조건은 공식 프로젝트의
          최신 안내를 확인해 주세요.
        </p>
        {landing.aiDisclosure && (
          <p>공식 프로젝트에는 생성형 AI를 활용한 이미지가 포함되어 있습니다.</p>
        )}
      </footer>
    </section>
  );
}
