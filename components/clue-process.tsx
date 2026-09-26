"use client";
import { useText } from "@/lib/i18n/use-text";
import { useEffect, useRef, useState, type CSSProperties } from "react";
const stages = [
  {
    number: "01",
    title: "사건의 시작과 끝을 정합니다",
    body: "사건이 벌어진 이유와 인물별 행동을 정리합니다. 결말을 설명하는 데 필요한 정보가 앞선 장면에 있는지 확인합니다.",
    layers: [{ tone: "green", width: 1 }],
  },
  {
    number: "02",
    title: "정보를 인물마다 나눕니다",
    body: "인물마다 알고 있는 정보와 공개할 단서를 나눕니다. 서로 질문하고 자료를 비교해 추리할 수 있는지 확인합니다.",
    layers: [
      { tone: "green", width: 1 },
      { tone: "amber", width: 0.64 },
    ],
  },
  {
    number: "03",
    title: "플레이하며 반복해서 고칩니다",
    body: "플레이 중 막히는 부분을 확인합니다. 판단에 필요한 단서가 빠졌거나 너무 늦게 공개된다면 내용과 순서를 고칩니다.",
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
  const t = useText();
  const columns = 18;
  const rows = 6;
  return (
    <div className={`process-grid${active ? " is-active" : ""}`} aria-hidden="true">
      {t(
        Array.from({ length: columns * rows }, (_, index) => {
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
        }),
      )}
    </div>
  );
}
export function ClueProcess() {
  const t = useText();
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
      {t(
        stages.map((stage) => (
          <article key={stage.number}>
            <ProcessGrid layers={stage.layers} active={active} />
            <span>{t(stage.number)}</span>
            <h3>{t(stage.title)}</h3>
            <p>{t(stage.body)}</p>
          </article>
        )),
      )}
    </div>
  );
}
