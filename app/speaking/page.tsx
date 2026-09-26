import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageFrame } from "@/components/site";
import { SpeakingAccessForm } from "@/components/speaking/access-form";
import { speakingAccess } from "@/lib/speaking/access/server";
import styles from "@/components/speaking/speaking.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "스피킹 공부",
  robots: { index: false, follow: false },
  description: "듣고 소리 내어 연습하는 7·14·30일 토익스피킹 과정.",
};
export default async function SpeakingPage() {
  const access = await speakingAccess();
  if (access.status === "ready") redirect("/speaking/study");
  return (
    <PageFrame>
      <section className={styles.accessPage}>
        <div className={styles.accessPanel}>
          <div className={styles.accessIntro}>
            <span className={styles.eyebrow}>TOEIC SPEAKING</span>
            <h1>스피킹 공부</h1>
            <p>1주 · 2주 · 한 달 코스와 자유 연습</p>
          </div>
          <SpeakingAccessForm
            status={access.status}
            name={"session" in access ? access.session?.name : undefined}
          />
        </div>
      </section>
    </PageFrame>
  );
}
