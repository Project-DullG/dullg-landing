import type { Metadata } from "next";
import { ArrowButton, Kicker, PageFrame } from "@/components/site";

export const metadata: Metadata = {
  title: "Episode 01 · 보충반의 사라진 열쇠 · DullG",
  description: "첫 번째 DullG 에피소드. 학원 3층에서 두 개의 열쇠가 사라졌습니다. 4명의 학생이 단서를 모아 사건을 해결합니다.",
};

const cast = [
  { num: "01", name: "윤지원", image: "/assets/dullg/yoonjiwon.png",  clue: "오후 4시 12분, 원장실 앞 복도에서 서두르는 발소리를 들었습니다." },
  { num: "02", name: "박세준", image: "/assets/dullg/parksejun.png", clue: "자습실 창가 자리에서 벽면 열쇠고리가 비어 있는 것을 보았습니다." },
  { num: "03", name: "차하린", image: "/assets/dullg/chaharin.png",  clue: "계단 아래에서 선생님과 낯선 가방이 함께 있는 것을 목격했습니다." },
  { num: "04", name: "한도경", image: "/assets/dullg/handokyung.png", clue: "복도에서 쪽지 한 장을 발견했습니다. 그 위에 영어 문장이 쓰여 있었습니다." },
];

const steps = [
  { num: "01", label: "READ THE CLUES",    title: "단서를 읽습니다",       body: "각자의 카드에서 중요한 정보를 찾고 단서 기록지에 적습니다. 사실과 추측을 구분하는 것이 첫 과제입니다.",                                                                       output: "단서 기록지" },
  { num: "02", label: "SHARE THE FACTS",   title: "정보를 나눕니다",       body: "자신의 단서를 팀원에게 설명하고, 서로의 시간대와 위치를 비교합니다. 영어로 설명하지 않으면 수업이 진행되지 않습니다.",                                                        output: "팀 추론 보드" },
  { num: "03", label: "TEST THE THEORY",   title: "가설을 수정합니다",     body: "새로운 단서가 나올 때마다 처음의 판단을 다시 검토합니다. 반박하고 설득하며 가설을 다듬습니다.",                                                                             output: "주장·근거 정리지" },
  { num: "04", label: "WRITE THE REPORT",  title: "보고서를 씁니다",       body: "최종 용의자와 두 가지 근거를 because와 however를 사용해 영어 문장으로 씁니다. 팀 보고서와 개인 작성지가 결과물로 남습니다.",                                                  output: "팀 보고서 · 개인 영작" },
];

export default function EpisodePage() {
  return (
    <PageFrame>
      {/* ── HERO — split with case file cover ── */}
      <section className="ep-hero-split shell">
        <div className="ep-hero-copy">
          <Kicker>CASE FILE · 01 · FIRST EPISODE</Kicker>
          <h1>
            보충반의
            <br />
            <em>사라진 열쇠</em>
          </h1>
          <p>
            재시험을 시작하려던 순간, 원장실 벽면에 있어야 할 두 개의
            열쇠가 사라졌습니다. 네 명의 학생이 각자 다른 장소에서
            단서를 발견합니다.
          </p>
          <div className="ep-hero-chips">
            <span>4차시 수업</span>
            <span>초6~중1</span>
            <span>4~16명</span>
          </div>
        </div>
        <div className="ep-hero-visual">
          <img
            src="/assets/dullg/rulebook-cover.png"
            alt="보충반의 사라진 열쇠 케이스 파일"
          />
          <span className="ep-case-stamp">OPEN CASE</span>
        </div>
      </section>

      {/* ── SETTING — large floor map ── */}
      <section className="ep-setting">
        <div className="shell ep-setting-inner">
          <div className="ep-setting-copy">
            <Kicker>THE SETTING</Kicker>
            <h2>
              오후 4시 30분,
              <br />
              <span>학원 3층에서 시작됩니다.</span>
            </h2>
            <p>
              방과후 보충 수업 첫날. 재시험을 치르기 위해 학생들이
              모였는데, 원장실 서랍 열쇠와 자습실 보관함 열쇠가 동시에
              사라졌습니다.
            </p>
            <p>
              4명의 학생이 각자 목격한 것을 영어로 기록하고 정보를 모아
              사건을 해결해야 합니다. 단서는 각자 다르고, 혼자로는
              충분하지 않습니다.
            </p>
          </div>
          <div className="ep-setting-map">
            <img
              src="/assets/dullg/floor-map-3f.png"
              alt="3층 원장실과 자습실 평면도"
              loading="lazy"
            />
            <div className="ep-map-label">
              <span>3F / FLOOR MAP</span>
              <span>INCIDENT LOCATION</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CAST — profile cards ── */}
      <section className="ep-cast shell">
        <div className="ep-cast-head">
          <Kicker>THE FOUR STUDENTS</Kicker>
          <h2>
            각자 다른 단서를
            <br />
            <em>가지고 있습니다.</em>
          </h2>
        </div>
        <div className="ep-cast-grid">
          {cast.map((c) => (
            <div className="ep-cast-card" key={c.name}>
              <div className="ep-cast-img">
                <img src={c.image} alt={`${c.name} 캐릭터`} loading="lazy" />
              </div>
              <div className="ep-cast-info">
                <span className="ep-cast-index">{c.num} / 04</span>
                <strong>{c.name}</strong>
                <p>{c.clue}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CLASSROOM IMAGE — wide band ── */}
      <div className="ep-scene-band">
        <img
          src="/assets/dullg/students-investigation.png"
          alt="학생들이 단서와 평면도를 함께 살펴보는 수업 장면"
          loading="lazy"
        />
        <div className="ep-scene-overlay">
          <span className="ep-scene-label">CLASSROOM / EVIDENCE REVIEW</span>
          <p className="ep-scene-caption-text">
            학생들은 각자 다른 자료를 들고 시작합니다.<br />
            서로의 내용을 설명하고, 지도와 단서를 연결하면서 하나의 판단을 함께 완성합니다.
          </p>
        </div>
      </div>

      {/* ── LESSON FLOW ── */}
      <section className="ep-flow shell">
        <div className="ep-flow-head">
          <Kicker>HOW THE CASE UNFOLDS · 4 LESSONS</Kicker>
          <h2>
            4차시 동안
            <br />
            <em>사건이 풀립니다.</em>
          </h2>
        </div>
        <div className="ep-steps">
          {steps.map((s) => (
            <div className="ep-step" key={s.num}>
              <div className="ep-step-head">
                <b className="ep-step-num">{s.num}</b>
                <span className="ep-step-label">{s.label}</span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              <span className="ep-output">결과물 · {s.output}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="ep-cta shell">
        <div className="ep-cta-copy">
          <Kicker>SEE THE ACTUAL MATERIALS</Kicker>
          <h2>
            자료를 먼저
            <br />
            <span>직접 확인하세요.</span>
          </h2>
          <p>
            단서 카드, 교사용 진행안, 학생 결과물 샘플을 묶어
            보내드립니다. 검토용 샘플 자료는 무료입니다.
          </p>
        </div>
        <div className="ep-cta-actions">
          <ArrowButton href="/#apply">무료 샘플 받아보기</ArrowButton>
          <a className="text-link" href="/academy/sample">자료 미리 보기 →</a>
        </div>
      </section>
    </PageFrame>
  );
}
