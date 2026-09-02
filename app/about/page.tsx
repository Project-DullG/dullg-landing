import type { Metadata } from "next";
import { ArrowButton, Kicker, PageFrame } from "@/components/site";

export const metadata: Metadata = {
  title: "단서공방 소개",
  description: "스토리 기반 추론 경험을 교육과 콘텐츠로 만드는 단서공방(ProjectDullG)의 방향과 현재 단계.",
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

const projectTracks = [
  {
    status: "현재 중심",
    title: "영어학원용 수업 키트",
    body: "초6 수준에서 첫 검증을 준비하는 4차시 실물 미스터리 수업 시제품입니다.",
  },
  {
    status: "축적 자산",
    title: "스토리·추리 콘텐츠",
    body: "역할, 비대칭 정보, 단서 공개와 최종 판단을 연결하는 콘텐츠 설계 경험입니다.",
  },
  {
    status: "후속 가설",
    title: "교육·지역 콘텐츠 확장",
    body: "문해력, 역사·사회, 지역 창작과 관광 적용은 첫 제품 검증 이후 별도로 검토합니다.",
  },
];

export default function AboutPage() {
  return (
    <PageFrame>
      {/* ── HERO — split with decorative manifesto ── */}
      <section className="about-hero shell">
        <div className="about-hero-copy">
          <Kicker>단서공방 소개</Kicker>
          <h1>
            수업이 끝나고
            <br />
            <em>남는 것만 만듭니다.</em>
          </h1>
          <p>
            단서공방(ProjectDullG)은 역할과 서로 다른 정보를 바탕으로 읽고, 질문하고,
            근거를 비교해 자신의 판단을 남기는 경험을 설계합니다.
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
            <Kicker>시작한 이유</Kicker>
            <p>
              대부분의 시간은 교사의 설명을 듣고 정답을 기다리는 데 씁니다.
              학생이 실제로 영어를 사용하는 순간은, 재보면 생각보다 짧습니다.
            </p>
            <p>
              단서공방은 그 구조를 바꾸려고 시작했습니다. 단서를 설명하고,
              팀원에게 반박하고, 판단을 영어로 써야 수업이 진행됩니다.
              교사가 분위기를 만드는 게 아니라, 사건 자체가 학생을 움직이게
              합니다.
            </p>
            <p>
              동시에 원장님의 현실도 알고 있습니다. 수업 준비 시간이 줄어야
              하고, 학부모에게 보여줄 결과물이 있어야 합니다.
              첫 작품 DullG는 이 두 가지를 같이 해결하려고 설계됐습니다.
            </p>
          </div>
        </div>
      </section>

      <section className="about-scope shell">
        <div className="about-scope-head">
          <Kicker>프로젝트 범위</Kicker>
          <h2>
            게임 하나가 아니라,
            <br />
            <em>판단하는 경험을 만듭니다.</em>
          </h2>
          <p>
            역할과 제한된 정보를 바탕으로 다른 사람과 상호작용하고, 자신의
            결론과 근거를 말하거나 쓰게 하는 경험이 DullG의 공통 기반입니다.
          </p>
        </div>
        <div className="about-scope-grid">
          {projectTracks.map((track) => (
            <article key={track.title}>
              <span>{track.status}</span>
              <h3>{track.title}</h3>
              <p>{track.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── BELIEFS — ghost number cards ── */}
      <section className="about-beliefs shell">
        <div className="about-beliefs-head">
          <Kicker>만드는 원칙</Kicker>
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
            <Kicker>현재 단계</Kicker>
            <h2>첫 수업용 시제품과<br />파일럿을 준비하고 있습니다.</h2>
            <p>
              현재 중심은 첫 번째 에피소드 <em>보충반의 사라진 열쇠</em>를
              초6 수준에서 검토할 수 있는 영어학원용 4차시 수업 시제품으로
              다듬는 일입니다.
            </p>
            <p>
              아직 정식 출시 전 단계입니다. 검토용 샘플을 먼저 공개하고,
              파일럿에서는 운영 가능성과 학생 결과물을 확인할 예정입니다.
            </p>
            <div className="about-now-actions">
              <ArrowButton light href="/#apply">무료 검토팩 요청</ArrowButton>
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
