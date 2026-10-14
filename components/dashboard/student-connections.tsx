"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "@/components/i18n/link";
import { useText } from "@/lib/i18n/use-text";
import { requestAcademyAction, leaveAcademyAction } from "@/app/actions/student-registration";
import type { ApplicationStatus } from "@/lib/student-registration";

export type MembershipItem = {
  academyId: string;
  academyName: string;
  status: ApplicationStatus;
  legacy?: boolean;
};

export function StudentConnections({
  memberships,
  profileReady,
  requestedAcademyId,
}: {
  memberships: MembershipItem[];
  profileReady: boolean;
  requestedAcademyId: string;
}) {
  const t = useText();
  const router = useRouter();
  const [code, setCode] = useState(requestedAcademyId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const labels: Record<ApplicationStatus, string> = {
    pending: "승인 대기",
    approved: "등록 완료",
    rejected: "신청 거절",
    left: "탈퇴·신청 취소",
  };
  async function request(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await requestAcademyAction(code.trim());
      setCode("");
      setMessage("가입을 신청했습니다. 학원에서 승인하면 등록됩니다.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "처리하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }
  async function leave(item: MembershipItem) {
    if (item.status === "approved" && !window.confirm(t("이 학원에서 탈퇴할까요?"))) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await leaveAcademyAction(item.academyId);
      setMessage(
        item.status === "approved" ? "학원에서 탈퇴했습니다." : "가입 신청을 취소했습니다.",
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "처리하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="dash-card" aria-labelledby="my-academies-title">
      <h2 id="my-academies-title">{t("내 학원")}</h2>
      <p>
        {t(
          "학원 연결은 선택입니다. 여러 학원에 신청할 수 있고, 언제든 신청을 취소하거나 탈퇴할 수 있습니다.",
        )}
      </p>
      {profileReady ? (
        <form onSubmit={request}>
          <label htmlFor="academy-request-code">{t("학원 코드 (선택)")}</label>
          <input
            id="academy-request-code"
            className="dash-input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={128}
            autoCapitalize="none"
            spellCheck={false}
            required
            disabled={busy}
          />
          <button className="dash-button" disabled={busy || !code.trim()} type="submit">
            {t("학원 가입 신청")}
          </button>
        </form>
      ) : (
        <p>
          <Link
            href={`/dashboard/register${requestedAcademyId ? `?academy=${encodeURIComponent(requestedAcademyId)}` : ""}`}
          >
            {t("본인 인증 후 학원 연결하기")}
          </Link>
        </p>
      )}
      {memberships.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {memberships.map((item) => (
            <li
              key={item.academyId}
              style={{ padding: "18px 0", borderTop: "1px solid var(--line)" }}
            >
              <strong>{item.academyName}</strong>
              <p>{t(labels[item.status])}</p>
              {item.status === "approved" && (
                <p>
                  <Link href={`/dashboard/my?academy=${encodeURIComponent(item.academyId)}`}>
                    {t("이 학원 성적 보기")}
                  </Link>
                </p>
              )}
              {(item.status === "pending" || item.status === "approved") && (
                <button
                  type="button"
                  className="dash-text-button"
                  disabled={busy}
                  onClick={() => leave(item)}
                >
                  {t(item.status === "approved" ? "학원 탈퇴" : "신청 취소")}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p className="dash-error" role="alert">
          {t(error)}
        </p>
      )}
      {message && (
        <p className="dash-success" role="status">
          {t(message)}
        </p>
      )}
    </section>
  );
}
