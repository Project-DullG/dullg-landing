import type { Metadata } from "next";
import { ArrowButton, Kicker, PageFrame } from "@/components/site";

export const metadata: Metadata = {
  title: "About · DullG",
  description: "DullG를 만든 이유와 우리가 믿는 수업의 조건.",
};

const beliefs = [
  {
    num: "01",
    title: "학생이 먼저\n움직여야 합니다",
    body: "교사가 에너지를 쏟아야 분위기가 만들어지는 구조는 지속되기 어렵습니다. 좋은 수업 자료는 학생을 먼저 움직이게 합니다.",
  },
  {
    num: "02",
    title: "기록이 있어야\n가치가 보입니다",
    body: "\"재미있었어요\"로 끝나는 수업은 다음 학기를 보장하지 못합니다. 학부모와 학생 모두가 볼 수 있는 결과물이 있어야 합니다.",
  },
  {
    num: "03",
    title: "교사의 시간은\n수업에 있어야 합니다",
    body: "콘텐츠 제작에 드는 시간이 줄어야 교사가 학생에게 집중할 수 있습니다. 자료는 완성된 채로 와야 합니다.",
  },
];

export default function AboutPage() {
  return (
    <PageFrame>
      {/* ── HERO — split with decorative manifesto ── */}
      <section className="about-hero shell">
        <div className="about-hero-copy">
          <Kicker>ABOUT DULLG</Kicker>
          <h1>
            수업이 끝나고
            <br />
            <em>남는 것만 만듭니다.</em>
          </h1>
          <p>
            DullG는 학생이 영어를 실제로 써야 하는 상황을 설계합니다.
            재미는 방법이고, 기록은 결과입니다.
          </p>
        </div>
        <div className="about-hero-manifesto" aria-hidden="true">
          <span>READ</span>
          <span>REASON</span>
          <span>WRITE</span>
        </div>
      </section>

      {/* ── ORIGIN — editorial pull quote ── */}
      <section className="about-origin">
        <div className="shell about-origin-inner">
          <blockquote className="about-pullquote">
            영어 수업 한 시간,<br />
            학생이 영어를 직접<br />
            쓰거나 말하는 시간은<br />
            얼마나 될까요?
          </blockquote>
          <div className="about-origin-body">
            <Kicker>WHY WE STARTED</Kicker>
            <p>
              대부분의 시간은 교사의 설명을 듣고 정답을 기다리는 데 씁니다.
              학생이 실제로 영어를 사용하는 순간은, 재보면 생각보다 짧습니다.
            </p>
            <p>
              DullG는 그 구조를 바꾸려고 만들었습니다. 단서를 설명하고,
              팀원에게 반박하고, 판단을 영어로 써야 수업이 진행됩니다.
              교사가 분위기를 만드는 게 아니라, 사건 자체가 학생을 움직이게
              합니다.
            </p>
            <p>
              동시에 원장님의 현실도 알고 있습니다. 수업 준비 시간이 줄어야
              하고, 학부모에게 보여줄 결과물이 있어야 합니다.
              DullG는 이 두 가지를 같이 해결하려고 설계됐습니다.
            </p>
          </div>
        </div>
      </section>

      {/* ── BELIEFS — ghost number cards ── */}
      <section className="about-beliefs shell">
        <div className="about-beliefs-head">
          <Kicker>WHAT WE BELIEVE</Kicker>
          <h2>
            좋은 수업의
            <br />
            <em>세 가지 조건</em>
          </h2>
        </div>
        <div className="belief-list">
          {beliefs.map((item) => (
            <div className="belief-item" key={item.num}>
              <span className="belief-ghost" aria-hidden="true">{item.num}</span>
              <strong>
                {item.title.split("\n").map((line, i) => (
                  <span key={i}>{line}<br /></span>
                ))}
              </strong>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── NOW — dark section ── */}
      <section className="about-now-dark">
        <div className="shell about-now-inner">
          <div className="about-now-copy">
            <Kicker>WHERE WE ARE NOW</Kicker>
            <h2>파일럿 학원과<br />함께 만들고 있습니다.</h2>
            <p>
              첫 번째 에피소드 <em>보충반의 사라진 열쇠</em>를 실제
              교실에서 테스트하고 있습니다. 참여 학원의 피드백을 반영해
              자료를 다듬고, 다음 에피소드를 준비 중입니다.
            </p>
            <p>
              아직 초기 단계입니다. 현재 검토용 샘플 자료를 무료로
              제공합니다. 먼저 확인하고, 그 이후를 결정하면 됩니다.
            </p>
            <div className="about-now-actions">
              <ArrowButton light href="/#apply">무료 샘플 받아보기</ArrowButton>
              <a className="text-link-light" href="/activity">
                활동 기록 보기 →
              </a>
            </div>
          </div>
          <div className="about-now-badge" aria-hidden="true">
            <span>PILOT</span>
            <b>2026</b>
            <span>OPEN</span>
          </div>
        </div>
      </section>
    </PageFrame>
  );
}
