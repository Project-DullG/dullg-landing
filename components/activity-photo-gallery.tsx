import Image from "next/image";
import styles from "./activity-photo-gallery.module.css";

type ActivityPhoto = {
  src: string;
  alt: string;
  caption: string;
};

export function ActivityPhotoGallery({ photos }: { photos: ActivityPhoto[] }) {
  return (
    <section className={styles.section} aria-labelledby="activity-photo-title">
      <div className={styles.heading}>
        <p>수업 현장</p>
        <h2 id="activity-photo-title">함께 만든 과정</h2>
        <span>참여자 얼굴은 개인정보 보호를 위해 흐림 처리했습니다.</span>
      </div>
      <div className={styles.grid}>
        {photos.map((photo) => (
          <figure key={photo.src}>
            <Image
              alt={photo.alt}
              height={1086}
              sizes="(max-width: 760px) 100vw, 50vw"
              src={photo.src}
              width={1448}
            />
            <figcaption>{photo.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
