"use client";

import { useId, useState } from "react";
import {
  CONTENT_DESIGN_FORMATS,
  CONTENT_DESIGN_DETAIL_LABELS,
  buildContentDesignPrompt,
  type ContentDesignInput,
  type ContentDesignFormat,
} from "@/lib/content-design-input";
import styles from "./content-design-form.module.css";

const emptyInput: ContentDesignInput = {
  idea: "",
  format: "추천",
  audience: "",
  experience: "",
  material: "",
  duration: "",
  people: "",
  constraints: "",
  sources: "",
  detail1: "",
  detail2: "",
  mode: "guided",
};

const formatEnglish: Record<ContentDesignFormat, string> = {
  추천: "Not decided yet · ask AI",
  보드게임: "Board game",
  "체험형 교구": "Hands-on learning kit",
  "추리·방탈출": "Mystery or escape activity",
  "이야기·영상·만화": "Story, video or comic",
  "매거진·가이드·전시": "Magazine, guide or exhibition",
  기타: "Other",
};

const detailEnglish: Record<ContentDesignFormat, readonly [string, string]> = {
  추천: ["An approach you are interested in", "An approach you want to avoid"],
  보드게임: ["Competitive or cooperative play", "Actions you want players to take"],
  "체험형 교구": ["A question to explore", "An activity to try"],
  "추리·방탈출": ["A question to solve", "Clues and story material"],
  "이야기·영상·만화": ["What to communicate", "Scenes and atmosphere"],
  "매거진·가이드·전시": ["Topics or sections", "What readers should take away"],
  기타: ["What the user does", "The structure you have in mind"],
};

type TextKey = Exclude<keyof ContentDesignInput, "format" | "mode">;

