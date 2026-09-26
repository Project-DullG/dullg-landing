"use client";
import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/config";
import styles from "./speaking.module.css";
import Link from "next/link";

function notifyAccountChange() {
  if (typeof BroadcastChannel === "undefined") return;
  const channel = new BroadcastChannel("speaking-access");
  channel.postMessage("account-changed");
  channel.close();
}

export function SpeakingAccessForm({
  status,
  name,
}: {
  status: "login" | "code" | "setup";
  name?: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  async function send(input: object) {
    const response = await fetch("/speaking/api/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (response.status === 401) {
      window.location.replace("/speaking");
      return false;
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "다시 시도해 주세요.");
    return true;
  }
  async function login() {
    setPending(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(getClientAuth(), provider);
      if (!(await send({ kind: "login", idToken: await result.user.getIdToken() }))) return;
      notifyAccountChange();
      window.location.assign("/speaking");
    } catch (e) {
      const errorCode = (e as { code?: string }).code;
      if (errorCode !== "auth/popup-closed-by-user" && errorCode !== "auth/cancelled-popup-request")
        setError(
          errorCode === "auth/popup-blocked"
            ? "로그인 팝업을 허용한 뒤 다시 눌러 주세요."
            : e instanceof Error && !errorCode
              ? e.message
              : "구글 로그인에 연결하지 못했습니다. 잠시 후 다시 시도하세요.",
        );
      setPending(false);
    }
  }
  async function unlock(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      if (!(await send({ kind: "code", code }))) return;
      window.location.assign("/speaking/study");
    } catch (e) {
      setError(e instanceof Error ? e.message : "인증코드를 확인하세요.");
      setPending(false);
    }
  }
  async function changeAccount() {
    setPending(true);
    setError("");
    try {
      if (!(await send({ kind: "logout" }))) return;
      notifyAccountChange();
      await signOut(getClientAuth());
      window.location.assign("/speaking");
    } catch {
      setError("로그아웃하지 못했습니다. 다시 시도하세요.");
      setPending(false);
    }
  }
  return (
    <div className={styles.accessCard}>
      {status !== "setup" && (
        <p>
          {status === "login"
            ? "진도와 물고기를 내 계정에 저장합니다."
            : `${name || "학습자"}님, 전달받은 인증코드를 입력해 주세요.`}
        </p>
      )}
      {status === "login" ? (
        <button className={styles.googleButton} disabled={pending} onClick={login}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/brand/google-g.png" alt="" width={20} height={20} aria-hidden="true" />
          <span>{pending ? "로그인 연결 중…" : "Google로 로그인"}</span>
        </button>
      ) : status === "setup" ? (
        <p className={styles.notice} role="status">
          접근 설정을 준비하고 있습니다. 관리자에게 문의해 주세요.
        </p>
      ) : (
        <form onSubmit={unlock}>
          <label className={styles.field}>
            인증코드
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={256}
              required
              disabled={pending}
              placeholder="전달받은 코드"
            />
          </label>
          <button type="submit" className={styles.primary} disabled={pending || !code.trim()}>
            {pending ? "확인 중…" : "공부 시작하기"}
          </button>
        </form>
      )}
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {status !== "login" && (
        <button className={styles.textButton} disabled={pending} onClick={changeAccount}>
          다른 구글 계정으로 로그인
        </button>
      )}
      <p className={styles.small}>
        <Link href="/privacy">개인정보 처리 안내</Link>
      </p>
    </div>
  );
}
