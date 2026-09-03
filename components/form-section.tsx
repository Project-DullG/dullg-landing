"use client";

import { ArrowUpRight, CheckCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { useState, useRef } from "react";
import { BRAND, emailHref } from "@/lib/site-config";

type State = "idle" | "submitting" | "success" | "error";
type ErrorField = "academy" | "contact" | "interest" | "consent" | null;

const SUBMIT_URL = `https://formsubmit.co/ajax/${BRAND.email}`;

export function FormSection() {
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [errorField, setErrorField] = useState<ErrorField>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function showFieldError(field: Exclude<ErrorField, null>, message: string) {
    setErrorMsg(message);
    setErrorField(field);
    setState("error");
    requestAnimationFrame(() => {
      const control = formRef.current?.elements.namedItem(field);
      if (control instanceof HTMLElement) control.focus();
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");
    setErrorField(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    if (data.get("_honey")) {
      setState("success");
      return;
    }

    // 클라이언트 유효성 검사
    const requiredFields: [string, string][] = [
      ["academy", "기관명을 입력해주세요."],
      ["contact", "연락처 또는 이메일을 입력해주세요."],
      ["interest", "관심 유형을 선택해주세요."],
    ];
    for (const [field, message] of requiredFields) {
      if (!data.get(field)) {
        showFieldError(field as Exclude<ErrorField, "consent" | null>, message);
        return;
      }
    }
    const contact = String(data.get("contact")).trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    const phoneDigits = contact.replace(/\D/g, "");
    const isPhone = phoneDigits.length >= 9 && phoneDigits.length <= 11;
    if (!isEmail && !isPhone) {
      showFieldError("contact", "연락 가능한 휴대전화 번호 또는 이메일 주소를 확인해주세요.");
      return;
    }
    if (!data.get("consent")) {
      showFieldError("consent", "개인정보 수집·이용에 동의해주세요.");
      return;
    }

    setState("submitting");

    try {
      const res = await fetch(SUBMIT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          기관명: data.get("academy"),
          연락처: data.get("contact"),
          관심유형: data.get("interest"),
          _subject: `[단서공방] 검토팩 요청 - ${data.get("academy")}`,
          _template: "box",
          _captcha: "false",
        }),
      });

      if (!res.ok) throw new Error("서버 오류");
      setState("success");
    } catch {
      setState("error");
      setErrorField(null);
      setErrorMsg(`일시적인 오류가 발생했습니다. ${BRAND.email}으로 직접 문의해주세요.`);
    }
  }

  if (state === "success") {
    return (
      <div className="apply-form form-success" role="status" aria-live="polite">
        <div className="form-success-icon" aria-hidden="true">
          <CheckCircle size={42} weight="fill" />
        </div>
        <h3>요청이 접수되었습니다</h3>
        <p>영업일 1~2일 내 입력하신 연락처로 샘플 자료를 보내드립니다.</p>
        <p className="form-success-contact">
          추가 문의: <a href={emailHref}>{BRAND.email}</a>
        </p>
        <button type="button" className="button button-light" onClick={() => setState("idle")}>
          다른 요청 보내기
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      className="apply-form"
      onSubmit={handleSubmit}
      noValidate
      aria-label="무료 검토팩 요청 양식"
    >
      <input
        type="text"
        name="_honey"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: -9999, opacity: 0 }}
      />
      <h3>무료 검토팩 요청</h3>
      <p className="apply-form-intro">
        구매나 파일럿 참여 의무가 없습니다. 영업일 기준 1~2일 내 입력하신 연락처로 안내드립니다.
      </p>

      <label htmlFor="af-academy">
        기관명{" "}
        <span className="field-required" aria-label="필수">
          *
        </span>
        <input
          id="af-academy"
          name="academy"
          type="text"
          placeholder="학원 또는 공부방 이름"
          autoComplete="organization"
          required
          aria-invalid={errorField === "academy"}
          aria-describedby={errorField === "academy" ? "apply-form-error" : undefined}
          disabled={state === "submitting"}
        />
      </label>

      <label htmlFor="af-contact">
        연락처 또는 이메일{" "}
        <span className="field-required" aria-label="필수">
          *
        </span>
        <input
          id="af-contact"
          name="contact"
          type="text"
          placeholder="휴대전화 또는 이메일 주소"
          autoComplete="on"
          required
          aria-invalid={errorField === "contact"}
          aria-describedby={errorField === "contact" ? "apply-form-error" : undefined}
          disabled={state === "submitting"}
        />
      </label>

      <label htmlFor="af-interest">
        관심 유형{" "}
        <span className="field-required" aria-label="필수">
          *
        </span>
        <select
          id="af-interest"
          name="interest"
          defaultValue=""
          required
          aria-invalid={errorField === "interest"}
          aria-describedby={errorField === "interest" ? "apply-form-error" : undefined}
          disabled={state === "submitting"}
        >
          <option value="" disabled>
            선택해주세요
          </option>
          <option value="무료 검토팩 요청">무료 검토팩 요청</option>
          <option value="파일럿 운영 문의">파일럿 운영 문의</option>
          <option value="일반 문의">일반 문의</option>
        </select>
      </label>

      {state === "error" && errorMsg && (
        <p id="apply-form-error" className="form-error" role="alert">
          {errorMsg}
        </p>
      )}

      <label className="consent" htmlFor="af-consent">
        <input
          type="checkbox"
          id="af-consent"
          name="consent"
          required
          aria-invalid={errorField === "consent"}
          aria-describedby={errorField === "consent" ? "apply-form-error" : undefined}
          disabled={state === "submitting"}
        />
        <span>
          검토팩 발송 및 파일럿 준비 안내를 위한 개인정보(기관명·연락처) 수집·이용에 동의합니다.{" "}
          <Link href="/privacy">개인정보 처리 안내</Link>
        </span>
      </label>

      <button
        className="button button-dark"
        type="submit"
        disabled={state === "submitting"}
        aria-busy={state === "submitting"}
      >
        {state === "submitting" ? (
          <>
            <span className="btn-spinner" aria-hidden="true" />
            전송 중...
          </>
        ) : (
          <>
            무료 검토팩 요청
            <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
          </>
        )}
      </button>

      <small>
        영업일 1~2일 내 답변 · 직접 문의: <a href={emailHref}>{BRAND.email}</a>
      </small>
    </form>
  );
}
