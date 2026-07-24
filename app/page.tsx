import { Footer, Header, Kicker } from "@/components/site";
import { FormSection } from "@/components/form-section";

const lessonFlow = [
  {
    number: "01",
    label: "READ THE CLUES",
    title: "단서를 읽습니다",
    body: "인물·시간·장소에 관한 핵심 정보를 찾고, 사실과 추측을 구분합니다.",
    image: "/assets/dullg/case-intro.png",
    alt: "학생용 영어 단서 카드 예시",
  },
  {
    number: "02",
    label: "SHARE THE FACTS",
    title: "정보를 설명합니다",
    body: "자신만 가진 단서를 팀원에게 영어로 전달하며 서로 다른 정보를 모읍니다.",
    image: "/assets/dullg/card-cover-1.png",
    alt: "팀 토론 활동 장면 예시",
  },
  {
    number: "03",
    label: "TEST THE THEORY",
    title: "가설을 비교하고 수정합니다",
    body: "질문하고 반박하며, 새 단서가 나왔을 때 처음의 판단을 다시 살펴봅니다.",
    image: "/assets/dullg/rulebook-map-detailed.png",
    alt: "학생 추론 보드 기록 예시",
  },
  {
    number: "04",
    label: "WRITE THE REPORT",
    title: "사건보고서를 완성합니다",
    body: "최종 주장과 근거를 영어 문장으로 정리해 팀 보고서와 개인 결과물을 남깁니다.",
    image: "/assets/dullg/timeline-yoon.png",
    alt: "학생 사건 보고서 작성 예시",
  },
];

const materials: { num: string; title: string; body: string; image: string; alt: string }[] = [
  {
    num: "01",
    title: "게임 카드",
    body: "학생마다 다른 영어 단서가 담긴 역할별 카드입니다.",
    image: "/assets/dullg/mat-game-cards.png",
    alt: "학생용 역할별 영어 단서 카드 묶음",
  },
  {
    num: "02",
    title: "스토리 책자",
    body: "사건 배경과 인물 관계를 담은 이야기 자료입니다.",
    image: "/assets/dullg/mat-story-book.png",
    alt: "사건 배경 설명 스토리 책자",
  },
  {
    num: "03",
    title: "워크북",
    body: "단서 기록, 추론 과정, 최종 근거를 차시별로 씁니다.",
    image: "/assets/dullg/mat-workbook.png",
    alt: "학생용 추론 기록 워크북 내지",
  },
  {
    num: "04",
    title: "규칙서",
    body: "수업 진행 순서와 역할 규칙을 담은 안내 자료입니다.",
    image: "/assets/dullg/mat-rulebook.png",
    alt: "수업 규칙 안내 책자",
  },
  {
    num: "05",
    title: "교사용 진행안",
    body: "차시별 진행 순서, 대본, 힌트와 정답이 모두 포함됩니다.",
    image: "/assets/dullg/mat-teacher-guide.png",
    alt: "교사용 4차시 진행 대본 및 힌트 가이드",
  },
  {
    num: "06",
    title: "수업 결과 리포트",
    body: "학생 활동 기록을 정리한 학부모 전달용 예시 자료입니다.",
    image: "/assets/dullg/mat-report.png",
    alt: "학생 활동 결과 요약 리포트 샘플",
  },
];

