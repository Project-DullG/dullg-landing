import { Footer, Header, Kicker } from "@/components/site";

const lessonFlow = [
  { number: "01", label: "READ THE CLUES", title: "단서를 읽습니다", body: "인물·시간·장소에 관한 핵심 정보를 찾고 사실과 추측을 구분합니다.", image: "/assets/dullg/case-intro.png" },
  { number: "02", label: "SHARE THE FACTS", title: "정보를 설명합니다", body: "자신이 가진 단서를 팀원에게 영어로 설명하며 서로 다른 정보를 모읍니다.", image: "/assets/dullg/card-cover-1.png" },
  { number: "03", label: "TEST THE THEORY", title: "가설을 비교하고 수정합니다", body: "질문하고 반박하며 새 단서에 따라 처음의 판단을 다시 살펴봅니다.", image: "/assets/dullg/rulebook-map-detailed.png" },
  { number: "04", label: "WRITE THE REPORT", title: "사건보고서를 완성합니다", body: "최종 주장과 근거를 영어 문장으로 정리해 팀 보고서와 개인 결과물을 남깁니다.", image: "/assets/dullg/timeline-yoon.png" },
];

const materials: [string, string, string, string][] = [
  ["01", "게임 카드", "학생마다 다른 영어 단서가 담긴 역할별 카드입니다.", "/assets/dullg/mat-game-cards.png"],
  ["02", "스토리 책자", "사건 배경과 인물 관계를 담은 이야기 자료입니다.", "/assets/dullg/mat-story-book.png"],
  ["03", "워크북", "단서 기록, 추론 과정, 최종 근거를 차시별로 씁니다.", "/assets/dullg/mat-workbook.png"],
  ["04", "규칙서", "수업 진행 순서와 역할 규칙을 담은 안내 자료입니다.", "/assets/dullg/mat-rulebook.png"],
  ["05", "교사용 진행안", "차시별 진행 순서, 대본, 힌트와 정답을 포함합니다.", "/assets/dullg/mat-teacher-guide.png"],
  ["06", "수업 결과 리포트 샘플", "학생 활동 기록을 정리한 학부모 전달용 예시 자료입니다.", "/assets/dullg/mat-report.png"],
];

