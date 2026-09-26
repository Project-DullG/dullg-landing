import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { speakingAccess } from "@/lib/speaking/access/server";
import { studySnapshot } from "@/lib/speaking/server";
import { SpeakingStudy } from "@/components/speaking/study-app";
import styles from "@/components/speaking/speaking.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "스피킹 공부",
  robots: { index: false, follow: false },
};
export default async function StudyPage() {
  const access = await speakingAccess();
  if (access.status !== "ready") redirect("/speaking");
  const snapshot = await studySnapshot(access.session.uid).catch(() => null);
  if (!snapshot) {
    return (
      <main id="main-content" className={styles.accessPage}>
        <div className={styles.accessCard}>
          <h1>학습 기록을 불러오지 못했어요.</h1>
          <p>연결을 확인한 뒤 다시 불러와 주세요.</p>
          <a className={styles.primary} href="/speaking/study">
            다시 불러오기
          </a>
          <Link className={styles.textButton} href="/">
            단서공방 홈으로
          </Link>
        </div>
      </main>
    );
  }
  return (
    <SpeakingStudy
      initial={snapshot}
      name={access.session.name || "학습자"}
      sessionKey={access.sessionKey}
    />
  );
}