const faqs = [
  {
    q: "영어 수준이 낮은 학생도 참여할 수 있나요?",
    a: "네. 단서 카드는 초등 6학년 수준 어휘로 구성됩니다. 정답보다 추론 과정이 중심이라, 영어 실력이 다양한 학생이 함께 참여할 수 있습니다.",
  },
  {
    q: "교사가 영어 원어민이 아니어도 되나요?",
    a: "네. 교사용 진행안에 전체 대본과 단계별 힌트가 포함되어 있어, 원어민이 아닌 교사도 무리 없이 운영할 수 있습니다.",
  },
  {
    q: "수업 준비에 얼마나 걸리나요?",
    a: "첫 수업 기준 30분 이내를 목표로 설계했습니다. 자료를 출력하고 역할 카드를 분배하면 바로 시작할 수 있습니다.",
  },
  {
    q: "한 반에 몇 명까지 가능한가요?",
    a: "4~16명을 기준으로 설계되었습니다. 팀당 4명 구성이며, 팀 수를 늘려 더 많은 인원도 운영할 수 있습니다.",
  },
  {
    q: "파일럿 참여 비용이 있나요?",
    a: "파일럿 기간에는 자료를 무료로 제공합니다. 파일럿 피드백을 반영해 정식 이용 요금을 확정할 예정입니다. 파일럿 이후 구매 의무는 없습니다.",
  },
  {
    q: "샘플만 받고 파일럿에 참여하지 않아도 되나요?",
    a: "물론입니다. 샘플 자료를 먼저 검토하고 맞지 않으면 부담 없이 알려주시면 됩니다. 구매나 파일럿 참여 의무는 없습니다.",
  },
  {
    q: "신청하면 자료를 언제 받을 수 있나요?",
    a: "영업일 1~2일 내 이메일로 샘플 자료를 보내드립니다. 추가 질문이 있으시면 hello@dullg.com으로 먼저 문의하셔도 됩니다.",
  },
];

