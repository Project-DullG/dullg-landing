"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reviewStudentApplicationAction } from "@/app/actions/student-registration";
import { useText } from "@/lib/i18n/use-text";
import styles from "./student-applications.module.css";

type Application = { userId: string; name: string; email: string; phoneNumber: string };

export function StudentApplications({ applications }: { applications: Application[] }) {
  const t = useText();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function review(application: Application, decision: "approve" | "reject") {
    if (busy) return;
    setBusy(application.userId);
    setError("");
    setMessage("");
    try {
      await reviewStudentApplicationAction(application.userId, decision);
      setMessage(
        decision === "approve"
          ? "학생의 학원 신청을 승인했습니다."
          : "학생의 학원 신청을 거절했습니다.",
      );
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "신청을 처리하지 못했습니다. 다시 시도해 주세요.",
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <section
      className={styles.section}
      aria-labelledby="student-applications-title"
      aria-busy={!!busy}
    >
      <header className={styles.heading}>
        <h2 id="student-applications-title">{t("학원 신청")}</h2>
        <p>{t("승인하면 학생 목록에 추가되고 해당 학원의 성적을 볼 수 있습니다.")}</p>
      </header>
      {applications.length ? (
        <ul className={styles.list}>
          {applications.map((application) => (
            <li key={application.userId}>
              <div className={styles.identity}>
                <strong>{application.name}</strong>
                <span>
                  {t("인증된 이메일")}: {application.email}
                </span>
                <span>
                  {t("학생 본인 휴대전화")}: {application.phoneNumber}
                </span>
              </div>
              <div className={styles.actions}>
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => review(application, "approve")}
                >
                  {t(busy === application.userId ? "처리 중…" : "승인")}
                </button>
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => review(application, "reject")}
                >
                  {t("거절")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>{t("대기 중인 학원 신청이 없습니다.")}</p>
      )}
      <p className={styles.message} role="status">
        {t(message)}
      </p>
      {error && (
        <p className={styles.error} role="alert">
          {t(error)}
        </p>
      )}
    </section>
  );
}
