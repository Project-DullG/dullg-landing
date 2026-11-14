"use client";

import { useState } from "react";
import { Check, Copy, EnvelopeSimple } from "@phosphor-icons/react";
import { useText } from "@/lib/i18n/use-text";
import { BRAND } from "@/lib/site-config";

const drafts = [
  {
    label: "수업·교육 문의 메일 쓰기",
    subject: "교육 문의",
    lines: ["기관명:", "대상(학년)과 인원:", "원하는 주제:", "희망 일정:", "그 밖에 궁금한 점:"],
  },
  {
    label: "작품·제작 문의 메일 쓰기",
    subject: "작품 제작 문의",
    lines: ["이름 또는 기관명:", "필요한 결과물:", "희망 일정:", "그 밖에 궁금한 점:"],
  },
] as const;

/** Opens a mail draft with the fields the studio needs, or copies the address. */
export function ContactActions() {
  const t = useText();
  const [copied, setCopied] = useState(false);
  const mailto = (subject: string, lines: readonly string[]) =>
    `mailto:${BRAND.email}?subject=${encodeURIComponent(t(subject))}&body=${encodeURIComponent(
      lines.map((line) => t(line)).join("\n") + "\n",
    )}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(BRAND.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="contact-actions">
      {drafts.map((draft, index) => (
        <a
          key={draft.subject}
          className={`button ${index === 0 ? "button-dark" : "button-outline"}`}
          href={mailto(draft.subject, draft.lines)}
        >
          <EnvelopeSimple size={17} aria-hidden="true" />
          {t(draft.label)}
        </a>
      ))}
      <button type="button" className="contact-copy" onClick={copy} aria-live="polite">
        {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
        {t(copied ? "주소를 복사했어요" : "이메일 주소 복사")}
      </button>
    </div>
  );
}
