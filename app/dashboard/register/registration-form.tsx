"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  linkWithPhoneNumber,
  RecaptchaVerifier,
  reload,
  sendEmailVerification,
  type ConfirmationResult,
} from "firebase/auth";
import Link from "@/components/i18n/link";
import { syncStudentIdentityAction } from "@/app/actions/student-identity";
import { saveStudentProfileAction } from "@/app/actions/student-registration";
import { getClientAuth } from "@/lib/firebase/config";
import { localizedPath } from "@/lib/i18n/translate";
import { useText } from "@/lib/i18n/use-text";
import styles from "./registration.module.css";

type Identity = {
  email: string;
  emailVerified: boolean;
  phoneNumber: string | null;
};

type Props = Identity & {
  uid: string;
  initialName: string;
  requestedAcademyId?: string;
};

type Pending = "sms" | "otp" | "email" | "refresh" | "save" | null;

function phoneInInternationalFormat(countryCode: string, input: string) {
  if (/[^\d+\s()-]/.test(input)) return null;
  const compact = input.replace(/[\s()-]/g, "");
  const country = countryCode.trim();
  if (!/^\+[1-9]\d{0,2}$/.test(country)) return null;
  const phone = compact.startsWith("+")
    ? compact
    : `${country}${country === "+82" ? compact.replace(/^0/, "") : compact}`;
  return /^\+[1-9]\d{7,14}$/.test(phone) ? phone : null;
}

function verificationError(err: unknown, fallback: string) {
  const code = (err as { code?: string } | null)?.code;
  const messages: Record<string, string> = {
    "auth/invalid-phone-number": "휴대전화 번호를 확인해 주세요.",
    "auth/missing-phone-number": "휴대전화 번호를 확인해 주세요.",
    "auth/invalid-verification-code": "인증번호가 올바르지 않습니다. 다시 확인해 주세요.",
    "auth/code-expired": "인증번호가 만료되었습니다. 새 인증번호를 요청해 주세요.",
    "auth/session-expired": "인증번호가 만료되었습니다. 새 인증번호를 요청해 주세요.",
    "auth/too-many-requests": "요청이 많습니다. 잠시 기다린 뒤 다시 시도해 주세요.",
    "auth/credential-already-in-use":
      "이 휴대전화는 다른 계정에서 사용 중입니다. 본인 계정으로 다시 로그인해 주세요.",
    "auth/provider-already-linked":
      "이미 휴대전화가 인증된 계정입니다. 인증 상태를 새로고침해 주세요.",
    "auth/captcha-check-failed": "보안 확인이 완료되지 않았습니다. 다시 시도해 주세요.",
    "auth/network-request-failed": "네트워크 연결을 확인한 뒤 다시 시도해 주세요.",
    "auth/requires-recent-login": "인증을 계속하려면 같은 Google 계정으로 다시 로그인해 주세요.",
    "auth/user-token-expired": "인증을 계속하려면 같은 Google 계정으로 다시 로그인해 주세요.",
    "auth/operation-not-allowed":
      "문자 인증 설정을 확인해야 합니다. 사이트 운영자에게 문의해 주세요.",
    "auth/unauthorized-domain":
      "문자 인증 설정을 확인해야 합니다. 사이트 운영자에게 문의해 주세요.",
    "auth/app-not-authorized": "문자 인증 설정을 확인해야 합니다. 사이트 운영자에게 문의해 주세요.",
    "auth/quota-exceeded": "문자 인증 한도를 확인해야 합니다. 사이트 운영자에게 문의해 주세요.",
    "auth/billing-not-enabled":
      "문자 인증 결제 설정을 확인해야 합니다. 사이트 운영자에게 문의해 주세요.",
  };
  return code ? (messages[code] ?? fallback) : err instanceof Error ? err.message : fallback;
}

