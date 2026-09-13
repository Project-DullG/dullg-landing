"use client";
import { Button } from "./ui";
import { ArrowLeft, ChevronRight, BookOpen } from "lucide-react";
import { Text } from "./puzzles";
export function NovelReader({
  title,
  speaker,
  text,
  kind,
  page,
  total,
  onPrevious,
  onNext,
  onLog,
  nextLabel,
  portrait,
  speakerRole,
}: {
  title: string;
  speaker: string;
  text: string;
  kind: "narration" | "dialogue" | "note";
  page: number;
  total: number;
  onPrevious?: () => void;
  onNext: () => void;
  onLog: () => void;
  nextLabel: string;
  portrait?: string | null;
  speakerRole?: string;
}) {
  return (
    <section className={`vn-reader vn-${kind}`} aria-label="대사와 장면">
      <div className="vn-heading">
        {speaker ? (
          <div className="vn-speaker">
            {portrait && (
              <img className="vn-speaker-portrait" src={portrait} alt="" decoding="async" />
            )}
            <div>
              <strong>{speaker}</strong>
              {speakerRole && <span className="vn-speaker-role">{speakerRole}</span>}
            </div>
          </div>
        ) : (
          <span className="vn-narrator-label">현장</span>
        )}
        <small>{title}</small>
      </div>
      <div key={text} className="vn-text" aria-live="polite" aria-atomic="true">
        {passageRuns(text, kind).map((run, index) =>
          run.speech ? (
            <blockquote className="vn-spoken" key={index}>
              <Text text={run.text} />
            </blockquote>
          ) : (
            <div className="vn-narrated" key={index}>
              <Text text={run.text} />
            </div>
          ),
        )}
      </div>
      <nav className="vn-controls" aria-label="대사 넘기기">
        <Button disabled={!onPrevious} onClick={onPrevious}>
          <ArrowLeft />앞 내용
        </Button>
        <Button onClick={onLog}>
          <BookOpen />
          지난 대화
        </Button>
        <small className="vn-page">
          {page + 1} / {total}
        </small>
        <Button
          className="tide-primary vn-next"
          onClick={onNext}
          onKeyDown={(event) => {
            if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
            if (event.key === "ArrowRight") {
              event.preventDefault();
              onNext();
            }
            if (event.key === "ArrowLeft" && onPrevious) {
              event.preventDefault();
              onPrevious();
            }
          }}
        >
          {nextLabel}
          <ChevronRight />
        </Button>
      </nav>
    </section>
  );
}

/** Retain the authored text, including quotation marks and whitespace. */
export function passageRuns(text: string, kind: "narration" | "dialogue" | "note") {
  if (kind === "dialogue") return [{ text, speech: true }];
  return text
    .split(/(“[^”]+”)/g)
    .filter(Boolean)
    .map((part) => ({ text: part, speech: part.startsWith("“") && part.endsWith("”") }));
}