export default function Home() {
  return (
    <main className="academy-landing">
      <Header />

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="landing-hero shell">
        <div className="landing-hero-copy">
          <Kicker>초6~중1 영어학원 방학특강 · 4차시 완성형 수업팩</Kicker>
          <h1>
            학생은 영어로 추리하고,
            <br />
            <em>결과물로 마무리합니다.</em>
          </h1>
          <p>
            4차시 자료가 모두 완성되어 있습니다. 교사는 출력만 하고, 학생은
            게임처럼 참여하며, 학부모에겐 영어로 쓴 결과물이 남습니다.
          </p>
          <div className="landing-actions">
            <a className="button button-dark" href="#apply">
              샘플 자료 받아보기 <span>↗</span>
            </a>
            <a className="text-link" href="#flow">
              수업 흐름 보기 →
            </a>
          </div>
          <p className="landing-cta-note">
            샘플 요청 무료 · 구매 의무 없음 · 영업일 1~2일 내 답변
          </p>
        </div>
        <div
          className="landing-hero-visual"
          aria-label="수업자료 구성 예시 — 단서 카드, 교사용 진행안, 학생 기록지"
        >
          <div className="hero-material-back">
            <img src="/assets/dullg/rulebook-flow.png" alt="교사용 진행안 자료 예시" />
          </div>
          <div className="hero-material-card hero-card-clue">
            <img src="/assets/dullg/card-body-1.png" alt="학생용 영어 단서 카드 예시" />
          </div>
          <div className="hero-material-card hero-card-report">
            <img src="/assets/dullg/pre-survey.png" alt="학생 활동 기록지 예시" />
          </div>
          <span className="hero-material-label">수업자료 구성 예시</span>
        </div>
      </section>

      {/* ── TRUST BAR ────────────────────────────────── */}
      <section className="landing-trust shell" aria-label="주요 특징">
        <span>초6~중1 권장</span>
        <span>총 4차시</span>
        <span>교사 준비 30분 이내</span>
        <span>학생 결과물 포함</span>
        <span>파일럿 자료 무료 제공</span>
      </section>

      {/* ── STANCE — 패턴 단절, 브랜드 입장 ──────────── */}
      {/* 이론: Pattern Interruption + Clear Stance */}
      <section className="landing-stance shell">
        <div className="stance-inner">
          <p className="stance-line">영어를 가르치지 않습니다.</p>
          <p className="stance-line stance-line--accent">
            학생이 영어를 <em>써야 하는 상황</em>을 만듭니다.
          </p>
          <p className="stance-sub">
            단서를 설명하고, 팀원에게 반박하고, 결론을 근거와 함께 영어로
            써야 수업이 진행됩니다. 교사가 아니라 상황이 학생을 말하게 합니다.
          </p>
        </div>
      </section>

      {/* ── FOR WHOM ─────────────────────────────────── */}
      <section className="landing-for-whom shell">
        <Kicker>이런 분들을 위해 만들었습니다</Kicker>
        <div className="for-whom-grid">
          <div className="for-whom-item">
            <strong>방학특강 프로그램이 아직 없는 원장님</strong>
            <p>
              완성형 자료로 학부모에게 설명하기 쉬운 특강을 바로 운영할 수
              있습니다.
            </p>
          </div>
          <div className="for-whom-item">
            <strong>자료 준비 없이 수업하고 싶은 선생님</strong>
            <p>
              게임 카드·교사 대본·힌트까지 모두 완성되어 있어, 출력만 하면
              바로 시작됩니다.
            </p>
          </div>
          <div className="for-whom-item">
            <strong>학부모에게 보여줄 영어 성과가 필요한 원장님</strong>
            <p>
              학생이 영어로 직접 쓴 사건 보고서가 학부모 전달용 결과물로
              남습니다.
            </p>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ──────────────────────────────────── */}
      {/* 이론: Specificity — 추상적 서술 대신 관찰 가능한 장면 */}
      <section className="landing-problem shell">
        <div>
          <Kicker>WHY THIS EXISTS</Kicker>
          <h2>
            방학특강, 세 가지가
            <br />
            <em>항상 발목을 잡습니다.</em>
          </h2>
        </div>
        <div className="problem-points">
          <p>
            <b>01</b>
            <strong>
              &ldquo;선생님, 오늘 뭐 해요?&rdquo;<br />
              시험 다음날 교실에서 자주 듣는 말입니다
            </strong>
            <span>
              억지로 앉혀두는 수업이 아니라, 학생이 먼저 손을 드는 구조가
              필요합니다.
            </span>
          </p>
          <p>
            <b>02</b>
            <strong>
              활동 자료를 처음부터 만들면<br />
              수업 준비가 수업보다 힘듭니다
            </strong>
            <span>
              교사가 콘텐츠 제작자가 되는 순간, 수업의 질이 흔들립니다.
            </span>
          </p>
          <p>
            <b>03</b>
            <strong>
              &ldquo;재미있었어요&rdquo;는<br />
              학부모 상담에서 충분하지 않습니다
            </strong>
            <span>
              눈에 보이는 무언가가 있어야 학원이 기억에 남습니다.
            </span>
          </p>
        </div>
        <div className="landing-value">
          <Kicker>THE DULLG APPROACH</Kicker>
          <p>
            학생 참여, 교사 편의, 학부모 결과물. 세 가지를{" "}
            <strong>하나의 수업팩</strong>으로 설계했습니다.
          </p>
        </div>
      </section>

      {/* ── 3 VALUE PROPS ────────────────────────────── */}
      <section className="landing-value-props">
        <div className="shell">
          <div className="landing-section-head">
            <Kicker>THE DULLG DIFFERENCE</Kicker>
            <h2>
              세 가지 문제를
              <br />
              <em>한 번에 해결합니다.</em>
            </h2>
          </div>
          <div className="value-props-grid">
            <div className="value-prop">
              <span className="value-prop-num">01</span>
              <strong>교사 준비는 30분 이내</strong>
              <p>
                단서 카드·교사 대본·단계별 힌트·정답이 모두 완성되어 있습니다.
                자료 출력이 전부입니다.
              </p>
            </div>
            <div className="value-prop">
              <span className="value-prop-num">02</span>
              <strong>학생이 먼저 참여합니다</strong>
              <p>
                학생마다 다른 단서를 가지고 있어 교사가 분위기를 만들 필요
                없이 수업이 자연스럽게 진행됩니다.
              </p>
            </div>
            <div className="value-prop">
              <span className="value-prop-num">03</span>
              <strong>학부모에게 드릴 결과물이 생깁니다</strong>
              <p>
                수업이 끝나면 학생이 영어로 쓴 사건 보고서와 개인 활동 기록을
                바로 전달할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── LESSON FLOW ──────────────────────────────── */}
      <section className="landing-flow shell" id="flow">
        <div className="landing-section-head">
          <Kicker>HOW THE CLASS WORKS</Kicker>
          <h2>
            학생들은 영어를
            <br />
            <em>사건 해결에 사용합니다.</em>
          </h2>
          <p>
            각자 가진 단서를 설명하고 팀의 판단을 함께 만들어가는 4단계 수업
            흐름입니다.
          </p>
          <p className="landing-flow-note">(예시 구성 · 변경될 수 있습니다)</p>
        </div>
        <div className="flow-list">
          {lessonFlow.map((item) => (
            <article className="flow-item" key={item.number}>
              <div className="flow-number">{item.number}</div>
              <div>
                <Kicker>{item.label}</Kicker>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
              <div className="flow-thumb">
                <img src={item.image} alt={item.alt} />
              </div>
              <span className="flow-arrow" aria-hidden="true">→</span>
            </article>
          ))}
        </div>
      </section>

      {/* ── MATERIALS ────────────────────────────────── */}
      <section className="landing-materials" id="materials">
        <div className="shell">
          <div className="landing-section-head">
            <Kicker>READY-TO-RUN MATERIALS</Kicker>
            <h2>
              출력하면 바로 수업.
              <br />
              <em>6가지 자료가 모두 포함됩니다.</em>
            </h2>
            <p>
              교사 준비시간 30분 이내를 목표로, 수업을 바로 운영할 수 있는
              완성형 패키지를 구성합니다.
            </p>
          </div>
          <div className="materials-grid">
            {materials.map((m) => (
              <article className="material-item" key={m.num}>
                <div className="material-image">
                  <img src={m.image} alt={m.alt} />
                </div>
                <div className="material-copy">
                  <span>{m.num}</span>
                  <h3>{m.title}</h3>
                  <p>{m.body}</p>
                </div>
              </article>
            ))}
          </div>
          <p className="materials-more">
            <b>그 외 포함 자료</b> · 교사용 진행 대본 · 정답과 단계별 힌트 ·
            개인 영어 작성지 · 활동 결과 요약 템플릿
          </p>
          {/* 이론: Radical Transparency — 파일럿 상태를 숨기지 않음 */}
          <p className="materials-caveat">
            현재 파일럿 단계입니다. 일부 자료는 수업 피드백에 따라 조정될 수
            있습니다.
          </p>
        </div>
      </section>

      {/* ── RESULTS ──────────────────────────────────── */}
      <section className="landing-results shell" id="results">
        <div className="results-visual">
          <div className="result-sheet">
            <span>STUDENT ACTIVITY RECORD · EXAMPLE FORMAT</span>
            <h3>
              이번 판단을
              <br />
              <em>이렇게 설명했습니다.</em>
            </h3>
            <div className="result-line">
              <b>핵심 단서 선택</b>
              <i />
              <strong>03</strong>
            </div>
            <div className="result-line">
              <b>가설 수정</b>
              <i />
              <strong>YES</strong>
            </div>
            <blockquote>
              "The key was in the office
              <br />
              because the note changed."
            </blockquote>
            <small>
              사건 결론과 관련된 근거를 선택하고, because와 however를 사용해
              판단을 설명했습니다.
            </small>
          </div>
        </div>
        <div className="results-copy">
          <Kicker>WHAT REMAINS AFTER CLASS</Kicker>
          <h2>
            재미로 끝나지 않고,
            <br />
            <em>학생의 기록이 남습니다.</em>
          </h2>
          <p>
            수업이 끝나면 학생마다 영어 문장으로 쓴 판단 근거와 팀 보고서가
            결과물로 남습니다. 학부모에게 바로 전달하거나 포트폴리오로 보관할
            수 있습니다.
          </p>
          <ul>
            <li>핵심 단서 선택 기록</li>
            <li>처음 가설과 수정된 판단</li>
            <li>because · however를 사용한 영어 문장</li>
            <li>팀별 사건보고서 + 개인 작성지</li>
          </ul>
          <small>
            활동 결과 요약은 수업 중 관찰된 수행을 정리하며, 학생의
            지능·성격 또는 공인 문해력 수준을 진단하지 않습니다.
          </small>
        </div>
      </section>

      {/* ── PROCESS ──────────────────────────────────── */}
      <section className="landing-process shell" id="process">
        <div className="landing-section-head">
          <Kicker>HOW TO START</Kicker>
          <h2>
            파일럿 신청은
            <br />
            <em>세 단계로 진행됩니다.</em>
          </h2>
        </div>
        <div className="process-steps">
          <div className="process-step">
            <span>01</span>
            <strong>자료 확인</strong>
            <p>
              샘플 자료를 받아보고 수업 구성과 자료 수준을 직접 검토합니다.{" "}
              <em className="step-note">영업일 1~2일 내 발송</em>
            </p>
          </div>
          <div className="process-step">
            <span>02</span>
            <strong>일정 조율</strong>
            <p>
              학원 방학 일정과 학생 수에 맞는 운영 방식을 함께 조율합니다.{" "}
              <em className="step-note">이메일 또는 전화 상담</em>
            </p>
          </div>
          <div className="process-step">
            <span>03</span>
            <strong>수업 진행</strong>
            <p>
              완성형 자료로 수업을 운영하고 학생 결과물을 함께 확인합니다.{" "}
              <em className="step-note">파일럿 피드백 수집</em>
            </p>
          </div>
        </div>
      </section>

      {/* ── NOT FOR EVERYONE — 이론: Radical Transparency ── */}
      {/* 한계를 먼저 인정하는 브랜드가 더 신뢰받는다 */}
      <section className="landing-not-for shell">
        <div className="not-for-inner">
          <p className="not-for-label">이런 경우엔 맞지 않을 수 있습니다</p>
          <ul className="not-for-list">
            <li>단어 암기·문법 중심의 수업을 원하는 경우</li>
            <li>참여 학생이 4명 미만인 소규모 수업</li>
            <li>4주 이상 장기 특강의 대체가 목적인 경우</li>
            <li>교사 없이 학생이 자율 학습하는 구조를 원하는 경우</li>
          </ul>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────── */}
      <section className="landing-faq shell">
        <div className="landing-section-head">
          <Kicker>FAQ</Kicker>
          <h2>자주 묻는 질문</h2>
        </div>
        <div className="faq-list">
          {faqs.map((faq) => (
            <details className="faq-item" key={faq.q}>
              <summary>{faq.q}</summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── APPLY ────────────────────────────────────── */}
      <section className="landing-apply shell" id="apply">
        <div className="apply-intro">
          <Kicker>GET THE SAMPLE PACK</Kicker>
          <h2>
            부담 없이
            <br />
            <em>먼저 확인하세요.</em>
          </h2>
          <p>
            샘플 자료를 먼저 검토하고, 파일럿 여부는 그 이후에 결정하시면
            됩니다.
          </p>
          <ul className="apply-benefits">
            <li>파일럿 기간 자료 무료 제공</li>
            <li>구매 의무 없음</li>
            <li>운영 일정 함께 조율</li>
            <li>피드백 반영 후 정가 확정</li>
          </ul>
        </div>
        <FormSection />
      </section>

      {/* ── FINAL CTA ────────────────────────────────── */}
      <section className="landing-final-cta">
        <div className="shell final-cta-inner">
          <div className="final-cta-copy">
            <Kicker>LIMITED PILOT</Kicker>
            <h2>
              파일럿 학원을
              <br />
              <em>지금 모집 중입니다.</em>
            </h2>
            <p>
              파일럿 기간 자료 무료 제공 · 수업 후 피드백 공유 ·{" "}
              <strong style={{ color: "var(--orange)" }}>초기 2~3개 학원 한정</strong>
            </p>
          </div>
          <a className="button button-light" href="#apply">
            자료 먼저 받아보기 <span>↗</span>
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
