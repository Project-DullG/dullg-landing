/* oxlint-disable next/no-img-element -- Local authored scene WebP is served without a remote image optimization endpoint. */
"use client";
/* oxlint-disable jsx-a11y/prefer-tag-over-role -- This interactive SVG diagram requires its own accessible image name and cannot be replaced by an img element. */
import { useEffect, useState } from "react";
import { backdrop, lampFrames } from "./presentation";
import { Button } from "./ui";
import { Slider } from "./ui";
import { RotateCcw, RotateCw, Flashlight, Send, Waves, Square, ListFilter } from "lucide-react";
import { clueById } from "./content";
import { has, type State, type Result } from "./engine";
export type Perform = (id: string) => Result;
export function Text({ text }: { text: string }) {
  return (
    <>
      {text
        .split("\n\n")
        .filter(Boolean)
        .map((p, i) => (
          <p key={i}>{p}</p>
        ))}
    </>
  );
}
const coast =
  "M75 50 L165 42 L177 83 L221 71 L244 118 L222 145 L250 195 L195 216 L181 186 L123 217 L102 169 L60 146 L92 111 Z";
const targets = [
  ["sea", "물결", Waves],
  ["arch", "사각형", Square],
  ["stairs", "계단", ListFilter],
] as const;
export function MapPuzzle({ state, perform }: { state: State; perform: Perform }) {
  const solved = has(state, "bearing");
  const [rotation, setRotation] = useState(solved ? 270 : 0),
    [opacity, setOpacity] = useState(55),
    [target, setTarget] = useState<State["aim"]>("sea"),
    [feedback, setFeedback] = useState("");
  const facing = ["동쪽", "남쪽", "서쪽", "북쪽"][(rotation / 90) % 4];
  return (
    <div className="tide-map-puzzle">
      <p>
        클라라의 해안 지도에는 장소 이름이, 얇은 도면에는 장치의 표식이 있다. 도면을 돌려 북쪽
        화살표와 해안선을 맞춘 뒤 석실과 겹치는 표식을 고르자.
      </p>
      <div className="map-paper">
        <svg
          viewBox="0 0 320 270"
          role="img"
          aria-label={`고정 해도의 북쪽은 위다. 겹친 도면의 북쪽은 ${facing}을 향한다. 해안선에는 왼쪽의 오목한 만과 위쪽의 돌출부가 있다.`}
        >
          <path d={coast} fill="#c6b68c" stroke="#5a5545" strokeWidth="2" />
          <text x="17" y="25">
            장소 지도
          </text>
          <path
            d="M285 62 V24 M280 31 L285 23 L290 31"
            fill="none"
            stroke="#363e3e"
            strokeWidth="2"
          />
          <text x="277" y="17">
            북
          </text>
          <text x="51" y="204" fill="#32423d">
            바다
          </text>
          <text x="143" y="107" fill="#32423d">
            석실
          </text>
          <text x="223" y="164" fill="#32423d">
            잠긴 복도
          </text>
          <g transform={`rotate(${90 + rotation} 160 135)`} opacity={opacity / 100}>
            <path d={coast} fill="none" stroke="#9a361f" strokeWidth="3" strokeDasharray="6 3" />
            <path
              d="M285 62 V24 M280 31 L285 23 L290 31"
              fill="none"
              stroke="#9a361f"
              strokeWidth="3"
            />
            <text x="277" y="17" fill="#9a361f">
              북
            </text>
            <text x="38" y="188" fill="#7b2518">
              ≋
            </text>
            <text x="130" y="91" fill="#7b2518">
              □
            </text>
            <text x="210" y="148" fill="#7b2518">
              ▥
            </text>
          </g>
        </svg>
        <div className="map-section">
          <strong>도면 아래의 옆모습</strong>
          <p>석실 바닥 ━━━━━</p>
          <p className="water-level">수면 ≋≋≋≋≋≋≋≋</p>
          <p>잠긴 복도 바닥 ━━━━━</p>
        </div>
      </div>
      <div className="tide-row">
        <Button disabled={solved} onClick={() => setRotation((rotation + 270) % 360)}>
          <RotateCcw />
          왼쪽으로 돌리기
        </Button>
        <Button disabled={solved} onClick={() => setRotation((rotation + 90) % 360)}>
          <RotateCw />
          오른쪽으로 돌리기
        </Button>
      </div>
      <p className="tide-small">
        겹친 도면의 북쪽: {facing} · 두 화살표가 같은 방향을 향해야 한다.
      </p>
      {rotation === 270 && (
        <p aria-live="polite">
          해안선이 겹친다. 석실 옆에는 사각형, 바다 옆에는 물결, 잠긴 복도 옆에는 계단 표식이
          놓였다.
        </p>
      )}
      <div className="tide-slider-label">
        겹친 도면의 진하기
        <Slider
          aria-label="겹친 도면의 진하기"
          min={25}
          max={100}
          value={[opacity]}
          onValueChange={(v) => setOpacity(Array.isArray(v) ? v[0] : v)}
        />
      </div>
      <div className="tide-row" aria-label="마른 석실의 표식">
        {targets.map(([id, label, Icon]) => (
          <Button
            key={id}
            aria-pressed={(solved ? "arch" : target) === id}
            disabled={solved}
            onClick={() => setTarget(id)}
          >
            <Icon />
            {label}
          </Button>
        ))}
      </div>
      {!solved && (
        <Button
          className="tide-primary"
          onClick={() => {
            const r = perform(`map:${rotation}:${target}`);
            setFeedback(r.text);
          }}
        >
          두 도면을 대조한다
        </Button>
      )}
      <div aria-live="polite" aria-atomic="true" className="tide-feedback">
        <Text
          text={
            feedback ||
            (solved
              ? clueById.bearing.text
              : "회전 버튼은 한 번에 90도씩 돌린다. 틀려도 다시 맞출 수 있다.")
          }
        />
      </div>
    </div>
  );
}
export function SignalPuzzle({
  state,
  perform,
  reduced = false,
}: {
  state: State;
  perform: Perform;
  reduced?: boolean;
}) {
  const [counts, setCounts] = useState([0, 0]),
    [group, setGroup] = useState(0),
    [feedback, setFeedback] = useState(""),
    [playback, setPlayback] = useState<ReturnType<typeof lampFrames>>([]),
    [frameIndex, setFrameIndex] = useState(0);
  const frame = reduced ? undefined : playback[frameIndex];
  useEffect(() => {
    if (!frame) return;
    const timer = setTimeout(() => setFrameIndex((i) => i + 1), frame.ms);
    return () => clearTimeout(timer);
  }, [frame]);
  const valid = counts.every((n) => n > 0),
    done = state.signals.length >= 2;
  return (
    <div className="tide-signal-puzzle">
      <p>
        불을 끄지 않고 등불 앞을 가렸다 열어 신호를 만든다. 상대에게 같은 횟수로 빛을 보내 달라고
        말하고 두 묶음으로 나누어 보낸다. 횟수를 바꿔도 따라 하는지 확인하자.
      </p>
      <div className="signal-groups">
        {counts.map((n, i) => (
          <div key={i} className={group === i ? "active" : ""}>
            <span>{i === 0 ? "첫 번째" : "두 번째"} 묶음</span>
            <strong>{n}회</strong>
            <div aria-hidden>
              {[0, 1, 2, 3].map((k) => (
                <i key={k} className={k < n ? "lit" : ""} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="tide-row">
        <Button
          disabled={!!frame || done || counts[group] >= 4}
          onClick={() => setCounts((a) => a.map((n, i) => (i === group ? n + 1 : n)))}
        >
          <Flashlight />한 번 비춘다
        </Button>
        <Button
          disabled={!!frame || done || group === 1 || counts[0] === 0}
          onClick={() => setGroup(1)}
        >
          잠시 가리고 다음 묶음
        </Button>
        <Button
          disabled={!!frame || done}
          onClick={() => {
            setCounts([0, 0]);
            setGroup(0);
          }}
        >
          작성한 신호 지우기
        </Button>
      </div>
      <p className="tide-small">
        횟수를 구별하기 쉽도록 한 묶음에 1~4번 비춘다. 조작 속도는 결과에 영향을 주지 않는다.
      </p>
      {!done && (
        <Button
          className="tide-primary"
          disabled={!!frame || !valid}
          onClick={() => {
            const r = perform(`signal-input:${counts[0]}:${counts[1]}`);
            setFeedback(r.text);
            if (r.accepted) {
              setPlayback(reduced ? [] : lampFrames(counts[0], counts[1]));
              setFrameIndex(0);
              setCounts([0, 0]);
              setGroup(0);
            }
          }}
        >
          <Send />
          작성한 신호를 보낸다
        </Button>
      )}
      {frame && (
        <div className="signal-playback">
          <p>
            {frame.side === "sent"
              ? "등불을 가렸다 열어 신호를 보낸다."
              : "건너편 등불도 같은 횟수로 빛을 보낸다."}
          </p>
          <div className="signal-lamps" aria-hidden="true">
            {(["sent", "reply"] as const).map((side) => (
              <div key={side} className={frame.side === side && frame.on ? "lit" : ""}>
                <Flashlight />
                <span>{side === "sent" ? "내 등불" : "건너편 등불"}</span>
              </div>
            ))}
          </div>
          <Button onClick={() => setPlayback([])}>연출을 건너뛰고 기록 보기</Button>
        </div>
      )}
      {!frame && (
        <>
          <ul className="signal-results" aria-label="등불 시험 기록">
            {state.signals.map((p, i) => (
              <li key={p}>
                <span>시험 {i + 1}</span>
                <strong>보낸 빛 {p}</strong>
                <span>→</span>
                <strong>돌아온 빛 {p}</strong>
              </li>
            ))}
          </ul>
          <div aria-live="polite" aria-atomic="true" className="tide-feedback">
            <Text text={feedback} />
          </div>
          {!state.flags.includes("question-heard") && (
            <Button
              className="tide-primary"
              onClick={() => setFeedback(perform("question-response").text)}
            >
              오늘 날짜를 알려 주고 남은 물을 묻는다
            </Button>
          )}
          {state.flags.includes("question-heard") && !has(state, "response") && (
            <p>새 질문의 답은 들었다. 서로 다른 두 신호에도 맞춰 반응하는지 확인한다.</p>
          )}
          {has(state, "response") && !feedback && (
            <div className="tide-paper">
              <Text text={clueById.response.text} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
export function DevicePanel({
  state,
  perform,
  openSignals,
}: {
  state: State;
  perform: Perform;
  openSignals: () => void;
}) {
  const [feedback, setFeedback] = useState("");
  const use = (id: string) => setFeedback(perform(id).text);
  return (
    <div>
      <p>
        이 장치는 검은 유리에 비친 곳으로 통로를 연다. 조준 손잡이로 장소를 고른다. 덮개 손잡이의
        눈금은 여는 정도를 나타낸다. 0은 완전히 닫힌 상태이며 숫자가 커질수록 덮개가 더 열린다.
      </p>
      <figure className="device-preview">
        <img
          src={backdrop(state)}
          alt={
            state.width === 0
              ? "관측실의 원형 덮개가 닫혀 있다."
              : state.width === 1
                ? "덮개 아래에 좁은 틈이 열려 있다."
                : "덮개가 열려 석실로 가는 통로가 보인다."
          }
        />
        <figcaption>
          현재 눈금 {state.width} ·{" "}
          {state.width === 0
            ? "덮개가 닫혀 있다."
            : state.width === 1
              ? "좁은 틈으로 건너편을 확인한다."
              : "사람이 건널 수 있는 상태다."}
        </figcaption>
      </figure>
      <div className="device-readout">
        <div>
          <small>조준한 곳</small>
          <strong>{targets.find((t) => t[0] === state.aim)?.[1]} 표식</strong>
        </div>
        <div>
          <small>덮개 눈금</small>
          <strong>
            {state.width} <span>/ 3</span>
          </strong>
        </div>
        <p>
          {state.width === 0
            ? "덮개가 닫혀 있어 건너편이 보이지 않는다."
            : state.aim === "arch"
              ? "돌계단 끝에 물이 닿지 않은 바닥이 보인다."
              : "유리 너머로 물이 흔들린다."}
        </p>
      </div>
      <h3>조준 손잡이</h3>
      <div className="tide-row">
        {targets.map(([id, label, Icon]) => (
          <Button
            key={id}
            aria-pressed={state.aim === id}
            disabled={state.width === 2 || state.rescue > 0}
            onClick={() => use(`aim:${id}`)}
          >
            <Icon />
            {label}
          </Button>
        ))}
      </div>
      <h3>덮개 손잡이</h3>
      <div className="aperture-controls">
        {[0, 1, 2, 3].map((n) => (
          <Button key={n} aria-pressed={state.width === n} onClick={() => use(`aperture:${n}`)}>
            <strong>{n}</strong>
            <small>{["닫힘", "빛과 소리", "사람 통과", "옆 복도까지"][n]}</small>
          </Button>
        ))}
      </div>
      <p className="tide-small">
        눈금 3으로 열면 옆 복도의 물이 들어온다. 마라가 위험한 조작을 막는다.
      </p>
      {state.aim === "arch" && state.width === 1 && has(state, "bearing") && (
        <Button className="tide-primary" onClick={openSignals}>
          <Flashlight />
          등불로 신호를 보낸다
        </Button>
      )}
      {state.aim === "arch" && state.width === 1 && !state.flags.includes("question-heard") && (
        <Button onClick={() => use("question-response")}>
          오늘 날짜를 알려 주고 남은 물과 식량을 묻는다
        </Button>
      )}
      {has(state, "response") && !has(state, "rescue") && (
        <ul className="preparation">
          {[
            ["mara-ready", "마라 · 제한핀으로 눈금 3을 막는다"],
            ["jonah-ready", "요나 · 새 안전줄을 윈치에 연결한다"],
            ["clara-ready", "클라라 · 도면을 확인하고 등불을 든다"],
          ].map(([id, label]) => (
            <li key={id}>
              <span>{state.flags.includes(id) ? "확인함" : "준비 필요"}</span>
              {label}
            </li>
          ))}
        </ul>
      )}
      <div aria-live="polite" aria-atomic="true" className="tide-feedback">
        <Text text={feedback} />
      </div>
    </div>
  );
}