export function StudentRegistrationForm({
  uid,
  initialName,
  email,
  emailVerified,
  phoneNumber,
  requestedAcademyId = "",
}: Props) {
  const t = useText();
  const locale = useLocale();
  const router = useRouter();
  const [identity, setIdentity] = useState<Identity>({ email, emailVerified, phoneNumber });
  const [countryCode, setCountryCode] = useState("+82");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [code, setCode] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [smsCooldown, setSmsCooldown] = useState(0);
  const [emailCooldown, setEmailCooldown] = useState(0);
  const recaptchaContainer = useRef<HTMLDivElement>(null);
  const recaptcha = useRef<RecaptchaVerifier | null>(null);
  const busy = pending !== null;
  const ready = identity.emailVerified && Boolean(identity.email) && Boolean(identity.phoneNumber);

  useEffect(() => {
    if (!smsCooldown && !emailCooldown) return;
    const timer = window.setTimeout(() => {
      setSmsCooldown((value) => Math.max(0, value - 1));
      setEmailCooldown((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [smsCooldown, emailCooldown]);

  useEffect(
    () => () => {
      const verifier = recaptcha.current;
      recaptcha.current = null;
      verifier?.clear();
    },
    [],
  );

  async function authenticatedUser() {
    const auth = getClientAuth();
    await auth.authStateReady();
    const user = auth.currentUser;
    if (!user || user.uid !== uid) {
      throw new Error("로그인 계정이 변경되었습니다. 같은 Google 계정으로 다시 로그인해 주세요.");
    }
    auth.languageCode = locale;
    return user;
  }

  async function syncIdentity() {
    const user = await authenticatedUser();
    await reload(user);
    const verified = await syncStudentIdentityAction(await user.getIdToken(true));
    setIdentity(verified);
    return verified;
  }

  async function refreshIdentity() {
    if (busy) return;
    setPending("refresh");
    setError(null);
    setNotice("");
    try {
      const verified = await syncIdentity();
      if (verified.emailVerified && verified.phoneNumber) {
        setConfirmation(null);
        setCode("");
        setNotice("이메일과 휴대전화 인증이 완료되었습니다.");
      } else {
        setNotice("아직 완료되지 않은 인증을 진행해 주세요.");
      }
    } catch (err) {
      setError(verificationError(err, "인증 상태를 확인하지 못했습니다. 다시 시도해 주세요."));
    } finally {
      setPending(null);
    }
  }

  async function sendEmail() {
    if (busy || emailCooldown) return;
    setPending("email");
    setError(null);
    setNotice("");
    try {
      const user = await authenticatedUser();
      await reload(user);
      if (user.emailVerified) {
        await syncIdentity();
        setNotice("이메일 인증이 완료되었습니다.");
      } else {
        await sendEmailVerification(user);
        setEmailCooldown(60);
        setNotice(
          "인증 이메일을 보냈습니다. 이메일의 링크를 누른 뒤 인증 상태를 새로고침해 주세요.",
        );
      }
    } catch (err) {
      setError(verificationError(err, "인증 이메일을 보내지 못했습니다. 다시 시도해 주세요."));
    } finally {
      setPending(null);
    }
  }

  async function sendSms(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || smsCooldown) return;
    setError(null);
    setNotice("");
    const normalized = phoneInInternationalFormat(countryCode, phone);
    if (!normalized) {
      setError("국가 번호와 본인 휴대전화 번호를 확인해 주세요.");
      return;
    }
    if (!consent) {
      setError("휴대전화 인증을 위한 전화번호 처리에 동의해 주세요.");
      return;
    }
    setPending("sms");
    setConfirmation(null);
    setCode("");
    try {
      const user = await authenticatedUser();
      if (!recaptchaContainer.current)
        throw new Error("보안 확인을 준비하지 못했습니다. 다시 시도해 주세요.");
      recaptcha.current?.clear();
      const verifier = new RecaptchaVerifier(getClientAuth(), recaptchaContainer.current, {
        size: "invisible",
        "expired-callback": () => {
          setError("보안 확인이 만료되었습니다. 인증번호를 다시 요청해 주세요.");
        },
      });
      recaptcha.current = verifier;
      const result = await linkWithPhoneNumber(user, normalized, verifier);
      setConfirmation(result);
      setSmsCooldown(60);
      setNotice("인증번호를 문자로 보냈습니다. 6자리 인증번호를 입력해 주세요.");
    } catch (err) {
      if ((err as { code?: string } | null)?.code === "auth/too-many-requests") setSmsCooldown(60);
      setError(verificationError(err, "인증번호를 보내지 못했습니다. 다시 시도해 주세요."));
    } finally {
      const verifier = recaptcha.current;
      recaptcha.current = null;
      verifier?.clear();
      setPending(null);
    }
  }

  async function confirmSms(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !confirmation) return;
    setError(null);
    setNotice("");
    if (!/^\d{6}$/.test(code.trim())) {
      setError("문자로 받은 6자리 인증번호를 입력해 주세요.");
      return;
    }
    setPending("otp");
    try {
      await authenticatedUser();
      const result = await confirmation.confirm(code.trim());
      if (result.user.uid !== uid)
        throw new Error("로그인 계정이 변경되었습니다. 같은 Google 계정으로 다시 로그인해 주세요.");
      const verified = await syncIdentity();
      if (!verified.phoneNumber)
        throw new Error("휴대전화 인증 결과를 확인하지 못했습니다. 인증 상태를 새로고침해 주세요.");
      setConfirmation(null);
      setCode("");
      setNotice("휴대전화 인증이 완료되었습니다.");
    } catch (err) {
      const errorCode = (err as { code?: string } | null)?.code;
      if (errorCode === "auth/code-expired" || errorCode === "auth/session-expired") {
        setConfirmation(null);
        setCode("");
        setSmsCooldown(0);
      }
      setError(verificationError(err, "휴대전화 인증을 완료하지 못했습니다. 다시 시도해 주세요."));
    } finally {
      setPending(null);
    }
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError(null);
    setNotice("");
    if (!ready) {
      setError("이메일과 본인 휴대전화 인증을 먼저 완료해 주세요.");
      return;
    }
    const name = String(new FormData(event.currentTarget).get("name") ?? "").trim();
    if (!name) {
      setError("이름을 입력해주세요.");
      return;
    }
    setPending("save");
    try {
      await authenticatedUser();
      await saveStudentProfileAction({ name });
    } catch (err) {
      setError(verificationError(err, "저장하지 못했습니다. 다시 시도해 주세요."));
      setPending(null);
      return;
    }
    const query = new URLSearchParams({ registered: "1" });
    if (requestedAcademyId) query.set("academy", requestedAcademyId);
    router.replace(localizedPath(`/dashboard/my?${query}`, locale));
  }

  return (
    <section className={styles.card} aria-labelledby="registration-title" aria-busy={busy}>
      <Link href="/dashboard/notebook" className={styles.backLink}>
        {t("추리노트로 돌아가기")}
      </Link>
      <header className={styles.heading}>
        <span className={styles.eyebrow}>{t("학생 계정")}</span>
        <h1 id="registration-title">{t("학생 정보 등록")}</h1>
        <p>{t("학원 연결을 신청하려면 이메일과 본인 휴대전화 인증을 완료하세요.")}</p>
      </header>
      <section className={styles.stage} aria-labelledby="identity-title">
        <h2 id="identity-title">{t("1. 계정 인증")}</h2>
        <div className={styles.field}>
          <label htmlFor="registration-email">{t("Google 계정 이메일")}</label>
          <input id="registration-email" type="email" value={identity.email} readOnly />
          <span className={identity.emailVerified ? styles.verified : styles.helper}>
            {t(identity.emailVerified ? "이메일 인증 완료" : "이메일 인증이 필요합니다.")}
          </span>
        </div>
        {!identity.emailVerified && (
          <div className={styles.actions}>
            <button type="button" onClick={sendEmail} disabled={busy || emailCooldown > 0}>
              {t(pending === "email" ? "이메일 보내는 중…" : "인증 이메일 보내기")}
            </button>
            {emailCooldown > 0 && (
              <span className={styles.helper}>
                {t("다시 보내기까지")} {emailCooldown}
                {t("초")}
              </span>
            )}
          </div>
        )}
        <div className={styles.phoneSection}>
          {identity.phoneNumber ? (
            <div className={styles.field}>
              <label htmlFor="registration-verified-phone">{t("본인 휴대전화")}</label>
              <input
                id="registration-verified-phone"
                type="tel"
                value={identity.phoneNumber}
                readOnly
              />
              <span className={styles.verified}>{t("휴대전화 인증 완료")}</span>
            </div>
          ) : (
            <>
              <form onSubmit={sendSms}>
                <fieldset className={styles.fields} disabled={busy}>
                  <div className={styles.phoneRow}>
                    <div className={styles.field}>
                      <label htmlFor="registration-country">{t("국가 번호")}</label>
                      <input
                        id="registration-country"
                        type="tel"
                        value={countryCode}
                        onChange={(event) => {
                          setCountryCode(event.target.value);
                          setConfirmation(null);
                        }}
                        required
                        maxLength={4}
                        autoComplete="tel-country-code"
                      />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="registration-phone">{t("본인 휴대전화")}</label>
                      <input
                        id="registration-phone"
                        type="tel"
                        inputMode="tel"
                        value={phone}
                        onChange={(event) => {
                          setPhone(event.target.value);
                          setConfirmation(null);
                        }}
                        required
                        maxLength={24}
                        placeholder="010-0000-0000"
                        autoComplete="tel-national"
                      />
                    </div>
                  </div>
                  <p className={styles.helper}>
                    {t("본인이 사용하는 휴대전화로 인증번호를 받으세요.")}
                  </p>
                  <label className={styles.consent}>
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(event) => setConsent(event.target.checked)}
                      required
                    />
                    <span>
                      {t("전화번호 인증 처리에 동의합니다.")}
                      <small>
                        {t("인증과 스팸·악용 방지를 위해 전화번호가 Google에 전송·저장됩니다.")}
                      </small>
                    </span>
                  </label>
                  <button className={styles.secondary} type="submit" disabled={smsCooldown > 0}>
                    {t(
                      pending === "sms"
                        ? "문자 보내는 중…"
                        : confirmation
                          ? "인증번호 다시 받기"
                          : "인증번호 받기",
                    )}
                  </button>
                  {smsCooldown > 0 && (
                    <p className={styles.helper}>
                      {t("다시 보내기까지")} {smsCooldown}
                      {t("초")}
                    </p>
                  )}
                </fieldset>
              </form>
              <div ref={recaptchaContainer} />
              {confirmation && (
                <form onSubmit={confirmSms} className={styles.otpForm}>
                  <fieldset className={styles.fields} disabled={busy}>
                    <div className={styles.field}>
                      <label htmlFor="registration-code">{t("문자 인증번호")}</label>
                      <input
                        id="registration-code"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        value={code}
                        onChange={(event) =>
                          setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        pattern="[0-9]{6}"
                        minLength={6}
                        maxLength={6}
                        required
                        placeholder={t("6자리 인증번호")}
                      />
                    </div>
                    <button className={styles.secondary} type="submit">
                      {t(pending === "otp" ? "인증 중…" : "휴대전화 인증하기")}
                    </button>
                  </fieldset>
                </form>
              )}
            </>
          )}
        </div>
        <button
          className={styles.textButton}
          type="button"
          onClick={refreshIdentity}
          disabled={busy}
        >
          {t(pending === "refresh" ? "인증 확인 중…" : "인증 상태 새로고침")}
        </button>
      </section>
      <section className={styles.stage} aria-labelledby="profile-title">
        <h2 id="profile-title">{t("2. 학생 정보")}</h2>
        <form onSubmit={saveProfile}>
          <fieldset className={styles.fields} disabled={busy}>
            <div className={styles.field}>
              <label htmlFor="registration-name">{t("학생 이름")}</label>
              <input
                id="registration-name"
                name="name"
                type="text"
                defaultValue={initialName}
                required
                maxLength={50}
                autoComplete="name"
              />
            </div>
            {!ready && (
              <p className={styles.helper}>
                {t("이메일과 휴대전화 인증을 마치면 저장할 수 있습니다.")}
              </p>
            )}
            <button className={styles.submit} type="submit" disabled={!ready}>
              {t(pending === "save" ? "저장 중…" : "학생 정보 저장")}
            </button>
          </fieldset>
        </form>
        <p className={styles.helper}>
          {t("학원 연결은 등록 후 신청하고, 학원의 승인을 받아 완료됩니다.")}
        </p>
      </section>
      {error && (
        <p role="alert" className={styles.error}>
          {t(error)}
        </p>
      )}
      <p role="status" className={styles.status}>
        {t(notice)}
      </p>
      <footer className={styles.footer}>
        <Link href="/privacy">{t("개인정보 처리 안내")}</Link>
      </footer>
    </section>
  );
}
