import { BrandLogo } from "@/components/brand-mark";
import { certificateCourse, type CertificateRecord } from "@/lib/certificates/course";
import styles from "./certificate.module.css";

export type { CertificateRecord } from "@/lib/certificates/course";

function issuedDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
}

export function CertificatePaper({
  certificate,
  preview = false,
}: {
  certificate: CertificateRecord | null;
  preview?: boolean;
}) {
  const name = certificate?.name ?? "학생 이름";
  const nameLength = [...name].length;
  const nameSize = nameLength > 30 ? 36 : nameLength > 18 ? 42 : 52;

  return (
    <article className={styles.paper} lang="ko" aria-label="교육 참여 수료증">
      <div className={styles.paperHeading}>
        <p className={styles.eyebrow}>ULLEUNG · DOKDO</p>
        <h2>교육 참여 수료증</h2>
        <p className={styles.englishTitle}>CERTIFICATE OF PARTICIPATION</p>
        <div className={styles.ornament} aria-hidden="true" />
      </div>
      <div className={styles.nameArea}>
        <p className={styles.studentName} style={{ fontSize: nameSize }}>
          {name}
        </p>
      </div>
      <p className={styles.program}>
        {certificateCourse.titleLines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </p>
      <p className={styles.statement}>{certificateCourse.body}</p>
      <p className={styles.issueDate}>
        {certificate ? issuedDate(certificate.issuedAt) : "발급일은 수료증 준비 후 표시됩니다"}
      </p>
      <div className={styles.paperFooter}>
        <div className={styles.endorser}>
          <div className={styles.partner}>
            {/* Preserve the supplied logo's original 157:164 proportions in print. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/certificates/handong-logo.png"
              width="46"
              height={(46 * 164) / 157}
              alt="한동대학교 심볼"
              loading="eager"
            />
            <div>
              <span className={styles.smallLabel}>교육 연계</span>
              <strong>{certificateCourse.partner}</strong>
            </div>
          </div>
          <div className={styles.signoff}>
            <span>
              교수 <strong>{certificateCourse.professor}</strong>
            </span>
            <div className={styles.signatureImage}>
              {certificate && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src="/api/certificates/assets/kim-byeongcheol"
                  width="160"
                  height="78"
                  alt="김병철 교수 서명"
                  loading="eager"
                />
              )}
            </div>
          </div>
        </div>
        <div className={styles.endorser}>
          <div className={styles.issuer}>
            <span className={styles.smallLabel}>발급 · {certificateCourse.issuer}</span>
            <BrandLogo width={186} color="#151515" />
          </div>
          <div className={styles.signoff}>
            <span>
              대표 <strong>{certificateCourse.representative}</strong>
            </span>
            <div className={styles.signatureImage}>
              {certificate && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src="/api/certificates/assets/lee-seongro"
                  width="160"
                  height="78"
                  alt="이성로 대표 서명"
                  loading="eager"
                />
              )}
            </div>
          </div>
        </div>
        <div className={styles.endorser}>
          <div className={styles.school}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/certificates/ulleung-high-logo.png"
              width="46"
              height={(46 * 688) / 742}
              alt="울릉고등학교 교표"
              loading="eager"
            />
            <div>
              <span className={styles.smallLabel}>교육 기관</span>
              <strong>{certificateCourse.school}</strong>
            </div>
          </div>
          <div className={styles.signoff}>
            <span>
              교장 <strong>{certificateCourse.principal}</strong>
            </span>
            <div className={styles.sealImage}>
              {certificate && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src="/api/certificates/assets/ulleung-education-seal"
                  width="76"
                  height="76"
                  alt="울릉고등학교 교육활동용 인장"
                  loading="eager"
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.paperFinePrint}>
        <p>{certificateCourse.disclaimer}</p>
        <p className={styles.reference}>표시번호 {certificate?.reference ?? "발급 후 표시"}</p>
      </div>
      {preview && (
        <div
          className={styles.watermark}
          aria-label={certificate ? "미리보기" : "발급 전 미리보기"}
        >
          {certificate ? "미리보기" : "발급 전 미리보기"}
        </div>
      )}
    </article>
  );
}
