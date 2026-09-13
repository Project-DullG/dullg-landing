"use client";
/* oxlint-disable next/no-img-element -- Local authored evidence illustrations. */
import { useState } from "react";
import { Button } from "./ui";
import { ZoomIn, ZoomOut, ArrowLeft, ArrowRight } from "lucide-react";
import { clueById } from "./content";
import { detailImages } from "./presentation";
import { Text } from "./puzzles";
export function EvidenceView({
  id,
  compare = false,
  compareIds,
}: {
  id: string;
  compare?: boolean;
  compareIds?: string[];
}) {
  const ids = compare ? compareIds || ["rope", "salt"] : [id];
  const [zoom, setZoom] = useState(1),
    [position, setPosition] = useState(50),
    [failed, setFailed] = useState<string[]>([]);
  return (
    <div className={compare ? "evidence-comparison" : "evidence-detail"}>
      {ids.map((key) => {
        const clue = clueById[key],
          detail = detailImages[key];
        return (
          <article key={key}>
            <header>
              <small>{clue.source}</small>
              <h2>{clue.title}</h2>
            </header>
            {detail && !failed.includes(key) && (
              <>
                <div className="detail-photo">
                  <img
                    src={detail.src}
                    alt={detail.alt}
                    decoding="async"
                    style={{
                      transform: `scale(${zoom})`,
                      transformOrigin: `${position}% 50%`,
                    }}
                    onError={() => setFailed((v) => [...v, key])}
                  />
                </div>
                <div className="detail-controls">
                  <Button disabled={zoom === 1} onClick={() => setZoom(1)} aria-label="원래 크기로">
                    <ZoomOut />
                  </Button>
                  <span>{zoom === 1 ? "전체" : "두 배 확대"}</span>
                  <Button disabled={zoom === 2} onClick={() => setZoom(2)} aria-label="두 배 확대">
                    <ZoomIn />
                  </Button>
                  {zoom === 2 && (
                    <>
                      <Button
                        disabled={position === 0}
                        onClick={() => setPosition(Math.max(0, position - 25))}
                        aria-label="왼쪽 부분 보기"
                      >
                        <ArrowLeft />
                      </Button>
                      <Button
                        disabled={position === 100}
                        onClick={() => setPosition(Math.min(100, position + 25))}
                        aria-label="오른쪽 부분 보기"
                      >
                        <ArrowRight />
                      </Button>
                    </>
                  )}
                </div>
              </>
            )}
            <div className="tide-paper">
              <Text text={clue.text} />
            </div>
          </article>
        );
      })}
      {compare && ids.includes("rope") && ids.includes("salt") && (
        <p className="comparison-question">
          줄의 눌린 끝과 덮개 홈에 남은 올을 비교한다. 이 흔적이 생긴 시각은 어느 기록에서 확인할 수
          있을까?
        </p>
      )}
    </div>
  );
}
