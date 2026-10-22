"use client";
import { useText } from "@/lib/i18n/use-text";
import { useState } from "react";
import Link from "@/components/i18n/link";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/config";
import { loginAction } from "@/app/actions/auth";
import { LanguageSwitch } from "@/components/i18n/language-switch";
export default function LoginForm({ nextPath }: { nextPath: string | null }) {
  const t = useText();
  const studentRegistration = nextPath?.split("?")[0] === "/dashboard/register";
  const notebook = nextPath?.split("?")[0] === "/dashboard/notebook";
  const englishLearning = nextPath?.startsWith("/english") === true;
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
      await loginAction(idToken, nextPath);
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
        <h1>
          {t(
            englishLearning
              ? "영어 학습 로그인"
              : notebook
                ? "추리노트 시작하기"
                : studentRegistration
                  ? "학생 정보 등록 로그인"
                  : "학원 관리 로그인",
          )}
        </h1>
        <p>
          {t(
            englishLearning
              ? "Google로 로그인하면 이야기 진도와 표현 복습을 저장하고, 닉네임으로 학습 커뮤니티에 참여할 수 있어요."
              : notebook
                ? "Google로 시작하면 계정이 만들어지고, 추리노트를 사진으로 등록할 수 있어요."
                : studentRegistration
                  ? "학생 본인의 Google 계정으로 로그인하면 정보 등록 화면으로 연결됩니다."
                  : "학원생\u00B7반\u00B7성적을 관리합니다. 처음이라면 예시 화면부터 살펴보세요.",
          )}
        </p>

        <button
          className="login-google-button"
          onClick={handleGoogleLogin}
          disabled={pending}
          type="button"
        >
          {t(pending ? "로그인 중…" : notebook ? "Google로 시작하기" : "Google로 로그인")}
        </button>

        {t(
          error && (
            <p className="login-error" role="alert">
              {t(error)}
            </p>
          ),
        )}
        <p>
          <Link href={englishLearning ? "/english" : "/demo"}>
            {t(
              englishLearning
                ? "로그인 없이 영어 이야기 체험하기 →"
                : "로그인 없이 예시로 체험하기 →",
            )}
          </Link>
        </p>
        <p>
          <Link href="/">{t("트위즈덤 홈으로")}</Link>
        </p>
      </div>
    </div>
  );
}
