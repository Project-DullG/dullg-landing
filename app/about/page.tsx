import type { Metadata } from "next";
import { ArrowButton, Kicker, PageFrame } from "@/components/site";

export const metadata: Metadata = {
  title: "About · DullG",
  description: "DullG를 만든 이유와 우리가 믿는 수업의 조건.",
};

export default function AboutPage() {
  return (
    <PageFrame>
      {/* ── HERO ── */}
      <section className="inner-hero shell">
        <Kicker>ABOUT DULLG</Kicker>
        <h1>
          수업이 끝나고
          <br />
          <em>남는 것만 만듭니다.</em>
        </h1>
        <p>
          DullG는 학생이 영어를 실제로 써야 하는 상황을 설계합니다. 재미는
          방법이고, 기록은 결과입니다.
        </p>
      </section>

      {/* ── WHY WE STARTED ── */}
      <section className="about-section shell">
        <div className="about-grid">
          <div className="about-label">
            <Kicker>WHY WE STARTED</Kicker>
          </div>
          <div className="about-copy">
            <h2>
              한 교실에서
              <br />
              <span>보고 시작했습니다.</span>
            </h2>
            <p>
              영어 수업에서 학생이 영어를 직접 말하거나 쓰는 순간이 얼마나
              되는지 재보면, 생각보다 짧습니다. 대부분의 시간은 교사의
              설명을 듣고, 정답을 기다리는 데 씁니다.
            </p>
            <p>
              DullG는 그 구조를 바꾸려고 만들었습니다. 단서를 설명하고,
              팀원에게 반박하고, 판단을 영어로 써야 수업이 진행됩니다. 교사가
              분위기를 만드는 게 아니라, 사건 자체가 학생을 움직이게 합니다.
            </p>
            <p>
              동시에 원장님과 선생님의 현실도 알고 있습니다. 수업 준비에
              드는 시간이 줄어야 하고, 학부모에게 보여줄 결과물이 있어야
              합니다. DullG는 이 두 가지를 같이 해결하려고 설계됐습니다.
            </p>
          </div>
        </div>
      </section>

      {/* ── WHAT WE BELIEVE ── */}
      <section className="about-beliefs shell">
        <div className="about-beliefs-head">
          <Kicker>WHAT WE BELIEVE</Kicker>
          <h2>
            좋은 수업의
            <br />
            <span>세 가지 조건</span>
          </h2>
        </div>
        <div className="belief-list">
          <div className="belief-item">
            <b>01</b>
            <strong>학생이 먼저 움직여야 합니다</strong>
            <p>
              교사가 에너지를 쏟아야 분위기가 만들어지는 구조는 지속되기
              어렵습니다. 좋은 수업 자료는 학생을 먼저 움직이게 합니다.
            </p>
          </div>
          <div className="belief-item">
            <b>02</b>
            <strong>기록이 있어야 가치가 보입니다</strong>
            <p>
              &ldquo;재미있었어요&rdquo;로 끝나는 수업은 다음 학기를
              보장하지 못합니다. 학부모와 학생 모두가 볼 수 있는 결과물이
              있어야 합니다.
            </p>
          </div>
          <div className="belief-item">
            <b>03</b>
            <strong>교사의 시간은 수업에 있어야 합니다</strong>
            <p>
              콘텐츠 제작에 드는 시간이 줄어야 교사가 학생에게 집중할 수
              있습니다. 자료는 완성된 채로 와야 합니다.
            </p>
          </div>
        </div>
      </section>

      {/* ── WHERE WE ARE NOW ── */}
      <section className="about-now shell">
        <Kicker>WHERE WE ARE NOW</Kicker>
        <h2>
          첫 번째 에피소드를
          <br />
          <span>교실에서 테스트 중입니다.</span>
        </h2>
        <p>
          <em>보충반의 사라진 열쇠</em> — 학원을 배경으로 한 미스터리
          추리 수업입니다. 실제 수업에서 받은 피드백을 반영해 자료를
          계속 다듬고 있고, 다음 에피소드를 준비하고 있습니다.
        </p>
        <p>
          아직 초기 단계입니다. 그래서 지금 함께하는 학원에는 자료를 무료로
          제공합니다. 잘 맞는지 먼저 확인하고, 그 이후를 결정하면 됩니다.
        </p>
        <div className="about-now-actions">
          <ArrowButton href="/#apply">샘플 자료 받아보기</ArrowButton>
          <a className="text-link" href="/episode">첫 번째 에피소드 보기 →</a>
        </div>
      </section>
    </PageFrame>
  );
}
