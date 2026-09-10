"use client";
import { useText } from "@/lib/i18n/use-text";
import { useState } from "react";
import Link from "@/components/i18n/link";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/config";
import { loginAction } from "@/app/actions/auth";
import { LanguageSwitch } from "@/components/i18n/language-switch";
export default function LoginPage() {
  const t = useText();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function handleGoogleLogin() {
    setPending(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(getClientAuth(), provider);
      const idToken = await result.user.getIdToken();
      // Server action sets the session cookie and redirects by role.
      await loginAction(idToken);
    } catch (err) {
      const code =
        (
          err as {
            code?: string;
          }
        ).code ?? "";
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        setError(null);
      } else if (code === "auth/unauthorized-domain") {
        setError("이 도메인은 Firebase에서 허용되지 않았습니다. 승인된 도메인 설정을 확인하세요.");
      } else {
        setError("로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        console.error("[login]", err);
      }
      setPending(false);
    }
  }
  return (
    <div className="login-page">
      <div className="login-card">
        <LanguageSwitch />
        <h1>{t("학원 관리 로그인")}</h1>
        <p>{t("학원생\u00B7반\u00B7성적을 관리합니다. 처음이라면 예시 화면부터 살펴보세요.")}</p>

        <button
          className="login-google-button"
          onClick={handleGoogleLogin}
          disabled={pending}
          type="button"
        >
          {t(pending ? "로그인 중…" : "Google로 로그인")}
        </button>

        {t(
          error && (
            <p className="login-error" role="alert">
              {t(error)}
            </p>
          ),
        )}
        <p>
          <Link href="/demo">{t("로그인 없이 예시로 체험하기 →")}</Link>
        </p>
        <p>
          <Link href="/">{t("단서공방 홈으로")}</Link>
        </p>
      </div>
    </div>
  );
}
