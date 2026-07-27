"use client";

import { ArrowUpRight, CheckCircle } from "@phosphor-icons/react";
import { useState, useRef } from "react";

type State = "idle" | "submitting" | "success" | "error";
type ErrorField = "academy" | "name" | "contact" | "interest" | "consent" | null;

// TODO: 실제 폼 백엔드 연결 방법 (아래 중 하나 선택)
// Option 1: formsubmit.co (무료, 첫 제출 시 이메일 인증 필요)
//   SUBMIT_URL = "https://formsubmit.co/ajax/hello@dullg.com"
// Option 2: Next.js API 라우트
//   app/api/apply/route.ts 생성 후 → SUBMIT_URL = "/api/apply"
// Option 3: Formspree, EmailJS 등 SaaS 폼 서비스
const SUBMIT_URL = "https://formsubmit.co/ajax/hello@dullg.com";

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

    // 클라이언트 유효성 검사
    const requiredFields: [string, string][] = [
      ["academy", "기관명을 입력해주세요."],
      ["name", "담당자 이름을 입력해주세요."],
      ["contact", "연락처 또는 이메일을 입력해주세요."],
      ["interest", "관심 유형을 선택해주세요."],
    ];
    for (const [field, message] of requiredFields) {
      if (!data.get(field)) {
        showFieldError(
          field as Exclude<ErrorField, "consent" | null>,
          message,
        );
        return;
      }
    }
    const contact = String(data.get("contact")).trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    const phoneDigits = contact.replace(/\D/g, "");
    const isPhone = phoneDigits.length >= 9 && phoneDigits.length <= 11;
    if (!isEmail && !isPhone) {
      showFieldError(
        "contact",
        "연락 가능한 휴대전화 번호 또는 이메일 주소를 확인해주세요.",
      );
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
          담당자: data.get("name"),
          연락처: data.get("contact"),
          학생수: data.get("students") || "미정",
          관심유형: data.get("interest"),
          추가내용: data.get("message") || "없음",
          _subject: `[DullG] 샘플 요청 - ${data.get("academy")}`,
          _template: "box",
          _captcha: "false",
        }),
      });

      if (!res.ok) throw new Error("서버 오류");
      setState("success");
    } catch {
      setState("error");
      setErrorField(null);
      setErrorMsg(
        "일시적인 오류가 발생했습니다. hello@dullg.com으로 직접 문의해주세요."
      );
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
          추가 문의:{" "}
          <a href="mailto:hello@dullg.com">hello@dullg.com</a>
        </p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      className="apply-form"
      onSubmit={handleSubmit}
      noValidate
      aria-label="무료 샘플 요청 양식"
    >
      <h3>무료 샘플 요청</h3>

      <label htmlFor="af-academy">
        기관명 <span className="field-required" aria-label="필수">*</span>
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

      <label htmlFor="af-name">
        담당자 이름 <span className="field-required" aria-label="필수">*</span>
        <input
          id="af-name"
          name="name"
          type="text"
          placeholder="원장님 또는 선생님 이름"
          autoComplete="name"
          required
          aria-invalid={errorField === "name"}
          aria-describedby={errorField === "name" ? "apply-form-error" : undefined}
          disabled={state === "submitting"}
        />
      </label>

      <label htmlFor="af-contact">
        연락처 또는 이메일 <span className="field-required" aria-label="필수">*</span>
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

      <div className="form-split">
        <label htmlFor="af-students">
          예상 학생 수 <small>선택</small>
          <select id="af-students" name="students" defaultValue="" disabled={state === "submitting"}>
            <option value="">미정</option>
            <option value="4~8명">4~8명</option>
            <option value="9~16명">9~16명</option>
            <option value="17명 이상">17명 이상</option>
          </select>
        </label>

        <label htmlFor="af-interest">
          관심 유형 <span className="field-required" aria-label="필수">*</span>
          <select
            id="af-interest"
            name="interest"
            defaultValue=""
            required
            aria-invalid={errorField === "interest"}
            aria-describedby={errorField === "interest" ? "apply-form-error" : undefined}
            disabled={state === "submitting"}
          >
            <option value="" disabled>선택해주세요</option>
            <option value="무료 샘플 요청">무료 샘플 요청</option>
            <option value="파일럿 수업 문의">파일럿 수업 문의</option>
            <option value="운영 조건 문의">운영 조건 문의</option>
            <option value="기타 문의">기타 문의</option>
          </select>
        </label>
      </div>

      <label htmlFor="af-message">
        전달하고 싶은 내용 <small>선택</small>
        <textarea
          id="af-message"
          name="message"
          placeholder="운영 일정, 학원 규모, 궁금한 점 등을 자유롭게 남겨주세요."
          rows={3}
          disabled={state === "submitting"}
        />
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
          자료 발송 및 파일럿 안내를 위한 개인정보(이름·연락처) 수집·이용에
          동의합니다.{" "}
          <a href="/privacy">
            개인정보 처리 안내
          </a>
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
            무료 샘플 요청하기
            <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
          </>
        )}
      </button>

      <small>
        영업일 1~2일 내 답변 · 직접 문의:{" "}
        <a href="mailto:hello@dullg.com">hello@dullg.com</a>
      </small>
    </form>
  );
}
