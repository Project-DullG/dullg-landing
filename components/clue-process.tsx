"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

const stages = [
  {
    number: "01",
    title: "사건의 시작과 끝을 정합니다",
    body: "누가 무엇을 알고 있는지 먼저 정리하고, 이야기의 결말까지 한 흐름으로 구성합니다.",
    layers: [{ tone: "green", width: 1 }],
  },
  {
    number: "02",
    title: "정보를 인물마다 나눕니다",
    body: "혼자서는 풀 수 없도록 단서를 나눕니다. 질문과 대화가 자연스럽게 이어지는지 확인합니다.",
    layers: [
      { tone: "green", width: 1 },
      { tone: "amber", width: 0.64 },
    ],
  },
  {
    number: "03",
    title: "플레이하며 반복해서 고칩니다",
    body: "단서가 너무 빠르거나 늦게 드러나지 않는지 살피고, 판단에 필요한 정보만 남깁니다.",
    layers: [
      { tone: "green", width: 1 },
      { tone: "amber", width: 0.64 },
      { tone: "red", width: 0.3 },
    ],
  },
] as const;

function ProcessGrid({
  layers,
  active,
}: {
  layers: (typeof stages)[number]["layers"];
  active: boolean;
}) {
  const columns = 18;
  const rows = 6;
  return (
    <div className={`process-grid${active ? " is-active" : ""}`} aria-hidden="true">
      {Array.from({ length: columns * rows }, (_, index) => {
        const rowFromBottom = rows - 1 - Math.floor(index / columns);
        const column = index % columns;
        let tone = "empty";
        layers.forEach((layer, layerIndex) => {
          if (
            rowFromBottom >= layerIndex * 2 &&
            rowFromBottom < layerIndex * 2 + 2 &&
            column >= columns - Math.round(columns * layer.width)
          )
            tone = layer.tone;
        });
        return (
          <i
            key={index}
            className={`process-cell is-${tone}`}
            style={{ "--cell-index": index } as CSSProperties}
          />
        );
      })}
    </div>
  );
}

export function ClueProcess() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (!root.current) return;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      threshold: 0.2,
    });
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="brand-method-list" ref={root}>
      {stages.map((stage) => (
        <article key={stage.number}>
          <ProcessGrid layers={stage.layers} active={active} />
          <span>{stage.number}</span>
          <h3>{stage.title}</h3>
          <p>{stage.body}</p>
        </article>
      ))}
    </div>
  );
}