export function ContentDesignForm({ en }: { en: boolean }) {
  const id = useId();
  const [input, setInput] = useState<ContentDesignInput>(emptyInput);
  const [copyState, setCopyState] = useState<"idle" | "done" | "error">("idle");
  const prompt = buildContentDesignPrompt(input);

  function update(key: TextKey, value: string) {
    setInput((current) => ({ ...current, [key]: value }));
    setCopyState("idle");
  }

  function field(key: TextKey, label: string, placeholder: string, rows = 1) {
    const fieldId = `${id}-${key}`;
    return (
      <div className={styles.field} key={key}>
        <label htmlFor={fieldId}>{label}</label>
        {rows > 1 ? (
          <textarea
            id={fieldId}
            name={key}
            rows={rows}
            value={input[key]}
            placeholder={placeholder}
            onChange={(event) => update(key, event.target.value)}
          />
        ) : (
          <input
            id={fieldId}
            name={key}
            value={input[key]}
            placeholder={placeholder}
            onChange={(event) => update(key, event.target.value)}
          />
        )}
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
      <p className={styles.help}>
        {en
          ? "Fill in what you know. Leave anything undecided blank so AI can suggest it."
          : "아는 것만 적어주세요. 빈칸은 AI가 먼저 제안합니다."}
      </p>
      <fieldset className={styles.group}>
        <legend>{en ? "1. Start with your idea" : "1. 아이디어부터 적어보기"}</legend>
        {field(
          "idea",
          en ? "What would you like to make?" : "어떤 콘텐츠를 만들고 싶나요?",
          en
            ? "Example: a game about choosing a trip around Ulleungdo"
            : "예: 울릉 여행 경로를 고르는 게임",
          2,
        )}
        <div className={styles.grid}>
          <div className={styles.field}>
            <label htmlFor={`${id}-format`}>
              {en ? "Content format" : "어떤 형태로 만들까요?"}
            </label>
            <select
              id={`${id}-format`}
              name="format"
              value={input.format}
              onChange={(event) => {
                setInput((current) => ({
                  ...current,
                  format: event.target.value as ContentDesignFormat,
                  detail1: "",
                  detail2: "",
                }));
                setCopyState("idle");
              }}
            >
              {CONTENT_DESIGN_FORMATS.map((format) => (
                <option key={format} value={format}>
                  {en
                    ? formatEnglish[format]
                    : format === "추천"
                      ? "아직 못 정했어요 · AI 추천받기"
                      : format}
                </option>
              ))}
            </select>
          </div>
          {field(
            "audience",
            en ? "Who would enjoy it?" : "누가 즐기면 좋을까요?",
            en ? "Example: families visiting Ulleungdo" : "예: 울릉에 처음 온 가족 관광객",
          )}
        </div>
      </fieldset>

      {input.format !== "추천" && (
        <fieldset className={styles.group}>
          <legend>
            {en ? "2. Add ideas for this format" : `2. ${input.format}에 담고 싶은 것`}
          </legend>
          <p className={styles.help}>
            {en
              ? "These are optional too. AI can propose a design from your first answers."
              : "이 칸도 선택사항입니다. 아직 정하지 않았다면 비워두세요."}
          </p>
          <div className={styles.grid}>
            {field(
              "detail1",
              en ? detailEnglish[input.format][0] : CONTENT_DESIGN_DETAIL_LABELS[input.format][0],
              en
                ? "Write an idea, or leave blank for a suggestion"
                : "생각나는 내용을 적거나 비워두세요",
              2,
            )}
            {field(
              "detail2",
              en ? detailEnglish[input.format][1] : CONTENT_DESIGN_DETAIL_LABELS[input.format][1],
              en
                ? "Write an idea, or leave blank for a suggestion"
                : "생각나는 내용을 적거나 비워두세요",
              2,
            )}
          </div>
        </fieldset>
      )}

      <details className={styles.extra}>
        <summary>
          {en
            ? "Add experience, time and reference material · optional"
            : "경험·시간·자료 더 적기 · 선택"}
        </summary>
        <div className={styles.grid}>
          {field(
            "experience",
            en ? "What should people experience?" : "어떤 경험을 하게 하고 싶나요?",
            en
              ? "Example: compare places and explain a choice"
              : "예: 장소를 비교하고 여행 선택의 이유를 설명하기",
            2,
          )}
          {field(
            "material",
            en ? "Topic, place or story material" : "어떤 주제·지역·이야기를 담을까요?",
            en ? "Example: Ulleungdo places and local stories" : "예: 울릉의 장소와 지역 이야기",
            2,
          )}
          {field(
            "duration",
            en ? "Time for one experience" : "한 번 즐기는 시간",
            en ? "Example: a 15-minute game or a 3-minute video" : "예: 게임 한 판 15분, 영상 3분",
          )}
          {field(
            "people",
            en ? "Number of users" : "함께 즐기는 인원",
            en ? "Example: 2–4 people" : "예: 2~4명, 가족 1팀",
          )}
          {field(
            "constraints",
            en ? "What to include or avoid" : "꼭 넣거나 피하고 싶은 것",
            en
              ? "Example: work together; no phone needed"
              : "예: 함께 협력하기, 스마트폰 없이 즐기기",
            3,
          )}
          {field(
            "sources",
            en ? "Sources and existing notes" : "참고자료·기존 메모",
            en
              ? "Paste a source title, address or short notes"
              : "자료 제목·주소나 기존 아이디어 메모를 붙여넣으세요",
            3,
          )}
        </div>
      </details>

      <fieldset className={styles.mode}>
        <legend>{en ? "How would you like AI to help?" : "AI와 어떻게 이어갈까요?"}</legend>
        <label>
          <input
            type="radio"
            name={`${id}-mode`}
            value="guided"
            checked={input.mode === "guided"}
            onChange={() => {
              setInput((current) => ({ ...current, mode: "guided" }));
              setCopyState("idle");
            }}
          />
          {en ? "Work through the choices together" : "대화하며 정하기"}
        </label>
        <label>
          <input
            type="radio"
            name={`${id}-mode`}
            value="draft"
            checked={input.mode === "draft"}
            onChange={() => {
              setInput((current) => ({ ...current, mode: "draft" }));
              setCopyState("idle");
            }}
          />
          {en ? "Get a complete first draft" : "초안 한 번에 받기"}
        </label>
      </fieldset>

      <div className={styles.actions}>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(prompt);
              setCopyState("done");
            } catch {
              setCopyState("error");
            }
          }}
        >
          {en ? "Copy my answers and the prompt" : "입력한 내용과 프롬프트 복사"}
        </button>
        <a
          href={`data:text/plain;charset=utf-8,${encodeURIComponent(prompt)}`}
          download="twisdom_우리팀_설계서_프롬프트.txt"
        >
          {en ? "Download with my answers (TXT) ↓" : "입력한 내용 포함해서 TXT 받기 ↓"}
        </a>
      </div>
      <p className={styles.status} role="status" aria-live="polite">
        {copyState === "done"
          ? en
            ? "Copied with your answers. Paste into your AI chat to start."
            : "입력한 내용까지 복사했습니다. AI 채팅에 붙여넣어 시작하세요."
          : copyState === "error"
            ? en
              ? "Copying failed. Download the TXT file or copy from the preview."
              : "복사하지 못했습니다. TXT를 받거나 아래 미리보기에서 복사해주세요."
            : en
              ? "Copy first, then paste into your AI chat. The generated prompt is in Korean."
              : "복사한 뒤 사용하는 AI의 새 대화창에 붙여넣으세요."}
      </p>
      {!en && (
        <details className={styles.preview}>
          <summary>입력한 프롬프트 미리 보기</summary>
          <textarea aria-label="입력한 내용이 포함된 프롬프트" rows={12} readOnly value={prompt} />
        </details>
      )}
    </form>
  );
}