export default function Home() {
  return <main className="academy-landing"><Header />

    {/* ── HERO ─────────────────────────────────────── */}
    <section className="landing-hero shell">
      <div className="landing-hero-copy">
        <Kicker>초6~중1 영어학원 방학특강 · 4차시 수업팩</Kicker>
        <h1>학생은 영어로 추리하고,<br /><em>결과물로 마무리합니다.</em></h1>
        <p>교사 준비 30분 이내. 학생은 게임처럼 참여하고, 수업 후 영어 활동 기록이 결과물로 남는 방학특강 전용 수업팩입니다.</p>
        <div className="landing-actions">
          <a className="button button-dark" href="#apply">샘플 자료 요청 <span>↗</span></a>
          <a className="text-link" href="#flow">수업 흐름 보기 →</a>
        </div>
      </div>
      <div className="landing-hero-visual" aria-label="수업자료 구성 예시">
        <div className="hero-material-back"><img src="/assets/dullg/rulebook-flow.png" alt="교사용 진행안 자료 예시" /></div>
        <div className="hero-material-card hero-card-clue"><img src="/assets/dullg/card-body-1.png" alt="학생용 단서 카드 자료 예시" /></div>
        <div className="hero-material-card hero-card-report"><img src="/assets/dullg/pre-survey.png" alt="학생 기록 자료 예시" /></div>
        <span className="hero-material-label">수업자료 구성 예시</span>
      </div>
    </section>

    {/* ── TRUST BAR ────────────────────────────────── */}
    <section className="landing-trust shell">
      <span>초6~중1 권장</span>
      <span>총 4차시</span>
      <span>교사 준비 30분 이내 목표</span>
      <span>학생 결과물 제공</span>
      <span>초기 파일럿 2~3개 학원 모집</span>
    </section>

    {/* ── FOR WHOM ─────────────────────────────────── */}
    <section className="landing-for-whom shell">
      <Kicker>이런 분들을 위해 만들었습니다</Kicker>
      <div className="for-whom-grid">
        <div className="for-whom-item">
          <strong>방학 전 특강 아이템이 없어 막막한 원장님</strong>
          <p>검증된 구조와 완성형 자료로 학부모에게 설명하기 쉬운 특강을 바로 운영할 수 있습니다.</p>
        </div>
        <div className="for-whom-item">
          <strong>수업 자료를 새로 만들 시간이 없는 선생님</strong>
          <p>게임 카드, 교사 대본, 힌트까지 모두 준비되어 있어 출력만 하면 바로 시작됩니다.</p>
        </div>
        <div className="for-whom-item">
          <strong>학부모에게 수업 성과를 보여줘야 하는 분</strong>
          <p>학생이 영어로 직접 작성한 사건 보고서가 학부모 전달용 결과물로 남습니다.</p>
        </div>
      </div>
    </section>

    {/* ── PROBLEM ──────────────────────────────────── */}
    <section className="landing-problem shell">
      <div>
        <Kicker>WHY ACADEMIES NEED IT</Kicker>
        <h2>재미있는 수업,<br /><em>그런데 학부모에게 무엇을 설명하시겠어요?</em></h2>
      </div>
      <div className="problem-points">
        <p>
          <b>01</b>
          <strong>시험이 끝난 학생은<br />집중력이 이미 방학 모드입니다</strong>
          <span>억지로 앉혀두는 수업이 아니라, 학생이 먼저 참여하는 구조가 필요합니다.</span>
        </p>
        <p>
          <b>02</b>
          <strong>교사가 자료를 새로 만들면<br />방학특강이 더 힘들어집니다</strong>
          <span>수업 운영에 집중할 수 있도록 자료 준비는 최소화되어야 합니다.</span>
        </p>
        <p>
          <b>03</b>
          <strong>활동만 하고 끝나면<br />학부모는 아무것도 기억 못합니다</strong>
          <span>무엇을 배웠는지 보여줄 수 있어야 학원이 기억에 남습니다.</span>
        </p>
      </div>
      <div className="landing-value">
        <Kicker>THE DULLG APPROACH</Kicker>
        <p>학생 참여, 교사 편의, 학부모 결과물. 이 세 가지를 <strong>하나의 수업팩</strong>으로 설계했습니다.</p>
      </div>
    </section>

    {/* ── 3 VALUE PROPS ────────────────────────────── */}
    <section className="landing-value-props">
      <div className="shell">
        <div className="landing-section-head">
          <Kicker>THE DULLG DIFFERENCE</Kicker>
          <h2>세 가지 문제가<br /><em>한 번에 해결됩니다.</em></h2>
        </div>
        <div className="value-props-grid">
          <div className="value-prop">
            <span className="value-prop-num">01</span>
            <strong>교사 부담 없음</strong>
            <p>게임 카드·교사 대본·힌트·정답이 모두 완성되어 있습니다. 준비는 자료 출력뿐입니다.</p>
          </div>
          <div className="value-prop">
            <span className="value-prop-num">02</span>
            <strong>학생이 알아서 참여</strong>
            <p>각자 다른 단서를 가진 학생들이 팀으로 사건을 해결합니다. 교사가 분위기를 만들 필요가 없습니다.</p>
          </div>
          <div className="value-prop">
            <span className="value-prop-num">03</span>
            <strong>결과물이 남는 수업</strong>
            <p>영어 문장으로 쓴 사건 보고서와 개인 활동 기록이 학부모 전달용 자료가 됩니다.</p>
          </div>
        </div>
      </div>
    </section>

    {/* ── LESSON FLOW ──────────────────────────────── */}
    <section className="landing-flow shell" id="flow">
      <div className="landing-section-head">
        <Kicker>HOW THE CLASS WORKS</Kicker>
        <h2>학생들은 영어를<br /><em>사건 해결에 사용합니다.</em></h2>
        <p>각자 가진 단서를 설명하고 팀의 판단을 함께 만들어가는 4단계 수업 흐름입니다.</p>
        <p className="landing-flow-note">(예시 구성 · 변경될 수 있습니다)</p>
      </div>
      <div className="flow-list">
        {lessonFlow.map((item) => (
          <article className="flow-item" key={item.number}>
            <div className="flow-number">{item.number}</div>
            <div><Kicker>{item.label}</Kicker><h3>{item.title}</h3><p>{item.body}</p></div>
            <div className="flow-thumb"><img src={item.image} alt="" /></div>
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
          <h2>출력하면 바로 수업.<br /><em>6가지 자료가 모두 포함됩니다.</em></h2>
          <p>교사 준비시간 30분 이내를 목표로, 수업을 바로 운영할 수 있는 완성형 패키지를 구성합니다.</p>
        </div>
        <div className="materials-grid">
          {materials.map(([number, title, body, image]) => (
            <article className="material-item" key={number}>
              <div className="material-image"><img src={image} alt="" /></div>
              <div className="material-copy">
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="materials-more"><b>그 외 포함 자료</b> · 교사용 진행 대본 · 정답과 단계별 힌트 · 개인 영어 작성지 · 활동 결과 요약 템플릿</p>
      </div>
    </section>

    {/* ── PROCESS ──────────────────────────────────── */}
    <section className="landing-process shell" id="process">
      <div className="landing-section-head">
        <Kicker>HOW TO START</Kicker>
        <h2>파일럿 신청은<br /><em>세 단계로 진행됩니다.</em></h2>
      </div>
      <div className="process-steps">
        <div className="process-step">
          <span>01</span>
          <strong>자료 확인</strong>
          <p>샘플 자료를 받아보고 수업 구성과 자료를 직접 검토합니다.</p>
        </div>
        <div className="process-step">
          <span>02</span>
          <strong>일정 조율</strong>
          <p>학원 방학 일정과 학생 수에 맞는 운영 방식을 함께 조율합니다.</p>
        </div>
        <div className="process-step">
          <span>03</span>
          <strong>수업 진행</strong>
          <p>완성형 자료로 수업을 운영하고 학생 결과물을 함께 확인합니다.</p>
        </div>
      </div>
    </section>

    {/* ── RESULTS ──────────────────────────────────── */}
    <section className="landing-results shell" id="results">
      <div className="results-visual">
        <div className="result-sheet">
          <span>STUDENT ACTIVITY RECORD · EXAMPLE FORMAT</span>
          <h3>이번 판단을<br /><em>이렇게 설명했습니다.</em></h3>
          <div className="result-line"><b>핵심 단서 선택</b><i /><strong>03</strong></div>
          <div className="result-line"><b>가설 수정</b><i /><strong>YES</strong></div>
          <blockquote>"The key was in the office<br />because the note changed."</blockquote>
          <small>사건 결론과 관련된 근거를 선택하고, because와 however를 사용해 판단을 설명했습니다.</small>
        </div>
      </div>
      <div className="results-copy">
        <Kicker>WHAT REMAINS AFTER CLASS</Kicker>
        <h2>재미로 끝나지 않고,<br /><em>학생의 기록이 남습니다.</em></h2>
        <ul>
          <li>핵심 단서 선택</li>
          <li>처음의 가설과 수정된 가설</li>
          <li>주장과 근거를 연결한 영어 문장</li>
          <li>팀별 사건보고서와 개인 작성지</li>
        </ul>
        <small>활동 결과 요약은 수업 중 관찰된 수행을 정리하며, 학생의 지능·성격 또는 공인 문해력 수준을 진단하지 않습니다.</small>
      </div>
    </section>

    {/* ── FAQ ──────────────────────────────────────── */}
    <section className="landing-faq shell">
      <div className="landing-section-head">
        <Kicker>FAQ</Kicker>
        <h2>자주 묻는 질문</h2>
      </div>
      <div className="faq-list">
        <details className="faq-item">
          <summary>영어 수준이 낮은 학생도 참여할 수 있나요?</summary>
          <p>네. 단서 카드는 초등 6학년 수준 어휘로 구성됩니다. 정답보다 추론 과정이 중심이라, 영어 실력이 다양한 학생이 함께 참여할 수 있습니다.</p>
        </details>
        <details className="faq-item">
          <summary>교사가 영어 원어민이 아니어도 되나요?</summary>
          <p>네. 교사용 진행안에 전체 대본과 단계별 힌트가 포함되어 있어, 원어민이 아닌 교사도 무리 없이 운영할 수 있습니다.</p>
        </details>
        <details className="faq-item">
          <summary>수업 준비에 얼마나 걸리나요?</summary>
          <p>첫 수업 기준 30분 이내를 목표로 설계했습니다. 자료 출력 후 역할 카드를 분배하면 바로 시작할 수 있습니다.</p>
        </details>
        <details className="faq-item">
          <summary>한 반에 몇 명까지 가능한가요?</summary>
          <p>4~16명을 기준으로 설계되었습니다. 팀당 4명 구성이며, 팀 수를 늘려 더 많은 인원도 운영할 수 있습니다.</p>
        </details>
      </div>
    </section>

    {/* ── APPLY ────────────────────────────────────── */}
    <section className="landing-apply shell" id="apply">
      <div className="apply-intro">
        <Kicker>GET THE REVIEW PACK</Kicker>
        <h2>일단 자료를<br /><em>먼저 받아보세요.</em></h2>
        <p>샘플 자료를 확인하고, 맞으면 파일럿 일정을 함께 잡겠습니다. 부담 없이 요청해주세요.</p>
      </div>
      <form className="apply-form" action="mailto:hello@dullg.com" method="post" encType="text/plain">
        <h3>문의하기</h3>
        <label>기관명 <span>필수</span>
          <input name="academy" placeholder="학원 또는 공부방 이름" required />
        </label>
        <label>담당자 이름 <span>필수</span>
          <input name="name" placeholder="원장님 또는 선생님" required />
        </label>
        <label>연락처 또는 이메일 <span>필수</span>
          <input name="contact" placeholder="휴대전화 또는 이메일" required />
        </label>
        <label>관심 유형 <span>필수</span>
          <select name="interest" defaultValue="" required>
            <option value="" disabled>선택해주세요</option>
            <option value="material">샘플 자료 요청</option>
            <option value="demo">데모 신청</option>
            <option value="pilot">파일럿 수업 문의</option>
            <option value="purchase">구매 문의</option>
          </select>
        </label>
        <label className="consent">
          <input type="checkbox" name="consent" required /> 연락과 자료 발송을 위한 개인정보 수집에 동의합니다.
        </label>
        <button className="button button-dark" type="submit">자료 요청하기 <span>↗</span></button>
        <small>이메일로 바로 연결됩니다. 확인 후 1~2일 내 답변드립니다.</small>
      </form>
    </section>

    {/* ── FINAL CTA ────────────────────────────────── */}
    <section className="landing-final-cta">
      <div className="shell final-cta-inner">
        <div className="final-cta-copy">
          <Kicker>LIMITED PILOT</Kicker>
          <h2>파일럿 학원을<br /><em>지금 모집 중입니다.</em></h2>
          <p>파일럿 기간 자료 무료 제공 · 수업 후 피드백 공유 · 초기 2~3개 학원 한정</p>
        </div>
        <a className="button button-light" href="#apply">자료 먼저 받아보기 <span>↗</span></a>
      </div>
    </section>

    <Footer /></main>;
}
