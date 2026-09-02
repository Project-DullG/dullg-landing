"use client";

import {
  BookOpenText,
  ChatCircleDots,
  FileText,
  FolderOpen,
  Scales,
} from "@phosphor-icons/react";
import Link from "next/link";
import { type KeyboardEvent, useRef, useState } from "react";

const sessions = [
  {
    session: "01",
    label: "READ THE CASE",
    title: "사건을 읽고 단서를 고릅니다",
    purpose: "사건의 배경과 인물을 읽고, 사실과 추측을 구분합니다.",
    activity: "사건 브리핑 → 역할 카드 읽기 → 핵심 단서 기록",
    support: "교사용 진행안 · 역할 배정표 · 어휘 지원 문구",
    output: "개인 단서 기록지",
    icon: BookOpenText,
  },
  {
    session: "02",
    label: "CONNECT THE CLUES",
    title: "서로 다른 정보를 연결합니다",
    purpose: "자신만 가진 단서를 설명하고, 팀원의 정보와 비교합니다.",
    activity: "단서 공유 → 시간·장소 비교 → 팀 추론 보드 작성",
    support: "질문 예시 · 토론 순서 · 단계별 힌트",
    output: "팀 추론 보드",
    icon: ChatCircleDots,
  },
  {
    session: "03",
    label: "TEST THE THEORY",
    title: "가설을 비교하고 수정합니다",
    purpose: "새로운 증거가 나왔을 때 처음의 판단을 다시 살펴봅니다.",
    activity: "가설 발표 → 반박과 설득 → 주장·근거 다시 정리",
    support: "추가 단서 · 교사용 힌트 · 정답과 해설",
    output: "주장·근거 정리지",
    icon: Scales,
  },
  {
    session: "04",
    label: "WRITE THE REPORT",
    title: "사건보고서로 마무리합니다",
    purpose: "최종 판단과 근거를 영어 문장으로 정리합니다.",
    activity: "결론 합의 → 영어 문장 작성 → 팀 보고서 완성",
    support: "문장 틀 · 작성 예시 · 결과 요약 템플릿",
    output: "팀 보고서 · 개인 영작",
    icon: FileText,
  },
];

export function CurriculumExplorer() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const active = sessions[activeIndex];
  const ActiveIcon = active.icon;

  const moveToTab = (index: number) => {
    const nextIndex = (index + sessions.length) % sessions.length;
    setActiveIndex(nextIndex);
    tabRefs.current[nextIndex]?.focus();
  };

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      moveToTab(index + 1);
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      moveToTab(index - 1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      moveToTab(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      moveToTab(sessions.length - 1);
    }
  };

  return (
    <div className="curriculum-explorer">
      <div
        className="curriculum-tabs"
        role="tablist"
        aria-label="4차시 수업 흐름"
      >
        {sessions.map((session, index) => {
          const SessionIcon = session.icon;
          const isActive = index === activeIndex;

          return (
            <button
              key={session.session}
              id={`curriculum-tab-${session.session}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`curriculum-panel-${session.session}`}
              className={isActive ? "is-active" : undefined}
              tabIndex={isActive ? 0 : -1}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              onClick={() => setActiveIndex(index)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              <span className="curriculum-tab-number">{session.session}</span>
              <SessionIcon size={20} weight={isActive ? "fill" : "regular"} />
              <span>{session.title}</span>
            </button>
          );
        })}
      </div>

      <section
        className="curriculum-panel"
        id={`curriculum-panel-${active.session}`}
        role="tabpanel"
        aria-labelledby={`curriculum-tab-${active.session}`}
        tabIndex={0}
      >
        <div className="curriculum-panel-head">
          <span className="curriculum-panel-icon" aria-hidden="true">
            <ActiveIcon size={26} weight="duotone" />
          </span>
          <div>
            <span>{active.label}</span>
            <h3>{active.title}</h3>
          </div>
          <b>{active.session} / 04</b>
        </div>

        <dl className="curriculum-panel-details">
          <div>
            <dt>수업 목표</dt>
            <dd>{active.purpose}</dd>
          </div>
          <div>
            <dt>주요 활동</dt>
            <dd>{active.activity}</dd>
          </div>
          <div>
            <dt>교사 지원</dt>
            <dd>{active.support}</dd>
          </div>
          <div>
            <dt>
              <FolderOpen size={18} aria-hidden="true" />
              학생 결과물
            </dt>
            <dd>{active.output}</dd>
          </div>
        </dl>

        <Link href="/academy/curriculum" className="curriculum-panel-link">
          4차시 전체 구성 확인하기
        </Link>
      </section>
    </div>
  );
}
