"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { CertificatePaper, type CertificateRecord } from "./certificate-paper";
import styles from "./certificate.module.css";

export type { CertificateRecord } from "./certificate-paper";

const copy = {
  ko: {
    back: "← 수강생 자료실",
    title: "교육 참여 수료증",
    lead: "울릉도·독도 지역 콘텐츠 제작 교육에 참여한 학생을 위한 수료증입니다.",
    steps: ["인증번호 확인", "이름 확인", "저장·인쇄"],
    locked: "인증번호 확인",
    accessTitle: "안내받은 번호를 입력하세요",
    accessBody: "교육 담당자에게 받은 인증번호를 입력하면 이름을 작성할 수 있습니다.",
    code: "인증번호",
    codeHint: "교육 담당자가 안내한 숫자 4자리를 입력하세요.",
    verify: "인증번호 확인",
    verifying: "인증 확인 중…",
    authorized: "인증 완료",
    nameTitle: "이름을 확인해 주세요",
    nameBody: "수료증에 표시할 학생 이름을 입력하세요.",
    name: "학생 이름",
    nameHint: "이름은 수료증에 그대로 표시됩니다. 최대 40자까지 입력할 수 있습니다.",
    confirm: "해당 교육에 참여했으며, 입력한 이름이 정확합니다.",
    issue: "수료증 준비하기 →",
    issuing: "수료증 준비 중…",
    logout: "인증 종료",
    loggingOut: "인증 종료 중…",
    privacy:
      "입력한 이름은 서버에 저장하지 않습니다. 공용 기기에서는 발급 후 인증을 종료해 주세요.",
    preview: "수료증 미리보기",
    size: "A4 가로 · 한국어",
    print: "PDF 저장·인쇄",
    printing: "인쇄 준비 중…",
    enlarge: "크게 보기",
    close: "닫기",
    previewHint: "이름을 확인한 뒤 저장해 주세요. PDF 저장은 인쇄창에서 선택할 수 있습니다.",
    sourceNote:
      "서명과 교육활동용 인장은 자동으로 반영됩니다. 학생 이름을 확인한 뒤 저장·출력해 주세요.",
    ready: "수료증이 준비되었습니다. 이름을 확인한 뒤 저장하거나 인쇄하세요.",
    changed: "이름 또는 참여 확인이 변경되었습니다. 수료증을 다시 준비해 주세요.",
    codeRequired: "인증번호 숫자 4자리를 입력해 주세요.",
    nameRequired: "학생 이름을 입력해 주세요.",
    consentRequired: "교육 참여 여부와 이름을 확인해 주세요.",
    network: "요청을 완료하지 못했습니다. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.",
    expired: "인증이 만료되었습니다. 인증번호를 다시 입력해 주세요.",
    printFailure: "인쇄에 필요한 자료를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    invalidRecord: "수료증 정보를 확인하지 못했습니다. 수료증을 다시 준비해 주세요.",
    printFirst: "수료증을 준비한 뒤 PDF 저장·인쇄 버튼을 눌러 주세요.",
    logoutFailure:
      "인증을 종료하지 못했습니다. 다시 시도해 주세요. 공용 기기에서는 완료 전까지 자리를 비우지 마세요.",
  },
  en: {
    back: "← Course resources",
    title: "Certificate of participation",
    lead: "For students who participated in the Ulleungdo and Dokdo local content creation program.",
    steps: ["Verify access code", "Check your name", "Save or print"],
    locked: "Access verification",
    accessTitle: "Enter the code you received",
    accessBody: "Enter the access code from your course coordinator to add the student's name.",
    code: "Access code",
    codeHint: "Enter the four-digit code provided by your course coordinator.",
    verify: "Verify access code",
    verifying: "Verifying…",
    authorized: "Access verified",
    nameTitle: "Check the student's name",
    nameBody: "Enter the name to be printed on the certificate.",
    name: "Student name",
    nameHint: "The name appears exactly as entered. Maximum 40 characters.",
    confirm: "I participated in this course, and the name entered is correct.",
    issue: "Prepare certificate →",
    issuing: "Preparing certificate…",
    logout: "End access",
    loggingOut: "Ending access…",
    privacy:
      "The name you enter is not stored on the server. End access after printing on a shared device.",
    preview: "Certificate preview",
    size: "A4 landscape · Korean",
    print: "Save PDF or print",
    printing: "Preparing to print…",
    enlarge: "View larger",
    close: "Close",
    previewHint: "Check the name before saving. Select Save as PDF in the print dialog.",
    sourceNote:
      "The signatures and educational-activity seal are included automatically. Check the student's name before saving or printing.",
    ready: "Your certificate is ready. Check the name, then save or print it.",
    changed: "The name or participation confirmation changed. Prepare the certificate again.",
    codeRequired: "Enter the four-digit access code.",
    nameRequired: "Enter the student's name.",
    consentRequired: "Confirm participation and check the student's name.",
    network: "The request could not be completed. Check your internet connection and try again.",
    expired: "Your access has expired. Enter the access code again.",
    printFailure: "The print assets could not be loaded. Please try again shortly.",
    invalidRecord:
      "The certificate information could not be verified. Prepare the certificate again.",
    printFirst: "Prepare a certificate, then select Save PDF or print.",
    logoutFailure: "Access could not be ended. Try again before leaving a shared device.",
  },
};

