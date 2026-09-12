import Image from "next/image";
import Link from "@/components/i18n/link";
import { PageFrame } from "@/components/site";
import { PageIntro } from "@/components/page-intro";
import { useText } from "@/lib/i18n/use-text";
import { localizeMetadata } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/metadata";
import { youthArtsFestival as festival } from "@/lib/festival";
import styles from "@/components/festival.module.css";

export async function generateMetadata() {
  return localizeMetadata(pageMetadata(festival.href, { ogImage: festival.image.src }));
}

export default function YouthArtsFestivalPage() {
  const t = useText();
  return (
    <PageFrame>
      <PageIntro title={t(festival.title)} description={t(festival.body)}>
        <span>{t("2026년 9월 12일 · 성남동 젊음의거리 · 청년디딤터 부스")}</span>
      </PageIntro>
      <article className="shell">
        <figure className={styles.photo}>
          <Image
            src={festival.image.src}
            alt={t(festival.image.alt)}
            width={1600}
            height={1200}
            sizes="(max-width: 1200px) 100vw, 1200px"
            priority
          />
          <figcaption>
            {t("단서공방 제공 · 작품 상자, 캐릭터 자료와 공식 사이트를 소개한 전시 테이블")}
          </figcaption>
        </figure>
        <div className={styles.details}>
          <h2>{t("부스에서 소개한 작품")}</h2>
          <p>
            {t(
              "작품 상자와 캐릭터별 자료를 펼쳐 전시하고, 노트북으로 단서공방의 공식 사이트를 함께 소개했습니다.",
            )}
          </p>
          <ul>
            {[
              ["snake-carnival", "뱀이 죽은 축제"],
              ["red-lab", "레드가 죽은 연구소"],
              ["gourmet-master", "미식의 대가"],
              ["too-many-doctors", "의사가 너무 많아!"],
            ].map(([slug, title]) => (
              <li key={slug}>
                <Link href={`/works/${slug}`}>{t(title)} →</Link>
              </li>
            ))}
          </ul>
          <p>{t("참여 기록은 단서공방이 제공한 현장 사진을 바탕으로 작성했습니다.")}</p>
          <a href={festival.source} target="_blank" rel="noreferrer">
            {t("행사 일정·장소 안내 기사 ↗")}
          </a>
          <p>
            <Link href="/activity">{t("활동 기록으로 돌아가기 →")}</Link>
          </p>
        </div>
      </article>
    </PageFrame>
  );
}
