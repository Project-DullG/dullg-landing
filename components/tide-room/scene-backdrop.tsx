"use client";
/* oxlint-disable next/no-img-element -- Local scene assets use responsive picture sources. */
import { useCallback, useState } from "react";
import { Button } from "./ui";
import { RotateCcw } from "lucide-react";
import { watchSceneImage, type SceneImageStatus } from "./image-load";
import { roomSmallImage } from "./scene-assets";
export function SceneBackdrop({
  src,
  onStatus,
}: {
  src: string;
  onStatus: (status: SceneImageStatus) => void;
}) {
  const [status, setStatus] = useState<SceneImageStatus>("loading");
  const [attempt, setAttempt] = useState(0);
  const attach = useCallback(
    (node: HTMLImageElement | null) => {
      if (!node) return;
      return watchSceneImage(node, (next) => {
        setStatus(next);
        onStatus(next);
      });
    },
    [onStatus],
  );
  const url = (path: string) => (attempt ? `${path}?retry=${attempt}` : path);
  return (
    <>
      <picture>
        <source media="(max-width: 720px)" srcSet={url(roomSmallImage(src))} />
        <img
          key={`${src}:${attempt}`}
          ref={attach}
          onLoad={(event) => {
            const next = event.currentTarget.naturalWidth > 0 ? "ready" : "error";
            setStatus(next);
            onStatus(next);
          }}
          onError={() => {
            setStatus("error");
            onStatus("error");
          }}
          className={`room-backdrop ${status === "ready" ? "scene-ready" : ""}`}
          src={url(src)}
          alt=""
          width={1672}
          height={941}
          fetchPriority="high"
          decoding="async"
        />
      </picture>
      {status !== "ready" && (
        <output className="room-load-note">
          <span>
            {status === "loading"
              ? "배경 이미지 불러오는 중…"
              : status === "slow"
                ? "배경 표시가 늦어지고 있다. 아래 ‘조사할 곳’에서 조사를 계속할 수 있다."
                : "배경 이미지를 불러오지 못했다. 아래 ‘조사할 곳’에서 조사할 수 있다."}
          </span>
          {(status === "slow" || status === "error") && (
            <Button
              onClick={() => {
                setStatus("loading");
                onStatus("loading");
                setAttempt((n) => n + 1);
              }}
            >
              <RotateCcw />
              그림 다시 불러오기
            </Button>
          )}
        </output>
      )}
    </>
  );
}