const englishErrors: Record<string, string> = {
  "인증번호가 일치하지 않습니다.": "The access code is incorrect.",
  "인증번호를 확인해 주세요.": "Check the access code.",
  "인증번호를 다시 입력해 주세요.": "Enter the access code again.",
  "인증을 여러 번 실패했습니다. 15분 뒤 다시 시도해 주세요.":
    "Too many unsuccessful attempts. Try again in 15 minutes.",
  "같은 사이트에서 다시 요청해 주세요.": "Reload this page and try again on this site.",
  "이름과 교육 참여 확인을 입력해 주세요.": "Enter the student's name and confirm participation.",
  "이름은 한글·영문·한자와 공백, 작은따옴표, 하이픈, 가운뎃점으로 40자 이내로 입력해 주세요.":
    "Use up to 40 Korean, English, or Han characters, spaces, apostrophes, hyphens, or middle dots.",
  "인증을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.":
    "Access could not be verified. Please try again shortly.",
  "수료증 발급 설정을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.":
    "Certificate issuance is temporarily unavailable. Please try again shortly.",
  "수료증을 준비하지 못했습니다. 잠시 후 다시 시도해 주세요.":
    "The certificate could not be prepared. Please try again shortly.",
};

function validCertificate(value: unknown): value is CertificateRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.name === "string" &&
    [...record.name].length > 0 &&
    [...record.name].length <= 40 &&
    typeof record.issuedAt === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(record.issuedAt) &&
    typeof record.reference === "string" &&
    /^TW-\d{8}-[A-F0-9]{16}$/.test(record.reference)
  );
}

function ScaledPaper({ certificate }: { certificate: CertificateRecord | null }) {
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const scale = Math.min(width / 1120, 1);
  return (
    <div ref={container} className={styles.scaledContainer}>
      <div className={styles.scaledFrame} style={width ? { height: 792 * scale } : undefined}>
        <div
          className={styles.scaledPaper}
          style={{ transform: `scale(${scale})`, visibility: width ? "visible" : "hidden" }}
        >
          <CertificatePaper certificate={certificate} preview />
        </div>
      </div>
    </div>
  );
}

type Pending = "access" | "issue" | "logout" | "print" | null;

