"use client";
import { useState } from "react";

export function CopyResource({ href, en }: { href: string; en: boolean }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  return <div>
    <button type="button" disabled={state === "loading"} onClick={async () => {
      setState("loading");
      try {
        const response = await fetch(href);
        if (!response.ok) throw new Error("Download failed");
        await navigator.clipboard.writeText(await response.text());
        setState("done");
      } catch { setState("error"); }
    }}>{en ? "Copy full prompt" : "통합 프롬프트 전체 복사"}</button>
    <p role="status" aria-live="polite">{state === "done" ? (en ? "Copied. Paste it into your AI chat." : "복사했습니다. 사용하는 AI 대화창에 붙여넣으세요.") : state === "error" ? (en ? "Copying failed. Download the file and copy its contents." : "복사하지 못했습니다. 파일을 내려받아 내용을 복사해주세요.") : state === "loading" ? (en ? "Loading…" : "불러오는 중…") : ""}</p>
  </div>;
}
