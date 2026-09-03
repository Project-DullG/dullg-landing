"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useState } from "react";
import { getClientAuth } from "@/lib/firebase/config";
import { loginAction } from "@/app/actions/auth";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGoogleLogin() {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(getClientAuth(), provider);
      const idToken = await result.user.getIdToken();
      await loginAction(idToken);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>학원 관리 로그인</h1>
        <p>Google 계정으로 로그인하세요.</p>

        <button
          className="login-google-button"
          onClick={handleGoogleLogin}
          disabled={loading}
          type="button"
        >
          {loading ? "로그인 중..." : "Google로 로그인"}
        </button>

        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
}