export function CertificateClient({
  authorized,
  locale,
}: {
  authorized: boolean;
  locale: "ko" | "en";
}) {
  const t = copy[locale];
  const [hasAccess, setHasAccess] = useState(authorized);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [certificate, setCertificate] = useState<CertificateRecord | null>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const activeRequest = useRef<AbortController | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const accessWasAuthorized = useRef(authorized);

  useEffect(
    () => () => {
      activeRequest.current?.abort();
    },
    [],
  );
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);
  useEffect(() => {
    if (hasAccess && !accessWasAuthorized.current) nameRef.current?.focus();
    accessWasAuthorized.current = hasAccess;
  }, [hasAccess]);
  useEffect(() => {
    if (!dialogOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [dialogOpen]);
  useEffect(() => {
    const closeForPrint = () => dialogRef.current?.close();
    window.addEventListener("beforeprint", closeForPrint);
    return () => window.removeEventListener("beforeprint", closeForPrint);
  }, []);

  function startRequest(operation: Exclude<Pending, null>) {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setPending(operation);
    setError("");
    setNotice("");
    return controller;
  }

  async function request(path: string, controller: AbortController, init?: RequestInit) {
    const timeout = window.setTimeout(() => controller.abort(new Error("Request timeout")), 20000);
    try {
      const response = await fetch(path, {
        ...init,
        signal: controller.signal,
        cache: "no-store",
        credentials: "same-origin",
      });
      const body = (await response.json()) as Record<string, unknown>;
      return { response, body };
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function isActive(controller: AbortController) {
    return activeRequest.current === controller;
  }
  function finish(controller: AbortController) {
    if (isActive(controller)) {
      setPending(null);
      activeRequest.current = null;
    }
  }
  function failRequest(controller: AbortController, fallback = t.network) {
    if (isActive(controller)) setError(fallback);
  }
  function serverError(body: Record<string, unknown>, fallback = t.network) {
    if (typeof body.error !== "string") return fallback;
    return locale === "en" ? (englishErrors[body.error] ?? fallback) : body.error;
  }
  function clearPersonalData() {
    setCode("");
    setName("");
    setConfirmed(false);
    setCertificate(null);
    setNotice("");
    dialogRef.current?.close();
  }
  function expireAccess() {
    clearPersonalData();
    setHasAccess(false);
    setError(t.expired);
  }
  function invalidate() {
    if (certificate) setNotice(t.changed);
    setCertificate(null);
    setError("");
  }

  async function verifyAccess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\d{4}$/.test(code)) {
      setError(t.codeRequired);
      return;
    }
    const controller = startRequest("access");
    try {
      const { response, body } = await request("/api/certificates/access", controller, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!isActive(controller)) return;
      if (!response.ok || body.ok !== true) {
        setError(serverError(body));
        return;
      }
      setCode("");
      setHasAccess(true);
    } catch {
      failRequest(controller);
    } finally {
      finish(controller);
    }
  }

  async function issueCertificate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError(t.nameRequired);
      return;
    }
    if (!confirmed) {
      setError(t.consentRequired);
      return;
    }
    const controller = startRequest("issue");
    setCertificate(null);
    try {
      const { response, body } = await request("/api/certificates/issue", controller, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, confirmed: true }),
      });
      if (!isActive(controller)) return;
      if (response.status === 401) {
        expireAccess();
        return;
      }
      if (!response.ok || body.ok !== true) {
        setError(serverError(body));
        return;
      }
      if (!validCertificate(body.certificate)) {
        setError(t.invalidRecord);
        return;
      }
      setCertificate(body.certificate);
      setName(body.certificate.name);
      setNotice(t.ready);
    } catch {
      failRequest(controller);
    } finally {
      finish(controller);
    }
  }

  async function logout() {
    const controller = startRequest("logout");
    clearPersonalData();
    try {
      const { response, body } = await request("/api/certificates/access", controller, {
        method: "DELETE",
      });
      if (!isActive(controller)) return;
      if (!response.ok || body.ok !== true) {
        setError(t.logoutFailure);
        return;
      }
      setHasAccess(false);
      requestAnimationFrame(() => codeRef.current?.focus());
    } catch {
      failRequest(controller, t.logoutFailure);
    } finally {
      finish(controller);
    }
  }

  async function printCertificate() {
    if (!certificate || !hasAccess) return;
    const controller = startRequest("print");
    try {
      const { response, body } = await request("/api/certificates/access", controller);
      if (!isActive(controller)) return;
      if (!response.ok) {
        setError(serverError(body));
        return;
      }
      if (body.authorized !== true) {
        expireAccess();
        return;
      }
      dialogRef.current?.close();
      await document.fonts.ready;
      await Promise.all(
        Array.from(printRef.current?.querySelectorAll("img") ?? []).map((image) => image.decode()),
      );
      if (!isActive(controller) || controller.signal.aborted) return;
      const previousTitle = document.title;
      document.title = "교육 참여 수료증";
      try {
        window.print();
      } finally {
        document.title = previousTitle;
      }
    } catch {
      failRequest(controller, t.printFailure);
    } finally {
      finish(controller);
    }
  }

  return (
    <>
      <section className={`shell ${styles.screen}`} aria-labelledby="certificate-page-title">
        <Link className={styles.back} href={locale === "en" ? "/en/materials" : "/materials"}>
          {t.back}
        </Link>
        <h1 id="certificate-page-title">{t.title}</h1>
        <p className={styles.lead}>{t.lead}</p>
        <ol
          className={styles.steps}
          aria-label={locale === "en" ? "Certificate steps" : "수료증 발급 순서"}
        >
          {t.steps.map((step, index) => (
            <li
              key={step}
              aria-current={index === (certificate ? 2 : hasAccess ? 1 : 0) ? "step" : undefined}
            >
              <span>0{index + 1}</span> {step}
            </li>
          ))}
        </ol>
        <div className={styles.grid}>
          <section className={styles.formPanel} aria-labelledby="certificate-form-title">
            <p className={styles.status}>{hasAccess ? t.authorized : t.locked}</p>
            <h2 id="certificate-form-title">{hasAccess ? t.nameTitle : t.accessTitle}</h2>
            <p className={styles.formIntro}>{hasAccess ? t.nameBody : t.accessBody}</p>
            {!hasAccess ? (
              <form onSubmit={verifyAccess} noValidate aria-busy={pending === "access"}>
                <label className={styles.label} htmlFor="certificate-code">
                  {t.code}
                </label>
                <input
                  ref={codeRef}
                  id="certificate-code"
                  className={styles.input}
                  type="password"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={32}
                  pattern="[0-9]{4}"
                  value={code}
                  onChange={(event) => {
                    setCode(event.target.value);
                    setError("");
                  }}
                  required
                  disabled={Boolean(pending)}
                  aria-describedby="certificate-code-hint"
                />
                <p id="certificate-code-hint" className={styles.helper}>
                  {t.codeHint}
                </p>
                <button className={styles.primary} type="submit" disabled={Boolean(pending)}>
                  {pending === "access" ? t.verifying : t.verify}
                </button>
              </form>
            ) : (
              <>
                <form onSubmit={issueCertificate} noValidate aria-busy={pending === "issue"}>
                  <label className={styles.label} htmlFor="certificate-name">
                    {t.name}
                  </label>
                  <input
                    ref={nameRef}
                    id="certificate-name"
                    className={styles.input}
                    type="text"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    maxLength={40}
                    value={name}
                    onChange={(event) => {
                      invalidate();
                      setName(event.target.value);
                    }}
                    required
                    disabled={Boolean(pending)}
                    aria-describedby="certificate-name-hint"
                  />
                  <p id="certificate-name-hint" className={styles.helper}>
                    {t.nameHint}
                  </p>
                  <label className={styles.confirm}>
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(event) => {
                        invalidate();
                        setConfirmed(event.target.checked);
                      }}
                      required
                      disabled={Boolean(pending)}
                    />
                    <span>{t.confirm}</span>
                  </label>
                  <button className={styles.primary} type="submit" disabled={Boolean(pending)}>
                    {pending === "issue" ? t.issuing : t.issue}
                  </button>
                </form>
                <button
                  className={styles.subtle}
                  type="button"
                  onClick={logout}
                  disabled={pending === "logout"}
                >
                  {pending === "logout" ? t.loggingOut : t.logout}
                </button>
                <p className={styles.privacy}>{t.privacy}</p>
              </>
            )}
            {error && (
              <p ref={errorRef} className={styles.error} role="alert" tabIndex={-1}>
                {error}
              </p>
            )}
            <p className={styles.notice} role="status" aria-live="polite">
              {notice}
            </p>
          </section>
          <section className={styles.previewSection} aria-labelledby="certificate-preview-title">
            <div className={styles.previewHeading}>
              <h2 id="certificate-preview-title">{t.preview}</h2>
              <span>{t.size}</span>
            </div>
            <div className={styles.preview}>
              <ScaledPaper certificate={certificate} />
            </div>
            <div className={styles.actions}>
              <button
                className={styles.download}
                type="button"
                onClick={printCertificate}
                disabled={!certificate || !hasAccess || Boolean(pending)}
              >
                {pending === "print" ? t.printing : t.print}
              </button>
              <button
                className={styles.secondary}
                type="button"
                onClick={() => {
                  dialogRef.current?.showModal();
                  setDialogOpen(true);
                }}
              >
                {t.enlarge}
              </button>
            </div>
            <p className={styles.note}>{t.previewHint}</p>
            <p className={styles.note}>{t.sourceNote}</p>
          </section>
        </div>
      </section>
      <dialog
        ref={dialogRef}
        className={styles.dialog}
        onClose={() => setDialogOpen(false)}
        aria-labelledby="certificate-dialog-title"
      >
        <div className={styles.dialogHeading}>
          <h2 id="certificate-dialog-title">{t.preview}</h2>
          <button
            className={styles.secondary}
            type="button"
            onClick={() => dialogRef.current?.close()}
          >
            {t.close} <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className={styles.dialogContent}>
          <CertificatePaper certificate={certificate} preview />
        </div>
      </dialog>
      <div ref={printRef} className={styles.printRoot}>
        {certificate && hasAccess ? (
          <CertificatePaper certificate={certificate} />
        ) : (
          <p className={styles.printMessage}>{t.printFirst}</p>
        )}
      </div>
    </>
  );
}
