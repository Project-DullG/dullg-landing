"use client";
import { useId, useState } from "react";
import { SpeakerHighIcon, StopIcon, EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import type { AudioClip, StudyAudio } from "./use-study-audio";
import styles from "./speaking.module.css";

export function LessonBook({
  sentences,
  audio,
  clip,
  initiallyVisible,
  onReveal,
  busy = false,
}: {
  sentences: { english: string; hangul: string }[];
  audio: StudyAudio;
  clip: AudioClip;
  initiallyVisible: boolean;
  onReveal: () => void;
  busy?: boolean;
}) {
  const [visible, setVisible] = useState(initiallyVisible);
  const id = useId();
  const english = sentences.map((s) => s.english).join(" ");
  const playing = audio.playing === english;
  return (
    <div className={styles.book} data-lesson-book>
      <div className={styles.bookActions}>
        <button
          className={styles.primary}
          disabled={busy}
          aria-pressed={playing}
          onClick={() => (playing ? audio.stop() : audio.play(english, clip))}
        >
          {playing ? <StopIcon size={19} /> : <SpeakerHighIcon size={20} />}
          {playing ? "중지" : "듣기"}
        </button>
        <button
          className={styles.textButton}
          aria-pressed={visible}
          aria-controls={id}
          onClick={() => {
            if (!visible) onReveal();
            setVisible(!visible);
          }}
        >
          {visible ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
          {visible ? "한글 가리기" : "한글 보기"}
        </button>
        <span className={styles.audioSource}>
          {clip ? (clip.kind === "ai" ? "AI 제작 음성" : "성우 녹음") : "기기 음성"}
        </span>
      </div>
      <div id={id} className={styles.bookText}>
        {sentences.map((sentence, i) => (
          <div className={styles.sentence} key={`sentence-${i}`}>
            <p lang="en" className={styles.english}>
              {sentence.english}
            </p>
            {visible && sentence.hangul && (
              <p lang="ko" className={styles.hangul}>
                {sentence.hangul}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
